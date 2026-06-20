import { ref, watch, nextTick, onUnmounted, type Ref, type ComputedRef } from 'vue';
import Sortable from 'sortablejs';

export function useReorderStructureSortables(options: {
  rootRef: Ref<HTMLElement | null>;
  enabled: ComputedRef<boolean> | Ref<boolean>;
  treeKey: ComputedRef<string> | Ref<string>;
  onReorder: (groupId: string, oldIndex: number, newIndex: number) => void;
  onDragEnd?: () => void;
}) {
  const isDragging = ref(false);
  const suppressLocateClick = ref(false);
  const sortables: Sortable[] = [];

  function destroySortables() {
    sortables.forEach((sortable) => sortable.destroy());
    sortables.length = 0;
  }

  function collectSortableContainers(root: HTMLElement): HTMLElement[] {
    const containers: HTMLElement[] = [];
    if (root.dataset.reorderGroup) {
      containers.push(root);
    }
    root.querySelectorAll<HTMLElement>('[data-reorder-group]').forEach((element) => {
      if (!containers.includes(element)) {
        containers.push(element);
      }
    });
    return containers;
  }

  function initSortables() {
    destroySortables();
    if (!options.enabled.value || !options.rootRef.value) {
      return;
    }

    const containers = collectSortableContainers(options.rootRef.value);
    containers.forEach((container) => {
      const groupId = container.dataset.reorderGroup;
      if (!groupId) {
        return;
      }

      const sortable = Sortable.create(container, {
        animation: 150,
        draggable: '.zcode-reorder-structure-block',
        ghostClass: 'zcode-reorder-structure-ghost',
        chosenClass: 'zcode-reorder-structure-chosen',
        dragClass: 'zcode-reorder-structure-drag',
        onStart: () => {
          isDragging.value = true;
          suppressLocateClick.value = false;
        },
        onEnd: (event) => {
          isDragging.value = false;
          options.onDragEnd?.();
          const { oldIndex, newIndex } = event;
          if (oldIndex == null || newIndex == null || oldIndex === newIndex) {
            return;
          }
          suppressLocateClick.value = true;
          options.onReorder(groupId, oldIndex, newIndex);
          queueMicrotask(() => {
            suppressLocateClick.value = false;
          });
        },
        filter: '.zcode-reorder-structure-slot-section',
        preventOnFilter: false
      });

      sortables.push(sortable);
    });
  }

  watch(
    [() => options.enabled.value, () => options.treeKey.value, options.rootRef],
    () => {
      nextTick(initSortables);
    },
    { flush: 'post' }
  );

  onUnmounted(() => {
    destroySortables();
  });

  return {
    isDragging,
    suppressLocateClick
  };
}

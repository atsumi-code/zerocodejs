import type { ComponentData, SlotConfig, ZeroCodeData } from '../../../types';
import {
  findPartById,
  getComponentByPath,
  getSlotChildren,
  traverseComponents
} from '../../../core/utils/path-utils';

export interface StructureListEntry {
  path: string;
  componentId: string;
  partId: string;
  label: string;
  depth: number;
  /** 1-based index within the current sortable group */
  positionIndex: number;
  positionTotal: number;
}

export function getStructureEntryPositionLabel(entry: StructureListEntry): string | null {
  if (entry.positionTotal <= 1) {
    return null;
  }
  return `${entry.positionIndex}/${entry.positionTotal}`;
}

export function getStructureEntryPreviewLabel(entry: StructureListEntry): string {
  const position = getStructureEntryPositionLabel(entry);
  if (!position) {
    return entry.label;
  }
  return `${entry.label} (${position})`;
}

export interface StructureSlotGroup {
  groupId: string;
  slotName: string;
  depth: number;
  nodes: StructureTreeNode[];
}

export interface StructureTreeNode {
  entry: StructureListEntry;
  slotGroups: StructureSlotGroup[];
}

export function getComponentDisplayLabel(
  component: ComponentData,
  parts: ZeroCodeData['parts']
): string {
  const part = findPartById(component.part_id, parts);
  if (part?.title) {
    return part.title;
  }
  if (part?.description) {
    return part.description;
  }
  return component.part_id || component.id;
}

function createStructureListEntry(
  component: ComponentData,
  path: string,
  parts: ZeroCodeData['parts'],
  index: number,
  total: number,
  depth = 0
): StructureListEntry {
  return {
    path,
    componentId: component.id,
    partId: component.part_id,
    label: getComponentDisplayLabel(component, parts),
    depth,
    positionIndex: index + 1,
    positionTotal: total
  };
}

function buildStructureTreeNode(
  component: ComponentData,
  path: string,
  depth: number,
  parts: ZeroCodeData['parts'],
  index: number,
  total: number
): StructureTreeNode {
  const entry = createStructureListEntry(component, path, parts, index, total, depth);

  const slotGroups: StructureSlotGroup[] = [];

  if (component.slots) {
    for (const [slotName, slotData] of Object.entries(component.slots)) {
      const children = getSlotChildren(slotData as ComponentData[] | SlotConfig);
      if (children.length === 0) {
        continue;
      }

      const groupId = `${path}.slots.${slotName}`;
      slotGroups.push({
        groupId,
        slotName,
        depth: depth + 1,
        nodes: children.map((child, childIndex) =>
          buildStructureTreeNode(
            child,
            `${groupId}.${childIndex}`,
            depth + 1,
            parts,
            childIndex,
            children.length
          )
        )
      });
    }
  }

  return { entry, slotGroups };
}

export function buildStructureTree(cmsData: ZeroCodeData): StructureTreeNode[] {
  const total = cmsData.page.length;
  return cmsData.page.map((component, index) =>
    buildStructureTreeNode(component, `page.${index}`, 0, cmsData.parts, index, total)
  );
}

export interface StructureGroupView {
  groupId: string;
  slotName: string | null;
  nodes: StructureTreeNode[];
}

export function resolveStructureSortableGroupFromPath(path: string): {
  groupId: string;
  slotName: string | null;
} | null {
  if (!path) {
    return null;
  }

  const parts = path.split('.');
  if (parts[0] !== 'page') {
    return null;
  }

  if (parts.length === 2) {
    return { groupId: 'page', slotName: null };
  }

  if (!parts.includes('slots')) {
    return null;
  }

  let lastSlotIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] === 'slots') {
      lastSlotIndex = i;
      break;
    }
  }

  if (lastSlotIndex === -1) {
    return null;
  }

  const childIndexSegment = lastSlotIndex + 2;
  if (parts.length !== childIndexSegment + 1) {
    return null;
  }

  return {
    groupId: parts.slice(0, childIndexSegment).join('.'),
    slotName: parts[lastSlotIndex + 1]
  };
}

export function parseSiblingIndexInGroup(path: string, groupId: string): number | null {
  if (groupId === 'page') {
    const match = path.match(/^page\.(\d+)$/);
    if (!match) {
      return null;
    }
    const index = parseInt(match[1], 10);
    return Number.isNaN(index) ? null : index;
  }

  const prefix = `${groupId}.`;
  if (!path.startsWith(prefix)) {
    return null;
  }

  const tail = path.slice(prefix.length);
  if (!/^\d+$/.test(tail)) {
    return null;
  }

  const index = parseInt(tail, 10);
  return Number.isNaN(index) ? null : index;
}

export function canReorderSiblingPaths(sourcePath: string, targetPath: string): boolean {
  if (!sourcePath || !targetPath || sourcePath === targetPath) {
    return false;
  }

  const sourceGroup = resolveStructureSortableGroupFromPath(sourcePath);
  const targetGroup = resolveStructureSortableGroupFromPath(targetPath);
  if (!sourceGroup || !targetGroup || sourceGroup.groupId !== targetGroup.groupId) {
    return false;
  }

  return (
    parseSiblingIndexInGroup(sourcePath, sourceGroup.groupId) !== null &&
    parseSiblingIndexInGroup(targetPath, targetGroup.groupId) !== null
  );
}

function buildStructureListNode(
  component: ComponentData,
  path: string,
  parts: ZeroCodeData['parts'],
  index: number,
  total: number
): StructureTreeNode {
  return {
    entry: createStructureListEntry(component, path, parts, index, total),
    slotGroups: []
  };
}

export function buildStructureGroupViewByGroupId(
  cmsData: ZeroCodeData,
  groupId: string
): StructureGroupView | null {
  if (groupId === 'page') {
    if (cmsData.page.length === 0) {
      return null;
    }
    const total = cmsData.page.length;
    return {
      groupId: 'page',
      slotName: null,
      nodes: cmsData.page.map((component, index) =>
        buildStructureListNode(component, `page.${index}`, cmsData.parts, index, total)
      )
    };
  }

  const slotMatch = groupId.match(/^(.+)\.slots\.([^.]+)$/);
  if (!slotMatch) {
    return null;
  }

  const [, parentPath, slotName] = slotMatch;
  const parent = getComponentByPath(parentPath, cmsData);
  if (!parent?.slots?.[slotName]) {
    return null;
  }

  const children = getSlotChildren(parent.slots[slotName] as ComponentData[] | SlotConfig);
  if (children.length === 0) {
    return {
      groupId,
      slotName,
      nodes: []
    };
  }

  return {
    groupId,
    slotName,
    nodes: children.map((component, index) =>
      buildStructureListNode(
        component,
        `${groupId}.${index}`,
        cmsData.parts,
        index,
        children.length
      )
    )
  };
}

export function buildStructureGroupView(
  cmsData: ZeroCodeData,
  sourcePath: string
): StructureGroupView | null {
  const group = resolveStructureSortableGroupFromPath(sourcePath);
  if (!group) {
    return null;
  }

  return buildStructureGroupViewByGroupId(cmsData, group.groupId);
}

export function getStructureGroupLabelEntries(
  cmsData: ZeroCodeData,
  groupId: string | null
): StructureListEntry[] {
  if (!groupId) {
    return [];
  }
  const view = buildStructureGroupViewByGroupId(cmsData, groupId);
  if (!view) {
    return [];
  }
  return view.nodes.map((node) => node.entry);
}

export function buildStructureTreeKey(nodes: StructureTreeNode[]): string {
  const parts: string[] = [];

  function walk(node: StructureTreeNode) {
    parts.push(`${node.entry.componentId}:${node.entry.path}`);
    for (const slotGroup of node.slotGroups) {
      for (const child of slotGroup.nodes) {
        walk(child);
      }
    }
  }

  nodes.forEach(walk);
  return parts.join('|');
}

export function movePageComponentByIndex(
  page: ComponentData[],
  fromIndex: number,
  toIndex: number
): ComponentData[] | null {
  if (fromIndex === toIndex) {
    return null;
  }
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= page.length || toIndex >= page.length) {
    return null;
  }

  const items = [...page];
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  return items;
}

export function findComponentPathById(cmsData: ZeroCodeData, componentId: string): string | null {
  const found = traverseComponents<string | undefined>(cmsData.page, 'page', (component, path) => {
    if (component.id === componentId) {
      return path;
    }
    return undefined;
  });
  return typeof found === 'string' ? found : null;
}

export function reorderSiblingsByPath(
  cmsData: ZeroCodeData,
  fromPath: string,
  toPath: string
): { movedComponentId: string } | null {
  const sourceGroup = resolveStructureSortableGroupFromPath(fromPath);
  const targetGroup = resolveStructureSortableGroupFromPath(toPath);
  if (!sourceGroup || !targetGroup || sourceGroup.groupId !== targetGroup.groupId) {
    return null;
  }

  const fromIndex = parseSiblingIndexInGroup(fromPath, sourceGroup.groupId);
  const toIndex = parseSiblingIndexInGroup(toPath, targetGroup.groupId);
  if (fromIndex === null || toIndex === null) {
    return null;
  }

  return moveStructureGroupByIndex(cmsData, sourceGroup.groupId, fromIndex, toIndex);
}

export function moveStructureGroupByIndex(
  cmsData: ZeroCodeData,
  groupId: string,
  fromIndex: number,
  toIndex: number
): { movedComponentId: string } | null {
  if (groupId === 'page') {
    const moved = cmsData.page[fromIndex];
    if (!moved) {
      return null;
    }
    const nextPage = movePageComponentByIndex(cmsData.page, fromIndex, toIndex);
    if (!nextPage) {
      return null;
    }
    cmsData.page = nextPage;
    return { movedComponentId: moved.id };
  }

  const slotMatch = groupId.match(/^(.+)\.slots\.([^.]+)$/);
  if (!slotMatch) {
    return null;
  }

  const [, parentPath, slotName] = slotMatch;
  const parent = getComponentByPath(parentPath, cmsData);
  if (!parent?.slots?.[slotName]) {
    return null;
  }

  const slotData = parent.slots[slotName];
  const children = getSlotChildren(slotData as ComponentData[] | SlotConfig);
  const moved = children[fromIndex];
  if (!moved) {
    return null;
  }

  const nextChildren = movePageComponentByIndex(children, fromIndex, toIndex);
  if (!nextChildren) {
    return null;
  }

  if (Array.isArray(slotData)) {
    parent.slots[slotName] = nextChildren;
  } else {
    (slotData as SlotConfig).children = nextChildren;
  }

  return { movedComponentId: moved.id };
}

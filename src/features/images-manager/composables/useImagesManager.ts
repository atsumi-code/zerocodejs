import { ref, computed } from 'vue';
import type { ZeroCodeData, ImageData } from '../../../types';
import { findImageReferences } from '../../../core/utils/image-utils';

export function useImagesManager(cmsData: ZeroCodeData) {
  // 状態管理
  const activeCategory = ref<'common' | 'individual' | 'special'>('common');
  const selectedImage = ref<ImageData | null>(null);
  const editingImage = ref<ImageData | null>(null);
  const isCreatingNew = ref(false);

  // 並べ替え用の状態
  const reorderSourceImage = ref<string | null>(null); // 画像ID

  // 現在のカテゴリの画像一覧
  const currentImages = computed(() => {
    if (activeCategory.value === 'common') {
      return cmsData.images.common;
    } else if (activeCategory.value === 'individual') {
      return cmsData.images.individual;
    } else {
      return cmsData.images.special;
    }
  });

  // 画像を選択
  function selectImage(image: ImageData) {
    selectedImage.value = image;
    editingImage.value = null;
    isCreatingNew.value = false;
  }

  // 画像追加（base64形式）
  function addImage(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const newImage: ImageData = {
          id: `img-${Date.now()}`,
          name: file.name,
          url: base64,
          mimeType: file.type,
          needsUpload: true
        };

        if (activeCategory.value === 'common') {
          cmsData.images.common.push(newImage);
        } else if (activeCategory.value === 'individual') {
          cmsData.images.individual.push(newImage);
        } else {
          cmsData.images.special.push(newImage);
        }

        resolve(newImage);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 画像削除
  function deleteImage(imageId: string) {
    const references = findImageReferences(imageId, cmsData.page);

    // 参照をクリア
    references.forEach((ref) => {
      Object.keys(ref.component).forEach((key) => {
        if (key.includes('image') && ref.component[key] === imageId) {
          ref.component[key] = '';
        }
      });
    });

    // 画像データを削除
    const commonIndex = cmsData.images.common.findIndex((img) => img.id === imageId);
    if (commonIndex !== -1) {
      cmsData.images.common.splice(commonIndex, 1);
    }

    const individualIndex = cmsData.images.individual.findIndex((img) => img.id === imageId);
    if (individualIndex !== -1) {
      cmsData.images.individual.splice(individualIndex, 1);
    }

    const specialIndex = cmsData.images.special.findIndex((img) => img.id === imageId);
    if (specialIndex !== -1) {
      cmsData.images.special.splice(specialIndex, 1);
    }

    if (selectedImage.value?.id === imageId) {
      selectedImage.value = null;
    }
  }

  // 画像編集開始
  function startEditing(image: ImageData) {
    editingImage.value = { ...image };
    isCreatingNew.value = false;
    selectedImage.value = image;
  }

  // 画像保存
  function saveImage() {
    if (!editingImage.value) return;

    let targetArray: ImageData[];
    if (activeCategory.value === 'common') {
      targetArray = cmsData.images.common;
    } else if (activeCategory.value === 'individual') {
      targetArray = cmsData.images.individual;
    } else {
      targetArray = cmsData.images.special;
    }

    const index = targetArray.findIndex((img) => img.id === editingImage.value!.id);
    if (index !== -1) {
      targetArray[index] = editingImage.value;
    }

    editingImage.value = null;
    isCreatingNew.value = false;
  }

  // 編集キャンセル
  function cancelEditing() {
    editingImage.value = null;
    isCreatingNew.value = false;
  }

  // 画像の使用状況をチェック
  function checkImageUsage(
    imageId: string
  ): Array<{ path: string; component: any; fieldName: string }> {
    return findImageReferences(imageId, cmsData.page);
  }

  // 並べ替え関数
  function handleReorderClick(imageId: string) {
    // 1回目のクリック: 移動元を選択
    if (!reorderSourceImage.value) {
      reorderSourceImage.value = imageId;
      return;
    }

    // 同じ画像をクリック: キャンセル
    if (reorderSourceImage.value === imageId) {
      cancelReorder();
      return;
    }

    // 2回目のクリック: 並べ替え実行
    reorderImages(reorderSourceImage.value, imageId);
    cancelReorder();
  }

  function reorderImages(sourceId: string, targetId: string) {
    let targetArray: ImageData[];
    if (activeCategory.value === 'common') {
      targetArray = cmsData.images.common;
    } else if (activeCategory.value === 'individual') {
      targetArray = cmsData.images.individual;
    } else {
      targetArray = cmsData.images.special;
    }

    const sourceIndex = targetArray.findIndex((img) => img.id === sourceId);
    const targetIndex = targetArray.findIndex((img) => img.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // 配列の順序を入れ替え
    const [removed] = targetArray.splice(sourceIndex, 1);
    targetArray.splice(targetIndex, 0, removed);
  }

  function cancelReorder() {
    reorderSourceImage.value = null;
  }

  return {
    // 並べ替え
    reorderSourceImage,
    handleReorderClick,
    cancelReorder,

    // 既存のexport
    activeCategory,
    selectedImage,
    editingImage,
    isCreatingNew,
    currentImages,
    selectImage,
    addImage,
    deleteImage,
    startEditing,
    saveImage,
    cancelEditing,
    checkImageUsage
  };
}

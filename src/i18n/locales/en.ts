export default {
  common: {
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    reorder: 'Reorder',
    preview: 'Preview',
    settings: 'Settings',
    manage: 'Manage',
    view: 'View',
    confirm: 'Confirm',
    clear: 'Clear',
    select: 'Select',
    replace: 'Replace',
    copy: 'Copy',
    copied: 'Copied'
  },
  toolbar: {
    editMode: 'Edit',
    addMode: 'Add',
    reorderMode: 'Reorder',
    deleteMode: 'Delete',
    viewMode: 'View',
    settings: 'Settings'
  },
  settings: {
    title: 'Settings',
    language: {
      label: 'Language',
      ja: 'Japanese',
      en: 'English'
    },
    enableDynamicContent: 'Enable page interactions',
    enableDynamicContentDescription:
      'Enables interactions for dynamic content such as accordions, tabs, modals, and links.',
    devRightPadding: 'Add padding for edit panel',
    devRightPaddingDescription: 'Adds right padding to content when the edit panel is displayed.',
    enableContextMenu: 'Enable right-click menu',
    enableContextMenuDescription:
      'Right-clicking on content displays a menu to switch between edit, add, reorder, and delete modes.',
    showSaveConfirm: 'Show save confirmation dialog',
    showSaveConfirmDescription:
      'Displays a dialog to confirm save targets when clicking the save button.',
    previewModeInfo:
      'Dynamic content (accordions, tabs, modals, links, etc.) is always enabled in preview mode.',
    noSettings: 'No settings available.'
  },
  emptyState: {
    message: 'Please add a part',
    addPart: '+ Add Part'
  },
  addPanel: {
    title: 'Add',
    selectParent: 'Select parent element',
    category: {
      common: 'Common',
      individual: 'Individual',
      selected: 'Selected part'
    },
    typeAll: 'all',
    activeParts: 'active parts',
    activePartsDescription:
      'You can add the part clicked in the preview area with its current data included.',
    clickPartInPreview: 'Please click a part in the preview area',
    noPartsAvailable: 'No parts available',
    addBefore: 'Add before',
    addAfter: 'Add after',
    continueAdding: 'Continue adding parts'
  },
  editPanel: {
    title: 'Editing',
    editing: 'Editing: {type}',
    id: 'ID: {id}',
    selectImage: 'Select image',
    replaceImage: 'Replace',
    clearImage: 'Clear',
    clearImageTitle: 'Clear image',
    noFields: 'No editable fields available'
  },
  deletePanel: {
    title: 'Delete confirmation',
    confirmMessage: 'Do you want to delete this part?',
    selectParent: 'Select parent element'
  },
  reorderPanel: {
    title: 'Reorder: Source selected',
    instruction: 'Click the destination element',
    source: 'Source: {path}',
    selectParent: 'Select parent element'
  },
  saveConfirm: {
    title: 'Save confirmation',
    message: 'Do you want to save the following data?',
    simpleMessage: 'Do you want to save?',
    targets: {
      page: 'Page data',
      'parts-common': 'Parts (Common)',
      'parts-individual': 'Parts (Individual)',
      'parts-special': 'Parts (Special)',
      'images-common': 'Images (Common)',
      'images-individual': 'Images (Individual)',
      'images-special': 'Images (Special)',
      'parts-common-css': 'CSS (Common)',
      'parts-individual-css': 'CSS (Individual)',
      'parts-special-css': 'CSS (Special)'
    },
    saveButton: 'Save'
  },
  partsManager: {
    createType: 'Create new type',
    editType: 'Edit type',
    typeName: 'Type name',
    typeDescription: 'Description',
    typeNamePlaceholder: 'Example: hero, features',
    typeDescriptionPlaceholder: 'Type description',
    editPart: 'Edit part: {title}',
    partTitle: 'Title',
    partDescription: 'Description',
    partDescriptionPlaceholder: 'Part description',
    deletePartConfirm:
      'Do you want to delete part {number}?\n(Other parts in the type will remain)',
    deleteTypeConfirm: 'Do you want to delete this type?',
    deleteTypeWithUsagesConfirm:
      'Type "{type}" is used in {count} places. Do you want to delete it?',
    deleteSlotConfirm: 'Do you want to delete slot "{slotName}"?',
    selectImage: 'Select image',
    addPart: 'Add part',
    editTypeButton: 'Edit type',
    reorderType: 'Reorder type',
    deleteTypeButton: 'Delete this type (all parts included)',
    editPartButton: 'Edit part',
    reorderPart: 'Reorder',
    deletePartButton: 'Delete',
    source: 'Source',
    noDescription: 'No description',
    partNumber: 'Part {current} / {total}',
    allowedParts: 'Allowed parts',
    searchParts: 'Search parts...',
    addSlot: 'Add slot',
    selectSlot: 'Select slot...',
    defaultSlot: 'Default slot',
    codeEdit: 'Code editor',
    cssEditInfo: 'About CSS editing',
    templateSuggestions: 'Template suggestions',
    preview: 'Preview:',
    cssEditWarning: 'About CSS editing',
    cssEditWarningMessageCommon:
      'CSS edited here is intended to apply to all pages. If existing CSS files (e.g., common.css) exist, they may be overwritten.',
    cssEditWarningMessageIndividual:
      'CSS edited here is intended to apply per page type. If existing CSS files (e.g., page.css) exist, they may be overwritten.',
    cssEditWarningMessageSpecial:
      'CSS edited here is intended to apply per dynamic page. If existing CSS files (e.g., shop111.css) exist, they may be overwritten.',
    dontShowAgain: "Don't show again",
    templateHelp: {
      textField: 'Text field',
      richText: 'Rich text',
      textarea: 'Multi-line text',
      image: 'Image selection',
      radio: 'Radio button',
      checkbox: 'Checkbox',
      selectSingle: 'Select box (single)',
      selectMultiple: 'Select box (multiple)',
      conditional: 'Conditional (show/hide)',
      tag: 'Tag selection',
      slot: 'Slot (child insertion)',
      note: 'Note',
      suggestionNote:
        'When template suggestions are enabled, autocomplete will appear when typing <code>$</code>, <code>(</code>, or <code>z</code>',
      fieldNameNote: 'Field names can use alphanumeric characters and underscores',
      defaultValueNote: 'Default values are optional (will be empty string if omitted)'
    },
    validationError: 'Error:',
    dangerousTagWarning: '<{tag}> tag is included.',
    dangerousAttrWarning: '{attr} attribute is included.',
    slotSettings: 'Slot settings',
    slot: 'Slot',
    templateHelpTitle: 'Template Syntax Help',
    clickToEnlarge: 'Click to enlarge',
    displayPreview: 'Display preview',
    editPanelPreview: 'Edit panel preview',
    editPanelPreviewNoFields: 'No editable fields',
    editPanelPreviewDesc: 'List of fields shown in the edit panel when editing a page.',
    understood: 'Understood',
    syntax: 'Syntax',
    description: 'Description',
    example: 'Example',
    templateHelpButton: 'Template syntax help'
  },
  imagesManager: {
    addImage: 'Add image',
    editImage: 'Edit image',
    imageId: 'Image ID',
    imageName: 'Image name',
    altText: 'Alt attribute',
    deleteImageConfirm: 'Do you want to delete this image?',
    deleteImageWithUsagesConfirm: 'This image is used in {count} places. Do you want to delete it?',
    deleteImageFromModalConfirm: 'Do you want to delete this image?',
    addImageFailed: 'Failed to add image',
    selectImage: 'Select image',
    currentlySelected: 'Currently selected',
    select: 'Select'
  },
  dataViewer: {
    page: 'Page',
    parts: 'Parts',
    images: 'Images',
    common: 'Common',
    individual: 'Individual',
    special: 'Special',
    json: 'JSON',
    html: 'HTML',
    categoryInfo: {
      title: 'About Category Roles',
      common: {
        title: 'Common',
        description:
          'Intended for parts and images shared across the entire site. Assumed to be usable on all pages.'
      },
      individual: {
        title: 'Individual',
        description:
          'Intended for parts and images shared per page type. Assumed to be usable on all pages of the same page type.'
      },
      special: {
        title: 'Special',
        description:
          'Intended for parts and images used for dynamic pages (e.g., per store, per product) or under specific conditions. Assumed to be usable on pages dynamically generated with route model binding, etc.'
      }
    }
  },
  contextMenu: {
    edit: 'Edit',
    add: 'Add',
    reorder: 'Reorder',
    delete: 'Delete',
    close: 'Close'
  },
  editor: {
    pageManagement: 'Page Management',
    partsManagement: 'Parts Management',
    imagesManagement: 'Images Management',
    dataViewer: 'Data Viewer',
    loading: 'Loading data...',
    saveFailed: 'Save failed',
    saveFailedWithCount: 'Save failed ({count} items)',
    saveFailedWithMessage: 'Save failed ({count} items): {message}',
    noSaveTargets: 'No save targets'
  }
};

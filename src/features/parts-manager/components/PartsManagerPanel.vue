<template>
  <div class="zcode-parts-manager">
    <!-- 共通/個別タブ ＋ 新規作成ボタン（右上にコンパクト配置） -->
    <div class="zcode-parts-category-tabs">
      <div class="zcode-parts-category-tab-group">
        <button
          v-for="category in categoryTabs"
          :key="category"
          :class="{ active: activeCategory === category }"
          class="zcode-category-tab"
          @click="activeCategory = category as 'common' | 'individual' | 'special'"
        >
          {{
            category === 'common'
              ? $t('dataViewer.common')
              : category === 'individual'
                ? $t('dataViewer.individual')
                : $t('dataViewer.special')
          }}
        </button>
        <button
          class="zcode-help-btn"
          :title="$t('dataViewer.categoryInfo.title')"
          @click="showCategoryInfoModal = true"
        >
          <HelpCircle :size="14" />
        </button>
      </div>
      <div class="zcode-parts-add-wrapper">
        <button
          class="zcode-btn-primary zcode-parts-new-btn"
          @click="startCreating"
        >
          <Plus :size="14" />
          <span>{{ $t('partsManager.createType') }}</span>
        </button>
      </div>
    </div>

    <div class="zcode-parts-manager-content">
      <!-- パーツ一覧（全体表示） -->
      <div class="zcode-parts-items">
        <!-- タイプ別にグループ化 -->
        <div
          v-for="typeGroup in groupedPartsByType"
          :key="typeGroup.type"
          class="zcode-part-type-group"
        >
          <div
            class="zcode-part-type-title"
            role="heading"
            aria-level="5"
          >
            {{ typeGroup.type }}
            <div class="zcode-part-type-actions">
              <button
                v-if="typeGroup.parts.length > 0"
                class="zcode-part-type-edit-btn"
                :title="$t('partsManager.editTypeButton')"
                @click.stop="startEditingType(typeGroup.parts[0] as TypeData)"
              >
                <Edit :size="14" />
              </button>
              <button
                class="zcode-action-btn"
                :class="{ active: reorderSourceType === typeGroup.type }"
                :title="$t('partsManager.reorderType')"
                @click.stop="startReorderType(typeGroup.type)"
              >
                <ArrowUpDown :size="14" />
              </button>
              <button
                class="zcode-action-btn zcode-delete-btn"
                :title="$t('partsManager.deleteTypeButton')"
                @click.stop="deletePartType(typeGroup.type)"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          <div class="zcode-part-type-items">
            <div
              v-for="(type, typeIndex) in typeGroup.parts"
              :key="`${typeGroup.type}-${typeIndex}`"
              :class="getPartItemClass(type, type._partIndex ?? 0)"
              @click="startEditingPart(type, type._partIndex ?? 0)"
            >
              <!-- 並べ替え中の移動元インジケーター -->
              <div
                v-if="
                  reorderSourcePart &&
                    reorderSourcePart.type === type.type &&
                    reorderSourcePart.partIndex === (type._partIndex ?? 0)
                "
                class="zcode-reorder-source-indicator"
              >
                {{ $t('partsManager.source') }}
              </div>
              <div class="zcode-part-item-header">
                <span class="zcode-part-type">{{ type._displayPart?.title || type.type }}</span>
                <!-- アクションボタン -->
                <div class="zcode-part-item-actions">
                  <button
                    class="zcode-action-btn"
                    :title="$t('partsManager.editPartButton')"
                    @click.stop="startEditingPart(type, type._partIndex ?? 0)"
                  >
                    <Edit :size="14" />
                  </button>
                  <button
                    class="zcode-action-btn"
                    :class="{
                      active:
                        reorderSourcePart?.type === type.type &&
                        reorderSourcePart?.partIndex === (type._partIndex ?? 0)
                    }"
                    :title="$t('partsManager.reorderPart')"
                    @click.stop="handleReorderClick(type, type._partIndex ?? 0)"
                  >
                    <ArrowUpDown :size="14" />
                  </button>
                  <button
                    class="zcode-action-btn zcode-delete-btn"
                    :title="$t('partsManager.deletePartButton')"
                    @click.stop="handleDelete({ ...type, _partIndex: type._partIndex ?? 0 })"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
              <!-- 本文エリア -->
              <div class="zcode-part-item-content">
                <div
                  class="zcode-part-description"
                  :class="{
                    'zcode-description-empty': !type._displayPart?.description && !type.description
                  }"
                >
                  {{
                    type._displayPart?.description ||
                      type.description ||
                      $t('partsManager.noDescription')
                  }}
                </div>
                <div class="zcode-part-modules">
                  {{
                    $t('partsManager.partNumber', {
                      current: (type._partIndex ?? 0) + 1,
                      total: type.parts.length
                    })
                  }}
                </div>
                <!-- プレビュー表示 -->
                <div
                  v-if="type._displayPart"
                  class="zcode-part-preview"
                >
                  <div
                    class="zcode-part-preview-content"
                    v-html="getPartPreviewHtml(type, type._displayPart)"
                  />
                </div>
              </div>
            </div>
            <!-- パーツ追加ボタン -->
            <div
              v-if="typeGroup.parts.length > 0"
              class="zcode-part-item zcode-part-item-add"
              @click.stop="addPartToType(typeGroup.parts[0] as TypeData)"
            >
              <div class="zcode-part-item-add-content">
                <Plus :size="20" />
                <span>{{ $t('partsManager.addPart') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- タイプ全体編集モーダル（新規作成・編集共通） -->
      <Teleport to="body">
        <div
          v-if="editingType && (editingLevel === 'type' || isCreatingNew)"
          class="zcode-part-modal"
          @click.self="cancelEditingType"
        >
          <div
            class="zcode-part-modal-content"
            @click.stop
          >
            <div class="zcode-part-editor-header">
              <div
                class="zcode-part-editor-header-title"
                role="heading"
                aria-level="4"
              >
                {{ isCreatingNew ? $t('partsManager.createType') : $t('partsManager.editType') }}
              </div>
              <button
                class="zcode-close-btn"
                :aria-label="$t('common.close')"
                @click="cancelEditingType"
              >
                <X :size="18" />
              </button>
            </div>

            <div class="zcode-part-editor-form">
              <div class="zcode-form-field">
                <label>{{ $t('partsManager.typeName') }} <span class="zcode-required">*</span></label>
                <input
                  v-model="editingType.type"
                  type="text"
                  :placeholder="$t('partsManager.typeNamePlaceholder')"
                  class="zcode-text-input"
                  required
                >
              </div>

              <div class="zcode-form-field">
                <label>{{ $t('partsManager.typeDescription') }}</label>
                <input
                  v-model="editingType.description"
                  type="text"
                  :placeholder="$t('partsManager.typeDescriptionPlaceholder')"
                  class="zcode-text-input"
                >
              </div>
            </div>

            <div class="zcode-part-editor-actions">
              <button
                class="zcode-btn-primary zcode-part-editor-actions-btn zcode-part-editor-actions-btn-primary"
                @click="saveType"
              >
                <Check :size="16" />
                <span>{{ $t('common.confirm') }}</span>
              </button>
              <button
                class="zcode-btn-cancel zcode-part-editor-actions-btn"
                @click="cancelEditingType"
              >
                <X :size="16" />
                <span>{{ $t('common.cancel') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- パーツ編集モーダル -->
      <Teleport to="body">
        <div
          v-if="editingPart && editingLevel === 'part'"
          class="zcode-part-modal"
          @click.self="handleCancelPart"
        >
          <div
            class="zcode-part-modal-content"
            @click.stop
          >
            <div class="zcode-part-editor-header">
              <div
                class="zcode-part-editor-header-title"
                role="heading"
                aria-level="4"
              >
                {{ $t('partsManager.editPart', { title: editingPart.part.title }) }}
              </div>
              <button
                class="zcode-close-btn"
                :aria-label="$t('common.close')"
                @click="handleCancelPart"
              >
                <X :size="18" />
              </button>
            </div>

            <div class="zcode-part-editor-form">
              <div class="zcode-part-editor-topbar">
                <div class="zcode-part-editor-topfields">
                  <div class="zcode-form-field">
                    <label>{{ $t('partsManager.partTitle') }}
                      <span class="zcode-required">*</span></label>
                    <input
                      v-model="editingPart.part.title"
                      type="text"
                      class="zcode-text-input"
                      required
                    >
                  </div>
                  <div class="zcode-form-field">
                    <label>{{ $t('partsManager.partDescription') }}</label>
                    <input
                      v-model="editingPart.part.description"
                      type="text"
                      class="zcode-text-input"
                      :placeholder="$t('partsManager.partDescriptionPlaceholder')"
                    >
                  </div>
                </div>
              </div>

              <div class="zcode-part-editor-main">
                <div class="zcode-part-editor-pane zcode-part-editor-pane--code">
                  <div class="zcode-part-editor-pane-header">
                    <div
                      class="zcode-template-tabs"
                      role="tablist"
                      :aria-label="$t('partsManager.codeEdit')"
                    >
                      <button
                        type="button"
                        class="zcode-template-tab"
                        :class="{ active: codeTab === 'html' }"
                        role="tab"
                        :aria-selected="codeTab === 'html'"
                        @click="codeTab = 'html'"
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        class="zcode-template-tab"
                        :class="{ active: codeTab === 'css' }"
                        role="tab"
                        :aria-selected="codeTab === 'css'"
                        @click="codeTab = 'css'"
                      >
                        CSS
                      </button>
                      <button
                        v-if="hasSlotsInTemplate"
                        type="button"
                        class="zcode-template-tab"
                        :class="{ active: codeTab === 'slots' }"
                        role="tab"
                        :aria-selected="codeTab === 'slots'"
                        @click="codeTab = 'slots'"
                      >
                        {{ $t('partsManager.slotSettings') }}
                      </button>
                    </div>

                    <div class="zcode-part-editor-pane-header-actions">
                      <div
                        v-if="codeTab === 'css'"
                        class="zcode-css-warning-compact"
                      >
                        <Info
                          :size="14"
                          class="zcode-css-warning-compact-icon"
                        />
                        <span class="zcode-css-warning-compact-text">{{
                          $t('partsManager.cssEditInfo')
                        }}</span>
                        <button
                          class="zcode-help-btn"
                          type="button"
                          :title="$t('partsManager.cssEditWarning')"
                          @click="openCssWarningModal"
                        >
                          <HelpCircle :size="14" />
                        </button>
                      </div>
                      <label
                        v-if="codeTab === 'html'"
                        class="zcode-checkbox-label zcode-checkbox-label-inline"
                      >
                        <input
                          v-model="enableTemplateSuggestions"
                          type="checkbox"
                          class="zcode-checkbox-input"
                        >
                        <span>{{ $t('partsManager.templateSuggestions') }}</span>
                      </label>
                      <button
                        v-if="codeTab === 'html'"
                        class="zcode-help-btn"
                        type="button"
                        :title="$t('partsManager.templateHelpButton')"
                        @click="openTemplateHelp"
                      >
                        <HelpCircle :size="16" />
                      </button>
                    </div>
                  </div>

                  <div class="zcode-part-editor-pane-body">
                    <template v-if="codeTab === 'slots'">
                      <div class="zcode-slots-config zcode-slots-config-in-pane">
                        <div
                          v-for="(_slotConfig, slotName) in editingPart.part.slots || {}"
                          :key="`part-${editingPart.partIndex}-${slotName}`"
                          class="zcode-slot-config-item"
                        >
                          <div class="zcode-slot-config-header">
                            <div class="zcode-slot-config-title">
                              {{ $t('partsManager.slot') }}: {{ slotName }}
                            </div>
                            <button
                              class="zcode-btn-small"
                              @click="removePartSlot(editingPart.partIndex, slotName)"
                            >
                              <Trash2 :size="12" />
                            </button>
                          </div>
                          <div class="zcode-slot-config-body">
                            <label>{{ $t('partsManager.allowedParts') }}</label>
                            <div class="zcode-checkbox-group">
                              <input
                                v-model="slotPartFilters[slotName]"
                                type="text"
                                :placeholder="$t('partsManager.searchParts')"
                                class="zcode-text-input"
                                style="margin-bottom: 8px"
                              >
                              <label
                                v-for="part in getFilteredParts(slotName)"
                                :key="`allowed-${slotName}-${part.typeName}-${part.id}`"
                                class="zcode-checkbox-item"
                              >
                                <input
                                  type="checkbox"
                                  :checked="getAllowedPartsForSlot(slotName).includes(part.id)"
                                  class="zcode-checkbox"
                                  @change="handleAllowedPartChange(slotName, part.id, $event)"
                                >
                                <span>{{ part.title }} ({{ part.typeName }})</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div
                          v-if="availableSlotsForPart.length > 0"
                          class="zcode-slot-add-section"
                        >
                          <label>{{ $t('partsManager.addSlot') }}</label>
                          <div class="zcode-slot-add-controls">
                            <select
                              v-model="selectedSlotToAdd"
                              class="zcode-select-input"
                            >
                              <option value="">
                                {{ $t('partsManager.selectSlot') }}
                              </option>
                              <option
                                v-for="slot in availableSlotsForPart"
                                :key="slot"
                                :value="slot"
                              >
                                {{ slot === 'default' ? $t('partsManager.defaultSlot') : slot }}
                              </option>
                            </select>
                            <button
                              :disabled="!selectedSlotToAdd"
                              class="zcode-btn-secondary"
                              @click="handleAddSelectedSlot"
                            >
                              <Plus :size="16" />
                              <span>{{ $t('common.add') }}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </template>
                    <MonacoEditor
                      v-else-if="codeTab === 'html'"
                      v-model="editingPart.part.body"
                      language="html"
                      theme="vs-dark"
                      :minimap="false"
                      :auto-height="false"
                      :enable-suggestions="enableTemplateSuggestions"
                      class="zcode-monaco-editor"
                    />
                    <MonacoEditor
                      v-else
                      v-model="cssDraft"
                      language="css"
                      theme="vs-dark"
                      :minimap="false"
                      :auto-height="false"
                      :enable-suggestions="true"
                      class="zcode-monaco-editor"
                    />
                  </div>
                </div>

                <div class="zcode-part-editor-pane zcode-part-editor-pane--side">
                  <div
                    class="zcode-part-editor-side-tabs"
                    role="tablist"
                    :aria-label="$t('partsManager.preview')"
                  >
                    <button
                      type="button"
                      class="zcode-part-editor-side-tab"
                      :class="{ active: sidePaneTab === 'preview' }"
                      role="tab"
                      :aria-selected="sidePaneTab === 'preview'"
                      @click="sidePaneTab = 'preview'"
                    >
                      {{ $t('partsManager.displayPreview') }}
                    </button>
                    <button
                      type="button"
                      class="zcode-part-editor-side-tab"
                      :class="{ active: sidePaneTab === 'editPanel' }"
                      role="tab"
                      :aria-selected="sidePaneTab === 'editPanel'"
                      @click="sidePaneTab = 'editPanel'"
                    >
                      {{ $t('partsManager.editPanelPreview') }}
                    </button>
                  </div>
                  <div class="zcode-part-editor-pane-body">
                    <template v-if="sidePaneTab === 'preview'">
                      <div
                        class="zcode-part-editor-preview-tab"
                        @click="showPreviewModal = true"
                        v-html="getPartPreviewHtml(editingPart.type, editingPart.part)"
                      />
                      <div class="zcode-part-editor-preview-hint">
                        {{ $t('partsManager.clickToEnlarge') }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="zcode-edit-panel-preview-heading">
                        {{ $t('partsManager.editPanelPreview') }}
                      </div>
                      <div class="zcode-edit-panel-preview-desc">
                        {{ $t('partsManager.editPanelPreviewDesc') }}
                      </div>
                      <div class="zcode-edit-panel-preview-wrap">
                        <EditPanel
                          v-if="editPanelPreviewComponent"
                          :editing-component="editPanelPreviewComponent"
                          :editing-available-fields="editPanelPreviewFields"
                          current-mode="edit"
                          :can-select-parent="false"
                          :images-common="cmsData.images?.common ?? []"
                          :images-individual="cmsData.images?.individual ?? []"
                          :images-special="cmsData.images?.special ?? []"
                          :preview-mode="true"
                          @save-field="handleEditPanelPreviewSaveField"
                          @close="() => {}"
                          @add-image="() => {}"
                          @delete-image="() => {}"
                        />
                        <div
                          v-else
                          class="zcode-edit-panel-preview-empty"
                        >
                          {{ $t('partsManager.editPanelPreviewNoFields') }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div class="zcode-part-editor-actions">
              <button
                class="zcode-btn-primary zcode-part-editor-actions-btn zcode-part-editor-actions-btn-primary"
                @click="handleSavePart"
              >
                <Check :size="16" />
                <span>{{ $t('common.confirm') }}</span>
              </button>
              <button
                class="zcode-btn-cancel zcode-part-editor-actions-btn"
                @click="handleCancelPart"
              >
                <X :size="16" />
                <span>{{ $t('common.cancel') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- 拡大プレビューモーダル（パーツ編集用） -->
      <Teleport to="body">
        <div
          v-if="showPreviewModal && editingPart"
          class="zcode-preview-modal"
          @click="showPreviewModal = false"
        >
          <div
            class="zcode-preview-modal-content"
            @click.stop
          >
            <div class="zcode-preview-modal-header">
              <div
                class="zcode-preview-modal-header-title"
                role="heading"
                aria-level="4"
              >
                {{ $t('partsManager.preview') }} {{ editingPart.part.title }}
              </div>
              <button
                class="zcode-close-btn"
                @click="showPreviewModal = false"
              >
                <X :size="18" />
              </button>
            </div>
            <div
              class="zcode-preview-modal-body"
              v-html="getPartPreviewHtml(editingPart.type, editingPart.part)"
            />
          </div>
        </div>
      </Teleport>

      <!-- CSS警告モーダル（共通・個別パーツ両方） -->
      <Teleport to="body">
        <div
          v-if="
            showCssWarningModal &&
              (activeCategory === 'common' ||
                activeCategory === 'individual' ||
                activeCategory === 'special')
          "
          class="zcode-help-modal-overlay"
          @click.self="closeCssWarningModal"
        >
          <div
            class="zcode-help-modal zcode-css-warning-modal"
            @click.stop
          >
            <div class="zcode-help-modal-header">
              <div
                class="zcode-help-modal-header-title"
                role="heading"
                aria-level="3"
              >
                <AlertTriangle
                  :size="20"
                  class="zcode-css-warning-modal-title-icon"
                />
                <span>{{ $t('partsManager.cssEditWarning') }}</span>
              </div>
              <button
                class="zcode-close-btn"
                :aria-label="$t('common.close')"
                @click="closeCssWarningModal"
              >
                <X :size="20" />
              </button>
            </div>

            <div class="zcode-help-modal-body">
              <div class="zcode-warning-content">
                <div class="zcode-warning-text">
                  <ul class="zcode-warning-list">
                    <li>
                      <template v-if="activeCategory === 'common'">
                        {{ $t('partsManager.cssEditWarningMessageCommon') }}
                      </template>
                      <template v-else-if="activeCategory === 'individual'">
                        {{ $t('partsManager.cssEditWarningMessageIndividual') }}
                      </template>
                      <template v-else>
                        {{ $t('partsManager.cssEditWarningMessageSpecial') }}
                      </template>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="zcode-css-warning-modal-footer">
              <label
                class="zcode-checkbox-label"
                style="margin-bottom: 12px"
              >
                <input
                  v-model="dontShowCssWarningAgainParts"
                  type="checkbox"
                  class="zcode-checkbox-input"
                >
                <span>{{ $t('partsManager.dontShowAgain') }}</span>
              </label>
              <button
                class="zcode-btn-primary"
                @click="closeCssWarningModal"
              >
                {{ $t('partsManager.understood') }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- カテゴリ情報モーダル -->
      <Teleport to="body">
        <div
          v-if="showCategoryInfoModal"
          class="zcode-help-modal-overlay"
          @click.self="showCategoryInfoModal = false"
        >
          <div
            class="zcode-help-modal"
            @click.stop
          >
            <div class="zcode-help-modal-header">
              <div
                class="zcode-help-modal-header-title"
                role="heading"
                aria-level="3"
              >
                <Info
                  :size="20"
                  class="zcode-css-warning-modal-title-icon"
                />
                <span>{{ $t('dataViewer.categoryInfo.title') }}</span>
              </div>
              <button
                class="zcode-close-btn"
                :aria-label="$t('common.close')"
                @click="showCategoryInfoModal = false"
              >
                <X :size="18" />
              </button>
            </div>
            <div class="zcode-help-modal-body">
              <div class="zcode-help-section">
                <div
                  class="zcode-help-section-title"
                  role="heading"
                  aria-level="4"
                >
                  {{ $t('dataViewer.categoryInfo.common.title') }}
                </div>
                <div class="zcode-help-section-item">
                  {{ $t('dataViewer.categoryInfo.common.description') }}
                </div>
              </div>
              <div class="zcode-help-section">
                <div
                  class="zcode-help-section-title"
                  role="heading"
                  aria-level="4"
                >
                  {{ $t('dataViewer.categoryInfo.individual.title') }}
                </div>
                <div class="zcode-help-section-item">
                  {{ $t('dataViewer.categoryInfo.individual.description') }}
                </div>
              </div>
              <div class="zcode-help-section">
                <div
                  class="zcode-help-section-title"
                  role="heading"
                  aria-level="4"
                >
                  {{ $t('dataViewer.categoryInfo.special.title') }}
                </div>
                <div class="zcode-help-section-item">
                  {{ $t('dataViewer.categoryInfo.special.description') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- テンプレート記法ヘルプモーダル -->
      <Teleport to="body">
        <div
          v-if="showTemplateHelp"
          class="zcode-help-modal-overlay"
          @click="closeTemplateHelp"
        >
          <div
            class="zcode-help-modal"
            @click.stop
          >
            <div class="zcode-help-modal-header">
              <div
                class="zcode-help-modal-header-title"
                role="heading"
                aria-level="3"
              >
                {{ $t('partsManager.templateHelpTitle') }}
              </div>
              <button
                class="zcode-close-btn"
                :aria-label="$t('common.close')"
                @click="closeTemplateHelp"
              >
                <X :size="20" />
              </button>
            </div>

            <div class="zcode-help-modal-body">
              <table class="zcode-help-table">
                <thead>
                  <tr>
                    <th>{{ $t('partsManager.syntax') }}</th>
                    <th>{{ $t('partsManager.description') }}</th>
                    <th>{{ $t('partsManager.example') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>{$field:default}</code></td>
                    <td>{{ $t('partsManager.templateHelp.textField') }}</td>
                    <td><code>{$title:タイトル}</code></td>
                  </tr>
                  <tr>
                    <td><code>{$field:default:rich}</code></td>
                    <td>{{ $t('partsManager.templateHelp.richText') }}</td>
                    <td><code>{$content:本文:rich}</code></td>
                  </tr>
                  <tr>
                    <td><code>{$field:default:textarea}</code></td>
                    <td>{{ $t('partsManager.templateHelp.textarea') }}</td>
                    <td><code>{$description:説明:textarea}</code></td>
                  </tr>
                  <tr>
                    <td><code>{$field:default:image}</code></td>
                    <td>{{ $t('partsManager.templateHelp.image') }}</td>
                    <td><code>{$hero:default.jpg:image}</code></td>
                  </tr>
                  <tr>
                    <td><code>($field:option1|option2)</code></td>
                    <td>{{ $t('partsManager.templateHelp.radio') }}</td>
                    <td><code>($color:red|blue|green)</code></td>
                  </tr>
                  <tr>
                    <td><code>($field:option1,option2)</code></td>
                    <td>{{ $t('partsManager.templateHelp.checkbox') }}</td>
                    <td><code>($features:fast,secure)</code></td>
                  </tr>
                  <tr>
                    <td><code>($field@:option1|option2)</code></td>
                    <td>{{ $t('partsManager.templateHelp.selectSingle') }}</td>
                    <td><code>($size@:S|M|L)</code></td>
                  </tr>
                  <tr>
                    <td><code>($field@:option1,option2)</code></td>
                    <td>{{ $t('partsManager.templateHelp.selectMultiple') }}</td>
                    <td><code>($tags@:tag1,tag2,tag3)</code></td>
                  </tr>
                  <tr>
                    <td><code>z-if="show_field"</code></td>
                    <td>{{ $t('partsManager.templateHelp.conditional') }}</td>
                    <td><code>&lt;div z-if="show_content"&gt;...&lt;/div&gt;</code></td>
                  </tr>
                  <tr>
                    <td><code>z-slot="name"</code></td>
                    <td>{{ $t('partsManager.templateHelp.slot') }}</td>
                    <td><code>&lt;div z-slot="content"&gt;&lt;/div&gt;</code></td>
                  </tr>
                </tbody>
              </table>

              <div class="zcode-help-section">
                <div
                  class="zcode-help-section-title"
                  role="heading"
                  aria-level="4"
                >
                  {{ $t('partsManager.templateHelp.note') }}
                </div>
                <div
                  role="list"
                  class="zcode-help-section-list"
                >
                  <div
                    role="listitem"
                    class="zcode-help-section-item"
                    v-html="$t('partsManager.templateHelp.suggestionNote')"
                  />
                  <div
                    role="listitem"
                    class="zcode-help-section-item"
                  >
                    {{ $t('partsManager.templateHelp.fieldNameNote') }}
                  </div>
                  <div
                    role="listitem"
                    class="zcode-help-section-item"
                  >
                    {{ $t('partsManager.templateHelp.defaultValueNote') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ZeroCodeData, TypeData, CMSConfig, ComponentData } from '../../../types';
import { usePartsManager } from '../composables/usePartsManager';
import { getAvailableFieldsFromPart } from '../../../core/utils/edit-panel-fields';
import EditPanel from '../../editor/components/EditPanel.vue';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  ArrowUpDown,
  HelpCircle,
  Info,
  AlertTriangle
} from 'lucide-vue-next';
import MonacoEditor from './MonacoEditor.vue';
import {
  getDevSetting,
  saveDevSettings,
  getCssWarningPartsSetting,
  setCssWarningPartsSetting
} from '../../../core/utils/storage';

const { t } = useI18n();

const props = defineProps<{
  cmsData: ZeroCodeData;
  config?: Partial<CMSConfig>;
}>();

const showPreviewModal = ref(false);
const enableTemplateSuggestions = ref(getDevSetting('enableTemplateSuggestions', false));
const showTemplateHelp = ref(false);
const showCssWarningModal = ref(false);
const showCategoryInfoModal = ref(false);
const dontShowCssWarningAgainParts = ref(getCssWarningPartsSetting());
const codeTab = ref<'html' | 'css' | 'slots'>('html');
const sidePaneTab = ref<'preview' | 'editPanel'>('preview');
const cssDraft = ref('');
const cssDraftInitial = ref('');

const MODAL_PREVIEW_CSS_STYLE_IDS = {
  common: 'zcode-css-style-parts-manager-preview-common',
  individual: 'zcode-css-style-parts-manager-preview-individual',
  special: 'zcode-css-style-parts-manager-preview-special'
};
const modalPreviewCssStyleEls: Map<string, HTMLStyleElement> = new Map();

// 現在のカテゴリのCSSを取得
const currentCSS = computed(() => {
  if (activeCategory.value === 'common') return props.cmsData.css?.common ?? '';
  if (activeCategory.value === 'individual') return props.cmsData.css?.individual ?? '';
  return props.cmsData.css?.special ?? '';
});

function applyModalPreviewPageCSS(cssMap: {
  common?: string;
  individual?: string;
  special?: string;
}) {
  // 順序: common → individual → special
  const order = ['common', 'individual', 'special'] as const;
  order.forEach((category) => {
    const css = cssMap[category];
    if (!css || !css.trim()) {
      const el = modalPreviewCssStyleEls.get(category);
      if (el) {
        el.remove();
        modalPreviewCssStyleEls.delete(category);
      }
      return;
    }

    let styleElement = modalPreviewCssStyleEls.get(category);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = MODAL_PREVIEW_CSS_STYLE_IDS[category];
      styleElement.setAttribute('data-zcode-css', 'true');
      styleElement.setAttribute('data-zcode-css-parts-preview', 'true');
      styleElement.setAttribute('data-zcode-css-category', category);
      if (!styleElement.parentNode) {
        document.head.appendChild(styleElement);
      }
      modalPreviewCssStyleEls.set(category, styleElement);
    }

    styleElement.textContent = css;
  });
}

function cleanupModalPreviewPageCSS() {
  modalPreviewCssStyleEls.forEach((el) => {
    el.remove();
  });
  modalPreviewCssStyleEls.clear();
}

function openTemplateHelp() {
  showTemplateHelp.value = true;
}

function closeTemplateHelp() {
  showTemplateHelp.value = false;
}

function openCssWarningModal() {
  if (
    activeCategory.value === 'common' ||
    activeCategory.value === 'individual' ||
    activeCategory.value === 'special'
  ) {
    showCssWarningModal.value = true;
  }
}

function closeCssWarningModal() {
  showCssWarningModal.value = false;
  setCssWarningPartsSetting(dontShowCssWarningAgainParts.value);
}

// 設定変更時にローカルストレージに保存
watch(enableTemplateSuggestions, (value) => {
  saveDevSettings({ enableTemplateSuggestions: value });
});

// タブの順序を制御
const categoryOrder = computed(() => props.config?.categoryOrder || 'common');

const categoryTabs = computed(() => {
  const tabs: Array<'common' | 'individual' | 'special'> = [];
  const hasSpecial = props.cmsData.parts.special.length > 0;

  if (categoryOrder.value === 'individual') {
    tabs.push('individual', 'common');
    if (hasSpecial) tabs.push('special');
  } else if (categoryOrder.value === 'special') {
    if (hasSpecial) tabs.push('special');
    tabs.push('common', 'individual');
  } else {
    tabs.push('common', 'individual');
    if (hasSpecial) tabs.push('special');
  }

  return tabs as readonly ('common' | 'individual' | 'special')[];
});

const {
  // 並べ替え
  reorderSourcePart,
  handleReorderClick,

  // 既存
  activeCategory,
  editingType,
  editingPart,
  editingLevel,
  isCreatingNew,
  groupedPartsByType,
  startCreating,
  startEditingType,
  startEditingPart,
  addPartToType,
  saveType: saveTypeInternal,
  savePart: savePartInternal,
  deletePart,
  checkTypeUsage,
  cancelEditingType,
  cancelEditingPart,
  getPartPreviewHtml,
  createTempComponentFromType,
  addPartSlot,
  removePartSlot,
  updatePartSlotAllowedParts,
  getAvailableSlotsForPart,
  extractSlotsFromTemplate,
  reorderSourceType,
  startReorderType,
  deletePartType
} = usePartsManager(props.cmsData);

const editPanelPreviewComponent = ref<ComponentData | null>(null);

watch(
  () => editingPart.value,
  (part) => {
    if (!part) {
      editPanelPreviewComponent.value = null;
      return;
    }
    const temp = createTempComponentFromType(part.type, part.part);
    editPanelPreviewComponent.value = reactive({
      ...temp,
      type: part.type.type
    }) as ComponentData;
  },
  { deep: true }
);

const editPanelPreviewFields = computed(() => {
  const part = editingPart.value;
  const comp = editPanelPreviewComponent.value;
  if (!part || !comp) return [];
  return getAvailableFieldsFromPart(part.part, comp);
});

function handleEditPanelPreviewSaveField(field: { fieldName: string; currentValue: unknown }) {
  const comp = editPanelPreviewComponent.value;
  if (comp) {
    comp[field.fieldName] = field.currentValue;
  }
}

// categoryOrderに基づいて初期値を設定
if (props.config?.categoryOrder === 'individual') {
  activeCategory.value = 'individual';
}

const isPartEditModalOpen = computed(() => {
  const level = (editingLevel as any)?.value ?? editingLevel;
  return level === 'part' && !!editingPart.value;
});

watch(
  () => isPartEditModalOpen.value,
  (isOpen) => {
    if (!isOpen) {
      cleanupModalPreviewPageCSS();
      return;
    }
    nextTick(() => {
      const current = currentCSS.value;
      cssDraftInitial.value = current;
      cssDraft.value = current;
      // モーダルプレビューでは3つのCSSをすべて適用
      applyModalPreviewPageCSS({
        common: props.cmsData.css?.common,
        individual: props.cmsData.css?.individual,
        special: props.cmsData.css?.special
      });
    });
  },
  { immediate: true }
);

// activeCategoryが変更されたときにCSSを更新
watch(
  () => activeCategory.value,
  () => {
    if (isPartEditModalOpen.value) {
      nextTick(() => {
        const current = currentCSS.value;
        cssDraftInitial.value = current;
        cssDraft.value = current;
      });
    }
  }
);

watch(
  [() => cssDraft.value, () => isPartEditModalOpen.value, () => activeCategory.value],
  ([css, isOpen, category]) => {
    if (!isOpen) return;
    nextTick(() => {
      // 現在のカテゴリのCSSのみを更新し、他のカテゴリのCSSは保持
      const cssMap = {
        common: props.cmsData.css?.common,
        individual: props.cmsData.css?.individual,
        special: props.cmsData.css?.special
      };
      if (category === 'common') {
        cssMap.common = css ?? '';
      } else if (category === 'individual') {
        cssMap.individual = css ?? '';
      } else {
        cssMap.special = css ?? '';
      }
      applyModalPreviewPageCSS(cssMap);
    });
  }
);

async function handleSavePart() {
  await savePartInternal();
  if (!editingPart.value && props.cmsData.css) {
    if (activeCategory.value === 'common') {
      props.cmsData.css.common = cssDraft.value;
    } else if (activeCategory.value === 'individual') {
      props.cmsData.css.individual = cssDraft.value;
    } else {
      props.cmsData.css.special = cssDraft.value;
    }
    cssDraftInitial.value = cssDraft.value;
  }
}

function handleCancelPart() {
  cssDraft.value = cssDraftInitial.value;
  cleanupModalPreviewPageCSS();
  showPreviewModal.value = false;
  cancelEditingPart();
}

onBeforeUnmount(() => {
  cleanupModalPreviewPageCSS();
});

watch(
  () => editingPart.value,
  (v) => {
    if (v) {
      codeTab.value = 'html';
    }
  }
);

watch(
  () => codeTab.value,
  (newTab) => {
    if (
      newTab === 'css' &&
      isPartEditModalOpen.value &&
      (activeCategory.value === 'common' ||
        activeCategory.value === 'individual' ||
        activeCategory.value === 'special') &&
      !dontShowCssWarningAgainParts.value
    ) {
      nextTick(() => {
        openCssWarningModal();
      });
    }
  }
);

// activeCategoryをexpose
defineExpose({
  activeCategory
});

async function saveType() {
  // 新規タイプ作成 / 既存タイプ編集とも、保存ロジックとバリデーションは usePartsManager に委譲
  await saveTypeInternal();
}

// 利用可能なスロット（既に設定済みのものを除外）
const availableSlotsForPart = computed(() => {
  if (!editingPart.value) return [];

  return getAvailableSlotsForPart(editingPart.value.partIndex);
});

// テンプレートにz-slotが含まれているか、または既にスロットが設定されているかを判定
const hasSlotsInTemplate = computed(() => {
  if (!editingPart.value) return false;

  const template = editingPart.value.part.body;
  const hasSlotsInBody = template ? extractSlotsFromTemplate(template).length > 0 : false;
  const hasConfiguredSlots =
    editingPart.value.part.slots && Object.keys(editingPart.value.part.slots).length > 0;

  return hasSlotsInBody || hasConfiguredSlots;
});

watch([() => hasSlotsInTemplate.value, () => codeTab.value], ([hasSlots, tab]) => {
  if (!hasSlots && tab === 'slots') {
    codeTab.value = 'html';
  }
});

const selectedSlotToAdd = ref('');

const handleAddSelectedSlot = () => {
  if (!selectedSlotToAdd.value || !editingPart.value) return;

  addPartSlot(editingPart.value.partIndex, selectedSlotToAdd.value);
  selectedSlotToAdd.value = ''; // リセット
};

// テンプレートが変更されたら選択をリセット
watch(
  () => editingPart.value?.part.body,
  () => {
    selectedSlotToAdd.value = '';
  }
);

// すべてのパーツを取得（共通+個別+特別）
const allParts = computed(() => {
  const parts: Array<{ id: string; title: string; typeName: string; description?: string }> = [];
  const partsData = props.cmsData.parts;
  const allTypes = [...partsData.common, ...partsData.individual, ...(partsData.special || [])];

  allTypes.forEach((type) => {
    type.parts.forEach((part) => {
      parts.push({
        id: part.id,
        title: part.title,
        typeName: type.type,
        description: part.description
      });
    });
  });

  return parts.sort((a, b) => {
    if (a.typeName !== b.typeName) {
      return a.typeName.localeCompare(b.typeName);
    }
    return a.title.localeCompare(b.title);
  });
});

// スロットごとの検索フィルター
const slotPartFilters = ref<Record<string, string>>({});

// フィルターされたパーツ（許可用）
const getFilteredParts = (slotName: string) => {
  const filter = slotPartFilters.value[slotName] || '';
  if (!filter) return allParts.value;
  const lowerFilter = filter.toLowerCase();
  return allParts.value.filter(
    (part) =>
      part.title.toLowerCase().includes(lowerFilter) ||
      part.typeName.toLowerCase().includes(lowerFilter)
  );
};

// スロット設定から許可されるパーツを取得
const getAllowedPartsForSlot = (slotName: string): string[] => {
  if (!editingPart.value) return [];

  const slotConfig = editingPart.value.part.slots?.[slotName];
  if (!slotConfig) return [];

  return slotConfig.allowedParts || [];
};

// 許可されるパーツのチェックボックス変更
const handleAllowedPartChange = (slotName: string, partId: string, event: Event) => {
  if (!editingPart.value) return;

  const checked = (event.target as HTMLInputElement).checked;
  const slotConfig = editingPart.value.part.slots?.[slotName];
  const currentAllowed = slotConfig?.allowedParts || [];

  let newAllowed: string[];
  if (checked) {
    newAllowed = [...currentAllowed, partId];
  } else {
    newAllowed = currentAllowed.filter((p: string) => p !== partId);
  }

  updatePartSlotAllowedParts(editingPart.value.partIndex, slotName, newAllowed);
};

// アイテムのクラスを動的に生成
function getPartItemClass(type: TypeData, partIndex: number) {
  const classes = ['zcode-part-item'];

  // 並べ替えの移動元を強調
  if (
    reorderSourcePart.value &&
    reorderSourcePart.value.type === type.type &&
    reorderSourcePart.value.partIndex === partIndex
  ) {
    classes.push('zcode-reorder-source');
  }

  return classes.join(' ');
}

function handleDelete(typeWithIndex: TypeData & { _partIndex?: number }) {
  // パーツ単位で削除する場合の確認メッセージ
  const partIndex = typeWithIndex._partIndex;
  const isPartDelete = partIndex !== undefined && partIndex !== null;
  const partNumber = isPartDelete && partIndex !== undefined ? partIndex + 1 : 0;
  const totalParts = typeWithIndex.parts.length;

  if (isPartDelete && totalParts > 1) {
    // パーツ単位で削除（タイプには他のパーツが残る）
    if (!confirm(t('partsManager.deletePartConfirm', { number: partNumber }))) {
      return;
    }
  } else {
    // タイプ全体を削除
    const usages = checkTypeUsage(typeWithIndex.type);
    if (usages.length > 0) {
      if (
        !confirm(
          t('partsManager.deleteTypeWithUsagesConfirm', {
            type: typeWithIndex.type,
            count: usages.length
          })
        )
      ) {
        return;
      }
    } else {
      if (!confirm(t('partsManager.deleteTypeConfirm'))) {
        return;
      }
    }
  }

  deletePart(typeWithIndex);
}
</script>

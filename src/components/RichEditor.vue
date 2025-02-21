<template>
  <div class="rich-editor">
    <Editor
      v-model="templateContent"
      :init="{
        selector: 'textarea',
        height: 500,
        menubar: false,
        language: 'zh_CN',
        language_url: '/tinymce/langs/zh_CN.js',
        plugins: [
          'lists',      // 列表功能
          'link',       // 超链接
          'wordcount',  // 字数统计
          'fontfamily', // 字体选择
          'fontSize',   // 字体大小选择
          'blocks',     // 标题选择
          'bold',       // 加粗
          'italic',     // 斜体
          'underline',  // 下划线
          'alignleft',  // 左对齐
          'aligncenter',// 居中对齐
          'alignright', // 右对齐
          'forecolor',  // 字体颜色
          'backcolor',  // 背景颜色
          'removeformat',// 清除格式
        ],
        toolbar: 'insertInfo insertImg | ' +
          'fontfamily fontSize blocks | ' +           // 字体、大小、标题
          'bold italic underline | ' +                // 加粗、斜体、下划线
          'forecolor backcolor | ' +                  // 字体颜色和背景颜色
          'alignleft aligncenter alignright | ' +     // 对齐
          'bullist numlist | ' +                      // 有序无序列表
          'undo redo | ' +                            // 撤销重做
          'link removeformat | ' +                    // 超链接和清除格式
          'wordcount',                                // 字数统计

        // 设置插入超链接的title和target
        link_title: false,
        link_target_list: false,

        // 自定义字体配置
        font_family_formats:
         '楷体_GB2312=MacKTGB2312,MacKTGB2312;' +
         '微软雅黑=msyh,msyh;' +
         '仿宋GB2312=仿宋GB2312,仿宋GB2312;' +
         '黑体 Medium=STHeiti Medium,STHeiti Medium;' +
         'Arial=Arial Unicode,Arial Unicode;'
         ,

        // 自定义字号配置，使用px
        font_size_formats: '12px 13px 14px 15px 16px 17px 18px 19px 20px 22px 24px 28px 32px 36px 40px 48px',

        // 标题配置
        block_formats: '正文=p; 标题1=h1; 标题2=h2; 标题3=h3; 标题4=h4; 标题5=h5; 标题6=h6',

        // 默认样式
        content_style: `
          @font-face {
            font-family: 'MacKTGB2312';
            src: url('/fonts/MacKTGB2312.ttf') format('truetype');
          }
          @font-face {
            font-family: 'msyh';
            src: url('/fonts/msyh.ttf') format('truetype');
          }
          @font-face {
            font-family: '仿宋GB2312';
            src: url('/fonts/仿宋GB2312.ttf') format('truetype');
          }
          @font-face {
            font-family: 'STHeiti Medium';
            src: url('/fonts/STHeiti Medium.ttc') format('truetype');
          }
          @font-face {
            font-family: 'Arial Unicode';
            src: url('/fonts/Arial Unicode.ttf') format('truetype');
          }

          .mce-content-readonly {
            background: #e9ecef;
            border-radius: 4px;
            padding: 0 4px;
            cursor: not-allowed;
            user-select: none;
          }
          .mce-offscreen-selection {
            opacity: 0;
          }
        `,
        branding: false,
        // 自定义按钮设置
        setup: (editor) => {
          // 添加自定义样式格式
          editor.on('init', () => {
            editor.formatter.register('readonly', {
              inline: 'span',
              classes: 'mce-content-readonly',
              attributes: { contenteditable: 'false' }
            });
          });

          // 注册自定义按钮
          editor.ui.registry.addButton('insertInfo', {
            text: '插入信息',
            onAction: () => {
              // 保存当前选区
              const bookmark = editor.selection.getBookmark();

              // 显示下拉框
              insertInfoDialog = true;
              openInsertInfoDialog(editor, bookmark);
            },
          });

          editor.ui.registry.addButton('insertImg', {
            text: '插入图片',
            onAction: () => {
              // 保存当前选区
              const bookmark = editor.selection.getBookmark();

              // 显示下拉框
              insertImgDialog = true;
              openInsertImgDialog(bookmark);
            },
          });
        }
      }"
      @init="handleInit"
    />

    <!-- 变量下拉框 -->
    <el-dialog v-model="insertInfoDialog" title="选择变量" width="30%">
      <el-select v-model="selectedReceiverInfo" @change="insertInfo" style="width: 70%;" placeholder="请选择变量">
        <el-option v-for="item in receiverInfo" :key="item.key" :label="item.label" :value="item.label" />
      </el-select>
    </el-dialog>

    <!-- 图片选择对话框 -->
    <el-dialog
      title="选择图片"
      v-model="insertImgDialog"
      width="50%"
    >
      <!-- 搜索框 -->
      <div class="search-container">
        <el-form style="width:100%;display: flex;flex-direction: row;gap: 10px">
          <el-form-item>
            <el-input
              v-model="imageSearchText"
              style="width: 200px"
              placeholder="请搜索图片名称"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="userSearchText"
              style="width: 200px"
              placeholder="请搜索所属用户"
              clearable
            />
          </el-form-item>

          <el-form-item style="display: flex;flex-direction: row;gap: 10px">
            <el-button type="primary" @click="handleImgSearch">搜索</el-button>
            <el-button type="primary" @click="resetSearchImg">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 筛选结果 -->
      <div class="result-section">
        <p>筛选结果：</p>
        <el-checkbox-group v-model="selectedImages">
          <el-checkbox
            v-for="image in imgCurrentPageData"
            :key="image.id"
            :label="image.name"
            :value="image.url"
          >
            {{ image.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 分页 -->
      <SmartPagination
        v-model:current-page="imgPagination.currentPage"
        :server-page-size="imgPagination.serverPageSize"
        :display-page-size="imgPagination.displayPageSize"
        :total="imgPagination.totalItems"
        @load-data="handleImgLoadData" />

      <!-- 底部按钮 -->
      <template #footer>
        <el-button @click="closeInsertImgDialog">取消</el-button>
        <el-button type="primary" @click="insertImg">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import Editor from '@tinymce/tinymce-vue'
import { ref, computed } from 'vue'
import { fileApi } from '@/api/file/file.js'
import { errorHandler } from '@/utils/errorHandler.js'
import SmartPagination from '@/components/SmartPagination.vue'

// 导入必要的 TinyMCE 组件
import 'tinymce/tinymce'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'
import 'tinymce/models/dom'

// 导入需要的插件
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/wordcount'

const templateContent = defineModel()
// const props = defineProps({
//   modelValue: {
//     type: String,
//     default: ''
//   }
// })
// const templateContent = ref(props.modelValue)
// const emit = defineEmits(['update:modelValue'])

// 信息列表
const selectedReceiverInfo = ref('')
const receiverInfo = [
  { key: 'receiver_name', label: '收件人姓名' },
  { key: 'contact_person', label: '联系人' },
  { key: 'contact_way', label: '联系方式' },
  { key: 'receiver_country', label: '收件人国家' },
  { key: 'trade_type', label: '贸易类型' },
  { key: 'sex', label: '性别' },
  { key: 'birth', label: '出生日期' }
]
const insertInfoDialog = ref(false)
let currentBookmark = null
let editorInstance = null
// 显示信息下拉框
const openInsertInfoDialog = (editor, bookmark) => {
  insertInfoDialog.value = true
  currentBookmark = bookmark;
}
// 插入信息
const insertInfo = (item) => {
  if (!editorInstance || !currentBookmark) return;

  // 恢复选区
  editorInstance.selection.moveToBookmark(currentBookmark);

  // 插入不可编辑的变量标记
  const variableText = `\${${item}}`;
  const content = `<span class="mce-content-readonly" contenteditable="false">${variableText}</span>`;
  editorInstance.execCommand('mceInsertContent', false, content);

  // 隐藏下拉框
  insertInfoDialog.value = false;
  selectedReceiverInfo.value = '';
}

// 图片列表
const insertImgDialog = ref(false)
const imageSearchText = ref('')
const userSearchText = ref('')
const selectedImages = ref([])


// ========================= 分页 =========================
const imgPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 10,
  totalItems: 0,
  cachedData: new Map()
});
const imgCurrentPageData = computed(() => {
  const displayPageSize = imgPagination.value.displayPageSize  // 10
  const serverPageSize = imgPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((imgPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = imgPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((imgPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleImgLoadData = async (serverPage) => {
  console.log("商品分页组件计算出的页码：",serverPage);
  if(imgPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  imgPagination.value.serverPage = serverPage
  await searchImages()

}
const clearImgCache = () => {
  imgPagination.value.currentPage = 1;
  imgPagination.value.serverPage = 1;
  imgPagination.value.cachedData.clear();
  imgPagination.value.totalItems = 0;
}

// 显示图片选择对话框
const openInsertImgDialog = (bookmark) => {
  insertImgDialog.value = true;
  currentBookmark = bookmark;
}
// 关闭图片选择对话框
const closeInsertImgDialog = () => {
  insertImgDialog.value = false;
  selectedImages.value = [];
  resetSearchImg();
}
// 插入图片
const insertImg = () => {
  if (!editorInstance || !currentBookmark) return;

  // 恢复选区
  editorInstance.selection.moveToBookmark(currentBookmark);

  // 插入图片
  selectedImages.value.forEach(imageUrl => {
    const imgContent = `<img src="${imageUrl}" alt="图片" />`;
    editorInstance.execCommand('mceInsertContent', false, imgContent);
  });
  selectedImages.value = []; // 清空选择

  // 隐藏图片选择对话框
  insertImgDialog.value = false;
}
// 搜索图片点击事件
const handleImgSearch = () => {
  clearImgCache()
  searchImages()
}
// 搜索图片
const searchImages = async () => {
  try {
    const requestData = {
      img_name: imageSearchText.value,
      creator_name: userSearchText.value,
      belong_user_name: '',
      status: 0,
      page_num: 1,
      page_size: 20
    }
    console.log('图片搜索请求参数：', requestData)
    const response = await fileApi.filterImg(requestData)
    if(response.code === 200){
      imgPagination.value.cachedData.set(
        imgPagination.value.serverPage,
        response.data.data
      )
      imgPagination.value.totalItems = response.data.total_items
      console.log('图片搜索结果：', imgPagination.value.cachedData.get(imgPagination.value.serverPage))
    }else{
      errorHandler.showError('搜索图片失败，请重试。请检查各项参数是否正常',response)
    }
  } catch(error) {
    errorHandler.showError('搜索图片失败，请重试',error)
  }
}
// 重置搜索图片
const resetSearchImg = () => {
  imageSearchText.value = ""
  userSearchText.value = ""
  selectedImages.value = []
  clearImgCache();
}

const handleInit = (evt, editor) => {
    //emit('update:modelValue', templateContent.value)

    editorInstance = editor
    editorInstance.setContent(templateContent.value)
    // 设置初始字体
    editor.execCommand('FontName', false, 'impact')
    // 点击编辑器其他地方时隐藏下拉框
    // 修改点击事件处理
    editor.on('click', (e) => {
      // 只在必要时阻止事件冒泡
      if (e.target.closest('.editor-dropdown')) {
        e.stopPropagation()
      }
      insertInfoDialog.value = false;
      selectedReceiverInfo.value = '';
    })
    // 监听内容变化
    editor.on('change', () => {
      console.log('获取当前文本内容', editor.getContent())
      templateContent.value = editor.getContent()
    })
}
/**
 * 双向绑定，子组件向父组件更新值的时候，父组件值被改变后，会被watch监听到，然后重新渲染回子组件，会导致视图重新渲染，从而丢失光标位置。
 * 这样每次更新后光标都会回到第一行初始位置。   目前只有使用工具栏之后会这样，输入文字暂时不会。
 * 解决方法：停用watch监听。在子组件使用v-model，也会自动更新值，不用watch重新渲染视图了。
 */
// watch(
//     () => templateContent.value,  // 监听
//     (newValue) => {
//       console.log('父组件邮件模板内容改变, newValue:', newValue)
//       if (newValue && editorInstance) {
//         const selection = editorInstance.selection.getBookmark()
//         editorInstance.setContent(newValue)
//         // 恢复光标位置
//         setTimeout(() => {
//         editorInstance.selection.moveToBookmark(selection)
//         editorInstance.focus()
//       }, 0)
//       }
//     },
// )


</script>

<style>
@import 'tinymce/skins/ui/oxide/skin.min.css';
@import 'tinymce/skins/ui/oxide/content.min.css';
@import 'tinymce/skins/content/default/content.min.css';

.rich-editor {
  width: 100%;
  border: 1px solid #ddd;
}
.mce-content-readonly {
  background: #202223;
  border-radius: 4px;
  padding: 0 4px;
  cursor: pointer;
  user-select: none;
}

/* 隐藏选择框 */
.mce-offscreen-selection {
  opacity: 0;  /* 完全透明 */
  /* 或者使用 visibility: hidden; */
}

/* 自定义按钮样式 */
.tox .tox-tbtn[data-mce-name="insertinfo"],
.tox .tox-tbtn[data-mce-name="insertimg"] {
  background-color: #409eff !important;
  border-radius: 4px !important;
  margin: 0 2px !important;
  border: none !important;
}

/* 按钮文字颜色 */
.tox .tox-tbtn[data-mce-name="insertinfo"] .tox-tbtn__select-label,
.tox .tox-tbtn[data-mce-name="insertimg"] .tox-tbtn__select-label {
  color: white !important;
}

/* 悬停效果 */
.tox .tox-tbtn[data-mce-name="insertinfo"]:hover,
.tox .tox-tbtn[data-mce-name="insertimg"]:hover {
  background-color: #66b1ff !important;
}

/* 激活状态 */
.tox .tox-tbtn[data-mce-name="insertinfo"]:active,
.tox .tox-tbtn[data-mce-name="insertimg"]:active {
  background-color: #3a8ee6 !important;
}

/* 禁用状态 */
.tox .tox-tbtn[data-mce-name="insertinfo"][aria-disabled="true"],
.tox .tox-tbtn[data-mce-name="insertimg"][aria-disabled="true"] {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}
</style>

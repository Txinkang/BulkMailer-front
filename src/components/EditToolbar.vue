<template>
  <div class="email-editor">
    <div class="toolbar">
      <!-- 基础文本样式 -->
      <el-button-group>
        <el-button @click="applyStyle('bold')"><i class="icon-bold"></i></el-button>
        <el-button @click="applyStyle('italic')"><i class="icon-italic"></i></el-button>
        <el-button @click="applyStyle('underline')"><i class="icon-underline"></i></el-button>
      </el-button-group>

      <!-- 字体设置 -->
      <el-select v-model="fontFamily" placeholder="字体" @focus="saveSelection" @change="applyFont">
        <el-option v-for="font in fonts" :key="font" :label="font" :value="font"></el-option>
      </el-select>
      <el-select v-model="fontSize" placeholder="大小" @focus="saveSelection" @change="applyFontSize">
        <el-option v-for="size in fontSizes" :key="size" :label="size" :value="size"></el-option>
      </el-select>
      <el-color-picker v-model="fontColor" @focus="saveSelection" @change="applyColor"></el-color-picker>

      <!-- 段落设置 -->
      <el-select v-model="heading" placeholder="标题" @focus="saveSelection" @change="applyHeading">
        <el-option v-for="h in headings" :key="h.value" :label="h.label" :value="h.value"></el-option>
      </el-select>
      <el-button-group>
        <el-button @click="applyStyle('justifyLeft')"><i class="icon-align-left"></i></el-button>
        <el-button @click="applyStyle('justifyCenter')"><i class="icon-align-center"></i></el-button>
        <el-button @click="applyStyle('justifyRight')"><i class="icon-align-right"></i></el-button>
        <el-button @click="applyStyle('indent')"><i class="icon-indent"></i></el-button>
        <el-button @click="applyStyle('outdent')"><i class="icon-outdent"></i></el-button>
      </el-button-group>

      <!-- 插入功能 -->
      <el-select v-model="selectedUserInfo" placeholder="插入信息" @focus="saveSelection" @change="insertUserInfo">
        <el-option v-for="info in userInfos" :key="info" :label="info" :value="info"></el-option>
      </el-select>
      <el-button @click="insertImage"><i class="icon-image"></i> 图片</el-button>
      <el-button @click="insertLink"><i class="icon-link"></i> 链接</el-button>
    </div>

    <!-- 图片选择对话框 -->
    <el-dialog
      title="选择图片"
      v-model="pictureDialogVisible"
      width="50%"
    >
      <el-tabs class="fileListTabs">
        <el-tab-pane label="私海图片">

          <!-- 搜索框 -->
          <div class="search-container">
            <el-input style="width: 300px" placeholder="请搜索图片名称" clearable>
              <el-icon>
                <Search/>
              </el-icon>
            </el-input>
          </div>

          <!-- 筛选条件 -->
          <div class="filter-section">
            <el-select v-model="selectedCompany" placeholder="选择公司" @change="filterRecipients">
              <el-option v-for="company in sendCompany" :key="company" :label="company" :value="company" />
            </el-select>
            <el-select v-model="selectedSector" placeholder="选择部门" @change="filterRecipients">
              <el-option v-for="sector in sendSector" :key="sector" :label="sector" :value="sector" />
            </el-select>
            <el-select v-model="selectedJob" placeholder="选择岗位" @change="filterRecipients">
              <el-option v-for="job in sendJob" :key="job" :label="job" :value="job" />
            </el-select>
          </div>

          <!-- 筛选结果 -->
          <div class="result-section">
            <p>筛选结果：</p>
            <el-checkbox-group v-model="pictureGroup" style="margin-bottom: 15px">
              <el-checkbox v-for="files in pictureList" :key="files.id" :label="files.name">
                {{files.name}}
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalData"
            layout="prev, pager, next"
            background
          />
        </el-tab-pane>

        <el-tab-pane label="公海图片">
          <!-- 搜索框 -->
          <div class="search-container">
            <el-input style="width: 300px" placeholder="请搜索图片名称" clearable>
              <el-icon style="vertical-align: middle">
                <Search/>
              </el-icon>
              <span style="vertical-align: middle"> Search </span>
            </el-input>

          </div>

          <el-checkbox-group v-model="pictureGroup" style="margin-bottom: 15px">
            <el-checkbox v-for="files in pictureList" :key="files.id" :label="files.name">
              {{files.name}}
            </el-checkbox>
          </el-checkbox-group>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalData"
            layout="prev, pager, next"
            background
          />
        </el-tab-pane>
      </el-tabs>


      <!-- 底部按钮 -->
      <template #footer>
        <el-button @click="selectAllappendixs">全选</el-button>
        <el-button @click="clearSelection">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确定</el-button>
      </template>
    </el-dialog>


    <div class="email-editor">
      <!-- 文本编辑区域 -->
      <div class="editor" contenteditable="true" ref="editor"></div>
      <!-- 退订链接 -->
      <div class="unsubscribe-link">
        <a href="https://example.com/unsubscribe" style="text-decoration: none; color: gray;">
          如要退订此类邮件，请点击此处
        </a>
      </div>
    </div>
  </div>

</template>

<script setup>
import {onMounted, ref, watch} from "vue";

// 数据定义
const fontFamily = ref(null);
const fontSize = ref(null);
const fontColor = ref("#000");
const heading = ref(null);
const selectedUserInfo = ref(null);
const editor = ref(null);
const pictureDialogVisible = ref(false);
const templateData = ref("");
// 分页数据
const totalData = ref(100);
// 当前页
const currentPage = ref(1);
// 每页显示条数
const pageSize = ref(10);
const fonts = ["Arial", "Georgia", "Times New Roman", "Verdana"];
const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];
const userInfos = ["用户姓名", "公司", "联系方式"];
const headings = [
  { label: "正文", value: "p" },
  { label: "标题1", value: "h1" },
  { label: "标题2", value: "h2" },
  { label: "标题3", value: "h3" },
];
// 接收父组件传递的值
const props = defineProps({
  data: {
    type: String,
    required: true,
  },
});
// 表格数据
const pictureGroup = ref([]);
const pictureList = ref([
  { id: 1, name: "图片1xxxxx" }, // 初始状态为未暂停
  { id: 2, name: "图片2xxxxx" }, // 初始状态为暂停
  { id: 3, name: "图片3xxxxx" }, // 初始状态为暂停
  { id: 4, name: "图片4xxxxx" }, // 初始状态为暂停
  { id: 5, name: "图片5xxxxx" }, // 初始状态为暂停
  { id: 7, name: "图片6xxxxx" }, // 初始状态为暂停
  { id: 8, name: "图片7xxxxx" }, // 初始状态为暂停
  { id: 9, name: "图片8xxxxx" }, // 初始状态为暂停
]);
// 方法实现
onMounted(() => {
  console.log("父组件数据变化：", props.data);
  editor.value.innerHTML = "<p>请编辑模板</p>\n";
});

watch(
  () => props.data,
  (newValue) => {
    console.log("父组件数据变化：", newValue);
    // 数据处理逻辑
    templateData.value = parseInt(newValue);// 转换为数字
    editor.value.innerHTML = newValue;
  },
);

const applyStyle = (command) => {
  document.execCommand(command, false, null); // 执行富文本命令
};

const applyFont = () => {
  restoreSelection();
  document.execCommand("fontName", false, fontFamily.value);
};
const applyFontSize = () => {
  restoreSelection();
  document.execCommand("fontSize", false, parseInt(fontSize.value, 10) / 2);
};
const applyColor = () => {
  restoreSelection();
  document.execCommand("foreColor", false, fontColor.value);
};
const applyHeading = () => {
  restoreSelection();
  document.execCommand("formatBlock", false, heading.value);
};

// 保存选区的变量
let savedRange = null;

// 保存选区
const saveSelection = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0);
  }
};

// 恢复选区
const restoreSelection = () => {
  if (savedRange) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
};


// 方法：插入占位符
const insertUserInfo = () => {
  if (selectedUserInfo.value) {
    restoreSelection();
    const placeholder = `【${selectedUserInfo.value}】`;
    document.execCommand("insertText", false, placeholder);
    selectedUserInfo.value = null; // 清空选中值
  }
};

const insertImage = () => {
  pictureDialogVisible.value = true;
};
// 方法：插入图片
const confirmSelection = () => {
  pictureDialogVisible.value = false;
  // 恢复选区
  restoreSelection();
  // 创建图片元素
  const img = document.createElement("img");
  img.src = "src/assets/a.png"; // 替换为你的图片链接
  img.alt = "插入的图片";
  img.style.maxWidth = "100%"; // 设置图片样式
  img.style.height = "auto";

  // 在选区插入图片
  if (savedRange) {
    //savedRange.deleteContents(); // 删除选区内容（如果需要）
    savedRange.insertNode(img); // 插入图片
    savedRange.collapse(false); // 将光标定位到图片后面
  }
};

const insertLink = () => {
  const url = prompt("请输入链接地址：");
  if (url) {
    document.execCommand("createLink", false, url);
  }
};
</script>

<style scoped>
.email-editor {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.editor {
  min-height: 300px;
  padding: 10px;
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  background-color: #fff;
  overflow-y: auto;
}

.editor:empty::before {
  content: attr(placeholder);
  color: #ccc;
  font-style: italic;
}

.unsubscribe-link {
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: gray;
  border-top: 1px solid #ddd;
  background-color: #f9f9f9;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.el-button-group button {
  margin-right: 10px;
}

.el-select,
.el-color-picker {
  width: 100px;
}

.el-dropdown {
  margin-right: 5px;
}

.icon-bold::before {
  content: "B";
  font-weight: bold;
}

.icon-italic::before {
  content: "I";
  font-style: italic;
}

.icon-underline::before {
  content: "U";
  text-decoration: underline;
}

.icon-align-left::before {
  content: "←";
}

.icon-align-center::before {
  content: "↔";
}

.icon-align-right::before {
  content: "→";
}

.icon-indent::before {
  content: "⇥";
}

.icon-outdent::before {
  content: "⇤";
}

.icon-image::before {
  content: "📷";
}

.icon-link::before {
  content: "🔗";
}
</style>

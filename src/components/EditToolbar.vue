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
      <el-select v-model="fontFamily" placeholder="字体" @change="applyFont">
        <el-option v-for="font in fonts" :key="font" :label="font" :value="font"></el-option>
      </el-select>
      <el-select v-model="fontSize" placeholder="大小" @change="applyFontSize">
        <el-option v-for="size in fontSizes" :key="size" :label="size" :value="size"></el-option>
      </el-select>
      <el-color-picker v-model="fontColor" @change="applyColor"></el-color-picker>

      <!-- 段落设置 -->
      <el-select v-model="heading" placeholder="标题" @change="applyHeading">
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
      <el-select v-model="selectedUserInfo" placeholder="插入信息" @change="insertUserInfo">
        <el-option v-for="info in userInfos" :key="info" :label="info" :value="info"></el-option>
      </el-select>
      <el-button @click="insertImage"><i class="icon-image"></i> 图片</el-button>
      <el-button @click="insertLink"><i class="icon-link"></i> 链接</el-button>

    </div>

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

// 绑定值
const fontFamily = ref(null);
const fontSize = ref(null);
const fontColor = ref("#000");
const heading = ref(null);
const selectedUserInfo = ref(null);
const editor = ref(null);
const templateData = ref("");

// 模板内容数据
const templates = {
  public: {
    1: "<p>这是一个空白模板。</p>",
    2: "<h1>商品促销模板</h1><p>这是商品促销的内容。</p>",
    3: "<h2>跟进模板</h2><p>跟进模板的内容部分。</p>",
    4: "<h3>节日模板</h3><p>节日问候内容。</p>",
    5: "<h4>生日模板</h4><p>祝您生日快乐！</p>",
  },
  personal: {
    1: "<p>个人模板1内容。</p>",
    2: "<p>个人模板2内容。</p>",
    3: "<p>个人模板3内容。</p>",
    4: "<p>个人模板4内容。</p>",
    5: "<p>个人模板5内容。</p>",
  },
};

// 方法实现
onMounted(() => {

});

watch(
  () => props.data,
  (newValue) => {
    console.log("父组件数据变化：", newValue);
    // 数据处理逻辑
    templateData.value = parseInt(newValue);// 转换为数字
    editor.value.innerHTML = templates.public[templateData.value];
  },
);

const applyStyle = (command) => {
  document.execCommand(command, false, null); // 执行富文本命令
};

const applyFont = () => {
  document.execCommand("fontName", false, fontFamily.value);
};

const applyFontSize = () => {
  document.execCommand("fontSize", false, parseInt(fontSize.value, 10) / 2); // 字号转换
};

const applyColor = () => {
  document.execCommand("foreColor", false, fontColor.value);
};

const applyHeading = () => {
  document.execCommand("formatBlock", false, heading.value);
};

// 插入用户信息
const insertUserInfo = () => {
  if (selectedUserInfo.value) {
    document.execCommand("insertText", false, selectedUserInfo.value);
    selectedUserInfo.value = null; // 清空选中项
  }
};

const insertImage = () => {
  const url = prompt("请输入图片链接：");
  if (url) {
    document.execCommand("insertImage", false, url);
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
  gap: 1em;
  padding: 1em;
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

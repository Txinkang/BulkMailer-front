<template>
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
    <el-dropdown>
      <el-button type="primary">
        用户信息<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu>
        <el-dropdown-item @click="insertText('用户姓名')">用户姓名</el-dropdown-item>
        <el-dropdown-item @click="insertText('公司')">公司</el-dropdown-item>
        <el-dropdown-item @click="insertText('联系方式')">联系方式</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-button @click="insertImage"><i class="icon-image"></i> 照片</el-button>
    <el-button @click="insertLink"><i class="icon-link"></i> 链接</el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 数据定义
const fonts = ["Arial", "Georgia", "Times New Roman", "Verdana"];
const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];
const headings = [
  { label: "正文", value: "p" },
  { label: "标题1", value: "h1" },
  { label: "标题2", value: "h2" },
  { label: "标题3", value: "h3" },
];

// 绑定值
const fontFamily = ref(null);
const fontSize = ref(null);
const fontColor = ref("#000");
const heading = ref(null);

// 方法实现
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

const insertText = (text) => {
  document.execCommand("insertText", false, text);
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

/*.el-button-group button {
  margin-right: 1em;
}*/

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

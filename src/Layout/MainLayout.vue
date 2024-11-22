<template>
  <div class="layout-container">
    <!-- Header -->
    <el-header class="layout-header">
      <div class="header-left">
        <div>{{companyName}}</div>
        <div>邮件群发助手</div>
      </div>
      <div class="header-right">
        <div>用户：{{ username }}</div>
        <div>{{ company }} - {{ department }} - {{ position }}</div>
      </div>
    </el-header>

    <div class="layout-main">
      <!-- Sidebar -->
      <aside class="layout-sidebar">
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
          class="el-menu-vertical"
        >
          <el-menu-item class="menu-item" index="/sendEmail">发送邮件</el-menu-item>
          <el-menu-item class="menu-item" index="/autoEmail">自动邮件管理</el-menu-item>
          <el-menu-item class="menu-item" index="/uploadFile">上传文件</el-menu-item>
          <el-menu-item class="menu-item" index="/emailHistory">邮件历史</el-menu-item>
        </el-menu>
      </aside>

      <!-- Content -->
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const activeMenu = ref(route.path);
//公司信息
const companyName = "天津市易架构信息科技有限公司";

// 用户信息
const username = "张三";
const company = "天津市易架构信息科技有限公司";
const department = "研发部";
const position = "前端开发工程师";

function handleMenuSelect(index) {
  router.push(index);
}
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-header {
  height: 15%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background-color: #409eff;
  color: white;

}

.header-left div {
  font-size: 0.3em;
  font-weight: bold;
  text-align: center;
}

.header-right div {
  font-size: 0.2em;
  text-align: right;
}

.layout-main {
  display: flex;
  flex: 1;
}

.layout-sidebar {
  width: 3em;
  background-color: #f5f5f5;
}

.layout-content {
  flex: 1;
  padding: 20px;
}

.menu-item{
  border: 1px solid #dcdfe6; /* 默认边框颜色 */
}
</style>

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
          class="menu-scrollable"
        >
          <!-- 顶级菜单 -->
          <el-menu-item class="menu-item" index="/sendEmail">发送邮件</el-menu-item>
          <el-menu-item class="menu-item" index="/fileManage">文件管理</el-menu-item>

          <!-- 邮件管理 -->
          <el-sub-menu index="email-management">
            <template #title>
              <span>邮件管理</span>
            </template>
            <el-menu-item class="menu-item" index="/autoEmail">自动发送邮件管理</el-menu-item>
            <el-menu-item class="menu-item" index="/emailHistory">历史记录管理</el-menu-item>
            <el-menu-item class="menu-item" index="/templateManage">邮件模版管理</el-menu-item>
          </el-sub-menu>

          <!-- 发件方管理 -->
          <el-sub-menu index="sender-management">
            <template #title>
              <span>发件方管理</span>
            </template>
            <el-menu-item class="menu-item" index="/companyManage">公司管理</el-menu-item>
            <el-menu-item class="menu-item" index="/sectorManage">部门管理</el-menu-item>
            <el-menu-item class="menu-item" index="/jobManage">岗位管理</el-menu-item>
            <el-menu-item class="menu-item" index="/userManage">用户管理</el-menu-item>
          </el-sub-menu>

          <!-- 收件方管理 -->
          <el-sub-menu index="receiver-management">
            <template #title>
              <span>收件方管理</span>
            </template>
              <el-menu-item class="menu-item" index="/supplierManage">供应商管理</el-menu-item>
              <el-menu-item class="menu-item" index="/customerManage">客户管理</el-menu-item>
          </el-sub-menu>

          <!-- 地域管理 -->
          <el-sub-menu index="dictionary-management">
            <template #title>
              <span>字典管理</span>
            </template>
            <el-menu-item class="menu-item" index="/companyManage?user=receiver">公司管理</el-menu-item>
            <el-menu-item class="menu-item" index="/sectorManage?user=receiver">部门管理</el-menu-item>
            <el-menu-item class="menu-item" index="/jobManage?user=receiver">岗位管理</el-menu-item>
            <el-menu-item class="menu-item" index="/commodityManage">商品管理</el-menu-item>
            <el-menu-item class="menu-item" index="/countryManage">国家管理</el-menu-item>
            <el-menu-item class="menu-item" index="/areaManage">区域管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item class="menu-item" index="/serverConfig">邮件服务器管理</el-menu-item>

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
const companyName = "易架构";

// 用户信息
const username = "张三";
const company = "公司";
const department = "部门";
const position = "岗位";

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
.menu-scrollable {
  max-height: 700px; /* 设置菜单最大高度 */
  overflow-y: auto; /* 启用垂直滚动条 */
  border: 1px solid #e6e6e6; /* 可选：增加边框以区分菜单区域 */
}

/* 可选：美化滚动条 */
.menu-scrollable::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

.menu-scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1; /* 滚动条颜色 */
  border-radius: 4px; /* 滚动条圆角 */
}

.menu-scrollable::-webkit-scrollbar-thumb:hover {
  background: #a6a6a6; /* 滚动条悬停颜色 */
}

.menu-scrollable::-webkit-scrollbar-track {
  background: #f5f5f5; /* 滚动条轨道颜色 */
}
.menu-item,.el-sub-menu{
  border-bottom: 1px solid #dcdfe6; /* 默认边框颜色 */
}
</style>

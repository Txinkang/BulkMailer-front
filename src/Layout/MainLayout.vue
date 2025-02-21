<template>
  <div class="layout-container">
    <!-- Header -->
    <el-header class="layout-header">
      <div class="header-left">
        <div>{{title}}</div>
        <div>邮件群发助手</div>
        <div>小管理端</div>
      </div>
      <div class="header-right">
        <div>用户：{{ username }}</div>
        <div>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
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
          <!-- 发送管理 -->
          <el-menu-item class="menu-item" index="/sendEmail" v-if="hasPermission(1)">手动发送</el-menu-item>
          <el-menu-item class="menu-item" index="/circleSend" v-if="hasPermission(2)">循环发送</el-menu-item>

          <!-- 文件管理 -->
          <el-menu-item class="menu-item" index="/fileManage" v-if="hasPermission(3)">文件管理</el-menu-item>

          <!-- 邮件管理 -->
          <el-sub-menu index="email-management" v-if="hasPermission(4) || hasPermission(5) || hasPermission(6)">
            <template #title>
              <span>邮件管理</span>
            </template>
            <el-menu-item class="menu-item" index="/emailTask" v-if="hasPermission(4)">邮件任务管理</el-menu-item>
            <el-menu-item class="menu-item" index="/emailHistory" v-if="hasPermission(5)">历史记录管理</el-menu-item>
            <el-menu-item class="menu-item" index="/templateManage" v-if="hasPermission(6)">邮件模版管理</el-menu-item>
          </el-sub-menu>

          <!-- 报表管理 -->
          <el-sub-menu index="report-management" v-if="hasPermission(7) || hasPermission(8)">
            <template #title>
              <span>报表管理</span>
            </template>
            <el-menu-item class="menu-item" index="/totalReport" v-if="hasPermission(7)">综合报表</el-menu-item>
            <el-menu-item class="menu-item" index="/singleReport" v-if="hasPermission(8)">任务报表</el-menu-item>
          </el-sub-menu>

          <!-- 发件方管理 -->
          <el-sub-menu index="sender-management" v-if="hasPermission(9)">
            <template #title>
              <span>发件方管理</span>
            </template>
            <el-menu-item class="menu-item" index="/userManage" v-if="hasPermission(9)">用户管理</el-menu-item>
          </el-sub-menu>

          <!-- 收件方管理 -->
          <el-sub-menu index="receiver-management" v-if="hasPermission(10) || hasPermission(11)">
            <template #title>
              <span>收件方管理</span>
            </template>
            <el-menu-item class="menu-item" index="/supplierManage" v-if="hasPermission(10)">供应商管理</el-menu-item>
            <el-menu-item class="menu-item" index="/customerManage" v-if="hasPermission(11)">客户管理</el-menu-item>
          </el-sub-menu>

          <!-- 字典管理 -->
          <el-sub-menu index="dictionary-management" v-if="hasPermission(12) || hasPermission(13) || hasPermission(14) || hasPermission(15)">
            <template #title>
              <span>字典管理</span>
            </template>
            <el-menu-item class="menu-item" index="/emailType" v-if="hasPermission(12)">邮件类型管理</el-menu-item>
            <el-menu-item class="menu-item" index="/commodityManage" v-if="hasPermission(13)">商品管理</el-menu-item>
            <el-menu-item class="menu-item" index="/countryManage" v-if="hasPermission(14)">国家管理</el-menu-item>
            <el-menu-item class="menu-item" index="/areaManage" v-if="hasPermission(15)">区域管理</el-menu-item>
          </el-sub-menu>

          <!-- 服务器配置 -->
          <el-menu-item class="menu-item" index="/serverConfig" v-if="hasPermission(16)">邮件服务器管理</el-menu-item>

        </el-menu>


      </aside>

      <!-- Content -->
      <main class="layout-content">
        <!-- <router-view /> -->
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserConstantData from "@/constants/UserConstantData.js";
import { useUserStore } from '@/store/user/user.js'
import { ElMessageBox } from 'element-plus'
import { userApi } from '@/api/user/user.js'
import { errorHandler } from '@/utils/errorHandler.js';


const router = useRouter();
const route = useRoute();
const activeMenu = ref(route.path);

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  }
);

// 标题信息
const title = UserConstantData.title;
// 用户信息
const username = UserConstantData.getUserName();

function handleLogout() {
  ElMessageBox.confirm('确认退出登录吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const logoutRes = await userApi.logout()
      if(logoutRes.code === 200){
        const userStore = useUserStore()
        userStore.clearUserInfo()
        router.replace('/login')
      }else{
        errorHandler.showError('退出登录失败,请重试', logoutRes)
      }
    } catch (error) {
      console.log("退出登录失败,尝试绕过请求自动退出",error);
      // 手动清除本地存储
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_auth')
      localStorage.removeItem('token_expiry')
      // 强制跳转登录页
      router.replace('/login')
    }
  }).catch(() => {
    // 取消退出时不做任何操作
  })
}

function handleMenuSelect(index) {
  router.push(index);
}

// 添加权限检查方法
function hasPermission(authId) {
  const userAuth = JSON.parse(localStorage.getItem('user_auth') || '[]')
  return userAuth.some(auth => auth.user_auth_id === authId.toString())
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
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 2px;
  font-size: 15px;
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

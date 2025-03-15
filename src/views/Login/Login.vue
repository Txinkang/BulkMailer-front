<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">邮件群发登录页面</h2>
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="loginForm.userAccount"
            placeholder="请输入用户账号"
            clearable
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.userPassword"
            placeholder="请输入用户密码"
            show-password
            clearable
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label-position="left">
          <el-button size="large" type="default" @click="onReset">
            重置
          </el-button>
          <el-button type="primary" size="large" @click="onSubmit" :disabled="!loginForm.userAccount || !loginForm.userPassword">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import {reactive} from "vue";
import router from "@/router/index.js";
import { userApi } from '@/api/user/user.js';
import { useUserStore } from '@/store/user/user.js';
import UserConstantData from '@/constants/UserConstantData.js';
import { errorHandler } from '@/utils/errorHandler.js';

defineOptions({
  name: 'LoginView'
})

const userStore = useUserStore()
const loginForm = reactive({
  userRole: UserConstantData.userRole,
  userAccount: "",
  userPassword: "",
});

const loginFormRules = {
  userAccount: [{ required: true, message: "请输入用户账号", trigger: "blur" }],
  userPassword: [{ required: true, message: "请输入用户密码", trigger: "blur" }],
};

const onSubmit = async () => {
  try {
    console.log(loginForm)
    const response = await userApi.login(loginForm)
    console.log("登录响应：", response);
    if (response.code === 200) {
      // 存储用户信息到本地
      userStore.setUserInfo(response.data)
      router.replace("/MainLayout")
    } else if (response.code === 401) {
      errorHandler.showError('账号或密码有误', response)
    } else if (response.code === 405) {
      errorHandler.showError('该用户不存在', response)
    } else if (response.code === 406) {
      errorHandler.showError('密码错误', response)
    } else if (response.code === 500) {
      errorHandler.showError('系统错误,请重试', response)
    }else{
      errorHandler.showError('未知错误,请重试', response)
    }
  } catch (err) {
    errorHandler.showError('登录错误', err)
  }
}

const onReset = () => {
  loginForm.userAccount = "";
  loginForm.userPassword = "";
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('/src/assets/a.png') no-repeat center center fixed;
  background-size: cover;
}


.login-box {
  width: 400px;
  padding: 40px 20px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.login-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.el-input {
  font-size: 14px;
}

</style>

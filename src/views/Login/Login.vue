<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">邮件群发登录页面</h2>
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label-position="left">
          <el-button size="large" type="default" @click="onReset">重置</el-button>
          <el-button type="primary" size="large" @click="onSubmit">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import router from "@/router/index.js";

const loginForm = reactive({
  username: "",
  password: "",
});

const loginFormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

function onSubmit() {
  console.log("登录表单：", loginForm);
  router.replace("/MainLayout")
}

function onReset() {
  loginForm.username = "";
  loginForm.password = "";
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

<template>
  <div class="dashboard-container">
    <h1>Welcome to the Dashboard</h1>
    <el-button type="primary" @click="logout">Logout</el-button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function logout() {
  router.push("/");
}
</script>

<style scoped>
.dashboard-container {
  text-align: center;
  margin-top: 50px;
}
</style>

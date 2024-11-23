<template>
  <div class="supplier-container">
    <!-- 顶部按钮 -->
    <div class="button-group">
      <el-button type="primary" @click="openCreateDialog">新建客户</el-button>
      <el-button type="default">导入</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="supplierData" border style="width: 100%">
      <!-- 客户名称 -->
      <el-table-column label="客户名称" align="left" min-width="200">
        <template #default="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <!-- 查看按钮 -->
      <el-table-column label="操作" align="center" min-width="100">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openViewDialog">查看</el-button>
        </template>
      </el-table-column>

      <!-- 删除按钮 -->
      <el-table-column label="操作" align="center" min-width="100">
        <template #default="{ row }">
          <el-button type="danger" size="small" >删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 新建客户对话框 -->
    <el-dialog title="新建客户" v-model="createDialogVisible" width="40%">
      <el-form label-width="120px">
        <el-form-item label="客户名称">
          <el-input placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input placeholder="请输入地址" />
        </el-form-item>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看客户对话框 -->
    <el-dialog title="查看客户" v-model="viewDialogVisible" width="40%">
      <el-form label-width="120px">
        <el-form-item label="客户名称">
          <el-input placeholder="客户名称" disabled />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input placeholder="联系方式" disabled />
        </el-form-item>
        <el-form-item label="地址">
          <el-input placeholder="地址" disabled />
        </el-form-item>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="viewDialogVisible = false">取消</el-button>
        <el-button type="primary">修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 响应式状态
import { ref } from "vue";

// 客户数据
const supplierData = [
  { name: "客户A" },
  { name: "客户B" },
  { name: "客户C" },
  { name: "客户D" },
];

// 对话框可见性
const createDialogVisible = ref(false);
const viewDialogVisible = ref(false);

// 打开新建客户对话框
const openCreateDialog = () => {
  createDialogVisible.value = true;
};

// 打开查看客户对话框
const openViewDialog = () => {
  viewDialogVisible.value = true;
};
</script>

<style scoped>
.supplier-container {
  margin: 20px;
}

.button-group {
  margin-bottom: 20px;
}
</style>

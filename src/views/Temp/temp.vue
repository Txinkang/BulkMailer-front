<template>
  <!-- 查看按钮列 -->
  <el-table-column label="操作" align="center" min-width="150">
    <template #default="{ row }">
      <el-button type="primary" size="small" @click="openDialog(row)">查看</el-button>
      <el-button type="warning" size="small" @click="openUpdateUserDialog">修改</el-button>
      <el-button type="danger" size="small">删除</el-button>
    </template>
  </el-table-column>


  <!-- 可见范围单选按钮组 -->
  <el-form-item label="可见范围：">
    <el-radio-group v-model="uploadRange">
      <el-radio label="公司">公司</el-radio>
      <el-radio label="部门">部门</el-radio>
      <el-radio label="岗位">岗位</el-radio>
      <el-radio label="仅自己">仅自己</el-radio>
    </el-radio-group>
  </el-form-item>
  <!-- 可见范围选项组 -->
  <el-form-item style="width: 300px">
    <el-select v-if="uploadRange !== '仅自己'" placeholder="公司">
      <el-option value="公司"></el-option>
    </el-select>
    <el-select v-if="uploadRange === '部门' || uploadRange ==='岗位' " placeholder="部门">
      <el-option value="部门"></el-option>
    </el-select>
    <el-select v-if="uploadRange === '岗位' " placeholder="岗位">
      <el-option value="岗位"></el-option>
    </el-select>
  </el-form-item>
</template>

<script setup>
// 响应式状态
import { ref } from "vue";
import {Plus, Search} from "@element-plus/icons-vue";

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalData = ref(30);
// 对话框控制
const supplierDialogVisible = ref(false);

// 动态商品选择项
const items = ref([{ category: "", product: "" }]);

// 打开对话框
const supplierOpenDialog = () => {
  supplierDialogVisible.value = true;
};

// 添加商品选择项
const addItem = () => {
  items.value.push({ category: "", product: "" });
};
// 供应商数据
const supplierData = [
  { name: "供应商A" },
  { name: "供应商B" },
  { name: "供应商C" },
  { name: "供应商D" },
];

// 对话框可见性
const createDialogVisible = ref(false);
const viewDialogVisible = ref(false);

// 打开新建供应商对话框
const openCreateDialog = () => {
  createDialogVisible.value = true;
};

// 打开查看供应商对话框
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

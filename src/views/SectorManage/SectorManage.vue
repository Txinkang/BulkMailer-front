<template>
  <div class="container">
    <!-- 两个下拉菜单 -->
    <el-form label-width="120px" inline>
      <!-- 所属公司 -->
      <el-form-item label="所属公司">
        <el-select v-model="selectedCompany" placeholder="请选择公司">
          <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
        </el-select>
      </el-form-item>

      <!-- 所属部门 -->
      <el-form-item label="所属部门">
        <el-select v-model="selectedDepartment" placeholder="请选择部门">
          <el-option
            v-for="department in departments"
            :key="department"
            :label="department"
            :value="department"
          />
        </el-select>
      </el-form-item>

      <!-- 创建部门按钮 -->
      <el-form-item>
        <el-button type="primary" @click="openDialog">创建部门</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" border style="width: 100%">
      <!-- 公司名称列 -->
      <el-table-column label="公司名称" align="left" min-width="200">
        <template #default="{ row }">
          <span>{{ row.company }}</span>
        </template>
      </el-table-column>

      <!-- 部门名称列 -->
      <el-table-column label="部门名称" align="left" min-width="200">
        <template #default="{ row }">
          <span>{{ row.department }}</span>
        </template>
      </el-table-column>

      <!-- 删除操作列 -->
      <el-table-column label="操作" align="center" min-width="100">
        <template #default="{ row }">
          <el-button type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建部门对话框 -->
    <el-dialog
      title="创建部门"
      v-model="dialogVisible"
      width="40%"
      @close="resetDialog"
    >
      <el-form label-width="120px">
        <!-- 公司名称下拉菜单 -->
        <el-form-item label="公司名称">
          <el-select v-model="newDepartment.company" placeholder="请选择公司">
            <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
          </el-select>
        </el-form-item>

        <!-- 部门名称输入框 -->
        <el-form-item label="部门名称">
          <el-input v-model="newDepartment.name" placeholder="请输入部门名称" />
        </el-form-item>

        <!-- 岗位名称输入框 -->
        <el-form-item label="岗位名称">
          <el-input v-model="newDepartment.position" placeholder="请输入岗位名称" />
        </el-form-item>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="createDepartment">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 下拉菜单数据
const companies = ["公司A", "公司B", "公司C"];
const departments = ["部门1", "部门2", "部门3"];
// 表格的静态数据
const tableData = [
  { company: "公司A", department: "部门1" },
  { company: "公司B", department: "部门2" },
  { company: "公司C", department: "部门3" },
  { company: "公司D", department: "部门4" },
];

// 所属公司和部门
const selectedCompany = ref(null);
const selectedDepartment = ref(null);

// 创建部门对话框的状态
const dialogVisible = ref(false);

// 新部门信息
const newDepartment = ref({
  company: null,
  name: "",
  position: "",
});

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true;
};

// 关闭对话框并重置数据
const closeDialog = () => {
  dialogVisible.value = false;
  resetDialog();
};

// 重置对话框内容
const resetDialog = () => {
  newDepartment.value = { company: null, name: "", position: "" };
};

// 创建部门
const createDepartment = () => {
  console.log("新部门信息：", newDepartment.value);
  closeDialog();
};
</script>

<style scoped>
.container {
  margin: 20px;
}
</style>

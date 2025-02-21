<template>
  <div class="company-container">
    <!-- 顶部按钮 -->
    <div class="button-group">
      <el-button type="primary" @click="openCreateDialog">创建岗位</el-button>
      <el-button>导入</el-button>
    </div>

    <!-- 搜索框 -->
    <div style="display: flex;flex-direction: row;">
      <el-input
        v-model="searchText"
        placeholder="请搜索岗位名称"
        clearable
        class="search-box"
      >
        <template #append>
          <el-button>
            <el-icon>
              <Search></Search>
            </el-icon>
          </el-button>
        </template>
      </el-input>
      <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <!-- 岗位名称列 -->
      <el-table-column prop="companyName" label="岗位名称" min-width="200" />

      <!-- 查看按钮列 -->
      <el-table-column label="操作" align="center" min-width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDialog(row)">查看</el-button>
          <el-button type="warning" size="small" @click="openUpdateDialog">修改</el-button>
          <el-button type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="totalData"
      layout="prev, pager, next"
      class="pagination"
      background
    />

    <!-- 查看岗位对话框 -->
    <el-dialog title="岗位详情" v-model="dialogVisible" width="50%">
      <el-form label-width="120px">
        <!-- 公司名称 -->
        <el-form-item label="公司名称">
          <el-input v-model="dialogData.companyName" disabled />
        </el-form-item>

        <!-- 部门信息 -->
        <el-form-item label="部门名称">
          <el-input v-model="dialogData.companyName" disabled />
        </el-form-item>

        <!-- 岗位信息 -->
        <el-form-item label="岗位名称">
          <el-input v-model="dialogData.companyName" disabled />
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 创建岗位对话框 -->
    <el-dialog title="创建岗位" v-model="createDialogVisible" width="40%">
      <el-form label-width="120px">
        <el-form-item label="公司名称">
          <el-select v-model="newDepartment.company" placeholder="请选择公司">
            <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
          </el-select>
        </el-form-item>

        <!-- 部门名称输入框 -->
        <el-form-item label="部门名称">
          <el-select v-model="newDepartment.company" placeholder="请选择部门">
            <el-option value="部门" />
            <el-option value="部门" />
          </el-select>
        </el-form-item>

        <!-- 岗位名称输入框 -->
        <el-form-item label="岗位名称">
          <el-input placeholder="请输入岗位名称"/>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改岗位对话框 -->
    <el-dialog title="修改岗位" v-model="updateDialogVisible" width="40%">
      <el-form label-width="120px">
        <el-form-item label="岗位名称">
          <el-input placeholder="请输入岗位名称" />
        </el-form-item>
        <!-- 公司名称选择框 -->
        <el-form-item v-if="user === 'receiver'" label="公司名称">
          <el-select  placeholder="请选择公司">
            <el-option value="公司" />
            <el-option value="公司" />
          </el-select>
        </el-form-item>
        <!-- 部门名称选择框 -->
        <el-form-item v-if="user === 'receiver'" label="部门名称">
          <el-select  placeholder="请选择部门">
            <el-option value="部门" />
            <el-option value="部门" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {Search} from "@element-plus/icons-vue";
import {useRoute} from "vue-router";

const route = useRoute();
const user = computed(()=>route.query.user)
// 顶部按钮
const createDialogVisible = ref(false);
const updateDialogVisible = ref(false);

const openCreateDialog = () => {
  createDialogVisible.value = true;
};
const openUpdateDialog = () => {
  updateDialogVisible.value = true;
};

// 标签页
const activeTab = ref("view");

// 搜索框
const searchText = ref("");

// 表格数据
const tableData = [
  { companyName: "岗位A" },
  { companyName: "岗位B" },
  { companyName: "岗位C" },
];
// 新岗位信息
const newDepartment = ref({
  company: null,
  name: "",
  position: "",
});
const companies = ["公司A", "公司B", "公司C"];

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalData = ref(30);

// 查看对话框
const dialogVisible = ref(false);
const dialogData = ref({
  companyName: "公司名称",
  departments: [
    {
      name: "岗位1",
      positions: ["岗位A", "岗位B"],
    },
  ],
});

// 岗位分页
const departmentPage = ref(1);


// 打开查看公司对话框
const openDialog = (row) => {
  dialogData.value.companyName = row.companyName;
  departmentPage.value = 1; // 重置到第一页
  dialogVisible.value = true;
};
</script>

<style scoped>
.company-container {
  padding: 20px;
}

.button-group {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-box {
  width: 20em;
  margin-bottom: 20px;
  margin-right: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.menu-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.menu-item {
  flex: 1;
  margin: 0 10px;
}

.department-pagination {
  margin-top: 10px;
  text-align: right;
}
</style>

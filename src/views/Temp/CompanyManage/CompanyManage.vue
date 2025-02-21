<template>
  <div class="company-container">
    <!-- 顶部按钮 -->
    <div class="button-group">
      <el-button type="primary" @click="openCreateDialog">创建公司</el-button>
      <el-button>导入</el-button>
    </div>

    <!-- 搜索框 -->
    <div style="display: flex;flex-direction: row;">
      <el-input
        v-model="searchText"
        placeholder="请搜索公司名称"
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
      <!-- 公司名称列 -->
      <el-table-column prop="companyName" label="公司名称" min-width="200" />

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

    <!-- 查看公司对话框 -->
    <el-dialog title="公司详情" v-model="dialogVisible" width="50%">
      <el-form label-width="120px">
        <!-- 公司名称 -->
        <el-form-item label="公司名称">
          <el-input v-model="dialogData.companyName" disabled />
        </el-form-item>

        <!-- 部门信息（菜单形式） -->
        <el-form-item label="部门信息">
          <div>
            <el-menu style="display: flex;flex-direction: row">
              <el-sub-menu index="sender-management">
                <template #title>
                  <span>部门</span>
                </template>
                <el-menu-item >岗位</el-menu-item>
                <el-menu-item >岗位</el-menu-item>
                <el-menu-item >岗位</el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="sender-management">
                <template #title>
                  <span>部门</span>
                </template>
                <el-menu-item >岗位</el-menu-item>
                <el-menu-item >岗位</el-menu-item>
                <el-menu-item >岗位</el-menu-item>
              </el-sub-menu><el-sub-menu index="sender-management">
              <template #title>
                <span>部门</span>
              </template>
              <el-menu-item >岗位</el-menu-item>
              <el-menu-item >岗位</el-menu-item>
              <el-menu-item >岗位</el-menu-item>
            </el-sub-menu>
            </el-menu>
          </div>
        </el-form-item>
        <div style="display: flex;flex-direction: row;justify-content: center">
          <!-- 部门分页 -->
          <el-pagination
            v-model:current-page="departmentPage"
            :page-size="3"
            :total="dialogData.departments.length"
            layout="prev, pager, next"
            small
            class="department-pagination"
            background
          />
        </div>
      </el-form>
    </el-dialog>

    <!-- 创建公司对话框 -->
    <el-dialog title="创建公司" v-model="createDialogVisible" width="50%">
      <el-form label-width="120px">
        <!-- 公司名称 -->
        <el-form-item label="公司名称">
          <el-input placeholder="请输入公司名称" />
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>
    <!-- 修改公司对话框 -->
    <el-dialog title="修改公司" v-model="updateDialogVisible" width="40%">
      <el-form label-width="120px">
        <el-form-item label="公司名称">
          <el-input placeholder="请输入公司名称" />
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
import {Plus, Search} from "@element-plus/icons-vue";
import {useRoute} from "vue-router";

const route = useRoute();
const user = computed(()=>route.query.user)
const selectedProduct = ref([]);
// 动态商品选择项
const items = ref([{ category: "", product: "" }]);
const productOptions = [
  {
    value: "电子产品",
    label: "电子产品",
    children: [
      { value: "手机", label: "手机" },
      { value: "电脑", label: "电脑" },
      { value: "耳机", label: "耳机" },
    ],
  },
  {
    value: "家电",
    label: "家电",
    children: [
      { value: "冰箱", label: "冰箱" },
      { value: "电视", label: "电视" },
    ],
  },
];
// 添加商品选择项
const addItem = () => {
  items.value.push({ category: "", product: "" });
};
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
  { companyName: "公司A" },
  { companyName: "公司B" },
  { companyName: "公司C" },
];

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalData = ref(30);

// 查看对话框
const dialogVisible = ref(false);
const dialogData = ref({
  companyName: "",
  departments: [
    {
      name: "部门1",
      positions: ["岗位A", "岗位B"],
    },
    {
      name: "部门2",
      positions: ["岗位C", "岗位D", "岗位E"],
    },
    {
      name: "部门3",
      positions: ["岗位F", "岗位G"],
    },
    {
      name: "部门4",
      positions: ["岗位H", "岗位I", "岗位J"],
    },
    {
      name: "部门5",
      positions: ["岗位K"],
    },
    {
      name: "部门6",
      positions: ["岗位L", "岗位M"],
    },
  ],
});

// 部门分页
const departmentPage = ref(1);
const paginatedDepartments = computed(() => {
  const start = (departmentPage.value - 1) * 3;
  const end = start + 3;
  return dialogData.value.departments.slice(start, end);
});

// 岗位根据选中部门动态更新
const selectedDepartmentPositions = computed(() => {
  const selectedDepartment = paginatedDepartments.value[0]; // 选择当前页第一个部门
  return selectedDepartment ? selectedDepartment.positions : [];
});

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

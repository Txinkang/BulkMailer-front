<template>
  <div class="commodityManage">
    <div class="commodityManageContainer">
      <el-tabs class="commodityManageTabs">
        <el-tab-pane label="商品管理">
          <!-- 两个下拉菜单 -->
          <el-form label-width="120px" inline>
            <!-- 所属供应商 -->
            <el-form-item label="所属供应商">
              <el-select v-model="selectedCompany" placeholder="请选择供应商">
                <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
              </el-select>
            </el-form-item>

            <!-- 所属客户 -->
            <el-form-item label="所属客户">
              <el-select v-model="selectedDepartment" placeholder="请选择客户">
                <el-option
                  v-for="department in departments"
                  :key="department"
                  :label="department"
                  :value="department"
                />
              </el-select>
            </el-form-item>

            <!-- 所属品类  -->
            <el-form-item label="所属品类">
              <el-select v-model="category" placeholder="请选择品类">
                <el-option
                  v-for="department in departments"
                  :key="department"
                  :label="department"
                  :value="department"
                />
              </el-select>
            </el-form-item>

            <!-- 创建商品按钮 -->
            <el-form-item>
              <el-button type="primary" @click="openDialog">创建商品</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="tableData" border style="width: 100%">
            <!-- 供应商名称列 -->
            <el-table-column label="供应商名称" align="left" min-width="200">
              <template #default="{ row }">
                <span>{{ row.company }}</span>
              </template>
            </el-table-column>

            <!-- 品类名称列 -->
            <el-table-column label="品类名称" align="left" min-width="200">
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


          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalData"
            layout="prev, pager, next"
            background
          />
        </el-tab-pane>

        <el-tab-pane label="品类管理">
          <!-- 创建品类按钮 -->
          <el-form-item>
            <el-button type="primary" @click="openCategoryDialog">创建品类</el-button>
          </el-form-item>


          <el-table :data="tableData" border style="width: 100%">
            <!-- 品类名称列 -->
            <el-table-column label="品类名称" align="left" min-width="200">
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
        </el-tab-pane>
      </el-tabs>


      <!-- 创建商品对话框 -->
      <el-dialog
        title="创建商品"
        v-model="dialogVisible"
        width="40%"
        @close="resetDialog"
      >
        <el-form label-width="120px">
          <!-- 供应商名称下拉菜单 -->
          <el-form-item label="供应商名称">
            <el-select  placeholder="请选择供应商">
              <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
            </el-select>
          </el-form-item>

          <!-- 品类名称输入框 -->
          <el-form-item label="品类名称">
            <el-select  placeholder="请选择品类">
              <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
            </el-select>
          </el-form-item>

          <!-- 商品名称输入框 -->
          <el-form-item label="商品名称">
            <el-input  placeholder="请输入商品名称" />
          </el-form-item>
        </el-form>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="createDepartment">确定</el-button>
        </template>
      </el-dialog>

      <!-- 创建品类对话框 -->
      <el-dialog
        title="创建品类"
        v-model="categoryDialogVisible"
        width="40%"
        @close="resetDialog"
      >
        <el-form label-width="120px">
          <!-- 品类输入框 -->
          <el-form-item label="品类名称">
            <el-input  placeholder="请输入品类名称" />
          </el-form-item>
        </el-form>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="createDepartment">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>


<script setup>
// 下拉菜单数据
import {ref} from "vue";

const companies = ["供应商A", "供应商B", "供应商C"];
const departments = ["客户1", "客户2", "客户3"];
const category = ["品类1", "品类2", "品类3"];
// 表格的静态数据
const tableData = [
  { company: "供应商A", department: "品类1", user: "商品1"},
  { company: "供应商B", department: "品类2", user: "商品2" },
  { company: "供应商C", department: "品类3", user: "商品3" },
  { company: "供应商D", department: "品类4", user: "商品4" },
];
// 所属供应商和部门
const selectedCompany = ref(null);
const selectedDepartment = ref(null);
// 打开对话框
const openDialog = () => {
  dialogVisible.value = true;
};
const openCategoryDialog = () => {
  categoryDialogVisible.value = true;
};
// 创建商品对话框的状态
const dialogVisible = ref(false);
const categoryDialogVisible = ref(false);

// 关闭对话框并重置数据
const closeDialog = () => {
  dialogVisible.value = false;
};
</script>


<style scoped>

</style>

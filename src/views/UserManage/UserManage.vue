<template>
  <div class="company-container">
    <el-tabs>
      <el-tab-pane label="登录用户管理">
        <!-- 顶部按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="openCreateDialog">创建用户</el-button>
          <el-button>导入</el-button>
        </div>

        <!-- 搜索框 -->
        <div style="display: flex;flex-direction: row;">
          <el-input
            v-model="searchText"
            placeholder="请搜索用户名称"
            clearable
            class="search-box"
            style="width:200px;margin-right: 10px"
          >
            <template #append>
              <el-button>
                <el-icon>
                  <Search></Search>
                </el-icon>
              </el-button>
            </template>
          </el-input>
          <el-select v-model="selectedCompany" placeholder="选择公司" style="width:200px;margin-right: 10px">
            <el-option label="公司A" value="公司A"/>
            <el-option label="公司B" value="公司B"/>
          </el-select>
          <el-select v-model="selectedDepartment" placeholder="选择部门" style="width:200px;margin-right: 10px">
            <el-option label="部门1" value="部门1"/>
            <el-option label="部门2" value="部门2"/>
          </el-select>
          <el-select v-model="selectedPosition" placeholder="选择岗位" style="width:200px;margin-right: 10px">
            <el-option label="岗位A" value="岗位A"/>
            <el-option label="岗位B" value="岗位B"/>
          </el-select>
          <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
        </div>

        <!-- 表格 -->
        <el-table :data="tableData" border style="width: 100%">
          <!-- 用户名称列 -->
          <el-table-column prop="companyName" label="用户名称" min-width="200" />

          <!-- 查看按钮列 -->
          <el-table-column label="操作" align="center" min-width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="openDialog(row)">查看</el-button>
              <el-button type="warning" size="small" @click="openUpdateUserDialog">修改</el-button>
              <el-button v-if="user !== 'receiver'" type="warning" size="small" @click="openUpdateDialog">权限</el-button>
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
      </el-tab-pane>
      <el-tab-pane label="仅发送用户管理">
        <el-tabs type="border-card">
          <el-tab-pane label="私海用户">
            <!-- 顶部按钮 -->
            <div class="button-group">
              <el-button type="primary" @click="openCreateFakeUserDialog(0)">创建用户</el-button>
              <el-button>导入</el-button>
            </div>

            <!-- 搜索框 -->
            <div style="display: flex;flex-direction: row;">
              <el-input
                v-model="searchText"
                placeholder="请搜索用户名称"
                clearable
                class="search-box"
                style="width:200px;margin-right: 10px"
              >
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
              <el-select v-model="selectedCompany" placeholder="选择公司" style="width:200px;margin-right: 10px">
                <el-option label="公司A" value="公司A"/>
                <el-option label="公司B" value="公司B"/>
              </el-select>
              <el-select v-model="selectedDepartment" placeholder="选择部门" style="width:200px;margin-right: 10px">
                <el-option label="部门1" value="部门1"/>
                <el-option label="部门2" value="部门2"/>
              </el-select>
              <el-select v-model="selectedPosition" placeholder="选择岗位" style="width:200px;margin-right: 10px">
                <el-option label="岗位A" value="岗位A"/>
                <el-option label="岗位B" value="岗位B"/>
              </el-select>
              <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
            </div>

            <!-- 表格 -->
            <el-table :data="tableData" border style="width: 100%">
              <!-- 用户名称列 -->
              <el-table-column prop="companyName" label="用户名称" min-width="200" />

              <!-- 查看按钮列 -->
              <el-table-column label="操作" align="center" min-width="150">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="openDialog(row)">查看</el-button>
                  <el-button type="warning" size="small" @click="openUpdateFakeUserDialog">修改</el-button>
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
          </el-tab-pane>
          <el-tab-pane label="公海用户">
            <!-- 顶部按钮 -->
            <div class="button-group">
              <el-button type="primary" @click="openCreateFakeUserDialog(1)">创建用户</el-button>
              <el-button>导入</el-button>
            </div>

            <!-- 搜索框 -->
            <div style="display: flex;flex-direction: row;">
              <el-input
                v-model="searchText"
                placeholder="请搜索用户名称"
                clearable
                class="search-box"
                style="width:200px;margin-right: 10px"
              >
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
              <el-select v-model="selectedCompany" placeholder="选择公司" style="width:200px;margin-right: 10px">
                <el-option label="公司A" value="公司A"/>
                <el-option label="公司B" value="公司B"/>
              </el-select>
              <el-select v-model="selectedDepartment" placeholder="选择部门" style="width:200px;margin-right: 10px">
                <el-option label="部门1" value="部门1"/>
                <el-option label="部门2" value="部门2"/>
              </el-select>
              <el-select v-model="selectedPosition" placeholder="选择岗位" style="width:200px;margin-right: 10px">
                <el-option label="岗位A" value="岗位A"/>
                <el-option label="岗位B" value="岗位B"/>
              </el-select>
              <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
            </div>

            <!-- 表格 -->
            <el-table :data="tableData" border style="width: 100%">
              <!-- 用户名称列 -->
              <el-table-column prop="companyName" label="用户名称" min-width="200" />

              <!-- 查看按钮列 -->
              <el-table-column label="操作" align="center" min-width="150">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="openDialog(row)">查看</el-button>
                  <el-button type="warning" size="small" @click="openUpdateFakeUserDialog">修改</el-button>
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
          </el-tab-pane>
        </el-tabs>

      </el-tab-pane>
    </el-tabs>


    <!-- 查看用户对话框 -->
    <el-dialog title="用户详情" v-model="dialogVisible" width="50%">
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

        <!-- 用户名称信息 -->
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称" disabled/>
        </el-form-item>

        <!-- 用户邮箱信息 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="请输入用户邮箱" disabled/>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 创建用户对话框 -->
    <el-dialog title="创建用户" v-model="createDialogVisible" width="40%">
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
          <el-select v-model="newDepartment.company" placeholder="请选择岗位">
            <el-option value="岗位" />
            <el-option value="岗位" />
          </el-select>
        </el-form-item>

        <!-- 用户名称输入框 -->
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称"/>
        </el-form-item>

        <!-- 用户邮箱输入框 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="请输入用户邮箱"/>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>

    <!-- 创建假人用户对话框 -->
    <el-dialog title="创建用户" v-model="createFakeUserDialog" width="40%">
      <el-form label-width="120px">
        <!-- 可见范围单选按钮组 -->
        <el-form-item v-if="isPrivate === 0" label="所属范围：">
          <el-radio-group v-model="uploadRange">
            <el-radio label="公司">公司</el-radio>
            <el-radio label="部门">部门</el-radio>
            <el-radio label="岗位">岗位</el-radio>
            <el-radio label="仅自己">仅自己</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 可见范围选项组 -->
        <el-form-item v-if="isPrivate === 0" style="width: 300px">
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

        <!-- 用户名称输入框 -->
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称"/>
        </el-form-item>

        <!-- 用户邮箱输入框 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="请输入用户邮箱"/>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改用户权限框 -->
    <el-dialog title="修改用户权限" v-model="updateDialogVisible" width="40%">
      <el-form label-width="120px">
        <el-checkbox-group v-model="checked">
          <el-checkbox v-for="city in checkList" :key="city" :label="city" :value="city">
            {{ city }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改用户信息框 -->
    <el-dialog title="修改用户" v-model="updateUserDialog" width="40%">
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
          <el-select v-model="newDepartment.company" placeholder="请选择岗位">
            <el-option value="岗位" />
            <el-option value="岗位" />
          </el-select>
        </el-form-item>

        <!-- 用户名称输入框 -->
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称"/>
        </el-form-item>

        <!-- 用户邮箱输入框 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="请输入用户邮箱"/>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改假人用户信息框 -->
    <el-dialog title="修改用户" v-model="updateFakeUserDialog" width="40%">
      <el-form label-width="120px">

        <!-- 可见范围单选按钮组 -->
        <el-form-item v-if="isPrivate === 0" label="所属范围：">
          <el-radio-group v-model="uploadRange">
            <el-radio label="公司">公司</el-radio>
            <el-radio label="部门">部门</el-radio>
            <el-radio label="岗位">岗位</el-radio>
            <el-radio label="仅自己">仅自己</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 可见范围选项组 -->
        <el-form-item v-if="isPrivate === 0" style="width: 300px">
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

        <!-- 用户名称输入框 -->
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称"/>
        </el-form-item>

        <!-- 用户邮箱输入框 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="请输入用户邮箱"/>
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
//数据
const uploadRange = ref();
const isPrivate = ref(0);
// 对话框
const createDialogVisible = ref(false);
const createFakeUserDialog = ref(false);
const updateDialogVisible = ref(false);
const updateUserDialog = ref(false);
const updateFakeUserDialog = ref(false);
const openCreateDialog = () => {
  createDialogVisible.value = true;
};
const openCreateFakeUserDialog = number => {
  number === 0 ? isPrivate.value = 0 : isPrivate.value = 1;
  createFakeUserDialog.value = true;
};
const openUpdateDialog = () => {
  updateDialogVisible.value = true;
};
const openUpdateUserDialog = () => {
  updateUserDialog.value = true;
};
const openUpdateFakeUserDialog = () => {
  updateFakeUserDialog.value = true;
};

// 标签页
const activeTab = ref("view");

// 搜索框
const searchText = ref("");

// 表格数据
const tableData = [
  { companyName: "用户A" },
  { companyName: "用户B" },
  { companyName: "用户C" },
];
// 新用户信息
const newDepartment = ref({
  company: null,
  name: "",
  position: "",
});
const companies = ["公司A", "公司B", "公司C"];
const checked = ref(["自动发送邮件管理","邮件模版管理"]);
const checkList = ["自动发送邮件管理","邮件模版管理","文件管理","历史记录管理",
  "公司管理","部门管理","岗位管理","用户管理","商品管理","供应商管理","客户管理","国家管理","区域管理"];

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
      name: "用户1",
      positions: ["用户A", "用户B"],
    },
  ],
});

// 用户分页
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

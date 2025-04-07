<template>
  <div class="company-container">
    <el-tabs>
      <el-tab-pane label="登录用户管理">
        <!-- 顶部按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="openCreateUserDialog">创建用户</el-button>
          <el-upload
            action="#"
            :auto-upload="false"
            @change="importUser"
            :show-file-list="false"
            accept=".csv"
            class="upload-center"
          >
            <div class="upload-button">
              <el-button>导入</el-button>
            </div>
          </el-upload>
        </div>

        <!-- 搜索框 -->
        <div>
          <el-form :model="searchUserForm" style="display: flex;flex-flow: row wrap;gap: 10px;margin-bottom: 10px">
            <el-form-item>
              <el-input v-model="searchUserForm.user_name" placeholder="请搜索用户名称" clearable style="width:200px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchUserForm.user_account" placeholder="请搜索登录账号" clearable style="width:200px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchUserForm.user_email" placeholder="请搜索邮箱" clearable style="width:200px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearchUserClick">搜索</el-button>
              <el-button type="primary" @click="resetSearchUser"><el-icon><Refresh /></el-icon></el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表格 -->
        <div style="width: 100%;overflow-x: auto">
          <el-table :data="userCurrentPageData" border style="width: 1200px">
            <!-- 用户名称列 -->
            <el-table-column label="用户名称" align="left" min-width="100">
              <template #default="{ row }">
                <span>{{ row.userName }}</span>
              </template>
            </el-table-column>
            <!-- 登录账号列 -->
            <el-table-column label="登录账号" align="left" min-width="100">
              <template #default="{ row }">
                <span>{{ row.userAccount }}</span>
              </template>
            </el-table-column>
            <!-- 邮箱列 -->
            <el-table-column label="邮箱" align="left" min-width="150">
              <template #default="{ row }">
                <span>{{ row.userEmail }}</span>
              </template>
            </el-table-column>

            <!-- 查看按钮列 -->
            <el-table-column label="操作" align="center" min-width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openCheckUserPasswordDialog(row)">查看</el-button>
                <el-button type="warning" size="small" @click="openUpdateUserDialog(row)">修改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div>
          <SmartPagination
            v-model:current-page="userPagination.currentPage"
            :server-page-size="userPagination.serverPageSize"
            :display-page-size="userPagination.displayPageSize"
            :total="userPagination.totalItems"
            @load-data="handleUserLoadData" />
        </div>
      </el-tab-pane>



      <el-tab-pane v-if="false" label="仅发送用户管理">
        <!-- 顶部按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="openCreateFakeUserDialog">创建用户</el-button>
          <el-button>导入</el-button>
        </div>

        <!-- 搜索框 -->
        <div style="display: flex;flex-flow: row wrap;gap: 10px;margin-bottom: 10px">
          <el-input v-model="searchText" placeholder="请搜索用户名称" clearable style="width:200px;margin-right: 10px">
          </el-input>
          <el-input v-model="searchText" placeholder="请搜索所属用户" clearable style="width:200px;margin-right: 10px">
          </el-input>
          <el-input v-model="searchText" placeholder="请搜索邮箱" clearable style="width:200px;margin-right: 10px">
          </el-input>
          <el-select style="width:200px;margin-right: 10px" placeholder="分配状态">
            <el-option label="已分配"></el-option>
            <el-option label="未分配"></el-option>
          </el-select>
          <el-button type="primary">搜索</el-button>
          <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
        </div>

        <!-- 表格 -->
        <div style="width: 100%;overflow-x: auto">
          <el-table :data="tableData" border style="width: 1200px">
            <!-- 用户名称列 -->
            <el-table-column label="用户名称" align="left" min-width="100">
              <template #default="{ row }">
                <span>{{ row.user }}</span>
              </template>
            </el-table-column>
            <!-- 所属用户列 -->
            <el-table-column label="所属用户" align="left" min-width="100">
              <template #default="{ row }">
                <span>{{ row.belong_user_name }}</span>
              </template>
            </el-table-column>
            <!-- 邮箱列 -->
            <el-table-column label="邮箱" align="left" min-width="100">
              <template #default="{ row }">
                <span>{{ row.email }}</span>
              </template>
            </el-table-column>
            <!-- 状态列 -->
            <el-table-column label="状态" min-width="150">
              <template #default="{ row }">
                <span class="status-text" @click="row.status === '已分配' && openAssignUserDetails(row)">
                  {{ row.status }}
                </span>
                <el-button
                  size="small"
                  type="primary"
                  @click="assignFakeUserDialog"
                >
                  {{ row.status === '已分配' ? '重新分配' : '去分配' }}
                </el-button>
              </template>
            </el-table-column>

            <!-- 查看按钮列 -->
            <el-table-column label="操作" align="center" min-width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openFakeUserDialog(row)">查看</el-button>
                <el-button type="warning" size="small" @click="openUpdateFakeUserDialog(row)">修改</el-button>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

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

    <!-- 已分配用户详情弹窗 -->
    <AssignUserDetailsDialog
      v-model="assignUserDetailsDialog"
      :user_id="selectedAssignUserId"
    />

    <!-- ====================登录用户管理 ==================== -->
    <!-- 去分配/重新分配登录用户弹窗 -->
    <AssignUserDialog
      v-model="assignUserDialog"
      :user_id="selectedAssignUserId"
    />
    <!-- 查看登录用户密码对话框 -->
    <CheckUserPasswordDialog
      v-model="checkUserPasswordDialog"
      :user_info="selectedCheckUserPasswordForm"
    />
    <!-- 创建登录用户对话框 -->
    <el-dialog title="创建用户" v-model="createUserDialogVisible" width="50%">
      <el-form
        label-width="150px"
        :model="createUserForm"
        :rules="createUserFormRules"
        ref="createUserFormRef"
      >
        <el-form-item label="角色管理:" prop="user_role">
          <el-radio-group v-model="createUserForm.user_role">
            <el-radio label="小管理员" value=3></el-radio>
            <el-radio label="个人用户" value=4></el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用户名称" prop="user_name">
          <el-input v-model="createUserForm.user_name" placeholder="请输入用户名称" clearable/>
        </el-form-item>

        <el-form-item label="用户登录账号" prop="user_account">
          <el-input v-model="createUserForm.user_account" placeholder="请输入用户登录账号" clearable/>
        </el-form-item>

        <el-form-item label="用户登录密码" prop="user_password">
          <el-input v-model="createUserForm.user_password" placeholder="请输入用户登录密码" clearable/>
        </el-form-item>

        <el-form-item label="用户邮箱" prop="user_email">
          <el-input v-model="createUserForm.user_email" placeholder="请输入用户邮箱" clearable/>
        </el-form-item>

        <el-form-item label="用户邮箱授权码" prop="user_email_code">
          <el-input v-model="createUserForm.user_email_code" placeholder="请输入用户邮箱授权码" clearable/>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeCreateUserDialog">取消</el-button>
        <el-button type="primary" @click="createUser">确定</el-button>
      </template>
    </el-dialog>
    <!-- 修改登录用户信息框 -->
    <UpdateUserDialog
      v-model="updateUserDialog"
      :user_id="selectedUpdateUserId"
    />
    <!-- 修改登录用户权限框 -->
    <UpdateUserAuthDialog
      v-model="updateUserAuthDialog"
      :authForm="updateUserAuthForm"
    />

    <!-- 假人用户管理 -->
    <!-- 去分配/重新分配假人用户弹窗 -->
    <el-dialog title="选择用户" v-model="fakeUserDialog" width="40%">
      <el-radio-group v-model="assignType">
        <el-radio label="公司">公司</el-radio>
        <el-radio label="小管理员">小管理员</el-radio>
        <el-radio label="用户">用户</el-radio>
      </el-radio-group>
      <div v-if="assignType === '小管理员'" class="user-assign-section">
        <el-input placeholder="搜索小管理员" v-model="searchQuery" clearable></el-input>
        <el-checkbox-group v-model="selectedUsers">
          <el-checkbox v-for="user in supplierList" :key="user.id" :label="user.name">
            {{ user.adminName }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div v-if="assignType === '用户'" class="user-assign-section">
        <el-input placeholder="搜索用户" v-model="searchQuery" clearable></el-input>
        <el-checkbox-group v-model="selectedUsers">
          <el-checkbox v-for="user in userList" :key="user.id" :label="user.name">
            {{ user.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="fakeUserDialog = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>
    <!-- 查看假人用户对话框 -->
    <el-dialog title="用户详情" v-model="fakeUserdialog" width="50%">
      <el-form label-width="120px">
        <!-- 所属用户员名称 -->
        <el-form-item label="所属用户">
          <el-input placeholder="所属用户" disabled />
        </el-form-item>

        <!-- 用户名称输入框 -->
        <el-form-item label="用户名称">
          <el-input placeholder="用户名称" disabled/>
        </el-form-item>

        <!-- 用户邮箱输入框 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="用户邮箱" disabled/>
        </el-form-item>

        <!-- 用户邮箱密码输入框 -->
        <el-form-item label="用户邮箱密码">
          <el-input placeholder="用户邮箱密码" disabled/>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 创建假人用户对话框 -->
    <el-dialog title="创建用户" v-model="createFakeUserDialog" width="40%">
      <el-form label-width="120px">
        <!-- 用户名称输入框 -->
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称"/>
        </el-form-item>

        <!-- 用户邮箱输入框 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="请输入用户邮箱"/>
        </el-form-item>

        <!-- 用户邮箱密码输入框 -->
        <el-form-item label="用户邮箱密码">
          <el-input placeholder="请输入用户邮箱密码"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createUserDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>
    <!-- 修改假人用户信息框 -->
    <el-dialog title="修改用户" v-model="updateFakeUserDialog" width="40%">
      <el-form label-width="120px">
        <!-- 用户名称输入框 -->
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称"/>
        </el-form-item>

        <!-- 用户邮箱输入框 -->
        <el-form-item label="用户邮箱">
          <el-input placeholder="请输入用户邮箱"/>
        </el-form-item>

        <!-- 用户邮箱密码输入框 -->
        <el-form-item label="用户邮箱密码">
          <el-input placeholder="请输入用户邮箱密码"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createUserDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { userApi } from '@/api/user/user.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { errorHandler } from '@/utils/errorHandler.js';
import SmartPagination from '@/components/SmartPagination.vue'
import AssignUserDialog from '@/components/user/AssignUserDialog.vue';
import AssignUserDetailsDialog from '@/components/user/AssignUserDetailsDialog.vue';
import CheckUserPasswordDialog from '@/components/user/CheckUserPasswordDialog.vue';
import UpdateUserDialog from '@/components/user/UpdateUserDialog.vue';
import UpdateUserAuthDialog from '@/components/user/UpdateUserAuthDialog.vue';

//======================数据======================
//创建用户
const createUserForm = ref({
  user_role: null,
  user_name: "",
  user_account: "",
  user_password: "",
  user_email: "",
  user_email_code: "",
});
const createUserFormRef = ref(null)
const createUserFormRules = {
  user_role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  user_name: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
  user_account: [{ required: true, message: '请输入用户登录账号', trigger: 'blur' }],
  user_password: [{ required: true, message: '请输入用户登录密码', trigger: 'blur' }],
  user_email: [{ required: true, message: '请输入用户邮箱', trigger: 'blur' }],
  user_email_code: [{ required: true, message: '请输入用户邮箱授权码', trigger: 'blur' }]
}

// 搜索用户
const searchUserForm = ref({
  user_name: "",
  belong_user_name: "",
  user_account: "",
  user_email: "",
  status: null,
});

// 分配用户
const selectedAssignUserId = ref(null);

// 查看用户密码
const selectedCheckUserPasswordForm = ref({
  user_id: "",
  user_password: "",
  user_email_code: "",
});

const selectedUpdateUserId = ref('');
//修改用户权限
const updateUserAuthForm = ref({
  user_id: "",
  user_auth: [],
  all_auth: [],
});

const tableData = ref([
  { user_id: 1, user_name: "用户A" ,belong_user_name:"小管理A",user_account:"xxx", user_email:"xxx@163.com", status: 2},
  { user_id: 2, user_name: "用户B" ,belong_user_name:"小管理A",user_account:"xxx", user_email:"xxx@163.com", status: 2},
  { user_id: 3, user_name: "用户C" ,belong_user_name:"小管理A",user_account:"xxx", user_email:"xxx@163.com", status: 1},
]);

//======================分页======================
// 用户分页
const userPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 15,
  totalItems: 0,
  cachedData: new Map()
});
const userCurrentPageData = computed(() => {
  const displayPageSize = userPagination.value.displayPageSize  // 10
  const serverPageSize = userPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((userPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = userPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((userPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleUserLoadData = async (serverPage) => {
  console.log("国家分页组件计算出的页码：",serverPage);
  if(userPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  userPagination.value.serverPage = serverPage
  await searchUser()

}
const clearUserCache = () => {
  userPagination.value.currentPage = 1;
  userPagination.value.serverPage = 1;
  userPagination.value.cachedData.clear();
  userPagination.value.totalItems = 0;
}
//======================功能======================
// 导入用户
const importUser = async (file) => {
  try {
    const response = await userApi.importUser(file.raw);
    if (response.code === 200) {
      console.log("导入用户响应数据", response);
      // 处理错误信息，每条错误信息换行显示
      let errorMsgContent = '';
      if (response.data.errorMsg && Array.isArray(response.data.errorMsg)) {
        errorMsgContent = `<br>&nbsp;&nbsp;&nbsp;&nbsp;失败原因:<br>${response.data.errorMsg.map(msg => `&nbsp;&nbsp;&nbsp;&nbsp;${msg}`).join('<br>')}`;
      } else if (response.data.errorMsg) {
        errorMsgContent = `<br>&nbsp;&nbsp;&nbsp;&nbsp;失败原因: ${response.data.errorMsg}`;
      } else {
        errorMsgContent = '<br>&nbsp;&nbsp;&nbsp;&nbsp;如果有数据导入失败，原因可能为：角色、邮箱错误';
      }

      ElMessageBox.alert(
        `导入用户成功:<br>
        &nbsp;&nbsp;&nbsp;&nbsp;成功${response.data.success_count}条<br>
        &nbsp;&nbsp;&nbsp;&nbsp;失败${response.data.fail_count}条${errorMsgContent}`,
        '导入结果',
        {
          type: 'success',
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true // 允许使用HTML
        }
      )
    } else {
      errorHandler.showError("导入用户失败,请重试", response);
    }
  } catch (error) {
    errorHandler.showError("导入用户失败,请重试", error);
  }
}
// 创建用户
const createUser = async () => {
  try {
    createUserFormRef.value.validate( async (valid) => {
      if (valid) {
        const requestData = {
          user_role: 4,
          user_name: createUserForm.value.user_name,
          user_account: createUserForm.value.user_account,
          user_password: createUserForm.value.user_password,
          user_email: createUserForm.value.user_email,
          user_email_code: createUserForm.value.user_email_code,
        }
        console.log("创建用户请求数据", requestData);
        const response = await userApi.createUser(requestData);
        if (response.code === 200) {
          ElMessage.success("创建成功");
          console.log("创建用户响应数据", response);
          closeCreateUserDialog();
          clearCreateUserForm();
        } else {
          errorHandler.showError("创建用户失败,请重试",response);
        }
      } else {
        errorHandler.showError("创建用户失败,请重试");
      }
    });
  } catch (error) {
    errorHandler.showError("创建用户失败,请重试", error);
  }
}
// 搜索用户点击事件
const handleSearchUserClick = () => {
  // 先把分页数据清除干净
  clearUserCache();
  // 再搜索
  searchUser();
}
// 搜索用户
const searchUser = async () => {
  try {
    const requestData = {
      user_name: searchUserForm.value.user_name,
      belong_user_name: searchUserForm.value.belong_user_name,
      user_account: searchUserForm.value.user_account,
      user_email: searchUserForm.value.user_email,
      status: Number(searchUserForm.value.status) === 1 || Number(searchUserForm.value.status) === 2 ? Number(searchUserForm.value.status) : null,
      page_num: userPagination.value.serverPage,
      page_size: userPagination.value.serverPageSize,
    }
    console.log("搜索用户请求数据", requestData);
    const response = await userApi.filterUser(requestData);
    if (response.code === 200) {
      ElMessage.success("搜索成功");
      console.log("搜索用户响应数据", response);
      userPagination.value.totalItems = response.data.totalItems;
      userPagination.value.cachedData.set(userPagination.value.serverPage, response.data.user);
      console.log("搜索用户缓存数据", userPagination.value.cachedData.get(userPagination.value.serverPage));

    } else {
      errorHandler.showError("搜索用户失败,请重试", response);
    }
  } catch (error) {
    errorHandler.showError("搜索用户失败,请重试", error);
  }
}
// 重置搜索
const resetSearchUser = () => {
  searchUserForm.value = {
    user_name: "",
    belong_user_name: "",
    user_account: "",
    user_email: "",
    status: null,
  };
  //clearUserCache();
}
//======================对话框======================
// 对话框
const createUserDialogVisible = ref(false);
const updateUserAuthDialog = ref(false);
const updateUserDialog = ref(false);
const assignUserDialog = ref(false);
const assignUserDetailsDialog = ref(false);
const checkUserPasswordDialog = ref(false);

const createFakeUserDialog = ref(false);
const updateFakeUserDialog = ref(false);
const fakeUserDialog = ref(false);
const fakeUserdialog = ref(false);


const openCreateUserDialog = () => {
  createUserDialogVisible.value = true;
};
const openCheckUserPasswordDialog = async (row) => {
  try {
    const requestData = {
      user_id: row.userId,
    }
    console.log("查看用户密码请求数据", requestData);
    const response = await userApi.checkUser(requestData);
    if (response.code === 200) {
      console.log("查看用户密码响应数据", response);
      ElMessage.success("查看用户密码成功");
      selectedCheckUserPasswordForm.value = response.data;
      checkUserPasswordDialog.value = true;
    } else {
      errorHandler.showError("查看用户密码失败,请重试", response);
    }
  } catch (error) {
    console.error(error);
  }
};
const openUpdateUserDialog = (row) => {
  selectedUpdateUserId.value = row.userId;
  console.log("更新用户ID", selectedUpdateUserId.value);
  updateUserDialog.value = true;
};

const openAssignUserDetails = (row) => {
  selectedAssignUserId.value = row.userId;
  assignUserDetailsDialog.value = true;
};



// 关闭创建用户对话框
const clearCreateUserForm = () => {
  createUserForm.value = {
    user_role: null,
    user_name: "",
    user_account: "",
    user_password: "",
    user_email: "",
    user_email_code: "",
  };
}
const closeCreateUserDialog = () => {
  createUserDialogVisible.value = false;
}

//================================页面初始操作================================
onMounted(() => {
  if(userCurrentPageData.value.length === 0){
    handleSearchUserClick()
  }
})
</script>

<style scoped>

.button-group{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;
  gap: 20px;
}

.upload-center :deep(.el-upload) {
  /* 让 el-upload 的内部容器占满宽度 */
  display: block;
  width: 100%;
}

.upload-button {
  /* 让按钮容器居中 */
  display: flex;
  justify-content: center;
}

.status-text {
  color: blue;
  cursor: pointer;
  margin-right: 5px;
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

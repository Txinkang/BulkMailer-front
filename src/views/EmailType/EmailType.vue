<template>
  <div class="email-type-container">
    <!-- 顶部创建按钮 -->
    <div>
      <el-button type="primary" @click="openCreateDialog">创建邮件类型</el-button>
    </div>

    <!-- 筛选条件 -->
    <div>
      <el-row :gutter="5">
        <el-col :span="4">
          <el-input placeholder="搜索邮件类型" v-model="emailTypeSearchForm.email_type_name" clearable></el-input>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" @click="handleSearchEmailTypeClick">搜索</el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="resetEmailTypeSearchForm"><el-icon><Refresh /></el-icon></el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 邮件类型表格 -->
    <div>
      <el-table :data="emailTypeCurrentPageData" border style="width: 80%">
        <el-table-column label="类型名称" min-width="500">
          <template #default="{ row }">
          <span>{{ row.email_type_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="100">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openUpdateDialog(row)">修改</el-button>
          <el-button type="danger" size="small" @click="deleteEmailType(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <SmartPagination
      v-model:current-page="emailTypePagination.currentPage"
      :server-page-size="emailTypePagination.serverPageSize"
      :display-page-size="emailTypePagination.displayPageSize"
      :total="emailTypePagination.totalItems"
      @load-data="handleEmailTypeLoadData"
    />

    <!-- 创建邮件类型弹窗 -->
    <el-dialog title="创建邮件类型" v-model="emailTypeDialogVisible" width="40%">
      <el-form :model="createEmailTypeForm" label-width="150px">
        <el-form-item label="邮件类型名称">
          <el-input v-model="createEmailTypeForm.email_type_name" placeholder="请输入邮件类型名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeEmailTypeDialog">取消</el-button>
        <el-button type="primary" @click="createEmailType">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改邮件类型弹窗 -->
    <el-dialog title="修改邮件类型" v-model="updateEmailTypeDialogVisible" width="40%">
      <el-form :model="updateEmailTypeForm" label-width="150px">
        <el-form-item label="邮件类型名称">
          <el-input v-model="updateEmailTypeForm.email_type_name" placeholder="请输入邮件类型名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeUpdateEmailTypeDialog">取消</el-button>
        <el-button type="primary" @click="updateEmailType">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref ,computed} from "vue";
import { emailTypeApi } from "@/api/dictionary/emailType";
import { errorHandler } from "@/utils/errorHandler.js";
import { ElMessage } from "element-plus";
import SmartPagination from "@/components/SmartPagination.vue";
//======================数据======================
const emailTypeSearchForm = ref({
  email_type_name: "",
});
const createEmailTypeForm = ref({
  email_type_name: "",
});
const updateEmailTypeForm = ref({
  email_type_id: "",
  email_type_name: "",
});

// 分页
const emailTypePagination = ref({
  currentPage: 1,
  serverPage: 1,
  serverPageSize: 20,
  displayPageSize: 10,
  totalItems: 0,
  cachedData: new Map()
});
const emailTypeCurrentPageData = computed(() => {
  const displayPageSize = emailTypePagination.value.displayPageSize  // 10
  const serverPageSize = emailTypePagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((emailTypePagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = emailTypePagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((emailTypePagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleEmailTypeLoadData = async (serverPage) => {
  console.log("邮件类型分页组件计算出的页码：",serverPage);
  if(emailTypePagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  emailTypePagination.value.serverPage = serverPage
  await searchEmailType()
};

//======================功能======================
// 搜索邮件按钮点击事件
const handleSearchEmailTypeClick = () => {
  emailTypePagination.value.currentPage = 1;
  emailTypePagination.value.serverPage = 1;
  emailTypePagination.value.cachedData.clear();
  emailTypePagination.value.totalItems = 0;
  searchEmailType()
}

// 搜索邮件类型
const searchEmailType = async () => {
  try{
    // 调用接口
    const requestData = {
    email_type_name: emailTypeSearchForm.value.email_type_name,
    page_num: emailTypePagination.value.serverPage,
    page_size: emailTypePagination.value.serverPageSize,
    };
    console.log("搜索邮件类型请求数据",requestData);
    const res = await emailTypeApi.filterEmailType(requestData);
    if(res.code === 200){
      emailTypePagination.value.cachedData.set(
        emailTypePagination.value.serverPage,
        res.data.email_type)
      emailTypePagination.value.totalItems = res.data.total_items
      console.log("搜索邮件类型响应数据",res);
      console.log("搜索邮件类型表格数据",emailTypePagination.value.cachedData.get(emailTypePagination.value.serverPage));
    }else{
      errorHandler.showError('搜索邮件类型失败,请重试', res)
    }
  }catch(err){
    errorHandler.showError('搜索邮件类型失败,请重试', err)
  }
};

// 创建邮件类型
const createEmailType = async () => {
  try{
    const requestData = {
      email_type_name: createEmailTypeForm.value.email_type_name,
    };
    console.log("创建邮件类型请求数据",requestData);
    const res = await emailTypeApi.createEmailType(requestData);
    if(res.code === 200){
      ElMessage.success('创建邮件类型成功')
      if(emailTypePagination.value.cachedData.get(emailTypePagination.value.serverPage)){
        emailTypePagination.value.cachedData.get(emailTypePagination.value.serverPage).unshift({
          email_type_id: res.data.email_type_id,
          email_type_name: createEmailTypeForm.value.email_type_name,
        })
      }else{
        emailTypePagination.value.cachedData.set(
          emailTypePagination.value.serverPage,
          [{
            email_type_id: res.data.email_type_id,
            email_type_name: createEmailTypeForm.value.email_type_name,
          }]
        )
      }
      emailTypePagination.value.totalItems = emailTypePagination.value.totalItems + 1
      console.log("创建邮件类型表格数据",emailTypePagination.value.cachedData.get(emailTypePagination.value.serverPage));
      closeEmailTypeDialog()
    }else{
      errorHandler.showError('创建邮件类型失败,请重试。失败可能原因为：邮件类型名称已被创建', res)
    }
  }catch(err){
    errorHandler.showError('创建邮件类型失败,请重试', err)
  }
};

// 修改邮件类型
const updateEmailType = async () => {
  try{
    const requestData = {
      email_type_id: updateEmailTypeForm.value.email_type_id,
      email_type_name: updateEmailTypeForm.value.email_type_name,
    };
    console.log("修改邮件类型请求数据",requestData);
    const res = await emailTypeApi.updateEmailType(requestData);
    if(res.code === 200){
      ElMessage.success('修改邮件类型成功')
      emailTypeCurrentPageData.value.forEach((item) => {
        if(item.email_type_id === updateEmailTypeForm.value.email_type_id){
          item.email_type_name = updateEmailTypeForm.value.email_type_name;
        }
      })
      closeUpdateEmailTypeDialog()
    }else{
      errorHandler.showError('修改邮件类型失败,请重试', res)
    }
  }catch(err){
    errorHandler.showError('修改邮件类型失败,请重试', err)
  }
};

// 删除邮件类型
const deleteEmailType = async (row) => {
  try{
    const requestData = {
      email_type_id: row.email_type_id,
    };
    console.log("删除邮件类型请求数据",requestData);
    const res = await emailTypeApi.deleteEmailType(requestData);
    if(res.code === 200){
      ElMessage.success('删除邮件类型成功')
      const currentData = emailTypePagination.value.cachedData.get(emailTypePagination.value.serverPage)
      emailTypePagination.value.cachedData.set(
        emailTypePagination.value.serverPage,
        currentData.filter(item => item.email_type_id !== row.email_type_id)
      )
      emailTypePagination.value.totalItems = emailTypePagination.value.totalItems - 1
      console.log("删除邮件类型成功", res);
    }else{
      errorHandler.showError('删除邮件类型失败,请重试', res)
    }
  }catch(err){
    errorHandler.showError('删除邮件类型失败,请重试', err)
  }
};

// 重置邮件类型搜索条件
const resetEmailTypeSearchForm = () => {
  emailTypeSearchForm.value = {
    email_type_name: "",
  };
  emailTypePagination.value.currentPage = 1;
  emailTypePagination.value.serverPage = 1;
  emailTypePagination.value.cachedData.clear();
  emailTypePagination.value.totalItems = 0;

};


//======================弹窗======================
// 控制弹窗显示
const emailTypeDialogVisible = ref(false);
const updateEmailTypeDialogVisible = ref(false);

// 打开创建邮件类型弹窗
const openCreateDialog = () => {
  emailTypeDialogVisible.value = true;
};

// 打开修改邮件类型弹窗
const openUpdateDialog = (row) => {
  updateEmailTypeDialogVisible.value = true;
  updateEmailTypeForm.value.email_type_id = row.email_type_id;
  updateEmailTypeForm.value.email_type_name = row.email_type_name;
  console.log("修改邮件类型弹窗数据",updateEmailTypeForm.value);
};

// 关闭邮件类型弹窗
const closeEmailTypeDialog = () => {
  emailTypeDialogVisible.value = false;
  createEmailTypeForm.value = { email_type_name: "" };
};

// 关闭修改邮件类型弹窗
const closeUpdateEmailTypeDialog = () => {
  updateEmailTypeDialogVisible.value = false;
  updateEmailTypeForm.value = {
    email_type_id: "",
    email_type_name: "",
  };
};


</script>

<style scoped>
.email-type-container{
  display: flex;
  flex-direction: column;
  padding: 20px;
}
</style>

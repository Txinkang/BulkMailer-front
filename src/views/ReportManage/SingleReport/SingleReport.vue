<template>
  <div class="mail-container">
    <!-- 筛选条件 -->
    <div style="display: flex;flex-flow: row wrap;gap: 10px;">
      <el-form style="display: flex;flex-flow: row wrap;gap: 10px;">
        <el-form-item>
          <el-input style="width: 200px" placeholder="请搜索主题名称" v-model="searchTaskForm.subject" clearable></el-input>
        </el-form-item>

        <el-form-item>
          <el-input style="width: 200px" placeholder="请搜索发件人" v-model="searchTaskForm.sender_name" clearable></el-input>
        </el-form-item>

        <el-form-item>
          <el-select style="width: 200px" placeholder="选择任务类型" v-model="searchTaskForm.task_type" clearable>
            <el-option label="手动发送" value="1"></el-option>
            <el-option label="循环发送" value="2"></el-option>
            <el-option label="生日发送" value="3"></el-option>
            <el-option label="节日发送" value="4"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="searchTaskForm.email_type_id"
            placeholder="请搜索邮件类型"
            filterable
            remote
            :remote-method="debouncedSearchEmailType"
            clearable
            style="width:200px;margin-right: 10px"
            >
            <el-option
            v-for="emailType in searchTaskForm.emailTypeOptions"
            :key="emailType.email_type_id"
            :label="emailType.email_type_name"
            :value="emailType.email_type_id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchTaskForm.task_status" style="width: 200px" placeholder="选择任务状态" clearable>
            <el-option label="发送中" :value="emailData.EmailTaskStatus.SendStart"></el-option>
            <el-option label="发送暂停" :value="emailData.EmailTaskStatus.SendPause"></el-option>
            <el-option label="发送终止" :value="emailData.EmailTaskStatus.SendStop"></el-option>
            <el-option label="发送成功" :value="emailData.EmailTaskStatus.SendSuccess"></el-option>
            <el-option label="发送失败" :value="emailData.EmailTaskStatus.SendError"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-date-picker
            style="width: 200px"
            v-model="searchTaskForm.start_date"
            type="date"
            placeholder="发送时间"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="searchTaskClick">搜索</el-button>
          <el-button type="primary" @click="resetTask">
            <el-icon>
              <Refresh/>
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div style="width: 100%">
      <el-table :data="emailTaskCurrentPageData" border style="width: 100%;margin-bottom: 2em">
        <!-- 主题列 -->
        <el-table-column label="主题">
          <template #default="{ row }">
            {{ row.subject }}
          </template>
        </el-table-column>

        <!-- 发件人列 -->
        <el-table-column label="发件人">
          <template #default="{ row }">
            {{ row.sender_name }}
          </template>
        </el-table-column>

        <!-- 任务类型列 -->
        <el-table-column label="任务类型">
          <template #default="{ row }">
            {{ row.taskType }}
          </template>
        </el-table-column>

        <!-- 邮件类型列 -->
        <el-table-column label="邮件类型">
          <template #default="{ row }">
            {{ row.email_type_name }}
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态">
          <template #default="{ row }">
            {{ taskStatusChinese(row.task_status) }}
          </template>
        </el-table-column>

        <!-- 时间列 -->
        <el-table-column label="时间">
          <template #default="{ row }">
            {{ row.start_date }}
          </template>
        </el-table-column>

        <!-- 报表列 -->
        <el-table-column label="查看报表" >
          <template #default="{ row }">
            <el-button type="primary" @click="checkReport(row)">查看任务报表</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 报表对话框 -->
    <ReportDialog v-model="reportDialogVisible" :reportData="reportData" />
    <!-- 分页 -->
    <div>
      <SmartPagination
        v-model:current-page="emailTaskPagination.currentPage"
        :server-page-size="emailTaskPagination.serverPageSize"
        :display-page-size="emailTaskPagination.displayPageSize"
        :total="emailTaskPagination.totalItems"
        @load-data="handleEmailTaskLoadData" />
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from "vue";
import {emailApi} from "@/api/email/email.js";
import {reportApi} from "@/api/report/report.js";
import {ElMessage} from 'element-plus'
import {emailTypeApi} from "@/api/dictionary/emailType.js";
import {errorHandler} from "@/utils/errorHandler.js";
import {debounce} from "lodash";
import SmartPagination from "@/components/SmartPagination.vue";
import ReportDialog from "@/components/report/ReportDialog.vue";
import emailData from "@/constants/EmailConstantData.js";
// 筛选条件
const searchTaskForm = ref({
  subject: null,
  sender_name: null,
  task_type: null,
  email_type_id: null,
  emailTypeOptions: [],
  task_status: null,
  start_date: null,
})

//================================分页========================================
const emailTaskPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 2, // 每页显示条数
  serverPageSize: 4, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const emailTaskCurrentPageData = computed(() => {
  const displayPageSize = emailTaskPagination.value.displayPageSize  // 10
  const serverPageSize = emailTaskPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((emailTaskPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = emailTaskPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((emailTaskPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleEmailTaskLoadData = async (serverPage) => {
  console.log("邮件任务分页组件计算出的页码：",serverPage);
  if(emailTaskPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  emailTaskPagination.value.serverPage = serverPage
  await searchEmailTask()

}
const clearEmailTaskCache = () => {
  emailTaskPagination.value.currentPage = 1;
  emailTaskPagination.value.serverPage = 1;
  emailTaskPagination.value.cachedData.clear();
  emailTaskPagination.value.totalItems = 0;
}
//================================功能========================================
const searchTaskClick = async () => {
  clearEmailTaskCache()
  await searchEmailTask()
}
const searchEmailTask = async () => {
  try {
    const requestData = {
      subject: searchTaskForm.value.subject === '' ? null : searchTaskForm.value.subject,
      sender_name: searchTaskForm.value.sender_name === '' ? null : searchTaskForm.value.sender_name,
      task_type: searchTaskForm.value.task_type ? Number(searchTaskForm.value.task_type) : null,
      email_type_id: searchTaskForm.value.email_type_id === '' ? null : searchTaskForm.value.email_type_id,
      task_status: searchTaskForm.value.task_status ? Number(searchTaskForm.value.task_status) : null,
      start_date: searchTaskForm.value.start_date ? getStartOfDay(searchTaskForm.value.start_date) : null,
      end_date: searchTaskForm.value.start_date ? getEndOfDay(searchTaskForm.value.start_date) : null,
      page_num: emailTaskPagination.value.serverPage,
      page_size: emailTaskPagination.value.serverPageSize,
    }
    console.log("搜索单任务报表邮件任务请求数据", requestData);
    const res = await emailApi.filterTask(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索成功")
      console.log("搜索单任务报表邮件任务响应数据", res);
      emailTaskPagination.value.totalItems = res.data.total_items
      emailTaskPagination.value.cachedData.set(emailTaskPagination.value.serverPage, res.data.task_info)
    } else {
      errorHandler.showError("搜索单任务报表邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索单任务报表邮件任务失败,请重试", error);
  }
}
const resetTask = () => {
  searchTaskForm.value.subject = null
  searchTaskForm.value.sender_name = null
  searchTaskForm.value.task_type = null
  searchTaskForm.value.email_type_id = null
  searchTaskForm.value.task_status = null
  searchTaskForm.value.start_date = null
  clearEmailTaskCache()
  console.log("重置邮件任务");
}

//查看报表
const reportDialogVisible = ref(false)
const reportData = ref(null)
const checkReport = async (row) => {
  try {
    const requestData = {
      email_task_id: row.task_id,
    }
    console.log("查看单任务报表邮件任务请求数据", requestData);
    const res = await reportApi.checkSingleReport(requestData)
    if (res.code === 200) {
      ElMessage.success("查看成功")
      console.log("查看单任务报表邮件任务响应数据", res);
      reportData.value = res.data
      reportDialogVisible.value = true
    } else {
      errorHandler.showError("查看单任务报表邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("查看单任务报表邮件任务失败,请重试", error);
  }

}
//================================其他功能========================================
// 搜索邮件类型,防抖函数
const chooseSearchEmailType = async (query) => {
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索单任务报表邮件类型请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      searchTaskForm.value.emailTypeOptions = res.data.email_type
      console.log("搜索单任务报表邮件类型响应数据", res);
      console.log("搜索单任务报表邮件类型缓存数据", searchTaskForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("搜索单任务报表邮件类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索单任务报表邮件类型失败,请重试", error);
  }
}
const debouncedSearchEmailType = debounce(chooseSearchEmailType, 500)

// 获取当天开始时间戳（0点）
const getStartOfDay = (date) => {
  if (!date) return null
  return Math.floor(new Date(new Date(date).setHours(0, 0, 0, 0)).getTime() / 1000)
}
// 获取当天结束时间戳（23:59:59）
const getEndOfDay = (date) => {
  if (!date) return null
  return Math.floor(new Date(new Date(date).setHours(23, 59, 59, 999)).getTime() / 1000)
}
// 任务状态中文显示
const taskStatusChinese = (status) => {
  if(status === 1){
    return "发送中"
  }
  if(status === 2){
    return "发送暂停"
  }
  if(status === 3){
    return "发送终止"
  }
  if(status === 4){
    return "发送重置"
  }
  if(status === 5){
    return "发送失败"
  }
  if(status === 6){
    return "发送成功"
  }
}
</script>

<style scoped>
.mail-container {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header .tip {
  font-size: small;
  margin-left: 20px;
  color: #999;
}

.filters {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 20px;
}
.detailsTable{
  table-layout: auto !important; /* 确保列宽根据内容调整 */
}
.clickable {
  color: #409eff;
  cursor: pointer;
}

.clickable:hover {
  text-decoration: underline;
}
</style>

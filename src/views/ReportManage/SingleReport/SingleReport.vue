<template>
  <div class="mail-container">
    <!-- 筛选条件 -->
    <div>
      <el-form style="display: flex;flex-flow: row wrap;gap: 10px;" :model="searchTaskForm" :rules="searchTaskFormRules" ref="searchTaskFormRef">
        <el-form-item>
          <el-input v-model="searchTaskForm.subject" style="width: 200px" placeholder="请搜索主题名称" clearable></el-input>
        </el-form-item>

        <el-form-item v-if="false">
          <el-input v-model="searchTaskForm.sender_name" style="width: 200px" placeholder="请搜索发件人" clearable></el-input>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchTaskForm.task_type" style="width: 200px" placeholder="选择任务类型" clearable>
            <el-option label="手动发送" :value="emailData.ManualTaskType"></el-option>
            <el-option label="循环发送" :value="emailData.CircleTaskType"></el-option>
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
              <el-option label="发送重置" :value="emailData.EmailTaskStatus.SendReset"></el-option>
              <el-option label="发送失败" :value="emailData.EmailTaskStatus.SendError"></el-option>
              <el-option label="发送完成" :value="emailData.EmailTaskStatus.SendSuccess"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="start_date">
          <el-date-picker
            style="width: 200px"
            v-model="searchTaskForm.start_date"
            type="date"
            placeholder="开始时间"
            clearable
          />
        </el-form-item>

        <el-form-item prop="end_date">
          <el-date-picker
            style="width: 200px"
            v-model="searchTaskForm.end_date"
            type="date"
            placeholder="结束时间"
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
      <el-table :data="emailTaskCurrentPageData" border style="width: 1200px;margin-bottom: 2em">
        <!-- 主题列 -->
        <el-table-column label="主题" min-width="120px">
          <template #default="{ row }">
            {{ row.subject }}
          </template>
        </el-table-column>

        <!-- 发件人列 -->
        <el-table-column label="发件人" min-width="120px">
          <template #default="{ row }">
            {{ row.sender_name }}
          </template>
        </el-table-column>

        <!-- 任务类型列 -->
        <el-table-column label="任务类型" min-width="120px">
          <template #default="{ row }">
            {{ getEmailTaskType(row.taskType) }}
          </template>
        </el-table-column>

        <!-- 邮件类型列 -->
        <el-table-column label="邮件类型" min-width="120px">
          <template #default="{ row }">
            {{ row.taskType === 4 ? '' : row.email_type_name }}
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" min-width="120px">
          <template #default="{ row }">
            {{ getEmailTaskStatus(row.task_status) }}
          </template>
        </el-table-column>

        <!-- 开始时间列 -->
        <el-table-column label="开始时间" min-width="200px">
          <template #default="{ row }">
            {{ getStartTime(row) }}
          </template>
        </el-table-column>

        <!-- 结束时间列 -->
        <el-table-column label="结束时间" min-width="200px">
          <template #default="{ row }">
            {{ getEndTime(row) }}
          </template>
        </el-table-column>

        <!-- 报表列 -->
        <el-table-column label="查看报表" min-width="150px">
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
import {ref, computed, onMounted} from "vue";
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
  sender_email: null,
  task_type: null,
  email_type_id: null,
  emailTypeOptions: [],
  task_status: null,
  start_date: null,
  end_date: null,
})
const searchTaskFormRef = ref(null)
const searchTaskFormRules = {
  start_date: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !searchTaskForm.value.end_date) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !searchTaskForm.value.end_date) ||
                 (!value && searchTaskForm.value.end_date)) {
          callback(new Error('请同时选择开始和结束时间'))
        }
        // 两个都选了，通过验证
        else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  end_date: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !searchTaskForm.value.start_date) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !searchTaskForm.value.start_date) ||
                 (!value && searchTaskForm.value.start_date)) {
          callback(new Error('请同时选择开始和结束时间'))
        }
        // 两个都选了，通过验证
        else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

//================================分页========================================
const emailTaskPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 15, // 每页服务器条数
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
    try {
      await searchTaskFormRef.value?.validate()
    } catch (error) {
      ElMessage.warning("请正确选择开始、结束时间")
      console.log("请正确选择开始、结束时间：", error);
      return
    }
    const requestData = {
      subject: searchTaskForm.value.subject === '' ? null : searchTaskForm.value.subject,
      sender_name: searchTaskForm.value.sender_name === '' ? null : searchTaskForm.value.sender_name,
      sender_email: searchTaskForm.value.sender_email === '' ? null : searchTaskForm.value.sender_email,
      email_type_id: searchTaskForm.value.email_type_id === '' ? null : searchTaskForm.value.email_type_id,
      start_date: searchTaskForm.value.start_date ? getStartOfDay(searchTaskForm.value.start_date) : null,
      end_date: searchTaskForm.value.end_date ? getEndOfDay(searchTaskForm.value.end_date) : null,
      task_type: searchTaskForm.value.task_type ? Number(searchTaskForm.value.task_type) : null,
      task_status: searchTaskForm.value.task_status ? Number(searchTaskForm.value.task_status) : null,
      page_num: emailTaskPagination.value.serverPage,
      page_size: emailTaskPagination.value.serverPageSize
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
  searchTaskForm.value.sender_email = null
  searchTaskForm.value.task_type = null
  searchTaskForm.value.email_type_id = null
  searchTaskForm.value.task_status = null
  searchTaskForm.value.start_date = null
  searchTaskForm.value.end_date = null
  //clearEmailTaskCache()
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
// 获取邮件任务类型
const getEmailTaskType = (type) => {
  return type === emailData.ManualTaskType ? '手动发送' : type === emailData.CircleTaskType ? '循环发送' : type === emailData.BirthTaskType ? '生日发送' : type === emailData.FestivalTaskType ? '节日发送' : ''
}
// 获取邮件任务状态
const getEmailTaskStatus = (status) => {
  if(status === emailData.EmailTaskStatus.SendStart){
    return '发送中'
  }else if(status === emailData.EmailTaskStatus.SendPause){
    return '发送暂停'
  }else if(status === emailData.EmailTaskStatus.SendStop){
    return '发送终止'
  }else if(status === emailData.EmailTaskStatus.SendReset){
    return '发送重置'
  }else if(status === emailData.EmailTaskStatus.SendError){
    return '发送失败'
  }else if(status === emailData.EmailTaskStatus.SendSuccess){
    return '发送完成'
  }
}
// 获取开始时间显示
const getStartTime = (row) => {
  if(row.start_date === '1970-01-01 08:00:00'){
    return '未开始'
  }
  return row.start_date
}
// 获取结束时间显示
const getEndTime = (row) => {
  if(row.task_status === emailData.EmailTaskStatus.SendError){
    return '发送失败'
  }
  if(row.end_date === '1970-01-01 08:00:00'){
    return '未结束'
  }
  return row.end_date
}

//================================页面初始操作================================
onMounted(() => {
  if(emailTaskCurrentPageData.value.length === 0){
    searchTaskClick()
  }
})
</script>

<style scoped>

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

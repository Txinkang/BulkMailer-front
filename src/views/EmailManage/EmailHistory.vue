<template>
  <div class="mail-container">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <!-- 所有邮件 -->
      <el-tab-pane label="所有邮件" name="delivered">
        <!-- 筛选条件 -->
        <div>
          <el-form style="display: flex;flex-flow: row wrap;gap: 10px;" :model="searchAllEmailTaskForm" :rules="searchAllEmailTaskFormRules" ref="searchAllEmailTaskFormRef">
            <el-form-item>
              <el-input v-model="searchAllEmailTaskForm.subject" style="width: 200px" placeholder="请搜索主题名称" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input v-model="searchAllEmailTaskForm.senderName" style="width: 200px" placeholder="请搜索发件人" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-select v-model="searchAllEmailTaskForm.taskType" style="width: 200px" placeholder="选择任务类型" clearable>
                <el-option label="手动发送" :value="emailData.ManualTaskType"></el-option>
                <el-option label="循环发送" :value="emailData.CircleTaskType"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-select
                v-model="searchAllEmailTaskForm.emailTypeId"
                placeholder="请搜索邮件类型"
                filterable
                remote
                :remote-method="debouncedSearchEmailType"
                clearable
                style="width:200px;margin-right: 10px"
                >
                <el-option
                v-for="emailType in searchAllEmailTaskForm.emailTypeOptions"
                :key="emailType.email_type_id"
                :label="emailType.email_type_name"
                :value="emailType.email_type_id" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-select v-model="searchAllEmailTaskForm.taskStatus" style="width: 200px" placeholder="选择任务状态" clearable>
                  <el-option label="发送中" :value="emailData.EmailTaskStatus.SendStart"></el-option>
                  <el-option label="发送暂停" :value="emailData.EmailTaskStatus.SendPause"></el-option>
                  <el-option label="发送终止" :value="emailData.EmailTaskStatus.SendStop"></el-option>
                  <el-option label="发送重置" :value="emailData.EmailTaskStatus.SendReset"></el-option>
                  <el-option label="发送失败" :value="emailData.EmailTaskStatus.SendError"></el-option>
                  <el-option label="发送完成" :value="emailData.EmailTaskStatus.SendSuccess"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item prop="startDate">
              <el-date-picker
                style="width: 200px"
                v-model="searchAllEmailTaskForm.startDate"
                type="date"
                placeholder="开始时间"
                clearable
              />
            </el-form-item>

            <el-form-item prop="endDate">
              <el-date-picker
                style="width: 200px"
                v-model="searchAllEmailTaskForm.endDate"
                type="date"
                placeholder="结束时间"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="searchAllEmailTaskClick">搜索</el-button>
              <el-button type="primary" @click="resetAllEmailTask">
                <el-icon>
                  <Refresh/>
                </el-icon>
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表格 -->
        <div style="width: 100%;overflow-x: auto">
          <el-table :data="emailTaskCurrentPageData" border style="width: 1000px;margin-bottom: 2em">
            <!-- 主题列 -->
            <el-table-column label="主题" min-width="120px">
              <template #default="{ row }">
                {{ row.subject }}
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

            <!-- 发件人列 -->
            <el-table-column label="发件人" min-width="100px">
              <template #default="{ row }">
                {{ row.sender_name }}
              </template>
            </el-table-column>

            <!-- 状态列 -->
            <el-table-column label="状态" min-width="100px">
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

            <!-- 详情列 -->
            <el-table-column label="查看详情" min-width="150px">
              <template #default="{ row }">
                <el-button @click="openEmailDetails(row)" type="primary">查看邮件详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div>
          <SmartPagination
            v-model:current-page="emailTaskPagination.currentPage"
            :server-page-size="emailTaskPagination.serverPageSize"
            :display-page-size="emailTaskPagination.displayPageSize"
            :total="emailTaskPagination.totalItems"
            @load-data="handleEmailTaskLoadData" />
        </div>

        <!-- 查看邮件详情对话框 -->
        <el-dialog title="查看详情" v-model="emailDetailsDialog" width="70%" @close="resetEmailDetail">
          <!-- 搜索框 -->
          <div>
            <el-form
              style="display: flex;flex-flow: row wrap;gap: 10px"
              :model="searchEmailDetailForm"
              :rules="searchEmailDetailFormRules"
              ref="searchEmailDetailFormRef">
              <el-form-item>
                <el-input style="width: 200px;" placeholder="请搜索发件人" clearable v-model="searchEmailDetailForm.senderName" />
              </el-form-item>

              <el-form-item>
                <el-input style="width: 200px;" placeholder="请搜索发件人邮箱" clearable v-model="searchEmailDetailForm.senderEmail" />
              </el-form-item>

              <el-form-item>
                <el-input style="width: 200px;" placeholder="请搜索收件人" clearable v-model="searchEmailDetailForm.receiverName" />
              </el-form-item>

              <el-form-item>
                <el-input style="width: 200px;" placeholder="请搜索收件人邮箱" clearable v-model="searchEmailDetailForm.receiverEmail" />
              </el-form-item>

              <el-form-item>
                <el-select style="width: 200px;" placeholder="收件人等级" v-model="searchEmailDetailForm.receiverLevel" clearable>
                  <el-option label="初级" value="1"></el-option>
                  <el-option label="中级" value="2"></el-option>
                  <el-option label="高级" value="3"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-date-picker style="width: 200px;" v-model="searchEmailDetailForm.receiverBirth" type="date" placeholder="收件人生日" clearable />
              </el-form-item>

              <el-form-item>
                <el-select style="width: 200px;" placeholder="邮件状态" v-model="searchEmailDetailForm.emailStatus" clearable>
                  <el-option label="已送达" :value="statusData.EMAIL_STATUS_SUCCESS"></el-option>
                  <el-option label="未送达" :value="statusData.EMAIL_STATUS_FAILED"></el-option>
                  <el-option label="发送错误" :value="statusData.EMAIL_STATUS_BOUNCE"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item prop="startDate">
                <el-date-picker
                  style="width: 200px;"
                  v-model="searchEmailDetailForm.startDate"
                  type="date"
                  placeholder="开始时间"
                  clearable
                />
              </el-form-item>

              <el-form-item prop="endDate">
                <el-date-picker
                  style="width: 200px;"
                  v-model="searchEmailDetailForm.endDate"
                  type="date"
                  placeholder="结束时间"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="searchEmailDetailClick">搜索</el-button>
                <el-button type="primary" @click="resetEmailDetail">
                  <el-icon><Refresh/></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格 -->
          <div style="display: flex;overflow-x: auto">
            <el-table :data="emailDetailCurrentPageData" border style="width: 1200px;margin-bottom: 2em;">
              <!-- 主题列 -->
              <el-table-column v-if="showSubjectColumn" label="主题" min-width="120px" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row.subject }}
                </template>
              </el-table-column>

              <!-- 任务类型列 -->
              <el-table-column label="任务类型" min-width="120px">
                <template #default="{ row }">
                  {{ getEmailTaskType(row.task_type) }}
                </template>
              </el-table-column>

              <!-- 发件人列 -->
              <el-table-column label="发件人" min-width="100px">
                <template #default="{ row }">
                  <span>{{ row.sender_name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="发件人邮箱" min-width="200px">
                <template #default="{ row }">
                  <span>{{ row.sender_email }}</span>
                </template>
              </el-table-column>

              <!-- 收件人列 -->
              <el-table-column label="收件人"  min-width="100px">
                <template #default="{ row }">
                  <span>{{ row.receiver_name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="收件人邮箱"  min-width="200px">
                <template #default="{ row }">
                  <span>{{ row.receiver_email }}</span>
                </template>
              </el-table-column>
              <el-table-column label="收件人等级"  min-width="100px">
                <template #default="{ row }">
                  <span>{{ getReceiverLevel(row.receiver_level) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="收件人生日"  min-width="200px">
                <template #default="{ row }">
                  <span>{{ row.receiver_birth }}</span>
                </template>
              </el-table-column>

              <!-- 时间列 -->
              <el-table-column label="发送时间" min-width="200px">
                <template #default="{ row }">
                  {{ row.start_date }}
                </template>
              </el-table-column>
              <el-table-column label="结束时间" min-width="200px">
                <template #default="{ row }">
                  {{ row.end_date }}
                </template>
              </el-table-column>

              <!-- 状态列 -->
              <el-table-column label="状态"  min-width="100px">
                <template #default="{ row }">
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_SUCCESS">已送达</span>
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_FAILED">未送达</span>
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_BOUNCE">发送错误</span>
                </template>
              </el-table-column>

              <!-- 未送达详情列 -->
              <el-table-column label="未送达详情"  min-width="300px" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_SUCCESS">{{ error_msg.EMAIL_STATUS_SUCCESS }}</span>
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_FAILED">{{ error_msg.EMAIL_STATUS_FAILED }}</span>
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_BOUNCE">{{ error_msg.EMAIL_STATUS_BOUNCE }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div>
            <SmartPagination
              v-model:current-page="emailDetailPagination.currentPage"
              :server-page-size="emailDetailPagination.serverPageSize"
              :display-page-size="emailDetailPagination.displayPageSize"
              :total="emailDetailPagination.totalItems"
              @load-data="handleEmailDetailLoadData" />
          </div>

        </el-dialog>
      </el-tab-pane>

      <!-- 未送达邮件 -->
      <el-tab-pane label="未送达邮件" name="undelivered">
        <!-- 搜索框 -->
        <div>
          <el-form
            style="display: flex;flex-flow: row wrap;gap: 10px;"
            :model="undeliveredSearchForm"
            :rules="undeliveredSearchFormRules"
            ref="undeliveredSearchFormRef"
            >
            <el-form-item>
              <el-input v-model="undeliveredSearchForm.subject" style="width: 200px" placeholder="请搜索主题名称" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input v-model="undeliveredSearchForm.sender_name" style="width: 200px" placeholder="请搜索发件人" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input v-model="undeliveredSearchForm.sender_email" style="width: 200px" placeholder="请搜索发件人邮箱" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input v-model="undeliveredSearchForm.receiver_name" style="width: 200px" placeholder="请搜索收件人" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input v-model="undeliveredSearchForm.receiver_email" style="width: 200px" placeholder="请搜索收件人邮箱" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-select v-model="undeliveredSearchForm.receiver_level" style="width: 200px" placeholder="选择收件人等级">
                <el-option label="初级" value="1"></el-option>
                <el-option label="中级" value="2"></el-option>
                <el-option label="高级" value="3"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-select v-model="undeliveredSearchForm.task_type" style="width: 200px" placeholder="选择任务类型">
                <el-option label="手动发送" :value="emailData.ManualTaskType"></el-option>
                <el-option label="循环发送" :value="emailData.CircleTaskType"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-select
                v-model="undeliveredSearchForm.email_type_id"
                placeholder="邮件类型"
                filterable
                remote
                :remote-method="debouncedUndeliveredSearchEmailType"
                clearable
                style="width:200px"
                >
                <el-option
                v-for="emailType in undeliveredSearchForm.emailTypeOptions"
                :key="emailType.email_type_id"
                :label="emailType.email_type_name"
                :value="emailType.email_type_id" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-select v-model="undeliveredSearchForm.resend_status" style="width: 200px" placeholder="选择重发状态">
                <el-option label="未重发" value="0"></el-option>
                <el-option label="重发成功" value="1"></el-option>
                <el-option label="重发失败" value="2"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-date-picker style="width: 200px" v-model="undeliveredSearchForm.receiver_birth" type="date" placeholder="收件人生日"/>
            </el-form-item>

            <el-form-item prop="start_date">
              <el-date-picker style="width: 200px" v-model="undeliveredSearchForm.start_date" type="date" placeholder="发送时间"/>
            </el-form-item>

            <el-form-item prop="end_date">
              <el-date-picker style="width: 200px" v-model="undeliveredSearchForm.end_date" type="date" placeholder="失败时间"/>
            </el-form-item>

            <el-form-item prop="resend_start_date">
              <el-date-picker style="width: 200px" v-model="undeliveredSearchForm.resend_start_date" type="date" placeholder="重发开始时间"/>
            </el-form-item>

            <el-form-item prop="resend_end_date">
              <el-date-picker style="width: 200px" v-model="undeliveredSearchForm.resend_end_date" type="date" placeholder="重发结束时间"/>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="searchUndeliveredClick">搜索</el-button>
              <el-button type="primary" @click="resetUndelivered">
                <el-icon>
                  <Refresh/>
                </el-icon>
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表格 -->
        <div style="width: 100%;display: flex;overflow-x: auto">
          <el-table :data="undeliveredCurrentPageData" border style="width: 1000px;margin-bottom: 2em">
            <!-- 主题列 -->
            <el-table-column label="主题" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.subject }}
              </template>
            </el-table-column>

            <!-- 任务类型列 -->
            <el-table-column label="任务类型" min-width="200">
              <template #default="{ row }">
                {{ getEmailTaskType(row.task_type) }}
              </template>
            </el-table-column>

            <!-- 邮件类型列 -->
            <el-table-column label="邮件类型" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.email_type_name }}
              </template>
            </el-table-column>

            <!-- 发件人列 -->
            <el-table-column label="发件人" min-width="100px">
              <template #default="{ row }">
                <span>{{ row.sender_name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="发件人邮箱" min-width="200px" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ row.sender_email }}</span>
              </template>
            </el-table-column>

            <!-- 收件人列 -->
            <el-table-column label="收件人"  min-width="100px">
              <template #default="{ row }">
                <span>{{ row.receiver_name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收件人邮箱"  min-width="200px" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ row.receiver_email }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收件人等级"  min-width="100px">
              <template #default="{ row }">
                <span>{{ getReceiverLevel(row.receiver_level) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收件人生日"  min-width="200px">
              <template #default="{ row }">
                <span>{{ row.receiver_birth }}</span>
              </template>
            </el-table-column>

            <!-- 时间列 -->
            <el-table-column label="发送时间" min-width="200">
              <template #default="{ row }">
                {{ row.start_date }}
              </template>
            </el-table-column>
            <el-table-column label="失败时间" min-width="200">
              <template #default="{ row }">
                {{ row.end_date }}
              </template>
            </el-table-column>

            <!-- 未送达详情列 -->
            <el-table-column label="未送达详情" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_SUCCESS">{{ error_msg.EMAIL_STATUS_SUCCESS }}</span>
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_FAILED">{{ error_msg.EMAIL_STATUS_FAILED }}</span>
                  <span v-if="row.email_status === statusData.EMAIL_STATUS_BOUNCE">{{ error_msg.EMAIL_STATUS_BOUNCE }}</span>
                </template>
            </el-table-column>

            <!-- 重发状态列 -->
            <el-table-column label="重发状态" min-width="200">
              <template #default="{ row }">
                {{ getResendStatus(row.resend_status) }}
              </template>
            </el-table-column>

            <!-- 重发失败详情列 -->
            <el-table-column label="重发失败详情" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.resend_msg }}
                  <!-- <span v-if="row.resend_status === statusData.RESEND_STATUS_UNRESEND">{{ error_msg.EMAIL_STATUS_SUCCESS }}</span>
                  <span v-if="row.resend_status === statusData.RESEND_STATUS_SUCCESS">{{ error_msg.EMAIL_STATUS_FAILED }}</span>
                  <span v-if="row.resend_status === statusData.RESEND_STATUS_FAILED">{{ error_msg.EMAIL_STATUS_BOUNCE }}</span> -->
                </template>
            </el-table-column>
            <!-- 重发开始时间列 -->
            <el-table-column label="重发开始时间" min-width="200">
              <template #default="{ row }">
                {{ row.resend_start_date === 0 ? '无' : getDateByTimestamp(row.resend_start_date) }}
              </template>
            </el-table-column>

            <!-- 重发结束时间列 -->
            <el-table-column label="重发结束时间" min-width="200">
              <template #default="{ row }">
                {{ row.resend_end_date === 0 ? '无' : getDateByTimestamp(row.resend_end_date) }}
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" align="center" min-width="100">
              <template #default="{ row }">
                <!-- <el-button type="primary" size="small" @click="openStrategyDialog">配置策略</el-button> -->
                <el-button type="success" size="small" @click="resendUndelivered(row)">重发</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div>
          <SmartPagination
            v-model:current-page="undeliveredPagination.currentPage"
            :server-page-size="undeliveredPagination.serverPageSize"
            :display-page-size="undeliveredPagination.displayPageSize"
            :total="undeliveredPagination.totalItems"
            @load-data="handleUndeliveredLoadData" />
        </div>

        <!-- 未送达策略对话框 -->
        <el-dialog title="未送达策略" v-model="strategyDialogVisible" width="40%">
          <el-form label-width="120px">
            <el-form-item label="重发次数">
              <el-input placeholder="请输入重发次数"/>
            </el-form-item>
            <el-form-item label="延迟时间">
              <el-input placeholder="请输入延迟时间（分钟）"/>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="strategyDialogVisible = false">取消</el-button>
            <el-button type="primary">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {ref, computed } from "vue";
import {debounce} from "lodash";
import {emailTypeApi} from "@/api/dictionary/emailType.js";
import {errorHandler} from "@/utils/errorHandler.js";
import SmartPagination from "@/components/SmartPagination.vue";
import {emailApi} from "@/api/email/email.js";
import {undeliveredEmailApi} from "@/api/email/undelivered/undeliveredEmail.js";
import {ElMessage} from "element-plus";
import statusData from "@/constants/StatusConstantData.js";
import emailData from "@/constants/EmailConstantData.js";

//================================数据========================================
// 激活的标签页
const activeTab = ref("delivered");

// 邮件任务搜索条件
const searchAllEmailTaskForm = ref({
  taskType: null, // 任务类型
  subject: '', // 主题名称
  senderName: '', // 发件人
  senderEmail: '', // 发件人邮箱
  emailTypeId: '', // 邮件类型ID
  emailTypeOptions: [], // 邮件类型名称
  startDate: null, // 开始时间
  endDate: null, // 结束时间
  operateStatus: null, // 操作状态
  taskStatus: null, // 任务状态
})
const searchAllEmailTaskFormRef = ref(null)
const searchAllEmailTaskFormRules = {
  startDate: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !searchAllEmailTaskForm.value.endDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !searchAllEmailTaskForm.value.endDate) ||
                 (!value && searchAllEmailTaskForm.value.endDate)) {
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
  endDate: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !searchAllEmailTaskForm.value.startDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !searchAllEmailTaskForm.value.startDate) ||
                 (!value && searchAllEmailTaskForm.value.startDate)) {
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

// 邮件详情搜索条件
const searchEmailDetailForm = ref({
  taskId: null, // 任务ID
  subject: null, // 主题名称
  senderName: null, // 发件人
  senderEmail: null, // 发件人邮箱
  receiverName: null, // 收件人
  receiverEmail: null, // 收件人邮箱
  receiverBirth: null, // 收件人生日
  receiverLevel: null, // 收件人等级
  startDate: null, // 开始时间
  endDate: null, // 结束时间
  emailStatus: null, // 邮件状态
})
const searchEmailDetailFormRef = ref(null)
const searchEmailDetailFormRules = {
  startDate: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !searchEmailDetailForm.value.endDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !searchEmailDetailForm.value.endDate) ||
                 (!value && searchEmailDetailForm.value.endDate)) {
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
  endDate: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !searchEmailDetailForm.value.startDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !searchEmailDetailForm.value.startDate) ||
                 (!value && searchEmailDetailForm.value.startDate)) {
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
const error_msg = ref({
  EMAIL_STATUS_SUCCESS: '无',
  EMAIL_STATUS_FAILED: '服务器应用错误',
  EMAIL_STATUS_BOUNCE: '1、邮箱发送到达上限。2、发件人邮箱或授权码填写错误。3、收件人邮箱填写错误',
  RESEND_STATUS_UNRESEND: '无',
  RESEND_STATUS_SUCCESS: '重发成功',
  RESEND_STATUS_FAILED: '1、邮箱发送到达上限。2、发件人邮箱或授权码填写错误。3、收件人邮箱填写错误',
})
const showSubjectColumn = computed(() => {
  return !emailDetailCurrentPageData.value.some(row => row.task_type === 4)
})
// 未送达邮件搜索条件
const undeliveredSearchForm = ref({
  subject: null, // 主题名称
  sender_name: null, // 发件人
  sender_email: null, // 发件人邮箱
  receiver_name: null, // 收件人
  receiver_email: null, // 收件人邮箱
  receiver_birth: null, // 收件人生日
  receiver_level: null, // 收件人等级
  task_type: null, // 任务类型
  email_type_id: null, // 邮件类型ID
  emailTypeOptions: [], // 邮件类型名称
  resend_status: null, // 重发状态
  start_date: null, // 开始时间
  end_date: null, // 结束时间
  resend_start_date: null, // 重发开始时间
  resend_end_date: null, // 重发结束时间
})
const undeliveredSearchFormRef = ref(null)
const undeliveredSearchFormRules = {
  start_date: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !undeliveredSearchForm.value.end_date) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !undeliveredSearchForm.value.end_date) ||
                 (!value && undeliveredSearchForm.value.end_date)) {
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
        if (!value && !undeliveredSearchForm.value.start_date) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !undeliveredSearchForm.value.start_date) ||
                 (!value && undeliveredSearchForm.value.start_date)) {
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
  resend_start_date: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !undeliveredSearchForm.value.resend_end_date) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !undeliveredSearchForm.value.resend_end_date) ||
                 (!value && undeliveredSearchForm.value.resend_end_date)) {
          callback(new Error('请同时选择重发开始和结束时间'))
        }
        // 两个都选了，通过验证
        else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  resend_end_date: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !undeliveredSearchForm.value.resend_start_date) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !undeliveredSearchForm.value.resend_start_date) ||
                 (!value && undeliveredSearchForm.value.resend_start_date)) {
          callback(new Error('请同时选择重发开始和结束时间'))
        }
        // 两个都选了，通过验证
        else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
}

//================================功能========================================
// ==============邮件任务==============
// 搜索邮件任务点击事件
const searchAllEmailTaskClick = async () => {
  clearEmailTaskCache()
  await searchAllEmailTask()
}
// 搜索邮件任务
const searchAllEmailTask = async () => {
  try {
    try {
      await searchAllEmailTaskFormRef.value?.validate()
    } catch (error) {
      ElMessage.warning("请正确选择开始、结束时间")
      console.log("请正确选择开始、结束时间：", error);
      return
    }
    const requestData = {
      subject: searchAllEmailTaskForm.value.subject === '' ? null : searchAllEmailTaskForm.value.subject,
      sender_name: searchAllEmailTaskForm.value.senderName === '' ? null : searchAllEmailTaskForm.value.senderName,
      sender_email: searchAllEmailTaskForm.value.senderEmail === '' ? null : searchAllEmailTaskForm.value.senderEmail,
      email_type_id: searchAllEmailTaskForm.value.emailTypeId === '' ? null : searchAllEmailTaskForm.value.emailTypeId,
      start_date: searchAllEmailTaskForm.value.startDate ? getStartOfDay(searchAllEmailTaskForm.value.startDate) : null,
      end_date: searchAllEmailTaskForm.value.endDate ? getEndOfDay(searchAllEmailTaskForm.value.endDate) : null,
      task_type: searchAllEmailTaskForm.value.taskType ? Number(searchAllEmailTaskForm.value.taskType) : null,
      task_status: searchAllEmailTaskForm.value.taskStatus ? Number(searchAllEmailTaskForm.value.taskStatus) : null,
      page_num: emailTaskPagination.value.serverPage,
      page_size: emailTaskPagination.value.serverPageSize
    }
    console.log("搜索邮件任务请求数据", requestData);
    const res = await emailApi.filterTask(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索邮件任务成功")
      console.log("搜索邮件任务响应数据", res);
      emailTaskPagination.value.totalItems = res.data.total_items
      emailTaskPagination.value.cachedData.set(emailTaskPagination.value.serverPage, res.data.task_info)
      console.log("搜索邮件任务缓存数据", emailTaskPagination.value.cachedData.get(emailTaskPagination.value.serverPage));
    } else {
      errorHandler.showError("搜索邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索邮件任务失败,请重试", error);
  }

}
// 重置邮件任务
const resetAllEmailTask = () => {
  clearEmailTaskCache()
  searchAllEmailTaskForm.value = {
    taskType: null, // 任务类型
    subject: '', // 主题名称
    senderName: '', // 发件人
    senderEmail: '', // 发件人邮箱
    emailTypeId: '', // 邮件类型ID
    emailTypeOptions: [], // 邮件类型名称
    startDate: null, // 开始时间
    endDate: null, // 结束时间
    operateStatus: null, // 操作状态
    taskStatus: null, // 任务状态
  }
}

// ==============邮件详情==============
// 搜索邮件详情点击事件
const searchEmailDetailClick = async () => {
  clearEmailDetailCache()
  await searchEmailDetail()
}
// 搜索邮件详情
const searchEmailDetail = async () => {
  try {
    try {
      await searchEmailDetailFormRef.value?.validate()
    } catch (error) {
      ElMessage.warning("请正确选择开始、结束时间")
      console.log("请正确选择开始、结束时间：", error);
      return
    }
    const requestData = {
      email_task_id: searchEmailDetailForm.value.taskId === '' ? null : searchEmailDetailForm.value.taskId,
      subject: searchEmailDetailForm.value.subject === '' ? null : searchEmailDetailForm.value.subject,
      sender_name: searchEmailDetailForm.value.senderName === '' ? null : searchEmailDetailForm.value.senderName,
      sender_email: searchEmailDetailForm.value.senderEmail === '' ? null : searchEmailDetailForm.value.senderEmail,
      receiver_name: searchEmailDetailForm.value.receiverName === '' ? null : searchEmailDetailForm.value.receiverName,
      receiver_email: searchEmailDetailForm.value.receiverEmail === '' ? null : searchEmailDetailForm.value.receiverEmail,
      receiver_birth: searchEmailDetailForm.value.receiverBirth ? getIsoDate(searchEmailDetailForm.value.receiverBirth) : null,
      receiver_level: searchEmailDetailForm.value.receiverLevel ? Number(searchEmailDetailForm.value.receiverLevel):null,
      start_date: searchEmailDetailForm.value.startDate ? getStartOfDay(searchEmailDetailForm.value.startDate) : null,
      end_date: searchEmailDetailForm.value.endDate ? getEndOfDay(searchEmailDetailForm.value.endDate) : null,
      email_status: searchEmailDetailForm.value.emailStatus ? Number(searchEmailDetailForm.value.emailStatus):null,
      page_num: emailDetailPagination.value.serverPage,
      page_size: emailDetailPagination.value.serverPageSize
    }
    console.log("搜索邮件详情请求数据", requestData);
    const res = await emailApi.filterEmail(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索邮件详情成功")
      console.log("搜索邮件详情响应数据", res);
      emailDetailPagination.value.totalItems = res.data.total_items
      emailDetailPagination.value.cachedData.set(emailDetailPagination.value.serverPage, res.data.email_info)
      console.log("搜索邮件详情缓存数据", emailDetailPagination.value.cachedData.get(emailDetailPagination.value.serverPage));
    } else {
      errorHandler.showError("搜索邮件详情失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索邮件详情失败,请重试", error);
  }
}
// 重置邮件详情
const resetEmailDetail = () => {
  clearEmailDetailCache()
  searchEmailDetailForm.value = {
    taskId: searchEmailDetailForm.value.taskId, // 任务ID
    subject: null, // 主题名称
    senderName: null, // 发件人
    senderEmail: null, // 发件人邮箱
    receiverName: null, // 收件人
    receiverEmail: null, // 收件人邮箱
    receiverBirth: null, // 收件人生日
    receiverLevel: null, // 收件人等级
    startDate: null, // 开始时间
    endDate: null, // 结束时间
    emailStatus: null, // 邮件状态
  }
}

// ==============未送达邮件==============
// 搜索未送达邮件点击事件
const searchUndeliveredClick = async () => {
  clearUndeliveredCache()
  await searchUndelivered()
}
// 搜索未送达邮件
const searchUndelivered = async () => {
  try {
    try {
      await undeliveredSearchFormRef.value?.validate()
    } catch (error) {
      ElMessage.warning("请正确选择时间")
      console.log("请正确选择未送达搜索时间：", error);
      return
    }
    const requestData = {
      subject: undeliveredSearchForm.value.subject === '' ? null : undeliveredSearchForm.value.subject,
      sender_name: undeliveredSearchForm.value.sender_name === '' ? null : undeliveredSearchForm.value.sender_name,
      sender_email: undeliveredSearchForm.value.sender_email === '' ? null : undeliveredSearchForm.value.sender_email,
      receiver_name: undeliveredSearchForm.value.receiver_name === '' ? null : undeliveredSearchForm.value.receiver_name,
      receiver_email: undeliveredSearchForm.value.receiver_email === '' ? null : undeliveredSearchForm.value.receiver_email,
      receiver_level: undeliveredSearchForm.value.receiver_level ? Number(undeliveredSearchForm.value.receiver_level) : null,
      receiver_birth: undeliveredSearchForm.value.receiver_birth ? getIsoDate(undeliveredSearchForm.value.receiver_birth) : null,
      task_type: undeliveredSearchForm.value.task_type ? Number(undeliveredSearchForm.value.task_type) : null,
      email_type_id: undeliveredSearchForm.value.email_type_id === '' ? null : undeliveredSearchForm.value.email_type_id,
      start_date: undeliveredSearchForm.value.start_date ? getStartOfDay(undeliveredSearchForm.value.start_date) : null,
      end_date: undeliveredSearchForm.value.end_date ? getEndOfDay(undeliveredSearchForm.value.end_date) : null,
      resend_status: undeliveredSearchForm.value.resend_status ? Number(undeliveredSearchForm.value.resend_status) : null,
      resend_start_date: undeliveredSearchForm.value.resend_start_date ? getStartOfDay(undeliveredSearchForm.value.resend_start_date) : null,
      resend_end_date: undeliveredSearchForm.value.resend_end_date ? getEndOfDay(undeliveredSearchForm.value.resend_end_date) : null,
      page_num: undeliveredPagination.value.serverPage,
      page_size: undeliveredPagination.value.serverPageSize
    }
    console.log("搜索未送达邮件请求数据", requestData);
    const res = await undeliveredEmailApi.searchUndeliveredEmail(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索未送达邮件成功")
      console.log("搜索未送达邮件响应数据", res);
      undeliveredPagination.value.totalItems = res.data.total_items
      undeliveredPagination.value.cachedData.set(undeliveredPagination.value.serverPage, res.data.email_info)
      console.log("搜索未送达邮件缓存数据", undeliveredPagination.value.cachedData.get(undeliveredPagination.value.serverPage));
    } else {
      errorHandler.showError("搜索未送达邮件失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索未送达邮件失败,请重试", error);
  }
}
// 重置未送达邮件
const resetUndelivered = () => {
  clearUndeliveredCache()
  undeliveredSearchForm.value = {
    subject: null, // 主题名称
    senderName: null, // 发件人
    senderEmail: null, // 发件人邮箱
    receiverName: null, // 收件人
    receiverEmail: null, // 收件人邮箱
    receiverBirth: null, // 收件人生日
    receiverLevel: null, // 收件人等级
    taskType: null, // 任务类型
    emailTypeId: null, // 邮件类型ID
    emailTypeOptions: [], // 邮件类型名称
    resendStatus: null, // 重发状态
    startDate: null, // 开始时间
    endDate: null, // 结束时间
    resendStartDate: null, // 重发开始时间
    resendEndDate: null, // 重发结束时间
  }
}
// 重发未送达邮件
const resendUndelivered = async (row) => {
  try {
    const requestData = {
      email_id: row.emailId,
    }
    console.log("重发未送达邮件请求数据", requestData);
    const res = await undeliveredEmailApi.sendUndeliveredEmail(requestData)
    if (res.code === 200) {
      ElMessage.success("重发未送达邮件成功")
      console.log("重发未送达邮件响应数据", res);
    } else {
      errorHandler.showError("重发未送达邮件失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("重发未送达邮件失败,请重试", error);
  }
}
//================================分页========================================
// 所有邮件任务
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
  await searchAllEmailTask()

}
const clearEmailTaskCache = () => {
  emailTaskPagination.value.currentPage = 1;
  emailTaskPagination.value.serverPage = 1;
  emailTaskPagination.value.cachedData.clear();
  emailTaskPagination.value.totalItems = 0;
}

// 邮件详情
const emailDetailPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 15, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const emailDetailCurrentPageData = computed(() => {
  const displayPageSize = emailDetailPagination.value.displayPageSize  // 10
  const serverPageSize = emailDetailPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((emailDetailPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = emailDetailPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((emailDetailPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleEmailDetailLoadData = async (serverPage) => {
  console.log("邮件详情分页组件计算出的页码：",serverPage);
  if(emailDetailPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  emailDetailPagination.value.serverPage = serverPage
  await searchEmailDetail()

}
const clearEmailDetailCache = () => {
  emailDetailPagination.value.currentPage = 1;
  emailDetailPagination.value.serverPage = 1;
  emailDetailPagination.value.cachedData.clear();
  emailDetailPagination.value.totalItems = 0;
}

// 未送达邮件
const undeliveredPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 15, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const undeliveredCurrentPageData = computed(() => {
  const displayPageSize = undeliveredPagination.value.displayPageSize  // 10
  const serverPageSize = undeliveredPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((undeliveredPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = undeliveredPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((undeliveredPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleUndeliveredLoadData = async (serverPage) => {
  console.log("未送达邮件分页组件计算出的页码：",serverPage);
  if(undeliveredPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  undeliveredPagination.value.serverPage = serverPage
  await searchUndelivered()

}
const clearUndeliveredCache = () => {
  undeliveredPagination.value.currentPage = 1;
  undeliveredPagination.value.serverPage = 1;
  undeliveredPagination.value.cachedData.clear();
  undeliveredPagination.value.totalItems = 0;
}
//================================对话框控制========================================
// 对话框控制
const emailDetailsDialog = ref(false);
const strategyDialogVisible = ref(false);

// 打开查看邮件详情对话框
const openEmailDetails = async (row) => {
  try {
    searchEmailDetailForm.value.taskId = row.task_id
    console.log("打开邮件详情对话框，邮件任务ID：", row.task_id);
    clearEmailDetailCache()
    const requestData = {
      email_task_id: row.task_id,
      page_num: emailDetailPagination.value.serverPage,
      page_size: emailDetailPagination.value.serverPageSize
    }
    console.log("第一次搜索邮件详情请求数据", requestData);
    const res = await emailApi.filterEmail(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索邮件详情成功")
      console.log("第一次搜索邮件详情响应数据", res);
      emailDetailPagination.value.totalItems = res.data.total_items
      emailDetailPagination.value.cachedData.set(emailDetailPagination.value.serverPage, res.data.email_info)
      console.log("第一次搜索邮件详情缓存数据", emailDetailPagination.value.cachedData.get(emailDetailPagination.value.serverPage));
      emailDetailsDialog.value = true;
    } else {
      errorHandler.showError("第一次搜索邮件详情失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("第一次搜索邮件详情失败,请重试", error);
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
    console.log("搜索所有邮件任务邮件类型请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      searchAllEmailTaskForm.value.emailTypeOptions = res.data.email_type
      console.log("搜索所有邮件任务邮件类型响应数据", res);
      console.log("搜索所有邮件任务邮件类型缓存数据", searchAllEmailTaskForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("搜索所有邮件任务邮件类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索所有邮件任务邮件类型失败,请重试", error);
  }
}
const debouncedSearchEmailType = debounce(chooseSearchEmailType, 500)

// 未送达邮件搜索邮件类型,防抖函数
const chooseUndeliveredSearchEmailType = async (query) => {
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索未送达邮件邮件类型请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      undeliveredSearchForm.value.emailTypeOptions = res.data.email_type
      console.log("搜索未送达邮件邮件类型响应数据", res);
      console.log("搜索未送达邮件邮件类型缓存数据", undeliveredSearchForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("搜索未送达邮件邮件类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索未送达邮件邮件类型失败,请重试", error);
}}
const debouncedUndeliveredSearchEmailType = debounce(chooseUndeliveredSearchEmailType, 500)


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

// 获取iso格式日期
const getIsoDate = (date) => {
  if (!date) return null

  // 创建一个新的日期对象
  const localDate = new Date(date)

  // 获取年月日
  const year = localDate.getFullYear()
  const month = String(localDate.getMonth() + 1).padStart(2, '0')  // 月份从0开始，需要+1
  const day = String(localDate.getDate()).padStart(2, '0')

  // 返回 YYYY-MM-DD 格式
  return `${year}-${month}-${day}T00:00:00Z`
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
// 获取收件人等级
const getReceiverLevel = (level) => {
  if(level === 1){
    return "初级"
  }
  if(level === 2){
    return "中级"
  }
  if(level === 3){
    return "高级"
  }
}
// 获取重发状态
const getResendStatus = (status) => {
  if(status === 0){
    return '未重发'
  }else if(status === 1){
    return '重发成功'
  }else if(status === 2){
    return '重发失败'
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
// 通过时间戳获取日期
const getDateByTimestamp = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp * 1000)
  return date.getFullYear() + '-' +
         String(date.getMonth() + 1).padStart(2, '0') + '-' +
         String(date.getDate()).padStart(2, '0') + ' ' +
         String(date.getHours()).padStart(2, '0') + ':' +
         String(date.getMinutes()).padStart(2, '0') + ':' +
         String(date.getSeconds()).padStart(2, '0')
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

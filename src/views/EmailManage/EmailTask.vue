<template>
  <div class="EmailTask">
    <div class="EmailTaskContainer">
      <el-tabs v-model="currentTab" @tab-click="handleTabClick">
        <el-tab-pane label="手动发送" name="manual">
          <el-tabs type="border-card">
            <el-tab-pane label="管理手动发送任务">
              <!-- 搜索框 -->
              <div>
                <el-form
                  style="display: flex;flex-flow:row wrap;gap: 10px;"
                  :model="manualTaskSearchForm">
                  <el-form-item>
                    <el-input v-model="manualTaskSearchForm.subject" style="width: 200px;" placeholder="请搜索主题名称" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="manualTaskSearchForm.senderName" style="width: 200px;" placeholder="请搜索发件人" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="manualTaskSearchForm.senderEmail" style="width: 200px;" placeholder="请搜索发件人邮箱" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-select
                      v-model="manualTaskSearchForm.emailTypeId"
                      placeholder="请搜索邮件类型"
                      filterable
                      remote
                      :remote-method="debouncedSearchEmailType"
                      clearable
                      style="width:200px;"
                    >
                      <el-option
                        v-for="emailType in manualTaskSearchForm.emailTypeOptions"
                        :key="emailType.email_type_id"
                        :label="emailType.email_type_name"
                        :value="emailType.email_type_id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-date-picker
                      style="width: 200px"
                      v-model="manualTaskSearchForm.startDate"
                      type="date"
                      placeholder="选择开始时间"
                      clearable
                      :format="dateFormat"
                      @change="handleMonthChange"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-select v-model="manualTaskSearchForm.taskStatus" style="width: 200px" placeholder="选择任务状态" clearable>
                      <el-option label="发送中" :value="emailData.EmailTaskStatus.SendStart"></el-option>
                      <el-option label="发送暂停" :value="emailData.EmailTaskStatus.SendPause"></el-option>
                      <el-option label="发送终止" :value="emailData.EmailTaskStatus.SendStop"></el-option>
                      <el-option label="发送成功" :value="emailData.EmailTaskStatus.SendSuccess"></el-option>
                      <el-option label="发送失败" :value="emailData.EmailTaskStatus.SendError"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="searchManualTaskClick">搜索</el-button>
                    <el-button type="primary" @click="resetSearchManualTask">
                      <el-icon>
                        <Refresh/>
                      </el-icon>
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="manualTaskCurrentPageData" border style="width: 1200px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发件人列 -->
                  <el-table-column label="发件人" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sender_name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="发件人邮箱" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sender_email }}</span>
                    </template>
                  </el-table-column>

                  <!-- 邮件类型列 -->
                  <el-table-column label="邮件类型" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.email_type_name }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发送时间列 -->
                  <el-table-column label="发送时间" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.start_date }}</span>
                    </template>
                  </el-table-column>

                  <!-- 任务状态列 -->
                  <el-table-column label="任务状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <span>{{ taskStatusChinese(row.task_status) }}</span>
                    </template>
                  </el-table-column>

                  <!-- 操作列 -->
                  <el-table-column label="操作" align="center" min-width="200">
                    <template #default="{ row }">
                      <el-button
                        type="success"
                        size="small"
                        :disabled="row.task_status !== 2"
                        @click="manualTaskStart(row.task_id)"
                      >
                        开始
                      </el-button>
                      <el-button
                        type="warning"
                        size="small"
                        :disabled="row.task_status !== 1"
                        @click="manualTaskPause(row.task_id)"
                      >
                        暂停
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        :disabled="row.task_status !== 1 && row.task_status !== 2"
                        @click="manualTaskStop(row.task_id)"
                      >
                        终止
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>

              </div>

              <!-- 分页 -->
              <div>
                <SmartPagination
                  v-model:current-page="manualTaskPagination.currentPage"
                  :server-page-size="manualTaskPagination.serverPageSize"
                  :display-page-size="manualTaskPagination.displayPageSize"
                  :total="manualTaskPagination.totalItems"
                  @load-data="handleManualTaskLoadData" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane label="循环发送" name="circle">
          <el-tabs type="border-card">
            <el-tab-pane label="管理循环发送任务">
              <!-- 搜索框 -->
              <div>
                <el-form
                  style="display: flex;flex-flow:row wrap;gap: 10px;"
                  :model="circleTaskSearchForm"
                  ref="circleTaskSearchFormRef"
                  :rules="circleTaskSearchFormRules">
                  <el-form-item>
                    <el-input v-model="circleTaskSearchForm.subject" style="width: 200px;" placeholder="请搜索主题名称" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="circleTaskSearchForm.senderName" style="width: 200px;" placeholder="请搜索发件人" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="circleTaskSearchForm.senderEmail" style="width: 200px;" placeholder="请搜索发件人邮箱" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-select
                        v-model="circleTaskSearchForm.emailTypeId"
                        placeholder="请搜索邮件类型"
                        filterable
                        remote
                        :remote-method="debouncedCircleSearchEmailType"
                        clearable
                        style="width:200px;"
                        >
                        <el-option
                        v-for="emailType in circleTaskSearchForm.emailTypeOptions"
                        :key="emailType.email_type_id"
                        :label="emailType.email_type_name"
                        :value="emailType.email_type_id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item prop="startDate">
                    <el-date-picker
                      style="width: 200px"
                      v-model="circleTaskSearchForm.startDate"
                      type="date"
                      placeholder="开始时间"
                      clearable
                      :format="dateFormat"
                      @change="handleMonthChange"
                    />
                  </el-form-item>
                  <el-form-item prop="endDate">
                    <el-date-picker
                      style="width: 200px"
                      v-model="circleTaskSearchForm.endDate"
                      type="date"
                      placeholder="结束时间"
                      clearable
                      :format="dateFormat"
                      @change="handleMonthChange"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-select v-model="circleTaskSearchForm.taskStatus" style="width: 200px" placeholder="选择任务状态" clearable>
                      <el-option label="发送中" :value="emailData.EmailTaskStatus.SendStart"></el-option>
                      <el-option label="发送暂停" :value="emailData.EmailTaskStatus.SendPause"></el-option>
                      <el-option label="发送终止" :value="emailData.EmailTaskStatus.SendStop"></el-option>
                      <el-option label="发送重置" :value="emailData.EmailTaskStatus.SendReset"></el-option>
                      <el-option label="发送成功" :value="emailData.EmailTaskStatus.SendSuccess"></el-option>
                      <el-option label="发送失败" :value="emailData.EmailTaskStatus.SendError"></el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="searchCircleTaskClick">搜索</el-button>
                    <el-button type="primary" @click="resetSearchCircleTask">
                      <el-icon>
                        <Refresh/>
                      </el-icon>
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="circleTaskCurrentPageData" border style="width: 1200px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发件人列 -->
                  <el-table-column label="发件人" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sender_name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="发件人邮箱" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sender_email }}</span>
                    </template>
                  </el-table-column>

                  <!-- 邮件类型列 -->
                  <el-table-column label="邮件类型" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.email_type_name }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发送时间列 -->
                  <el-table-column label="开始时间" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.start_date }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="结束时间" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.end_date }}</span>
                    </template>
                  </el-table-column>

                  <!-- 任务状态列 -->
                  <el-table-column label="任务状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <span>{{ taskStatusChinese(row.task_status) }}</span>
                    </template>
                  </el-table-column>

                  <!-- 操作列 -->
                  <el-table-column label="操作" align="center" min-width="280">
                    <template #default="{ row }">
                      <el-button
                        type="success"
                        size="small"
                        :disabled="row.task_status !== 2"
                        @click="circleTaskStart(row.task_id)"
                      >
                        开始
                      </el-button>
                      <el-button
                        type="warning"
                        size="small"
                        :disabled="row.task_status !== 1"
                        @click="circleTaskPause(row.task_id)"
                      >
                        暂停
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        :disabled="row.task_status !== 1 && row.task_status !== 2"
                        @click="circleTaskStop(row.task_id)"
                      >
                        终止
                      </el-button>
                      <el-button
                        type="primary"
                        size="small"
                        @click="circleTaskReset(row.task_id)"
                      >
                        重置
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 分页 -->
              <div>
                <SmartPagination
                  v-model:current-page="circleTaskPagination.currentPage"
                  :server-page-size="circleTaskPagination.serverPageSize"
                  :display-page-size="circleTaskPagination.displayPageSize"
                  :total="circleTaskPagination.totalItems"
                  @load-data="handleCircleTaskLoadData" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 小管理目前不需要这两种任务 -->
        <el-tab-pane v-if="false" label="节日发送" name="festival">
          <el-tabs type="border-card">
            <el-tab-pane label="管理节日发送任务">
              <!-- 开启节日发送 -->
              <div class="sendEmailContainer">

                <el-form :model="festivalTaskForm" label-width="150px" label-position="left">

                  <el-form-item label="发送时间：">
                    <el-date-picker
                      v-model="festivalTaskForm.start_date"
                      type="datetime"
                      placeholder="发送时间"
                      :format="dateFormat"
                      :disabledDate="(time) => time.getTime() < Date.now()"
                      @change="handleMonthChange"
                      style="width:200px;"
                    />
                  </el-form-item>

                  <el-form-item label="邮件类型">
                    <el-select
                        v-model="festivalTaskForm.email_type_id"
                        placeholder="请搜索邮件类型"
                        filterable
                        remote
                        :remote-method="debouncedCreateFestivalTaskEmailType"
                        clearable
                        style="width:200px;"
                        >
                        <el-option
                        v-for="emailType in festivalTaskForm.emailTypeOptions"
                        :key="emailType.email_type_id"
                        :label="emailType.email_type_name"
                        :value="emailType.email_type_id" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="选择收件人：">
                    <!-- 供应商 -->
                    <el-button type="primary" @click="openSupplierDialog">
                      <el-icon style="vertical-align: middle">
                        <CirclePlus/>
                      </el-icon>
                      <span style="vertical-align: middle"> 供应商 </span>
                    </el-button>
                    <span v-if="festivalTaskForm.supplier_value" style="margin-left: 10px">
                      <span>共 {{ festivalTaskForm.supplier_value.total_items }} 个供应商</span>
                    </span>
                    <!-- 客户 -->
                    <el-button type="primary" @click="openCustomerDialog">
                      <el-icon style="vertical-align: middle">
                        <CirclePlus/>
                      </el-icon>
                      <span style="vertical-align: middle"> 客户 </span>
                    </el-button>
                    <span v-if="festivalTaskForm.customer_value" style="margin-left: 10px">
                      <span>共 {{ festivalTaskForm.customer_value.total_items }} 个客户</span>
                    </span>
                    <!-- 筛选供应商对话框 -->
                    <ChooseReceiverDialog
                      v-model="receiverDialogVisible"
                      :receiver-type="currentReceiverType"
                      @select-receivers="handleReceiversSelect"
                    />
                  </el-form-item>

                  <el-form-item label="选择附件：">
                    <el-button
                      type="primary"
                      @click="openFestivalAttachmentDialog"
                    >
                      <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
                      <span style="vertical-align: middle"> 选择 </span>
                    </el-button>

                    <span v-if="festivalTaskForm.attachment && festivalTaskForm.attachment.length > 0" style="margin-left: 10px">
                      <span>共 {{ festivalTaskForm.attachment.length }} 个附件</span>
                      <el-button
                        size="mini"
                        type="text"
                        @click="checkAttachmentList(festivalTaskForm.attachment)">
                        查看
                      </el-button>
                    </span>

                    <ChooseAttachmentDialog
                      v-model="festivalAttachmentDialogVisible"
                      @update:attachments="handleFestivalAttachmentsUpdate"
                    />
                  </el-form-item>

                  <el-form-item label="选择模版：">
                    <el-button
                      type="primary"
                      @click="openFestivalTemplateDialog"
                    >
                      <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
                      <span style="vertical-align: middle"> 选择 </span>
                    </el-button>

                    <span v-if="festivalTaskForm.template_name" style="margin-left: 10px">
                      已选择模板: {{ festivalTaskForm.template_name }}
                    </span>

                    <ChooseTemplateDialog
                      v-model="festivalTemplateDialogVisible"
                      @select-template="handleFestivalTemplateSelect"
                    />
                  </el-form-item>

                  <el-form-item label="主题：">
                    <el-input
                      v-model="festivalTaskForm.subject"
                      style="width: 300px"
                      placeholder="请输入主题"
                      size="large"
                      clearable
                    />
                  </el-form-item>

                </el-form>

                <div>
                  <el-button type="primary" @click="createFestivalTask">创建</el-button>
                </div>
              </div>


              <!-- 分割线 -->
              <hr>

              <!-- 搜索框 -->
              <div>
                <el-form style="display: flex;flex-flow:row wrap;gap: 10px;" :model="festivalTaskSearchForm">
                  <el-form-item>
                    <el-input v-model="festivalTaskSearchForm.subject" style="width: 200px;" placeholder="请搜索主题名称" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="festivalTaskSearchForm.senderName" style="width: 200px;" placeholder="请搜索发件人" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="festivalTaskSearchForm.senderEmail" style="width: 200px;" placeholder="请搜索发件人邮箱" clearable></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-date-picker
                      v-model="festivalTaskSearchForm.startDate"
                      type="date"
                      placeholder="发送时间"
                      :format="dateFormat"
                      @change="handleMonthChange"
                      clearable
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-select v-model="festivalTaskSearchForm.taskStatus" style="width: 200px" placeholder="选择任务状态" clearable>
                      <el-option label="发送中" :value="emailData.EmailTaskStatus.SendStart"></el-option>
                      <el-option label="发送暂停" :value="emailData.EmailTaskStatus.SendPause"></el-option>
                      <el-option label="发送终止" :value="emailData.EmailTaskStatus.SendStop"></el-option>
                      <el-option label="发送成功" :value="emailData.EmailTaskStatus.SendSuccess"></el-option>
                      <el-option label="发送失败" :value="emailData.EmailTaskStatus.SendError"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="searchFestivalTaskClick">搜索</el-button>
                    <el-button type="primary" @click="resetSearchFestivalTask">
                      <el-icon>
                        <Refresh/>
                      </el-icon>
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="festivalTaskCurrentPageData" border style="width: 1200px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发件人列 -->
                  <el-table-column label="发件人" align="left" min-width="100">
                    <template #default="{ row }">
                      <span>{{ row.sender_name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="发件人邮箱" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sender_email }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发送时间列 -->
                  <el-table-column label="发送时间" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.start_date }}</span>
                    </template>
                  </el-table-column>

                  <!-- 任务状态列 -->
                  <el-table-column label="任务状态" align="center" min-width="100">
                    <template #default="{ row }">
                      <span>{{ taskStatusChinese(row.task_status) }}</span>
                    </template>
                  </el-table-column>

                  <!-- 操作列 -->
                  <el-table-column label="操作" align="center" min-width="200">
                    <template #default="{ row }">
                      <el-button
                        type="success"
                        size="small"
                        :disabled="row.task_status !== 2"
                        @click="festivalTaskStart(row.task_id)"
                      >
                        开始
                      </el-button>
                      <el-button
                        type="warning"
                        size="small"
                        :disabled="row.task_status !== 1"
                        @click="festivalTaskPause(row.task_id)"
                      >
                        暂停
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        :disabled="row.task_status !== 1 && row.task_status !== 2"
                        @click="festivalTaskStop(row.task_id)"
                      >
                        终止
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 分页 -->
              <div>
                <SmartPagination
                  v-model:current-page="festivalTaskPagination.currentPage"
                  :server-page-size="festivalTaskPagination.serverPageSize"
                  :display-page-size="festivalTaskPagination.displayPageSize"
                  :total="festivalTaskPagination.totalItems"
                  @load-data="handleFestivalTaskLoadData" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane v-if="false" label="生日发送" name="birth">
          <el-tabs type="border-card">
            <el-tab-pane label="管理生日发送任务">
              <!-- 开启生日发送 -->
              <div class="sendEmailContainer">
                <el-form :model="birthTaskInfo">

                  <el-form-item>
                    <el-switch
                      v-model="startBirth"
                      size="large"
                      inline-prompt
                      @change="handleSwitchChange"
                      style="margin-right: 10px;"
                    />
                    <span v-if="startBirth === true">当前状态：开启</span>
                    <span v-if="startBirth === false">当前状态：暂停</span>
                  </el-form-item>

                  <el-form-item label="选择附件：">
                    <el-button
                      type="primary"
                      @click="openBirthAttachmentDialog"
                      :disabled="startBirth === true"
                    >
                      <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
                      <span style="vertical-align: middle"> 选择 </span>
                    </el-button>

                    <span v-if="birthTaskChangeForm.attachment && birthTaskChangeForm.attachment.length > 0" style="margin-left: 10px">
                      <span>共 {{ birthTaskChangeForm.attachment.length }} 个附件</span>
                      <el-button
                        size="mini"
                        type="text"
                        @click="checkAttachmentList(birthTaskChangeForm.attachment)">
                        查看
                      </el-button>
                    </span>

                    <ChooseAttachmentDialog
                      v-model="birthAttachmentDialogVisible"
                      @update:attachments="handleBirthAttachmentsUpdate"
                    />
                  </el-form-item>

                  <el-form-item label="选择模版：">
                    <el-button
                      type="primary"
                      @click="openBirthTemplateDialog"
                      :disabled="startBirth === true"
                    >
                      <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
                      <span style="vertical-align: middle"> 选择 </span>
                    </el-button>

                    <span v-if="birthTaskChangeForm.template_name" style="margin-left: 10px">
                      已选择模板: {{ birthTaskChangeForm.template_name }}
                    </span>

                    <ChooseTemplateDialog
                      v-model="birthTemplateDialogVisible"
                      @select-template="handleBirthTemplateSelect"
                    />
                  </el-form-item>

                  <el-form-item label="主题：">
                    <el-input
                      v-model="birthTaskChangeForm.subject"
                      style="width: 300px"
                      placeholder="请输入主题"
                      size="large"
                      :disabled="startBirth === true"
                      clearable
                    />
                  </el-form-item>
                </el-form>
              </div>

              <!-- 分割线 -->
              <hr>

              <!-- 搜索框 -->
              <div>
                <el-form
                  ref="birthEmailSearchFormRef"
                  :model="birthEmailSearchForm"
                  :rules="birthEmailSearchFormRules"
                  style="display: flex;flex-flow: row wrap;gap: 10px;margin-top: 20px;">
                  <el-form-item>
                    <el-input v-model="birthEmailSearchForm.subject" style="width: 200px;" placeholder="请搜索主题名称" clearable>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="birthEmailSearchForm.senderName" style="width: 200px;" placeholder="请搜索发件人" clearable>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="birthEmailSearchForm.senderEmail" style="width: 200px;" placeholder="请搜索发件人邮箱" clearable>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="birthEmailSearchForm.receiverName" style="width: 200px;" placeholder="请搜索收件人" clearable>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="birthEmailSearchForm.receiverEmail" style="width: 200px;" placeholder="请搜索收件人邮箱" clearable>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-select v-model="birthEmailSearchForm.receiverLevel" style="width: 200px;" placeholder="收件人等级" clearable>
                      <el-option label="初级" value="1"></el-option>
                      <el-option label="中级" value="2"></el-option>
                      <el-option label="高级" value="3"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-select style="width: 200px;" placeholder="邮件状态" v-model="birthEmailSearchForm.status" clearable>
                      <el-option label="已送达" :value="statusData.EMAIL_STATUS_SUCCESS"></el-option>
                      <el-option label="未送达" :value="statusData.EMAIL_STATUS_FAILED"></el-option>
                      <el-option label="发送错误" :value="statusData.EMAIL_STATUS_BOUNCE"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-date-picker style="width: 200px;" v-model="birthEmailSearchForm.receiverBirth" type="date" placeholder="收件人生日" clearable/>
                  </el-form-item>
                  <el-form-item prop="startDate">
                    <el-date-picker style="width: 200px;" v-model="birthEmailSearchForm.startDate" type="date" placeholder="开始时间" clearable/>
                  </el-form-item>
                  <el-form-item prop="endDate">
                    <el-date-picker style="width: 200px;" v-model="birthEmailSearchForm.endDate" type="date" placeholder="结束时间" clearable/>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="searchBirthEmailClick">搜索</el-button>
                    <el-button type="primary" @click="resetSearchBirthEmail">
                      <el-icon>
                        <Refresh/>
                      </el-icon>
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="birthEmailCurrentPageData" border style="width: 1200px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
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
                  <el-table-column label="未送达详情"  min-width="300px" show-overflow-tooltip>
                    <template #default="{ row }">
                      {{ row.error_msg }}
                      <!-- <span v-if="row.email_status === statusData.EMAIL_STATUS_SUCCESS">无</span>
                      <span v-if="row.email_status === statusData.EMAIL_STATUS_FAILED">{{ row.error_msg }}</span> -->
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
                  <el-table-column label="开始时间" min-width="200px">
                    <template #default="{ row }">
                      {{ row.start_date }}
                    </template>
                  </el-table-column>
                  <el-table-column label="结束时间" min-width="200px">
                    <template #default="{ row }">
                      {{ row.end_date }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 分页 -->
              <div>
                <SmartPagination
                  v-model:current-page="birthEmailPagination.currentPage"
                  :server-page-size="birthEmailPagination.serverPageSize"
                  :display-page-size="birthEmailPagination.displayPageSize"
                  :total="birthEmailPagination.totalItems"
                  @load-data="handleBirthEmailLoadData" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 查看列表信息对话框 -->
        <ListDialog :title="详情" v-model="listDialog" :list="listDetails" />
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import SmartPagination from "@/components/SmartPagination.vue";
import { debounce } from "lodash";
import { emailTypeApi } from "@/api/dictionary/emailType.js";
import { emailApi } from "@/api/email/email.js";
import { errorHandler } from "@/utils/errorHandler.js";
import { emailTaskApi } from "@/api/email/task/emailTask.js";
import emailData from "@/constants/EmailConstantData.js";
import statusData from "@/constants/StatusConstantData.js";
import ChooseAttachmentDialog from "@/components/email/ChooseAttachmentDialog.vue";
import ChooseTemplateDialog from "@/components/email/ChooseTemplateDialog.vue";
import ListDialog from "@/components/ListDialog.vue";
import ChooseReceiverDialog from "@/components/email/ChooseReceiverDialog.vue";
//=============================数据=============================
const currentTab = ref("manual")
// 手动发送
const manualTaskSearchForm = ref({
  taskType: emailData.ManualTaskType,
  subject: null,
  senderName: null,
  senderEmail: null,
  emailTypeId: null,
  emailTypeOptions:[],
  startDate: null,
  taskStatus: null,
});

//循环发送
const circleTaskSearchForm = ref({
  taskType: emailData.CircleTaskType,
  subject: null,
  senderName: null,
  senderEmail: null,
  emailTypeId: null,
  emailTypeOptions:[],
  startDate: null,
  endDate: null,
  taskStatus: null,
});
const circleTaskSearchFormRef = ref(null)
const circleTaskSearchFormRules = {
  startDate: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !circleTaskSearchForm.value.endDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !circleTaskSearchForm.value.endDate) ||
                 (!value && circleTaskSearchForm.value.endDate)) {
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
        if (!value && !circleTaskSearchForm.value.startDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !circleTaskSearchForm.value.startDate) ||
                 (!value && circleTaskSearchForm.value.startDate)) {
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

// 节日发送
const festivalTaskSearchForm = ref({
  taskType: emailData.FestivalTaskType,
  subject: null,
  senderName: null,
  senderEmail: null,
  emailTypeId: null,
  emailTypeOptions:[],
  startDate: null,
  taskStatus: null,
});
const festivalTaskForm = ref({
  subject: null,
  start_date: null,
  supplier_value: null,
  customer_value: null,
  // receiver_id: [],
  // receiver_key: null,
  // receiver_supplier_id: null,
  // receiver_supplier_key: null,
  email_type_id: null,
  emailTypeOptions: [],
  template_id: null,
  template_name: null,
  attachment: [],
})

// 生日发送
const birthTaskInfo = ref({
  task_id: "",
  subject: "",
  task_status: 1,
})
const birthTaskChangeForm = ref({
  operate_status: null,
  subject: birthTaskInfo.value.subject,
  template_id: null,
  template_name: null,
  attachment: [],
})
const birthEmailSearchForm = ref({
  task_id: null,
  subject: null,
  senderName: null,
  senderEmail: null,
  receiverName: null,
  receiverEmail: null,
  receiverLevel: null,
  receiverBirth: null,
  status: null,
  startDate: null,
  endDate: null,
});
const birthEmailSearchFormRef = ref(null)
const birthEmailSearchFormRules = {
  startDate: [
    {
      validator: (rule, value, callback) => {
        // 如果两个都没选，通过验证
        if (!value && !birthEmailSearchForm.value.endDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !birthEmailSearchForm.value.endDate) ||
                 (!value && birthEmailSearchForm.value.endDate)) {
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
        if (!value && !birthEmailSearchForm.value.startDate) {
          callback()
        }
        // 如果只选了一个，报错
        else if ((value && !birthEmailSearchForm.value.startDate) ||
                 (!value && birthEmailSearchForm.value.startDate)) {
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

//=============================功能=============================
// 手动发送
const searchManualTaskClick = async () => {
  clearManualTaskCache()
  await searchManualTask()
}
const searchManualTask = async () => {
  try {
    const requestData = {
      task_type: manualTaskSearchForm.value.taskType,
      email_type_id: manualTaskSearchForm.value.emailTypeId === '' ? null : manualTaskSearchForm.value.emailTypeId,
      subject: manualTaskSearchForm.value.subject === '' ? null : manualTaskSearchForm.value.subject,
      sender_name: manualTaskSearchForm.value.senderName === '' ? null : manualTaskSearchForm.value.senderName,
      sender_email: manualTaskSearchForm.value.senderEmail === '' ? null : manualTaskSearchForm.value.senderEmail,
      start_date: manualTaskSearchForm.value.startDate ? getStartOfDay(manualTaskSearchForm.value.startDate) : null,
      // 因为手动发送任务结束时间无法获取，所以就查询比开始时间多2天
      end_date: manualTaskSearchForm.value.startDate ? getManualEndOfDay(manualTaskSearchForm.value.startDate) : null,
      task_status: manualTaskSearchForm.value.taskStatus ? Number(manualTaskSearchForm.value.taskStatus) : null,
      page_num: manualTaskPagination.value.serverPage,
      page_size: manualTaskPagination.value.serverPageSize,
    }
    console.log("搜索手动发送邮件任务请求数据", requestData);
    const res = await emailApi.filterTask(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索成功");
      console.log("搜索手动发送邮件任务响应数据", res);
      manualTaskPagination.value.totalItems = res.data.total_items
      manualTaskPagination.value.cachedData.set(manualTaskPagination.value.serverPage, res.data.task_info)
    } else {
      errorHandler.showError("搜索手动发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索手动发送邮件任务失败,请重试", error);
  }
}
const resetSearchManualTask = () => {
  //clearManualTaskCache()
  manualTaskSearchForm.value = {
    taskType: emailData.ManualTaskType,
    subject: null,
    senderName: null,
    senderEmail: null,
    emailTypeId: null,
    emailTypeOptions:[],
    startDate: null,
    taskStatus: null,
  }
}
const manualTaskStart = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认开始手动发送邮件任务？',
        '开始确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 1,
    }
    console.log("开始手动发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("开始成功");
      console.log("开始手动发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(manualTaskPagination.value.cachedData.get(manualTaskPagination.value.serverPage)){
        manualTaskPagination.value.cachedData.get(manualTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 1;
          }
        })
      }
    } else {
      errorHandler.showError("开始手动发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了开始手动发送邮件任务操作')
    } else {
      errorHandler.showError("开始手动发送邮件任务失败,请重试", error);
    }
  }
}
const manualTaskPause = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认暂停手动发送邮件任务？',
        '暂停确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 2,
    }
    console.log("暂停手动发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("暂停成功");
      console.log("暂停手动发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(manualTaskPagination.value.cachedData.get(manualTaskPagination.value.serverPage)){
        manualTaskPagination.value.cachedData.get(manualTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 2;
          }
        })
      }
    } else {
      errorHandler.showError("暂停手动发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了暂停手动发送邮件任务操作')
    } else {
      errorHandler.showError("暂停手动发送邮件任务失败,请重试", error);
    }
  }
}
const manualTaskStop = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认终止手动发送邮件任务？',
        '终止确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 3,
    }
    console.log("终止手动发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("终止成功");
      console.log("终止手动发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(manualTaskPagination.value.cachedData.get(manualTaskPagination.value.serverPage)){
        manualTaskPagination.value.cachedData.get(manualTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 3;
          }
        })
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了终止手动发送邮件任务操作')
    } else {
      errorHandler.showError("终止手动发送邮件任务失败,请重试", error);
    }
  }
}


// 循环发送
const searchCircleTaskClick = async () => {
  clearCircleTaskCache()
  await searchCircleTask()
}
const searchCircleTask = async () => {
  try {
    try {
      await circleTaskSearchFormRef.value.validate()
    } catch (error) {
      ElMessage.warning("请正确选择开始、结束时间");
      console.log("搜索循环发送邮件任务请正确选择开始、结束时间", error);
      return
    }
    const requestData = {
      task_type: circleTaskSearchForm.value.taskType,
      email_type_id: circleTaskSearchForm.value.emailTypeId === '' ? null : circleTaskSearchForm.value.emailTypeId,
      subject: circleTaskSearchForm.value.subject === '' ? null : circleTaskSearchForm.value.subject,
      sender_name: circleTaskSearchForm.value.senderName === '' ? null : circleTaskSearchForm.value.senderName,
      sender_email: circleTaskSearchForm.value.senderEmail === '' ? null : circleTaskSearchForm.value.senderEmail,
      start_date: circleTaskSearchForm.value.startDate ? getStartOfDay(circleTaskSearchForm.value.startDate) : null,
      end_date: circleTaskSearchForm.value.endDate ? getEndOfDay(circleTaskSearchForm.value.endDate) : null,
      task_status: circleTaskSearchForm.value.taskStatus ? Number(circleTaskSearchForm.value.taskStatus) : null,
      page_num: circleTaskPagination.value.serverPage,
      page_size: circleTaskPagination.value.serverPageSize,
    }
    console.log("搜索循环发送邮件任务请求数据", requestData);
    const res = await emailApi.filterTask(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索成功");
      console.log("搜索循环发送邮件任务响应数据", res);
      circleTaskPagination.value.totalItems = res.data.total_items
      circleTaskPagination.value.cachedData.set(circleTaskPagination.value.serverPage, res.data.task_info)
    } else {
      errorHandler.showError("搜索循环发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索循环发送邮件任务失败,请重试", error);
  }
}
const resetSearchCircleTask = () => {
  //clearCircleTaskCache()
  circleTaskSearchForm.value = {
    taskType: emailData.CircleTaskType,
    subject: null,
    senderName: null,
    senderEmail: null,
    emailTypeId: null,
    emailTypeOptions:[],
    startDate: null,
    endDate: null,
    taskStatus: null,
  }
}
const circleTaskStart = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认开始循环发送邮件任务？',
        '开始确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 1,
    }
    console.log("开始循环发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("开始成功");
      console.log("开始循环发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage)){
        circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 1;
          }
        })
      }
    } else {
      errorHandler.showError("开始循环发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了开始循环发送邮件任务操作')
    } else {
      errorHandler.showError("开始循环发送邮件任务失败,请重试", error);
    }
  }
}
const circleTaskPause = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认暂停循环发送邮件任务？',
        '暂停确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 2,
    }
    console.log("暂停循环发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("暂停成功");
      console.log("暂停循环发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage)){
        circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 2;
          }
        })
      }
    }else{
      errorHandler.showError("暂停循环发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了暂停循环发送邮件任务操作')
    } else {
      errorHandler.showError("暂停循环发送邮件任务失败,请重试", error);
    }
  }
}
const circleTaskStop = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认终止循环发送邮件任务？',
        '终止确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 3,
    }
    console.log("终止循环发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("终止成功");
      console.log("终止循环发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage)){
        circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 3;
          }
        })
      }
    }else{
      errorHandler.showError("终止循环发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了终止循环发送邮件任务操作')
    } else {
      errorHandler.showError("终止循环发送邮件任务失败,请重试", error);
    }
  }
}
const circleTaskReset = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认重置循环发送邮件任务？',
        '重置确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      //operate_status: "4",
    }
    console.log("重置循环发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.resetStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("重置成功");
      console.log("重置循环发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage)){
        circleTaskPagination.value.cachedData.get(circleTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 4;
          }
        })
      }
    }else{
      errorHandler.showError("重置循环发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了重置循环发送邮件任务操作')
    } else {
      errorHandler.showError("重置循环发送邮件任务失败,请重试", error);
    }
  }
}

// 节日发送
const searchFestivalTaskClick = async () => {
  clearFestivalTaskCache()
  await searchFestivalTask()
}
const searchFestivalTask = async () => {
  try {
    const requestData = {
      task_type: festivalTaskSearchForm.value.taskType,
      subject: festivalTaskSearchForm.value.subject === '' ? null : festivalTaskSearchForm.value.subject,
      sender_name: festivalTaskSearchForm.value.senderName === '' ? null : festivalTaskSearchForm.value.senderName,
      sender_email: festivalTaskSearchForm.value.senderEmail === '' ? null : festivalTaskSearchForm.value.senderEmail,
      start_date: festivalTaskSearchForm.value.startDate ? getStartOfDay(festivalTaskSearchForm.value.startDate) : null,
      // 因为节日发送任务结束时间肯定是当天的，所以就查询从开始时间早0点到当天的结束时间晚0点
      end_date: festivalTaskSearchForm.value.startDate ? getEndOfDay(festivalTaskSearchForm.value.startDate) : null,
      task_status: festivalTaskSearchForm.value.taskStatus ? Number(festivalTaskSearchForm.value.taskStatus) : null,
      page_num: festivalTaskPagination.value.serverPage,
      page_size: festivalTaskPagination.value.serverPageSize,
    }
    console.log("搜索节日发送邮件任务请求数据", requestData);
    const res = await emailApi.filterTask(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索成功");
      console.log("搜索节日发送邮件任务响应数据", res);
      festivalTaskPagination.value.totalItems = res.data.total_items
      festivalTaskPagination.value.cachedData.set(festivalTaskPagination.value.serverPage, res.data.task_info)
    } else {
      errorHandler.showError("搜索节日发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索节日发送邮件任务失败,请重试", error);
  }
}
const resetSearchFestivalTask = () => {
  //clearFestivalTaskCache()
  festivalTaskSearchForm.value = {
    taskType: emailData.FestivalTaskType,
    subject: null,
    senderName: null,
    senderEmail: null,
    emailTypeId: null,
    emailTypeOptions:[],
    startDate: null,
    taskStatus: null,
  }
}
const festivalTaskStart = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认开始节日发送邮件任务？',
        '开始确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 1,
    }
    console.log("开始节日发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("开始成功");
      console.log("开始节日发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(festivalTaskPagination.value.cachedData.get(festivalTaskPagination.value.serverPage)){
        festivalTaskPagination.value.cachedData.get(festivalTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 1;
          }
        })
      }
    } else {
      errorHandler.showError("开始节日发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了开始节日发送邮件任务操作')
    } else {
      errorHandler.showError("开始节日发送邮件任务失败,请重试", error);
    }
  }
}
const festivalTaskPause = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认暂停节日发送邮件任务？',
        '暂停确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 2,
    }
    console.log("暂停节日发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("暂停成功");
      console.log("暂停节日发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(festivalTaskPagination.value.cachedData.get(festivalTaskPagination.value.serverPage)){
        festivalTaskPagination.value.cachedData.get(festivalTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 2;
          }
        })
      }
    } else {
      errorHandler.showError("暂停节日发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了暂停节日发送邮件任务操作')
    } else {
      errorHandler.showError("暂停节日发送邮件任务失败,请重试", error);
    }
  }
}
const festivalTaskStop = async (taskId) => {
  try {
    // 先弹窗确认
    await ElMessageBox.confirm(
        '是否确认终止节日发送邮件任务？',
        '终止确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      email_task_id: taskId,
      operate_status: 3,
    }
    console.log("终止节日发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.updateStatus(requestData)
    if (res.code === 200) {
      ElMessage.success("终止成功");
      console.log("终止节日发送邮件任务响应数据", res);
      // 更新本地缓存状态
      if(festivalTaskPagination.value.cachedData.get(festivalTaskPagination.value.serverPage)){
        festivalTaskPagination.value.cachedData.get(festivalTaskPagination.value.serverPage).forEach(item => {
          if(item.task_id === taskId){
            item.task_status = 3;
          }
        })
      }
    } else {
      errorHandler.showError("终止节日发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了终止节日发送邮件任务操作')
    } else {
      errorHandler.showError("终止节日发送邮件任务失败,请重试", error);
    }
  }
}
const createFestivalTask = async () => {
  try {
    if(!await createFestivalTaskValidate()){
      return
    }
    const requestData = {
      subject: festivalTaskForm.value.subject,
      template_id: festivalTaskForm.value.template_id,
      attachment: festivalTaskForm.value.attachment,
      email_type_id: festivalTaskForm.value.email_type_id,
      start_date: festivalTaskForm.value.start_date ? getStartOfDay(festivalTaskForm.value.start_date) : null,
      receiver_id: festivalTaskForm.value.customer_value?.receiver_ids || [],
      receiver_key: festivalTaskForm.value.customer_value?.receiver_key || null,
      receiver_supplier_id: festivalTaskForm.value.supplier_value?.receiver_ids || [],
      receiver_supplier_key: festivalTaskForm.value.supplier_value?.receiver_key || null,
    }
    console.log("创建节日发送邮件任务请求数据", requestData);
    const res = await emailTaskApi.createFestival(requestData)
    if (res.code === 200) {
      ElMessage.success("创建成功");
      console.log("创建节日发送邮件任务响应数据", res);
      resetSearchFestivalTask()
      festivalTaskForm.value = {
        subject: null,
        start_date: null,
        supplier_value: null,
        customer_value: null,
        email_type_id: null,
        emailTypeOptions: [],
        template_id: null,
        template_name: null,
        attachment: [],
      }
    } else {
      errorHandler.showError("创建节日发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("创建节日发送邮件任务失败,请重试", error);
  }
}
const handleReceiversSelect = (result) => {
  if(result.type === emailData.ReceiverType.Supplier){
    festivalTaskForm.value.supplier_value = result
  }else if(result.type === emailData.ReceiverType.Customer){
    festivalTaskForm.value.customer_value = result
  }
  console.log('选中的接收者：', result)
  console.log('节日发送供应商数据：', festivalTaskForm.value.supplier_value)
  console.log('节日发送客户数据：', festivalTaskForm.value.customer_value)
  // result 格式：{ type: 1|2, total_items: 0, receiver_key: null, receiver_ids: [] }
}
const handleFestivalAttachmentsUpdate = (attachments) => {
  festivalTaskForm.value.attachment = attachments
  console.log('节日发送选中的附件：', attachments)
}
const handleFestivalTemplateSelect = (template) => {
  festivalTaskForm.value.template_id = template.id
  festivalTaskForm.value.template_name = template.name
  console.log('节日发送选中的模版：', template)
}

// 生日发送
const getBirthTaskId = async () => {
  try {
    // 如果本地缓存有生日邮件任务任务id，则直接返回
    if(localStorage.getItem("birthTaskInfo")){
      return
    }
    const requestData = {
      task_type: 4,
      page_num: 1,
      page_size: 5,
    }
    const res = await emailApi.filterTask(requestData)
    if (res.code === 200) {
      console.log("获取生日邮件任务响应数据", res);
      localStorage.setItem("birthTaskInfo", res.data.task_info[0])
      birthTaskInfo.value = res.data.task_info[0]
      // 如果直接使用birthTaskInfo.value，赋值的是内存对象，后面改值引用会报错。所以新定义变量赋值
      const task_id = birthTaskInfo.value.task_id
      birthEmailSearchForm.value.task_id = task_id
      console.log("获取生日邮件任务信息", birthEmailSearchForm.value);
    } else {
      errorHandler.showError("获取生日邮件任务失败,请刷新页面重试", res);
    }
  } catch (error) {
    errorHandler.showError("获取生日邮件任务失败,请刷新页面重试", error);
  }
}
const searchBirthEmailClick = async () => {
  clearBirthEmailCache()
  await searchBirthEmail()
}
const searchBirthEmail = async () => {
  try {
    try {
      await birthEmailSearchFormRef.value.validate()
    } catch (error) {
      ElMessage.warning("请正确选择开始、结束时间");
      console.log("搜索生日发送邮件详情请正确选择开始、结束时间", error);
      return
    }
    const requestData = {
      //email_task_id: birthEmailSearchForm.value.task_id,
      subject: birthEmailSearchForm.value.subject === '' ? null : birthEmailSearchForm.value.subject,
      sender_name: birthEmailSearchForm.value.senderName === '' ? null : birthEmailSearchForm.value.senderName,
      sender_email: birthEmailSearchForm.value.senderEmail === '' ? null : birthEmailSearchForm.value.senderEmail,
      receiver_name: birthEmailSearchForm.value.receiverName === '' ? null : birthEmailSearchForm.value.receiverName,
      receiver_email: birthEmailSearchForm.value.receiverEmail === '' ? null : birthEmailSearchForm.value.receiverEmail,
      receiver_level: birthEmailSearchForm.value.receiverLevel ? Number(birthEmailSearchForm.value.receiverLevel) : null,
      receiver_birth: birthEmailSearchForm.value.receiverBirth ? getIsoDate(birthEmailSearchForm.value.receiverBirth) : null,
      email_status: birthEmailSearchForm.value.status ? Number(birthEmailSearchForm.value.status) : null,
      start_date: birthEmailSearchForm.value.startDate ? getStartOfDay(birthEmailSearchForm.value.startDate) : null,
      end_date: birthEmailSearchForm.value.endDate ? getEndOfDay(birthEmailSearchForm.value.endDate) : null,
      page_num: birthEmailPagination.value.serverPage,
      page_size: birthEmailPagination.value.serverPageSize,
    }
    console.log("搜索生日发送邮件详情请求数据", requestData);
    const res = await emailApi.filterBirthEmail(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索成功");
      console.log("搜索生日发送邮件详情响应数据", res);
      birthEmailPagination.value.totalItems = res.data.total_items
      birthEmailPagination.value.cachedData.set(birthEmailPagination.value.serverPage, res.data.email_info)
      console.log("搜索生日发送邮件详情缓存数据", birthEmailPagination.value.cachedData.get(birthEmailPagination.value.serverPage));
    } else {
      errorHandler.showError("搜索生日发送邮件详情失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索生日发送邮件详情失败,请重试", error);
  }
}
const resetSearchBirthEmail = () => {
  //clearBirthEmailCache()
  birthEmailSearchForm.value = {
    taskId: birthTaskInfo.value.task_id,
    subject: "",
    senderName: "",
    senderEmail: "",
    receiverName: "",
    receiverEmail: "",
    receiverLevel: null,
    receiverBirth: null,
    status: null,
    startDate: null,
    endDate: null,
  }
}
const startBirth = computed({
  get: () => birthTaskInfo.value.task_status === emailData.EmailTaskStatus.SendStart,
  set: async (val) => {
    try {
      // 先弹窗确认
      await ElMessageBox.confirm(
        '是否确认开始/暂停生日发送邮件任务？',
        '开始/暂停确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
      )
      // 为真则表示要开始，为假则暂停任务
      if(val){
        if(birthTaskChangeForm.value.subject === null || birthTaskChangeForm.value.subject === ''|| birthTaskChangeForm.value.template_id === null){
          ElMessage.warning("请先填写主题、模版");
          return
        }
        birthTaskChangeForm.value.operate_status = birthTaskInfo.value.task_status
        const requestData = {
          operate_status: emailData.EmailTaskStatus.SendStart,
          subject: birthTaskChangeForm.value.subject,
          template_id: birthTaskChangeForm.value.template_id,
          attachment:birthTaskChangeForm.value.attachment
        }
        console.log("更新生日发送邮件任务状态请求数据", requestData);
        const res = await emailTaskApi.updateBirthdayTaskStatus(requestData)
        if (res.code === 200) {
          ElMessage.success("开始成功");
          birthTaskInfo.value.task_status = emailData.EmailTaskStatus.SendStart
        } else {
          errorHandler.showError("开始失败,请重试", res);
        }
      }else{
        const requestData = {
          operate_status: emailData.EmailTaskStatus.SendPause,
        }
        console.log("更新生日发送邮件任务状态请求数据", requestData);
        const res = await emailTaskApi.updateBirthdayTaskStatus(requestData)
        if (res.code === 200) {
          birthTaskInfo.value.task_status = emailData.EmailTaskStatus.SendPause
          ElMessage.success("暂停成功");
        } else {
          errorHandler.showError("暂停失败,请重试", res);
        }
      }
    } catch (error) {
      if (error === 'cancel') {
        console.log('用户取消了更新生日发送邮件任务状态操作')
      } else {
        errorHandler.showError("更新生日发送邮件任务状态失败,请重试", error);
      }
    }
  }
})
const handleBirthAttachmentsUpdate = (attachments) => {
  birthTaskChangeForm.value.attachment = attachments
  console.log('生日发送选中的附件：', attachments)
}
const handleBirthTemplateSelect = (template) => {
  birthTaskChangeForm.value.template_id = template.id
  birthTaskChangeForm.value.template_name = template.name
  console.log('生日发送选中的模版：', template)
}
//=============================对话框=============================
const listDialog = ref(false);
const listDetails = ref([]);
const currentReceiverType = ref(emailData.ReceiverType.Supplier);
const receiverDialogVisible = ref(false);

// 生日发送
const birthAttachmentDialogVisible = ref(false);
const openBirthAttachmentDialog = () => {
  birthAttachmentDialogVisible.value = true;
}
const birthTemplateDialogVisible = ref(false);
const openBirthTemplateDialog = () => {
  birthTemplateDialogVisible.value = true;
}

// 节日发送
const openSupplierDialog = () => {
  currentReceiverType.value = emailData.ReceiverType.Supplier;
  receiverDialogVisible.value = true;
}
const openCustomerDialog = () => {
  currentReceiverType.value = emailData.ReceiverType.Customer;
  receiverDialogVisible.value = true;
}
const festivalAttachmentDialogVisible = ref(false);
const openFestivalAttachmentDialog = () => {
  festivalAttachmentDialogVisible.value = true;
}
const festivalTemplateDialogVisible = ref(false);
const openFestivalTemplateDialog = () => {
  festivalTemplateDialogVisible.value = true;
}
const checkAttachmentList = (attachments) => {
  console.log("查看附件列表", attachments);
  listDetails.value = attachments.map(attachment => attachment.attachment_name)
  listDialog.value = true
}

//================================分页============================
// 手动发送邮件任务
const manualTaskPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 15, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const manualTaskCurrentPageData = computed(() => {
  const displayPageSize = manualTaskPagination.value.displayPageSize  // 10
  const serverPageSize = manualTaskPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((manualTaskPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = manualTaskPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((manualTaskPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleManualTaskLoadData = async (serverPage) => {
  console.log("手动发送邮件任务分页组件计算出的页码：",serverPage);
  if(manualTaskPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  manualTaskPagination.value.serverPage = serverPage
  await searchManualTask()

}
const clearManualTaskCache = () => {
  manualTaskPagination.value.currentPage = 1;
  manualTaskPagination.value.serverPage = 1;
  manualTaskPagination.value.cachedData.clear();
  manualTaskPagination.value.totalItems = 0;
}

// 循环发送邮件任务
const circleTaskPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 15, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const circleTaskCurrentPageData = computed(() => {
  const displayPageSize = circleTaskPagination.value.displayPageSize  // 10
  const serverPageSize = circleTaskPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((circleTaskPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = circleTaskPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((circleTaskPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleCircleTaskLoadData = async (serverPage) => {
  console.log("循环发送邮件任务分页组件计算出的页码：",serverPage);
  if(circleTaskPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  circleTaskPagination.value.serverPage = serverPage
  await searchCircleTask()

}
const clearCircleTaskCache = () => {
  circleTaskPagination.value.currentPage = 1;
  circleTaskPagination.value.serverPage = 1;
  circleTaskPagination.value.cachedData.clear();
  circleTaskPagination.value.totalItems = 0;
}

// 节日发送邮件任务
const festivalTaskPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 15, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const festivalTaskCurrentPageData = computed(() => {
  const displayPageSize = festivalTaskPagination.value.displayPageSize  // 10
  const serverPageSize = festivalTaskPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((festivalTaskPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = festivalTaskPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((festivalTaskPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleFestivalTaskLoadData = async (serverPage) => {
  console.log("节日发送邮件任务分页组件计算出的页码：",serverPage);
  if(festivalTaskPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  festivalTaskPagination.value.serverPage = serverPage
  await searchFestivalTask()

}
const clearFestivalTaskCache = () => {
  festivalTaskPagination.value.currentPage = 1;
  festivalTaskPagination.value.serverPage = 1;
  festivalTaskPagination.value.cachedData.clear();
  festivalTaskPagination.value.totalItems = 0;
}

// 生日发送邮件
const birthEmailPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 15, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const birthEmailCurrentPageData = computed(() => {
  const displayPageSize = birthEmailPagination.value.displayPageSize  // 10
  const serverPageSize = birthEmailPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((birthEmailPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = birthEmailPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((birthEmailPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleBirthEmailLoadData = async (serverPage) => {
  console.log("生日发送邮件任务分页组件计算出的页码：",serverPage);
  if(birthEmailPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  birthEmailPagination.value.serverPage = serverPage
  await searchBirthEmail()

}
const clearBirthEmailCache = () => {
  birthEmailPagination.value.currentPage = 1;
  birthEmailPagination.value.serverPage = 1;
  birthEmailPagination.value.cachedData.clear();
  birthEmailPagination.value.totalItems = 0;
}

//=============================其他功能============================
// 搜索手动发送邮件类型,防抖函数
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
      manualTaskSearchForm.value.emailTypeOptions = res.data.email_type
      console.log("搜索所有邮件任务邮件类型响应数据", res);
      console.log("搜索所有邮件任务邮件类型缓存数据", manualTaskSearchForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("搜索所有邮件任务邮件类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索所有邮件任务邮件类型失败,请重试", error);
  }
}
const debouncedSearchEmailType = debounce(chooseSearchEmailType, 500)

// 搜索循环发送邮件类型,防抖函数
const chooseCircleSearchEmailType = async (query) => {
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索循环发送邮件类型请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      circleTaskSearchForm.value.emailTypeOptions = res.data.email_type
      console.log("搜索循环发送邮件类型响应数据", res);
      console.log("搜索循环发送邮件类型缓存数据", circleTaskSearchForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("搜索循环发送邮件类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索循环发送邮件类型失败,请重试", error);
  }
}
const debouncedCircleSearchEmailType = debounce(chooseCircleSearchEmailType, 500)

// 创建节日发送邮件任务
const createFestivalTaskEmailType = async (query) => {
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("创建节日发送邮件任务请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      festivalTaskForm.value.emailTypeOptions = res.data.email_type
      console.log("创建节日发送邮件任务响应数据", res);
      console.log("创建节日发送邮件任务缓存数据", festivalTaskForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("创建节日发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("创建节日发送邮件任务失败,请重试", error);
  }
}
const debouncedCreateFestivalTaskEmailType = debounce(createFestivalTaskEmailType, 500)

// 获取当天开始时间戳（0点）
const getStartOfDay = (date) => {
  if (!date) return null
  return Math.floor(new Date(new Date(date)).getTime() / 1000)
  // return Math.floor(new Date(new Date(date).setHours(0, 0, 0, 0)).getTime() / 1000)
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
// 获取手动发送任务结束时间戳
const getManualEndOfDay = (date) => {
  if (!date) return null
  return Math.floor(new Date(new Date(date).setDate(new Date(date).getDate() + 2)).getTime() / 1000)
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
// 监听点击面板，没有数据就默认请求一次
const handleTabClick = async (tab) => {
  if(tab.props.name === 'manual'){
    if(manualTaskCurrentPageData.value.length === 0){
      searchManualTaskClick()
    }
  }
  if(tab.props.name === 'circle'){
    if(circleTaskCurrentPageData.value.length === 0){
      searchCircleTaskClick()
    }
  }
  if(tab.props.name === 'festival'){
    if(festivalTaskCurrentPageData.value.length === 0){
      searchFestivalTaskClick()
    }
  }
  if (tab.props.name === 'birth') {
    await getBirthTaskId()
    if(birthEmailCurrentPageData.value.length === 0){
      searchBirthEmailClick()
    }
  }
}
// 创建节日任务验证
const createFestivalTaskValidate = async () => {
  try {
    if(festivalTaskForm.value.subject === null || festivalTaskForm.value.subject === ''){
      ElMessage.warning("请填写主题");
      return false
    }
    if(festivalTaskForm.value.template_id === null || festivalTaskForm.value.template_id === ''){
      ElMessage.warning("请选择模版");
      return false
    }
    if((!festivalTaskForm.value.supplier_value?.receiver_ids?.length && !festivalTaskForm.value.supplier_value?.receiver_key) &&
    (!festivalTaskForm.value.customer_value?.receiver_ids?.length && !festivalTaskForm.value.customer_value?.receiver_key)) {
      ElMessage.warning("请选择接收者");
      return false
    }
    if(festivalTaskForm.value.email_type_id === null || festivalTaskForm.value.email_type_id === ''){
      ElMessage.warning("请选择邮件类型");
      return false
    }
    if(festivalTaskForm.value.start_date === null || festivalTaskForm.value.start_date === ''){
      ElMessage.warning("请选择开始时间");
      return false
    }
    // 验证开始时间不能小于当前时间
    const currentDate = new Date()
    const startDate = new Date(festivalTaskForm.value.start_date)
    if (startDate < currentDate) {
      ElMessage.warning("开始时间不能小于当前时间");
      return false
    }
    return true
  } catch (error) {
    errorHandler.showError("请完整填写信息", error);
    return false
  }
}


// 监听页面刷新
onMounted(() => {
  // 页面加载默认请求手动发送任务一次
  if(manualTaskCurrentPageData.value.length === 0){
      searchManualTaskClick()
  }

  // 因为小管理没有生日任务，暂时用不到，但是留着备用。
  localStorage.removeItem("birthTaskInfo")
  console.log("页面刷新,删除生日邮件任务信息");
})

</script>

<style scoped>
.EmailTask {
  height: 100%;
}

.EmailTaskContainer {
  font-size: 15px;
}

.sendEmailContainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-size: 15px;
  margin-bottom: 20px;
}
.recipient, .appendix, .chooseType, .chooseTime, .template, .emailTitle{
  margin-bottom: 1.5em;
  font-size: 1em;
}
.emailTitle,.chooseFestive{
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
}
.month-time-picker-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>

<template>
  <div class="fileManage">
    <div class="fileManageContainer">
      <el-tabs v-model="activeTab" class="fileListTabs">
        <el-tab-pane :label="tabName.attachmentLabel" :name="tabName.attachmentName">
          <!-- 上传按钮 -->
          <div style="display:flex;align-items: center;height: 1em">
            <!-- 主按钮 -->
            <el-button type="primary" @click="attachmentUploadDialog">
              <el-icon>
                <CirclePlus />
              </el-icon>
              <span style="vertical-align: middle">上传附件</span>
            </el-button>

            <!-- 对话框 -->
            <el-dialog title="上传附件(50MB以内)" v-model="uploadAttachmentDialog" width="50%">
              <el-form>
                <!-- 文件选择按钮 -->
                <el-form-item>
                  <el-upload
                    multiple
                    action="#"
                    list-type="text"
                    :show-file-list="false"
                    :auto-upload="false"
                    @change="handleAttachmentChange"
                  >
                    <el-button type="primary">选择文件</el-button>
                  </el-upload>
                </el-form-item>

                <!-- 文件列表 -->
                <div v-for="(file, index) in attachments" :key="index" class="file-item">
                  <span>{{ file.name }}</span>
                  <span class="file-size">{{ (file.size / (1024 * 1024)).toFixed(2) }}MB</span>
                  <el-button type="danger" size="small" @click="handleRemoveAttachment(file)">删除</el-button>
                  <el-progress
                    v-if="uploadProgress[file.name] !== undefined"
                    :percentage="uploadProgress[file.name]"
                    :status="uploadProgress[file.name] === 100 ? 'success' : ''"
                  />
                </div>
              </el-form>

              <!-- 对话框底部按钮 -->
              <template #footer>
                <el-button @click="closeAttachmentUploadDialog" :disabled="isUploading === true">取消</el-button>
                <el-button type="primary" @click="handleUploadAttachment" :disabled="isUploading === true">上传</el-button>
              </template>
            </el-dialog>
          </div>

          <!-- 搜索框 -->
          <div style="display: flex;flex-flow: row wrap">
            <el-form :inline="true" :model="searchAttachmentForm">
              <el-form-item>
                <el-input
                  v-model="searchAttachmentForm.attachment_name"
                  style="width: 200px;"
                  placeholder="请搜索附件名称"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-input
                  v-model="searchAttachmentForm.creator_name"
                  style="width: 200px;"
                  placeholder="请搜索创建人名称"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-input
                  v-model="searchAttachmentForm.belong_user_name"
                  style="width: 200px;"
                  placeholder="请搜索所属用户"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-select
                  v-model="searchAttachmentForm.status"
                  style="width: 200px;"
                  placeholder="请选择状态"
                >
                  <el-option value=0 label="无" />
                  <el-option value=1 label="未分配" />
                  <el-option value=2 label="已分配" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleAttachmentSearchClick">搜索</el-button>
                <el-button type="primary" @click="handleAttachmentReset">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格 -->
          <div style="width: 100%;overflow-x: auto">
            <el-table :data="attachmentCurrentPageData" border style="width: 1000px">
              <!-- 附件名称列 -->
              <el-table-column show-overflow-tooltip label="附件名称" align="left" min-width="300">
                <template #default="{ row }">
                  <span>{{ row.name }}</span>
                </template>
              </el-table-column>

              <!-- 创建人列 -->
              <el-table-column label="创建人" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.creator_name }}</span>
                </template>
              </el-table-column>

              <!-- 所属用户列 -->
              <el-table-column label="所属用户" min-width="100">
                <template #default="{ row }">
                  <span>共 {{ row.belong_user_name.length }} 个用户</span>
                  <el-button
                    size="mini"
                    type="text"
                    @click="openBelongUserListDialog(row, 'belong_user_name')">
                    查看
                  </el-button>
                </template>
              </el-table-column>

              <!-- 状态列 -->
              <el-table-column label="状态" min-width="150">
                <template #default="{ row }">
                <span class="status-text" @click="row.status === attachmentStatus.assigned && getAssignmentDetails(row)">
                  {{ row.status === attachmentStatus.assigned ? "已分配" : "未分配" }}
                </span>
                  <el-button
                    size="small"
                    type="primary"
                    @click="openReassignDialog(row)"
                  >
                    {{ row.status === attachmentStatus.assigned ? '重新分配' : '去分配' }}
                  </el-button>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="100">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleAttachmentDelete(row.id)"
                  >
                    删除
                  </el-button>
                  <el-button type="primary" size="small" @click="handleAttachmentDownload(row.name,row.url)">下载</el-button>
                  <el-progress
                    v-if="downloadProgress[`${row.name}_${row.url}`] !== undefined"
                    :percentage="downloadProgress[`${row.name}_${row.url}`]"
                    :status="downloadProgress[`${row.name}_${row.url}`] === 100 ? 'success' : ''"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <SmartPagination
            v-model:current-page="attachmentPagination.currentPage"
            :server-page-size="attachmentPagination.serverPageSize"
            :display-page-size="attachmentPagination.displayPageSize"
            :total="attachmentPagination.totalItems"
            @load-data="handleAttachmentLoadData"
          />
        </el-tab-pane>
        <el-tab-pane :label="tabName.imgLabel" :name="tabName.imgName">
          <!-- 上传按钮 -->
          <div style="display:flex;align-items: center;height: 1em">
            <!-- 主按钮 -->
            <el-button type="primary" @click="imgUploadDialog">
              <el-icon>
                <CirclePlus />
              </el-icon>
              <span style="vertical-align: middle">上传图片</span>
            </el-button>

            <!-- 对话框 -->
            <el-dialog title="上传图片" v-model="uploadImgDialog" width="50%">
              <el-form>
                <!-- 文件选择按钮 -->
                <el-form-item>
                  <el-upload
                    multiple
                    action="#"
                    list-type="text"
                    :show-file-list="false"
                    :auto-upload="false"
                    @change="handleImgChange"
                  >
                    <el-button type="primary">选择图片</el-button>
                  </el-upload>
                </el-form-item>

                <!-- 文件列表 -->
                <div v-for="(file, index) in imgs" :key="index" class="file-item">
                  <span>{{ file.name }}</span>
                  <span class="file-size">{{ (file.size / (1024 * 1024)).toFixed(2) }}MB</span>
                  <el-button type="danger" size="small" @click="handleRemoveImg(file)">删除</el-button>
                  <el-progress
                    v-if="uploadProgress[file.name] !== undefined"
                    :percentage="uploadProgress[file.name]"
                    :status="uploadProgress[file.name] === 100 ? 'success' : ''"
                  />
                </div>
              </el-form>

              <!-- 对话框底部按钮 -->
              <template #footer>
                <el-button @click="closeImgUploadDialog">取消</el-button>
                <el-button type="primary" @click="handleUploadImg">上传</el-button>
              </template>
            </el-dialog>
          </div>

          <!-- 搜索框 -->
          <div style="display: flex;flex-flow: row wrap">
            <el-form :inline="true" :model="searchImgForm">
              <el-form-item>
                <el-input
                  v-model="searchImgForm.img_name"
                  style="width: 200px;"
                  placeholder="请搜索图片名称"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-input
                  v-model="searchImgForm.creator_name"
                  style="width: 200px;"
                  placeholder="请搜索创建人名称"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-input
                  v-model="searchImgForm.belong_user_name"
                  style="width: 200px;"
                  placeholder="请搜索所属用户"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-select
                  v-model="searchImgForm.status"
                  style="width: 200px;"
                  placeholder="请选择状态"
                >
                  <el-option value=0 label="无" />
                  <el-option value=1 label="未分配" />
                  <el-option value=2 label="已分配" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleImgSearchClick">搜索</el-button>
                <el-button type="primary" @click="handleImgReset">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格 -->
          <div style="width: 100%;overflow-x: auto">
            <el-table :data="imgCurrentPageData" border style="width: 1000px">
              <!-- 图片名称列 -->
              <el-table-column show-overflow-tooltip label="图片名称" align="left" min-width="300">
                <template #default="{ row }">
                  <span>{{ row.name }}</span>
                </template>
              </el-table-column>

              <!-- 创建人列 -->
              <el-table-column label="创建人" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.creator_name }}</span>
                </template>
              </el-table-column>

              <!-- 所属用户列 -->
              <el-table-column label="所属用户" min-width="100">
                <template #default="{ row }">
                  <span>共 {{ row.belong_user_name.length }} 个用户</span>
                  <el-button
                    size="mini"
                    type="text"
                    @click="openBelongUserListDialog(row, 'belong_user_name')">
                    查看
                  </el-button>
                </template>
              </el-table-column>

              <!-- 状态列 -->
              <el-table-column label="状态" min-width="150">
                <template #default="{ row }">
                <span class="status-text" @click="row.status === imgStatus.assigned && getAssignmentDetails(row)">
                  {{ row.status === imgStatus.assigned ? "已分配" : "未分配" }}
                </span>
                  <el-button
                    size="small"
                    type="primary"
                    @click="openReassignDialog(row)"
                  >
                    {{ row.status === imgStatus.assigned ? '重新分配' : '去分配' }}
                  </el-button>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="100">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleImgDelete(row.id)"
                  >
                    删除
                  </el-button>
                  <el-button type="primary" size="small" @click="handleImgDownload(row.name,row.url)">下载</el-button>
                  <el-progress
                    v-if="downloadProgress[`${row.name}_${row.url}`] !== undefined"
                    :percentage="downloadProgress[`${row.name}_${row.url}`]"
                    :status="downloadProgress[`${row.name}_${row.url}`] === 100 ? 'success' : ''"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <SmartPagination
            v-model:current-page="imgPagination.currentPage"
            :server-page-size="imgPagination.serverPageSize"
            :display-page-size="imgPagination.displayPageSize"
            :total="imgPagination.totalItems"
            @load-data="handleImgLoadData"
          />
        </el-tab-pane>
      </el-tabs>

      <!-- 查看列表信息对话框 -->
      <ListDialog :title="详情" v-model="listDialog" :list="listDetails" />

      <!-- 已分配详情弹窗 -->
      <AssignFileDetailsDialog
        v-model="detailsDialogVisible"
        :creator="selectedFileCreatorName"
        :file_id="selectedFileId"
        :tab_name="activeTab"
      />
      <!-- 去分配/重新分配弹窗 -->
      <el-dialog title="选择用户" v-model="assignDialogVisible" width="50%" :show-close="false" :close-on-click-modal="false">
        <el-radio-group v-model="assignType">
          <el-radio :label="assignUser.companyName"></el-radio>
          <el-radio :label="assignUser.userName"></el-radio>
        </el-radio-group>
        <div v-if="assignType === assignUser.userName" class="user-assign-section">
          <!-- 搜索框 -->
          <div>
            <el-form :inline="true">
              <el-form-item>
                <el-input placeholder="请搜索用户姓名" v-model="assignSearchQuery.user_name" clearable></el-input>
              </el-form-item>
              <el-form-item>
                <el-input placeholder="请搜索用户登录账号" v-model="assignSearchQuery.user_account" clearable></el-input>
              </el-form-item>
              <el-form-item>
                <el-input placeholder="请搜索用户邮箱" v-model="assignSearchQuery.user_email" clearable></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchUsers">搜索</el-button>
                <el-button @click="resetSearch">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 搜索结果 -->
          <div>
            <el-checkbox-group v-model="selectedUserIds">
              <el-checkbox
                v-for="user in assignUserCurrentPageData"
                :key="user.id"
                v-model="selectedUserIds"
                :label="user.id"
                @change="(checked) => handleUserSelect(checked, user)"
              >
                {{ user.name }}
              </el-checkbox>
            </el-checkbox-group>
            <SmartPagination
              v-model:current-page="assignUserPagination.currentPage"
              :server-page-size="assignSearchQuery.page_size"
              :display-page-size="assignUserPagination.displayPageSize"
              :total="assignUserPagination.totalItems"
              @load-data="handleAssignUserLoadData"
            />
          </div>

          <!-- 已选择用户 -->
          <hr>
          <h3>已选择用户：</h3>
          <div class="selected-users">
            <el-tag
              v-for="user in selectedUsers"
              :key="user.id"
              closable
              @close="handleUserRemove(user)"
              class="mx-1"
            >
              {{ user.name }}
            </el-tag>
          </div>
        </div>
        <template #footer>
          <el-button @click="handleCancelAssign">取消</el-button>
          <el-button type="primary" @click="handleAssign">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import {ref, computed } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus'
import { errorHandler } from '@/utils/errorHandler.js'
import { fileApi } from '@/api/file/file.js'
import UserConstantData from "@/constants/UserConstantData";
import statusData from "@/constants/StatusConstantData";
import ListDialog from '@/components/ListDialog.vue'
import AssignFileDetailsDialog from '@/components/file/AssignFileDetailsDialog.vue'
import SmartPagination from '@/components/SmartPagination.vue'
//======================数据======================
const tabName = ref({
  attachmentLabel: '附件管理',
  attachmentName: 'attachment',
  imgLabel: '图片管理',
  imgName: 'img'
})
const activeTab = ref(tabName.value.attachmentName);

//文件管理数据
const attachments = ref([]);
const imgs = ref([]);
const searchAttachmentForm = ref({
  attachment_name: null,  // 附件名称
  creator_name: null,     // 创建人名称
  belong_user_name: null, // 所属用户
  status: null,           // 状态
})
const searchImgForm = ref({
  img_name: null,  // 图片名称
  creator_name: null,     // 创建人名称
  belong_user_name: null, // 所属用户
  status: null,           // 状态
})
const listDetails = ref([]);

// =====================分页====================
// 分配用户
const assignUserPagination = ref({
  totalItems: 0,
  currentPage: 1,
  serverPage:1,
  displayPageSize: 5,
  serverPageSize: 10,
  cachedData: new Map()
})
const assignUserCurrentPageData = computed(() => {
  const displayPageSize = assignUserPagination.value.displayPageSize  // 5
  const serverPageSize = assignUserPagination.value.serverPageSize  // 10
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((assignUserPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = assignUserPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((assignUserPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
})
const handleAssignUserLoadData = async (serverPage) => {
  console.log('分配用户分页组件计算出的页码：', serverPage)
  if(assignUserPagination.value.cachedData.has(serverPage)){
    console.log('使用缓存数据，页码：', serverPage)
    return
  }
  assignUserPagination.value.serverPage = serverPage
  await searchUsers()
}
const clearAssignUserCache = () => {
  assignUserPagination.value.cachedData.clear()
  assignUserPagination.value.totalItems = 0
  assignUserPagination.value.currentPage = 1
  assignUserPagination.value.serverPage = 1
}

// 附件
const attachmentPagination = ref({
  totalItems: 0,
  currentPage: 1,
  serverPage:1,
  displayPageSize: 10,
  serverPageSize: 30,
  cachedData: new Map()
})
const attachmentCurrentPageData = computed(() => {
  /**
   * 分页组件展示的数量和真实请求的数量不一致，所以需要计算出真实请求页码，
   * 然后获取当前请求页的数据，再计算出当前分页组件展示的数据
   */
  const displayPageSize = attachmentPagination.value.displayPageSize  // 10
  const serverPageSize = attachmentPagination.value.serverPageSize  // 30
  const pagesPerServerPage = serverPageSize / displayPageSize  // 3

  // 计算当前服务器页码
  const serverPage = Math.floor((attachmentPagination.value.currentPage - 1) / pagesPerServerPage) + 1

  // 获取当前服务器页的数据
  const currentServerData = attachmentPagination.value.cachedData.get(serverPage) || []

  // 计算在当前服务器页内的偏移量
  const offset = ((attachmentPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize

  return currentServerData.slice(offset, offset + displayPageSize)
})
const handleAttachmentLoadData = async (serverPage) => {
  console.log('附件分页组件计算出的页码：', serverPage)
  // 检查是否已有缓存数据
  if (attachmentPagination.value.cachedData.has(serverPage)) {
    console.log('使用缓存数据，页码：', serverPage)
    return
  }
  // 没有缓存才发起请求
  attachmentPagination.value.serverPage = serverPage
  await handleAttachmentSearch()
}
const clearAttachmentCache = () => {
  attachmentPagination.value.cachedData.clear()
  attachmentPagination.value.totalItems = 0
  attachmentPagination.value.currentPage = 1
  attachmentPagination.value.serverPage = 1
}

// 图片
const imgPagination = ref({
  totalItems: 0,
  currentPage: 1,
  serverPage:1,
  displayPageSize: 10,
  serverPageSize: 30,
  cachedData: new Map()
})
const imgCurrentPageData = computed(() => {
  const displayPageSize = imgPagination.value.displayPageSize  // 10
  const serverPageSize = imgPagination.value.serverPageSize  // 30
  const pagesPerServerPage = serverPageSize / displayPageSize  // 3

  // 计算当前服务器页码
  const serverPage = Math.floor((imgPagination.value.currentPage - 1) / pagesPerServerPage) + 1

  // 获取当前服务器页的数据
  const currentServerData = imgPagination.value.cachedData.get(serverPage) || []

  // 计算在当前服务器页内的偏移量
  const offset = ((imgPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize

  return currentServerData.slice(offset, offset + displayPageSize)
})
const handleImgLoadData = async (serverPage) => {
  console.log('图片分页组件计算出的页码：', serverPage)
  // 检查是否已有缓存数据
  if (imgPagination.value.cachedData.has(serverPage)) {
    console.log('使用缓存数据，页码：', serverPage)
    return
  }
  // 没有缓存才发起请求
  imgPagination.value.serverPage = serverPage
  await handleImgSearch()
}
const clearImgCache = () => {
  imgPagination.value.cachedData.clear()
  imgPagination.value.totalItems = 0
  imgPagination.value.currentPage = 1
  imgPagination.value.serverPage = 1
}


// 分配管理数据
const attachmentStatus = ref({
  unassigned: statusData.ATTACHMENT_STATUS_UNASSIGNED,
  assigned: statusData.ATTACHMENT_STATUS_ASSIGNED
})
const imgStatus = ref({
  unassigned: statusData.IMG_STATUS_UNASSIGNED,
  assigned: statusData.IMG_STATUS_ASSIGNED
})
const assignUser = ref({
  companyName: UserConstantData.companyName,
  companyId: UserConstantData.companyId,
  userName: UserConstantData.userName
});
const selectedFileIds = ref(null);
const assignType = ref(assignUser.value.companyName);
const assignSearchQuery = ref({
  user_name: null,
  user_account: null,
  user_email: null,
});
const selectedUsers = ref([]);
const selectedUserIds = ref([]);
const selectedFileCreatorName = ref('');
const selectedFileId = ref('');



//======================分配管理======================
// 确定分配
const handleAssign = async () => {
  try{
    if(activeTab.value === tabName.value.attachmentName){
      if(assignType.value === assignUser.value.companyName){
        selectedUserIds.value = [assignUser.value.companyId]
      }
      console.log('已选择附件id：', selectedFileIds.value)
      console.log('已选择用户id：', selectedUserIds.value)
      const requestData = {
        attachment_id: selectedFileIds.value,
        belong_user_id: selectedUserIds.value
      }
      const response = await fileApi.assignAttachment(requestData)
      if(response.code !== 200){
        errorHandler.showError('分配失败，请重试',response)
      }else{
        ElMessage.success('分配成功')
        handleCancelAssign();
      }
    }else if(activeTab.value === tabName.value.imgName){
      if(assignType.value === assignUser.value.companyName){
        selectedUserIds.value = [assignUser.value.companyId]
      }
      console.log('已选择图片id：', selectedFileIds.value)
      console.log('已选择用户id：', selectedUserIds.value)
      const requestData = {
        img_id: selectedFileIds.value,
        belong_user_id: selectedUserIds.value
      }
      const response = await fileApi.assignImg(requestData)
      if(response.code !== 200){
        errorHandler.showError('分配失败，请重试',response)
      }else{
        ElMessage.success('分配成功')
        handleCancelAssign();
      }
    }
  }catch(error){
    errorHandler.showError('分配失败，请重试',error)
  }
}

// 取消分配
const handleCancelAssign = () => {
  assignDialogVisible.value = false;
  selectedFileIds.value = null;
  selectedUserIds.value = [];
  selectedUsers.value = [];
  assignType.value = assignUser.value.companyName;
  clearAssignUserCache()
}

// 获取分配详情
const getAssignmentDetails = (row) => {
  selectedFileCreatorName.value = row.creator_name;
  selectedFileId.value = row.id;
  detailsDialogVisible.value = true;
};

// 搜索用户
const searchUsers = async () => {
  try {
    const requestData = {
      ...assignSearchQuery.value,
    }
    console.log('搜索用户请求数据：', requestData)
    const response = await fileApi.filterUser(requestData)
    if (response.code === 200) {
      // 更新用户列表数据
      assignUserPagination.value.cachedData.set(assignUserPagination.value.serverPage, response.data.data)
      assignUserPagination.value.totalItems = response.data.total_items
      console.log('搜索用户成功，服务器用户数据：', response.data)
      console.log('搜索用户成功，显示用户列表：', assignUserPagination.value.cachedData.get(assignUserPagination.value.serverPage))
    }else if(response.code === 415){
      ElMessage.error('未搜索到相关用户')
    }else if(response.code === 411){
      errorHandler.showError('您暂无分配用户的权限',response)
    }else if(response.code === 412){
      errorHandler.showError('选中的附件不存在，或已被删除',response)
    }else if(response.code === 413){
      errorHandler.showError('已选择用户中，有不属于您管理的用户',response)
    }else if(response.code === 423){
      errorHandler.showError('已选择用户中，有不存在的用户，或许已被删除',response)
    }else{
      errorHandler.showError('搜索用户失败，请重试',response)
    }
  } catch (error) {
    errorHandler.showError('搜索用户失败，请重试',error)
  }
}

// 重置搜索
const resetSearch = () => {
  clearAssignUserCache()
  // 重置表单数据
  assignSearchQuery.value = {
    user_name: '',
    user_account: '',
    user_email: '',
  }
}

// 处理用户选择
const handleUserSelect = (checked, user) => {
  if (checked && !selectedUsers.value.find(u => u.id === user.id)) {
    selectedUsers.value.push(user)
    if (!selectedUserIds.value.includes(user.id)) {
      selectedUserIds.value.push(user.id)
    }
  } else if (!checked) {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
    selectedUserIds.value = selectedUserIds.value.filter(id => id !== user.id)
  }
}

// 处理用户移除
const handleUserRemove = (user) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
  selectedUserIds.value = selectedUserIds.value.filter(id => id !== user.id)
}

//======================上传、下载文件======================
// 配置上传路径
const uploadAttachmentUrl = import.meta.env.VITE_UPLOAD_ATTACHMENT_BASE_URL
const uploadImgUrl = import.meta.env.VITE_UPLOAD_IMG_BASE_URL
// 添加进度状态
const uploadProgress = ref({})
const downloadProgress = ref({})
const isUploading = ref(false)
const isDownloading = ref(false)

// 存储 XHR 对象的映射，用于取消上传
const uploadXHRs = ref({})
// 添加文件信息存储
const fileInfos = ref({
  attachments: [],
  images: []
})

// 处理上传结果的函数
const showUploadResult = (results, files) => {
  const successFiles = []
  const failedFiles = []
  const canceledFiles = []

  results.forEach((result, index) => {
    const fileName = files[index].name
    if (result.status === 'fulfilled') {
      successFiles.push(fileName)
    } else if (result.reason.message === 'Upload canceled') {
      canceledFiles.push(fileName)
    } else {
      failedFiles.push(fileName)
    }
  })

  let message = '<div style="text-align: left;">'
  if (successFiles.length > 0) {
    message += `<p style="color: #67C23A;">✓ 上传成功 (${successFiles.length})：</p>`
    message += `<ul style="margin: 5px 0;">${successFiles.map(file => `<li>${file}</li>`).join('')}</ul>`
  }
  if (failedFiles.length > 0) {
    message += `<p style="color: #F56C6C;">✗ 上传失败 (${failedFiles.length})：</p>`
    message += `<ul style="margin: 5px 0;">${failedFiles.map(file => `<li>${file}</li>`).join('')}</ul>`
  }
  if (canceledFiles.length > 0) {
    message += `<p style="color: #909399;">○ 已取消 (${canceledFiles.length})：</p>`
    message += `<ul style="margin: 5px 0;">${canceledFiles.map(file => `<li>${file}</li>`).join('')}</ul>`
  }
  message += '</div>'

  ElMessageBox.alert(message, '上传结果', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定'
  }).then(() => {
    uploadAttachmentDialog.value = false
    uploadImgDialog.value = false
  })
}

//-------------附件相关功能-------------
// 上传附件选择
const handleAttachmentChange = (uploadFile) => {
  // 检查文件大小是否超过50MB
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (uploadFile.raw.size > maxSize) {
    ElMessage.error('文件大小不能超过50MB!');
    return;
  }
  // 将新选择的附件添加到附件列表
  attachments.value.push(uploadFile.raw);
};

// 上传附件列表删除
const handleRemoveAttachment = (file) => {
  // 如果文件正在上传，取消上传
  if (uploadXHRs.value[file.name]) {
    console.log('Canceling upload for:', file.name)
    uploadXHRs.value[file.name].abort()
    delete uploadXHRs.value[file.name]
    delete uploadProgress.value[file.name]
  }

  // 从附件列表中移除指定文件
  attachments.value = attachments.value.filter(f => f.name !== file.name)
  ElMessage.success('已取消上传并移除文件')
}

// 上传附件处理函数
const handleUploadAttachment = async () => {
  try {
    isUploading.value = true
    console.log('要上传的附件列表：', attachments.value)

    const originalFiles = [...attachments.value]
    fileInfos.value.attachments = [] // 清空之前的附件信息

    // 上传附件
    const uploadPromises = attachments.value.map(async file => {
      const timestamp = Date.now()
      const originalName = file.name
      const extension = originalName.split('.').pop()
      const safeFileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`

      const xhr = new XMLHttpRequest()
      uploadXHRs.value[file.name] = xhr

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            uploadProgress.value[file.name] = Math.round((event.loaded * 100) / event.total)
          }
        }

        xhr.onload = () => {
          delete uploadXHRs.value[file.name]

          setTimeout(() => {
            if (xhr.status >= 200 && xhr.status < 300) {
              uploadProgress.value[file.name] = 100

              // 收集成功上传的文件信息
              const fileInfo = {
                attachment_id: safeFileName,
                attachment_url: `${uploadAttachmentUrl}/${safeFileName}`,
                attachment_size: file.size,
                attachment_name: originalName
              }
              fileInfos.value.attachments.push(fileInfo)

              resolve(fileInfo)
            } else {
              uploadProgress.value[file.name] = 0
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
            }
          }, 1000)
        }

        xhr.onerror = () => {
          delete uploadXHRs.value[file.name]
          uploadProgress.value[file.name] = 0
          reject(new Error('Network error'))
        }

        xhr.onabort = () => {
          delete uploadXHRs.value[file.name]
          uploadProgress.value[file.name] = 0
          reject(new Error('Upload canceled'))
        }

        xhr.timeout = 300000
        xhr.ontimeout = () => {
          delete uploadXHRs.value[file.name]
          uploadProgress.value[file.name] = 0
          reject(new Error('Upload timeout'))
        }
      })

      xhr.open('PUT', `${uploadAttachmentUrl}/${safeFileName}`)
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
      xhr.setRequestHeader('X-Original-Name', encodeURIComponent(file.name))
      xhr.send(file)

      try {
        return await uploadPromise
      } catch (error) {
        if (error.message === 'Upload canceled') {
          console.log(`Upload canceled for ${file.name}`)
        } else {
          ElMessage.error(`文件 ${file.name} 上传失败：${error.message}`)
        }
        throw error
      }
    })
    const results = await Promise.allSettled(uploadPromises)

    // 发送成功上传的文件信息到 ES
    if (fileInfos.value.attachments.length > 0) {
      try {
        const requestData = {
          attachment: fileInfos.value.attachments
        }
        console.log('附件信息上传', requestData);
        const response = await fileApi.uploadAttachment(requestData)
        if (response.code !== 200) {
          throw new Error('附件信息保存失败')
        }else{
          // 显示上传结果对话框
          showUploadResult(results, originalFiles)
          // 清空已成功上传的附件
          attachments.value = attachments.value.filter(attachment =>
            !fileInfos.value.attachments.some(uploadedAttachment =>
              uploadedAttachment.attachment_name === attachment.name
            )
          );
        }
        console.log('附件信息成功保存到es:', fileInfos.value.attachments)
      } catch (error) {
        errorHandler.showError("附件已上传成功，但保存附件信息时出错,请重新上传",error)
      }
    }
  } catch (error) {
    errorHandler.showError("附件上传出错,请重试",error)
  } finally {
    isUploading.value = false
    uploadXHRs.value = {}
    setTimeout(() => {
      uploadProgress.value = {}
    }, 1000)
  }
}

// 附件删除
const handleAttachmentDelete = async (attachmentId) => {
  try {
    if(attachmentId === null || attachmentId === undefined || attachmentId === ''){
      ElMessage.error('该附件缺失id,无法删除')
      return
    }
    const requestData = {
      attachment_id: attachmentId
    }
    console.log('删除附件请求数据：', requestData)
    const response = await fileApi.deleteAttachment(requestData)
    if (response.code === 200) {
      const currentData = attachmentPagination.value.cachedData.get(attachmentPagination.value.serverPage)
        attachmentPagination.value.cachedData.set(
        attachmentPagination.value.serverPage,
        currentData.filter(item => item.id !== attachmentId)
      )
      attachmentPagination.value.totalItems = attachmentPagination.value.totalItems - 1
      ElMessage.success('删除成功')
    }else{
      errorHandler.showError('删除附件失败，请重试',response)
    }
  }catch(error){
    errorHandler.showError('删除附件出错，请重试',error)
  }
}

// 处理下载
const handleAttachmentDownload = async (fileName, fileUrl) => {
  // 创建唯一的下载标识符
  const downloadId = `${fileName}_${fileUrl}` // 或者使用行数据中的其他唯一标识

  try {
    isDownloading.value = true
    downloadProgress.value[downloadId] = 0 // 使用唯一标识符

    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    const reader = response.body.getReader()
    const contentLength = +response.headers.get('Content-Length') || 0

    let receivedLength = 0
    const chunks = []

    while(true) {
      const {done, value} = await reader.read()

      if (done) {
        break
      }

      chunks.push(value)
      receivedLength += value.length

      if (contentLength > 0) {
        downloadProgress.value[downloadId] = Math.round((receivedLength * 100) / contentLength) // 使用唯一标识符
      }
    }

    const blob = new Blob(chunks)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = fileName

    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    downloadProgress.value[downloadId] = 100 // 使用唯一标识符
    ElMessage.success('文件下载成功')

  } catch (error) {
    downloadProgress.value[downloadId] = 0 // 使用唯一标识符
    ElMessage.error('下载失败：' + error.message)
    console.error('Download error:', error)
  } finally {
    isDownloading.value = false
    // 延迟清除进度
    setTimeout(() => {
      delete downloadProgress.value[downloadId] // 使用唯一标识符
    }, 2000)
  }
}

// 搜索附件
const handleAttachmentSearch = async () => {
  // TODO: 调用搜索API
  try{
    const requestData = {
      attachment_name: searchAttachmentForm.value.attachment_name === null ? '' : searchAttachmentForm.value.attachment_name,
      creator_name: searchAttachmentForm.value.creator_name === null ? '' : searchAttachmentForm.value.creator_name,
      belong_user_name: searchAttachmentForm.value.belong_user_name === null ? '' : searchAttachmentForm.value.belong_user_name,
      status: searchAttachmentForm.value.status === null ? 0 : Number(searchAttachmentForm.value.status),
      page_num: attachmentPagination.value.serverPage === null ? 1 : Number(attachmentPagination.value.serverPage),
      page_size: attachmentPagination.value.serverPageSize === null ? 30 : Number(attachmentPagination.value.serverPageSize)
    }
    console.log('附件搜索请求参数：', requestData)

    const response = await fileApi.filterAttachment(requestData)
    if(response.code === 200){
      attachmentPagination.value.cachedData.set(
        attachmentPagination.value.serverPage,
        response.data.data
      )
      console.log('附件搜索结果 response.data.data：', response.data.data)
      attachmentPagination.value.totalItems = response.data.total_items
      console.log('附件搜索结果 分页数据：', attachmentPagination.value.cachedData.get(attachmentPagination.value.serverPage))
    }else{
      errorHandler.showError('搜索附件失败，请重试',response)
    }
  }catch(error){
    errorHandler.showError('搜索附件失败，请重试',error)
  }
}

// 搜索按钮点击事件
const handleAttachmentSearchClick = async () => {
  clearAttachmentCache() // 清除缓存
  await handleAttachmentSearch()
}

// 重置按钮点击事件
const handleAttachmentReset = () => {
  clearAttachmentCache() // 清除缓存
  searchAttachmentForm.value = {
    attachment_name: null,
    creator_name: null,
    belong_user_name: null,
    status: null,
  }
}

//-------------图片相关功能-------------
// 上传图片选择
const handleImgChange = (uploadFile) => {
  // 检查文件类型是否为图片
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/apng'];
  if (!allowedTypes.includes(uploadFile.raw.type)) {
    ElMessage.error('只能上传图片文件!');
    return;
  }
  // 将新选择的图片添加到图片列表
  imgs.value.push(uploadFile.raw);
};

// 上传图片列表删除
const handleRemoveImg = (file) => {
  // 如果文件正在上传，取消上传
  if (uploadXHRs.value[file.name]) {
    console.log('Canceling upload for:', file.name)
    uploadXHRs.value[file.name].abort()
    delete uploadXHRs.value[file.name]
    delete uploadProgress.value[file.name]
  }

  // 从图片列表中移除指定文件
  imgs.value = imgs.value.filter(f => f.name !== file.name)
  ElMessage.success('已取消上传并移除文件')
}

// 上传图片处理函数
const handleUploadImg = async () => {
  try {
    isUploading.value = true
    console.log('要上传的图片列表：', imgs.value)

    const originalFiles = [...imgs.value]
    fileInfos.value.imgs = [] // 清空之前的图片信息

    // 上传图片
    const uploadPromises = imgs.value.map(async file => {
      const timestamp = Date.now()
      const originalName = file.name
      const extension = originalName.split('.').pop()
      const safeFileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`

      const xhr = new XMLHttpRequest()
      uploadXHRs.value[file.name] = xhr

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            uploadProgress.value[file.name] = Math.round((event.loaded * 100) / event.total)
          }
        }

        xhr.onload = () => {
          delete uploadXHRs.value[file.name]

          setTimeout(() => {
            if (xhr.status >= 200 && xhr.status < 300) {
              uploadProgress.value[file.name] = 100

              // 收集成功上传的文件信息
              const fileInfo = {
                img_id: safeFileName,
                img_url: `${uploadImgUrl}/${safeFileName}`,
                img_size: file.size,
                img_name: originalName
              }
              fileInfos.value.imgs.push(fileInfo)

              resolve(fileInfo)
            } else {
              uploadProgress.value[file.name] = 0
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
            }
          }, 1000)
        }

        xhr.onerror = () => {
          delete uploadXHRs.value[file.name]
          uploadProgress.value[file.name] = 0
          reject(new Error('Network error'))
        }

        xhr.onabort = () => {
          delete uploadXHRs.value[file.name]
          uploadProgress.value[file.name] = 0
          reject(new Error('Upload canceled'))
        }

        xhr.timeout = 300000
        xhr.ontimeout = () => {
          delete uploadXHRs.value[file.name]
          uploadProgress.value[file.name] = 0
          reject(new Error('Upload timeout'))
        }
      })

      xhr.open('PUT', `${uploadImgUrl}/${safeFileName}`)
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
      xhr.setRequestHeader('X-Original-Name', encodeURIComponent(file.name))
      xhr.send(file)

      try {
        return await uploadPromise
      } catch (error) {
        if (error.message === 'Upload canceled') {
          console.log(`Upload canceled for ${file.name}`)
        } else {
          ElMessage.error(`文件 ${file.name} 上传失败：${error.message}`)
        }
        throw error
      }
    })
    const results = await Promise.allSettled(uploadPromises)

    // 发送成功上传的文件信息到 ES
    if (fileInfos.value.imgs.length > 0) {
      try {
        const requestData = {
          img: fileInfos.value.imgs
        }
        console.log('图片信息上传', requestData);
        const response = await fileApi.uploadImg(requestData)
        if (response.code !== 200) {
          throw new Error('图片信息保存失败')
        }else{
          // 显示上传结果对话框
          showUploadResult(results, originalFiles)
          // 清空已成功上传的图片
          imgs.value = imgs.value.filter(img =>
            !fileInfos.value.imgs.some(uploadedImg =>
              uploadedImg.img_name === img.name
            )
          );
        }
        console.log('图片信息成功保存到es:', fileInfos.value.imgs)
      } catch (error) {
        errorHandler.showError("图片已上传成功，但保存图片信息时出错,请重新上传",error)
      }
    }
  } catch (error) {
    errorHandler.showError("图片上传出错,请重试",error)
  } finally {
    isUploading.value = false
    uploadXHRs.value = {}
    setTimeout(() => {
      uploadProgress.value = {}
    }, 1000)
  }
}

// 图片删除
const handleImgDelete = async (imgId) => {
  try {
    if(imgId === null || imgId === undefined || imgId === ''){
      ElMessage.error('该图片缺失id,无法删除')
      return
    }
    const requestData = {
      img_id: imgId
    }
    console.log('删除图片请求数据：', requestData)
    const response = await fileApi.deleteImg(requestData)
    if (response.code === 200) {
      const currentData = imgPagination.value.cachedData.get(imgPagination.value.serverPage)
        imgPagination.value.cachedData.set(
        imgPagination.value.serverPage,
        currentData.filter(item => item.id !== imgId)
      )
      imgPagination.value.totalItems = imgPagination.value.totalItems - 1
      ElMessage.success('删除成功')
    }else{
      errorHandler.showError('删除图片失败，请重试',response)
    }
  }catch(error){
    errorHandler.showError('删除图片出错，请重试',error)
  }
}

// 图片下载
const handleImgDownload = async (fileName, fileUrl) => {
  // 创建唯一的下载标识符
  const downloadId = `${fileName}_${fileUrl}` // 或者使用行数据中的其他唯一标识

  try {
    isDownloading.value = true
    downloadProgress.value[downloadId] = 0 // 使用唯一标识符

    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    const reader = response.body.getReader()
    const contentLength = +response.headers.get('Content-Length') || 0

    let receivedLength = 0
    const chunks = []

    while(true) {
      const {done, value} = await reader.read()

      if (done) {
        break
      }

      chunks.push(value)
      receivedLength += value.length

      if (contentLength > 0) {
        downloadProgress.value[downloadId] = Math.round((receivedLength * 100) / contentLength) // 使用唯一标识符
      }
    }

    const blob = new Blob(chunks)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = fileName

    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    downloadProgress.value[downloadId] = 100 // 使用唯一标识符
    ElMessage.success('文件下载成功')

  } catch (error) {
    downloadProgress.value[downloadId] = 0 // 使用唯一标识符
    ElMessage.error('下载失败：' + error.message)
    console.error('Download error:', error)
  } finally {
    isDownloading.value = false
    // 延迟清除进度
    setTimeout(() => {
      delete downloadProgress.value[downloadId] // 使用唯一标识符
    }, 2000)
  }
}

// 图片搜索
const handleImgSearch = async () => {
  try {
    const requestData = {
      img_name: searchImgForm.value.img_name === null ? '' : searchImgForm.value.img_name,
      creator_name: searchImgForm.value.creator_name === null ? '' : searchImgForm.value.creator_name,
      belong_user_name: searchImgForm.value.belong_user_name === null ? '' : searchImgForm.value.belong_user_name,
      status: searchImgForm.value.status === null ? 0 : Number(searchImgForm.value.status),
      page_num: imgPagination.value.serverPage === null ? 1 : Number(imgPagination.value.serverPage),
      page_size: imgPagination.value.serverPageSize === null ? 20 : Number(imgPagination.value.serverPageSize)
    }
    console.log('图片搜索请求参数：', requestData)
    const response = await fileApi.filterImg(requestData)
    if(response.code === 200){
      imgPagination.value.cachedData.set(
        imgPagination.value.serverPage,
        response.data.data
      )
      imgPagination.value.totalItems = response.data.total_items
      console.log('图片搜索结果：', imgPagination.value.cachedData.get(imgPagination.value.serverPage))
    }else{
      errorHandler.showError('搜索图片失败，请重试。请检查各项参数是否正常',response)
    }
  } catch(error) {
    errorHandler.showError('搜索图片失败，请重试',error)
  }
}

// 图片搜索按钮点击事件
const handleImgSearchClick = async () => {
  clearImgCache()
  await handleImgSearch()
}

// 图片重置
const handleImgReset = () => {
  clearImgCache()
  searchImgForm.value = {
    img_name: null,
    creator_name: null,
    belong_user_name: null,
    status: null,
  }
}


//======================对话框======================
const detailsDialogVisible = ref(false);
const assignDialogVisible = ref(false);
const listDialog = ref(false);
//文件管理
const uploadAttachmentDialog = ref(false);
const uploadImgDialog = ref(false);

// 打开对话框
const attachmentUploadDialog = () => {
  uploadAttachmentDialog.value = true;
};
const imgUploadDialog = () => {
  uploadImgDialog.value = true;
};

const openReassignDialog = (row) => {
  assignDialogVisible.value = true;
  selectedFileIds.value = row.id;
};
const openBelongUserListDialog = (row, belong_user_name) => {
  // 先设置数据
  listDetails.value = row[belong_user_name]
  // 最后设置显示状态
  listDialog.value = true

}


// 关闭对话框
const closeAttachmentUploadDialog = () => {
  uploadAttachmentDialog.value = false;
  attachments.value = []; // 清空文件列表
};
const closeImgUploadDialog = () => {
  uploadImgDialog.value = false;
  imgs.value = []; // 清空文件列表
};



</script>

<style scoped>
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.fileManage {
  display: flex;
  flex: 1;
}

.fileManageContainer {
  display: flex;
  flex-direction: row;
}
.fileListTabs{
  margin-bottom: 0.2em;
}
.status-text {
  color: blue;
  cursor: pointer;
  margin-right: 5px;
}
</style>

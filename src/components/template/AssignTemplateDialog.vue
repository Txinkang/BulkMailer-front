<template>
    <el-dialog title="选择用户" v-model="dialogVisible" width="50%" :show-close="false" :close-on-click-modal="false">
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
                <el-button type="primary" @click="handleSearchUserClick">搜索</el-button>
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
                :label="user.name"
                :value="user.id"
                @change="(checked) => handleUserSelect(checked, user)"
              >
                {{ user.name }}
              </el-checkbox>
            </el-checkbox-group>
            <SmartPagination
              v-model:current-page="assignUserPagination.currentPage"
              :server-page-size="assignUserPagination.serverPageSize"
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
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="confirmAssign">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import SmartPagination from '@/components/SmartPagination.vue'
import { errorHandler } from '@/utils/errorHandler'
import { templateApi } from '@/api/email/template/template.js'
import { fileApi } from '@/api/file/file.js'
import { ElMessage } from 'element-plus'
import UserConstantData from '@/constants/UserConstantData.js'
// 接收父组件传入的参数
const props = defineProps({
  modelValue: Boolean,
  file_id: String,
  active_tab: String,
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
//数据
const assignType = ref(UserConstantData.companyName);
const assignUser = ref({
  companyName: UserConstantData.companyName,
  companyId: UserConstantData.companyId,
  userName: UserConstantData.userName
});
const assignSearchQuery = ref({ user_name: '', user_account: '', user_email: '' })
const selectedUsers = ref([]);
const selectedUserIds = ref([]);
// 分配用户
const assignUserPagination = ref({
  totalItems: 0,
  currentPage: 1,
  serverPage: 1,
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
});
const handleAssignUserLoadData = async (serverPage) => {
  console.log("搜索用户分页组件计算出的页码：",serverPage);
  if(assignUserPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  assignUserPagination.value.serverPage = serverPage
  await searchUsers()

}
const clearSearchUserCache = () => {
  assignUserPagination.value.currentPage = 1;
  assignUserPagination.value.serverPage = 1;
  assignUserPagination.value.cachedData.clear();
  assignUserPagination.value.totalItems = 0;
}


const handleSearchUserClick = async () => {
  clearSearchUserCache()
  await searchUsers()
}
// 搜索用户
const searchUsers = async () => {
  try {
    const requestData = {
      ...assignSearchQuery.value,
      page_num: assignUserPagination.value.serverPage,
      page_size: assignUserPagination.value.serverPageSize
    }
    console.log('搜索用户请求数据：', requestData)
    const response = await fileApi.filterUser(requestData)
    if (response.code === 200) {
      // 更新用户列表数据
      assignUserPagination.value.cachedData.set(assignUserPagination.value.serverPage, response.data.data)
      // userList.value = response.data.data
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
const confirmAssign = async () => {
  try{
    if(assignType.value === assignUser.value.companyName){
        selectedUserIds.value = [assignUser.value.companyId]
      }
      console.log('已选择模板id：', props.file_id)
      console.log('已选择用户id：', selectedUserIds.value)
      const requestData = {
        template_id: props.file_id,
        belong_user_id: selectedUserIds.value
      }
      const response = await templateApi.assignTemplate(requestData)
      if(response.code !== 200){
        errorHandler.showError('分配失败，请重试',response)
      }else{
        ElMessage.success('分配成功')
        closeDialog();
      }
  }catch(error){
    errorHandler.showError('分配失败，请重试',error)
  }
}

const resetSearch = () => {
  assignSearchQuery.value = { user_name: '', user_account: '', user_email: '' }
  clearSearchUserCache()
}

const closeDialog = () => {
  selectedUserIds.value = [];
  selectedUsers.value = [];
  assignType.value = assignUser.value.companyName;
  resetSearch()
  dialogVisible.value = false
}


</script>

<template>
  <el-dialog title="选择管理员" v-model="dialogVisible" width="50%" destroy-on-close :close-on-click-modal="false" :show-close="false">
    <div class="user-assign-section">
      <!-- 搜索框 -->
      <div>
        <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="请搜索管理员姓名" v-model="assignSearchQuery.user_name" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-input placeholder="请搜索管理员登录账号" v-model="assignSearchQuery.user_account" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-input placeholder="请搜索管理员邮箱" v-model="assignSearchQuery.user_email" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearchUserClick">搜索</el-button>
            <el-button @click="resetSearch"><el-icon><Refresh /></el-icon></el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 搜索结果 -->
      <div>
        <el-radio-group v-model="selectedAdmin">
          <el-radio v-for="user in searchUserCurrentPageData" :key="user.id" :value="user">
            {{ user.name }}
          </el-radio>
        </el-radio-group>
        <SmartPagination
            v-model:current-page="searchUserPagination.currentPage"
            :server-page-size="searchUserPagination.serverPageSize"
            :display-page-size="searchUserPagination.displayPageSize"
            :total="searchUserPagination.totalItems"
            @load-data="handleSearchUserLoadData" />
      </div>
      <!-- 已选择管理员 -->
      <hr>
      <h3>已选择管理员：</h3>
      <div>
        <el-tag v-if="selectedAdmin" :key="selectedAdmin.id" class="mx-1">
          {{ selectedAdmin.name }}
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
import { userApi } from '@/api/user/user.js'
import { fileApi } from '@/api/file/file.js'
import { ElMessage } from 'element-plus'
// 接收父组件传入的参数
const props = defineProps({
  modelValue: Boolean,
  user_id: String
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
//数据
const assignSearchQuery = ref({ user_name: '', user_account: '', user_email: '' })
const selectedAdmin = ref(null)

// 分页
const searchUserPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 10,
  totalItems: 0,
  cachedData: new Map()
});
const searchUserCurrentPageData = computed(() => {
  const displayPageSize = searchUserPagination.value.displayPageSize  // 10
  const serverPageSize = searchUserPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((searchUserPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = searchUserPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((searchUserPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleSearchUserLoadData = async (serverPage) => {
  console.log("搜索用户分页组件计算出的页码：",serverPage);
  if(searchUserPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  searchUserPagination.value.serverPage = serverPage
  await searchUsers()

}
const clearSearchUserCache = () => {
  searchUserPagination.value.currentPage = 1;
  searchUserPagination.value.serverPage = 1;
  searchUserPagination.value.cachedData.clear();
  searchUserPagination.value.totalItems = 0;
}

// 功能
const handleSearchUserClick = async () => {
  clearSearchUserCache()
  await searchUsers()
}

const confirmAssign = async () => {
  try {
    if(!selectedAdmin.value){
      ElMessage.error('请选择管理员')
      return
    }
    const requestData = {
      user_id: props.user_id,
      belong_user_id: selectedAdmin.value.id
    }
    console.log('确定分配用户请求数据：', requestData)
    const response = await userApi.assignUser(requestData)
    if(response.code !== 200){
      errorHandler.showError('分配用户失败，请重试', response)
    }else{
      ElMessage.success('分配用户成功')
      closeDialog()
      console.log('分配用户成功',response)
    }
  } catch (error) {
    errorHandler.showError('分配用户失败，请重试', error)
  }
}

const searchUsers = async () => {
  try {
    const requestData = {
      user_name: assignSearchQuery.value.user_name,
      user_account: assignSearchQuery.value.user_account,
      user_email: assignSearchQuery.value.user_email,
      page_num: searchUserPagination.value.currentPage,
      page_size: searchUserPagination.value.serverPageSize
    }
    console.log('搜索用户请求数据：', requestData)
    const response = await fileApi.filterUser(requestData)
    if(response.code === 200){
      searchUserPagination.value.cachedData.set(searchUserPagination.value.serverPage, response.data.data)
      searchUserPagination.value.totalItems = response.data.total_items
      console.log('搜索用户成功，响应数据：', response)
      console.log('搜索用户成功，缓存数据：', searchUserPagination.value.cachedData.get(searchUserPagination.value.serverPage))
    }else if(response.code === 415){
      ElMessage.error('未搜索到相关用户')
    }else{
      errorHandler.showError('搜索用户失败，请重试', response)
    }
  } catch (error) {
    errorHandler.showError('搜索用户失败，请重试', error)
  }
}

const resetSearch = () => {
  assignSearchQuery.value = { user_name: '', user_account: '', user_email: '' }
  clearSearchUserCache()
}

const closeDialog = () => {
  clearSearchUserCache()
  selectedAdmin.value = null
  assignSearchQuery.value = { user_name: '', user_account: '', user_email: '' }
  dialogVisible.value = false
}


</script>

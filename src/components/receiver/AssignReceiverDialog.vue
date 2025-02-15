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
            <el-radio-group v-model="selectedUser">
              <el-radio v-for="user in searchUserCurrentPageData" :key="user.id" :value="user">
                {{ user.name }}
              </el-radio>
            </el-radio-group>
            <SmartPagination
              v-model:current-page="searchUserPagination.currentPage"
              :server-page-size="searchUserPagination.serverPageSize"
              :display-page-size="searchUserPagination.displayPageSize"
              :total="searchUserPagination.totalItems"
              @load-data="handleSearchUserLoadData"
            />
          </div>

          <!-- 已选择用户 -->
          <hr>
          <h3>已选择用户：</h3>
          <div class="selected-users">
            <el-tag v-if="selectedUser" :key="selectedUser.id"  class="mx-1">
              {{ selectedUser.name }}
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
import { supplierApi } from '@/api/receiver/supplier.js'
import { customerApi } from '@/api/receiver/customer.js'
import { fileApi } from '@/api/file/file.js'
import { ElMessage } from 'element-plus'
import UserConstantData from '@/constants/UserConstantData.js'
// 接收父组件传入的参数
const props = defineProps({
  modelValue: Boolean,
  user_id: String,
  active_tab: String,
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
//数据
const assignType = ref('公司')
const assignUser = ref({
  companyName: '公司',
  userName: '用户'
})
const assignSearchQuery = ref({ user_name: '', user_account: '', user_email: '' })
const selectedUser = ref({})

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


const handleSearchUserClick = async () => {
  clearSearchUserCache()
  await searchUsers()
}
const searchUsers = async () => {
  try {
    const requestData = {
      user_name: assignSearchQuery.value.user_name,
      user_account: assignSearchQuery.value.user_account,
      user_email: assignSearchQuery.value.user_email,
      page_num: searchUserPagination.value.serverPage,
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

const confirmAssign = async () => {
  try {
    if(assignType.value === assignUser.value.companyName){
      selectedUser.value ={
        id: UserConstantData.companyId,
        name: '公司'
      }
    }
    if(!selectedUser.value.id){
      ElMessage.error('请选择用户')
      return
    }
    if(props.active_tab === 'supplier'){
      const requestData = {
        supplierId: props.user_id,
        belongUserId: selectedUser.value.id
      }
      console.log('确定分配供应商请求数据：', requestData)
      const response = await supplierApi.assignSupplier(requestData)
      if(response.code !== 200){
        errorHandler.showError('分配供应商失败，请重试', response)
      }else{
        ElMessage.success('分配供应商成功')
        closeDialog()
        console.log('分配供应商成功',response)
      }
    }else if(props.active_tab === 'customer'){
      const requestData = {
        customerId: props.user_id,
        belongUserId: selectedUser.value.id
      }
      console.log('确定分配客户请求数据：', requestData)
      const response = await customerApi.assignCustomer(requestData)
      if(response.code !== 200){
        errorHandler.showError('分配客户失败，请重试', response)
      }else{
        ElMessage.success('分配客户成功')
        closeDialog()
        console.log('分配客户成功',response)
      }
    }
  } catch (error) {
    errorHandler.showError('分配失败，请重试', error)
  }
}

const resetSearch = () => {
  assignSearchQuery.value = { user_name: '', user_account: '', user_email: '' }
  clearSearchUserCache()
}

const closeDialog = () => {
  resetSearch()
  selectedUser.value = null
  dialogVisible.value = false
}


</script>

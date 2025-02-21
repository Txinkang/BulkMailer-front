<template>
  <el-dialog
    title="分配详情"
    v-model="dialogVisible"
    width="40%"
    destroy-on-close
  >
    <div class="dialog-content">
      <el-table :data="assignDetailsCurrentPageData" border>
        <el-table-column label="时间" prop="assign_date"></el-table-column>
        <el-table-column label="分配人" prop="assignor_name"></el-table-column>
        <el-table-column label="被分配人" prop="assignee_name"></el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <SmartPagination
      v-model:current-page="assignDetailsPagination.currentPage"
      :server-page-size="assignDetailsPagination.serverPageSize"
      :display-page-size="assignDetailsPagination.displayPageSize"
      :total="assignDetailsPagination.totalItems"
      @load-data="handleLoadData"
    />
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { errorHandler } from '@/utils/errorHandler'
import { userApi } from '@/api/user/user.js'
import SmartPagination from '@/components/SmartPagination.vue'
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
})

const emit = defineEmits(['update:modelValue'])

// 内部状态
const dialogVisible = ref(props.modelValue)
const assignDetailsPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 15,
  totalItems: 0,
  cachedData: new Map()
})

// 计算当前分页组件展示的数据
const assignDetailsCurrentPageData = computed(() => {
  /**
   * 分页组件展示的数量和真实请求的数量不一致，所以需要计算出真实请求页码，
   * 然后获取当前请求页的数据，再计算出当前分页组件展示的数据
   */
  const displayPageSize = assignDetailsPagination.value.displayPageSize  // 10
  const serverPageSize = assignDetailsPagination.value.serverPageSize  // 30
  const pagesPerServerPage = serverPageSize / displayPageSize  // 3

  // 计算当前服务器页码
  const serverPage = Math.floor((assignDetailsPagination.value.currentPage - 1) / pagesPerServerPage) + 1

  // 获取当前服务器页的数据
  const currentServerData = assignDetailsPagination.value.cachedData.get(serverPage) || []

  // 计算在当前服务器页内的偏移量
  const offset = ((assignDetailsPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize

  return currentServerData.slice(offset, offset + displayPageSize)
})

// 处理分页数据
const handleLoadData = async (serverPage) => {
  console.log('分配详情服务器页码', serverPage)
  // 检查是否已有缓存数据
  if (assignDetailsPagination.value.cachedData.has(serverPage)) {
    console.log('使用缓存数据，页码：', serverPage)
    return
  }
  // 没有缓存才发起请求
  assignDetailsPagination.value.serverPage = serverPage
  await getAssignDetails()
}

// 查看分配详情
const getAssignDetails = async () => {
  try{
    console.log('获取用户分配详情，用户id为：', props.user_id)
    const requestData = {
      user_id: props.user_id,
      page_num: assignDetailsPagination.value.serverPage,
      page_size: assignDetailsPagination.value.serverPageSize
    }
    console.log('获取用户分配详情请求数据：', requestData)
    const response = await userApi.assignUserDetails(requestData)
    if(response.code !== 200){
      clearCache()
      errorHandler.showError('获取用户分配详情失败，请重试',response)
    }else{
      assignDetailsPagination.value.cachedData.set(assignDetailsPagination.value.serverPage, response.data.assignProcess)
      assignDetailsPagination.value.totalItems = response.data.totalItems
      console.log('用户分配详情响应数据：', response)
    }
  } catch (error) {
    clearCache()
    errorHandler.showError('获取用户分配详情失败，请刷新页面', error)
  }
}
// 清除缓存
const clearCache = () => {
  assignDetailsPagination.value.cachedData.clear()
  assignDetailsPagination.value.totalItems = 0
  assignDetailsPagination.value.currentPage = 1
  assignDetailsPagination.value.serverPage = 1
  emit('update:modelValue', false)
}
// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if(newVal){
    getAssignDetails()
  }
})

// 监听内部值变化
watch(() => dialogVisible.value, (newVal) => {
  emit('update:modelValue', newVal)
  if(!newVal){
    clearCache()
  }
})
</script>

<style scoped>
.dialog-content {
  /* 确保内容区域有足够的高度 */
  min-height: 200px;
  /* 使用相对定位 */
  position: relative;
}

.pagination-container {
  bottom: 20px;
  left: 0;
  right: 0;
  /* 确保分页组件可见 */
  height: 32px;
  /* 居中显示 */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

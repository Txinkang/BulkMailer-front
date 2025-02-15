<template>
  <el-dialog
    title="分配详情"
    v-model="dialogVisible"
    width="40%"
    destroy-on-close
  >
    <div class="dialog-content">
      <p>创建人：{{ creator }}</p>
      <el-table :data="assignDetailsCurrentPageData" border>
        <el-table-column label="时间" prop="assign_date"></el-table-column>
        <el-table-column label="分配人" prop="assignor_name"></el-table-column>
        <el-table-column label="被分配人" prop="assignee">
          <template #default="{ row }">
            <span>共 {{ row.assignee.length }} 人</span>
            <el-button
              size="mini"
              type="text"
              @click="handleViewAssignees(row.assignee)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 嵌套的查看人员列表对话框 -->
    <ListDialog
      v-model="listDialogVisible"
      :list="assigneeList"
      title="被分配人列表"
    />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ListDialog from '@/components/ListDialog.vue'
import { errorHandler } from '@/utils/errorHandler'
import { fileApi } from '@/api/file/file.js'
import { templateApi } from '@/api/email/template/template.js'
import SmartPagination from '@/components/SmartPagination.vue'
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  creator: {
    type: String,
    required: true
  },
  file_id: {
    type: String,
    required: true
  },
  tab_name: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// 内部状态
const dialogVisible = ref(props.modelValue)
const assignDetailsPagination = ref({
  currentPage: 1,
  serverPage: 1,
  totalItems: 0,
  serverPageSize: 10,
  displayPageSize: 5,
  cachedData: new Map()
})

const listDialogVisible = ref(false)
const assigneeList = ref([])


// 查看被分配人列表
const handleViewAssignees = (assignees) => {
  assigneeList.value = assignees.map(item => item.assignee_name)
  listDialogVisible.value = true
}

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
  if (props.tab_name === 'attachment' || props.tab_name === 'img') {
    assignDetailsPagination.value.serverPage = serverPage
    await getAssignDetails()
  } else {
    errorHandler.showError('不支持的标签类型')
    emit('update:modelValue', false)
  }
}

// 查看分配详情
const getAssignDetails = async () => {
  try{
    if(props.tab_name === 'attachment'){
      console.log('获取附件分配详情，附件id为：', props.file_id)
      const requestData = {
      attachment_id: props.file_id,
      page_num: assignDetailsPagination.value.serverPage,
      page_size: assignDetailsPagination.value.serverPageSize
    }
    console.log('获取附件分配详情请求数据：', requestData)
    const response = await fileApi.assignAttachmentDetails(requestData)
    if(response.code !== 200){
      clearCache()
      errorHandler.showError('获取文件分配详情失败，请重试',response)
    }else{
      assignDetailsPagination.value.cachedData.set(assignDetailsPagination.value.serverPage, response.data.data)
      assignDetailsPagination.value.totalItems = response.data.total_items
      console.log('分配详情：', response.data)
    }
    }else if(props.tab_name === 'img'){
      console.log('获取图片分配详情，图片id为：', props.file_id)
      const requestData = {
        img_id: props.file_id,
        page_num: assignDetailsPagination.value.serverPage,
        page_size: assignDetailsPagination.value.serverPageSize
      }
      console.log('获取图片分配详情请求数据：', requestData)
      const response = await fileApi.assignImgDetails(requestData)
      if(response.code !== 200){
        clearCache()
        errorHandler.showError('获取图片分配详情失败，请重试',response)
      }else{
        assignDetailsPagination.value.cachedData.set(assignDetailsPagination.value.serverPage, response.data.data)
        assignDetailsPagination.value.totalItems = response.data.total_items
        console.log('分配详情：', response.data)
        }
    }else if(props.tab_name === 'template'){
      const requestData = {
        template_id: props.file_id,
        page_num: assignDetailsPagination.value.serverPage,
        page_size: assignDetailsPagination.value.serverPageSize
      }
      console.log('获取模板分配详情请求数据：', requestData)
      const response = await templateApi.assignTemplateDetails(requestData)
      if(response.code !== 200){
        clearCache()
        errorHandler.showError('获取模板分配详情失败，请重试',response)
      }else{
        assignDetailsPagination.value.cachedData.set(assignDetailsPagination.value.serverPage, response.data.data)
        assignDetailsPagination.value.totalItems = response.data.total_items
        console.log('模板分配详情：', response)
      }
    }else{
      clearCache()
      ElMessage.error('获取失败，请刷新页面')
      console.log('分配详情页面有误')
    }
  } catch (error) {
    clearCache()
    errorHandler.showError('获取失败，请刷新页面', error)
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

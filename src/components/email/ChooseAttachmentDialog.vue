<template>
  <el-dialog
    title="选择附件"
    v-model="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <!-- 搜索框 -->
    <div class="search-container">
      <el-form style="width:100%;display: flex;flex-direction: row;gap: 10px">
        <el-form-item>
          <el-input style="width: 200px" placeholder="请搜索附件名称" clearable v-model="searchForm.attachment_name">
            <el-icon><Search/></el-icon>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input style="width: 200px" placeholder="请搜索所属用户" clearable v-model="searchForm.belong_user_name">
            <el-icon><Search/></el-icon>
          </el-input>
        </el-form-item>

        <el-form-item style="display: flex;flex-direction: row;gap: 10px">
          <el-button type="primary" @click="handleSearchClick">搜索</el-button>
          <el-button type="primary" @click="handleReset">
            <el-icon><Refresh/></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 筛选结果 -->
    <div class="result-section">
      <p>筛选结果：</p>
      <el-checkbox-group v-model="attachmentGroup" style="margin-bottom: 15px">
        <el-checkbox v-for="files in attachmentCurrentPageData" :key="files.id" :label="files.name" :value="files">
          {{files.name}}
        </el-checkbox>
      </el-checkbox-group>
    </div>


    <!-- 分页 -->
    <div>
      <SmartPagination
      v-model:current-page="attachmentPagination.currentPage"
      :server-page-size="attachmentPagination.serverPageSize"
      :display-page-size="attachmentPagination.displayPageSize"
      :total="attachmentPagination.totalItems"
      @load-data="handleAttachmentLoadData" />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import {fileApi} from '@/api/file/file.js'
import {sendEmailApi} from '@/api/sendEmail/sendEmail.js'
import {errorHandler} from '@/utils/errorHandler.js'
import SmartPagination from '@/components/SmartPagination.vue'

// 接收父组件传入的控制值
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
// 定义要触发的事件
const emit = defineEmits(['update:modelValue', 'update:attachments'])

// 使用计算属性双向绑定对话框的显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 搜索表单
const searchForm = ref({
  attachment_name: '',
  belong_user_name: ''
})
// 附件列表数据
const attachmentGroup = ref([])

// 搜索方法
const handleSearchClick = async () => {
  clearAttachmentCache()
  await searchAttachment()
}
const searchAttachment = async () => {
  try{
    const requestData = {
      attachment_name: searchForm.value.attachment_name === null ? '' : searchForm.value.attachment_name,
      belong_user_name: searchForm.value.belong_user_name === null ? '' : searchForm.value.belong_user_name,
      page_num: attachmentPagination.value.serverPage === null ? 1 : Number(attachmentPagination.value.serverPage),
      page_size: attachmentPagination.value.serverPageSize === null ? 30 : Number(attachmentPagination.value.serverPageSize)
    }
    console.log('附件搜索请求参数：', requestData)
    const response = await fileApi.filterAttachment(requestData)
    if(response.code === 200){
      console.log('附件搜索结果 response.data.data：', response.data.data)
      attachmentPagination.value.cachedData.set(
        attachmentPagination.value.serverPage,
        response.data.data
      )
      attachmentPagination.value.totalItems = response.data.total_items
      console.log('附件搜索结果 分页数据：', attachmentPagination.value.cachedData.get(attachmentPagination.value.serverPage))
    }else{
      errorHandler.showError('搜索附件失败，请重试',response)
    }
  }catch(error){
    errorHandler.showError('搜索附件失败，请重试',error)
  }
}
const handleReset = () => {
  clearAttachmentCache()
  attachmentGroup.value = []
  searchForm.value = {
    attachment_name: '',
    belong_user_name: ''
  }
}


// 附件分页
const attachmentPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 20, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const attachmentCurrentPageData = computed(() => {
  const displayPageSize = attachmentPagination.value.displayPageSize  // 10
  const serverPageSize = attachmentPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((attachmentPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = attachmentPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((attachmentPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleAttachmentLoadData = async (serverPage) => {
  console.log("附件分页组件计算出的页码：",serverPage);
  if(attachmentPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  attachmentPagination.value.serverPage = serverPage
  await searchAttachment()

}
const clearAttachmentCache = () => {
  attachmentPagination.value.currentPage = 1;
  attachmentPagination.value.serverPage = 1;
  attachmentPagination.value.cachedData.clear();
  attachmentPagination.value.totalItems = 0;
}

// 确认选择
const handleConfirm = () => {
  // 筛选attachmentGroup数组，只保留attachment_id和attachment_url字段
  attachmentGroup.value = attachmentGroup.value.map(item => ({
    attachment_id: item.attachment_id,
    attachment_url: item.attachment_url,
    attachment_name: item.name
  }))
  // 触发事件，将选中的附件传递给父组件
  emit('update:attachments', attachmentGroup.value)
  emit('update:modelValue', false)
}

// 关闭对话框
const handleClose = () => {
  handleReset()
  emit('update:modelValue', false)
}

</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}

.result-section {
  margin: 20px 0;
}
</style>

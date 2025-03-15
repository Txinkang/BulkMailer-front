<template>
  <el-dialog title="选择模板" v-model="dialogVisible" width="800px" @close="handleDialogClose">
    <!-- 头部搜索 -->
    <el-form
      style="display: flex;flex-flow:row wrap;gap: 10px;margin-bottom: 10px;"
      label-width="120px"
      inline >
      <el-form-item>
        <el-input
          style="width:200px;"
          v-model="searchTemplateForm.template_name"
          placeholder="请搜索模板名称"
          clearable
        />
      </el-form-item>

      <el-form-item>
        <el-select
          v-model="searchTemplateForm.belong_user_name"
          style="width: 200px;"
          placeholder="请选择所属用户"
          clearable
        >
          <el-option v-for="user in templateBelongUserList" :key="user.id" :label="user.name" :value="user.value" />
        </el-select>
      </el-form-item>

      <!-- 类型  -->
      <el-form-item>
        <el-select
          v-model="searchTemplateForm.template_type_id"
          placeholder="请选择模板类型"
          filterable
          remote
          :remote-method="debouncedSearchTemplateType"
          clearable
          style="width:200px;"
          >
          <el-option
          v-for="templateType in searchTemplateForm.templateTypeOptions"
          :key="templateType.email_type_id"
          :label="templateType.email_type_name"
          :value="templateType.email_type_id" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearchClick">搜索</el-button>
        <el-button type="primary" @click="handleReset">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格数据 -->
    <el-table :data="templateCurrentPageData" border style="width: 100%;margin-bottom: 20px">
      <el-table-column label="模板名称" align="left" min-width="200">
        <template #default="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="100">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleUseTemplate(row)"
          >
            使用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div>
      <SmartPagination
      v-model:current-page="templatePagination.currentPage"
      :server-page-size="templatePagination.serverPageSize"
      :display-page-size="templatePagination.displayPageSize"
      :total="templatePagination.totalItems"
      @load-data="handleTemplateLoadData" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { debounce } from "lodash";
import { emailTypeApi } from "@/api/dictionary/emailType.js";
import { errorHandler } from "@/utils/errorHandler.js";
import { templateApi } from "@/api/email/template/template.js";
import { sendEmailApi } from "@/api/sendEmail/sendEmail.js";
import { ElMessage } from "element-plus";
import SmartPagination from "@/components/SmartPagination.vue";
import UserConstantData from "@/constants/UserConstantData.js";
// 接收父组件的控制值
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue', 'select-template'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 搜索表单
const searchTemplateForm = ref({
  template_name: '',
  belong_user_name: '',
  template_type_id: '',
  templateTypeOptions: []
})
const templateBelongUserList = ref([{id:1,name:'无',value:''},{id:2,name:'公司',value:UserConstantData.companyName},{id:3,name:'个人',value:localStorage.getItem('user_name')}]);

const handleSearchClick = async () => {
  clearTemplateCache()
  await searchTemplate()
}
const searchTemplate = async () => {
  try {
    const requestData = {
      template_name: searchTemplateForm.value.template_name,
      template_type_id: searchTemplateForm.value.template_type_id,
      belong_user_name: searchTemplateForm.value.belong_user_name,
      status: 0,
      page_num: templatePagination.value.currentPage,
      page_size: templatePagination.value.serverPageSize
    }
    console.log("搜索模板请求数据", requestData);
    const res = await templateApi.filterTemplate(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索模板成功");
      console.log("搜索模板响应数据", res);
      templatePagination.value.totalItems = res.data.total_items
      templatePagination.value.cachedData.set(templatePagination.value.serverPage, res.data.data)
    } else {
      errorHandler.showError("搜索模板失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索模板失败,请重试", error);
  }
}
const handleReset = () => {
  clearTemplateCache()
  searchTemplateForm.value = {
    template_name: '',
    belong_user_name: '',
    template_type_id: '',
    templateTypeOptions: []
  }
}


// 模板分页
const templatePagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 10,
  totalItems: 0,
  cachedData: new Map()
});
const templateCurrentPageData = computed(() => {
  const displayPageSize = templatePagination.value.displayPageSize  // 10
  const serverPageSize = templatePagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((templatePagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = templatePagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((templatePagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleTemplateLoadData = async (serverPage) => {
  console.log("商品分页组件计算出的页码：",serverPage);
  if(templatePagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  templatePagination.value.serverPage = serverPage
  await searchTemplate()

}
const clearTemplateCache = () => {
  templatePagination.value.currentPage = 1;
  templatePagination.value.serverPage = 1;
  templatePagination.value.cachedData.clear();
  templatePagination.value.totalItems = 0;
}


// 使用模板
const handleUseTemplate = (template) => {
  emit('select-template', template)  // 向父组件传递选中的模板
  dialogVisible.value = false  // 关闭对话框
}

// 搜索模板类型
const chooseSearchTemplateType = async (query) => {
  // 因为模板类型绑定的就是邮件类型，所以直接搜邮件类型吧
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索模板类型请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      searchTemplateForm.value.templateTypeOptions = res.data.email_type
      console.log("搜索模板类型响应数据", res);
      console.log("搜索模板类型缓存数据", searchTemplateForm.value.templateTypeOptions);
    } else {
      errorHandler.showError("搜索模板类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索模板类型失败,请重试", error);
  }
}
const debouncedSearchTemplateType = debounce(chooseSearchTemplateType, 500)

// 对话框关闭事件
const handleDialogClose = () => {
  handleReset()
  emit('update:modelValue', false)
}
</script>

<template>
  <div class="commodityManage">
    <div class="commodityManageContainer">
      <el-tabs class="commodityManageTabs">
        <el-tab-pane label="模板管理">
          <!-- 搜索框 -->
          <div>
            <el-form :model="searchTemplateForm" style="width: 100%;display: flex;flex-flow: row wrap;gap: 10px">
              <!-- 搜索框 -->
              <el-form-item>
                <el-input v-model="searchTemplateForm.template_name" placeholder="请搜索模板名称" style="width: 200px;" clearable>
                </el-input>
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
                  style="width:200px;margin-right: 10px"
                  >
                  <el-option
                  v-for="templateType in searchTemplateForm.templateTypeOptions"
                  :key="templateType.email_type_id"
                  :label="templateType.email_type_name"
                  :value="templateType.email_type_id" />
                </el-select>
              </el-form-item>

              <!-- 刷新  -->
              <el-form-item>
                <el-button type="primary" @click="searchTemplateClick">搜索</el-button>
                <el-button type="primary" @click="resetSearchTemplate"><el-icon><Refresh /></el-icon></el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格数据 -->
          <div style="width: 100%;overflow-x: auto">
            <el-table :data="templateCurrentPageData" border style="width: 1200px;margin-bottom: 20px">
              <!-- 模板名称列 -->
              <el-table-column label="模板名称" align="left" min-width="200">
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

              <!-- 模板类型列 -->
              <el-table-column label="模板类型" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.template_type_name }}</span>
                </template>
              </el-table-column>

              <!-- 删除操作列 -->
              <el-table-column label="操作" align="center" min-width="150">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click.stop="checkTemplate(row.id)" :disabled="operationStatusButton">查看</el-button>
                  <el-button type="warning" size="small" @click="openUpdateDialog(row)">修改</el-button>
                  <el-button type="danger" size="small" @click="deleteTemplate(row.id)" :disabled="operationStatusButton">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div>
              <SmartPagination
              v-model:current-page="templatePagination.currentPage"
              :server-page-size="templatePagination.serverPageSize"
              :display-page-size="templatePagination.displayPageSize"
              :total="templatePagination.totalItems"
              @load-data="handleTemplateLoadData" />
          </div>

          <!-- 保存模板按钮 -->
          <div>
            <hr>
            <el-form class="template-form">
              <el-form-item>
                <span>创建模板:</span>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="saveTemplateButton" @click="openCreateDialog">
                  创建新模板
                </el-button>
                <el-button type="primary" :disabled="saveTemplateButton" @click="openSaveTemplateDialog">
                  保存新模板
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 修改模板按钮 -->
          <div>
            <el-form class="template-form">
              <el-form-item>
                <span>修改模板:（请先去表格选择模板，在操作列点击修改即可）</span>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="updateTemplateForm.updateButton" @click="updateTemplate">
                  确认修改
                </el-button>
                <el-button type="primary" :disabled="updateTemplateForm.updateButton" @click="cancelUpdateTemplate">
                  取消修改
                </el-button>
              </el-form-item>
            </el-form>

          </div>

          <div class="templateName">
            <el-input placeholder="模板名称" v-model="templateName" />
          </div>

          <RichEditor v-model="templateContent"></RichEditor>

        </el-tab-pane>
      </el-tabs>

      <!-- 查看列表信息对话框 -->
      <ListDialog :title="详情" v-model="listDialog" :list="listDetails" />

      <!-- 修改模板对话框 -->
      <el-dialog title="修改模板" v-model="updateDialogVisible" width="40%" :show-close="false" :close-on-click-modal="false">
        <span>
          修改模板会刷新当前编辑区域，请提前保存当前编辑区
        </span>
        <template #footer>
          <el-button @click="cancelUpdateTemplate">取消</el-button>
          <el-button type="primary" @click="confirmUpdateTemplate">确定修改</el-button>
        </template>
      </el-dialog>

      <!-- 创建模板对话框 -->
      <el-dialog title="创建模板" v-model="createDialogVisible" width="40%">
        <span>
          创建模板会刷新当前编辑区域，请提前保存当前编辑区
        </span>
        <template #footer>
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateTemplate">确定创建</el-button>
        </template>
      </el-dialog>

      <!-- 保存模板的对话框 -->
      <el-dialog
        title="保存模板"
        v-model="saveTemplateDialogVisible"
        width="40%"
      >
        <div>
          <el-form :model="saveTemplateForm" :rules="saveTemplateRules" ref="saveTemplateFormRef">
            <!-- 模板名称 -->
            <el-form-item label="模板名称：" prop="template_name">
              <el-input v-model="saveTemplateForm.template_name" placeholder="模板名称" clearable/>
            </el-form-item>

            <!-- 类型  -->
            <el-form-item label="模板类型：" prop="template_type_id">
              <el-select
                v-model="saveTemplateForm.template_type_id"
                placeholder="请选择模板类型"
                filterable
                remote
                :remote-method="debouncedChooseSaveTemplateType"
                clearable
                style="width:200px;margin-right: 10px"
                >
                <el-option
                v-for="templateType in saveTemplateForm.templateTypeOptions"
                :key="templateType.email_type_id"
                :label="templateType.email_type_name"
                :value="templateType.email_type_id" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </template>
      </el-dialog>

    </div>
  </div>
</template>


<script setup>
import {ref, computed, onMounted} from "vue";
import RichEditor from "@/components/RichEditor.vue";
import { emailTypeApi } from "@/api/dictionary/emailType.js";
import { templateApi } from "@/api/email/template/template.js";
import { errorHandler } from "@/utils/errorHandler";
import { debounce } from "lodash";
import { ElMessage, ElMessageBox } from "element-plus";
import SmartPagination from "@/components/SmartPagination.vue";
import UserConstantData from "@/constants/UserConstantData.js";
import ListDialog from "@/components/ListDialog.vue";
// ============================= 数据 =============================
const templateName = ref("");
const saveTemplateButton = ref(false);
const operationStatusButton = ref(false);
const searchTemplateForm = ref({
  template_name: "",
  template_type_id: "",
  templateTypeOptions: [],
  status: null,
  creator_name: "",
  belong_user_name: "",
});
const templateBelongUserList = ref([{id:1,name:'无',value:''},{id:2,name:'公司',value:UserConstantData.companyName},{id:3,name:'个人',value:localStorage.getItem('user_name')}]);
const saveTemplateForm = ref({
  template_name: '',
  template_type_id: '',
  templateTypeOptions: [],

});
// 定义验证规则
const saveTemplateRules = {
  template_name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  template_type_id: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ]
}

const templateContent = ref("<div>\n" +"<p>请编辑模板内容</p></div>\n");
const updateTemplateForm = ref({
  template_id: '',
  template_type_id: '',
  template_name: '',
  updateButton: true,
});
const saveTemplateFormRef = ref(null)

//================================ 功能 =================================
// 搜索模板点击事件
const searchTemplateClick = () => {
  clearTemplateCache()
  searchTemplate();
}
// 搜索模板
const searchTemplate = async () => {
  try {
    const requestData = {
      template_name: searchTemplateForm.value.template_name,
      template_type_id: searchTemplateForm.value.template_type_id,
      status: Number(searchTemplateForm.value.status),
      creator_name: searchTemplateForm.value.creator_name,
      belong_user_name: searchTemplateForm.value.belong_user_name,
      page_num: templatePagination.value.serverPage,
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
// 重置搜索模板
const resetSearchTemplate = () => {
  searchTemplateForm.value = {
    template_name: "",
    template_type_id: "",
    templateTypeOptions: [],
    status: null,
    creator_name: "",
    belong_user_name: "",
  }
  //clearTemplateCache();
}
// 查看模板
const checkTemplate = async (templateId) => {
  try {
    const requestData = {
      template_id: templateId
    }
    console.log("查看模板请求数据", requestData);
    const res = await templateApi.checkTemplate(requestData)
    if (res.code === 200) {
      console.log("查看模板响应数据成功", res);
      templateContent.value = res.data;
    } else {
      errorHandler.showError("失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("失败,请重试", error);
  }
}
// 确认修改模板
const confirmUpdateTemplate = async () => {
  await checkTemplate(updateTemplateForm.value.template_id);
  try {
    templateName.value = updateTemplateForm.value.template_name;
    updateDialogVisible.value = false;
    saveTemplateButton.value = true;
    operationStatusButton.value = true;
  } catch (error) {
    errorHandler.showError("发生错误,请重试", error);
  }
}
// 取消修改模板
const cancelUpdateTemplate = () => {
  updateTemplateForm.value.template_id = '';
  updateTemplateForm.value.template_type_id = '';
  templateName.value = "";
  templateContent.value = "<div>\n" +"<p>请编辑模板内容</p></div>";
  updateTemplateForm.value.template_name = '';
  updateTemplateForm.value.updateButton = true;
  saveTemplateButton.value = false;
  operationStatusButton.value = false;
  updateDialogVisible.value = false;
}
// 修改模板
const updateTemplate = async () => {
  //暂时跟保存模板共用同一个接口
  try {
    const requestData = {
      template_id: updateTemplateForm.value.template_id,
      template_name: templateName.value,
      template_type_id: updateTemplateForm.value.template_type_id,
      template_content: completeTemplateContent(templateContent.value),
    }
    console.log("修改模板请求数据", requestData);
    const res = await templateApi.saveTemplate(requestData)
    if (res.code === 200) {
      ElMessage.success("修改模板成功");
      console.log("修改模板响应数据成功", res);
      updateTemplateForm.value.updateButton = true;
      saveTemplateButton.value = false;
      operationStatusButton.value = false;
    } else {
      errorHandler.showError("修改模板失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("修改模板失败,请重试", error);
  }
}
// 确认创建模板
const confirmCreateTemplate = () => {
  templateName.value = "";
  templateContent.value = "<div>\n" +"<p>请编辑模板内容</p></div>";
  createDialogVisible.value = false;
}
// 保存模板
const saveTemplate = async () => {
  if (!saveTemplateFormRef.value) return
  await saveTemplateFormRef.value.validate()
  try {
    const requestData = {
      template_id: '',
      template_name: saveTemplateForm.value.template_name,
      template_type_id: saveTemplateForm.value.template_type_id,
      template_content: completeTemplateContent(templateContent.value),
    }
    console.log("保存模板请求数据", requestData);
    const res = await templateApi.saveTemplate(requestData)
    if (res.code === 200) {
      ElMessage.success("保存模板成功");
      console.log("保存模板响应数据成功", res);
      templateName.value = "";
      saveTemplateForm.value.template_name = '';
      saveTemplateForm.value.template_type_id = '';
      saveTemplateForm.value.templateTypeOptions = [];
      saveTemplateDialogVisible.value = false;
    } else {
      errorHandler.showError("保存模板失败,请重试", res);
    }
  }catch (error) {
    errorHandler.showError("保存模板失败,请重试", error);
  }
}
// 删除模板
const deleteTemplate = async (templateId) => {
  try {
    // 先弹窗确认是否删除
    await ElMessageBox.confirm(
        '是否确认删除？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      template_id: templateId
    }
    console.log("删除模板请求数据", requestData);
    const res = await templateApi.deleteTemplate(requestData)
    if (res.code === 200) {
      ElMessage.success("删除模板成功");
      console.log("删除模板响应数据成功", res);
      // 删除缓存数据
      const currentData = templatePagination.value.cachedData.get(templatePagination.value.serverPage)
      templatePagination.value.cachedData.set(
        templatePagination.value.serverPage,
        currentData.filter(item => item.id !== templateId)
      )
      templatePagination.value.totalItems = templatePagination.value.totalItems - 1
    } else {
      errorHandler.showError("删除模板失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了删除操作')
    } else {
      errorHandler.showError("删除模板失败,请重试", error);
    }
  }
}

//================================ 分页 =================================
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

// ===== 对话框控制 =====
const listDialog = ref(false);
const listDetails = ref([]);
const saveTemplateDialogVisible = ref(false);
const updateDialogVisible = ref(false);
const createDialogVisible = ref(false);

// ===== 打开对话框 =====
const openSaveTemplateDialog = () => {
  saveTemplateForm.value.template_name = templateName.value;
  saveTemplateForm.value.template_type_id = '';
  saveTemplateForm.value.templateTypeOptions = [];
  saveTemplateDialogVisible.value = true;
};

const openUpdateDialog = (row) => {
  console.log("打开修改模板对话框", row);
  updateTemplateForm.value.template_id = row.id;
  updateTemplateForm.value.template_type_id = row.template_type_id;
  updateTemplateForm.value.template_name = row.name;
  updateTemplateForm.value.updateButton = false;
  updateDialogVisible.value = true;
};

const openCreateDialog = () => {
  createDialogVisible.value = true;
};

// ===== 其他功能 =====
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

// 搜索模板类型
const chooseSaveTemplateType = async (query) => {
  // 因为模板类型绑定的就是邮件类型，所以直接搜邮件类型吧
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索保存模板类型请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      saveTemplateForm.value.templateTypeOptions = res.data.email_type
      console.log("搜索保存模板类型响应数据", res);
      console.log("搜索保存模板类型缓存数据", saveTemplateForm.value.templateTypeOptions);
    } else {
      errorHandler.showError("搜索保存模板类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索保存模板类型失败,请重试", error);
  }
}
const debouncedChooseSaveTemplateType = debounce(chooseSaveTemplateType, 500)

// 补全模板内容
const completeTemplateContent = (templateContent) => {
  let allContent = "";
  allContent += "<!DOCTYPE html>\n" +
    "<html lang='zh-CN'>\n" +
    "<head>\n" +
        "<meta charset='UTF-8'>\n" +
        "<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
        "<title>邮件主题</title>\n" +
    "</head>\n" +
    "<body>\n" +
      templateContent +
    "</body>\n" +
    "</html>";
  return allContent
}

//================================页面初始操作================================
onMounted(() => {
  if(templateCurrentPageData.value.length === 0){
    searchTemplateClick()
  }
})
</script>


<style scoped>
.commodityManage{
  font-size: 15px;
}
.search-box{
  margin-right: 20px;
}
.templateName{
  height: 50px;
  display: flex;
  align-items: center;
}
.status-text {
  color: blue;
  cursor: pointer;
  margin-right: 5px;
}
</style>

<template>
  <div class="sendEmail">
    <div class="sendEmailContainer">

      <div>
        <el-form label-width="120px" label-position="left">

          <el-form-item label="选择邮件类型：">
            <el-select
                v-model="manualTaskForm.email_type_id"
                placeholder="请搜索邮件类型"
                filterable
                remote
                :remote-method="debouncedCreateManualTaskEmailType"
                clearable
                style="width:200px;"
                >
                <el-option
                v-for="emailType in manualTaskForm.emailTypeOptions"
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
            <span v-if="manualTaskForm.supplier_value" style="margin-left: 10px">
              <span>共 {{ manualTaskForm.supplier_value.total_items }} 个供应商</span>
            </span>
            <!-- 客户 -->
            <el-button type="primary" @click="openCustomerDialog">
              <el-icon style="vertical-align: middle">
                <CirclePlus/>
              </el-icon>
              <span style="vertical-align: middle"> 客户 </span>
            </el-button>
            <span v-if="manualTaskForm.customer_value" style="margin-left: 10px">
              <span>共 {{ manualTaskForm.customer_value.total_items }} 个客户</span>
            </span>
            <!-- 筛选供应商对话框 -->
            <ChooseReceiverDialog
              v-model="receiverDialogVisible"
              :receiver-type="currentReceiverType"
              @select-receivers="handleReceiversSelect"
            />
          </el-form-item>

          <el-form-item label="选择模版：">
            <el-button
              type="primary"
              @click="openManualTemplateDialog"
            >
              <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
              <span style="vertical-align: middle"> 选择 </span>
            </el-button>

            <span v-if="manualTaskForm.template_name" style="margin-left: 10px">
              已选择模板: {{ manualTaskForm.template_name }}
            </span>

            <ChooseTemplateDialog
              v-model="manualTemplateDialogVisible"
              @select-template="handleManualTemplateSelect"
            />
          </el-form-item>

          <el-form-item label="选择附件：">
            <el-button
              type="primary"
              @click="openManualAttachmentDialog"
            >
              <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
              <span style="vertical-align: middle"> 选择 </span>
            </el-button>

            <span v-if="manualTaskForm.attachment && manualTaskForm.attachment.length > 0" style="margin-left: 10px">
              <span>共 {{ manualTaskForm.attachment.length }} 个附件</span>
              <el-button
                size="mini"
                type="text"
                @click="checkAttachmentList(manualTaskForm.attachment)">
                查看
              </el-button>
            </span>

            <ChooseAttachmentDialog
              v-model="manualAttachmentDialogVisible"
              @update:attachments="handleManualAttachmentsUpdate"
            />
          </el-form-item>

          <el-form-item label="主题：">
            <el-input
              v-model="manualTaskForm.subject"
              style="width: 300px"
              placeholder="请输入主题"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <template #label>
              <el-button type="primary" @click="sendManualEmail">发送</el-button>
            </template>
          </el-form-item>
        </el-form>
      </div>

      <div class="editToolbar">
        <RichEditor v-model="manualTaskForm.template_content" />
      </div>

      <!-- 查看列表信息对话框 -->
      <ListDialog :title="详情" v-model="listDialog" :list="listDetails" />

    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import RichEditor from "@/components/RichEditor.vue";
import { debounce } from 'lodash';
import { errorHandler } from "@/utils/errorHandler.js";
import { emailTypeApi } from "@/api/dictionary/emailType.js";
import { sendEmailApi } from "@/api/sendEmail/sendEmail.js";
import { templateApi } from "@/api/email/template/template.js";
import emailData from "@/constants/EmailConstantData.js";
import ChooseReceiverDialog from "@/components/email/ChooseReceiverDialog.vue";
import ListDialog from "@/components/ListDialog.vue";
import ChooseAttachmentDialog from "@/components/email/ChooseAttachmentDialog.vue";
import ChooseTemplateDialog from "@/components/email/ChooseTemplateDialog.vue";
import { ElMessage } from "element-plus";

//=====================================数据=====================================
const manualTaskForm = ref({
  email_type_id: null,
  emailTypeOptions: [],
  supplier_value: null,
  customer_value: null,
  template_id: null,
  template_name: null,
  template_content: "<div>\n" +"<p>请编辑模板内容</p></div>\n",
  attachment: [],
  subject: null,
  content: null,
});

//=====================================功能=====================================
// 发送手动邮件
const sendManualEmail = async () => {
  try {
    if(!await createManualTaskValidate()){
      return
    }
    const requestData = {
      subject: manualTaskForm.value.subject,
      email_type_id: manualTaskForm.value.email_type_id,
      template_id: manualTaskForm.value.template_id || null,
      email_content: completeTemplateContent(manualTaskForm.value.template_content),
      receiver_id: manualTaskForm.value.customer_value?.receiver_ids || [],
      receiver_supplier_id: manualTaskForm.value.supplier_value?.receiver_ids || [],
      receiver_key: manualTaskForm.value.customer_value?.receiver_key || null,
      receiver_supplier_key: manualTaskForm.value.supplier_value?.receiver_key || null,
      cancel_receiver_id: null,
      attachment: manualTaskForm.value.attachment.length > 0 ? manualTaskForm.value.attachment : null,
    }
    console.log("发送手动邮件请求数据", requestData);
    const res = await sendEmailApi.sendEmail(requestData)
    if (res.code === 200) {
      ElMessage.success("发送邮件成功")
      console.log("发送手动邮件响应数据成功", res);
      manualTaskFormReset()
    } else {
      errorHandler.showError("发送手动邮件失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("发送手动邮件失败,请重试", error);
  }
}
const handleReceiversSelect = (result) => {
  if(result.type === emailData.ReceiverType.Supplier){
    manualTaskForm.value.supplier_value = result
  }else if(result.type === emailData.ReceiverType.Customer){
    manualTaskForm.value.customer_value = result
  }
  console.log('选中的接收者：', result)
  console.log('选中的供应商：', manualTaskForm.value.supplier_value)
  console.log('选中的客户：', manualTaskForm.value.customer_value)
  // result 格式：{ type: 1|2, total_items: 0, receiver_key: null, receiver_ids: [] }
}
const handleManualAttachmentsUpdate = (attachments) => {
  manualTaskForm.value.attachment = attachments
  console.log('手动发送选中的附件：', attachments)
}
const handleManualTemplateSelect = async (template) => {
  try {
    const requestData = {
      template_id: template.id
    }
    console.log("查看模板请求数据", requestData);
    const res = await templateApi.checkTemplate(requestData)
    if (res.code === 200) {
      console.log("查看模板响应数据成功", res);
      manualTaskForm.value.template_content = res.data;
      manualTaskForm.value.template_name = template.name;
      manualTaskForm.value.template_id = template.id;
    } else {
      errorHandler.showError("失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("失败,请重试", error);
  }

  console.log('手动发送选中的模版：', template)
}
const manualTaskFormReset = () => {
  manualTaskForm.value = {
    email_type_id: null,
    emailTypeOptions: [],
    supplier_value: null,
    customer_value: null,
    template_id: null,
    template_name: null,
    template_content: "<div>\n" +"<p>请编辑模板内容</p></div>\n",
    attachment: [],
    subject: null,
  }
}

//=====================================对话框=====================================
// 对话框
const listDetails = ref([]);
const listDialog = ref(false);
const receiverDialogVisible = ref(false);
const manualAttachmentDialogVisible = ref(false);
const manualTemplateDialogVisible = ref(false);
const currentReceiverType = ref(emailData.ReceiverType.Supplier);
const openSupplierDialog = () => {
  currentReceiverType.value = emailData.ReceiverType.Supplier;
  receiverDialogVisible.value = true;
}
const openCustomerDialog = () => {
  currentReceiverType.value = emailData.ReceiverType.Customer;
  receiverDialogVisible.value = true;
}
const openManualAttachmentDialog = () => {
  manualAttachmentDialogVisible.value = true;
}
const openManualTemplateDialog = () => {
  manualTemplateDialogVisible.value = true;
}
const checkAttachmentList = (attachments) => {
  console.log("查看附件列表", attachments);
  listDetails.value = attachments.map(attachment => attachment.attachment_name)
  listDialog.value = true
}
//=====================================其他功能=====================================
// 创建节日发送邮件任务
const createManualTaskEmailType = async (query) => {
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("创建节日发送邮件任务请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      manualTaskForm.value.emailTypeOptions = res.data.email_type
      console.log("创建节日发送邮件任务响应数据", res);
      console.log("创建节日发送邮件任务缓存数据", manualTaskForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("创建节日发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("创建节日发送邮件任务失败,请重试", error);
  }
}
const debouncedCreateManualTaskEmailType = debounce(createManualTaskEmailType, 500)

// 补全模板内容
const completeTemplateContent = (templateContent) => {
  let allContent = "";
  allContent += "<!DOCTYPE html>\n" +
    "<html lang='zh-CN'>\n" +
    "<head>\n" +
        "<meta charset='UTF-8'>\n" +
        "<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
        "<title>" + manualTaskForm.value.subject + "</title>\n" +
    "</head>\n" +
    "<body>\n" +
      templateContent+
    "</body>\n" +
    "</html>";
  return allContent
}

// 创建手动任务验证
const createManualTaskValidate = async () => {
  try {
    if(manualTaskForm.value.subject === null || manualTaskForm.value.subject === ''){
      ElMessage.warning("请填写主题");
      return false
    }
    if((!manualTaskForm.value.supplier_value?.receiver_ids?.length && !manualTaskForm.value.supplier_value?.receiver_key) &&
    (!manualTaskForm.value.customer_value?.receiver_ids?.length && !manualTaskForm.value.customer_value?.receiver_key)) {
      ElMessage.warning("请选择接收者");
      return false
    }
    if(manualTaskForm.value.email_type_id === null || manualTaskForm.value.email_type_id === ''){
      ElMessage.warning("请选择邮件类型");
      return false
    }
    return true
  } catch (error) {
    errorHandler.showError("请完整填写信息", error);
    return false
  }
}
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.result-section {
  margin: 2px 0;
}
.month-time-picker-container-items{
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1em;
}
.sendEmail {
  display: flex;
  flex: 1;
  height: 100%;
}

.sendEmailContainer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 3em;
  font-size: 15px;
}

.sender, .recipient, .appendix, .emailTemplate, .editToolbar, .saveTemplate, .chooseType{
  margin-bottom: 1.5em;
  font-size: 1em;
}
.sendConfig{
  margin-bottom: 10em;

}
.sendConfig el-tabs el-tab-pane{
  background-color:#000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.appendix button {
  margin-left: 1.1em;
}

.month-time-picker-container {
  display: flex;
  flex-direction: column;
  margin: 20px;
}
</style>

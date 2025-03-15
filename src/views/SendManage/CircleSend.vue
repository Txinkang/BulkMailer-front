<template>
  <div class="sendEmailContainer">
    <div>
      <el-form label-width="120px" label-position="left">

        <el-form-item label="选择邮件类型：">
          <el-select
              v-model="circleTaskForm.email_type_id"
              placeholder="请搜索邮件类型"
              filterable
              remote
              :remote-method="debouncedCreateCircleTaskEmailType"
              clearable
              style="width:200px;"
              >
              <el-option
              v-for="emailType in circleTaskForm.emailTypeOptions"
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
          <span v-if="circleTaskForm.supplier_value" style="margin-left: 10px">
            <span>共 {{ circleTaskForm.supplier_value.total_items }} 个供应商</span>
          </span>
          <!-- 客户 -->
          <el-button type="primary" @click="openCustomerDialog">
            <el-icon style="vertical-align: middle">
              <CirclePlus/>
            </el-icon>
            <span style="vertical-align: middle"> 客户 </span>
          </el-button>
          <span v-if="circleTaskForm.customer_value" style="margin-left: 10px">
            <span>共 {{ circleTaskForm.customer_value.total_items }} 个客户</span>
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
            @click="openCircleTemplateDialog"
          >
            <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
            <span style="vertical-align: middle"> 选择 </span>
          </el-button>

          <span v-if="circleTaskForm.template_name" style="margin-left: 10px">
            已选择模板: {{ circleTaskForm.template_name }}
          </span>

          <ChooseTemplateDialog
            v-model="circleTemplateDialogVisible"
            @select-template="handleCircleTemplateSelect"
          />
        </el-form-item>

        <el-form-item label="选择附件：">
          <el-button
            type="primary"
            @click="openCircleAttachmentDialog"
          >
            <el-icon style="vertical-align: middle"><CirclePlus/></el-icon>
            <span style="vertical-align: middle"> 选择 </span>
          </el-button>

          <span v-if="circleTaskForm.attachment && circleTaskForm.attachment.length > 0" style="margin-left: 10px">
            <span>共 {{ circleTaskForm.attachment.length }} 个附件</span>
            <el-button
              size="mini"
              type="text"
              @click="checkAttachmentList(circleTaskForm.attachment)">
              查看
            </el-button>
          </span>

          <ChooseAttachmentDialog
            v-model="circleAttachmentDialogVisible"
            @update:attachments="handleCircleAttachmentsUpdate"
          />
        </el-form-item>

        <el-form-item label="主题：">
          <el-input
            v-model="circleTaskForm.subject"
            style="width: 300px"
            placeholder="请输入主题"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="发送周期：">
          <el-input-number
            v-model="circleTaskForm.send_cycle"
            style="width: 300px"
            placeholder="请输入天数"
            size="large"
            clearable
            :min="1"
            :max="365"
          />
        </el-form-item>

        <el-form-item>
          <template #label>
            <el-button type="primary" @click="sendCircleEmail">发送</el-button>
          </template>
        </el-form-item>

      </el-form>

      <!-- 查看列表信息对话框 -->
      <ListDialog :title="详情" v-model="listDialog" :list="listDetails" />

    </div>

  </div>


</template>


<script setup>
import {ref} from "vue";
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

const circleTaskForm = ref({
  email_type_id: null,
  emailTypeOptions: [],
  supplier_value: null,
  customer_value: null,
  template_id: null,
  template_name: null,
  attachment: [],
  subject: null,
  send_cycle: null,
});

// 发送循环邮件
const sendCircleEmail = async () => {
  try {
    if(!await createCircleTaskValidate()){
      return
    }
    const requestData = {
      subject: circleTaskForm.value.subject,
      email_type_id: circleTaskForm.value.email_type_id,
      template_id: circleTaskForm.value.template_id,
      receiver_id: circleTaskForm.value.customer_value?.receiver_ids || [],
      receiver_supplier_id: circleTaskForm.value.supplier_value?.receiver_ids || [],
      receiver_key: circleTaskForm.value.customer_value?.receiver_key || null,
      receiver_supplier_key: circleTaskForm.value.supplier_value?.receiver_key || null,
      cancel_receiver_id: null,
      attachments: circleTaskForm.value.attachment.length > 0 ? circleTaskForm.value.attachment : [],
      send_cycle: circleTaskForm.value.send_cycle,
    }
    console.log("发送循环邮件请求数据", requestData);
    const res = await sendEmailApi.sendEmailCycle(requestData)
    if (res.code === 200) {
      ElMessage.success("发送邮件成功")
      console.log("发送循环邮件响应数据成功", res);
      circleTaskFormReset()
    } else {
      errorHandler.showError("发送循环邮件失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("发送循环邮件失败,请重试", error);
  }
}
const handleReceiversSelect = (result) => {
  if(result.type === emailData.ReceiverType.Supplier){
    circleTaskForm.value.supplier_value = result
  }else if(result.type === emailData.ReceiverType.Customer){
    circleTaskForm.value.customer_value = result
  }
  console.log('选中的接收者：', result)
  // result 格式：{ type: 1|2, total_items: 0, receiver_key: null, receiver_ids: [] }
}
const handleCircleAttachmentsUpdate = (attachments) => {
  circleTaskForm.value.attachment = attachments
  console.log('循环发送选中的附件：', attachments)
}
const handleCircleTemplateSelect = (template) => {
  circleTaskForm.value.template_id = template.id
  circleTaskForm.value.template_name = template.name
  console.log('循环发送选中的模版：', template)
}
const circleTaskFormReset = () => {
  circleTaskForm.value = {
    email_type_id: null,
    emailTypeOptions: [],
    supplier_value: null,
    customer_value: null,
    template_id: null,
    template_name: null,
    attachment: [],
    subject: null,
  }
}

// 对话框
const listDetails = ref([]);
const listDialog = ref(false);
const receiverDialogVisible = ref(false);
const circleAttachmentDialogVisible = ref(false);
const circleTemplateDialogVisible = ref(false);
const currentReceiverType = ref(emailData.ReceiverType.Supplier);
const openSupplierDialog = () => {
  currentReceiverType.value = emailData.ReceiverType.Supplier;
  receiverDialogVisible.value = true;
}
const openCustomerDialog = () => {
  currentReceiverType.value = emailData.ReceiverType.Customer;
  receiverDialogVisible.value = true;
}
const openCircleAttachmentDialog = () => {
  circleAttachmentDialogVisible.value = true;
}
const openCircleTemplateDialog = () => {
  circleTemplateDialogVisible.value = true;
}
const checkAttachmentList = (attachments) => {
  console.log("查看附件列表", attachments);
  listDetails.value = attachments.map(attachment => attachment.attachment_name)
  listDialog.value = true
}

//=====================================其他功能=====================================
// 创建循环发送搜索邮件类型
const createCircleTaskEmailType = async (query) => {
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("创建循环发送邮件任务请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      circleTaskForm.value.emailTypeOptions = res.data.email_type
      console.log("创建循环发送邮件任务响应数据", res);
      console.log("创建循环发送邮件任务缓存数据", circleTaskForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("创建循环发送邮件任务失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("创建循环发送邮件任务失败,请重试", error);
  }
}
const debouncedCreateCircleTaskEmailType = debounce(createCircleTaskEmailType, 500)

// 创建循环发送邮件任务验证
const createCircleTaskValidate = async () => {
  try {
    if(circleTaskForm.value.subject === null || circleTaskForm.value.subject === ''){
      ElMessage.warning("请填写主题");
      return false
    }
    if((!circleTaskForm.value.supplier_value?.receiver_ids?.length && !circleTaskForm.value.supplier_value?.receiver_key) &&
    (!circleTaskForm.value.customer_value?.receiver_ids?.length && !circleTaskForm.value.customer_value?.receiver_key)) {
      ElMessage.warning("请选择接收者");
      return false
    }
    if(circleTaskForm.value.email_type_id === null || circleTaskForm.value.email_type_id === ''){
      ElMessage.warning("请选择邮件类型");
      return false
    }
    if(circleTaskForm.value.template_id === null || circleTaskForm.value.template_id === ''){
      ElMessage.warning("请选择模版");
      return false
    }
    if(circleTaskForm.value.send_cycle === null || circleTaskForm.value.send_cycle < 1){
      ElMessage.warning("请输入发送周期");
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
.sendEmailContainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: 3em;
  font-size: 15px;
  gap: 20px;
}

</style>

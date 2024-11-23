<template>
  <div class="sendEmail">
    <div class="sendEmailContainer">

      <div class="sender">
        <span>
        指定发件人：
        </span>
        <el-button type="primary" @click="sendOpenDialog">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle"> 添加 </span>
        </el-button>
        <span style="opacity: 0.6">
        (不指定就默认当前登录用户发送)
        </span>

        <!-- 发件人选择对话框 -->
        <el-dialog
          title="选择发件人"
          v-model="sendDialogVisible"
          width="50%"
          @close="sendResetDialog"
        >
          <!-- 发件人列表 -->
          <div class="sender-grid">
            <el-checkbox-group v-model="selectedSenders">
              <div
                v-for="sender in senders"
                :key="sender.id"
                class="sender-item"
              >
                <el-checkbox :label="sender.name">{{ sender.name }}</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>

          <!-- 底部按钮 -->
          <template #footer>
            <el-button @click="selectAllSenders">全选</el-button>
            <el-button @click="clearSelection">取消</el-button>
            <el-button type="primary" @click="confirmSelection">确定</el-button>
          </template>
        </el-dialog>
      </div>

      <div class="recipient">
        <span>
        指定收件人：
        </span>
        <el-button type="primary" @click="recipientopenDialog">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle"> 添加 </span>
        </el-button>

        <!-- 筛选收件人对话框 -->
        <el-dialog
          title="筛选收件人"
          v-model="filterDialogVisible"
          width="50%"
          @close="filterResetDialog"
        >
          <!-- 筛选条件 -->
          <div class="filter-section">
            <el-select v-model="selectedCountry" placeholder="选择国家" @change="filterRecipients">
              <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
            </el-select>
            <el-select v-model="selectedRegion" placeholder="选择区域" @change="filterRecipients" :disabled="!selectedCountry">
              <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
            </el-select>
            <el-cascader
              v-model="selectedProduct"
              :options="productOptions"
              placeholder="选择商品品类"
              @change="filterRecipients"
              :disabled="!selectedRegion"
            />
          </div>

          <!-- 筛选结果 -->
          <div class="result-section">
            <p>筛选结果：</p>
            <el-checkbox-group v-model="selectedRecipients">
              <el-checkbox v-for="recipient in filteredRecipients" :key="recipient.id" :label="recipient.name">
                {{ recipient.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 底部按钮 -->
          <template #footer>
            <el-button @click="selectAllRecipients">全选</el-button>
            <el-button @click="clearSelection">取消</el-button>
            <el-button type="primary" @click="confirmSelection">确定</el-button>
          </template>
        </el-dialog>


      </div>

      <div class="appendix">
        <span>
        选择附件：
        </span>
        <el-button type="primary" @click="appendixOpenDialog">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle"> 添加 </span>
        </el-button>

        <!-- 附件选择对话框 -->
        <el-dialog
          title="选择附件"
          v-model="appednixDialogVisible"
          width="50%"
          @close="appendixResetDialog"
        >
          <!-- 发件人列表 -->
          <div class="appendix-grid">
            <el-checkbox-group v-model="selectedAppendix">
              <div
                v-for="appendix in appendixs"
                :key="appendix.id"
                class="appendix-item"
              >
                <el-checkbox :label="appendix.name">{{ appendix.name }}</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>

          <!-- 底部按钮 -->
          <template #footer>
            <el-button @click="selectAllappendixs">全选</el-button>
            <el-button @click="clearSelection">取消</el-button>
            <el-button type="primary" @click="confirmSelection">确定</el-button>
          </template>
        </el-dialog>
      </div>

      <div class="emailTitle">
        <el-form ref="emailTitleRef" :rules="emailTitleRule">
          <el-form-item prop="emailTitle">
            <span>主题：</span>
            <el-input
              v-model="emailTitle"
              placeholder="请输入主题"
              size="large"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="emailTemplate">
        <el-tabs>
          <el-tab-pane label="公共模板">
            <el-radio-group v-model="emailTemplate.emailPublicTemplate" @change="chooseEmailTemplate(emailTemplate.emailPublicTemplate)">
              <el-radio value="1">
                空白模板
              </el-radio>
              <el-radio value="2">
                商品促销模板
              </el-radio>
              <el-radio value="3">
                跟进模板
              </el-radio>
              <el-radio value="4">
                节日模板
              </el-radio>
              <el-radio value="5">
                生日模板
              </el-radio>
            </el-radio-group>
          </el-tab-pane>
          <el-tab-pane label="个人模板">
            <el-radio-group v-model="emailTemplate.emailPersonalTemplate">
              <el-radio value="1">
                个人模板1
              </el-radio>
              <el-radio value="2">
                个人模板2
              </el-radio>
              <el-radio value="3">
                个人模板3
              </el-radio>
              <el-radio value="4">
                个人模板4
              </el-radio>
              <el-radio value="5">
                个人模板5
              </el-radio>
            </el-radio-group>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 保存模板按钮 -->
      <div class="saveTemplate">
        <el-button type="primary" @click="openDialog">
          保存模板
        </el-button>
        <el-button type="primary" @click="deleteTemplate">
          删除模板
        </el-button>
      </div>

      <!-- 保存模板的对话框 -->
      <el-dialog
        title="保存模板"
        v-model="dialogVisible"
        width="300"
        @close="resetDialog"
      >
        <!-- 对话框内容 -->
        <div>
          <span>请输入模板名称：</span>
          <el-input v-model="templateName" placeholder="模板名称" />
        </div>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </template>
      </el-dialog>

      <div class="editToolbar">
        <EditToolbar :data="emailTemplate.emailPublicTemplate"></EditToolbar>
      </div>

      <div class="sendConfig">
        <el-tabs type="border-card">
          <el-tab-pane label="单次发送">
            <span>
              如果不需要定时，点击立即发送即可
            </span>
            <div class="month-time-picker-container">
              <!-- 月份选择器 -->
              <el-date-picker
                v-model="selectedMonth"
                type="month"
                placeholder="选择月份"
                :format="monthFormat"
                @change="handleMonthChange"
              />

              <!-- 时间选择器 -->
              <el-time-picker
                v-model="selectedTime"
                placeholder="选择时间"
                :format="timeFormat"
                :picker-options="timeOptions"
                @change="handleTimeChange"
                style="margin-top: 10px;"
              />
            </div>
            <div>
              <el-button type="primary">
                立即发送
              </el-button>
              <el-button type="primary">
                定时发送
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="循环发送">
            <div class="month-time-picker-container">
              <div class="month-time-picker-container-items">
                <span>
                开始时间：
              </span>
                <!-- 月份选择器 -->
                <el-date-picker
                  v-model="selectedMonth"
                  type="month"
                  placeholder="选择月份"
                  :format="monthFormat"
                  @change="handleMonthChange"
                />
              </div>
              <div class="month-time-picker-container-items">
                <span>
                结束时间：
              </span>
                <!-- 时间选择器 -->
                <el-time-picker
                  v-model="selectedTime"
                  placeholder="选择时间"
                  :format="timeFormat"
                  :picker-options="timeOptions"
                  @change="handleTimeChange"
                  style="margin-top: 10px;"
                />
              </div>
            </div>
            <div>
              <el-button type="primary">
                立即发送
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="节日发送">
            <div class="month-time-picker-container">
              <!-- 月份选择器 -->
              <el-date-picker
                v-model="selectedMonth"
                type="month"
                placeholder="选择月份"
                :format="monthFormat"
                @change="handleMonthChange"
              />

              <!-- 时间选择器 -->
              <el-time-picker
                v-model="selectedTime"
                placeholder="选择时间"
                :format="timeFormat"
                :picker-options="timeOptions"
                @change="handleTimeChange"
                style="margin-top: 10px;"
              />
            </div>
            <div>
              <el-button type="primary">
                定时发送
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="生日发送">
            <div class="month-time-picker-container">
              <!-- 月份选择器 -->
              <el-date-picker
                v-model="selectedMonth"
                type="month"
                placeholder="选择月份"
                :format="monthFormat"
                @change="handleMonthChange"
              />

              <!-- 时间选择器 -->
              <el-time-picker
                v-model="selectedTime"
                placeholder="选择时间"
                :format="timeFormat"
                :picker-options="timeOptions"
                @change="handleTimeChange"
                style="margin-top: 10px;"
              />
            </div>
            <div>
              <el-button type="primary">
                定时发送
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import EditToolbar from "@/components/EditToolbar.vue";
import {ElMessage, ElMessageBox} from "element-plus";

const emailTemplate = reactive({
  "emailPublicTemplate": "1",
  "emailPersonalTemplate": "0",
});

const emailTitle = ref("");
const emailTitleRule = {
  "emailTitle": [{required: true, message: "请输入主题", trigger: "blur"}]
}
// 对话框可见性
const appednixDialogVisible = ref(false);

// 发件人列表
const appendixs = ref([
  { id: 1, name: "附件A" },
  { id: 2, name: "附件B" },
  { id: 3, name: "附件C" },
]);

// 被选中的发件人
const selectedAppendix = ref([]);

// 打开对话框
const appendixOpenDialog = () => {
  appednixDialogVisible.value = true;
};

// 重置对话框
const appendixResetDialog = () => {
  selectedAppendix.value = [];
};
// 对话框的可见性
const filterDialogVisible = ref(false);

// 筛选条件
const selectedCountry = ref(null);
const selectedRegion = ref(null);
const selectedProduct = ref([]);

// 收件人筛选结果
const recipients = ref([
  { id: 1, name: "收件人A", country: "中国", region: "华南", product: "手机" },
  { id: 2, name: "收件人B", country: "中国", region: "华北", product: "电脑" },
  { id: 3, name: "收件人C", country: "美国", region: "西部", product: "耳机" },
  { id: 4, name: "收件人D", country: "美国", region: "东部", product: "手机" },
]);

// 筛选后结果
const filteredRecipients = ref([]);

// 被选中的收件人
const selectedRecipients = ref([]);

// 国家、区域、商品数据
const countries = ["中国", "美国"];
const regions = ["华南", "华北", "西部", "东部"];
const productOptions = [
  {
    value: "电子产品",
    label: "电子产品",
    children: [
      { value: "手机", label: "手机" },
      { value: "电脑", label: "电脑" },
      { value: "耳机", label: "耳机" },
    ],
  },
  {
    value: "家电",
    label: "家电",
    children: [
      { value: "冰箱", label: "冰箱" },
      { value: "电视", label: "电视" },
    ],
  },
];

// 打开对话框
const recipientopenDialog = () => {
  filterDialogVisible.value = true;
};

// 关闭对话框并重置
const filterResetDialog = () => {
  selectedCountry.value = null;
  selectedRegion.value = null;
  selectedProduct.value = [];
  selectedRecipients.value = [];
  filteredRecipients.value = [];
};

// 筛选收件人
const filterRecipients = () => {
  filteredRecipients.value = recipients.value.filter((recipient) => {
    return (
      (!selectedCountry.value || recipient.country === selectedCountry.value) &&
      (!selectedRegion.value || recipient.region === selectedRegion.value) &&
      (!selectedProduct.value.length || recipient.product === selectedProduct.value[selectedProduct.value.length - 1])
    );
  });
};
// 对话框的可见性
const dialogVisible = ref(false);

// 模板名称
const templateName = ref("");

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true;
};
const deleteTemplate = () => {
  ElMessageBox.alert('删除成功', '删除模板', {
  })
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
};

// 重置对话框内容
const resetDialog = () => {
  templateName.value = ""; // 清空输入框
};
// 保存模板
const saveTemplate = () => {
  if (templateName.value.trim() === "") {
    // 输入为空时提示
    ElMessage.warning("模板名称不能为空！");
    return;
  }

  // 模板名称保存逻辑
  console.log("模板已保存，名称：", templateName.value);

  // 提示保存成功
  ElMessage.success(`模板 "${templateName.value}" 已保存！`);

  // 关闭对话框并重置内容
  closeDialog();
};
function chooseEmailTemplate(value) {
  console.log(value)
}
// 选中的时间
const selectedTime = ref(null);

// 时间格式
const timeFormat = "HH:mm:ss"; // 格式为 时:分:秒

// 处理时间变化
const handleTimeChange = (value) => {
  console.log("选中的时间是：", value);
};
// 对话框可见性
const sendDialogVisible = ref(false);

// 发件人列表
const senders = ref([
  { id: 1, name: "发件人A" },
  { id: 2, name: "发件人B" },
  { id: 3, name: "发件人C" },
]);

// 被选中的发件人
const selectedSenders = ref([]);

// 打开对话框
const sendOpenDialog = () => {
  sendDialogVisible.value = true;
};

// 重置对话框
const sendResetDialog = () => {
  selectedSenders.value = [];
};
</script>

<style scoped>
/* 修正网格布局的样式 */
.appendix-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 每行 3 列 */
  gap: 10px; /* 网格项之间的间距 */
  padding: 10px;
}

.appendix-item {
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  text-align: center;
  background-color: #f9f9f9;
}

.appendix-item:hover {
  background-color: #f0f9ff;
}
/* 修正网格布局的样式 */
.sender-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 每行 3 列 */
  gap: 10px; /* 网格项之间的间距 */
  padding: 10px;
}

.sender-item {
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  text-align: center;
  background-color: #f9f9f9;
}

.sender-item:hover {
  background-color: #f0f9ff;
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
}
.sendEmail {
  display: flex;
  flex: 1;
  height: 100%;
}

.sendEmailContainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: 3em;
  font-size: 15px;
}

.sender, .recipient, .appendix, .emailTemplate, .editToolbar, .saveTemplate{
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

.el-dialog {
  text-align: center;
}

.el-input {
  margin-top: 10px;
  width: 100%;
}

.month-time-picker-container {
  display: flex;
  flex-direction: column;
  margin: 20px;
}
</style>

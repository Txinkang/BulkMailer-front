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
          title="筛选发件人"
          v-model="filterSendDialogVisible"
          width="50%"
          @close="filterResetDialog"
        >
          <!-- 筛选条件 -->
          <div class="filter-section">
            <el-select v-model="selectedCompany" placeholder="选择公司" @change="filterRecipients">
              <el-option v-for="company in sendCompany" :key="company" :label="company" :value="company" />
            </el-select>
            <el-select v-model="selectedSector" placeholder="选择部门" @change="filterRecipients">
              <el-option v-for="sector in sendSector" :key="sector" :label="sector" :value="sector" />
            </el-select>
            <el-select v-model="selectedJob" placeholder="选择岗位" @change="filterRecipients">
              <el-option v-for="job in sendJob" :key="job" :label="job" :value="job" />
            </el-select>
          </div>

          <!-- 筛选结果 -->
          <div class="result-section">
            <p>筛选结果：</p>
            <el-checkbox-group v-model="selectedRecipients">
              <el-checkbox v-for="recipient in filteredSenders" :key="recipient.id" :label="recipient.name">
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
            <el-cascader
              v-model="selectedProduct"
              :options="productOptions"
              placeholder="选择商品品类"
              @change="filterRecipients"
            />
            <el-select v-model="selectedRegion" placeholder="选择区域" @change="filterRecipients" >
              <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
            </el-select>
            <el-select v-model="selectedCountry" placeholder="选择国家" @change="filterRecipients">
              <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
            </el-select>
            <el-select v-model="selectedRegion" placeholder="选择公司" @change="filterRecipients" >
              <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
            </el-select>
            <el-select v-model="selectedRegion" placeholder="选择部门" @change="filterRecipients" >
              <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
            </el-select>
            <el-select v-model="selectedRegion" placeholder="选择岗位" @change="filterRecipients" >
              <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
            </el-select>
          </div>

          <!-- 筛选结果 -->
          <div class="result-section">
            <p>筛选结果：</p>
<!--            <el-cascader
              v-model="selectedProduct"
              :options="recipientsOptions"
              placeholder="选择收件人"
              @change="filterRecipients"
              style="margin-bottom: 20px"
            />-->
            <el-checkbox-group>
              <el-checkbox>收件人xxx</el-checkbox>
              <el-checkbox>收件人xxx</el-checkbox>
              <el-checkbox>收件人xxx</el-checkbox>
              <el-checkbox>收件人xxx</el-checkbox>
              <el-checkbox>收件人xxx</el-checkbox>
            </el-checkbox-group>
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalData"
              layout="prev, pager, next"
              background
            />
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
          <el-tabs class="fileListTabs">
            <el-tab-pane label="私海附件">

              <!-- 搜索框 -->
              <div class="search-container">
                <el-input placeholder="请搜索附件名称" clearable>
                  <el-icon>
                    <Search/>
                  </el-icon>
                </el-input>
              </div>

              <!-- 筛选条件 -->
              <div class="filter-section">
                <el-select v-model="selectedCompany" placeholder="选择公司" @change="filterRecipients">
                  <el-option v-for="company in sendCompany" :key="company" :label="company" :value="company" />
                </el-select>
                <el-select v-model="selectedSector" placeholder="选择部门" @change="filterRecipients">
                  <el-option v-for="sector in sendSector" :key="sector" :label="sector" :value="sector" />
                </el-select>
                <el-select v-model="selectedJob" placeholder="选择岗位" @change="filterRecipients">
                  <el-option v-for="job in sendJob" :key="job" :label="job" :value="job" />
                </el-select>
              </div>

              <!-- 筛选结果 -->
              <div class="result-section">
                <p>筛选结果：</p>
                <el-checkbox-group v-model="publicFileGroup" style="margin-bottom: 15px">
                  <el-checkbox v-for="files in publicFileList" :key="files.id" :label="files.name">
                    {{files.name}}
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <!-- 分页 -->
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalData"
                layout="prev, pager, next"
                background
              />
            </el-tab-pane>

            <el-tab-pane label="公海附件">
              <!-- 搜索框 -->
              <div class="search-container">
                <el-input placeholder="请搜索附件名称" clearable>
                  <el-icon style="vertical-align: middle">
                    <Search/>
                  </el-icon>
                  <span style="vertical-align: middle"> Search </span>
                </el-input>

              </div>

              <el-checkbox-group v-model="publicFileGroup" style="margin-bottom: 15px">
                <el-checkbox v-for="files in publicFileList" :key="files.id" :label="files.name">
                  {{files.name}}
                </el-checkbox>
              </el-checkbox-group>

              <!-- 分页 -->
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalData"
                layout="prev, pager, next"
                background
              />
            </el-tab-pane>
          </el-tabs>


          <!-- 底部按钮 -->
          <template #footer>
            <el-button @click="selectAllappendixs">全选</el-button>
            <el-button @click="clearSelection">取消</el-button>
            <el-button type="primary" @click="confirmSelection">确定</el-button>
          </template>
        </el-dialog>
      </div>

      <div class="template">
        <el-tabs class="commodityManageTabs">
          <el-tab-pane label="私海模板">
            <!-- 头部 -->
            <el-form label-width="120px" inline>
              <!-- 搜索框 -->
              <el-form-item>
                <el-input
                  v-model="searchText"
                  placeholder="请搜索模板名称"
                  clearable
                  class="search-box"
                >
                  <template #append>
                    <el-button>
                      <el-icon>
                        <Search></Search>
                      </el-icon>
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 公司搜索框 -->
              <el-form-item label="所属公司">
                <el-select placeholder="请选择公司">
                  <el-option value="公司"/>
                  <el-option value="公司"/>
                </el-select>
              </el-form-item>

              <!-- 部门搜索框 -->
              <el-form-item label="所属部门">
                <el-select placeholder="请选择部门">
                  <el-option value="部门"/>
                  <el-option value="部门"/>
                </el-select>
              </el-form-item>

              <!-- 岗位搜索框 -->
              <el-form-item label="所属岗位">
                <el-select placeholder="请选择岗位">
                  <el-option value="岗位"/>
                  <el-option value="岗位"/>
                </el-select>
              </el-form-item>

              <!-- 刷新  -->
              <el-form-item>
                <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
              </el-form-item>
            </el-form>

            <!-- 表格数据 -->
            <el-table :data="tableData" border style="width: 100%;margin-bottom: 20px">
              <!-- 模板名称列 -->
              <el-table-column label="模板名称" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.commodity }}</span>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="100">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="useTemplate">使用</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalData"
              layout="prev, pager, next"
              background
            />
          </el-tab-pane>

          <el-tab-pane label="公海模板">
            <!-- 头部 -->
            <el-form label-width="120px" inline>
              <!-- 搜索框 -->
              <el-form-item>
                <el-input
                  v-model="searchText"
                  placeholder="请搜索模板名称"
                  clearable
                  class="search-box"
                >
                  <template #append>
                    <el-button>
                      <el-icon>
                        <Search></Search>
                      </el-icon>
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 刷新  -->
              <el-form-item>
                <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
              </el-form-item>

              <!-- 创建模板按钮 -->
              <el-form-item>
                <el-button type="primary" @click="openCreateDialog">创建模板</el-button>
              </el-form-item>
            </el-form>

            <!-- 表格数据 -->
            <el-table :data="tableData" border style="width: 100%;margin-bottom: 20px">
              <!-- 模板名称列 -->
              <el-table-column label="模板名称" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.commodity }}</span>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="100">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="useTemplate">使用</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalData"
              layout="prev, pager, next"
              background
            />
          </el-tab-pane>
        </el-tabs>
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

      <div class="editToolbar">
        <EditToolbar :data="checked"></EditToolbar>
      </div>

      <div class="sendConfig">
        <el-tabs type="border-card">
          <el-tab-pane label="定时发送">
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
          <el-tab-pane label="周期发送">
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
              <div class="month-time-picker-container-items">
                <span>
                发送频率：
              </span>
                <el-input-number style="width: 10%"></el-input-number>
                <span>天，</span>
                <el-input-number style="width: 10%"></el-input-number>
                <span>次</span>
              </div>
            </div>
            <div>
              <el-button type="primary">
                立即发送
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="定期发送">
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
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, reactive, ref} from "vue";
import EditToolbar from "@/components/EditToolbar.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {Search} from "@element-plus/icons-vue";
// 数据定义

const emailTemplate = reactive({
  "emailPublicTemplate": "1",
  "emailPersonalTemplate": "0",
});

const emailTitle = ref("");
const emailTitleRule = {
  "emailTitle": [{required: true, message: "请输入主题", trigger: "blur"}]
}
// 分页数据
const totalData = ref(100);
// 当前页
const currentPage = ref(1);
// 每页显示条数
const pageSize = ref(10);


// 对话框可见性
const appednixDialogVisible = ref(false);

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
const filterSendDialogVisible = ref(false);


// 收件人筛选条件
const selectedCountry = ref(null);
const selectedRegion = ref(null);
const selectedProduct = ref([]);
//发件人筛选条件
const selectedCompany = ref(null);
const selectedSector = ref(null);
const selectedJob = ref(null);

// 收件人筛选结果
const recipients = ref([
  { id: 1, name: "收件人A", country: "中国", region: "华南", product: "手机" },
  { id: 2, name: "收件人B", country: "中国", region: "华北", product: "电脑" },
  { id: 3, name: "收件人C", country: "美国", region: "西部", product: "耳机" },
  { id: 4, name: "收件人D", country: "美国", region: "东部", product: "手机" },
]);
// 表格数据
const publicFileGroup = ref([]);
const publicFileList = ref([
  { id: 1, name: "附件1xxxxx" },
  { id: 2, name: "附件2xxxxx" },
  { id: 3, name: "附件3xxxxx" },
  { id: 4, name: "附件4xxxxx" },
  { id: 5, name: "附件5xxxxx" },
  { id: 6, name: "附件6xxxxx" },
  { id: 7, name: "附件7xxxxx" },
  { id: 8, name: "附件8xxxxx" },
  { id: 9, name: "附件9xxxxx" },
  { id: 10, name: "附件10xxxxx" },

]);
// 收件人筛选后结果
const filteredRecipients = ref([]);
// 发件人筛选后结果
const filteredSenders = ref([{name:"发件人1"}]);

// 被选中的收件人
const selectedRecipients = ref([]);

// 国家、区域、商品数据
const countries = ["中国", "美国"];
const regions = ["华南", "华北", "西部", "东部"];
//公司、部门、岗位
const sendCompany = ["公司", "公司", "公司", "公司"];
const sendSector = ["部门", "部门", "部门", "部门"];
const sendJob = ["岗位", "岗位", "岗位", "岗位"];
// 表格的静态数据
const tableData = [
  {commodity: "模板1"},
  {commodity: "模板2" },
  {commodity: "模板3" },
  {commodity: "模板4" },
];

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

const recipientsOptions = [
  {
    value: "公司",
    label: "公司",
    children: [
      { value: "部门", label: "部门" ,children:[{value: "岗位", label: "岗位" ,children:[{value: "用户", label: "用户" }]}]},
      { value: "部门", label: "部门" ,children:[{value: "岗位", label: "岗位" ,children:[{value: "用户", label: "用户" }]}]},
      { value: "部门", label: "部门" ,children:[{value: "岗位", label: "岗位" ,children:[{value: "用户", label: "用户" }]}]},
    ],
  },
  {
    value: "公司",
    label: "公司",
    children: [
      { value: "部门", label: "部门" ,children:[{value: "岗位", label: "岗位" ,children:[{value: "用户", label: "用户" }]}]},
      { value: "部门", label: "部门" ,children:[{value: "岗位", label: "岗位" ,children:[{value: "用户", label: "用户" }]}]},
      { value: "部门", label: "部门" ,children:[{value: "岗位", label: "岗位" ,children:[{value: "用户", label: "用户" }]}]},
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
//查看模板
const checked = ref();
const useTemplate = () => {
  checked.value = "<div>\n" +
    "    <div>\n" +
    "      <h1>限时促销，不容错过！</h1>\n" +
    "    </div>\n" +
    "    <div>\n" +
    "      <h2>精选商品低至 <strong>9.99元</strong></h2>\n" +
    "      <p>亲爱的 [收件人名字]，<br>\n" +
    "        感谢您一直以来的支持！我们为您准备了专属惊喜：<br><br>\n" +
    "        <strong>电子产品</strong> 限时优惠，低至 <strong>[折扣/价格]</strong>！<br>\n" +
    "        活动时间：<strong>2024-11-27 至 2024-11-30</strong><br><br>\n" +
    "        数量有限，手慢无！快来加入这场购物狂欢！</p>\n" +
    "      <a href=\"[购买链接]\">立即抢购</a>\n" +
    "    </div>\n" +
    "    <div>\n" +
    "      <p>© 2024 [您的公司名称]. 保留所有权利。</p>\n" +
    "    </div>\n" +
    "  </div>";
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


// 打开对话框
const sendOpenDialog = () => {
  filterSendDialogVisible.value = true;
};

</script>

<style scoped>
.search-container {
  width: 300px;
  margin-bottom: 5px;
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

.month-time-picker-container {
  display: flex;
  flex-direction: column;
  margin: 20px;
}
</style>

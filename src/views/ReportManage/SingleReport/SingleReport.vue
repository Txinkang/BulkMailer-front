<template>
  <div class="mail-container">
    <!-- 筛选条件 -->
    <div style="display: flex;flex-flow: row wrap;gap: 10px;">
      <el-form style="display: flex;flex-flow: row wrap;gap: 10px;">
        <el-form-item>
          <el-input style="width: 200px" placeholder="请搜索主题名称"></el-input>
        </el-form-item>

        <el-form-item>
          <el-input style="width: 200px" placeholder="请搜索发件人"></el-input>
        </el-form-item>

        <el-form-item>
          <el-select style="width: 200px" placeholder="选择任务类型">
            <el-option label="手动发送"></el-option>
            <el-option label="循环发送"></el-option>
            <el-option label="生日发送"></el-option>
            <el-option label="节日发送"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select style="width: 200px" placeholder="选择邮件类型">
            <el-option label="商品促销"></el-option>
            <el-option label="生日祝福"></el-option>
            <el-option label="节日祝福"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select style="width: 200px" placeholder="选择状态">
            <el-option label="已完成"></el-option>
            <el-option label="发送失败"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-date-picker
            style="width: 200px"
            v-model="selectedDate"
            type="date"
            placeholder="发送时间"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button type="primary">
            <el-icon>
              <Refresh/>
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div style="width: 100%">
      <el-table :data="tableData" border style="width: 100%;margin-bottom: 2em">
        <!-- 主题列 -->
        <el-table-column label="主题">
          <template #default="{ row }">
            {{ row.subject }}
          </template>
        </el-table-column>

        <!-- 发件人列 -->
        <el-table-column label="发件人">
          <template #default="{ row }">
            {{ row.senders }}
          </template>
        </el-table-column>

        <!-- 任务类型列 -->
        <el-table-column label="任务类型">
          <template #default="{ row }">
            {{ row.taskType }}
          </template>
        </el-table-column>

        <!-- 邮件类型列 -->
        <el-table-column label="邮件类型">
          <template #default="{ row }">
            {{ row.emailType }}
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态">
          <template #default="{ row }">
            {{ row.allStatus }}
          </template>
        </el-table-column>

        <!-- 时间列 -->
        <el-table-column label="时间">
          <template #default="{ row }">
            {{ row.date }}
          </template>
        </el-table-column>

        <!-- 报表列 -->
        <el-table-column label="查看报表" >
          <el-button type="primary">查看任务报表</el-button>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalData"
        layout="prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {Search} from "@element-plus/icons-vue";

// 激活的标签页
const activeTab = ref("delivered");

// 筛选条件
const selectedDate = ref(null);

// 表格数据
const tableData = [
  {subject: "商品促销", taskType:"手动发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", allStatus: "已完成", status:"已送达", failedDetail:"网络波动", date: "2023-12-01",},
  {subject: "商品促销", taskType:"循环发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", allStatus: "发送失败", status:"未送达", failedDetail:"网络波动", date: "2023-12-01",},
  {subject: "商品促销", taskType:"生日发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", allStatus: "已完成", status:"已送达", failedDetail:"网络波动", date: "2023-12-01",},
  {subject: "商品促销", taskType:"节日发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", allStatus: "发送失败", status:"未送达", failedDetail:"网络波动", date: "2023-12-01",},
  {subject: "商品促销", taskType:"手动发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", allStatus: "已完成", status:"已送达", failedDetail:"网络波动", date: "2023-12-01",},

];
// 未送达邮件表格数据
const undeliveredTableData = [
  {
    subject: "商品促销",
    emailType: "商品促销",
    senders: "张三",
    sendersEmail: "sender@gmail.com",
    receivers: "赵五",
    receiversEmail: "receiver@gmail.com",
    receiversGrade: "高级",
    allStatus: "发送中",
    status:"已送达",
    date: "2023-12-01",
    undeliveredDetails:"网络波动",
  },
  {
    subject: "商品促销",
    emailType: "商品促销",
    senders: "张三",
    sendersEmail: "sender@gmail.com",
    receivers: "赵五",
    receiversEmail: "receiver@gmail.com",
    receiversGrade: "高级",
    allStatus: "发送中",
    status:"已送达",
    date: "2023-12-01",
    undeliveredDetails:"网络波动",
  },
  {
    subject: "商品促销",
    emailType: "商品促销",
    senders: "张三",
    sendersEmail: "sender@gmail.com",
    receivers: "赵五",
    receiversEmail: "receiver@gmail.com",
    receiversGrade: "高级",
    allStatus: "发送中",
    status:"已送达",
    date: "2023-12-01",
    undeliveredDetails:"网络波动",
  },
  {
    subject: "商品促销",
    emailType: "商品促销",
    senders: "张三",
    sendersEmail: "sender@gmail.com",
    receivers: "赵五",
    receiversEmail: "receiver@gmail.com",
    receiversGrade: "高级",
    allStatus: "发送中",
    status:"已送达",
    date: "2023-12-01",
    undeliveredDetails:"网络波动",
  },
  {
    subject: "商品促销",
    emailType: "商品促销",
    senders: "张三",
    sendersEmail: "sender@gmail.com",
    receivers: "赵五",
    receiversEmail: "receiver@gmail.com",
    receiversGrade: "高级",
    allStatus: "发送中",
    status:"已送达",
    date: "2023-12-01",
    undeliveredDetails:"网络波动",
  },
];

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref(""); // "发件人" 或 "收件人"
const dialogData = ref([]); // 当前点击的发件人或收件人
const emailDetailsDialog = ref(false);
const detailsDialogVisible = ref(false);
const senderDetails = ref(false);
const receiverDetails = ref(false);
const failedReasonDetails = ref(false);
// 未送达策略对话框控制
const strategyDialogVisible = ref(false);
// 打开对话框
const checkSender = () => {
  senderDetails.value = true;
}
const checkReceiver = () => {
  receiverDetails.value = true;
}
const checkFailedReason = () => {
  failedReasonDetails.value = true;
}
const openEmailDetails = () => {
  emailDetailsDialog.value = true;
}
const openDetailsDialog = () => {
  detailsDialogVisible.value = true;
}
const openDialog = (type, data) => {
  dialogType.value = type;
  dialogData.value = data;
  dialogVisible.value = true;
};
// 打开未送达策略对话框
const openStrategyDialog = () => {
  strategyDialogVisible.value = true;
};
// 全部数据
const totalData = ref(100);
// 当前页
const currentPage = ref(1);
// 每页显示条数
const pageSize = ref(10);
</script>

<style scoped>
.mail-container {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header .tip {
  font-size: small;
  margin-left: 20px;
  color: #999;
}

.filters {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 20px;
}
.detailsTable{
  table-layout: auto !important; /* 确保列宽根据内容调整 */
}
.clickable {
  color: #409eff;
  cursor: pointer;
}

.clickable:hover {
  text-decoration: underline;
}
</style>

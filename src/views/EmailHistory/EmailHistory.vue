<template>
  <div class="mail-container">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <!-- 所有邮件 -->
      <el-tab-pane label="所有邮件" name="delivered">
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
              <el-select style="width: 200px" placeholder="选择任务状态">
                  <el-option label="发送中" :value="1"></el-option>
                  <el-option label="发送暂停" :value="2"></el-option>
                  <el-option label="发送终止" :value="3"></el-option>
                  <el-option label="发送重置" :value="4"></el-option>
                  <el-option label="发送成功" :value="5"></el-option>
                  <el-option label="发送失败" :value="6"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-date-picker
                style="width: 200px"
                v-model="selectedDate"
                type="date"
                placeholder="开始时间"
              />
            </el-form-item>

            <el-form-item>
              <el-date-picker
                style="width: 200px"
                v-model="selectedDate"
                type="date"
                placeholder="结束时间"
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
        <div style="width: 100%;overflow-x: auto">
          <el-table :data="tableData" border style="width: 1000px;margin-bottom: 2em">
            <!-- 主题列 -->
            <el-table-column label="主题" min-width="120px">
              <template #default="{ row }">
                {{ row.subject }}
              </template>
            </el-table-column>

            <!-- 任务类型列 -->
            <el-table-column label="任务类型" min-width="120px">
              <template #default="{ row }">
                {{ row.taskType }}
              </template>
            </el-table-column>

            <!-- 邮件类型列 -->
            <el-table-column label="邮件类型" min-width="120px">
              <template #default="{ row }">
                {{ row.emailType }}
              </template>
            </el-table-column>

            <!-- 发件人列 -->
            <el-table-column label="发件人" min-width="100px">
              <template #default="{ row }">
                {{ row.senders }}
              </template>
            </el-table-column>

            <!-- 状态列 -->
            <el-table-column label="状态" min-width="100px">
              <template #default="{ row }">
                {{ row.allStatus }}
              </template>
            </el-table-column>

            <!-- 开始时间列 -->
            <el-table-column label="开始时间" min-width="200px">
              <template #default="{ row }">
                {{ row.startDate }}
              </template>
            </el-table-column>

            <!-- 结束时间列 -->
            <el-table-column label="结束时间" min-width="200px">
              <template #default="{ row }">
                {{ row.endDate }}
              </template>
            </el-table-column>

            <!-- 详情列 -->
            <el-table-column label="查看详情" min-width="150px">
              <el-button @click="openEmailDetails" type="primary">查看邮件详情</el-button>
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

        <!-- 查看对话框 -->
        <el-dialog title="查看详情" v-model="emailDetailsDialog" width="70%">
          <!-- 搜索框 -->
          <div style="display: flex;flex-flow: row wrap;margin:20px 0 20px 0;gap: 10px">
            <el-input style="width: 200px;" placeholder="请搜索发件人" clearable>
            </el-input>
            <el-input style="width: 200px;" placeholder="请搜索发件人邮箱" clearable>
            </el-input>
            <el-input style="width: 200px;" placeholder="请搜索收件人" clearable>
            </el-input>
            <el-input style="width: 200px;" placeholder="请搜索收件人邮箱" clearable>
            </el-input>
            <el-select style="width: 200px;" placeholder="收件人等级">
              <el-option label="初级"></el-option>
              <el-option label="中级"></el-option>
              <el-option label="高级"></el-option>
            </el-select>
            <el-select style="width: 200px;" placeholder="邮件状态">
              <el-option label="已送达" value="1"></el-option>
              <el-option label="已打开" value="2"></el-option>
              <el-option label="未送达" value="3"></el-option>
              <el-option label="已退信" value="4"></el-option>
              <el-option label="已退订" value="5"></el-option>
            </el-select>
            <el-date-picker style="width: 200px;" v-model="selectedDate" type="date" placeholder="收件人生日"/>
            <el-date-picker style="width: 200px;" v-model="selectedDate" type="date" placeholder="发送日期"/>
            <el-date-picker style="width: 200px;" v-model="selectedDate" type="date" placeholder="送达日期"/>

            <el-button type="primary">搜索</el-button>
            <el-button type="primary">
              <el-icon>
                <Refresh/>
              </el-icon>
            </el-button>
          </div>

          <div style="display: flex;overflow-x: auto">
            <el-table :data="tableData" border style="width: 1200px;margin-bottom: 2em;">
              <!-- 主题列 -->
              <el-table-column label="主题" min-width="100px">
                <template #default="{ row }">
                  {{ row.subject }}
                </template>
              </el-table-column>

              <!-- 邮件类型列 -->
              <el-table-column label="邮件类型" min-width="100px">
                <template #default="{ row }">
                  {{ row.emailType }}
                </template>
              </el-table-column>

              <!-- 发件人列 -->
              <el-table-column label="发件人" min-width="100px">
                <template #default="{ row }">
                  <span>{{ row.senders }}</span>
                </template>
              </el-table-column>
              <el-table-column label="发件人邮箱" min-width="200px">
                <template #default="{ row }">
                  <span>{{ row.sendersEmail }}</span>
                </template>
              </el-table-column>

              <!-- 收件人列 -->
              <el-table-column label="收件人"  min-width="100px">
                <template #default="{ row }">
                  <span>{{ row.receivers }}</span>
                </template>
              </el-table-column>
              <el-table-column label="收件人邮箱"  min-width="200px">
                <template #default="{ row }">
                  <span>{{ row.receiversEmail }}</span>
                </template>
              </el-table-column>
              <el-table-column label="收件人等级"  min-width="100px">
                <template #default="{ row }">
                  <span>{{ row.receiversGrade }}</span>
                </template>
              </el-table-column>
              <el-table-column label="收件人生日"  min-width="200px">
                <template #default="{ row }">
                  <span>{{ row.receiversBirth }}</span>
                </template>
              </el-table-column>

              <!-- 时间列 -->
              <el-table-column label="发送时间" min-width="200px">
                <template #default="{ row }">
                  {{ row.startDate }}
                </template>
              </el-table-column>
              <el-table-column label="结束时间" min-width="200px">
                <template #default="{ row }">
                  {{ row.endDate }}
                </template>
              </el-table-column>

              <!-- 状态列 -->
              <el-table-column label="状态"  min-width="100px">
                <template #default="{ row }">
                  <span>{{ row.status }}</span>
                </template>
              </el-table-column>
              <el-table-column label="未送达详情"  min-width="100px">
                <template #default="{ row }">
                  <span v-if="row.status === '已送达'">无</span>
                  <span v-if="row.status === '未送达'">{{ row.status }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalData"
            layout="prev, pager, next"
            background
          />

        </el-dialog>
      </el-tab-pane>

      <!-- 未送达邮件 -->
      <el-tab-pane label="未送达邮件" name="undelivered">
        <!-- 搜索框 -->
        <div style="display: flex;flex-flow: row wrap;margin:20px 0 20px 0;gap: 10px">
          <el-form style="display: flex;flex-flow: row wrap;gap: 10px;">
            <el-form-item>
              <el-input style="width: 200px" placeholder="请搜索主题名称" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input style="width: 200px" placeholder="请搜索发件人" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input style="width: 200px" placeholder="请搜索发件人邮箱" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input style="width: 200px" placeholder="请搜索收件人" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-input style="width: 200px" placeholder="请搜索收件人邮箱" clearable></el-input>
            </el-form-item>

            <el-form-item>
              <el-select style="width: 200px" placeholder="选择收件人等级">
                <el-option label="初级"></el-option>
                <el-option label="中级"></el-option>
                <el-option label="高级"></el-option>
              </el-select>
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
              <el-select v-model="filterEmailType" style="width: 200px" placeholder="选择邮件类型">
                <el-option label="商品促销" value="商品促销"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-select style="width: 200px" placeholder="选择重发状态">
                <el-option label="未重发" :value="1"></el-option>
                <el-option label="发送中" :value="2"></el-option>
                <el-option label="重发成功" :value="3"></el-option>
                <el-option label="重发失败" :value="4"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-date-picker style="width: 200px" v-model="selectedDate" type="date" placeholder="收件人生日"/>
            </el-form-item>

            <el-form-item>
              <el-date-picker style="width: 200px" v-model="selectedDate" type="date" placeholder="发送时间"/>
            </el-form-item>

            <el-form-item>
              <el-date-picker style="width: 200px" v-model="selectedDate" type="date" placeholder="失败时间"/>
            </el-form-item>

            <el-form-item>
              <el-date-picker style="width: 200px" v-model="selectedDate" type="date" placeholder="重发开始时间"/>
            </el-form-item>

            <el-form-item>
              <el-date-picker style="width: 200px" v-model="selectedDate" type="date" placeholder="重发结束时间"/>
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
        <div style="width: 100%;display: flex;overflow-x: auto">
          <el-table :data="undeliveredTableData" border style="width: 1000px;margin-bottom: 2em">
            <!-- 主题列 -->
            <el-table-column label="主题" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.subject }}
              </template>
            </el-table-column>

            <!-- 任务类型列 -->
            <el-table-column label="任务类型" min-width="200">
              <template #default="{ row }">
                {{ row.taskType }}
              </template>
            </el-table-column>

            <!-- 邮件类型列 -->
            <el-table-column label="邮件类型" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.emailType }}
              </template>
            </el-table-column>

            <!-- 发件人列 -->
            <el-table-column label="发件人" min-width="100px">
              <template #default="{ row }">
                <span>{{ row.senders }}</span>
              </template>
            </el-table-column>
            <el-table-column label="发件人邮箱" min-width="200px" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ row.sendersEmail }}</span>
              </template>
            </el-table-column>

            <!-- 收件人列 -->
            <el-table-column label="收件人"  min-width="100px">
              <template #default="{ row }">
                <span>{{ row.receivers }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收件人邮箱"  min-width="200px" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ row.receiversEmail }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收件人等级"  min-width="100px">
              <template #default="{ row }">
                <span>{{ row.receiversGrade }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收件人生日"  min-width="200px">
              <template #default="{ row }">
                <span>{{ row.receiversBirth }}</span>
              </template>
            </el-table-column>

            <!-- 时间列 -->
            <el-table-column label="发送时间" min-width="200">
              <template #default="{ row }">
                {{ row.startDate }}
              </template>
            </el-table-column>
            <el-table-column label="失败时间" min-width="200">
              <template #default="{ row }">
                {{ row.endDate }}
              </template>
            </el-table-column>

            <!-- 未送达详情列 -->
            <el-table-column label="未送达详情" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.undeliveredDetails }}
              </template>
            </el-table-column>

            <!-- 重发状态列 -->
            <el-table-column label="重发状态" min-width="200">
              <template #default="{ row }">
                {{ row.resendStatus }}
              </template>
            </el-table-column>

            <!-- 重发失败详情列 -->
            <el-table-column label="重发失败详情" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.resendMsg }}
              </template>
            </el-table-column>
            <!-- 重发开始时间列 -->
            <el-table-column label="重发开始时间" min-width="200">
              <template #default="{ row }">
                {{ row.resendStartDate }}
              </template>
            </el-table-column>

            <!-- 重发结束时间列 -->
            <el-table-column label="重发结束时间" min-width="200">
              <template #default="{ row }">
                {{ row.resendEndDate }}
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" align="center" min-width="300">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openStrategyDialog">配置策略</el-button>
                <el-button type="success" size="small">重发</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalData"
          layout="prev, pager, next"
          background
        />

        <!-- 查看详情对话框 -->
        <el-dialog title="查看详情" v-model="detailsDialogVisible" width="40%">
          <el-form label-width="120px">
            <el-form-item label="未送达详情">
              <el-input placeholder="网络延迟过长" type="textarea" rows="3" disabled/>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">关闭</el-button>
          </template>
        </el-dialog>

        <!-- 未送达策略对话框 -->
        <el-dialog title="未送达策略" v-model="strategyDialogVisible" width="40%">
          <el-form label-width="120px">
            <el-form-item label="重发次数">
              <el-input placeholder="请输入重发次数"/>
            </el-form-item>
            <el-form-item label="延迟时间">
              <el-input placeholder="请输入延迟时间（分钟）"/>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="strategyDialogVisible = false">取消</el-button>
            <el-button type="primary">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {ref} from "vue";
// 激活的标签页
const activeTab = ref("delivered");

// 筛选条件
const selectedDate = ref(null);

// 表格数据
const tableData = [
  {subject: "商品促销", taskType:"手动发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", failedDetail:"网络波动", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59"},
  {subject: "商品促销", taskType:"循环发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"未送达", failedDetail:"网络波动", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59"},
  {subject: "商品促销", taskType:"生日发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", failedDetail:"网络波动", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59"},
  {subject: "商品促销", taskType:"节日发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"未送达", failedDetail:"网络波动", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59"},
  {subject: "商品促销", taskType:"手动发送", emailType:"商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", failedDetail:"网络波动", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59"},

];
// 未送达邮件表格数据
const undeliveredTableData = [
  {subject: "商品促销", taskType:"手动发送", emailType: "商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59", resendStartDate: "2023-12-02 10:00:00", resendEndDate: "2023-12-02 10:30:00", undeliveredDetails:"网络波动", resendStatus: "未重发", resendMsg: "网络连接超时"},
  {subject: "商品促销", taskType:"手动发送", emailType: "商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59", resendStartDate: "2023-12-02 11:00:00", resendEndDate: "2023-12-02 11:30:00", undeliveredDetails:"网络波动", resendStatus: "发送中", resendMsg: "网络连接超时..."},
  {subject: "商品促销", taskType:"手动发送", emailType: "商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59", resendStartDate: "2023-12-02 12:00:00", resendEndDate: "2023-12-02 12:30:00", undeliveredDetails:"网络波动", resendStatus: "重发成功", resendMsg: "网络连接超时"},
  {subject: "商品促销", taskType:"手动发送", emailType: "商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59", resendStartDate: "2023-12-02 13:00:00", resendEndDate: "2023-12-02 13:30:00", undeliveredDetails:"网络波动", resendStatus: "重发失败", resendMsg: "网络连接超时"},
  {subject: "商品促销", taskType:"手动发送", emailType: "商品促销", senders: "张三", sendersEmail: "sender@gmail.com", receivers: "赵五", receiversEmail: "receiver@gmail.com", receiversGrade: "高级", receiversBirth: "2023-12-01 00:00:00", allStatus: "发送中", status:"已送达", startDate: "2023-12-01 00:00:00", endDate: "2023-12-01 23:59:59", resendStartDate: "2023-12-02 14:00:00", resendEndDate: "2023-12-02 14:30:00", undeliveredDetails:"网络波动", resendStatus: "未重发", resendMsg: "网络连接超时"},

];

// 对话框控制
const dialogVisible = ref(false);
const emailDetailsDialog = ref(false);
const detailsDialogVisible = ref(false);
// 未送达策略对话框控制
const strategyDialogVisible = ref(false);
// 打开对话框
const openEmailDetails = () => {
  emailDetailsDialog.value = true;
}


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

<template>
  <div class="mail-container">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <!-- 已送达邮件 -->
      <el-tab-pane label="已送达邮件" name="delivered">
        <!-- 查看图表按钮和提示语 -->
        <div class="header">
          <el-button type="primary">查看图表</el-button>
          <span class="tip">请先勾选要查看的邮件。</span>
        </div>

        <!-- 筛选条件 -->
        <div class="filters">
          <el-select v-model="selectedCompany" placeholder="选择公司" style="margin-right: 10px">
            <el-option label="公司A" value="公司A"/>
            <el-option label="公司B" value="公司B"/>
          </el-select>
          <el-select v-model="selectedDepartment" placeholder="选择部门" style="margin-right: 10px">
            <el-option label="部门1" value="部门1"/>
            <el-option label="部门2" value="部门2"/>
          </el-select>
          <el-select v-model="selectedPosition" placeholder="选择岗位">
            <el-option label="岗位A" value="岗位A"/>
            <el-option label="岗位B" value="岗位B"/>
          </el-select>
        </div>

        <!-- 表格 -->
        <el-table :data="tableData" border style="width: 100%;margin-bottom: 2em">
          <!-- 复选框列 -->
          <el-table-column type="selection" width="55"></el-table-column>

          <!-- 主题列 -->
          <el-table-column label="主题" min-width="200">
            <template #header>
              <el-input placeholder="搜索主题" clearable>
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </template>
            <template #default="{ row }">
              {{ row.subject }}
            </template>
          </el-table-column>

          <!-- 发件人列 -->
          <el-table-column label="发件人" min-width="150">
            <template #header>
              <el-input placeholder="搜索发件人" clearable>
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </template>
            <template #default="{ row }">
              <span
                class="clickable"
                @click="openDialog('发件人', row.senders)"
              >
                {{ row.senders[0] }}
              </span>
            </template>
          </el-table-column>

          <!-- 收件人列 -->
          <el-table-column label="收件人" min-width="150">
            <template #header>
              <el-input placeholder="搜索收件人" clearable>
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </template>
            <template #default="{ row }">
              <span
                class="clickable"
                @click="openDialog('收件人', row.receivers)"
              >
                {{ row.receivers[0] }}
              </span>
            </template>
          </el-table-column>

          <!-- 时间列 -->
          <el-table-column label="时间" min-width="180">
            <template #header>
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </template>
            <template #default="{ row }">
              {{ row.date }}
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

        <!-- 查看对话框 -->
        <el-dialog title="查看详情" v-model="dialogVisible" width="40%">
          <el-form label-width="120px">
            <el-form-item v-if="dialogType === '发件人'" label="发件人">
              <el-input :value="dialogData.join(', ')" type="textarea" rows="3" disabled/>
            </el-form-item>
            <el-form-item v-if="dialogType === '收件人'" label="收件人">
              <el-input :value="dialogData.join(', ')" type="textarea" rows="3" disabled/>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">关闭</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 未送达邮件 -->
      <el-tab-pane label="未送达邮件" name="undelivered">
        <!-- 筛选条件 -->
        <div class="filters">
          <el-select v-model="selectedCompany" placeholder="选择公司" style="margin-right: 10px">
            <el-option label="公司A" value="公司A"/>
            <el-option label="公司B" value="公司B"/>
          </el-select>
          <el-select v-model="selectedDepartment" placeholder="选择部门" style="margin-right: 10px">
            <el-option label="部门1" value="部门1"/>
            <el-option label="部门2" value="部门2"/>
          </el-select>
          <el-select v-model="selectedPosition" placeholder="选择岗位">
            <el-option label="岗位A" value="岗位A"/>
            <el-option label="岗位B" value="岗位B"/>
          </el-select>
        </div>

        <!-- 表格 -->
        <el-table :data="undeliveredTableData" border style="width: 100%;margin-bottom: 2em">
          <!-- 主题列 -->
          <el-table-column label="主题" min-width="200">
            <template #header>
              <el-input placeholder="搜索主题" clearable>
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </template>
            <template #default="{ row }">
              {{ row.subject }}
            </template>
          </el-table-column>

          <!-- 发件人列 -->
          <el-table-column label="发件人" min-width="150">
            <template #header>
              <el-input placeholder="搜索发件人" clearable>
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </template>
            <template #default="{ row }">
              <span
                class="clickable"
                @click="openDialog('发件人', row.senders)"
              >
                {{ row.senders[0] }}
              </span>
            </template>
          </el-table-column>

          <!-- 收件人列 -->
          <el-table-column label="收件人" min-width="150">
            <template #header>
              <el-input placeholder="搜索收件人" clearable>
                <template #append>
                  <el-button>
                    <el-icon>
                      <Search></Search>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </template>
            <template #default="{ row }">
              <span
                class="clickable"
                @click="openDialog('收件人', row.receivers)"
              >
                {{ row.receivers[0] }}
              </span>
            </template>
          </el-table-column>

          <!-- 时间列 -->
          <el-table-column label="时间" min-width="180">
            <template #header>
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </template>
            <template #default="{ row }">
              {{ row.date }}
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" align="center" min-width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="openStrategyDialog">配置策略</el-button>
              <el-button type="success" size="small">重发</el-button>
              <el-button type="danger" size="small">删除</el-button>
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

        <!-- 查看对话框 -->
        <el-dialog title="查看详情" v-model="dialogVisible" width="40%">
          <el-form label-width="120px">
            <el-form-item v-if="dialogType === '发件人'" label="发件人">
              <el-input :value="dialogData.join(', ')" type="textarea" rows="3" disabled/>
            </el-form-item>
            <el-form-item v-if="dialogType === '收件人'" label="收件人">
              <el-input :value="dialogData.join(', ')" type="textarea" rows="3" disabled/>
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
import {Search} from "@element-plus/icons-vue";

// 激活的标签页
const activeTab = ref("delivered");

// 筛选条件
const selectedCompany = ref(null);
const selectedDepartment = ref(null);
const selectedPosition = ref(null);
const selectedDate = ref(null);

// 表格数据
const tableData = [
  {
    subject: "邮件1",
    senders: ["张三", "李四"],
    receivers: ["赵五", "王六"],
    date: "2023-12-01",
  },
  {
    subject: "邮件2",
    senders: ["陈七", "何八"],
    receivers: ["孙九", "周十"],
    date: "2023-12-02",
  },
];
// 未送达邮件表格数据
const undeliveredTableData = [
  {
    subject: "未送达邮件1",
    senders: ["张三", "李四"],
    receivers: ["赵五", "王六"],
    date: "2023-12-01",
  },
  {
    subject: "未送达邮件2",
    senders: ["陈七", "何八"],
    receivers: ["孙九", "周十"],
    date: "2023-12-02",
  },
];

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref(""); // "发件人" 或 "收件人"
const dialogData = ref([]); // 当前点击的发件人或收件人
// 未送达策略对话框控制
const strategyDialogVisible = ref(false);
// 打开对话框
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
  gap: 10px;
  margin-bottom: 20px;
}

.clickable {
  color: #409eff;
  cursor: pointer;
}

.clickable:hover {
  text-decoration: underline;
}
</style>

<template>
  <div class="AutoEmail">
    <div class="AutoEmailContainer">
      <el-tabs>
        <el-tab-pane label="循环发送">
          <el-table :data="tableData" border style="width: 100%">
            <!-- 主题列 -->
            <el-table-column label="主题" align="left" min-width="300">
              <template #default="{ row }">
                <span>{{ row.subject }}</span>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" align="center" min-width="100">
              <template #default="{ row }">
                <el-button
                  :type="row.paused ? 'success' : 'warning'"
                  size="small"
                  @click="confirmToggleState(row)"
                >
                  {{ row.paused ? "开始" : "暂停" }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="confirmDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="生日发送">
          <el-table :data="tableData" border style="width: 100%">
            <!-- 主题列 -->
            <el-table-column label="主题" align="left" min-width="300">
              <template #default="{ row }">
                <span>{{ row.subject }}</span>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" align="center" min-width="100">
              <template #default="{ row }">
                <el-button
                  :type="row.paused ? 'success' : 'warning'"
                  size="small"
                  @click="confirmToggleState(row)"
                >
                  {{ row.paused ? "开始" : "暂停" }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="confirmDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="节日发送">
          <el-table :data="tableData" border style="width: 100%">
            <!-- 主题列 -->
            <el-table-column label="主题" align="left" min-width="300">
              <template #default="{ row }">
                <span>{{ row.subject }}</span>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" align="center" min-width="100">
              <template #default="{ row }">
                <el-button
                  :type="row.paused ? 'success' : 'warning'"
                  size="small"
                  @click="confirmToggleState(row)"
                >
                  {{ row.paused ? "开始" : "暂停" }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="confirmDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";

// 表格数据
const tableData = ref([
  { id: 1, subject: "邮件群发", paused: false }, // 初始状态为未暂停
  { id: 2, subject: "促销活动", paused: false }, // 初始状态为暂停
  { id: 3, subject: "促销活动", paused: false }, // 初始状态为暂停
  { id: 4, subject: "促销活动", paused: false }, // 初始状态为暂停
  { id: 5, subject: "促销活动", paused: false }, // 初始状态为暂停
  { id: 7, subject: "促销活动", paused: true }, // 初始状态为暂停
  { id: 8, subject: "促销活动", paused: true }, // 初始状态为暂停
  { id: 9, subject: "促销活动", paused: true }, // 初始状态为暂停
]);

// 删除操作
const confirmDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除主题为 "${row.subject}" 的数据吗？`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      const index = tableData.value.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        tableData.value.splice(index, 1);
        ElMessage.success("删除成功！");
      }
    })
    .catch(() => {
      ElMessage.info("取消删除");
    });
};

// 确认状态切换操作
const confirmToggleState = (row) => {
  const action = row.paused ? "开始" : "暂停";
  ElMessageBox.confirm(
    `确定要${action}该任务 "${row.subject}" 吗？`,
    `${action}确认`,
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: row.paused ? "success" : "warning",
    }
  )
    .then(() => {
      row.paused = !row.paused; // 切换状态
      ElMessage.success(`${action}成功：${row.subject}`);
    })
    .catch(() => {
      ElMessage.info(`取消${action}`);
    });
};
</script>

<style scoped>
.AutoEmail {
  height: 100%;
}

.AutoEmailContainer {
  margin-left: 1em;
  font-size: 15px;
}
</style>

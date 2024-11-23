<template>
  <div class="fileManage">
    <div class="fileManageContainer">

      <div class="fileList">
        <el-tabs class="fileListTabs">
          <el-tab-pane label="私海文件">
            <el-table :data="tableData" border style="width: 100%">
              <!-- 附件名称列 -->
              <el-table-column label="附件名称" align="left" min-width="500">
                <template #default="{ row }">
                  <span>{{ row.subject }}</span>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="100">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="small"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="公海文件">
            <el-table :data="tableData" border style="width: 100%">
              <!-- 附件名称列 -->
              <el-table-column label="附件名称" align="left" min-width="500">
                <template #default="{ row }">
                  <span>{{ row.subject }}</span>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="100">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="small"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalData"
          layout="prev, pager, next"
          background
        />
      </div>


      <div class="uploadButtonContainer">
        <el-button type="primary">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle">私海上传</span>
        </el-button>

        <el-button type="primary">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle">公海上传</span>
        </el-button>
      </div>

    </div>
  </div>
</template>


<script setup>

import {CirclePlus} from "@element-plus/icons-vue";
import {ref} from "vue";
// 表格数据
const tableData = ref([
  { id: 1, subject: "附件1xxxxx" }, // 初始状态为未暂停
  { id: 2, subject: "附件1xxxxx" }, // 初始状态为暂停
  { id: 3, subject: "附件1xxxxx" }, // 初始状态为暂停
  { id: 4, subject: "附件1xxxxx" }, // 初始状态为暂停
  { id: 5, subject: "附件1xxxxx" }, // 初始状态为暂停
  { id: 7, subject: "附件1xxxxx" }, // 初始状态为暂停
  { id: 8, subject: "附件1xxxxx" }, // 初始状态为暂停
  { id: 9, subject: "附件1xxxxx" }, // 初始状态为暂停
]);

// 全部数据
const totalData = ref(100);

// 当前页
const currentPage = ref(1);
// 每页显示条数
const pageSize = ref(10);

</script>


<style scoped>
.fileManage {
  display: flex;
  flex: 1;
}

.fileManageContainer {
  display: flex;
  flex-direction: row;
}
.fileList{
  display: flex;
  flex-direction: column;
  margin-right: 2em;
}
.fileListTabs{
  margin-bottom: 0.2em;
}
</style>

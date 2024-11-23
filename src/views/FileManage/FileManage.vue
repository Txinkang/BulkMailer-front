<script setup>

import {CirclePlus} from "@element-plus/icons-vue";
</script>

<template>
  <div class="fileManage">
    <div class="fileManageContainer">

      <div class="fileList">
        <el-tabs>
          <el-tab-pane label="私海文件">
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
                    type="danger"
                    size="small"
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
        </el-tabs>
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

<style scoped>
.fileManage{
  display: flex;
  flex: 1;
}
.fileManageContainer{
  display: flex;
  flex-direction: row;
  justify-content: space-around;

}
</style>

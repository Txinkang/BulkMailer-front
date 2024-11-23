<template>
  <div class="fileManage">
    <div class="fileManageContainer">

      <div>
        <el-tabs class="fileListTabs">
          <el-tab-pane label="查看公司">
            <el-table class="companyTable" :data="tableData" border style="width: 100%">
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

            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalData"
              layout="prev, pager, next"
              background
            />
          </el-tab-pane>

          <el-tab-pane label="创建公司">
            <el-form label-width="100px">
              <!-- 公司名称 -->
              <el-form-item label="公司名称：">
                <el-input placeholder="请输入公司名称"></el-input>
              </el-form-item>

              <!-- 部门名称 -->
              <el-form-item label="部门名称：">
                <el-input placeholder="请输入部门名称"></el-input>
              </el-form-item>

              <!-- 用户名称 -->
              <el-form-item label="用户名称：">
                <el-input placeholder="请输入用户名称"></el-input>
              </el-form-item>

              <!-- 按钮组 -->
              <el-form-item>
                <el-button type="default">取消</el-button>
                <el-button type="primary">确定</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
// 表格数据
const tableData = ref([
  { id: 1, subject: "公司名称：xxxxx" },
  { id: 2, subject: "公司名称：xxxxx" },
  { id: 3, subject: "公司名称：xxxxx" },
  { id: 4, subject: "公司名称：xxxxx" },
  { id: 5, subject: "公司名称：xxxxx" },
  { id: 7, subject: "公司名称：xxxxx" },
  { id: 8, subject: "公司名称：xxxxx" },
  { id: 9, subject: "公司名称：xxxxx" },
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

.companyTable{
  margin-bottom: 2em;
}

.form-container {
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>

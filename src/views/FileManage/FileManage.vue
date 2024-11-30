<template>
  <div class="fileManage">
    <div class="fileManageContainer">
      <el-tabs class="fileListTabs">
        <el-tab-pane label="附件管理">
          <el-tabs type="border-card" class="fileListTabs">
            <el-tab-pane label="私海附件">
              <!-- 上传按钮 -->
              <div style="display:flex;align-items: center;height: 1em">
                <!-- 主按钮 -->
                <el-button type="primary" @click="privateFileUploadDialog">
                  <el-icon>
                    <CirclePlus />
                  </el-icon>
                  <span style="vertical-align: middle">私海上传</span>
                </el-button>

                <!-- 对话框 -->
                <el-dialog title="上传文件" v-model="privateFileDialogVisible" width="50%">
                  <el-form>
                    <!-- 可见范围单选按钮组 -->
                    <el-form-item label="可见范围：">
                      <el-radio-group v-model="uploadRange">
                        <el-radio value="公司">公司</el-radio>
                        <el-radio value="部门">部门</el-radio>
                        <el-radio value="岗位">岗位</el-radio>
                        <el-radio value="仅自己">仅自己</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <!-- 可见范围选项组 -->
                    <el-form-item style="width: 300px">
                      <el-select v-if="uploadRange !== '仅自己'" placeholder="公司">
                        <el-option value="公司"></el-option>
                      </el-select>
                      <el-select v-if="uploadRange === '部门' || uploadRange ==='岗位' " placeholder="部门">
                        <el-option value="部门"></el-option>
                      </el-select>
                      <el-select v-if="uploadRange === '岗位' " placeholder="岗位">
                        <el-option value="岗位"></el-option>
                      </el-select>
                    </el-form-item>

                    <!-- 文件选择按钮 -->
                    <el-form-item>
                      <el-upload
                        multiple
                        action="#"
                        list-type="text"
                        :show-file-list="false"
                      >
                        <el-button type="primary">选择文件</el-button>
                      </el-upload>
                    </el-form-item>

                    <!-- 文件列表 -->
                    <div v-for="(file, index) in files" :key="index" class="file-item">
                      <span>{{ file.name }}</span>
                      <el-button type="danger" size="small">删除</el-button>
                    </div>
                  </el-form>

                  <!-- 对话框底部按钮 -->
                  <template #footer>
                    <el-button @click="closeDialog">取消</el-button>
                    <el-button type="primary">上传</el-button>
                  </template>
                </el-dialog>
              </div>
              <!-- 搜索框 -->
              <div style="display: flex;flex-direction: row;align-items: center;height: 1em">
                <!-- 两个下拉菜单 -->
                <el-form inline>
                  <!-- 所属公司 -->
                  <el-form-item label="所属公司">
                    <el-select v-model="selectedCompany" placeholder="请选择公司">
                      <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
                    </el-select>
                  </el-form-item>

                  <!-- 所属部门 -->
                  <el-form-item label="所属部门">
                    <el-select v-model="selectedDepartment" placeholder="请选择部门">
                      <el-option
                        v-for="department in departments"
                        :key="department"
                        :label="department"
                        :value="department"
                      />
                    </el-select>
                  </el-form-item>
                  <!-- 所属部门 -->
                  <el-form-item label="所属岗位">
                    <el-select v-model="selectedDepartment" placeholder="请选择部门">
                      <el-option
                        v-for="department in departments"
                        :key="department"
                        :label="department"
                        :value="department"
                      />
                    </el-select>
                  </el-form-item>
                </el-form>
                <el-input style="width: 200px;margin-right: 20px" placeholder="请搜索附件名称" clearable>
                  <el-icon>
                    <Search/>
                  </el-icon>
                </el-input>
                <el-button type="primary">搜索</el-button>
                <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
              </div>

              <el-table :data="tableData" border style="width: 100%">
                <!-- 附件名称列 -->
                <el-table-column label="附件名称" align="left" min-width="700">
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
            <el-tab-pane label="公海附件">
              <!-- 上传按钮 -->
              <el-upload
                style="display: flex;flex-direction:row;align-items: center;height: 1em"
                multiple
                action="#"
                list-type="text"
                :show-file-list="false"
              >
                <el-button type="primary">
                  <el-icon>
                    <CirclePlus />
                  </el-icon>
                  <span style="vertical-align: middle">公海上传</span>
                </el-button>
              </el-upload>

              <!-- 搜索框 -->
              <div style="display: flex;flex-direction: row">
                <el-input style="width: 200px;margin-bottom: 20px;margin-right: 20px" placeholder="请搜索附件名称" clearable>
                  <el-icon>
                    <Search/>
                  </el-icon>
                </el-input>
                <el-button type="primary">搜索</el-button>
                <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
              </div>

              <el-table :data="tableData" border style="width: 100%">
                <!-- 附件名称列 -->
                <el-table-column label="附件名称" align="left" min-width="700">
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
        </el-tab-pane>
        <el-tab-pane label="图片管理">
          <el-tabs type="border-card" class="fileListTabs">
            <el-tab-pane label="私海图片">
              <!-- 上传按钮 -->
              <div style="display:flex;align-items: center;height: 1em">
                <!-- 主按钮 -->
                <el-button type="primary" @click="privateFileUploadDialog">
                  <el-icon>
                    <CirclePlus />
                  </el-icon>
                  <span style="vertical-align: middle">私海上传</span>
                </el-button>

                <!-- 对话框 -->
                <el-dialog title="上传文件" v-model="privateFileDialogVisible" width="50%">
                  <el-form>
                    <!-- 可见范围单选按钮组 -->
                    <el-form-item label="可见范围：">
                      <el-radio-group v-model="uploadRange">
                        <el-radio label="公司">公司</el-radio>
                        <el-radio label="部门">部门</el-radio>
                        <el-radio label="岗位">岗位</el-radio>
                        <el-radio label="仅自己">仅自己</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <!-- 可见范围选项组 -->
                    <el-form-item style="width: 300px">
                      <el-select v-if="uploadRange !== '仅自己'" placeholder="公司">
                        <el-option value="公司"></el-option>
                      </el-select>
                      <el-select v-if="uploadRange === '部门' || uploadRange ==='岗位' " placeholder="部门">
                        <el-option value="部门"></el-option>
                      </el-select>
                      <el-select v-if="uploadRange === '岗位' " placeholder="岗位">
                        <el-option value="岗位"></el-option>
                      </el-select>
                    </el-form-item>
                    <!-- 文件选择按钮 -->
                    <el-form-item>
                      <el-upload
                        multiple
                        action="#"
                        list-type="text"
                        :show-file-list="false"
                      >
                        <el-button type="primary">选择文件</el-button>
                      </el-upload>
                    </el-form-item>

                    <!-- 文件列表 -->
                    <div v-for="(file, index) in files" :key="index" class="file-item">
                      <span>{{ file.name }}</span>
                      <el-button type="danger" size="small">删除</el-button>
                    </div>
                  </el-form>

                  <!-- 对话框底部按钮 -->
                  <template #footer>
                    <el-button @click="closeDialog">取消</el-button>
                    <el-button type="primary">上传</el-button>
                  </template>
                </el-dialog>
              </div>
              <!-- 搜索框 -->
              <div style="display: flex;flex-direction: row;align-items: center">
                <!-- 两个下拉菜单 -->
                <el-form inline>
                  <!-- 所属公司 -->
                  <el-form-item label="所属公司">
                    <el-select v-model="selectedCompany" placeholder="请选择公司">
                      <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
                    </el-select>
                  </el-form-item>

                  <!-- 所属部门 -->
                  <el-form-item label="所属部门">
                    <el-select v-model="selectedDepartment" placeholder="请选择部门">
                      <el-option
                        v-for="department in departments"
                        :key="department"
                        :label="department"
                        :value="department"
                      />
                    </el-select>
                  </el-form-item>
                  <!-- 所属部门 -->
                  <el-form-item label="所属岗位">
                    <el-select v-model="selectedDepartment" placeholder="请选择部门">
                      <el-option
                        v-for="department in departments"
                        :key="department"
                        :label="department"
                        :value="department"
                      />
                    </el-select>
                  </el-form-item>
                </el-form>
                <el-input style="width: 200px;margin-right: 20px" placeholder="请搜索图片名称" clearable>
                  <el-icon>
                    <Search/>
                  </el-icon>
                </el-input>
                <el-button type="primary">搜索</el-button>
                <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
              </div>

              <el-table :data="tableData" border style="width: 100%">
                <!-- 图片名称列 -->
                <el-table-column label="图片名称" align="left" min-width="700">
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
            <el-tab-pane label="公海图片">
              <!-- 上传按钮 -->
              <el-upload
                style="display: flex;flex-direction:row;align-items: center;height: 1em"
                multiple
                action="#"
                list-type="text"
                :show-file-list="false"
              >
                <el-button type="primary">
                  <el-icon>
                    <CirclePlus />
                  </el-icon>
                  <span style="vertical-align: middle">公海上传</span>
                </el-button>
              </el-upload>
              <!-- 搜索框 -->
              <div style="display: flex;flex-direction: row">
                <el-input style="width: 200px;margin-bottom: 20px;margin-right: 20px" placeholder="请搜索图片名称" clearable>
                  <el-icon>
                    <Search/>
                  </el-icon>
                </el-input>
                <el-button type="primary">搜索</el-button>
                <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
              </div>

              <el-table :data="tableData" border style="width: 100%">
                <!-- 图片名称列 -->
                <el-table-column label="图片名称" align="left" min-width="700">
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
        </el-tab-pane>
      </el-tabs>

    </div>
  </div>
</template>


<script setup>
import {ref} from "vue";
// 对话框可见性
const privateFileDialogVisible = ref(false);
const uploadRange = ref("公司")
// 文件列表
const files = [
  { name: "文件1.pdf" },
  { name: "文件2.docx" },
  { name: "文件3.xlsx" },
];

// 打开对话框
const privateFileUploadDialog = () => {
  privateFileDialogVisible.value = true;
};

// 关闭对话框
const closeDialog = () => {
  privateFileDialogVisible.value = false;
};
// 表格数据
const tableData = ref([
  { id: 1, subject: "文件xxxxx" }, // 初始状态为未暂停
  { id: 2, subject: "文件xxxxx" }, // 初始状态为暂停
  { id: 3, subject: "文件xxxxx" }, // 初始状态为暂停
  { id: 4, subject: "文件xxxxx" }, // 初始状态为暂停
  { id: 5, subject: "文件xxxxx" }, // 初始状态为暂停
  { id: 7, subject: "文件xxxxx" }, // 初始状态为暂停
  { id: 8, subject: "文件xxxxx" }, // 初始状态为暂停
  { id: 9, subject: "文件xxxxx" }, // 初始状态为暂停
]);

// 全部数据
const totalData = ref(100);
// 当前页
const currentPage = ref(1);
// 每页显示条数
const pageSize = ref(10);

</script>


<style scoped>
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.fileManage {
  display: flex;
  flex: 1;
}

.fileManageContainer {
  display: flex;
  flex-direction: row;
}
.fileListTabs{
  margin-bottom: 0.2em;
}
</style>

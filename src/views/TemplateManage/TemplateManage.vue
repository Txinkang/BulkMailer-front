<template>
  <div class="commodityManage">
    <div class="commodityManageContainer">
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

            <!-- 删除操作列 -->
            <el-table-column label="操作" align="center" min-width="100">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="checkTemplate">查看</el-button>
<!--
                <el-button type="primary" size="small" @click="useTemplate">使用</el-button>
-->
                <el-button type="warning" size="small" @click="openUpdateDialog">修改</el-button>
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

          <!-- 保存模板按钮 -->
          <div class="saveTemplate">
            <el-button type="primary" @click="openDialog">
              保存模板
            </el-button>
          </div>

          <!-- 选择附件按钮 -->
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
              v-model="appendixDialogVisible"
              width="50%"
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
                    <el-checkbox-group style="margin-bottom: 15px">
                      <el-checkbox>
                        xxx
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

          <div class="templateName">
            <el-input placeholder="模板名称" />
          </div>

          <EditToolbar :data="checked"></EditToolbar>


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

            <!-- 删除操作列 -->
            <el-table-column label="操作" align="center" min-width="100">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="checkTemplate">查看</el-button>
<!--
                <el-button type="primary" size="small" @click="useTemplate">使用</el-button>
-->
                <el-button type="warning" size="small" @click="openUpdateDialog">修改</el-button>
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

          <!-- 保存模板按钮 -->
          <div class="saveTemplate">
            <el-button type="primary" @click="openDialog">
              保存模板
            </el-button>
          </div>

          <div class="templateName">
            <el-input placeholder="模板名称" />
          </div>

          <div class="editToolbar">
            <EditToolbar :data="checked"></EditToolbar>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 修改模板对话框 -->
      <el-dialog title="修改模板" v-model="updateDialogVisible" width="40%">
        <span>
          修改模板会刷新当前编辑区域，请提前保存当前编辑区
        </span>
        <template #footer>
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary">确定修改</el-button>
        </template>
      </el-dialog>

      <!-- 创建模板对话框 -->
      <el-dialog title="创建模板" v-model="createDialogVisible" width="40%">
        <span>
          创建模板会刷新当前编辑区域，请提前保存当前编辑区
        </span>
        <template #footer>
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary">确定创建</el-button>
        </template>
      </el-dialog>

      <!-- 保存模板的对话框 -->
      <el-dialog
        title="保存模板"
        v-model="dialogVisible"
        width="500"
      >
        <div>
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
          <!-- 模板名称 -->
          <el-form-item label="模板名称：">
            <el-input v-model="templateName" placeholder="模板名称" />
          </el-form-item>
        </div>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </template>
      </el-dialog>

    </div>
  </div>
</template>


<script setup>
// 下拉菜单数据
import {ref} from "vue";
import {Search} from "@element-plus/icons-vue";
import EditToolbar from "@/components/EditToolbar.vue";
import router from "@/router/index.js";
//上传范围
const uploadRange = ref("公司")

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalData = ref(30);
// 表格的静态数据
const tableData = [
  {commodity: "模板1"},
  {commodity: "模板2" },
  {commodity: "模板3" },
  {commodity: "模板4" },
];
//查看模板
const checked = ref("1");
//对话框
const updateDialogVisible = ref(false);
const createDialogVisible = ref(false);
const appendixDialogVisible =ref(false);

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true;
};
const openCategoryDialog = () => {
  categoryDialogVisible.value = true;
};
const openUpdateDialog = () => {
  updateDialogVisible.value = true;
};
const openCreateDialog = () => {
  createDialogVisible.value = true;
};
// 打开对话框
const appendixOpenDialog = () => {
  appendixDialogVisible.value = true;
};
// 创建模板对话框的状态
const dialogVisible = ref(false);
const categoryDialogVisible = ref(false);
//查看模板
const checkTemplate = () => {
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
//使用对话框
const useTemplate = () => {
  router.push("/sendEmail")
}

</script>


<style scoped>
.commodityManage{
  font-size: 15px;
}
.search-box{
  margin-right: 20px;
}
.saveTemplate{
  height: 80px;
  display: flex;
  align-items: center;
}
.templateName{
  height: 50px;
  display: flex;
  align-items: center;
}
</style>

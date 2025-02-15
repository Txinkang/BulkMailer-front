<script setup>

</script>

<template>
  <template>
    <div class="supplier-container">
      <!-- 顶部按钮 -->
      <div class="button-group">
        <!-- 头部 -->
        <el-form label-width="120px" inline>
          <!-- 搜索框 -->
          <el-form-item>
            <el-input
              v-model="searchText"
              placeholder="请搜索客户名称"
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

          <!-- 所属品类 -->
          <el-form-item label="所属品类">
            <el-select v-model="category" placeholder="请选择品类">
              <el-option
                v-for="department in category"
                :key="department"
                :label="department"
                :value="department"
              />
            </el-select>
          </el-form-item>

          <!-- 刷新  -->
          <el-form-item>
            <el-button type="primary"><el-icon><Refresh /></el-icon></el-button>
          </el-form-item>

          <!-- 导入  -->
          <el-form-item>
            <el-button type="primary">导入</el-button>
          </el-form-item>

          <!-- 新建客户  -->
          <el-form-item>
            <el-button type="primary" @click="supplierOpenDialog">新建客户</el-button>
          </el-form-item>

        </el-form>
      </div>

      <!-- 表格 -->
      <el-table :data="supplierData" border style="width: 100%;margin-bottom: 20px">
        <!-- 客户名称 -->
        <el-table-column label="客户名称" align="left" min-width="200">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>

        <!-- 查看按钮 -->
        <el-table-column label="操作" align="center" min-width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openViewDialog">查看</el-button>
          </template>
        </el-table-column>

        <!-- 删除按钮 -->
        <el-table-column label="操作" align="center" min-width="100">
          <template #default="{ row }">
            <el-button type="danger" size="small" >删除</el-button>
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

      <!-- 新建客户 -->
      <el-dialog title="新建客户" v-model="supplierDialogVisible" width="50%">
        <el-form label-width="120px">
          <!-- 客户名称 -->
          <el-form-item label="客户名称">
            <el-input placeholder="请输入客户名称" />
          </el-form-item>

          <!-- 国家名称输入框 -->
          <el-form-item label="国家名称">
            <el-select  placeholder="请选择国家">
              <el-option value="国家" />
              <el-option value="国家" />
            </el-select>
          </el-form-item>

          <!-- 区域名称输入框 -->
          <el-form-item label="区域名称">
            <el-select  placeholder="请选择区域">
              <el-option value="区域" />
              <el-option value="区域" />
            </el-select>
          </el-form-item>

          <!-- 联系方式 -->
          <el-form-item label="联系方式">
            <el-input placeholder="请输入联系方式" />
          </el-form-item>

          <!-- 商品选择 -->
          <el-form-item label="选择商品">
            <div v-for="(item, index) in items" :key="index" class="item-row">
              <el-select placeholder="选择品类" class="select-category">
                <el-option label="品类A" value="A" />
                <el-option label="品类B" value="B" />
                <el-option label="品类C" value="C" />
              </el-select>
              <el-select placeholder="选择商品" class="select-product">
                <el-option label="商品1" value="1" />
                <el-option label="商品2" value="2" />
                <el-option label="商品3" value="3" />
              </el-select>
            </div>
            <el-button type="primary" plain @click="addItem">
              <el-icon>
                <Plus>

                </Plus>
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部按钮 -->
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary">确定</el-button>
        </template>
      </el-dialog>

      <!-- 查看客户对话框 -->
      <el-dialog title="查看客户" v-model="viewDialogVisible" width="40%">
        <el-form label-width="120px">
          <el-form-item label="客户名称">
            <el-input placeholder="客户名称" disabled />
          </el-form-item>
          <el-form-item label="联系方式">
            <el-input placeholder="联系方式" disabled />
          </el-form-item>
          <el-form-item label="地址">
            <el-input placeholder="地址" disabled />
          </el-form-item>
        </el-form>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="viewDialogVisible = false">取消</el-button>
          <el-button type="primary">修改</el-button>
        </template>
      </el-dialog>
    </div>
  </template>

  <script setup>
    // 响应式状态
    import { ref } from "vue";
    import {Plus, Search} from "@element-plus/icons-vue";

    // 分页
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalData = ref(30);
    // 对话框控制
    const supplierDialogVisible = ref(false);

    // 动态商品选择项
    const items = ref([{ category: "", product: "" }]);

    // 打开对话框
    const supplierOpenDialog = () => {
      supplierDialogVisible.value = true;
    };

    // 添加商品选择项
    const addItem = () => {
      items.value.push({ category: "", product: "" });
    };
    // 客户数据
    const supplierData = [
      { name: "客户A" },
      { name: "客户B" },
      { name: "客户C" },
      { name: "客户D" },
    ];

    // 对话框可见性
    const createDialogVisible = ref(false);
    const viewDialogVisible = ref(false);

    // 打开新建客户对话框
    const openCreateDialog = () => {
      createDialogVisible.value = true;
    };

    // 打开查看客户对话框
    const openViewDialog = () => {
      viewDialogVisible.value = true;
    };
  </script>

  <style scoped>
    .supplier-container {
      margin: 20px;
    }

    .button-group {
      margin-bottom: 20px;
    }
  </style>

</template>

<style scoped>

</style>

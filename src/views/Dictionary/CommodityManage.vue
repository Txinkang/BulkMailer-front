<template>
  <div class="commodityManage">
    <div class="commodityManageContainer">
      <el-tabs class="commodityManageTabs">
        <el-tab-pane label="商品管理">
          <!-- 顶部按钮 -->
          <div class="commodity-button-group">
            <el-button type="primary" @click="openCreateCommodityDialog">创建商品</el-button>
            <el-upload
              action="#"
              :auto-upload="false"
              @change="importCommodity"
              :show-file-list="false"
              accept=".csv"
              class="upload-center"
            >
              <div class="upload-button">
                <el-button>导入</el-button>
              </div>
            </el-upload>
          </div>
          <!-- 搜索框 -->
          <div>
            <el-form :inline="true">
              <el-form-item>
                <el-input
                  v-model="searchCommodityForm.commodity_name"
                  placeholder="请搜索商品名称"
                  clearable
                  class="search-box"
                  style="width:200px"
                />
              </el-form-item>

              <el-form-item>
                <el-select
                  style="width:200px"
                  placeholder="请搜索商品品类"
                  v-model="searchCommodityForm.category_id"
                  filterable
                  remote
                  :remote-method="debouncedSearchCategory"
                  clearable
                >
                  <el-option
                    v-for="category in searchCommodityForm.category"
                    :key="category"
                    :label="category.category_name"
                    :value="category.category_id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSearchCommodityClick">搜索</el-button>
                <el-button type="primary" @click="resetCommoditySearch"><el-icon><Refresh /></el-icon></el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 数据 -->
          <div>
            <el-table :data="commodityCurrentPageData" border style="width: 100%;margin-bottom: 20px">
              <!-- 商品名称列 -->
              <el-table-column label="商品名称" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.commodity_name }}</span>
                </template>
              </el-table-column>

              <!-- 品类名称列 -->
              <el-table-column label="品类名称" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.category_name }}</span>
                </template>
              </el-table-column>

              <!-- 删除操作列 -->
              <el-table-column label="操作" align="center" min-width="100">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="openUpdateCommodityDialog(row)">修改</el-button>
                  <el-button type="danger" size="small" @click="deleteCommodity(row)">删除</el-button>
                </template>
                </el-table-column>
              </el-table>
          </div>

          <!-- 分页 -->
          <div>
            <SmartPagination
            v-model:current-page="commodityPagination.currentPage"
            :server-page-size="commodityPagination.serverPageSize"
            :display-page-size="commodityPagination.displayPageSize"
            :total="commodityPagination.totalItems"
            @load-data="handleCommodityLoadData" />
          </div>

        </el-tab-pane>

        <el-tab-pane label="品类管理">
          <!-- 顶部按钮 -->
          <div class="category-button-group">
            <el-button type="primary" @click="openCreateCategoryDialog">创建品类</el-button>
            <el-upload
              action="#"
              :auto-upload="false"
              @change="importCategory"
              :show-file-list="false"
              accept=".csv"
              class="upload-center"
            >
              <div class="upload-button">
                <el-button>导入</el-button>
              </div>
            </el-upload>
          </div>

          <!-- 搜索框 -->
          <div style="display: flex;flex-flow: row wrap;margin-bottom: 20px">
            <el-input
              v-model="searchCategoryName"
              placeholder="请搜索品类名称"
              clearable
              class="search-box"
              style="width:200px;margin-right: 10px"
            >
            </el-input>

            <el-button type="primary" @click="handleSearchCategoryClick">搜索</el-button>
            <el-button type="primary" @click="resetCategorySearch"><el-icon><Refresh /></el-icon></el-button>
          </div>

          <!-- 数据 -->
          <div>
            <el-table :data="categoryCurrentPageData" border style="width: 80%">
              <!-- 品类名称列 -->
              <el-table-column label="品类名称" align="left" min-width="500">
                <template #default="{ row }">
                  <span>{{ row.category_name }}</span>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="150">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="openUpdateCategoryDialog(row)">修改名称</el-button>
                  <el-button type="danger" size="small" @click="deleteCategory(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div>
            <SmartPagination
            v-model:current-page="categoryPagination.currentPage"
            :server-page-size="categoryPagination.serverPageSize"
            :display-page-size="categoryPagination.displayPageSize"
            :total="categoryPagination.totalItems"
            @load-data="handleCategoryLoadData" />
          </div>
        </el-tab-pane>
      </el-tabs>


      <!-- 创建商品对话框 -->
      <el-dialog
        title="创建商品"
        v-model="commodityDialogVisible"
        width="40%"
        @close="closeCreateCommodityDialog"
      >
        <el-form label-width="120px">
          <!-- 商品名称输入框 -->
          <el-form-item label="商品名称">
            <el-input v-model="createCommodityForm.commodity_name" placeholder="请输入商品名称" />
          </el-form-item>

          <!-- 品类名称输入框 -->
          <el-form-item label="品类名称">
            <el-select v-model="createCommodityForm.category_id"
            placeholder="请选择品类"
            filterable
            remote
            :remote-method="debouncedCreateSearchCategory"
            clearable>

              <el-option
              v-for="category in createCommodityForm.category"
              :key="category"
              :label="category.category_name"
              :value="category.category_id" />

            </el-select>
          </el-form-item>
        </el-form>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="closeCreateCommodityDialog">取消</el-button>
          <el-button type="primary" @click="createCommodity">确定</el-button>
        </template>
      </el-dialog>

      <!-- 修改商品对话框 -->
      <el-dialog title="修改商品" v-model="updateCommodityDialogVisible" width="40%" @close="closeUpdateCommodityDialog">
        <el-form label-width="120px">
          <el-form-item label="商品名称">
            <el-input v-model="updateCommodityForm.commodity_name" placeholder="请输入商品名称" />
          </el-form-item>

          <!-- 品类名称输入框 -->
          <el-form-item label="品类名称">
            <el-select
              v-model="updateCommodityForm.category_id"
              :placeholder="updateCommodityForm.category_name"
              filterable
              remote
              :remote-method="debouncedUpdateSearchCategory"
              clearable
            >
              <!-- 搜索结果 -->
              <el-option
                  v-for="category in updateCommodityForm.category"
                  :key="category"
                  :label="category.category_name"
                  :value="category.category_id"
                />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="closeUpdateCommodityDialog">取消</el-button>
          <el-button type="primary" @click="updateCommodity">确定</el-button>
        </template>
      </el-dialog>

      <!-- 创建品类对话框 -->
      <el-dialog
        title="创建品类"
        v-model="categoryDialogVisible"
        width="40%"
        @close="closeCreateCategoryDialog"
      >
        <el-form label-width="120px">
          <!-- 品类输入框 -->
          <el-form-item label="品类名称">
            <el-input v-model="createCategoryName" placeholder="请输入品类名称" />
          </el-form-item>
        </el-form>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="closeCreateCategoryDialog">取消</el-button>
          <el-button type="primary" @click="createCategory">确定</el-button>
        </template>
      </el-dialog>

      <!-- 修改品类对话框 -->
      <el-dialog
        title="修改品类"
        v-model="updateCategoryDialogVisible"
        width="40%"
        @close="closeUpdateCategoryDialog"
      >
        <el-form label-width="120px">
          <!-- 品类输入框 -->
          <el-form-item label="品类名称">
            <el-input v-model="updateCategoryForm.category_name" placeholder="请输入品类名称" />
          </el-form-item>
        </el-form>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <el-button @click="closeUpdateCategoryDialog">取消</el-button>
          <el-button type="primary" @click="updateCategory">确定</el-button>
        </template>
      </el-dialog>


    </div>
  </div>
</template>


<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { commodityApi } from "@/api/dictionary/commodity";
import { errorHandler } from "@/utils/errorHandler";
import { ElMessage, ElMessageBox } from "element-plus";
import SmartPagination from "@/components/SmartPagination.vue";
import { debounce } from 'lodash'  // 需要安装 lodash

//======================分页======================
// 商品分页
const commodityPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 10,
  serverPageSize: 30,
  totalItems: 0,
  cachedData: new Map()
});
const commodityCurrentPageData = computed(() => {
  const displayPageSize = commodityPagination.value.displayPageSize  // 10
  const serverPageSize = commodityPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((commodityPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = commodityPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((commodityPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleCommodityLoadData = async (serverPage) => {
  console.log("商品分页组件计算出的页码：",serverPage);
  if(commodityPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  commodityPagination.value.serverPage = serverPage
  await searchCommodity()

}
const clearCommodityCache = () => {
  commodityPagination.value.currentPage = 1;
  commodityPagination.value.serverPage = 1;
  commodityPagination.value.cachedData.clear();
  commodityPagination.value.totalItems = 0;
}

// 品类分页
const categoryPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 10,
  serverPageSize: 30,
  totalItems: 0,
  cachedData: new Map()
});
const categoryCurrentPageData = computed(() => {
  const displayPageSize = categoryPagination.value.displayPageSize  // 10
  const serverPageSize = categoryPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((categoryPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = categoryPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((categoryPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleCategoryLoadData = async (serverPage) => {
  console.log("品类分页组件计算出的页码：",serverPage);
  if(categoryPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  categoryPagination.value.serverPage = serverPage
  await searchCategory()

}
const clearCategoryCache = () => {
  categoryPagination.value.currentPage = 1;
  categoryPagination.value.serverPage = 1;
  categoryPagination.value.cachedData.clear();
  categoryPagination.value.totalItems = 0;
}
//======================数据======================
// 商品
const searchCommodityForm = ref({
  commodity_name: "",
  category_id: "",
  category: []
});
const createCommodityForm = ref({
  commodity_name: "",
  category_id: "",
  category_name: "",
  category: []
});
const updateCommodityForm = ref({
  commodity_id: "",
  commodity_name: "",
  category_id: "",
  category_name: "",
  category: []
});

// 品类
const createCategoryName = ref("");
const updateCategoryForm = ref({
  category_id: "",
  category_name: ""
});
const searchCategoryName = ref("");


//======================功能======================
// 商品
// 导入商品
const importCommodity = async (file) => {
  try {
    console.log("导入商品文件", file.raw);
    const res = await commodityApi.importCommodity(file.raw)
    if (res.code === 200) {
      ElMessageBox.alert(
        `导入商品成功:
        成功${res.data.success_count}条\n
        失败${res.data.fail_count}条。
        \n如果有数据导入失败，原因可能为：商品名称已存在、品类名称不存在`,
        '导入结果',
        {
          type: 'success',
          confirmButtonText: '确定'
        }
      )
      console.log("导入商品成功", res);
    } else {
      errorHandler.showError("导入商品失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("导入商品失败,请重试", error);
  }
}
//===========创建商品系列===========
// 创建商品
const createCommodity = async () => {
  try {
    const requestData = {
      commodity_name: createCommodityForm.value.commodity_name,
      category_id: createCommodityForm.value.category_id
    }
    console.log("创建商品请求数据", requestData);
    const res = await commodityApi.createCommodity(requestData)
    if (res.code === 200) {
      ElMessage.success('创建商品成功')
      console.log("创建商品成功", res);
      // 将商品数据缓存到当前页
      const selectedCategory = createCommodityForm.value.category.find(
        category => category.category_id === createCommodityForm.value.category_id
      );
      createCommodityForm.value.category_name = selectedCategory.category_name;
      if(commodityPagination.value.cachedData.get(commodityPagination.value.serverPage)){
        commodityPagination.value.cachedData.get(commodityPagination.value.serverPage).unshift({
          commodity_id: res.data.commodity_id,
          commodity_name: createCommodityForm.value.commodity_name,
          category_name: createCommodityForm.value.category_name,
        })
      }else{
        commodityPagination.value.cachedData.set(
          commodityPagination.value.serverPage,
          [{
            commodity_id: res.data.commodity_id,
            commodity_name: createCommodityForm.value.commodity_name,
            category_name: createCommodityForm.value.category_name,
          }]
        )
      }
      commodityPagination.value.totalItems = commodityPagination.value.totalItems + 1
      // 清除创建商品表单
      clearCreateCommodityForm()
      closeCreateCommodityDialog()
    } else {
      errorHandler.showError("创建商品失败,请重试。失败可能原因为：商品名称已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("创建商品失败,请重试", error);
  }
}
// 创建商品选择品类
const chooseCreateCategory = async (query) => {
  try {
    const requestData = {
      category_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索品类请求数据", requestData);
    const res = await commodityApi.filterCategory(requestData)
    if (res.code === 200) {
      // 将品类数据缓存
      createCommodityForm.value.category = res.data.category
      console.log("创建商品选择品类响应数据", res);
      console.log("创建商品选择品类数据", createCommodityForm.value.category);
    } else {
      errorHandler.showError("搜索品类失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索品类失败,请重试", error);
  }
}
const debouncedCreateSearchCategory = debounce(chooseCreateCategory, 1000)
// 清除创建商品表单
const clearCreateCommodityForm = () => {
  createCommodityForm.value.commodity_name = "";
  createCommodityForm.value.category_id = "";
  createCommodityForm.value.category_name = "";
  createCommodityForm.value.category = [];
}

//===========搜索商品系列===========
// 搜索商品点击事件
const handleSearchCommodityClick = () => {
  clearCommodityCache()
  searchCommodity()
}
// 搜索商品
const searchCommodity = async () => {
  try {
    const requestData = {
      commodity_name: searchCommodityForm.value.commodity_name,
      category_id: searchCommodityForm.value.category_id,
      page_num: commodityPagination.value.serverPage,
      page_size: commodityPagination.value.serverPageSize
    }
    console.log("搜索商品请求数据", requestData);
    const res = await commodityApi.filterCommodity(requestData)
    if (res.code === 200) {
      commodityPagination.value.cachedData.set(
        commodityPagination.value.serverPage,
        res.data.commodity
      )
      commodityPagination.value.totalItems = res.data.total_items
      console.log("搜索商品响应数据", res);
    } else {
      errorHandler.showError("搜索商品失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索商品失败,请重试", error);
  }
}
// 选择品类
const chooseCategory = async (query) => {
  try {
    const requestData = {
      category_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索品类请求数据", requestData);
    const res = await commodityApi.filterCategory(requestData)
    if (res.code === 200) {
      // 将品类数据缓存
      searchCommodityForm.value.category = res.data.category
      console.log("商品搜索品类响应数据", res);
      console.log("商品搜索品类数据", searchCommodityForm.value.category);
    } else {
      errorHandler.showError("搜索品类失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索品类失败,请重试", error);
  }
}
// 使用 debounce 包装搜索函数，延迟 1000ms
const debouncedSearchCategory = debounce(chooseCategory, 1000)

//===========修改商品系列===========
// 修改商品
const updateCommodity = async () => {
  try {
    const requestData = {
      commodity_id: updateCommodityForm.value.commodity_id,
      commodity_name: updateCommodityForm.value.commodity_name,
      category_id: updateCommodityForm.value.category_id
    }
    console.log("修改商品请求数据", requestData);
    const res = await commodityApi.updateCommodity(requestData)
    if (res.code === 200) {
      ElMessage.success('修改商品成功')
      // 将商品数据缓存到当前页
      if(updateCommodityForm.value.category_id !== ''){
        const selectedCategory = updateCommodityForm.value.category.find(
          category => category.category_id === updateCommodityForm.value.category_id
        );
        updateCommodityForm.value.category_name = selectedCategory.category_name;
      }
      commodityCurrentPageData.value.forEach((item) => {
        if(item.commodity_id === updateCommodityForm.value.commodity_id){
          item.category_name = updateCommodityForm.value.category_name;
          item.commodity_name = updateCommodityForm.value.commodity_name;
        }
      })
      console.log("修改商品成功", res);
      closeUpdateCommodityDialog()
    } else {
      errorHandler.showError("修改商品失败,请重试。失败可能原因为：商品名称已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("修改商品失败,请重试", error);
  }
}
// 选择品类
const chooseUpdateCategory = async (query) => {
  try {
    //query = updateCommodityForm.value.category_name

    const requestData = {
      category_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索品类请求数据", requestData);
    const res = await commodityApi.filterCategory(requestData)
    if (res.code === 200) {
      // 将品类数据缓存
      updateCommodityForm.value.category = res.data.category
      console.log("商品搜索品类响应数据", res);
      console.log("商品搜索品类数据", updateCommodityForm.value.category);
    } else {
      errorHandler.showError("搜索品类失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索品类失败,请重试", error);
  }
}
// 使用 debounce 包装搜索函数，延迟 1000ms
const debouncedUpdateSearchCategory = debounce(chooseUpdateCategory, 1000)

// 删除商品
const deleteCommodity = async (row) => {
  try {
    const requestData = {
      commodity_id: row.commodity_id
    }
    console.log("删除商品请求数据", requestData);
    const res = await commodityApi.deleteCommodity(requestData)
    if (res.code === 200) {
      ElMessage.success('删除商品成功')
      const currentData = commodityPagination.value.cachedData.get(commodityPagination.value.serverPage)
        commodityPagination.value.cachedData.set(
        commodityPagination.value.serverPage,
        currentData.filter(item => item.commodity_id !== row.commodity_id)
      )
      commodityPagination.value.totalItems = commodityPagination.value.totalItems - 1
      console.log("删除商品成功", res);
    } else {
      errorHandler.showError("删除商品失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("删除商品失败,请重试", error);
  }
}
// 重置商品搜索条件
const resetCommoditySearch = () => {
  searchCommodityForm.value.commodity_name = "";
  searchCommodityForm.value.category_id = "";
  clearCommodityCache()
}

// 品类
// 导入品类
const importCategory = async (file) => {
  try {
    console.log("导入品类文件", file.raw);
    const res = await commodityApi.importCategory(file.raw)
    if (res.code === 200) {
      ElMessageBox.alert(
        `导入品类成功:
        成功${res.data.success_count}条\n
        失败${res.data.fail_count}条。
        \n如果有数据导入失败，原因可能为：品类名称已存在`,
        '导入结果',
        {
          type: 'success',
          confirmButtonText: '确定'
        }
      )
      console.log("导入品类成功", res);
    } else {
      errorHandler.showError("导入品类失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("导入品类失败,请重试", error);
  }
}

// 创建品类
const createCategory = async () => {
  try {
    console.log(" 创建品类", createCategoryName.value);
    const res = await commodityApi.createCategory({
      category_name: createCategoryName.value
    })
    if (res.code === 200) {
      console.log("创建品类成功", res);
      if(categoryPagination.value.cachedData.get(categoryPagination.value.serverPage)){
        categoryPagination.value.cachedData.get(categoryPagination.value.serverPage).unshift({
          category_id: res.data.category_id,
          category_name: createCategoryName.value,
        })
      }else{
        categoryPagination.value.cachedData.set(
          categoryPagination.value.serverPage,
          [{
            category_id: res.data.category_id,
            category_name: createCategoryName.value,
          }]
        )
      }
      categoryPagination.value.totalItems = categoryPagination.value.totalItems + 1
      closeCreateCategoryDialog();
    } else {
      errorHandler.showError("创建品类失败,请重试。失败可能原因为：品类名称已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("创建品类失败,请重试", error);
  }
}

// 搜索品类点击事件
const handleSearchCategoryClick = () => {
  clearCategoryCache()
  searchCategory()
}

// 搜索品类
const searchCategory = async () => {
  try {
    const requestData = {
      category_name: searchCategoryName.value,
      page_num: categoryPagination.value.serverPage,
      page_size: categoryPagination.value.serverPageSize
    }
    console.log("搜索品类请求数据", requestData);
    const res = await commodityApi.filterCategory(requestData)
    if (res.code === 200) {
      // 将品类数据缓存
      categoryPagination.value.cachedData.set(
        categoryPagination.value.serverPage,
        res.data.category)
      categoryPagination.value.totalItems = res.data.total_items
      console.log("搜索品类响应数据", res);
      console.log("品类分页数据", categoryPagination.value.cachedData.get(categoryPagination.value.serverPage));
    } else {
      errorHandler.showError("搜索品类失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索品类失败,请重试", error);
  }
}

// 修改品类
const updateCategory = async () => {
  try {
    const requestData = {
      category_id: updateCategoryForm.value.category_id,
      category_name: updateCategoryForm.value.category_name
    }
    console.log("修改品类请求数据", requestData);
    const res = await commodityApi.updateCategory(requestData)
    if (res.code === 200) {
      ElMessage.success('修改品类成功')
      categoryCurrentPageData.value.forEach((item) => {
        if(item.category_id === updateCategoryForm.value.category_id){
          item.category_name = updateCategoryForm.value.category_name;
        }
      })
      console.log("修改品类成功", res);
      closeUpdateCategoryDialog()
    } else {
      errorHandler.showError("修改品类失败,请重试。失败可能原因为：品类名称已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("修改品类失败,请重试", error);
  }
}

// 删除品类
const deleteCategory = async (row) => {
  try {
    const requestData = {
      category_id: row.category_id
    }
    console.log("删除品类请求数据", requestData);
    const res = await commodityApi.deleteCategory(requestData)
    if (res.code === 200) {
      ElMessage.success('删除品类成功')
      const currentData = categoryPagination.value.cachedData.get(categoryPagination.value.serverPage)
      categoryPagination.value.cachedData.set(
        categoryPagination.value.serverPage,
        currentData.filter(item => item.category_id !== row.category_id)
      )
      categoryPagination.value.totalItems = categoryPagination.value.totalItems - 1
      console.log("删除品类成功", res);
    } else {
      errorHandler.showError("删除品类失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("删除品类失败,请重试", error);
  }
}

// 重置品类搜索条件
const resetCategorySearch = () => {
  searchCategoryName.value = "";
  clearCategoryCache()
}

//======================对话框======================
// 对话框状态
const commodityDialogVisible = ref(false);
const updateCommodityDialogVisible = ref(false);
const categoryDialogVisible = ref(false);
const updateCategoryDialogVisible = ref(false);

// 打开对话框
const openCreateCommodityDialog = () => {
  commodityDialogVisible.value = true;
};
const openCreateCategoryDialog = () => {
  categoryDialogVisible.value = true;
};
const openUpdateCommodityDialog = (row) => {
  updateCommodityDialogVisible.value = true;
  updateCommodityForm.value.commodity_id = row.commodity_id
  updateCommodityForm.value.commodity_name = row.commodity_name
  updateCommodityForm.value.category_id = ''
  updateCommodityForm.value.category_name = row.category_name
  updateCommodityForm.value.category = row.category
  console.log("打开修改商品对话框", updateCommodityForm.value);
};
const openUpdateCategoryDialog = (row) => {
  updateCategoryDialogVisible.value = true;
  updateCategoryForm.value.category_id = row.category_id
  updateCategoryForm.value.category_name = row.category_name
  console.log("打开修改品类名称对话框", updateCategoryForm.value);
};
// 关闭对话框
const closeCreateCommodityDialog = () => {
  commodityDialogVisible.value = false;
};
const closeCreateCategoryDialog = () => {
  categoryDialogVisible.value = false;
  createCategoryName.value = "";
};
const closeUpdateCommodityDialog = () => {
  updateCommodityDialogVisible.value = false;
  updateCommodityForm.value.commodity_id = "";
  updateCommodityForm.value.commodity_name = "";
  updateCommodityForm.value.category_id = "";
  updateCommodityForm.value.category_name = "";
  updateCommodityForm.value.category = [];
};
const closeUpdateCategoryDialog = () => {
  updateCategoryDialogVisible.value = false;
  updateCategoryForm.value.category_id = "";
  updateCategoryForm.value.category_name = "";
};



// 组件卸载时取消未执行的防抖函数
onBeforeUnmount(() => {
  debouncedSearchCategory.cancel()
  debouncedCreateSearchCategory.cancel()
})

</script>


<style scoped>

.commodity-button-group{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;
  gap: 20px;
}
.category-button-group{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;
  gap: 20px;
}

.upload-center :deep(.el-upload) {
  /* 让 el-upload 的内部容器占满宽度 */
  display: block;
  width: 100%;
}

.upload-button {
  /* 让按钮容器居中 */
  display: flex;
  justify-content: center;
}
</style>

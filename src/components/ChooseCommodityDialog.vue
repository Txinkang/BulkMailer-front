<template>
  <el-dialog
    title="选择经营范围"
    v-model="dialogVisible"
    width="60%"
    destroy-on-close
    @close="closeDialog"

  >
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
              :key="category.category_id"
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

    <!-- 筛选结果 -->
    <div class="result-section">
      <el-table
        ref="multipleTableRef"
        :data="commodityCurrentPageData"
        style="width: 100%"
        border
        @selection-change="handleTableSelectionChange"
        :row-key="row => row.commodity_id"
      >
        <el-table-column type="selection" width="55" :reserve-selection="true"/>
        <el-table-column property="commodity_name" label="商品名称" />
        <el-table-column property="category_name" label="品类" />
      </el-table>
      <SmartPagination
        v-model:current-page="commodityPagination.currentPage"
        :server-page-size="commodityPagination.serverPageSize"
        :display-page-size="commodityPagination.displayPageSize"
        :total="commodityPagination.totalItems"
        @load-data="handleCommodityLoadData" />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="confirmSelect">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { commodityApi } from '@/api/dictionary/commodity.js'
import { errorHandler } from '@/utils/errorHandler.js'
import { debounce } from 'lodash'
import SmartPagination from '@/components/SmartPagination.vue'

// ========================= 父组件数据 =========================
const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'confirm'])
// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// ========================= 数据 =========================
const multipleTableRef = ref(null)
const selectedIds = ref([]) // 存储选中的商品ID
const selectedCommodities = ref([]) // 存储选中的完整对象

// 处理表格选择变化
const handleTableSelectionChange = (selectedRows) => {
  // 更新选中的商品列表
  selectedCommodities.value = selectedRows;
  // 更新选中的ID列表
  selectedIds.value = selectedRows.map(item => item.commodity_id);
}

// 设置表格的选中状态
const setSelectedRows = () => {
  if (!multipleTableRef.value) return;

  // 清除所有选择
  multipleTableRef.value.clearSelection();

  // 选中已选择的行
  commodityCurrentPageData.value.forEach(row => {
    if (selectedIds.value.includes(row.commodity_id)) {
      multipleTableRef.value.toggleRowSelection(row, true);
    }
  });
}

// 搜索表单
const searchCommodityForm = ref({
  commodity_name: "",
  category_id: "",
  category: []
});
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

      // 数据加载完成后，设置选中状态
      setTimeout(() => {
        setSelectedRows();
      }, 0);
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
      page_size: 50
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
// 使用 debounce 包装搜索函数，延迟 500ms
const debouncedSearchCategory = debounce(chooseCategory, 500)
// 重置商品搜索条件
const resetCommoditySearch = () => {
  searchCommodityForm.value.commodity_name = "";
  searchCommodityForm.value.category_id = "";
  searchCommodityForm.value.category = [];
  selectedCommodities.value = []
  selectedIds.value = []
  clearCommodityCache()
}

// 商品分页
const commodityPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 20,
  totalItems: 0,
  cachedData: new Map()
});
const commodityCurrentPageData = computed(() => {
  const displayPageSize = commodityPagination.value.displayPageSize  // 5
  const serverPageSize = commodityPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 4

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

// 关闭对话框
const closeDialog = () => {
  resetCommoditySearch()
  dialogVisible.value = false
}

// 确认选择
const confirmSelect = () => {
  // 确保selectedCommodities包含完整的对象信息
  const selectedCommodityObjects = selectedIds.value.map(id => {
    // 遍历所有缓存页查找商品完整信息
    for (const [, pageData] of commodityPagination.value.cachedData.entries()) {
      const commodity = pageData.find(item => item.commodity_id === id);
      if (commodity) return commodity;
    }
    return null;
  }).filter(Boolean); // 过滤掉可能的 null 值

  emit('confirm', selectedCommodityObjects, selectedIds.value);
  closeDialog();
}

</script>

<style scoped>
.result-section {
  margin-top: 20px;
  max-height: 500px;
  overflow-y: auto;
}
</style>


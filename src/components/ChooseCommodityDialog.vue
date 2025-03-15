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
      <el-checkbox-group v-model="selectedIds" @change="handleSelectionChange">
        <el-checkbox
          v-for="item in commodityCurrentPageData"
          :key="item.commodity_id"
          :label="item.commodity_name"
          :value="item.commodity_id"
        >
          {{ item.commodity_name }}
        </el-checkbox>
      </el-checkbox-group>
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
const selectedIds = ref([]) // 存储选中的 ID
const selectedCommodities = ref([]) // 存储选中的完整对象

// 当选择变化时更新 selectedCommodities
const handleSelectionChange = (ids) => {
  selectedCommodities.value = ids.map(id => {
    // 遍历所有缓存页查找商品
    let commodity = null;
    for (const [pageNum, pageData] of commodityPagination.value.cachedData.entries()) {
      commodity = pageData.find(item => item.commodity_id === id);
      if (commodity) break; // 找到就退出循环
    }
    return commodity;
  }).filter(Boolean); // 过滤掉可能的 null 值
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


// 关闭对话框
const closeDialog = () => {
  resetCommoditySearch()
  dialogVisible.value = false
}

// 确认选择
const confirmSelect = () => {
  emit('confirm', selectedCommodities.value, selectedIds.value)
  closeDialog()
}
</script>


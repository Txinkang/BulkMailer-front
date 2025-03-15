<template>
  <el-dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="searchReceiverForm" style="display: flex;flex-flow:row wrap;gap: 10px;">
        <el-form-item>
          <el-input v-model="searchReceiverForm.commodity_name" placeholder="请搜索商品名称" style="width: 200px;" clearable />
        </el-form-item>

        <el-form-item>
          <el-select
              v-model="searchReceiverForm.area_ids"
              placeholder="请搜索区域名称(可多选)"
              filterable
              remote
              multiple
              :remote-method="debouncedSearchArea"
              clearable
              style="width: 200px;"
            >
              <el-option
              v-for="area in searchReceiverForm.area_options"
              :key="area.area_id"
              :label="area.area_name"
              :value="area.area_id" />
            </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
              v-model="searchReceiverForm.country_ids"
              placeholder="请搜索国家名称(可多选)"
              filterable
              remote
              multiple
              :remote-method="debouncedSearchCountry"
              clearable
              style="width: 200px;"
            >

              <el-option
              v-for="country in searchReceiverForm.country_options"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
            </el-select>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchReceiverForm.trade_type" placeholder="请选择收件人贸易类型" clearable style="width: 200px;">
            <el-option label="工厂" value="1" />
            <el-option label="贸易商" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchReceiverForm.receiver_level" placeholder="请选择收件人等级" clearable style="width: 200px;">
            <el-option label="初级" value="1" />
            <el-option label="中级" value="2" />
            <el-option label="高级" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchReceiverForm.is_user" placeholder="请选择所属用户" clearable style="width: 200px;">
            <el-option label="所有" />
            <el-option label="公司" value="0" />
            <el-option label="个人" value="1" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearchClick">搜索</el-button>
          <el-button type="primary" @click="handleReset">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 筛选结果 -->
    <div class="result-section">
      <p>筛选结果：</p>
      <el-checkbox-group v-model="selectedReceiverIds">
        <el-checkbox
          v-for="item in filterReceiverCurrentPageData"
          :key="item.receiver_id"
          :label="item.receiver_name"
          :value="item.receiver_id"
        >
          {{ item.receiver_name }}
        </el-checkbox>
      </el-checkbox-group>

      <!-- 分页 -->
      <div>
        <SmartPagination
          v-model:current-page="filterReceiverPagination.currentPage"
          :server-page-size="filterReceiverPagination.serverPageSize"
          :display-page-size="filterReceiverPagination.displayPageSize"
          :total="filterReceiverPagination.totalItems"
          @load-data="handleFilterReceiverLoadData" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="handleSelectAll">全选</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { countryApi } from '@/api/dictionary/country.js'
import { areaApi } from '@/api/dictionary/area.js'
import { sendEmailApi } from '@/api/sendEmail/sendEmail.js'
import { errorHandler } from '@/utils/errorHandler.js'
import { debounce } from 'lodash'
import { ElMessage } from 'element-plus'
import SmartPagination from '@/components/SmartPagination.vue'
// =======================父组件数据======================
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  receiverType: {
    type: Number,
    required: true,
    validator: (value) => [1, 2].includes(value)
  }
})
const emit = defineEmits(['update:modelValue', 'select-receivers'])
const isSupplier = computed(() => props.receiverType === 1)
const dialogTitle = computed(() => isSupplier.value ? '筛选供应商' : '筛选客户')
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// =======================页面数据======================
const searchReceiverForm = ref({
  commodity_name: null,
  area_ids: [],
  area_options: [],
  country_ids: [],
  country_options: [],
  trade_type: null,
  receiver_level: null,
  is_user: null
})
const selectedReceiverKey = ref(null)
const selectedReceiverTotal = ref(0)
const selectedReceiverIds = ref([])


// =======================功能======================
// 搜索方法点击事件
const handleSearchClick = async () => {
  clearReceiverCache()
  await searchReceiver()
}
// 搜索方法
const searchReceiver = async () => {
  try {
    if(isSupplier.value){
      const requestData = {
        commodity_name: searchReceiverForm.value.commodity_name === '' ? null : searchReceiverForm.value.commodity_name,
        area_id: searchReceiverForm.value.area_ids.length === 0 ? [''] : searchReceiverForm.value.area_ids,
        supplier_country_id: searchReceiverForm.value.country_ids.length === 0 ? null : searchReceiverForm.value.country_ids,
        trade_type: searchReceiverForm.value.trade_type ? Number(searchReceiverForm.value.trade_type) : null,
        supplier_level: searchReceiverForm.value.receiver_level ? Number(searchReceiverForm.value.receiver_level) : null,
        is_user: searchReceiverForm.value.is_user ? Number(searchReceiverForm.value.is_user) : null,
        page_num: filterReceiverPagination.value.serverPage,
        page_size: filterReceiverPagination.value.serverPageSize
      }
      console.log("搜索供应商请求数据", requestData);
      const res = await sendEmailApi.getSupplier(requestData)
      if (res.code === 200) {
        ElMessage.success("搜索供应商成功");
        console.log("搜索供应商响应数据", res);
        filterReceiverPagination.value.totalItems = res.data.total_items
        filterReceiverPagination.value.cachedData.set(filterReceiverPagination.value.serverPage, res.data.receiver)
      } else {
        errorHandler.showError("搜索供应商失败,请重试", res);
      }
    }else{
      const requestData = {
        commodity_name: searchReceiverForm.value.commodity_name === '' ? null : searchReceiverForm.value.commodity_name,
        area_id: searchReceiverForm.value.area_ids.length === 0 ? null : searchReceiverForm.value.area_ids,
        customer_country_id: searchReceiverForm.value.country_ids.length === 0 ? null : searchReceiverForm.value.country_ids,
        trade_type: searchReceiverForm.value.trade_type ? Number(searchReceiverForm.value.trade_type) : null,
        customer_level: searchReceiverForm.value.receiver_level ? Number(searchReceiverForm.value.receiver_level) : null,
        is_user: searchReceiverForm.value.is_user ? Number(searchReceiverForm.value.is_user) : null,
        page_num: filterReceiverPagination.value.serverPage,
        page_size: filterReceiverPagination.value.serverPageSize
      }
      console.log("搜索客户请求数据", requestData);
      const res = await sendEmailApi.getCustomer(requestData)
      if (res.code === 200) {
        ElMessage.success("搜索客户成功");
        console.log("搜索客户响应数据", res);
        filterReceiverPagination.value.totalItems = res.data.total_items
        filterReceiverPagination.value.cachedData.set(filterReceiverPagination.value.serverPage, res.data.receiver)
      } else {
        errorHandler.showError("搜索客户失败,请重试", res);
      }
    }
  } catch (error) {
    errorHandler.showError("搜索失败,请重试", error);
  }
}
// 全选
const handleSelectAll = async () => {
  try {
    if(isSupplier.value){
      const requestData = {
        commodity_name: searchReceiverForm.value.commodity_name,
        area_id: searchReceiverForm.value.area_ids,
        supplier_country_id: searchReceiverForm.value.country_ids,
        trade_type: searchReceiverForm.value.trade_type ? Number(searchReceiverForm.value.trade_type) : null,
        supplier_level: searchReceiverForm.value.receiver_level ? Number(searchReceiverForm.value.receiver_level) : null,
        is_user: searchReceiverForm.value.is_user ? Number(searchReceiverForm.value.is_user) : null,
      }
    console.log("全选供应商请求数据", requestData);
    const res = await sendEmailApi.selectAllSupplier(requestData)
    if (res.code === 200) {
      ElMessage.success("全选成功");
      console.log("全选供应商响应数据", res);
      selectedReceiverKey.value = res.data.receiver_key
      selectedReceiverTotal.value = res.data.total_items
      selectedReceiverIds.value = []
      handleSelectAllConfirm()
    }else{
      errorHandler.showError("全选供应商失败,请重试", res);
    }
  }else{
    const requestData = {
      commodity_name: searchReceiverForm.value.commodity_name,
      area_id: searchReceiverForm.value.area_ids,
      customer_country_id: searchReceiverForm.value.country_ids,
      trade_type: searchReceiverForm.value.trade_type ? Number(searchReceiverForm.value.trade_type) : null,
      customer_level: searchReceiverForm.value.receiver_level ? Number(searchReceiverForm.value.receiver_level) : null,
      is_user: searchReceiverForm.value.is_user ? Number(searchReceiverForm.value.is_user) : null,
    }
    console.log("全选客户请求数据", requestData);
    const res = await sendEmailApi.selectAllCustomer(requestData)
    if (res.code === 200) {
      ElMessage.success("全选成功");
        console.log("全选客户响应数据", res);
        selectedReceiverKey.value = res.data.receiver_key
        selectedReceiverTotal.value = res.data.total_items
        selectedReceiverIds.value = []
        handleSelectAllConfirm()
      }else{
        errorHandler.showError("全选客户失败,请重试", res);
      }
    }
  } catch (error) {
    errorHandler.showError("全选失败,请重试", error);
  }
}
// 单独勾选返回数据
const handleConfirm = () => {
  try {
    // 根据接收者类型返回不同格式的数据
    const result = {
      type: props.receiverType,
      total_items: selectedReceiverIds.value.length,
      receiver_key: null,
      receiver_ids: selectedReceiverIds.value
    }
    emit('select-receivers', result)
    emit('update:modelValue', false)
  } catch (error) {
    errorHandler.showError("确认选择失败,请重试", error);
  }
}
// 全选返回数据
const handleSelectAllConfirm = () => {
  try {
    // 根据接收者类型返回不同格式的数据
    const result = {
      type: props.receiverType,
      total_items: selectedReceiverTotal.value,
      receiver_key: selectedReceiverKey.value,
      receiver_ids: []
    }
    emit('select-receivers', result)
    handleClose()
  } catch (error) {
    errorHandler.showError("全选失败,请重试", error);
  }
}
// 重置方法
const handleReset = () => {
  clearReceiverCache()
  searchReceiverForm.value = {
    commodity_name: null,
    area_ids: [],
    area_options: [],
    country_ids: [],
    country_options: [],
    trade_type: null,
    receiver_level: null,
    is_user: null
  }
  selectedReceiverIds.value = []
  selectedReceiverKey.value = null
  selectedReceiverTotal.value = 0
}
// =======================对话框======================
const handleClose = () => {
  handleReset()
  emit('update:modelValue', false)
}

// =======================筛选结果分页======================
const filterReceiverPagination = ref({
  currentPage: 1, // 当前页
  serverPage: 1, // 服务器页
  displayPageSize: 5, // 每页显示条数
  serverPageSize: 20, // 每页服务器条数
  totalItems: 0, // 总条数
  cachedData: new Map() // 缓存数据
});
const filterReceiverCurrentPageData = computed(() => {
  const displayPageSize = filterReceiverPagination.value.displayPageSize  // 10
  const serverPageSize = filterReceiverPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((filterReceiverPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = filterReceiverPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((filterReceiverPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleFilterReceiverLoadData = async (serverPage) => {
  console.log("手动发送邮件任务分页组件计算出的页码：",serverPage);
  if(filterReceiverPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  filterReceiverPagination.value.serverPage = serverPage
  await searchReceiver()

}
const clearReceiverCache = () => {
  filterReceiverPagination.value.currentPage = 1;
  filterReceiverPagination.value.serverPage = 1;
  filterReceiverPagination.value.cachedData.clear();
  filterReceiverPagination.value.totalItems = 0;
}
// =======================其它功能======================
// 搜索区域
const searchArea = async (query) => {
  try {
    const requestData = {
      area_name: query,
      page_num: 1,
      page_size: 100
    }
    console.log("搜索收件人区域请求数据", requestData);
    const res = await areaApi.filterArea(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      searchReceiverForm.value.area_options = res.data.area
      console.log("搜索收件人区域响应数据", res);
      console.log("搜索收件人区域缓存数据", searchReceiverForm.value.area_options);
    } else {
      errorHandler.showError("搜索收件人区域失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索收件人区域失败,请重试", error);
  }
}
const debouncedSearchArea = debounce(searchArea, 500)
// 搜索国家
const searchCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 100
    }
    console.log("搜索收件人国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      searchReceiverForm.value.country_options = res.data.country
      console.log("搜索收件人国家响应数据", res);
      console.log("搜索收件人国家缓存数据", searchReceiverForm.value.country_options);
    } else {
      errorHandler.showError("搜索收件人国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索收件人国家失败,请重试", error);
  }
}
const debouncedSearchCountry = debounce(searchCountry, 500)
</script>

<style scoped>
.filter-section {
  margin-bottom: 20px;
}

.result-section {
  margin: 20px 0;
}

.el-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>

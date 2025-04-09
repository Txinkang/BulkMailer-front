<template>
  <div class="country-management">
    <!-- 顶部按钮 -->
    <div class="button-group">
      <el-button type="primary" @click="openCreateDialog">创建区域</el-button>
    </div>

    <!-- 搜索框 -->
    <div>
      <el-form :inline="true">
        <el-form-item>
          <el-input
            v-model="searchAreaForm.areaName"
            placeholder="请搜索区域名称"
            clearable
            style="width:200px"
          />
        </el-form-item>

        <!-- 国家名称输入框 -->
        <el-form-item>
            <el-select
              v-model="searchAreaForm.country_id"
              placeholder="请搜索国家名称"
              filterable
              remote
              :remote-method="debouncedSearchCountry"
              clearable
              style="width:200px">

              <el-option
              v-for="country in searchAreaForm.country"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearchAreaClick">搜索</el-button>
          <el-button type="primary" @click="resetAreaSearch"><el-icon><Refresh /></el-icon></el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 区域表格 -->
    <div>
      <el-table :data="areaCurrentPageData" border style="width: 100%;margin-bottom: 20px">
        <el-table-column label="区域名称" min-width="200">
          <template #default="{ row }">
            <span>{{ row.area_name }}</span>
          </template>
        </el-table-column>
        <!-- 国家名称列 -->
        <el-table-column label="国家名称" min-width="100">
          <template #default="{ row }">
            <span>共 {{ row.area_country.length }} 个国家</span>
            <el-button
              size="mini"
              type="text"
              @click="openAreaCountryListDialog(row, 'area_country')">
              查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openUpdateAreaDialog(row)">修改</el-button>
            <el-button type="danger" size="small" @click="deleteArea(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div>
      <SmartPagination
        v-model:current-page="areaPagination.currentPage"
        :server-page-size="areaPagination.serverPageSize"
        :display-page-size="areaPagination.displayPageSize"
        :total="areaPagination.totalItems"
        @load-data="handleAreaLoadData" />
    </div>

    <!-- 查看国家列表信息对话框 -->
    <ListDialog :title="详情" v-model="areaCountryListDialog" :list="areaCountryListDetails" />

    <!-- 创建区域对话框 -->
    <el-dialog title="创建区域" v-model="createDialogVisible" width="40%" @close="closeCreateAreaDialog">
      <el-form label-width="120px">
        <el-form-item label="区域名称">
          <el-input v-model="createAreaForm.area_name" placeholder="请输入区域名称" clearable/>
        </el-form-item>
        <!-- 国家名称输入框 -->
        <el-form-item label="国家名称">
            <el-select
              v-model="createAreaForm.selectedAreaCountryId"
              placeholder="请搜索国家名称"
              filterable
              remote
              multiple
              :remote-method="debouncedCreateSearchCountry"
              clearable>

              <el-option
              v-for="country in createAreaForm.countryOptions"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
            </el-select>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="closeCreateAreaDialog">取消</el-button>
        <el-button type="primary" @click="createArea">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改区域对话框 -->
    <el-dialog title="修改区域" v-model="updateDialogVisible" width="40%" @close="closeUpdateAreaDialog">
      <el-form label-width="120px">
        <el-form-item label="区域名称">
          <el-input v-model="updateAreaForm.area_name" placeholder="请输入区域名称" clearable/>
        </el-form-item>
        <!-- 国家名称输入框 -->
        <el-form-item label="国家名称">
            <el-select
              v-model="updateAreaForm.selectedAreaCountryId"
              placeholder="请搜索国家名称"
              filterable
              remote
              multiple
              :remote-method="debouncedUpdateSearchCountry"
              clearable>

              <el-option
              v-for="country in updateAreaForm.countryOptions"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
            </el-select>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="closeUpdateAreaDialog">取消</el-button>
        <el-button type="primary" @click="updateArea">确定</el-button>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { areaApi } from "@/api/dictionary/area.js";
import { countryApi } from "@/api/dictionary/country.js";
import { errorHandler } from '@/utils/errorHandler.js'
import { ElMessage,ElMessageBox } from 'element-plus'
import SmartPagination from '@/components/SmartPagination.vue'
import { debounce } from 'lodash'
import ListDialog from '@/components/ListDialog.vue'
//======================数据======================
const searchAreaForm = ref({
  areaName: "",
  country_id: "",
  country: []
});

const createAreaForm = ref({
  area_name: "",
  selectedAreaCountryId: [],
  selectedAreaCountryName: [],
  countryOptions: []
});

const updateAreaForm = ref({
  area_id: "",
  area_name: "",
  selectedAreaCountryId: [],
  selectedAreaCountryName: [],
  countryOptions: []
});
const areaCountryListDetails = ref([]);
//======================分页======================
// 国家分页
const areaPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 10,
  totalItems: 0,
  cachedData: new Map()
});
const areaCurrentPageData = computed(() => {
  const displayPageSize = areaPagination.value.displayPageSize  // 10
  const serverPageSize = areaPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((areaPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = areaPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((areaPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleAreaLoadData = async (serverPage) => {
  console.log("国家分页组件计算出的页码：",serverPage);
  if(areaPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  areaPagination.value.serverPage = serverPage
  await searchArea()

}
const clearAreaCache = () => {
  areaPagination.value.currentPage = 1;
  areaPagination.value.serverPage = 1;
  areaPagination.value.cachedData.clear();
  areaPagination.value.totalItems = 0;
}
//======================功能======================
// 创建区域
const createArea = async () => {
  try {
    const requestData = {
      area_name: createAreaForm.value.area_name,
      area_country: createAreaForm.value.selectedAreaCountryId
    }
    console.log("创建区域请求数据", requestData);
    const res = await areaApi.createArea(requestData)
    if (res.code === 200) {
      ElMessage.success('创建区域成功')
      // 将区域数据缓存到当前页
      const selectedAreas = createAreaForm.value.countryOptions.filter(
        country => createAreaForm.value.selectedAreaCountryId.includes(country.country_id)
      );
      console.log("创建区域选择国家--->", selectedAreas);
      if(areaPagination.value.cachedData.get(areaPagination.value.serverPage)){
        areaPagination.value.cachedData.get(areaPagination.value.serverPage).unshift({
          area_id: res.data.area_id,
          area_name: createAreaForm.value.area_name,
          area_country: selectedAreas.map(country => country.country_name),
        })
      }else{
        areaPagination.value.cachedData.set(
          areaPagination.value.serverPage,
          [{
            area_id: res.data.area_id,
            area_name: createAreaForm.value.area_name,
            area_country: selectedAreas.map(country => country.country_name),
          }]
        )
      }
      areaPagination.value.totalItems = areaPagination.value.totalItems + 1
      clearCreateAreaForm()
      closeCreateAreaDialog()
      console.log("创建区域成功", res);
      console.log("区域数据缓存", areaPagination.value.cachedData.get(areaPagination.value.serverPage));
    } else {
      errorHandler.showError("创建区域失败,请重试。失败可能原因为：区域名称或区域代码已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("创建区域失败,请重试。失败可能原因为：区域名称或区域代码已被创建", error);
  }
}
// 创建区域选择国家
const chooseCreateCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 100
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      createAreaForm.value.countryOptions = res.data.country
      console.log("创建区域选择国家响应数据", res);
      console.log("创建区域选择国家缓存数据", createAreaForm.value.countryOptions);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedCreateSearchCountry = debounce(chooseCreateCountry, 1000)

// 搜索区域点击事件
const handleSearchAreaClick = () => {
  clearAreaCache()
  searchArea()
}
// 搜索区域
const searchArea = async () => {
  try {
    const requestData = {
      area_name: searchAreaForm.value.areaName,
      country_id: searchAreaForm.value.country_id,
      page_num: areaPagination.value.serverPage,
      page_size: areaPagination.value.serverPageSize
    }
    console.log("搜索区域请求数据", requestData);
    const res = await areaApi.filterArea(requestData)
    if (res.code === 200) {
      areaPagination.value.totalItems = res.data.total_items
      areaPagination.value.cachedData.set(areaPagination.value.serverPage, res.data.area)
      console.log("搜索区域成功", res);
    } else {
      errorHandler.showError("搜索区域失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索区域失败,请重试", error);
  }
}
// 搜索国家
const chooseSearchCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 100
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      searchAreaForm.value.country = res.data.country
      console.log("搜索国家响应数据", res);
      console.log("搜索国家缓存数据", searchAreaForm.value.country);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedSearchCountry = debounce(chooseSearchCountry, 1000)


// 修改区域
const updateArea = async () => {
  try {
    if(updateAreaForm.value.selectedAreaCountryId.length <= 0){
      errorHandler.showError("请选择国家", "请选择国家");
      return;
    }
    const requestData = {
      area_id: updateAreaForm.value.area_id,
      area_name: updateAreaForm.value.area_name,
      country_id: updateAreaForm.value.selectedAreaCountryId
    }
    console.log("修改区域请求数据", requestData);
    const res = await areaApi.updateArea(requestData)
    if (res.code === 200) {
      ElMessage.success('修改区域成功')
      // 将区域数据缓存到当前页
      if(updateAreaForm.value.selectedAreaCountryId.length > 0){
        const selectedAreas = updateAreaForm.value.countryOptions.filter(
          country => updateAreaForm.value.selectedAreaCountryId.includes(country.country_id)
        );
        updateAreaForm.value.selectedAreaCountryName = selectedAreas.map(country => country.country_name)
        console.log("修改区域选择国家--->", updateAreaForm.value.selectedAreaCountryName);
      }else{
        updateAreaForm.value.selectedAreaCountryName = []
      }
      if(areaPagination.value.cachedData.get(areaPagination.value.serverPage)){
        areaPagination.value.cachedData.get(areaPagination.value.serverPage).forEach(item => {
          if(item.area_id === updateAreaForm.value.area_id){
            item.area_name = updateAreaForm.value.area_name
            const selectedAreas = updateAreaForm.value.countryOptions.filter(
              country => updateAreaForm.value.selectedAreaCountryId.includes(country.country_id))
            item.area_country = updateAreaForm.value.selectedAreaCountryName.length > 0 ? selectedAreas : item.area_country
          }
        })
      }
      console.log("修改区域成功", res);
      console.log("区域数据缓存", areaPagination.value.cachedData.get(areaPagination.value.serverPage));
      closeUpdateAreaDialog()
    } else {
      errorHandler.showError("修改区域失败,请重试。失败可能原因为：区域名称或区域代码已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("修改区域失败,请重试。失败可能原因为：区域名称或区域代码已被创建", error);
  }
}
// 修改区域选择国家
const chooseUpdateCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 100
    }
    console.log("修改区域选择国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      updateAreaForm.value.countryOptions = res.data.country
      console.log("修改区域选择国家响应数据", res);
      console.log("修改区域选择国家缓存数据", updateAreaForm.value.countryOptions);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedUpdateSearchCountry = debounce(chooseUpdateCountry, 1000)

// 删除区域
const deleteArea = async (row) => {
  try {
    // 先弹窗确认是否删除
    await ElMessageBox.confirm(
        '是否确认删除？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      area_id: row.area_id
    }
    console.log("删除区域请求数据", requestData);
    const res = await areaApi.deleteArea(requestData)
    if (res.code === 200) {
      ElMessage.success('删除区域成功')
      // 将区域数据从缓存中删除
      const currentData = areaPagination.value.cachedData.get(areaPagination.value.serverPage)
      areaPagination.value.cachedData.set(
        areaPagination.value.serverPage,
        currentData.filter(item => item.area_id !== row.area_id)
      )
      areaPagination.value.totalItems = areaPagination.value.totalItems - 1
      console.log("删除区域成功", res);
      console.log("区域数据缓存", areaPagination.value.cachedData.get(areaPagination.value.serverPage));
    } else {
      errorHandler.showError("删除区域失败,请重试", res);
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了删除操作')
    } else {
      errorHandler.showError("删除区域失败,请重试", error);
    }
  }
}
// 重置搜索
const resetAreaSearch = () => {
  searchAreaForm.value = {
    areaName: "",
    areaCode: ""
  };
  //clearAreaCache()
}

//======================对话框======================
// 对话框显示控制
const createDialogVisible = ref(false);
const updateDialogVisible = ref(false);
const areaCountryListDialog = ref(false);

// 打开创建对话框
const openCreateDialog = () => {
  createDialogVisible.value = true;
};
// 打开修改对话框
const openUpdateAreaDialog = (row) => {
  updateAreaForm.value = {
    area_id: row.area_id,
    area_name: row.area_name,
    selectedAreaCountryId: row.area_country.map(item => item.country_id),
    selectedAreaCountryName: row.area_country.map(item => item.country_name),
    countryOptions: row.area_country
  };
  updateDialogVisible.value = true;
};
// 打开查看国家列表对话框
const openAreaCountryListDialog = (row, type) => {
  areaCountryListDialog.value = true;
  areaCountryListDetails.value = row[type].map(item => item.country_name);
  console.log("查看国家列表对话框", areaCountryListDetails.value);
};
// 关闭创建对话框
const closeCreateAreaDialog = () => {
  createDialogVisible.value = false;
};
// 清除创建区域表单
const clearCreateAreaForm = () => {
  createAreaForm.value = {
    area_name: "",
    area_country: [],
    country: []
  };
};
// 关闭修改对话框
const closeUpdateAreaDialog = () => {
  updateDialogVisible.value = false;
};

//================================页面初始操作================================
onMounted(() => {
  if(areaCurrentPageData.value.length === 0){
    handleSearchAreaClick()
  }
})
</script>

<style scoped>
.button-group{
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

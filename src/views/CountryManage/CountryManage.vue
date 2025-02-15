<template>
  <div class="country-management">
    <!-- 顶部按钮 -->
    <div class="button-group">
      <el-button type="primary" @click="openCreateDialog">创建国家</el-button>
      <el-upload
        action="#"
        :auto-upload="false"
        @change="importCountry"
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
            v-model="searchCountryForm.countryName"
            placeholder="请搜索国家名称"
            clearable
            style="width:200px"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="searchCountryForm.countryCode"
            placeholder="请搜索国家代码"
            clearable
            style="width:200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearchCountryClick">搜索</el-button>
          <el-button type="primary" @click="resetCountrySearch"><el-icon><Refresh /></el-icon></el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 国家表格 -->
    <div>
      <el-table :data="countryCurrentPageData" border style="width: 100%;margin-bottom: 20px">
        <el-table-column label="国家名称" min-width="200">
          <template #default="{ row }">
            <span>{{ row.country_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="国家代码" min-width="200">
          <template #default="{ row }">
            <span>{{ row.country_code }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openUpdateCountryDialog(row)">修改</el-button>
            <el-button type="danger" size="small" @click="deleteCountry(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div>
      <SmartPagination
        v-model:current-page="countryPagination.currentPage"
        :server-page-size="countryPagination.serverPageSize"
        :display-page-size="countryPagination.displayPageSize"
        :total="countryPagination.totalItems"
        @load-data="handleCountryLoadData" />
    </div>

    <!-- 创建国家对话框 -->
    <el-dialog title="创建国家" v-model="createDialogVisible" width="40%" @close="closeCreateCountryDialog">
      <el-form label-width="120px">
        <el-form-item label="国家名称">
          <el-input v-model="createCountryForm.countryName" clearable/>
        </el-form-item>
        <el-form-item label="国家代码">
          <el-input v-model="createCountryForm.countryCode" clearable/>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="closeCreateCountryDialog">取消</el-button>
        <el-button type="primary" @click="createCountry">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改国家对话框 -->
    <el-dialog title="修改国家" v-model="updateDialogVisible" width="40%" @close="closeUpdateCountryDialog">
      <el-form label-width="120px">
        <el-form-item label="国家名称">
          <el-input v-model="updateCountryForm.countryName" clearable/>
        </el-form-item>
        <el-form-item label="国家代码">
          <el-input v-model="updateCountryForm.countryCode" clearable/>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="closeUpdateCountryDialog">取消</el-button>
        <el-button type="primary" @click="updateCountry">确定</el-button>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, computed } from "vue";
import { countryApi } from "@/api/dictionary/country.js";
import { errorHandler } from '@/utils/errorHandler.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import SmartPagination from '@/components/SmartPagination.vue'
//======================数据======================
const searchCountryForm = ref({
  countryName: "",
  countryCode: ""
});

const createCountryForm = ref({
  countryName: "",
  countryCode: ""
});

const updateCountryForm = ref({
  countryId: "",
  countryName: "",
  countryCode: ""
});
//======================分页======================
// 国家分页
const countryPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 10,
  serverPageSize: 30,
  totalItems: 0,
  cachedData: new Map()
});
const countryCurrentPageData = computed(() => {
  const displayPageSize = countryPagination.value.displayPageSize  // 10
  const serverPageSize = countryPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((countryPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = countryPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((countryPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleCountryLoadData = async (serverPage) => {
  console.log("国家分页组件计算出的页码：",serverPage);
  if(countryPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  countryPagination.value.serverPage = serverPage
  await searchCountry()

}
const clearCountryCache = () => {
  countryPagination.value.currentPage = 1;
  countryPagination.value.serverPage = 1;
  countryPagination.value.cachedData.clear();
  countryPagination.value.totalItems = 0;
}
//======================功能======================
// 导入国家
const importCountry = async (file) => {
  try {
    console.log("导入国家文件", file.raw);
    const res = await countryApi.importCountry(file.raw)
    if (res.code === 200) {
      ElMessageBox.alert(
        `导入国家成功:
        成功${res.data.success_count}条\n
        失败${res.data.fail_count}条。
        \n如果有数据导入失败，原因可能为：国家名称或国家代码已被创建`,
        '导入结果',
        {
          type: 'success',
          confirmButtonText: '确定'
        }
      )
      console.log("导入国家成功", res);
    } else {
      errorHandler.showError("导入国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("导入国家失败,请重试", error);
  }
}
// 创建国家
const createCountry = async () => {
  try {
    const requestData = {
      country_name: createCountryForm.value.countryName,
      country_code: createCountryForm.value.countryCode
    }
    console.log("创建国家请求数据", requestData);
    const res = await countryApi.createCountry(requestData)
    if (res.code === 200) {
      ElMessage.success('创建国家成功')
      // 将国家数据缓存到当前页
      if(countryPagination.value.cachedData.get(countryPagination.value.serverPage)){
        countryPagination.value.cachedData.get(countryPagination.value.serverPage).unshift({
          country_id: res.data.country_id,
          country_name: createCountryForm.value.countryName,
          country_code: createCountryForm.value.countryCode,
        })
      }else{
        countryPagination.value.cachedData.set(
          countryPagination.value.serverPage,
          [{
            country_id: res.data.country_id,
            country_name: createCountryForm.value.countryName,
            country_code: createCountryForm.value.countryCode,
          }]
        )
      }
      countryPagination.value.totalItems = countryPagination.value.totalItems + 1
      clearCreateCountryForm()
      closeCreateCountryDialog()
      console.log("创建国家成功", res);
      console.log("国家数据缓存", countryPagination.value.cachedData.get(countryPagination.value.serverPage));
    } else {
      errorHandler.showError("创建国家失败,请重试。失败可能原因为：国家名称或国家代码已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("创建国家失败,请重试。失败可能原因为：国家名称或国家代码已被创建", error);
  }
}
// 搜索国家点击事件
const handleSearchCountryClick = () => {
  clearCountryCache()
  searchCountry()
}
// 修改国家
const updateCountry = async () => {
  try {
    const requestData = {
      country_id: updateCountryForm.value.countryId,
      country_name: updateCountryForm.value.countryName,
      country_code: updateCountryForm.value.countryCode
    }
    console.log("修改国家请求数据", requestData);
    const res = await countryApi.updateCountry(requestData)
    if (res.code === 200) {
      ElMessage.success('修改国家成功')
      // 将国家数据缓存到当前页
      if(countryPagination.value.cachedData.get(countryPagination.value.serverPage)){
        countryPagination.value.cachedData.get(countryPagination.value.serverPage).forEach(item => {
          if(item.country_id === updateCountryForm.value.countryId){
            item.country_name = updateCountryForm.value.countryName
            item.country_code = updateCountryForm.value.countryCode
          }
        })
      }
      console.log("修改国家成功", res);
      console.log("国家数据缓存", countryPagination.value.cachedData.get(countryPagination.value.serverPage));
      closeUpdateCountryDialog()
    } else {
      errorHandler.showError("修改国家失败,请重试。失败可能原因为：国家名称或国家代码已被创建", res);
    }
  } catch (error) {
    errorHandler.showError("修改国家失败,请重试。失败可能原因为：国家名称或国家代码已被创建", error);
  }
}
// 搜索国家
const searchCountry = async () => {
  try {
    const requestData = {
      country_name: searchCountryForm.value.countryName,
      country_code: searchCountryForm.value.countryCode,
      page_num: countryPagination.value.serverPage,
      page_size: countryPagination.value.serverPageSize
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      countryPagination.value.totalItems = res.data.total_items
      countryPagination.value.cachedData.set(countryPagination.value.serverPage, res.data.country)
      console.log("搜索国家成功", res);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
// 删除国家
const deleteCountry = async (row) => {
  try {
    const requestData = {
      country_id: row.country_id
    }
    console.log("删除国家请求数据", requestData);
    const res = await countryApi.deleteCountry(requestData)
    if (res.code === 200) {
      ElMessage.success('删除国家成功')
      // 将国家数据从缓存中删除
      const currentData = countryPagination.value.cachedData.get(countryPagination.value.serverPage)
      countryPagination.value.cachedData.set(
        countryPagination.value.serverPage,
        currentData.filter(item => item.country_id !== row.country_id)
      )
      countryPagination.value.totalItems = countryPagination.value.totalItems - 1
      console.log("删除国家成功", res);
      console.log("国家数据缓存", countryPagination.value.cachedData.get(countryPagination.value.serverPage));
    } else {
      errorHandler.showError("删除国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("删除国家失败,请重试", error);
  }
}
// 重置搜索
const resetCountrySearch = () => {
  searchCountryForm.value = {
    countryName: "",
    countryCode: ""
  };
  clearCountryCache()
}

//======================对话框======================
// 对话框显示控制
const createDialogVisible = ref(false);
const updateDialogVisible = ref(false);

// 打开创建对话框
const openCreateDialog = () => {
  createDialogVisible.value = true;
};
// 打开修改对话框
const openUpdateCountryDialog = (row) => {
  updateCountryForm.value = {
    countryId: row.country_id,
    countryName: row.country_name,
    countryCode: row.country_code
  };
  updateDialogVisible.value = true;
};

// 关闭创建对话框
const closeCreateCountryDialog = () => {
  createDialogVisible.value = false;
};
// 清除创建国家表单
const clearCreateCountryForm = () => {
  createCountryForm.value = {
    countryName: "",
    countryCode: ""
  };
};
// 关闭修改对话框
const closeUpdateCountryDialog = () => {
  updateDialogVisible.value = false;
};


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

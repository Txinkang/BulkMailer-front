<template>
  <el-dialog
    title="所属用户变更"
    v-model="dialogVisible" width="60%"
    :close-on-click-modal="false"
    :show-close="false"
    @close="closeDialog">
    <!-- 原用户 -->
    <el-form :model="oldUserSearch" style="display: flex;flex-flow: row wrap;gap: 10px">
      <el-form-item label="原用户：" label-width="100px" prop="user_name">
        <el-input
          v-model="oldUserSearch"
          placeholder="请搜索原用户名称"
          clearable
          style="width: 200px"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
        :disabled="oldUserSearch === ''"
        type="primary"
        @click="searchOldUser">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table style="width: 100%;margin: 0 0 10px 0" border :data="oldUsers" @current-change="handleOldUserSelection" highlight-current-row row-key="user_id">
      <el-table-column width="55">
        <template #default="{row}">
          <el-radio-group v-model="selectedOldUserId" @change="handleOldUserSelection(row)">
            <el-radio :key="row.user_id" :label="row.user_id">&nbsp;</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>

      <el-table-column label="用户名称" min-width="100px">
        <template #default="{row}">
          <span>{{row.user_name}}</span>
        </template>
      </el-table-column>

      <el-table-column label="所属用户" min-width="100px">
        <template #default="{row}">
          <span>{{row.belong_user_name}}</span>
        </template>
      </el-table-column>

      <el-table-column label="登录账号" min-width="150px">
        <template #default="{row}">
          <span>{{row.user_account}}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户邮箱" min-width="150px">
        <template #default="{row}">
          <span>{{row.user_email}}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新用户 -->
    <el-form :model="newUserSearch" style="display: flex;flex-flow: row wrap;gap: 10px">
      <el-form-item label="新用户：" label-width="100px" prop="user_name">
        <el-input
          v-model="newUserSearch"
          placeholder="请搜索新用户名称"
          clearable
          style="width: 200px"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
        :disabled="newUserSearch === ''"
        type="primary"
        @click="searchNewUser">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table style="width: 100%;margin: 0 0 10px 0" border :data="newUsers" @current-change="handleNewUserSelection" highlight-current-row row-key="user_id">
      <el-table-column width="55">
        <template #default="{row}">
          <el-radio-group v-model="selectedNewUserId" @change="handleNewUserSelection(row)">
            <el-radio :key="row.user_id" :label="row.user_id">&nbsp;</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column label="用户名称" min-width="100px">
        <template #default="{row}">
          <span>{{row.user_name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属用户" min-width="100px">
        <template #default="{row}">
          <span>{{row.belong_user_name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录账号" min-width="150px">
        <template #default="{row}">
          <span>{{row.user_account}}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户邮箱" min-width="150px">
        <template #default="{row}">
          <span>{{row.user_email}}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="confirmChange">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { receiverApi } from '@/api/receiver/receiver'
import { errorHandler } from '@/utils/errorHandler'
const props = defineProps({
  modelValue: Boolean,
  active_tab: String,
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const oldUserSearch = ref('')
const newUserSearch = ref('')
const oldUsers = ref([])
const newUsers = ref([])
const selectedOldUserId = ref('')
const selectedNewUserId = ref('')
const selectedOldUser = ref(null)
const selectedNewUser = ref(null)

// 处理原用户选择变化
const handleOldUserSelection = (row) => {
  selectedOldUser.value = row
}

// 处理新用户选择变化
const handleNewUserSelection = (row) => {
  selectedNewUser.value = row
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  oldUserSearch.value = ''
  newUserSearch.value = ''
  oldUsers.value = []
  newUsers.value = []
  selectedOldUser.value = null
  selectedNewUser.value = null
  selectedOldUserId.value = ''
  selectedNewUserId.value = ''
}

// 搜索原用户
const searchOldUser = async () => {
  try {
    const requestData = {
      user_name: oldUserSearch.value,
    }
    console.log('搜索原用户请求数据:', requestData)
    const res = await receiverApi.filterUser(requestData)
    if (res.code === 200) {
      oldUsers.value = res.data.user
      ElMessage.success('搜索原用户成功')
      console.log('搜索原用户成功', res.data)
    } else {
        errorHandler.showError("搜索原用户失败", res)
      }
  } catch (error) {
    errorHandler.showError("搜索原用户失败", error)
  }
}

// 搜索新用户
const searchNewUser = async () => {
  try {
    const requestData = {
      user_name: newUserSearch.value,
    }
    console.log('搜索新用户请求数据:', requestData)
    const res = await receiverApi.filterUser(requestData)
    if (res.code === 200) {
      newUsers.value = res.data.user
      ElMessage.success('搜索新用户成功')
      console.log('搜索新用户成功', res.data)
    } else {
      errorHandler.showError("搜索新用户失败", res)
    }
  } catch (error) {
    errorHandler.showError("搜索新用户失败", error)
  }
}


// 确认更改
const confirmChange = async () => {
  try {
    if (!selectedOldUserId.value) {
      return ElMessage.warning('请选择原用户')
    }
    if (!selectedNewUserId.value) {
      return ElMessage.warning('请选择新用户')
    }
    // TODO: 调用API进行用户变更
    const requestData = {
      old_user_id: selectedOldUserId.value,
      new_user_id: selectedNewUserId.value,
      receiver_type: props.active_tab === 'supplier' ? 1 : 2  //1:供应商 2:接收方
    }
    console.log('确认更改请求数据:', requestData)
    const res = await receiverApi.changeBelongUser(requestData)
    if (res.code === 200) {
      ElMessage.success('所属用户变更成功')
      console.log('所属用户变更成功', res)
      closeDialog()
    } else {
      errorHandler.showError("所属用户变更失败", res)
    }
  } catch (error) {
    errorHandler.showError("所属用户变更失败", error)
  }
}

// 暴露方法供外部调用
defineExpose({
})
</script>

<style>
.el-radio {
  margin-right: 0;
  margin-bottom: 0;
}
</style>

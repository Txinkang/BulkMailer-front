<template>
  <el-dialog
    title="修改用户权限"
    v-model="dialogVisible"
    width="40%"
    destroy-on-close
    @close="closeDialog"
  >
    <el-form label-width="120px">
      <el-form-item label="权限管理:">
        <el-checkbox-group v-model="selectedAuthIds">
          <el-checkbox
            v-for="auth in authForm.all_auth"
            :key="auth.user_auth_id"
            :label="auth.user_auth_name"
            :value="auth.user_auth_id"
          >
            {{ auth.user_auth_name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="角色管理:">
        <el-radio-group v-model="userRole">
          <el-radio label="小管理员" value=3>小管理员</el-radio>
          <el-radio label="个人用户" value=4>个人用户</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="updateUserAuth">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { userApi } from '@/api/user/user.js'
import { ElMessage } from 'element-plus'
import { errorHandler } from '@/utils/errorHandler'

const props = defineProps({
  modelValue: Boolean,
  authForm: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})


const userRole = ref(null)
const selectedAuthIds = ref([])

// 监听对话框的显示状态
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.authForm.user_auth && props.authForm.all_auth) {
      // user_auth 是字符串数组，直接用于比较
      selectedAuthIds.value = props.authForm.all_auth
        .filter(auth => props.authForm.user_auth.includes(auth.user_auth_id))
        .map(auth => auth.user_auth_id)
    }
  }
)


const updateUserAuth = async () => {
  try {
    const requestData = {
      user_id: props.authForm.user_id,
      user_auth_id: selectedAuthIds.value,
      user_role: Number(userRole.value)
    }
    console.log("更新用户权限请求数据", requestData);
    const response = await userApi.updateUserAuth(requestData);
    if (response.code === 200) {
      ElMessage.success("修改用户权限成功");
      console.log("更新用户权限响应数据", response);
      closeDialog();
    }else{
      errorHandler.showError("修改用户权限失败,请重试", response);
    }
  } catch (error) {
    errorHandler.showError("修改用户权限失败,请重试", error);
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  userRole.value = null
  selectedAuthIds.value = []
}


</script>

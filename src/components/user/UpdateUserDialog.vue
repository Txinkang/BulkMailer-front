<template>
  <el-dialog title="修改用户" v-model="dialogVisible" width="50%" destroy-on-close @close="closeDialog">
    <template #title>
      <span style="font-size: 20px;">修改用户</span>
      <span style="font-size: 14px;">
        （只填写需要修改的信息即可，不修改的无需填写）
      </span>
    </template>

    <el-form label-width="150px" :model="form">
      <el-form-item label="用户名称" prop="user_name">
        <el-input v-model="form.user_name" placeholder="请输入用户名称"/>
      </el-form-item>

      <el-form-item label="用户登录账号" prop="user_account">
        <el-input v-model="form.user_account" placeholder="请输入用户登录账号"/>
      </el-form-item>

      <el-form-item label="用户登录密码" prop="user_password">
        <el-input v-model="form.user_password" placeholder="请输入用户登录密码"/>
      </el-form-item>

      <el-form-item label="用户邮箱" prop="user_email">
        <el-input v-model="form.user_email" placeholder="请输入用户邮箱"/>
      </el-form-item>

      <el-form-item label="用户邮箱授权码" prop="user_email_code">
        <el-input v-model="form.user_email_code" placeholder="请输入用户邮箱授权码"/>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="updateUserinfo">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { userApi } from '@/api/user/user.js'
import { ElMessage } from 'element-plus'
import { errorHandler } from '@/utils/errorHandler'

const props = defineProps({
  modelValue: Boolean,
  user_id: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})


const form = ref({
  user_id: props.user_id,
  user_name: '',
  user_account: '',
  user_password: '',
  user_email: '',
  user_email_code: ''
})

const updateUserinfo = async () => {
  try {
    //console.log("更新用户信息", props.user_id);
    const requestData = {
      user_id: props.user_id,
      user_name: form.value.user_name === '' ? null : form.value.user_name,
      user_account: form.value.user_account === '' ? null : form.value.user_account,
      user_password: form.value.user_password === '' ? null : form.value.user_password,
      user_email: form.value.user_email === '' ? null : form.value.user_email,
      user_email_code: form.value.user_email_code === '' ? null : form.value.user_email_code
    }
    console.log("更新用户信息请求数据", requestData)
    const res = await userApi.updateUserinfo(requestData)
    if (res.code === 200) {
      ElMessage.success("更新用户信息成功")
      console.log("更新用户信息成功", res)
      closeDialog()
    } else {
      errorHandler.showError("更新用户信息失败,请重试", res)
    }
  } catch (error) {
    errorHandler.showError("更新用户信息失败,请重试", error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  form.value = {
    user_id: props.user_id,
    user_name: '',
    user_account: '',
    user_password: '',
    user_email: '',
    user_email_code: ''
  }
}


</script>

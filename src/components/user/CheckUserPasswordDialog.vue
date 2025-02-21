<template>
  <el-dialog title="用户详情" v-model="dialogVisible" width="50%" destroy-on-close>
    <el-form label-width="150px">
      <el-form-item label="用户登录密码">
        <el-input v-model="user_info.userPassword" placeholder="用户登录密码" disabled/>
      </el-form-item>

      <el-form-item label="用户邮箱授权码">
        <el-input v-model="user_info.userEmailCode" placeholder="用户邮箱授权码" disabled/>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  user_info: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const user_info = computed(() => props.user_info)



</script>

<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    width="30%"
    destroy-on-close
  >
    <el-form inline>
      <el-form-item v-for="(item, index) in list" :key="index">
        <span>{{ item }}</span>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 对话框标题
  title: {
    type: String,
    default: '详情'
  },
  // 是否显示对话框
  modelValue: {
    type: Boolean,
    required: true
  },
  // 要展示的列表数据
  list: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// 内部状态
const dialogVisible = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

// 监听内部值变化
watch(() => dialogVisible.value, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<template>
  <div>
    <el-tabs>
      <el-tab-pane label="发件方邮件服务器设置">
        <el-form label-width="160px">
          <el-form-item>
            <el-button type="primary">保存</el-button>
          </el-form-item>
          <!-- 群发频率间隔 -->
          <el-form-item label="群发频率间隔">
            <el-input
              placeholder="请输入频率间隔，例如：30秒"
              suffix="秒"
              class="input-item"
            />
            <span>次</span>
          </el-form-item>

          <!-- 单位时间总量上限 -->
          <el-form-item label="单位时间总量上限">
            <el-input
              placeholder="请输入总量上限，例如：100"
              suffix="封"
              class="input-item"
            />
            <span>封</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="收件方邮件服务器设置">
        <el-form label-width="160px">
          <el-form-item>
            <el-button type="primary">保存</el-button>
          </el-form-item>
          <el-form-item label="重发次数">
            <el-input class="input-item" placeholder="请输入重发次数"/>
          </el-form-item>
          <el-form-item label="延迟时间">
            <el-input class="input-item" placeholder="请输入延迟时间（分钟）"/>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 对话框控制
const dialogVisible = ref(false);


// 打开对话框
const openDialog = () => {
  dialogVisible.value = true;
};
</script>

<style scoped>
.input-item {
  width: 300px;
}

.date-picker {
  margin-right: 20px;
}
</style>

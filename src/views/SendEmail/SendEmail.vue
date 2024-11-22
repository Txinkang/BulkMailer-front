<script setup>
  import {ref} from "vue";

  const emailTemplate = ref(0);

</script>

<template>
  <div class="sendEmail">
    <div class="sendEmailContainer">

      <div class="sender">
        <span>
        指定发件人：
        </span>
        <el-button type="primary">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle"> 添加 </span>
        </el-button>
        <span style="opacity: 0.6">
        (不指定就默认当前登录用户发送)
        </span>
      </div>

      <div class="recipient">
        <span>
        指定收件人：
        </span>
        <el-button type="primary">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle"> 添加 </span>
        </el-button>
        <el-button type="primary">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle"> 导入 </span>
        </el-button>
      </div>

      <div class="appendix">
        <span>
        选择附件：
        </span>
        <el-button type="primary">
          <el-icon style="vertical-align: middle">
            <CirclePlus/>
          </el-icon>
          <span style="vertical-align: middle"> 添加 </span>
        </el-button>
      </div>

      <div class="emailTemplate">
        <el-tabs>
          <el-tab-pane label="公共模板">
            <el-radio-group>
              <el-radio value="1">
                空白模板
              </el-radio>
              <el-radio label="">
                商品促销模板
              </el-radio>
              <el-radio label="">
                跟进模板
              </el-radio>
              <el-radio label="">
                节日模板
              </el-radio>
              <el-radio label="">
                生日模板
              </el-radio>
            </el-radio-group>
          </el-tab-pane>
          <el-tab-pane label="个人模板">个人模板</el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sendEmail {
  display: flex;
  flex: 1;
  height: 100%;
}

.sendEmailContainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: 20px;
  font-size: 15px;
}

.sender, .recipient, .appendix {
  margin-bottom: 1em;
  font-size: 1em;
}
</style>

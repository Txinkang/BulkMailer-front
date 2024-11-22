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

      <div class="emailTitle">
        <el-form ref="emailTitleRef" :rules="emailTitleRule">
          <el-form-item label="主题：" prop="emailTitle">
            <el-input
              v-model="emailTitle"
              placeholder="请输入主题"
              size="large"
              style="width: 50em"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="emailTemplate">
        <el-tabs>
          <el-tab-pane label="公共模板">
            <el-radio-group v-model="emailTemplate.emailPublicTemplate">
              <el-radio value="1">
                空白模板
              </el-radio>
              <el-radio value="2">
                商品促销模板
              </el-radio>
              <el-radio value="3">
                跟进模板
              </el-radio>
              <el-radio value="4">
                节日模板
              </el-radio>
              <el-radio value="5">
                生日模板
              </el-radio>
            </el-radio-group>
          </el-tab-pane>
          <el-tab-pane label="个人模板">
            <el-radio-group v-model="emailTemplate.emailPersonalTemplate">
              <el-radio value="1">
                个人模板1
              </el-radio>
              <el-radio value="2">
                个人模板2
              </el-radio>
              <el-radio value="3">
                个人模板3
              </el-radio>
              <el-radio value="4">
                个人模板4
              </el-radio>
              <el-radio value="5">
                个人模板5
              </el-radio>
            </el-radio-group>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="editToolbar">
        <EditToolbar></EditToolbar>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import EditToolbar from "@/components/EditToolbar.vue";

const emailTemplate = reactive({
  "emailPublicTemplate": "1",
  "emailPersonalTemplate": "0",
});

const emailTitle = ref("");
const emailTitleRule = {
  "emailTitle": [{required: true, message: "请输入主题", trigger: "blur"}]
}
</script>

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
  margin-left: 3em;
  font-size: 15px;
}

.sender, .recipient, .appendix, .emailTemplate, editToolbar {
  margin-bottom: 1.5em;
  font-size: 1em;
}

.appendix button {
  margin-left: 1.1em;
}

</style>

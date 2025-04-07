import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from "@/router/index.js";
import ElementPlus, {ElDialog} from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'tinymce/skins/ui/oxide/skin.min.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 设置弹窗全局设置，不允许点击蒙层关闭。
ElDialog.props.closeOnClickModal.default = false;

const app = createApp(App);
const pinia = createPinia()

//引入el-icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')

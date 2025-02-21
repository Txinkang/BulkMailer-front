import {createRouter, createWebHistory} from "vue-router";
import MainLayout from "@/Layout/MainLayout.vue";
import EmailHistory from "@/views/EmailManage/EmailHistory.vue";
import FileManage from "@/views/FileManage/FileManage.vue";
import UserManage from "@/views/UserManage/UserManage.vue";
import CommodityManage from "@/views/Dictionary/CommodityManage.vue";
import SupplierManage from "@/views/ReceiverManage/SupplierManage.vue";
import CustomerManage from "@/views/ReceiverManage/CustomerManage.vue";
import CountryManage from "@/views/Dictionary/CountryManage.vue";
import AreaManage from "@/views/Dictionary/AreaManage.vue";
import TemplateManage from "@/views/EmailManage/TemplateManage.vue";
import ServerConfig from "@/views/ServerConfig/ServerConfig.vue";
import EmailType from "@/views/Dictionary/EmailType.vue";
import TotalReport from "@/views/ReportManage/TotalReport/TotalReport.vue";
import SingleReport from "@/views/ReportManage/SingleReport/SingleReport.vue";
import EmailTask from "@/views/EmailManage/EmailTask.vue";
import Login from "@/views/Login/Login.vue";
import SendEmail from "@/views/SendManage/SendEmail.vue";
import CircleSend from "@/views/SendManage/CircleSend.vue";

const routes = [
  {
    path: "/",
    redirect: "/login", // 根目录自动跳转到 login
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/MainLayout",
    component: MainLayout,
    redirect: "/fileManage", // 默认重定向到 fileManage
    children: [
      // 发送管理
      {path:"/sendEmail", name: "SendEmail", component: SendEmail},
      {path:"/circleSend", name: "CircleSend", component: CircleSend},
      // 文件管理
      {path: "/fileManage", name: "FileManage", component: FileManage},
      // 邮件管理
      {path: "/templateManage", name: "TemplateManage", component: TemplateManage},
      {path: "/emailHistory", name: "EmailHistory", component: EmailHistory},
      {path: "/emailTask", name: "EmailTask", component: EmailTask},
      // 报表管理
      {path: "/totalReport", name: "TotalReport", component: TotalReport},
      {path: "/singleReport", name: "SingleReport", component: SingleReport},
      // 用户管理
      {path: "/userManage", name: "UserManage", component: UserManage},
      // 收件人管理
      {path: "/supplierManage", name: "SupplierManage", component: SupplierManage},
      {path: "/customerManage", name: "CustomerManage", component: CustomerManage},
      // 字典管理
      {path: "/commodityManage", name: "CommodityManage", component: CommodityManage},
      {path: "/countryManage", name: "CountryManage", component: CountryManage},
      {path: "/areaManage", name: "AreaManage", component: AreaManage},
      {path: "/emailType", name: "EmailType", component: EmailType},
      // 服务器配置
      {path: "/serverConfig", name: "ServerConfig", component: ServerConfig},

    ],

  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user_token')
  const expiry = localStorage.getItem('token_expiry')

  // 检查token是否存在且未过期
  const isTokenValid = token && expiry && new Date().getTime() <= parseInt(expiry)

  // 如果访问登录页且已登录，重定向到文件管理页
  if ((to.path === '/login' || to.path === '/') && isTokenValid) {
    next('/fileManage')
    return
  }

  // 如果路由是登录页，直接放行
  if (to.path === '/login' || to.path === '/') {
    next()
    return
  }

  // 如果用户未登录且访问的不是登录页，重定向到登录页
  if (!isTokenValid) {
    next('/login')
    return
  }

  // 用户已登录，允许访问
  next()
})

export default router;

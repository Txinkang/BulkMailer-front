import {createRouter, createWebHistory} from "vue-router";
import MainLayout from "@/Layout/MainLayout.vue";
import EmailHistory from "@/views/EmailHistory/EmailHistory.vue";
import FileManage from "@/views/FileManage/FileManage.vue";
import CompanyManage from "@/views/CompanyManage/CompanyManage.vue";
import SectorManage from "@/views/SectorManage/SectorManage.vue";
import UserManage from "@/views/UserManage/UserManage.vue";
import CommodityManage from "@/views/CommodityManage/CommodityManage.vue";
import SupplierManage from "@/views/SupplierManage/SupplierManage.vue";
import CustomerManage from "@/views/CustomerManage/CustomerManage.vue";
import JobManage from "@/views/JobManage/JobManage.vue";
import CountryManage from "@/views/CountryManage/CountryManage.vue";
import AreaManage from "@/views/AreaManage/AreaManage.vue";
import TemplateManage from "@/views/TemplateManage/TemplateManage.vue";
import ServerConfig from "@/views/ServerConfig/ServerConfig.vue";
import EmailType from "@/views/EmailType/EmailType.vue";
import TotalReport from "@/views/ReportManage/TotalReport/TotalReport.vue";
import SingleReport from "@/views/ReportManage/SingleReport/SingleReport.vue";
import EmailTask from "@/views/EmailTaskManage/EmailTask.vue";
import Login from "@/views/Login/Login.vue";

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
      {path: "/templateManage", name: "TemplateManage", component: TemplateManage},
      {path: "/fileManage", name: "FileManage", component: FileManage},
      {path: "/emailHistory", name: "EmailHistory", component: EmailHistory},
      {path: "/emailTask", name: "EmailTask", component: EmailTask},
      {path: "/companyManage", name: "CompanyManage", component: CompanyManage},
      {path: "/sectorManage", name: "SectorManage", component: SectorManage},
      {path: "/jobManage", name: "JobManage", component: JobManage},
      {path: "/userManage", name: "UserManage", component: UserManage},
      {path: "/commodityManage", name: "CommodityManage", component: CommodityManage},
      {path: "/supplierManage", name: "SupplierManage", component: SupplierManage},
      {path: "/customerManage", name: "CustomerManage", component: CustomerManage},
      {path: "/countryManage", name: "CountryManage", component: CountryManage},
      {path: "/areaManage", name: "AreaManage", component: AreaManage},
      {path: "/serverConfig", name: "ServerConfig", component: ServerConfig},
      {path: "/emailType", name: "EmailType", component: EmailType},
      {path: "/totalReport", name: "TotalReport", component: TotalReport},
      {path: "/singleReport", name: "SingleReport", component: SingleReport},
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

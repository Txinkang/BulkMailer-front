import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login/Login.vue";
import MainLayout from "@/Layout/MainLayout.vue";
import SendEmail from "@/views/SendEmail/SendEmail.vue";
import EmailHistory from "@/views/EmailHistory/EmailHistory.vue";
import AutoEmail from "@/views/AutoEmail/AutoEmail.vue";
import FileManage from "@/views/FileManage/FileManage.vue";
import CompanyManage from "@/views/CompanyManage/CompanyManage.vue";
import SectorManage from "@/views/SectorManage/SectorManage.vue";
import UserManage from "@/views/UserManage/UserManage.vue";
import CommodityManage from "@/views/CommodityManage/CommodityManage.vue";
import SupplierManage from "@/views/SupplierManage/SupplierManage.vue";
import CustomerManage from "@/views/CustomerManage/CustomerManage.vue";

const routes = [
  {path: "/", name: "Login", component: Login},
  {
    path: "/MainLayout",
    component: MainLayout,
    children: [
      {path:"/sendEmail", name: "SendEmail", component: SendEmail},
      {path:"/autoEmail", name: "AutoEmail", component: AutoEmail},
      {path:"/fileManage", name: "FileManage", component: FileManage},
      {path:"/emailHistory", name: "EmailHistory", component: EmailHistory},
      {path:"/companyManage", name: "CompanyManage", component: CompanyManage},
      {path:"/sectorManage", name: "SectorManage", component: SectorManage},
      {path:"/userManage", name: "UserManage", component: UserManage},
      {path:"/commodityManage", name: "CommodityManage", component: CommodityManage},
      {path:"/supplierManage", name: "SupplierManage", component: SupplierManage},
      {path:"/customerManage", name: "CustomerManage", component: CustomerManage},
    ],
    redirect: "/sendEmail" //默认进入发送邮件页面
  },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

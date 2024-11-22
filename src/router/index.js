import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login/Login.vue";
import MainLayout from "@/Layout/MainLayout.vue";
import SendEmail from "@/views/SendEmail/SendEmail.vue";
import UploadFile from "@/views/UploadFile/UploadFile.vue";
import EmailHistory from "@/views/EmailHistory/EmailHistory.vue";
import AutoEmail from "@/views/AutoEmail/AutoEmail.vue";

const routes = [
  {path: "/", name: "Login", component: Login},
  {
    path: "/MainLayout",
    component: MainLayout,
    children: [
      {path:"/sendEmail", name: "SendEmail", component: SendEmail},
      {path:"/autoEmail", name: "AutoEmail", component: AutoEmail},
      {path:"/uploadFile", name: "UploadFile", component: UploadFile},
      {path:"/emailHistory", name: "EmailHistory", component: EmailHistory},
    ],
    redirect: "/sendEmail" //默认进入发送邮件页面
  },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

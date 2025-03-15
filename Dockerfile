# 使用 Nginx 作为基础镜像
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/nginx:1.18.0

# 安装 envsubst 工具
RUN apt-get update && apt-get install -y gettext && rm -rf /var/lib/apt/lists/*

# 将 dist 文件夹复制到 Nginx 的静态文件目录
COPY dist /usr/share/nginx/html

# 复制 Nginx 配置文件模板
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# 复制启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

# 暴露 80 端口
EXPOSE 80

# 启动容器时运行脚本
CMD ["/start.sh"]
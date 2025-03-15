#!/bin/sh

# 使用 envsubst 替换环境变量并生成 Nginx 配置文件
envsubst '${API_BASE_URL} ${ATTACHMENT_BASE_URL} ${IMG_BASE_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 启动 Nginx
exec nginx -g 'daemon off;'
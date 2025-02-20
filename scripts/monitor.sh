#!/bin/bash

# 检查 Docker 容器状态并重启
CONTAINER_NAME="daily-watch"

check_and_restart() {
    # 检查容器是否存在且运行
    if ! sudo docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Container $CONTAINER_NAME is not running, attempting to restart..."
        
        # 如果容器存在但停止了，先删除
        if sudo docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
            sudo docker rm -f $CONTAINER_NAME
        fi
        
        # 重新启动容器
        cd $(dirname "$0")/..
        sudo docker build -t daily-watch-sre .
        sudo docker run -d -p 8080:8080 \
            -v "$(pwd)/app/data:/app/app/data" \
            -e DASHSCOPE_API_KEY=${DASHSCOPE_API_KEY:-""} \
            --name $CONTAINER_NAME \
            daily-watch-sre
        
        # 确保数据目录权限正确
        sudo chown -R $(id -u):$(id -g) app/data
        
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Container restart completed"
    fi
}

# 执行检查
check_and_restart
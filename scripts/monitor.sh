#!/bin/bash

# 检查 Docker 容器状态并重启
CONTAINER_NAME="daily-watch"

check_and_restart() {
    # 检查容器是否存在且运行，并且在本地有镜像
    if ! sudo docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Container $CONTAINER_NAME is not running, attempting to restart..."

        # 如果容器存在但停止了，先删除
        if sudo docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
            sudo docker rm -f $CONTAINER_NAME
        fi

        # 检查镜像是否存在
        if ! docker images -a --name daily-watch-sre && \$(ls -d | grep daily-watch-sre) 2>/dev/null; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Container $CONTAINER_NAME does not have a valid image, attempting to rebuild..."

            # 重新启动新构建的容器
            cd $(dirname "$0")/..
            sudo docker build -t daily-watch-sre .
            if [ $? -ne 0 ]; then
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] Building container failed with exit code $?"
                exit 1
            fi

            # 重新启动容器
            sudo docker run -d -p 8080:8080 \
                -v "$(pwd)/app/data:/app/app/data" \
                -e DASHSCOPE_API_KEY=sk-7c92805c60294810977a61b0e649dd00 \
                --name $CONTAINER_NAME \
                daily-watch-sre
        fi

        # 确保数据目录权限正确
        sudo chown -R $(id -u):$(id -g) app/data
    fi
}

# 执行检查
check_and_restart

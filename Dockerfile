# 使用 Python 3.8 基础镜像
FROM python:3.8-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV FLASK_APP=run.py
ENV FLASK_DEBUG=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_PROGRESS_BAR=off
ENV DASHSCOPE_API_KEY=""

# 复制配置文件
COPY config.py /app/config.py
COPY .env* .

# 如果存在 .env 文件则导入环境变量
RUN if [ -f .env ]; then export $(cat .env | xargs); fi

# 复制其他项目文件
COPY requirements.txt .
COPY app/ ./app/
COPY run.py .

# 安装 Python 依赖
RUN pip install --no-cache-dir --progress-bar off -r requirements.txt

# 创建数据目录并初始化数据文件
RUN mkdir -p app/data && \
    echo "[]" > app/data/articles.json && \
    chmod -R 777 /app

# 暴露端口
EXPOSE 8080

# 安装时区数据包并设置时区
RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "run:app"]
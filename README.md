Daily Watch SRE&AI
=====================================

一个优雅的微信文章收藏与阅读工具，专注于 SRE（站点可靠性工程）与 AI 领域的技术文章管理。集成通义千问 AI 总结功能，支持文章自动备份和服务监控。

功能特点
-------------------

* 📱 内容管理
    - 提供清爽的阅读界面，去除广告和冗余元素
    - 三栏布局：文章列表、阅读区、AI总结区
    - 按日期智能分组，支持折叠/展开管理

* 🤖 AI 能力
    - 通义千问驱动的文章智能总结
    - 实时生成文章要点
    - 关键信息速览

* 🛡️ 运维特性
    - Docker 容器化部署
    - 服务状态自动监控
    - 数据自动备份与恢复
    - 支持本地部署和容器化部署

技术栈
-------------------

* 后端: Python + Flask
* 前端: HTML5 + CSS3 + JavaScript
* AI: 通义千问 API
* 数据存储: JSON 文件存储
* 部署方式: Docker 容器化

部署方式
-------------------

方式一：Docker 部署（推荐）
-------------------

1. 环境准备
   - Docker Engine
   - 通义千问 API Key

2. 快速启动
### 克隆仓库
```
git clone https://github.com/liu-kaining/daily_watch_sre.git
cd daily_watch_sre
```

### 创建必要目录
```
mkdir -p app/data backups
echo "[]" > app/data/articles.json
```
###  构建并运行
```
docker build -t daily-watch-sre .
docker run -d \
    -p 8080:8080 \
    -v "$(pwd)/app/data:/app/app/data" \
    -e DASHSCOPE_API_KEY=your_api_key_here \
    --name daily-watch \
    daily-watch-sre
```
###  设置自动化脚本（可选）
```
chmod +x scripts/*.sh
./scripts/install_cron.sh
```

方式二：本地部署
-------------------

1. 环境要求
   - Python 3.8+
   - pip 20.0+
   - 通义千问 API Key

2. 安装步骤
###  克隆仓库
```
git clone https://github.com/liu-kaining/daily_watch_sre.git
cd daily_watch_sre
```
###  创建虚拟环境
```
python -m venv venv
source venv/bin/activate  # Linux/Mac
 或
.\venv\Scripts\activate  # Windows
```
###  安装依赖
```
pip install -r requirements.txt
```
###  初始化数据目录
```
mkdir -p app/data backups
echo "[]" > app/data/articles.json
```
###  设置环境变量
```
export DASHSCOPE_API_KEY=your_api_key_here  # Linux/Mac
 或
set DASHSCOPE_API_KEY=your_api_key_here     # Windows
```
###  运行应用
```
python run.py
```
访问应用
-------------------
浏览器访问 http://localhost:8080

运维管理
-------------------

容器管理命令：
# 查看状态
docker ps
docker logs daily-watch

# 重启服务
docker restart daily-watch

# 停止和删除
docker stop daily-watch
docker rm daily-watch

数据管理命令：
# 手动备份
./scripts/backup_data.sh

# 数据恢复
./scripts/restore_data.sh

项目结构
-------------------
daily_watch_sre/
├── app/                    # 应用主目录
│   ├── __init__.py        # 应用初始化
│   ├── routes.py          # 路由控制
│   ├── services/          # 服务层
│   │   ├── __init__.py
│   │   └── ai_service.py  # AI 服务
│   ├── models/            # 数据模型
│   │   ├── __init__.py
│   │   └── article.py     # 文章模型
│   ├── static/            # 静态资源
│   │   ├── css/          # 样式文件
│   │   └── js/           # JavaScript文件
│   ├── templates/         # 模板文件
│   │   ├── base.html     # 基础模板
│   │   └── article.html  # 文章页面
│   └── data/             # 数据存储
│       ├── articles.json  # 文章数据
│       └── summaries.json # AI总结数据
├── scripts/               # 运维脚本
│   ├── monitor.sh        # 容器监控脚本
│   ├── backup_data.sh    # 数据备份脚本
│   ├── restore_data.sh   # 数据恢复脚本
│   └── install_cron.sh   # 定时任务安装脚本
├── backups/              # 备份目录
├── requirements.txt      # 依赖清单
├── Dockerfile           # 容器构建文件
└── README.md            # 项目说明

使用说明
-------------------

1. 添加文章：
   - 点击左上角的"添加文章"按钮
   - 在弹出的对话框中粘贴文章链接
   - 系统会自动抓取文章内容并生成 AI 总结

2. 阅读文章：
   - 左侧列表：按日期分组的文章列表
   - 中间区域：文章正文阅读区
   - 右侧区域：AI 生成的文章总结

3. 数据管理：
   - 系统每 5 分钟自动检查服务状态
   - 自动备份重要数据文件
   - 支持数据快速恢复

注意事项
-------------------

1. 首次部署前必须配置有效的通义千问 API Key
2. 确保 app/data 和 backups 目录有正确的读写权限
3. 定时任务需要 root 权限执行
4. 建议定期检查备份文件的完整性

更新日志
-------------------

v1.1.0 (2024-02-20)
- 添加通义千问 AI 总结功能
- 实现自动备份和监控
- 优化三栏布局显示

v1.0.0 (2024-02-16)
- 初始版本发布
- 支持基础的文章保存和阅读功能
- 实现日期分组和分页功能

许可证
-------------------

本项目采用 MIT 许可证

作者
-------------------

liqian_liukaining
GitHub: @liu-kaining
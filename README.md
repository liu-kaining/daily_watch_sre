Daily Watch SRE&AI
=====================================

一个优雅的微信文章收藏与阅读工具，专注于 SRE（站点可靠性工程）与 AI 领域的技术文章管理。

[图片预览]

功能特点
-------------------

* 🚀 一键保存
    支持一键保存微信公众号文章，自动提取标题和来源

* 📱 优雅阅读
    提供清爽的阅读界面，去除广告和冗余元素

* 📅 日期分组
    按日期智能分组文章，支持折叠/展开管理

* 🔄 分页浏览
    采用日期分组分页，提供流畅的浏览体验

* 🎨 响应式设计
    现代化的 UI 设计，提供流畅的交互体验

* 🖼️ 图片代理
    智能处理微信图片，确保图片正常显示

* 🔍 重复检测
    智能检测重复文章，避免重复收藏


技术栈
-------------------

* 后端: Python + Flask
* 前端: HTML5 + CSS3 + JavaScript
* 数据存储: JSON 文件存储
* 部署: 支持 Docker 部署（开发中）


环境要求
-------------------

* Python 3.8+
* pip 20.0+
* 现代浏览器（Chrome、Firefox、Safari、Edge 等）


快速开始
-------------------

1. 克隆仓库
```
    git clone https://github.com/liu-kaining/daily_watch_sre.git
    cd daily_watch_sre
```
2. 创建虚拟环境
```
    python -m venv venv
    source venv/bin/activate  # Linux/Mac
    # 或
    .\venv\Scripts\activate  # Windows
```
3. 安装依赖
```
pip install -r requirements.txt
```

4. 初始化数据目录
```
    mkdir -p app/data
    touch app/data/articles.json
    echo "[]" > app/data/articles.json
```
5. 运行应用
    python run.py

6. 访问应用
    浏览器访问 http://localhost:5000


项目结构
-------------------

    daily_watch_sre/
    ├── app/                    # 应用主目录
    │   ├── __init__.py        # 应用初始化
    │   ├── routes/            # 路由控制
    │   │   ├── __init__.py
    │   │   └── views.py       # 视图函数
    │   ├── models/            # 数据模型
    │   │   ├── __init__.py
    │   │   └── article.py     # 文章模型
    │   ├── static/            # 静态资源
    │   │   ├── css/          # 样式文件
    │   │   └── js/           # JavaScript文件
    │   ├── templates/         # 模板文件
    │   │   ├── base.html     # 基础模板
    │   │   └── index.html    # 主页模板
    │   └── data/             # 数据存储
    │       └── articles.json  # 文章数据
    ├── docs/                  # 文档
    ├── requirements.txt       # 依赖清单
    ├── run.py                # 启动脚本
    └── README.md             # 项目说明


使用说明
-------------------

添加文章：
1. 打开微信公众号文章，复制文章链接
2. 在应用的输入框中粘贴链接
3. 点击"添加文章"按钮
4. 文章会自动保存并显示在左侧列表中

阅读文章：
1. 在左侧列表中点击文章标题
2. 文章内容会在右侧区域显示
3. 支持图片正常显示和阅读

管理文章：
1. 文章按照保存日期自动分组
2. 点击日期组标题可以折叠/展开该组文章
3. 使用底部分页导航浏览更多文章


开发计划
-------------------

* [ ] 添加文章标签功能
* [ ] 支持文章搜索
* [ ] 添加文章归档功能
* [ ] 支持导出/导入数据
* [ ] 添加 Docker 支持
* [ ] 支持多用户管理


常见问题
-------------------

Q: 为什么有些图片无法显示？
A: 由于微信图片链接的有效期限制，建议及时阅读保存的文章。

Q: 如何备份文章数据？
A: 手动备份 app/data/articles.json 文件即可。

Q: 支持导入历史文章吗？
A: 目前可以手动编辑 articles.json 文件来导入，后续会添加导入功能。

Q: 如何管理 Python 虚拟环境？
A: 以下是常用的虚拟环境命令：
   * 创建虚拟环境：python -m venv venv
   * 激活虚拟环境：
     - Linux/Mac：source venv/bin/activate
     - Windows：.\venv\Scripts\activate
   * 查看当前 Python 环境：which python
   * 查看已安装的包：pip list
   * 查看环境详情：pip freeze
   * 退出虚拟环境：deactivate

Q: 虚拟环境有什么用？
A: 虚拟环境可以：
   * 隔离项目依赖，避免包版本冲突
   * 确保开发环境的一致性
   * 方便项目部署和迁移
   * 便于管理不同项目的依赖

更新日志
-------------------

v1.0.0 (2025-02-16)
- 初始版本发布
- 支持基础的文章保存和阅读功能
- 实现日期分组和分页功能
- 添加图片代理支持


许可证
-------------------

本项目采用 MIT 许可证


作者
-------------------

liqian_liukaining

GitHub: @liu-kaining

感谢所有为本项目提供建议和帮助的朋友们。
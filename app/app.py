# ... 其他导入保持不变 ...
from .routes import article, summary  # 确保导入 summary

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # 注册所有路由
    app.register_blueprint(article.bp)
    app.register_blueprint(summary.bp)  # 确保这行代码存在
    
    return app
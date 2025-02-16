"""
Author: liqian_liukaining
Date: 2025-02-16
"""
from flask import Flask
from config import Config

def create_app(config_class=Config):
    from flask import Flask
    
    app = Flask(__name__)
    
    from app import routes
    
    app.config.from_object(config_class)

    # 确保在这里导入蓝图
    from app.routes import main
    app.register_blueprint(main)

    return app
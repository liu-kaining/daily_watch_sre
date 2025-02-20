"""
Author: liqian_liukaining
Date: 2025-02-16
"""
from flask import Flask
from config import Config

def create_app():
    app = Flask(__name__)
    
    from .routes import main
    app.register_blueprint(main)
    
    return app
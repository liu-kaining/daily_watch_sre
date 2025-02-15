"""
Author: liqian_liukaining
Date: 2025-02-16
"""
from flask import render_template
from app.routes import main

@main.route('/')
def index():
    return render_template('index.html')
```
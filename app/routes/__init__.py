"""
Author: liqian_liukaining
Date: 2025-02-16
"""
from flask import Blueprint

main = Blueprint('main', __name__)

from . import views
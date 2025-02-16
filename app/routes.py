# 删除这段不需要的路由代码
# @app.route('/guide')
# def guide():
#     return render_template('guide.html')

from flask import jsonify
from app.models.article import Article

@app.route('/get_article_count')
def get_article_count():
    count = Article.get_total_count()
    return jsonify({'count': count})

from flask import jsonify, render_template, request
from app.models.article import Article
import json

@app.route('/api/stats/articles', methods=['GET'])
def get_article_stats():
    try:
        with open(Article.ARTICLES_FILE, 'r', encoding='utf-8') as f:
            articles = json.load(f)
            return jsonify({
                'success': True,
                'data': {
                    'total': len(articles)
                }
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    articles_data = Article.load_from_file(page=page)
    return render_template('index.html', **articles_data)
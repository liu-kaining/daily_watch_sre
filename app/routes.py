from flask import Blueprint, jsonify, render_template, request, url_for, redirect
from app.models.article import Article
from app.services.ai_service import AIService
import json

# 创建蓝图，指定 url_prefix 为空，保持原有的 URL 结构
bp = Blueprint('main', __name__, url_prefix='')

# 移除全局 AI 服务初始化
# ai_service = AIService()

@bp.route('/api/summarize', methods=['POST'])
def summarize_article():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'message': '缺少文章 URL'
            }), 400

        # 获取文章内容
        article_content = Article.get_article_content(data['url'])
        if not article_content:
            return jsonify({
                'success': False,
                'message': '无法获取文章内容'
            }), 404

        # 在需要时初始化 AI 服务
        ai_service = AIService()
        # 生成总结
        result = ai_service.generate_summary(article_content)
        return jsonify(result)

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'处理请求时发生错误: {str(e)}'
        }), 500

@bp.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    articles_data = Article.load_from_file(page=page)
    return render_template('index.html', **articles_data)

@bp.route('/article/<path:url>')
def article(url):
    # 获取当前文章数据
    article_data = None
    groups = []
    
    try:
        with open('app/data/articles.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            groups = data.get('groups', [])
            # 查找当前文章
            for group in groups:
                for article in group['articles']:
                    if article['url'] == url:
                        article_data = article
                        break
                if article_data:
                    break
    except Exception as e:
        print(f"Error loading article data: {e}")
    
    return render_template('article.html', 
                         url=url,
                         title=article_data['title'] if article_data else '',
                         article=article_data,
                         groups=groups)

@bp.route('/views/<path:url>')
def views(url):
    """获取文章内容"""
    try:
        # 处理微信文章 URL
        if 'mp.weixin.qq.com' in url:
            # 使用完整的微信文章 URL
            full_url = f'https://mp.weixin.qq.com/s/{url}' if not url.startswith('http') else url
        else:
            full_url = url
            
        content = Article.get_article_content(full_url)
        if not content:
            return '无法获取文章内容', 404
        return content
    except Exception as e:
        print(f"Error getting article content: {e}")
        return '获取文章内容失败', 500

@bp.route('/get_article_count')
def get_article_count():
    count = Article.get_total_count()
    return jsonify({'count': count})

@bp.route('/api/stats/articles', methods=['GET'])
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
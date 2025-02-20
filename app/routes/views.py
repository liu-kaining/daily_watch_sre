"""
Author: liqian_liukaining
Date: 2025-02-16
"""
from flask import render_template, request, jsonify, redirect, url_for, Response
from app.routes import main
from app.models.article import Article
from app.services.ai_service import AIService
from app.config.settings import verify_token
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import urllib.parse
from pathlib import Path

# 添加总结文件路径
SUMMARIES_FILE = Path(__file__).parent.parent / 'data' / 'summaries.json'

# 添加辅助函数
def load_summaries():
    if not SUMMARIES_FILE.exists():
        with open(SUMMARIES_FILE, 'w', encoding='utf-8') as f:
            json.dump({'summaries': {}}, f, ensure_ascii=False, indent=4)
        return {}
    with open(SUMMARIES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f).get('summaries', {})

def save_summaries(summaries):
    with open(SUMMARIES_FILE, 'w', encoding='utf-8') as f:
        json.dump({'summaries': summaries}, f, ensure_ascii=False, indent=4)

@main.route('/guide')
def guide():
    """指南页面：显示网站使用说明"""
    return render_template('guide.html')

@main.route('/api/stats/articles', methods=['GET'])
def get_article_stats():
    """API接口：获取文章统计信息，返回文章总数"""
    try:
        count = Article.get_total_count()
        return jsonify({
            'success': True,
            'data': {
                'total': count
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main.route('/')
def index():
    """首页：显示文章列表，支持分页"""
    page = request.args.get('page', 1, type=int)
    articles_data = Article.load_from_file(page=page)
    return render_template('index.html', **articles_data)

@main.route('/search')
def search():
    query = request.args.get('q', '').lower()
    if not query:
        return redirect(url_for('main.index'))
        
    try:
        with open(Article.ARTICLES_FILE, 'r', encoding='utf-8') as f:
            articles = json.load(f)
            
        # 模糊搜索
        results = []
        for article in articles:
            if (query in article['title'].lower() or 
                query in article['source'].lower()):
                results.append(article)
        
        # 按日期分组
        groups = {}
        for article in results:
            date = article['created_at'].split()[0]
            if date not in groups:
                groups[date] = []
            groups[date].append(article)
        
        # 转换为列表并排序
        groups = [{'date': date, 'articles': articles} 
                 for date, articles in groups.items()]
        groups.sort(key=lambda x: x['date'], reverse=True)
        
        return render_template('index.html', 
                             groups=groups,
                             current_page=1,
                             total_pages=1,
                             query=query)
                             
    except Exception as e:
        return redirect(url_for('main.index'))

@main.route('/api/summarize', methods=['POST'])
def summarize_article():
    """API接口：使用AI生成文章摘要"""
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            print("Debug: Missing URL in request data")
            return jsonify({
                'success': False,
                'message': '缺少文章 URL'
            }), 400

        # 获取文章内容 - 修改这里的方法名
        article_content = Article.get_content_by_url(data['url'])
        if not article_content:
            print(f"Debug: Failed to get content for URL: {data['url']}")
            return jsonify({
                'success': False,
                'message': '无法获取文章内容'
            }), 404

        # 在需要时初始化 AI 服务
        ai_service = AIService()
        # 生成总结
        result = ai_service.generate_summary(article_content)
        
        # 确保返回格式正确
        if not isinstance(result, dict):
            result = {
                'success': True,
                'data': {
                    'summary': result
                }
            }
            
        return jsonify(result)

    except ValueError as e:
        print(f"Debug: ValueError in summarize_article: {str(e)}")  # 添加调试日志
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    except Exception as e:
        print(f"Debug: Error in summarize_article: {str(e)}")  # 添加调试日志
        return jsonify({
            'success': False,
            'message': f'处理请求时发生错误: {str(e)}'
        }), 500

@main.route('/article/<path:url>')
def article(url):
    """文章详情页：显示单篇文章的完整信息"""
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

@main.route('/add_url', methods=['POST'])
def add_url():
    """API接口：添加新文章，需要验证token"""
    url = request.form.get('url')
    token = request.form.get('token')

    if not verify_token(token):
        return jsonify({
            'success': False,
            'message': '口令验证失败，请联系管理员获取正确的口令'
        })

    try:
        # 读取现有文章
        with open('app/data/articles.json', 'r', encoding='utf-8') as f:
            articles = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        articles = []

    # 检查重复
    is_dup, msg = Article.is_duplicate(articles, url)
    if is_dup:
        return jsonify({
            'success': False,
            'message': msg
        })

    try:
        # 创建新文章对象并获取信息
        new_article = Article(url)
        article_data = {
            'url': new_article.url,
            'title': new_article.title or '获取中...',
            'source': new_article.source or '获取中...',
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        # 添加新文章
        articles.append(article_data)

        # 保存更新后的文章列表
        with open('app/data/articles.json', 'w', encoding='utf-8') as f:
            json.dump(articles, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'添加文章失败：{str(e)}'
        })

@main.route('/views/<path:url>')
@main.route('/get_content')
def views(url=None):
    """文章内容页：获取并处理文章的HTML内容"""
    try:
        # 从不同来源获取 URL
        if url is None:
            url = request.args.get('url')
            if not url:
                return '缺少文章 URL', 400

        # 处理微信文章 URL
        if 'mp.weixin.qq.com' in url:
            if not url.startswith('http'):
                if url.startswith('s/'):
                    url = f'https://mp.weixin.qq.com/{url}'
                else:
                    url = f'https://mp.weixin.qq.com/s/{url}'
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://mp.weixin.qq.com/'
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 移除评论和二维码相关的元素
        for elem in soup.find_all(['script', 'div'], class_=lambda x: x and ('comment' in x.lower() or 'qr_code' in x.lower() if x else False)):
            elem.decompose()
            
        # 移除二维码相关的链接
        for link in soup.find_all('link', href=lambda x: x and 'qrcode' in x.lower() if x else False):
            link.decompose()
            
        # 处理所有图片链接
        for img in soup.find_all('img'):
            if img.get('data-src'):
                img['src'] = f"/proxy_image?url={img['data-src']}"
                img['data-src'] = img['src']
            elif img.get('src'):
                img['src'] = f"/proxy_image?url={img['src']}"

        # 添加必要的样式
        style_tag = soup.new_tag('style')
        style_tag.string = '''
            body {
                margin: 0;
                padding: 20px;
            }
            img {
                max-width: 100%;
                height: auto;
                margin: 10px auto;
            }
            #js_content {
                padding: 20px;
                max-width: 100%;
            }
        '''
        if soup.head:
            soup.head.append(style_tag)
        else:
            soup.body.insert(0, style_tag)

        return str(soup)
    except Exception as e:
        print(f"Error getting article content: {e}")
        return '获取文章内容失败', 500

@main.route('/proxy_image')
def proxy_image():
    image_url = request.args.get('url')
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://mp.weixin.qq.com/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
        }
        response = requests.get(image_url, headers=headers, timeout=10)
        return Response(
            response.content, 
            content_type=response.headers.get('content-type', 'image/jpeg'),
            headers={
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*'
            }
        )
    except Exception as e:
        return ''

@main.route('/api/article/summary', methods=['GET'])
def get_summary():
    """获取文章总结"""
    url = request.args.get('url')
    if not url:
        return jsonify({'success': False, 'message': '缺少URL参数'})
    
    summaries = load_summaries()
    return jsonify({
        'success': True,
        'exists': url in summaries,
        'summary': summaries.get(url)
    })

@main.route('/api/article/summary', methods=['POST'])
def save_summary():
    """保存文章总结"""
    data = request.get_json()
    url = data.get('url')
    summary = data.get('summary')
    
    if not url or not summary:
        return jsonify({'success': False, 'message': '缺少必要参数'})
    
    summaries = load_summaries()
    summaries[url] = summary
    save_summaries(summaries)
    
    return jsonify({'success': True})

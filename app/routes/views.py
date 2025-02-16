"""
Author: liqian_liukaining
Date: 2025-02-16
"""
from flask import render_template, request, jsonify, redirect, url_for, Response
from app.routes import main
from app.models.article import Article
from app.config.settings import verify_token  # 添加这行导入
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import re

@main.route('/guide')
def guide():
    return render_template('guide.html')

@main.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    load_url = request.args.get('load')
    articles_data = Article.load_from_file(page=page)
    return render_template('index.html', 
                         load_url=load_url,
                         **articles_data)

@main.route('/add_url', methods=['POST'])
def add_url():
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

@main.route('/get_content')
def get_content():
    url = request.args.get('url')
    try:
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
        return "无法加载文章内容"

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

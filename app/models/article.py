"""
Author: liqian_liukaining
Date: 2025-02-16
"""
import json
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs
from itertools import groupby
from operator import itemgetter

class Article:
    def __init__(self, url, title=None, source=None, created_at=None):
        self.url = self._normalize_url(url)
        self.title = title
        self.source = source
        self.created_at = created_at or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if not title or not source:
            self._fetch_article_info()

    @staticmethod
    def _normalize_url(url):
        """标准化URL，移除不必要的参数"""
        parsed = urlparse(url)
        # 对于微信文章，只保留路径和必要参数
        if 'mp.weixin.qq.com' in parsed.netloc:
            query_params = parse_qs(parsed.query)
            # 只保留文章ID参数（s）
            if 's' in query_params:
                return f"{parsed.scheme}://{parsed.netloc}{parsed.path}?s={query_params['s'][0]}"
        return url

    def _fetch_article_info(self):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://mp.weixin.qq.com/'
            }
            response = requests.get(self.url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            title_tag = soup.find('h1', class_='rich_media_title')
            if title_tag:
                self.title = title_tag.get_text().strip()
            
            source_tag = soup.find('a', class_='wx_tap_link')
            if source_tag:
                self.source = source_tag.get_text().strip()
            else:
                source_tag = soup.find('a', id='js_name')
                self.source = source_tag.get_text().strip() if source_tag else "未知来源"
                
        except Exception as e:
            self.title = self.url
            self.source = "获取失败"

    @staticmethod
    def is_duplicate(articles, new_url):
        """检查文章是否重复"""
        normalized_new_url = Article._normalize_url(new_url)
        for article in articles:
            if Article._normalize_url(article.get('url', '')) == normalized_new_url:
                return True, "该文章已经存在"
        return False, None

    @staticmethod
    def save_to_file(articles, filename='articles.json'):
        data = [{
            'url': a.url,
            'title': a.title,
            'source': a.source,
            'created_at': a.created_at
        } for a in articles]
        with open(f'app/data/{filename}', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @staticmethod
    def load_from_file(filename='articles.json', page=1, per_page=5):
        try:
            with open(f'app/data/{filename}', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 处理旧数据，确保所有文章都有 created_at 字段
            for article in data:
                if 'created_at' not in article:
                    # 如果没有 created_at，尝试使用 date 字段
                    article['created_at'] = article.get('date', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            
            # 按创建时间倒序排序，使用 get 方法防止键错误
            data.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            # 按日期分组
            groups = {}
            for article in data:
                date = article['created_at'][:10]  # 只取日期部分
                if date not in groups:
                    groups[date] = []
                groups[date].append(article)
            
            # 将分组转换为列表并进行分页
            date_groups = list(groups.items())
            total_dates = len(date_groups)
            
            # 计算分页
            start = (page - 1) * per_page
            end = start + per_page
            page_dates = date_groups[start:end]
            
            # 构建返回数据
            grouped_articles = []
            for date, articles in page_dates:
                grouped_articles.append({
                    'date': date,
                    'articles': articles
                })
            
            return {
                'groups': grouped_articles,
                'total': total_dates,
                'total_pages': (total_dates + per_page - 1) // per_page,
                'current_page': page
            }
        except FileNotFoundError:
            return {
                'groups': [],
                'total': 0,
                'total_pages': 0,
                'current_page': 1
            }
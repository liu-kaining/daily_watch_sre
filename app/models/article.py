"""
Author: liqian_liukaining
Date: 2025-02-16
"""
import json
from datetime import datetime, timezone, timedelta
import requests
from bs4 import BeautifulSoup
import os

class Article:
    ARTICLES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'articles.json')
    
    def __init__(self, url, title=None, source=None, created_at=None, summary=None):
        self.url = url
        self.title = title
        self.source = source
        self.summary = summary
        # 处理时间
        if created_at:
            self.created_at = created_at
        else:
            try:
                # 检查系统时区是否正确
                current_time = datetime.now()
                if current_time.astimezone().strftime('%z') != '+0800':
                    # 如果系统时区不是东八区，手动设置
                    current_time = datetime.now(timezone(timedelta(hours=8)))
                self.created_at = current_time.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                # 如果出现任何问题，强制使用东八区
                current_time = datetime.now(timezone(timedelta(hours=8)))
                self.created_at = current_time.strftime("%Y-%m-%d %H:%M:%S")
        if not title or not source:
            self._fetch_article_info()

    def _fetch_article_info(self):
        """获取文章信息"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            }
            
            # 减少超时时间到3秒
            response = requests.get(self.url, headers=headers, timeout=3)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            title_tag = soup.find('h1', class_='rich_media_title')
            self.title = title_tag.get_text().strip() if title_tag else '未知标题'
            
            source_tag = soup.find('a', id='js_name')
            self.source = source_tag.get_text().strip() if source_tag else '未知来源'
            
        except Exception:
            self.title = "获取失败"
            self.source = "未知来源"

    @staticmethod
    def is_duplicate(articles, new_url):
        """检查文章是否重复"""
        for article in articles:
            if article.get('url', '') == new_url:
                return True, "该文章已经存在"
        return False, None

    @staticmethod
    def save_to_file(articles, filename='articles.json'):
        data = [{
            'url': a.url,
            'title': a.title,
            'source': a.source,
            'created_at': a.created_at,
            'summary': getattr(a, 'summary', None)
        } for a in articles]
        with open(f'app/data/{filename}', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @staticmethod
    def update_summary(url, summary):
        try:
            with open(Article.ARTICLES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for article in data:
                if article['url'] == url:
                    article['summary'] = summary
                    break
            
            with open(Article.ARTICLES_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception:
            return False

    @staticmethod
    def load_from_file(filename='articles.json', page=1, per_page=5):
        try:
            with open(f'app/data/{filename}', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            data.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            groups = {}
            for article in data:
                date = article['created_at'][:10]
                if date not in groups:
                    groups[date] = []
                groups[date].append(article)
            
            date_groups = list(groups.items())
            total_dates = len(date_groups)
            
            start = (page - 1) * per_page
            end = start + per_page
            page_dates = date_groups[start:end]
            
            return {
                'groups': [{'date': date, 'articles': articles} for date, articles in page_dates],
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

    @staticmethod
    def get_total_count():
        try:
            with open(Article.ARTICLES_FILE, 'r', encoding='utf-8') as f:
                articles = json.load(f)
                return len(articles)
        except (FileNotFoundError, json.JSONDecodeError):
            return 0
    @classmethod
    def get_content_by_url(cls, url):
        """根据 URL 获取文章内容"""
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html'
                }
                response = requests.get(url, headers=headers, timeout=5)
                response.raise_for_status()  # 检查响应状态
                
                soup = BeautifulSoup(response.text, 'html.parser')
                content = soup.find('div', class_='rich_media_content')
                
                if content:
                    return content.get_text(strip=True)
                    
                retry_count += 1
                if retry_count < max_retries:
                    print(f"未找到内容，第 {retry_count} 次重试...")
                    time.sleep(1)  # 重试前等待1秒
                    
            except Exception as e:
                retry_count += 1
                if retry_count < max_retries:
                    print(f"获取内容失败，第 {retry_count} 次重试... 错误: {str(e)}")
                    time.sleep(1)  # 重试前等待1秒
                else:
                    print(f"最终获取失败，已重试 {max_retries} 次。错误: {str(e)}")
                    
        return None
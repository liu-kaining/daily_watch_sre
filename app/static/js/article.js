class ArticleLoader {
    constructor() {
        this.iframe = document.querySelector('iframe');
        this.loading = document.querySelector('.loading');
        this.loadingText = document.querySelector('.loading-text');
    }

    init() {
        this.setupIframe();
        this.setupLoadingTimeout();
    }

    setupIframe() {
        if (!this.iframe) return;
        
        this.iframe.addEventListener('load', () => {
            this.iframe.classList.add('loaded');
            if (this.loading) {
                this.loading.style.display = 'none';
            }
        });

        // 设置 iframe 源
        this.iframe.src = this.iframe.getAttribute('data-src');
    }

    setupLoadingTimeout() {
        setTimeout(() => {
            if (this.iframe && !this.iframe.classList.contains('loaded') && this.loadingText) {
                this.loadingText.textContent = '加载时间较长，请耐心等待...';
            }
        }, 10000);
    }
}

class ArticleManager {
    constructor() {
        this.container = document.querySelector('.page-container');
        this.iframe = document.querySelector('iframe');
        this.loading = document.querySelector('.loading');
        this.loadingText = document.querySelector('.loading-text');
        this.summaryBtn = document.getElementById('summaryBtn');
        this.summaryContent = document.getElementById('summaryContent');
        this.articleTools = document.querySelector('.article-tools');
    }

    setupArticleList() {
        const articles = document.querySelectorAll('.article-item');
        articles.forEach(article => {
            article.addEventListener('click', async (e) => {
                e.preventDefault();
                const url = article.dataset.url;
                
                // 更新选中状态
                articles.forEach(a => a.classList.remove('active'));
                article.classList.add('active');
                
                // 显示加载动画
                if (this.loading) {
                    this.loading.style.display = 'block';
                }
                
                // 更新 iframe 内容
                if (this.iframe) {
                    this.iframe.src = url;
                }

                // 显示右侧工具栏
                if (this.articleTools) {
                    this.articleTools.style.display = 'flex';
                }

                // 获取文章摘要
                try {
                    const response = await fetch(`/api/article/summary?url=${encodeURIComponent(url)}`);
                    const data = await response.json();
                    
                    if (data.summary) {
                        this.summaryContent.innerHTML = data.summary;
                        if (this.summaryBtn) {
                            this.summaryBtn.style.display = 'none';
                        }
                    } else {
                        this.summaryContent.innerHTML = '';
                        if (this.summaryBtn) {
                            this.summaryBtn.style.display = 'block';
                        }
                    }
                } catch (error) {
                    console.error('获取摘要失败:', error);
                }
            });
        });
    }

    init() {
        document.body.style.overflow = 'hidden';
        this.setupIframe();
        this.setupLoadingTimeout();
        this.setupSummaryButton();
        this.setupArticleList();
    }

    setupIframe() {
        if (!this.iframe) return;
        
        this.iframe.addEventListener('load', () => {
            this.iframe.classList.add('loaded');
            if (this.loading) {
                this.loading.style.display = 'none';
            }
        });

        this.iframe.src = this.iframe.getAttribute('data-src');
    }

    setupLoadingTimeout() {
        setTimeout(() => {
            if (this.iframe && !this.iframe.classList.contains('loaded') && this.loadingText) {
                this.loadingText.textContent = '加载时间较长，请耐心等待...';
            }
        }, 10000);
    }

    setupSummaryButton() {
        if (!this.summaryBtn) return;

        this.summaryBtn.addEventListener('click', async () => {
            this.summaryBtn.disabled = true;
            this.summaryBtn.textContent = '正在总结...';

            try {
                const response = await fetch(`/api/summarize/${encodeURIComponent(this.container.dataset.url)}`);
                const data = await response.json();

                if (data.summary) {
                    this.summaryContent.innerHTML = data.summary;
                    this.summaryBtn.style.display = 'none';
                } else {
                    throw new Error(data.error || '总结失败');
                }
            } catch (error) {
                this.summaryContent.textContent = `总结失败: ${error.message}`;
                this.summaryBtn.disabled = false;
                this.summaryBtn.textContent = '重试总结';
            }
        });
    }

    setupArticleList() {
        const articles = document.querySelectorAll('.article-item');
        articles.forEach(article => {
            article.addEventListener('click', (e) => {
                e.preventDefault();
                // 更新 URL 但不刷新页面
                window.history.pushState({}, '', `/article/${encodeURIComponent(url)}`);
                
                // 更新选中状态
                articles.forEach(a => a.classList.remove('active'));
                article.classList.add('active');
                
                // 更新 iframe
                this.loading.style.display = 'block';
                this.iframe.src = url;
            });
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ArticleLoader();
    loader.init();
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const manager = new ArticleManager();
    manager.init();
});
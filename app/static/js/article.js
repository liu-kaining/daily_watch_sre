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
        this.iframe = document.querySelector('iframe');
        this.loading = document.querySelector('.loading');
        this.loadingText = document.querySelector('.loading-text');
        this.summaryBtn = document.getElementById('summaryBtn');
        this.summaryContent = document.getElementById('summaryContent');
        this.articleTools = document.querySelector('.article-tools');
    }

    init() {
        document.body.style.overflow = 'hidden';
        this.setupIframe();
        this.setupLoadingTimeout();
        this.setupSummaryButton();
        this.setupArticleList();
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
            // 禁用按钮并显示加载状态
            this.summaryBtn.disabled = true;
            this.summaryBtn.textContent = '正在思考...';
            
            // 显示加载动画和提示文字
            this.summaryContent.innerHTML = `
                <div class="thinking">
                    <div style="color: #666; font-size: 14px; margin-bottom: 15px;">总结中，请稍后片刻...如果失败，请重试一下</div>
                    <div class="dot-typing"></div>
                </div>
            `;
    
            try {
                const currentUrl = window.location.pathname.split('/article/')[1];
                const response = await fetch('/api/summarize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: decodeURIComponent(currentUrl)
                    })
                });
                const data = await response.json();
    
                if (data.success) {
                    // 清空加载动画
                    this.summaryContent.innerHTML = '';
                    const text = data.data.summary;
                    let index = 0;
    
                    // 打字机效果
                    const typeWriter = () => {
                        if (index < text.length) {
                            this.summaryContent.innerHTML += text.charAt(index);
                            index++;
                            setTimeout(typeWriter, Math.random() * 50 + 30);
                        } else {
                            // 完成后隐藏按钮
                            this.summaryBtn.style.display = 'none';
                        }
                    };
    
                    typeWriter();
                } else {
                    throw new Error(data.message || '总结失败');
                }
            } catch (error) {
                this.summaryContent.innerHTML = `总结失败: ${error.message}`;
                this.summaryBtn.disabled = false;
                this.summaryBtn.textContent = '重试总结';
            }
        });
    }
}

// 只保留一个初始化
document.addEventListener('DOMContentLoaded', () => {
    const manager = new ArticleManager();
    manager.init();
});
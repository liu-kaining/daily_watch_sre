// 添加初始化欢迎界面
// 欢迎界面函数
function showWelcome() {
    const frame = document.getElementById('content-frame');
    const welcomeHtml = `
        <style>
            body {
                margin: 0;
                padding: 40px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 80px);
                color: #333;
                background: #fff;
            }
            .welcome-container {
                max-width: 600px;
                text-align: center;
            }
            h1 {
                color: #1a73e8;
                margin-bottom: 30px;
            }
            .instruction-card {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 24px;
                margin: 20px 0;
                text-align: left;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .instruction-card h2 {
                color: #2c3e50;
                font-size: 18px;
                margin-bottom: 16px;
            }
            .step {
                margin-bottom: 12px;
                display: flex;
                align-items: flex-start;
                gap: 8px;
            }
            .step-number {
                background: #1a73e8;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .step-text {
                line-height: 1.6;
            }
        </style>
        <div class="welcome-container">
            <h1>欢迎使用 Daily Watch SRE&AI</h1>
            <div class="instruction-card">
                <h2>使用指南</h2>
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-text">
                        在左上角的输入框中粘贴微信公众号文章链接，点击"添加文章"按钮保存文章。
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-text">
                        文章会出现在左侧列表中，包含标题、来源和保存时间。
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-text">
                        点击左侧列表中的任意文章，即可在此处查看文章内容。
                    </div>
                </div>
            </div>
        </div>
    `;
    frame.srcdoc = welcomeHtml;
}

// 加载文章内容函数
function loadContent(url) {
    fetch(`/get_content?url=${encodeURIComponent(url)}`)
        .then(response => response.text())
        .then(html => {
            const frame = document.getElementById('content-frame');
            frame.srcdoc = html;
        })
        .catch(error => {
            console.error('Error loading content:', error);
        });
}

// 表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.add-url-form form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            
            fetch('/add_url', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `/?page=1&load=${encodeURIComponent(formData.get('url'))}`;
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                alert('添加文章失败，请重试');
            });
        });
    }

    // 默认显示欢迎界面
    if (!window.location.search.includes('load=')) {
        showWelcome();
    }
});

// 添加模态框 HTML 到页面
document.addEventListener('DOMContentLoaded', function() {
    const modalHtml = `
        <div id="notification-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-title"></span>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary">去查看</button>
                    <button class="modal-btn modal-btn-secondary">取消</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 表单提交处理
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.querySelector('.add-url-form form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const url = formData.get('url');
            
            fetch('/add_url', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 刷新页面并加载新文章
                    window.location.href = `/?page=1&load=${encodeURIComponent(url)}`;
                } else {
                    showModal('添加失败', data.message);
                }
            })
            .catch(error => {
                showModal('错误', '添加文章失败，请重试');
            });
        });
    });

    // 模态框关闭按钮事件
    document.querySelector('.modal .close').addEventListener('click', hideModal);
    document.querySelector('.modal-btn-secondary').addEventListener('click', hideModal);
});

// 辅助函数：显示模态框
function showModal(title, message, onConfirm = null) {
    const modal = document.getElementById('notification-modal');
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').textContent = message;
    
    const confirmBtn = modal.querySelector('.modal-btn-primary');
    if (onConfirm) {
        confirmBtn.style.display = 'block';
        confirmBtn.onclick = () => {
            onConfirm();
            hideModal();
        };
    } else {
        confirmBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

// 辅助函数：隐藏模态框
function hideModal() {
    document.getElementById('notification-modal').style.display = 'none';
}

// 辅助函数：标准化URL
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('mp.weixin.qq.com')) {
            const s = urlObj.searchParams.get('s');
            return s ? `${urlObj.origin}${urlObj.pathname}?s=${s}` : url;
        }
    } catch (e) {}
    return url;
}

// 折叠功能
function toggleGroup(header) {
    const group = header.closest('.date-group');
    const articleGroup = group.querySelector('.article-group');
    
    if (group.classList.contains('collapsed')) {
        group.classList.remove('collapsed');
        articleGroup.style.maxHeight = articleGroup.scrollHeight + 'px';
    } else {
        group.classList.add('collapsed');
        articleGroup.style.maxHeight = '0';
    }
}

// 在 DOMContentLoaded 事件中添加初始化折叠状态
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.add-url-form form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            
            fetch('/add_url', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `/?page=1&load=${encodeURIComponent(formData.get('url'))}`;
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                alert('添加文章失败，请重试');
            });
        });
    }

    // 默认显示欢迎界面
    if (!window.location.search.includes('load=')) {
        showWelcome();
    }
});

// 添加模态框 HTML 到页面
document.addEventListener('DOMContentLoaded', function() {
    const modalHtml = `
        <div id="notification-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-title"></span>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary">去查看</button>
                    <button class="modal-btn modal-btn-secondary">取消</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 表单提交处理
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.querySelector('.add-url-form form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const url = formData.get('url');
            
            fetch('/add_url', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 刷新页面并加载新文章
                    window.location.href = `/?page=1&load=${encodeURIComponent(url)}`;
                } else {
                    showModal('添加失败', data.message);
                }
            })
            .catch(error => {
                showModal('错误', '添加文章失败，请重试');
            });
        });
    });

    // 模态框关闭按钮事件
    document.querySelector('.modal .close').addEventListener('click', hideModal);
    document.querySelector('.modal-btn-secondary').addEventListener('click', hideModal);
});

// 辅助函数：显示模态框
function showModal(title, message, onConfirm = null) {
    const modal = document.getElementById('notification-modal');
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').textContent = message;
    
    const confirmBtn = modal.querySelector('.modal-btn-primary');
    if (onConfirm) {
        confirmBtn.style.display = 'block';
        confirmBtn.onclick = () => {
            onConfirm();
            hideModal();
        };
    } else {
        confirmBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

// 辅助函数：隐藏模态框
function hideModal() {
    document.getElementById('notification-modal').style.display = 'none';
}

// 辅助函数：标准化URL
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('mp.weixin.qq.com')) {
            const s = urlObj.searchParams.get('s');
            return s ? `${urlObj.origin}${urlObj.pathname}?s=${s}` : url;
        }
    } catch (e) {}
    return url;
}
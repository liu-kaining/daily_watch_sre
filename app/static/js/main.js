// 加载文章内容函数
function loadContent(url) {
    // 修改加载动画的位置，只在中间内容区域显示
    const contentFrame = document.getElementById('content-frame');
    const contentWrapper = contentFrame.parentElement;  // 获取 iframe 的父元素
    
    // 创建或获取加载动画元素（确保只在中间区域显示）
    let loading = contentWrapper.querySelector('.loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = '<div class="spinner"></div><div>正在加载文章...</div>';
        contentWrapper.appendChild(loading);
    }
    loading.style.display = 'flex';

    // 更新文章选中状态
    const articles = document.querySelectorAll('.article-item');
    articles.forEach(item => item.classList.remove('active'));
    const currentArticle = document.querySelector(`.article-item[data-url="${url}"]`);
    if (currentArticle) {
        currentArticle.classList.add('active');
    }

    // 加载文章内容到 iframe
    if (contentFrame) {
        fetch(`/get_content?url=${encodeURIComponent(url)}`)
            .then(response => response.text())
            .then(html => {
                contentFrame.srcdoc = html;
                // 在 loadContent 函数中，contentFrame.onload 回调里添加
                contentFrame.onload = () => {
                    loading.style.display = 'none';
                    // 更新右侧总结面板
                    AISummary.updatePanel(url);
                };
            })
            .catch(error => {
                console.error('Error loading content:', error);
                loading.style.display = 'none';
            });
    }
}

// 文章组展开/折叠
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

// 辅助函数：显示模态框
function showModal(title, message, onConfirm = null, onCancel = null) {
    const modal = document.getElementById('notification-modal');
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = message;
    
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

    const cancelBtn = modal.querySelector('.modal-btn-secondary');
    if (onCancel) {
        cancelBtn.style.display = 'block';
        cancelBtn.onclick = () => {
            if (typeof onCancel === 'function') {
                onCancel();
            }
            hideModal();
        };
    }
    
    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = hideModal;
    }
    
    // 添加点击背景关闭功能
    modal.onclick = (e) => {
        if (e.target === modal) {
            hideModal();
        }
    };
    
    modal.style.display = 'flex';
}

// 辅助函数：隐藏模态框
function hideModal() {
    const modal = document.getElementById('notification-modal');
    modal.style.display = 'none';
    
    // 清空输入框
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
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

// 口令验证对话框
function showTokenDialog() {
    return new Promise((resolve) => {
        showModal('需要验证', 
            `<div class="token-input">
                <p class="token-tip">请输入管理员口令以添加文章</p>
                <input type="password" id="token-input" placeholder="请输入口令" 
                    onkeypress="if(event.keyCode===13) document.querySelector('.modal-btn-primary').click()"
                />
            </div>`,
            () => {
                const token = document.getElementById('token-input').value;
                resolve(token);
            },
            () => resolve(null)
        );
        // 自动聚焦输入框
        setTimeout(() => document.getElementById('token-input').focus(), 100);
    });
}

// 显示添加文章对话框
function showAddArticleDialog() {
    const dialogHtml = `
        <div class="add-article-form">
            <div class="form-group">
                <label for="article-url">文章链接</label>
                <input type="text" id="article-url" placeholder="请输入微信公众号文章链接" />
            </div>
            <div class="form-group">
                <label for="token-input">管理员口令</label>
                <input type="password" id="token-input" placeholder="请输入口令" 
                    onkeypress="if(event.keyCode===13) document.querySelector('.modal-btn-primary').click()"
                />
            </div>
        </div>
    `;

    showModal('添加文章', dialogHtml, handleArticleSubmit, true);
    
    // 自动聚焦到文章链接输入框
    setTimeout(() => document.getElementById('article-url').focus(), 100);
}

// 处理文章提交（保留唯一的版本）
function handleArticleSubmit() {
    const url = document.getElementById('article-url').value;
    const token = document.getElementById('token-input').value;
    
    if (!url || !token) {
        showModal('提示', '<div class="error-message">请填写完整信息</div>');
        return;
    }
    
    const formData = new FormData();
    formData.append('url', url);
    formData.append('token', token);
    
    fetch('/add_url', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showModal('添加成功', 
                '<div class="success-message">文章已成功添加到收藏列表</div>',
                () => {
                    updateArticleCount();  // 更新文章统计
                    // 使用 AJAX 更新文章列表
                    updateArticleList();
                    hideModal();
                }
            );
        } else {
            showModal('添加失败', 
                `<div class="error-message">${data.message || '添加文章失败，请重试'}</div>`
            );
        }
    })
    .catch(error => {
        showModal('错误', '<div class="error-message">添加文章失败，请重试</div>');
    });
}

// 更新文章总数
// 修改更新文章总数函数
function updateArticleCount() {
    const totalArticles = document.querySelector('.article-count');
    if (!totalArticles) return;

    // 保持原有显示，避免闪烁
    const currentCount = totalArticles.querySelector('strong')?.textContent || '0';
    totalArticles.innerHTML = `当前总计收藏 <strong class="count-number">${currentCount}</strong> 篇文章`;

    fetch('/api/stats/articles')
        .then(response => response.json())
        .then(data => {
            if (totalArticles) {
                const count = data.data.total || '0';
                totalArticles.innerHTML = `当前总计收藏 <strong class="count-number">${count}</strong> 篇文章`;
            }
        })
        .catch(error => {
            console.error('获取文章统计失败:', error);
        });
}

// 添加新函数：更新文章列表
// 修改更新文章列表函数
function updateArticleList() {
    // 修改为正确的接口路径
    fetch('/?ajax=1')  // 使用 ajax 参数来获取只包含文章列表的 HTML
        .then(response => response.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 获取新的文章列表内容
            const newArticleList = tempDiv.querySelector('.article-list');
            if (newArticleList) {
                const articleList = document.querySelector('.article-list');
                articleList.innerHTML = newArticleList.innerHTML;
                // 重新绑定事件
                initializeArticleListEvents();
            }
        })
        .catch(error => {
            console.error('更新文章列表失败:', error);
            // 如果更新失败，提示用户
            showModal('错误', '<div class="error-message">更新文章列表失败，请刷新页面</div>');
        });
}

// 添加新函数：初始化文章列表事件
function initializeArticleListEvents() {
    // 重新绑定日期组折叠事件
    document.querySelectorAll('.date-header').forEach(header => {
        header.onclick = (e) => {
            e.stopPropagation();
            toggleGroup(header);
        };
    });
    
    // 重新绑定文章点击事件
    document.querySelectorAll('.article-item').forEach(item => {
        const url = item.getAttribute('data-url');
        if (url) {
            // 移除可能存在的旧事件监听器
            item.removeEventListener('click', item._clickHandler);
            
            // 创建新的事件处理函数
            item._clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                loadContent(url);
                return false; // 确保阻止默认行为
            };
            
            // 添加新的事件监听器
            item.addEventListener('click', item._clickHandler);
            
            // 移除可能存在的 href 属性
            item.removeAttribute('href');
            item.style.cursor = 'pointer';
        }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加模态框 HTML
    const modalHtml = `
        <div id="notification-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-title"></span>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary">确定</button>
                    <button class="modal-btn modal-btn-secondary">取消</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 标记今天的日期并处理折叠状态
    const today = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');

    document.querySelectorAll('.date-group').forEach(group => {
        const dateText = group.querySelector('.date').textContent.trim();
        const articleGroup = group.querySelector('.article-group');
        
        if (dateText === today) {
            group.querySelector('.date-header').classList.add('today');
            // 展开今天的文章列表
            articleGroup.style.maxHeight = articleGroup.scrollHeight + 'px';
        } else {
            // 折叠其他日期的文章列表
            group.classList.add('collapsed');
            articleGroup.style.maxHeight = '0';
        }
    });

    // 初始化事件监听
    initializeArticleListEvents();

    // 模态框关闭按钮事件
    document.querySelector('.modal .close').addEventListener('click', hideModal);
    document.querySelector('.modal-btn-secondary').addEventListener('click', hideModal);

    // 添加文章按钮事件
    const addArticleBtn = document.getElementById('addArticleBtn');
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', showAddArticleDialog);
    }

    // 更新文章统计
    updateArticleCount();
});
// 在搜索结果返回后展开所有日期组
function expandAllGroups() {
    document.querySelectorAll('.date-group').forEach(group => {
        const articleGroup = group.querySelector('.article-group');
        group.classList.remove('collapsed');
        if (articleGroup) {
            articleGroup.style.maxHeight = articleGroup.scrollHeight + 'px';
        }
    });
}

// 修改搜索表单提交处理
document.querySelector('.search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchInput = this.querySelector('input[type="text"]');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        fetch(`/search?q=${encodeURIComponent(searchTerm)}`)
            .then(response => response.text())
            .then(html => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                // 获取新的文章列表内容
                const newArticleList = tempDiv.querySelector('.article-list');
                if (newArticleList) {
                    const articleList = document.querySelector('.article-list');
                    
                    // 保持滚动位置
                    const scrollTop = articleList.scrollTop;
                    articleList.innerHTML = newArticleList.innerHTML;
                    articleList.scrollTop = scrollTop;
                    
                    // 重新绑定事件
                    initializeArticleListEvents();
                    
                    // 展开所有搜索结果
                    document.querySelectorAll('.date-group').forEach(group => {
                        const articleGroup = group.querySelector('.article-group');
                        if (articleGroup && articleGroup.children.length > 0) {
                            group.classList.remove('collapsed');
                            articleGroup.style.maxHeight = `${articleGroup.scrollHeight}px`;
                        }
                    });
                }
            })
            .catch(error => {
                console.error('搜索失败:', error);
            });
    }
});
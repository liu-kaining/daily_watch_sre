// 加载文章内容函数
function loadContent(url) {
    // 移除之前的选中状态
    document.querySelectorAll('.article-item.active').forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加新的选中状态
    const currentItem = event.currentTarget;
    currentItem.classList.add('active');
    
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

// 处理文章提交
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
                    window.location.href = '/?page=1';
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
function updateArticleCount() {
    fetch('/get_article_count')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-articles').textContent = data.count;
        });
}

// 在页面加载时更新文章数
document.addEventListener('DOMContentLoaded', function() {
    updateArticleCount();
    // ... 其他初始化代码 ...
});

// 在文章添加成功后更新统计
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
                    window.location.href = '/?page=1';
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

// 更新文章统计
function updateArticleCount() {
    fetch('/api/stats/articles')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('article-total').textContent = data.data.total;
            }
        })
        .catch(error => console.error('获取文章统计失败:', error));
}

// 在页面加载时更新统计
document.addEventListener('DOMContentLoaded', function() {
    updateArticleCount();
    // ... 其他初始化代码 ...
});

// 在添加文章成功后更新统计
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
                    window.location.href = '/?page=1';
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

    // 模态框关闭按钮事件
    document.querySelector('.modal .close').addEventListener('click', hideModal);
    document.querySelector('.modal-btn-secondary').addEventListener('click', hideModal);

    // 表单提交处理
    const form = document.querySelector('.add-url-form form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            showTokenDialog().then(token => {
                if (!token) return;
                
                const formData = new FormData(form);
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
                                // 修改这里：直接刷新页面，不带参数
                                window.location.href = '/?page=1';
                            }
                        );
                        form.reset(); // 清空表单
                    } else {
                        showModal('添加失败', data.message || '添加文章失败，请重试');
                    }
                })
                .catch(error => {
                    showModal('错误', '添加文章失败，请重试');
                });
            });
        });
    }

    // 添加文章按钮事件
    const addArticleBtn = document.getElementById('addArticleBtn');
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', showAddArticleDialog);
    }
});
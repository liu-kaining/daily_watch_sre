// AI 总结功能模块
const AISummary = {
    // 初始化总结面板
    init() {
        this.summarySection = document.querySelector('.summary-section');
        this.summaryBtn = document.querySelector('.summary-btn');
        this.summaryContent = document.querySelector('.summary-content');
        
        if (!this.summarySection || !this.summaryBtn || !this.summaryContent) return;
        
        // 重置初始状态
        this.reset();
    },

    // 重置面板状态
    reset() {
        if (!this.summaryContent) return;
        this.summaryBtn.disabled = false;
        this.summaryContent.innerHTML = '<div class="placeholder">点击上方按钮生成 AI 总结</div>';
    },

    // 更新面板状态
    updatePanel(url) {
        if (!this.summaryBtn || !this.summaryContent) return;
        
        this.reset();
        
        // 绑定总结按钮事件
        this.summaryBtn.onclick = () => this.generateSummary(url);
    },

    // 生成文章总结
    generateSummary(url) {
        if (!this.summaryBtn || !this.summaryContent) return;
        
        this.summaryBtn.disabled = true;
        this.summaryContent.innerHTML = '<div class="loading">正在生成 AI 总结...</div>';
        
        fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.summaryContent.innerHTML = `
                    <div class="summary-text">${data.summary}</div>
                `;
            } else {
                this.summaryContent.innerHTML = `
                    <div class="error-message">生成总结失败：${data.message}</div>
                    <button class="retry-btn" onclick="AISummary.updatePanel('${url}')">重试</button>
                `;
            }
        })
        .catch(error => {
            console.error('生成总结失败:', error);
            this.summaryContent.innerHTML = `
                <div class="error-message">生成总结失败，请重试</div>
                <button class="retry-btn" onclick="AISummary.updatePanel('${url}')">重试</button>
            `;
        })
        .finally(() => {
            this.summaryBtn.disabled = false;
        });
    }
};

// 导出模块
window.AISummary = AISummary;
// AI 总结功能模块
const AISummary = {
    // 初始化总结面板
    init() {
        this.summarySection = document.querySelector('.summary-section');
        // 修改选择器，确保能正确找到按钮
        this.summaryBtn = document.getElementById('summaryBtn') || document.querySelector('.summary-btn');
        this.summaryContent = document.querySelector('.summary-content');
        
        if (!this.summarySection || !this.summaryBtn || !this.summaryContent) {
            console.error('找不到必要的DOM元素');
            return;
        }
        
        // 初始状态下禁用按钮
        this.summaryBtn.disabled = true;
        this.summaryBtn.style.cursor = 'not-allowed';
        this.summaryContent.innerHTML = '<div class="placeholder">请先选择一篇文章</div>';
    },

    // 更新面板状态
    async updatePanel(url) {
        if (!this.summaryBtn || !this.summaryContent) return;
        
        if (url) {
            // 确保按钮可用
            this.summaryBtn.disabled = false;
            this.summaryBtn.style.cursor = 'pointer';
            
            try {
                const response = await fetch(`/api/article/summary?url=${encodeURIComponent(url)}`);
                const data = await response.json();
                
                if (data.success && data.exists) {
                    this.summaryBtn.textContent = '重新总结';
                    this.summaryContent.innerHTML = marked.parse(data.summary);
                } else {
                    this.summaryBtn.textContent = '一键AI总结';
                    this.summaryContent.innerHTML = '<div class="placeholder">点击上方按钮生成 AI 总结</div>';
                }
                
                // 绑定点击事件
                this.summaryBtn.onclick = () => this.generateSummary(url);
            } catch (error) {
                console.error('获取总结失败:', error);
                this.summaryBtn.textContent = '一键AI总结';
                this.summaryContent.innerHTML = '<div class="placeholder">点击上方按钮生成 AI 总结</div>';
            }
        } else {
            this.summaryBtn.disabled = true;
            this.summaryBtn.style.cursor = 'not-allowed';
            this.summaryContent.innerHTML = '<div class="placeholder">请先选择一篇文章</div>';
        }
    },

    // 生成文章总结
    async generateSummary(url) {
        if (!this.summaryBtn || !this.summaryContent) return;
        
        this.summaryBtn.disabled = true;
        this.summaryBtn.textContent = '正在思考...';
        
        // 显示加载动画和提示文字
        this.summaryContent.innerHTML = `
            <div class="thinking">
                <div style="color: #666; font-size: 14px; margin-bottom: 15px;">总结中，请稍后片刻...</div>
                <div class="dot-typing"></div>
            </div>
        `;
        
        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });
            const data = await response.json();
            
            if (data.success) {
                const text = data.summary || data.data?.summary || '';
                if (!text) {
                    throw new Error('未获取到总结内容');
                }

                // 保存总结内容
                await fetch('/api/article/summary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: url,
                        summary: text
                    })
                });

                // 清空加载动画并开始打字机效果
                this.summaryContent.innerHTML = '';
                let index = 0;
                const typeWriter = () => {
                    if (index < text.length) {
                        // 使用 window.marked 而不是直接使用 marked
                        this.summaryContent.innerHTML = window.marked.parse(text.substring(0, index + 1));
                        index++;
                        setTimeout(typeWriter, Math.random() * 50 + 30);
                    } else {
                        this.summaryBtn.disabled = false;
                        this.summaryBtn.textContent = '重新总结';
                    }
                };

                typeWriter();
            } else {
                throw new Error(data.message || '总结失败');
            }
        } catch (error) {
            console.error('生成总结失败:', error);
            this.summaryContent.innerHTML = `
                <div class="error-message">生成总结失败，请重试</div>
                <button class="retry-btn" onclick="AISummary.updatePanel('${url}')">重试</button>
            `;
            this.summaryBtn.disabled = false;
            this.summaryBtn.textContent = '重试总结';
        }
    }
};

// 导出模块
window.AISummary = AISummary;
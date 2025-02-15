function updateDateTime() {
    const now = new Date();
    
    // 更新日期
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateStr = now.toLocaleDateString('zh-CN', dateOptions);
    document.querySelector('.datetime-display .date').textContent = dateStr;
    
    // 更新时间
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeStr = now.toLocaleTimeString('zh-CN', timeOptions);
    document.querySelector('.datetime-display .time').textContent = timeStr;
}

// 初始更新
updateDateTime();

// 每秒更新一次
setInterval(updateDateTime, 1000);
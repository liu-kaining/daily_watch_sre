#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
MONITOR_SCRIPT="$SCRIPT_DIR/monitor.sh"
BACKUP_SCRIPT="$SCRIPT_DIR/backup_data.sh"
LOG_FILE="$SCRIPT_DIR/monitor.log"

# 确保脚本有执行权限
chmod +x "$MONITOR_SCRIPT"
chmod +x "$BACKUP_SCRIPT"

# 创建日志文件
touch "$LOG_FILE"
chmod 666 "$LOG_FILE"

# 检查是否已存在相同的定时任务
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$MONITOR_SCRIPT")

if [ -z "$EXISTING_CRON" ]; then
    # 添加新的定时任务（每5分钟执行一次）
    (crontab -l 2>/dev/null; echo "*/5 * * * * $MONITOR_SCRIPT && $BACKUP_SCRIPT >> $LOG_FILE 2>&1") | crontab -
    echo "定时任务已添加成功！"
else
    echo "定时任务已存在，无需重复添加。"
fi

# 立即执行监控和备份脚本
echo "正在执行首次检查和备份..."
"$MONITOR_SCRIPT" && "$BACKUP_SCRIPT"
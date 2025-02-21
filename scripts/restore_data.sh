#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DATA_DIR="$SCRIPT_DIR/../app/data"
BACKUP_DIR="$SCRIPT_DIR/../backups"
LOG_FILE="$BACKUP_DIR/restore.log"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# 确保数据目录存在
mkdir -p "$DATA_DIR"

# 恢复 articles.json
if [ -f "$BACKUP_DIR/articles.json" ]; then
    cat "$BACKUP_DIR/articles.json" > "$DATA_DIR/articles.json"
    echo "[$timestamp] 已恢复 articles.json" | tee -a "$LOG_FILE"
else
    echo "[$timestamp] Error: articles.json 备份文件不存在" | tee -a "$LOG_FILE"
fi

# 恢复 summaries.json
if [ -f "$BACKUP_DIR/summaries.json" ]; then
    cat "$BACKUP_DIR/summaries.json" > "$DATA_DIR/summaries.json"
    echo "[$timestamp] 已恢复 summaries.json" | tee -a "$LOG_FILE"
else
    echo "[$timestamp] Error: summaries.json 备份文件不存在" | tee -a "$LOG_FILE"
fi
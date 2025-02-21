#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DATA_DIR="$SCRIPT_DIR/../app/data"
BACKUP_DIR="$SCRIPT_DIR/../backups"
LOG_FILE="$BACKUP_DIR/backup.log"

# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

# 检查并备份文件
backup_if_changed() {
    local file="$1"
    local filename=$(basename "$file")
    local backup_path="$BACKUP_DIR/$filename"
    local timestamp=$(date '+%Y%m%d_%H%M%S')

    # 如果文件不存在，记录并返回
    if [ ! -f "$file" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Warning: $file does not exist" >> "$LOG_FILE"
        return
    fi

    # 如果是首次备份或文件有变化
    if [ ! -f "$backup_path" ] || ! cmp -s "$file" "$backup_path"; then
        # 保留最近的备份为 .prev 文件
        if [ -f "$backup_path" ]; then
            mv "$backup_path" "${backup_path}.prev"
        fi
        
        # 创建新的备份
        cp "$file" "$backup_path"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backed up $filename" >> "$LOG_FILE"
    fi
}

# 备份数据文件
backup_if_changed "$DATA_DIR/articles.json"
backup_if_changed "$DATA_DIR/summaries.json"

# 清理多余的备份文件
cleanup_backups() {
    local pattern="$1"
    find "$BACKUP_DIR" -name "$pattern" ! -name "*.json" ! -name "*.prev" -delete
}

cleanup_backups "articles*"
cleanup_backups "summaries*"
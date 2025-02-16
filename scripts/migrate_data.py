import json
from datetime import datetime

def migrate_articles():
    try:
        # 读取现有数据
        with open('app/data/articles.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 修复数据结构
        for article in data:
            if 'created_at' not in article:
                # 如果有 date 字段，使用它
                if 'date' in article:
                    article['created_at'] = article['date']
                    del article['date']
                else:
                    # 如果既没有 created_at 也没有 date，使用当前时间
                    article['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 保存修复后的数据
        with open('app/data/articles.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print("数据迁移完成")
    except Exception as e:
        print(f"迁移失败: {str(e)}")

if __name__ == "__main__":
    migrate_articles()
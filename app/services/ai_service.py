import os
import json
import dashscope
from dashscope import Generation

class AIService:
    def __init__(self):
        # 修改初始化逻辑，允许测试时使用测试 key
        self.api_key = os.getenv('DASHSCOPE_API_KEY')
        if not self.api_key:
            if os.environ.get('TESTING'):
                self.api_key = 'test_api_key'
            else:
                raise ValueError("通义千问 API Key 未配置")
        
        dashscope.api_key = self.api_key

    def generate_summary(self, content):
        if not content.strip():
            return {
                'success': False,
                'message': '文章内容不能为空'
            }
            
        try:
            messages = [{
                'role': 'system',
                'content': '你是一个专业的文章总结助手，请对下面的文章内容进行简洁的总结，突出重点。'
            }, {
                'role': 'user',
                'content': f'请总结以下文章的主要内容：\n\n{content}'
            }]

            response = Generation.call(
                model='qwen-max',
                messages=messages,
                result_format='message',
                max_tokens=1500,
                temperature=0.7,
                top_p=0.8
            )

            if response.status_code == 200:
                return {
                    'success': True,
                    'summary': response.output.choices[0].message.content
                }
            else:
                return {
                    'success': False,
                    'message': f'生成总结失败: {response.code} - {response.message}'
                }

        except Exception as e:
            return {
                'success': False,
                'message': f'生成总结时发生错误: {str(e)}'
            }

    def summarize_article(self, content):
        """使用通义千问总结文章"""
        try:
            prompt = f"""请对以下文章进行结构化总结，包含以下方面：
            1. 核心观点（2-3条）
            2. 主要内容（3-5条）
            3. 关键结论（1-2条）
            
            文章内容：
            {content}
            """
            
            response = Generation.call(
                model='deepseek-r1',
                prompt=prompt,
                result_format='message',
                max_tokens=1500
            )
            
            if response.status_code == 200:
                return response.output.text
            return None
        except Exception as e:
            print(f"AI 总结出错: {str(e)}")
            return None
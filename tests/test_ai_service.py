import pytest
import os
from app.services.ai_service import AIService

@pytest.fixture(autouse=True)
def setup_env():
    """设置测试环境变量"""
    os.environ['DASHSCOPE_API_KEY'] = 'sk-7c92805c60294810977a61b0e649dd00'
    yield
    # 测试后清理环境变量
    if 'DASHSCOPE_API_KEY' in os.environ:
        del os.environ['DASHSCOPE_API_KEY']

def test_ai_service_initialization():
    """测试 AI 服务初始化"""
    ai_service = AIService()
    assert ai_service is not None
    assert ai_service.api_key == 'sk-7c92805c60294810977a61b0e649dd00'

def test_generate_summary():
    """测试文章总结生成"""
    ai_service = AIService()
    
    # 准备测试文本
    test_content = """
    SRE（Site Reliability Engineering）是一种通过软件工程方法来解决运维问题的实践。
    它强调自动化、监控和系统可靠性。SRE 团队负责确保系统的可用性、延迟、性能和容量方面的服务水平目标。
    通过实施 SRE 实践，组织可以更好地管理大规模系统，提高服务质量，减少人工干预。
    """
    
    # 调用总结功能
    result = ai_service.generate_summary(test_content)
    
    # 验证返回结果
    assert result['success'] is True, f"总结生成失败: {result.get('message', '')}"
    assert 'summary' in result, "返回结果中缺少 summary 字段"
    assert len(result['summary']) > 0, "生成的总结内容为空"
    
    # 打印总结结果以供人工检查
    print("\n生成的总结内容:")
    print(result['summary'])

def test_generate_summary_with_empty_content():
    """测试空内容的情况"""
    ai_service = AIService()
    result = ai_service.generate_summary("")
    
    # 验证错误处理
    assert result['success'] is False, "空内容应该返回失败"
    assert 'message' in result, "错误情况下应该包含错误信息"

if __name__ == '__main__':
    pytest.main(['-v', __file__])
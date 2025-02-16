import hashlib

# 口令配置（口令为 "SRE2025"）
SUBMIT_TOKEN = "948cd79be9da903c46619826ee00e941bc122ff4ec7421692b83f6092c744f9d"

def verify_token(input_token):
    """验证输入的口令"""
    if not input_token:
        return False
    hashed = hashlib.sha256(input_token.encode()).hexdigest()
    return hashed == SUBMIT_TOKEN

# 测试函数
def test_token():
    test_input = "SRE2025"
    hashed = hashlib.sha256(test_input.encode()).hexdigest()
    print(f"Test token: {test_input}")
    print(f"Expected hash: {SUBMIT_TOKEN}")
    print(f"Actual hash: {hashed}")
    print(f"Match: {hashed == SUBMIT_TOKEN}")

if __name__ == "__main__":
    test_token()
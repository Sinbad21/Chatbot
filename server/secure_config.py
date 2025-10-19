import os
from cryptography.fernet import Fernet

class SecureConfig:
    def __init__(self, key_file='config.key'):
        self.key_file = key_file
        if not os.path.exists(key_file):
            self.key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(self.key)
        else:
            with open(key_file, 'rb') as f:
                self.key = f.read()
        self.cipher = Fernet(self.key)

    def encrypt(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()

    def decrypt(self, token: str) -> str:
        return self.cipher.decrypt(token.encode()).decode()

# Usage example:
# config = SecureConfig()
# encrypted_key = config.encrypt(os.getenv("OPENAI_API_KEY"))
# Store encrypted_key securely
# Later: api_key = config.decrypt(encrypted_key)
import os
from cryptography.fernet import Fernet

def generate_key() -> str:
    """Generate a new encryption key."""
    return Fernet.generate_key().decode()

def encrypt_api_key(api_key: str, key: str) -> str:
    """Encrypt the API key using Fernet symmetric encryption."""
    f = Fernet(key.encode())
    return f.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key: str, key: str) -> str:
    """Decrypt the API key using Fernet symmetric encryption."""
    f = Fernet(key.encode())
    return f.decrypt(encrypted_key.encode()).decode()

def setup_encrypted_env():
    """Interactive setup for encrypted environment variables."""
    print("🔐 Setting up encrypted API keys...")
    
    # Generate encryption key
    key = generate_key()
    print(f"Generated encryption key: {key}")
    print("⚠️  Save this key securely! You'll need it to decrypt the API key.")
    
    # Get OpenAI API key
    api_key = input("Enter your OpenAI API key: ").strip()
    if not api_key:
        print("No API key provided.")
        return
    
    # Encrypt it
    encrypted_key = encrypt_api_key(api_key, key)
    
    # Update .env file
    env_file = '.env'
    env_lines = []
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            env_lines = f.readlines()
    
    # Remove existing encrypted key lines
    env_lines = [line for line in env_lines if not line.startswith(('ENCRYPTION_KEY=', 'ENCRYPTED_OPENAI_API_KEY='))]
    
    # Add new encrypted values
    env_lines.extend([
        f'ENCRYPTION_KEY={key}\n',
        f'ENCRYPTED_OPENAI_API_KEY={encrypted_key}\n'
    ])
    
    with open(env_file, 'w') as f:
        f.writelines(env_lines)
    
    print("✅ Encrypted API key saved to .env")
    print("🔑 Keep your encryption key safe - it's needed to decrypt the API key!")

if __name__ == "__main__":
    setup_encrypted_env()
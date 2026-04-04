import qrcode
import json
import base64
import hashlib
from cryptography.fernet import Fernet
from ..core.config import settings

def get_encryption_key(password: str) -> bytes:
    """Derive a Fernet key from password"""
    key = hashlib.sha256(password.encode()).digest()
    return base64.urlsafe_b64encode(key)

def generate_qr_code(data: dict, output_path: str, encryption_password: str = None) -> str:
    """Generate encrypted QR code"""
    # Encrypt data
    key_val = encryption_password if encryption_password else settings.QR_ENCRYPTION_PASSWORD
    encryption_key = get_encryption_key(key_val)
    cipher = Fernet(encryption_key)
    
    json_data = json.dumps(data)
    encrypted_data = cipher.encrypt(json_data.encode())
    encrypted_string = encrypted_data.decode()
    
    # Generate QR
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=10,
        border=2
    )
    qr.add_data(encrypted_string)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)
    
    return output_path

def decrypt_qr_data(encrypted_string: str, encryption_password: str = None) -> dict:
    """Decrypt QR code data"""
    key_val = encryption_password if encryption_password else settings.QR_ENCRYPTION_PASSWORD
    encryption_key = get_encryption_key(key_val)
    cipher = Fernet(encryption_key)
    
    decrypted_data = cipher.decrypt(encrypted_string.encode())
    data = json.loads(decrypted_data.decode())
    
    return data

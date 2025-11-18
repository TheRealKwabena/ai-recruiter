from passlib.context import CryptContext
from datetime import *
import jwt
import os
# 1. Setup the password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Define the bcrypt 72-byte limit
BCRYPT_MAX_BYTES = 72
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
DATABASE_URL = os.getenv("DATABASE_URL")

def get_password_hash(password: str) -> str:
    """
    Hashes the password, ensuring it's truncated to 72 bytes.
    """
    # 1. Encode the password to bytes (e.g., 'utf-8')
    password_bytes = password.encode('utf-8')

    # 2. Truncate the byte string to 72 bytes
    if len(password_bytes) > BCRYPT_MAX_BYTES:
        password_bytes = password_bytes[:BCRYPT_MAX_BYTES]

    # 3. Hash the truncated byte string
    return pwd_context.hash(password_bytes)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies the password, ensuring truncation is handled for the check.
    """
    # 1. Encode the plain password to bytes
    password_bytes = plain_password.encode('utf-8')

    # 2. Truncate
    if len(password_bytes) > BCRYPT_MAX_BYTES:
        password_bytes = password_bytes[:BCRYPT_MAX_BYTES]

    # 3. Verify the truncated byte string against the hash
    return pwd_context.verify(password_bytes, hashed_password)

#Generates access token during signup
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
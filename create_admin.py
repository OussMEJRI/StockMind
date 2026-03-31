from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

db = SessionLocal()

admin = User(
    email="admin@example.com",
    hashed_password=get_password_hash("admin123"),
    first_name="Admin",
    last_name="User",
    role=UserRole.ADMIN,
    is_active=True
)

db.add(admin)
db.commit()
db.close()

print("Admin created")
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.employee import Employee
from app.models.equipment import Equipment
from app.core.security import get_password_hash

print("🔧 Création des tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables créées !")

db = SessionLocal()
try:
    admin = db.query(User).filter(User.email == "admin@sofrecom.com").first()
    if not admin:
        admin = User(
            email="admin@sofrecom.com",
            hashed_password=get_password_hash("admin123"),
            first_name="Admin",
            last_name="Sofrecom",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("✅ Utilisateur admin créé !")
    else:
        print("ℹ️ Utilisateur admin existe déjà")
except Exception as e:
    print(f"❌ Erreur : {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.models.user import User
from app.core.security import get_password_hash

print("🔧 Création des tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables créées!")

db = SessionLocal()

try:
    admin = db.query(User).filter(User.email == "admin@sofrecom.com").first()
    
    if not admin:
        print("👤 Création de l'utilisateur admin...")
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
        print("✅ Admin créé avec succès!")
        print("   📧 Email: admin@sofrecom.com")
        print("   🔑 Mot de passe: admin123")
    else:
        print("ℹ️  L'utilisateur admin existe déjà")
        
except Exception as e:
    print(f"❌ Erreur: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

print("✨ Terminé!")

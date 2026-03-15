"""
Script d'initialisation de la base de données
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.core.security import get_password_hash

def init_db():
    """Initialiser la base de données"""
    print("🔧 Création des tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées!")
    
    db: Session = SessionLocal()
    
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
            print("✅ Admin créé!")
            print("   📧 Email: admin@sofrecom.com")
            print("   🔑 Mot de passe: admin123")
        else:
            print("ℹ️  Admin existe déjà")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initialisation...")
    init_db()
    print("✨ Terminé!")

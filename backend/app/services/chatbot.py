from sqlalchemy.orm import Session
from app.models.equipment import Equipment
from app.models.emplacements import Emplacement
from typing import Dict, Any, Optional
import re


class ChatbotService:
    def __init__(self, db: Session):
        self.db = db

    async def process_query(self, question: str) -> Dict[str, Any]:
        """Traiter une question en langage naturel et retourner une réponse structurée."""
        message_lower = question.lower()

        if any(word in message_lower for word in ["emplacement", "localisation", "où", "location"]):
            return self._handle_location_query(message_lower)

        if any(word in message_lower for word in ["étage", "rosace", "salle"]):
            return self._handle_equipment_at_location_query(message_lower)

        if any(word in message_lower for word in ["équipement", "matériel", "stock", "inventaire"]):
            return self._handle_equipment_query(message_lower)

        return {
            "answer": "Je n'ai pas compris votre demande. Pouvez-vous reformuler ?",
            "data": None,
            "confidence": 0.0
        }

    def _handle_location_query(self, message: str) -> Dict[str, Any]:
        """Gérer les questions sur les emplacements."""
        equipments = self.db.query(Equipment).filter(
            Equipment.emplacement_id.isnot(None)
        ).all()

        results = []
        data_list = []

        for eq in equipments:
            if eq.emplacement:
                emp_loc = eq.emplacement
                location_str = (
                    f"{emp_loc.site}, "
                    f"Étage {emp_loc.etage}, "
                    f"Rosace {emp_loc.rosace}"
                )
                if emp_loc.exact_position:
                    location_str += f", {emp_loc.exact_position}"
                results.append(f"- {eq.model} ({eq.serial_number}) : {location_str}")
                data_list.append({
                    "equipment": eq.model,
                    "serial_number": eq.serial_number,
                    "location": location_str
                })

        if results:
            return {
                "answer": "Équipements localisés :\n" + "\n".join(results),
                "data": {"equipments": data_list},
                "confidence": 0.9
            }
        return {
            "answer": "Aucun équipement localisé trouvé.",
            "data": None,
            "confidence": 0.8
        }

    def _handle_equipment_at_location_query(self, message: str) -> Dict[str, Any]:
        """Gérer les questions sur les équipements à un emplacement."""
        query = self.db.query(Equipment).join(Emplacement)

        floor_match = re.search(r"étage\s*(\w+)", message)
        room_match = re.search(r"rosace\s*(\w+)", message)

        if floor_match:
            floor = floor_match.group(1)
            query = query.filter(Emplacement.etage.like(f"%{floor}%"))

        if room_match:
            room = room_match.group(1)
            query = query.filter(Emplacement.rosace.like(f"%{room}%"))

        equipments = query.all()

        if equipments:
            results = [f"- {eq.model} ({eq.serial_number})" for eq in equipments]
            data_list = [{"equipment": eq.model, "serial_number": eq.serial_number} for eq in equipments]
            return {
                "answer": "Équipements trouvés :\n" + "\n".join(results),
                "data": {"equipments": data_list},
                "confidence": 0.85
            }
        return {
            "answer": "Aucun équipement trouvé à cet emplacement.",
            "data": None,
            "confidence": 0.8
        }

    def _handle_equipment_query(self, message: str) -> Dict[str, Any]:
        """Gérer les questions sur les équipements."""
        total = self.db.query(Equipment).count()
        return {
            "answer": f"Il y a actuellement {total} équipement(s) dans le stock.",
            "data": {"total": total},
            "confidence": 0.95
        }

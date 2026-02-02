from sqlalchemy.orm import Session
from app.models import Equipment, Employee, Location, User
from typing import Dict, Any, Optional
import re


class ChatbotService:
    """
    Chatbot service for processing natural language queries.
    Architecture ready for LLM integration (OpenAI, Azure OpenAI, etc.)
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def process_query(self, question: str) -> Dict[str, Any]:
        """
        Process a natural language question about the inventory.
        Currently uses rule-based pattern matching, but designed for LLM integration.
        
        Args:
            question: Natural language question
        
        Returns:
            Dictionary with answer and relevant data
        """
        question_lower = question.lower()
        
        # Pattern: "où se trouve le PC/laptop/matériel de [nom]"
        if "où se trouve" in question_lower or "où est" in question_lower:
            return await self._handle_location_query(question_lower)
        
        # Pattern: "avons-nous des [type] disponibles"
        elif "disponible" in question_lower or "en stock" in question_lower:
            return await self._handle_availability_query(question_lower)
        
        # Pattern: "quel matériel est au [étage] [bureau]"
        elif "quel matériel" in question_lower and ("étage" in question_lower or "bureau" in question_lower):
            return await self._handle_equipment_at_location_query(question_lower)
        
        # Pattern: "qui a le [type] [model]"
        elif "qui a" in question_lower or "qui possède" in question_lower:
            return await self._handle_assignment_query(question_lower)
        
        else:
            return {
                "answer": "Je n'ai pas compris votre question. Essayez de demander : 'Où se trouve le PC de Jean Dupont ?' ou 'Avons-nous des laptops disponibles ?'",
                "data": None,
                "confidence": 0.0
            }
    
    async def _handle_location_query(self, question: str) -> Dict[str, Any]:
        """Handle queries about equipment location for a specific person."""
        # Extract potential employee name patterns
        employee = None
        
        # Search for employees in the database
        employees = self.db.query(Employee).all()
        for emp in employees:
            full_name = f"{emp.first_name} {emp.last_name}".lower()
            if full_name in question or emp.last_name.lower() in question:
                employee = emp
                break
        
        if not employee:
            return {
                "answer": "Je n'ai pas trouvé l'employé mentionné dans la base de données.",
                "data": None,
                "confidence": 0.5
            }
        
        # Find equipment assigned to this employee
        equipment_list = self.db.query(Equipment).filter(
            Equipment.employee_id == employee.id
        ).all()
        
        if not equipment_list:
            return {
                "answer": f"{employee.first_name} {employee.last_name} n'a actuellement aucun matériel assigné.",
                "data": {"employee": employee.id},
                "confidence": 1.0
            }
        
        # Build detailed response
        equipment_details = []
        for eq in equipment_list:
            location_str = "Non localisé"
            if eq.location:
                loc = eq.location
                location_str = f"{loc.site}, Étage {loc.floor}, Bureau {loc.room}"
                if loc.exact_position:
                    location_str += f", {loc.exact_position}"
            
            equipment_details.append({
                "type": eq.equipment_type.value,
                "model": eq.model,
                "serial_number": eq.serial_number,
                "location": location_str
            })
        
        answer = f"{employee.first_name} {employee.last_name} possède {len(equipment_list)} équipement(s) :\n"
        for eq_detail in equipment_details:
            answer += f"- {eq_detail['type']} {eq_detail['model']} (SN: {eq_detail['serial_number']}) : {eq_detail['location']}\n"
        
        return {
            "answer": answer.strip(),
            "data": {"employee_id": employee.id, "equipment": equipment_details},
            "confidence": 1.0
        }
    
    async def _handle_availability_query(self, question: str) -> Dict[str, Any]:
        """Handle queries about available equipment in stock."""
        # Determine equipment type
        equipment_type = None
        if "laptop" in question or "portable" in question:
            equipment_type = "laptop"
        elif "pc" in question and "laptop" not in question:
            equipment_type = "pc"
        elif "écran" in question or "moniteur" in question or "monitor" in question:
            equipment_type = "monitor"
        elif "téléphone" in question or "phone" in question:
            equipment_type = "phone"
        
        # Query available equipment
        query = self.db.query(Equipment).filter(Equipment.status == "in_stock")
        
        if equipment_type:
            query = query.filter(Equipment.equipment_type == equipment_type)
        
        available_equipment = query.all()
        
        if not available_equipment:
            type_str = equipment_type if equipment_type else "matériel"
            return {
                "answer": f"Il n'y a actuellement aucun {type_str} disponible en stock.",
                "data": {"count": 0, "type": equipment_type},
                "confidence": 1.0
            }
        
        type_str = equipment_type if equipment_type else "équipement"
        answer = f"Oui, nous avons {len(available_equipment)} {type_str}(s) disponible(s) en stock :\n"
        
        equipment_details = []
        for eq in available_equipment:
            answer += f"- {eq.model} (SN: {eq.serial_number}), condition: {eq.condition.value}\n"
            equipment_details.append({
                "id": eq.id,
                "model": eq.model,
                "serial_number": eq.serial_number,
                "condition": eq.condition.value
            })
        
        return {
            "answer": answer.strip(),
            "data": {"count": len(available_equipment), "equipment": equipment_details},
            "confidence": 1.0
        }
    
    async def _handle_equipment_at_location_query(self, question: str) -> Dict[str, Any]:
        """Handle queries about equipment at a specific location."""
        # Extract floor and room numbers
        floor_match = re.search(r'(\d+)(?:e|er|ème)?\s+étage', question)
        room_match = re.search(r'bureau\s+(\d+)', question)
        
        query = self.db.query(Equipment).join(Location)
        
        if floor_match:
            floor = floor_match.group(1)
            query = query.filter(Location.floor.like(f"%{floor}%"))
        
        if room_match:
            room = room_match.group(1)
            query = query.filter(Location.room.like(f"%{room}%"))
        
        equipment_list = query.all()
        
        if not equipment_list:
            return {
                "answer": "Aucun matériel trouvé à cet emplacement.",
                "data": None,
                "confidence": 0.8
            }
        
        answer = f"Matériel trouvé à cet emplacement ({len(equipment_list)} équipement(s)) :\n"
        equipment_details = []
        
        for eq in equipment_list:
            answer += f"- {eq.equipment_type.value} {eq.model} (SN: {eq.serial_number})\n"
            equipment_details.append({
                "type": eq.equipment_type.value,
                "model": eq.model,
                "serial_number": eq.serial_number
            })
        
        return {
            "answer": answer.strip(),
            "data": {"count": len(equipment_list), "equipment": equipment_details},
            "confidence": 1.0
        }
    
    async def _handle_assignment_query(self, question: str) -> Dict[str, Any]:
        """Handle queries about who has specific equipment."""
        # This is a placeholder for assignment queries
        return {
            "answer": "Fonctionnalité en cours de développement. Veuillez fournir le numéro de série pour une recherche précise.",
            "data": None,
            "confidence": 0.5
        }
    
    # Future method for LLM integration
    async def _call_llm_api(self, question: str, context: Dict[str, Any]) -> str:
        """
        Placeholder for future LLM API integration.
        Can be integrated with OpenAI, Azure OpenAI, or other LLM providers.
        
        Args:
            question: User's question
            context: Relevant context from database
        
        Returns:
            LLM-generated response
        """
        # TODO: Implement LLM API call
        # Example for OpenAI:
        # response = openai.ChatCompletion.create(
        #     model=settings.LLM_MODEL,
        #     messages=[
        #         {"role": "system", "content": "You are an IT inventory assistant."},
        #         {"role": "user", "content": f"Context: {context}\nQuestion: {question}"}
        #     ]
        # )
        # return response.choices[0].message.content
        pass

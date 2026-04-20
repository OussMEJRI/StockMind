from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.equipment import Equipment
from app.models.employee import Employee
from app.models.emplacements import Emplacement
from typing import Dict, Any
import re


class ChatbotService:
    def __init__(self, db: Session):
        self.db = db

    async def process_query(self, question: str) -> Dict[str, Any]:
        q = question.lower().strip()

        # ── Salutations ──────────────────────────────────────────────
        if any(w in q for w in ["bonjour", "salut", "hello", "bonsoir", "hi"]):
            return {"answer": "Bonjour ! 👋 Je suis votre assistant StockMind.\nJe peux répondre à toutes vos questions sur les équipements, employés et emplacements en temps réel.\n\nTapez **aide** pour voir mes capacités.", "data": None, "confidence": 1.0}

        # ── Aide ─────────────────────────────────────────────────────
        if any(w in q for w in ["aide", "help", "?", "que sais", "capacité", "commande"]):
            return {"answer": self._help(), "data": None, "confidence": 1.0}

        # ── Statistiques générales ────────────────────────────────────
        if any(w in q for w in ["statistique", "stat", "résumé", "bilan", "rapport", "overview"]):
            return self._stats()

        # ── Employés ─────────────────────────────────────────────────
        if any(w in q for w in ["employé", "employe", "personnel", "collaborateur", "salarié", "agent"]):
            return self._employees_query(q)

        # ── Emplacements ──────────────────────────────────────────────
        if any(w in q for w in ["emplacement", "site", "bureau", "étage", "rosace", "localisation", "où se trouve", "salle"]):
            return self._emplacements_query(q)

        # ── Équipements assignés / employé spécifique ─────────────────
        if any(w in q for w in ["assigné", "attribué", "affecté", "possède", "a quoi", "équipement de", "matériel de"]):
            return self._assigned_query(q)

        # ── Stock / disponible ────────────────────────────────────────
        if any(w in q for w in ["stock", "disponible", "libre", "non assigné"]):
            return self._stock_query(q)

        # ── Maintenance ───────────────────────────────────────────────
        if any(w in q for w in ["maintenance", "panne", "réparation", "hors service"]):
            return self._maintenance_query()

        # ── Laptops ───────────────────────────────────────────────────
        if any(w in q for w in ["laptop", "portable", "ordinateur portable"]):
            return self._type_query("LAPTOP", "💻 Laptops")

        # ── PC ────────────────────────────────────────────────────────
        if any(w in q for w in ["pc", "ordinateur de bureau", "desktop"]):
            return self._type_query("PC", "🖥️ PC de bureau")

        # ── Écrans ────────────────────────────────────────────────────
        if any(w in q for w in ["écran", "monitor", "moniteur", "display"]):
            return self._type_query("MONITOR", "🖵 Écrans")

        # ── Téléphones ────────────────────────────────────────────────
        if any(w in q for w in ["téléphone", "phone", "mobile", "smartphone"]):
            return self._type_query("PHONE", "📱 Téléphones")

        # ── Accessoires ───────────────────────────────────────────────
        if any(w in q for w in ["accessoire", "périphérique", "clavier", "souris", "imprimante"]):
            return self._type_query("ACCESSORY", "🖱️ Accessoires")

        # ── Équipements général ───────────────────────────────────────
        if any(w in q for w in ["équipement", "materiel", "matériel", "inventaire", "parc"]):
            return self._equipment_query(q)

        # ── Numéro de série ───────────────────────────────────────────
        serial_match = re.search(r'\b([A-Z0-9]{5,})\b', question)
        if serial_match:
            return self._serial_query(serial_match.group(1))

        # ── Recherche par nom ─────────────────────────────────────────
        name_match = re.search(r"(?:cherche|trouve|info|informations? sur|qui est|quel est)\s+(.+)", q)
        if name_match:
            return self._search_query(name_match.group(1).strip())

        return {
            "answer": "🤔 Je n'ai pas compris votre question.\n\nEssayez par exemple :\n• *Combien d'équipements en stock ?*\n• *Liste des employés du département IT*\n• *Quel équipement est assigné à Jean Dupont ?*\n\nTapez **aide** pour plus d'exemples.",
            "data": None,
            "confidence": 0.0
        }

    # ─────────────────────────────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────────────────────────────

    def _help(self) -> str:
        return (
            "📋 **Ce que je sais faire :**\n\n"
            "📊 **Statistiques**\n"
            "  → *statistiques*, *bilan*, *résumé*\n\n"
            "💻 **Équipements**\n"
            "  → *combien d'équipements ?*\n"
            "  → *équipements en stock*\n"
            "  → *équipements en maintenance*\n"
            "  → *liste des laptops / PC / écrans / téléphones*\n"
            "  → *numéro de série SN12345*\n\n"
            "👥 **Employés**\n"
            "  → *liste des employés*\n"
            "  → *employés du département IT*\n"
            "  → *équipement de Jean Dupont*\n\n"
            "📍 **Emplacements**\n"
            "  → *liste des emplacements*\n"
            "  → *équipements au site Paris*\n"
            "  → *équipements à l'étage 3*\n\n"
            "🔍 **Recherche**\n"
            "  → *cherche Jean Dupont*\n"
            "  → *info sur SN-ABC123*"
        )

    def _stats(self) -> Dict[str, Any]:
        total_eq   = self.db.query(func.count(Equipment.id)).scalar() or 0
        in_stock   = self.db.query(func.count(Equipment.id)).filter(Equipment.status == "IN_STOCK").scalar() or 0
        assigned   = self.db.query(func.count(Equipment.id)).filter(Equipment.status == "ASSIGNED").scalar() or 0
        mainten    = self.db.query(func.count(Equipment.id)).filter(Equipment.status == "MAINTENANCE").scalar() or 0
        retired    = self.db.query(func.count(Equipment.id)).filter(Equipment.status == "RETIRED").scalar() or 0
        total_emp  = self.db.query(func.count(Employee.id)).scalar() or 0
        total_loc  = self.db.query(func.count(Emplacement.id)).scalar() or 0

        # Par type
        types = self.db.query(Equipment.equipment_type, func.count(Equipment.id))\
            .group_by(Equipment.equipment_type).all()
        type_lines = "\n".join([f"  • {t}: {c}" for t, c in types])

        # Départements
        depts = self.db.query(Employee.department, func.count(Employee.id))\
            .group_by(Employee.department).all()
        dept_lines = "\n".join([f"  • {d or 'Non défini'}: {c}" for d, c in depts])

        answer = (
            f"📊 **Bilan en temps réel :**\n\n"
            f"💻 **Équipements : {total_eq}**\n"
            f"  • En stock : {in_stock}\n"
            f"  • Assignés : {assigned}\n"
            f"  • En maintenance : {mainten}\n"
            f"  • Retirés : {retired}\n\n"
            f"📦 **Par type :**\n{type_lines}\n\n"
            f"👥 **Employés : {total_emp}**\n"
            f"  Par département :\n{dept_lines}\n\n"
            f"📍 **Emplacements : {total_loc}**"
        )
        return {
            "answer": answer,
            "data": {
                "total_equipment": total_eq,
                "in_stock": in_stock,
                "assigned": assigned,
                "maintenance": mainten,
                "total_employees": total_emp,
                "total_locations": total_loc
            },
            "confidence": 1.0
        }

    def _employees_query(self, q: str) -> Dict[str, Any]:
        # Recherche par département
        dept_match = re.search(
            r"(?:département|departement|dept|service|équipe)\s+([a-zA-ZÀ-ÿ0-9\s\-]+)", q
        )
        if dept_match:
            dept = dept_match.group(1).strip()
            employees = self.db.query(Employee).filter(
                Employee.department.ilike(f"%{dept}%")
            ).all()
            if employees:
                lines = [f"  • {e.first_name} {e.last_name} ({e.email})" for e in employees]
                return {
                    "answer": f"👥 **Employés du département '{dept}' ({len(employees)}) :**\n" + "\n".join(lines),
                    "data": {"employees": [{"name": f"{e.first_name} {e.last_name}", "email": e.email, "department": e.department} for e in employees]},
                    "confidence": 0.95
                }
            return {"answer": f"❌ Aucun employé trouvé dans le département '{dept}'.", "data": None, "confidence": 0.8}

        # Recherche par nom dans la question
        name_match = re.search(r"(?:employé|employe|info sur|cherche)\s+([a-zA-ZÀ-ÿ\s]+)", q)
        if name_match:
            name = name_match.group(1).strip()
            parts = name.split()
            filters = [
                or_(
                    Employee.first_name.ilike(f"%{p}%"),
                    Employee.last_name.ilike(f"%{p}%")
                ) for p in parts
            ]
            employees = self.db.query(Employee).filter(*filters).all()
            if employees:
                lines = []
                for e in employees:
                    # Équipements assignés
                    eqs = self.db.query(Equipment).filter(Equipment.employee_id == e.id).all()
                    eq_str = ", ".join([f"{eq.model} ({eq.serial_number})" for eq in eqs]) if eqs else "Aucun"
                    lines.append(f"  • **{e.first_name} {e.last_name}** — {e.department or 'N/A'}\n    📧 {e.email}\n    💻 Équipements : {eq_str}")
                return {
                    "answer": f"👤 **Résultat ({len(employees)}) :**\n" + "\n".join(lines),
                    "data": None,
                    "confidence": 0.9
                }

        # Liste générale
        total = self.db.query(func.count(Employee.id)).scalar() or 0
        depts = self.db.query(Employee.department, func.count(Employee.id))\
            .group_by(Employee.department).all()
        lines = [f"  • {d or 'Non défini'} : {c} employé(s)" for d, c in depts]
        return {
            "answer": f"👥 **{total} employés au total :**\n" + "\n".join(lines),
            "data": {"total": total},
            "confidence": 0.95
        }

    def _emplacements_query(self, q: str) -> Dict[str, Any]:
        # Recherche par site
        site_match = re.search(r"(?:site|à|au|de)\s+([a-zA-ZÀ-ÿ0-9\s\-]+?)(?:\s|$)", q)
        etage_match = re.search(r"étage\s*(\w+)", q)
        rosace_match = re.search(r"rosace\s*(\w+)", q)

        query = self.db.query(Emplacement)
        filters_applied = []

        if site_match:
            site = site_match.group(1).strip()
            query = query.filter(Emplacement.site.ilike(f"%{site}%"))
            filters_applied.append(f"site '{site}'")
        if etage_match:
            etage = etage_match.group(1)
            query = query.filter(Emplacement.etage.ilike(f"%{etage}%"))
            filters_applied.append(f"étage {etage}")
        if rosace_match:
            rosace = rosace_match.group(1)
            query = query.filter(Emplacement.rosace.ilike(f"%{rosace}%"))
            filters_applied.append(f"rosace {rosace}")

        emplacements = query.all()

        if not emplacements and not filters_applied:
            # Liste générale
            all_emps = self.db.query(Emplacement).all()
            sites = {}
            for e in all_emps:
                sites[e.site] = sites.get(e.site, 0) + 1
            lines = [f"  • {s} : {c} emplacement(s)" for s, c in sites.items()]
            return {
                "answer": f"📍 **{len(all_emps)} emplacements au total :**\n" + "\n".join(lines),
                "data": {"total": len(all_emps)},
                "confidence": 0.95
            }

        if emplacements:
            lines = []
            for emp in emplacements:
                eq_count = self.db.query(func.count(Equipment.id))\
                    .filter(Equipment.emplacement_id == emp.id).scalar() or 0
                lines.append(
                    f"  • **{emp.site}** — Étage {emp.etage}, Rosace {emp.rosace}"
                    + (f", {emp.exact_position}" if hasattr(emp, 'exact_position') and emp.exact_position else "")
                    + f" → {eq_count} équipement(s)"
                )
            filter_str = " / ".join(filters_applied) if filters_applied else ""
            return {
                "answer": f"📍 **Emplacements{' (' + filter_str + ')' if filter_str else ''} ({len(emplacements)}) :**\n" + "\n".join(lines),
                "data": {"count": len(emplacements)},
                "confidence": 0.9
            }

        return {"answer": "❌ Aucun emplacement trouvé avec ces critères.", "data": None, "confidence": 0.7}

    def _assigned_query(self, q: str) -> Dict[str, Any]:
        # Chercher un nom dans la question
        name_match = re.search(
            r"(?:assigné à|attribué à|affecté à|de|possède|équipement de|matériel de)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\s*\?|$)",
            q
        )
        if name_match:
            name = name_match.group(1).strip()
            parts = name.split()
            filters = [
                or_(Employee.first_name.ilike(f"%{p}%"), Employee.last_name.ilike(f"%{p}%"))
                for p in parts if len(p) > 2
            ]
            if filters:
                employees = self.db.query(Employee).filter(*filters).all()
                if employees:
                    results = []
                    for emp in employees:
                        eqs = self.db.query(Equipment).filter(Equipment.employee_id == emp.id).all()
                        if eqs:
                            eq_lines = [f"    → {eq.equipment_type} | {eq.model} | SN: {eq.serial_number} | État: {eq.condition}" for eq in eqs]
                            results.append(f"👤 **{emp.first_name} {emp.last_name}** ({emp.department or 'N/A'}) :\n" + "\n".join(eq_lines))
                        else:
                            results.append(f"👤 **{emp.first_name} {emp.last_name}** : Aucun équipement assigné")
                    return {"answer": "\n\n".join(results), "data": None, "confidence": 0.95}

        # Tous les équipements assignés
        assigned = self.db.query(Equipment).filter(Equipment.status == "ASSIGNED").all()
        lines = []
        for eq in assigned:
            if eq.employee_id:
                emp = self.db.query(Employee).filter(Employee.id == eq.employee_id).first()
                emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Inconnu"
                lines.append(f"  • {eq.model} ({eq.serial_number}) → 👤 {emp_name}")
            elif eq.emplacement_id:
                loc = self.db.query(Emplacement).filter(Emplacement.id == eq.emplacement_id).first()
                loc_str = f"{loc.site} Ét.{loc.etage} R.{loc.rosace}" if loc else "Inconnu"
                lines.append(f"  • {eq.model} ({eq.serial_number}) → 📍 {loc_str}")

        if lines:
            return {
                "answer": f"📋 **{len(assigned)} équipements assignés :**\n" + "\n".join(lines[:20])
                + ("\n  *(et plus...)*" if len(lines) > 20 else ""),
                "data": {"count": len(assigned)},
                "confidence": 0.9
            }
        return {"answer": "📋 Aucun équipement assigné actuellement.", "data": None, "confidence": 0.9}

    def _stock_query(self, q: str) -> Dict[str, Any]:
        # Par type si précisé
        type_map = {
            "laptop": "LAPTOP", "portable": "LAPTOP",
            "pc": "PC", "desktop": "PC",
            "écran": "MONITOR", "monitor": "MONITOR",
            "téléphone": "PHONE", "phone": "PHONE",
            "accessoire": "ACCESSORY"
        }
        for keyword, eq_type in type_map.items():
            if keyword in q:
                items = self.db.query(Equipment).filter(
                    Equipment.status == "IN_STOCK",
                    Equipment.equipment_type == eq_type
                ).all()
                lines = [f"  • {e.model} | SN: {e.serial_number} | État: {e.condition}" for e in items]
                return {
                    "answer": f"📦 **{eq_type} en stock ({len(items)}) :**\n" + ("\n".join(lines) if lines else "  Aucun"),
                    "data": {"count": len(items)},
                    "confidence": 0.95
                }

        # Stock général
        items = self.db.query(Equipment).filter(Equipment.status == "IN_STOCK").all()
        by_type: Dict[str, int] = {}
        for e in items:
            by_type[e.equipment_type] = by_type.get(e.equipment_type, 0) + 1
        lines = [f"  • {t} : {c}" for t, c in by_type.items()]
        return {
            "answer": f"📦 **{len(items)} équipements disponibles en stock :**\n" + "\n".join(lines),
            "data": {"total_in_stock": len(items), "by_type": by_type},
            "confidence": 0.95
        }

    def _maintenance_query(self) -> Dict[str, Any]:
        items = self.db.query(Equipment).filter(Equipment.status == "MAINTENANCE").all()
        if not items:
            return {"answer": "✅ Aucun équipement en maintenance actuellement.", "data": None, "confidence": 0.95}
        lines = [f"  • {e.equipment_type} | {e.model} | SN: {e.serial_number} | État: {e.condition}" for e in items]
        return {
            "answer": f"🔧 **{len(items)} équipement(s) en maintenance :**\n" + "\n".join(lines),
            "data": {"count": len(items)},
            "confidence": 0.95
        }

    def _type_query(self, eq_type: str, label: str) -> Dict[str, Any]:
        items = self.db.query(Equipment).filter(Equipment.equipment_type == eq_type).all()
        in_stock  = sum(1 for e in items if e.status == "IN_STOCK")
        assigned  = sum(1 for e in items if e.status == "ASSIGNED")
        mainten   = sum(1 for e in items if e.status == "MAINTENANCE")

        # Modèles distincts
        models: Dict[str, int] = {}
        for e in items:
            models[e.model or "Inconnu"] = models.get(e.model or "Inconnu", 0) + 1
        model_lines = "\n".join([f"  • {m} : {c}" for m, c in sorted(models.items(), key=lambda x: -x[1])[:10]])

        return {
            "answer": (
                f"{label} — **{len(items)} au total**\n\n"
                f"  • En stock : {in_stock}\n"
                f"  • Assignés : {assigned}\n"
                f"  • En maintenance : {mainten}\n\n"
                f"📋 **Modèles :**\n{model_lines}"
            ),
            "data": {"total": len(items), "in_stock": in_stock, "assigned": assigned},
            "confidence": 0.95
        }

    def _equipment_query(self, q: str) -> Dict[str, Any]:
        total = self.db.query(func.count(Equipment.id)).scalar() or 0
        types = self.db.query(Equipment.equipment_type, func.count(Equipment.id))\
            .group_by(Equipment.equipment_type).all()
        statuses = self.db.query(Equipment.status, func.count(Equipment.id))\
            .group_by(Equipment.status).all()

        type_lines   = "\n".join([f"  • {t} : {c}" for t, c in types])
        status_lines = "\n".join([f"  • {s} : {c}" for s, c in statuses])

        return {
            "answer": (
                f"💻 **Inventaire équipements — {total} au total**\n\n"
                f"📦 **Par type :**\n{type_lines}\n\n"
                f"📊 **Par statut :**\n{status_lines}"
            ),
            "data": {"total": total},
            "confidence": 0.95
        }

    def _serial_query(self, serial: str) -> Dict[str, Any]:
        eq = self.db.query(Equipment).filter(
            Equipment.serial_number.ilike(f"%{serial}%")
        ).first()
        if not eq:
            return {"answer": f"❌ Aucun équipement trouvé avec le numéro de série '{serial}'.", "data": None, "confidence": 0.8}

        # Assignation
        assign_str = "Non assigné"
        if eq.employee_id:
            emp = self.db.query(Employee).filter(Employee.id == eq.employee_id).first()
            if emp:
                assign_str = f"👤 {emp.first_name} {emp.last_name} ({emp.department or 'N/A'})"
        elif eq.emplacement_id:
            loc = self.db.query(Emplacement).filter(Emplacement.id == eq.emplacement_id).first()
            if loc:
                assign_str = f"📍 {loc.site} — Étage {loc.etage}, Rosace {loc.rosace}"

        return {
            "answer": (
                f"🔍 **Équipement trouvé :**\n\n"
                f"  • Type : {eq.equipment_type}\n"
                f"  • Modèle : {eq.model or 'N/A'}\n"
                f"  • N° Série : {eq.serial_number}\n"
                f"  • Statut : {eq.status}\n"
                f"  • État : {eq.condition}\n"
                f"  • Assigné à : {assign_str}"
            ),
            "data": {"serial_number": eq.serial_number, "model": eq.model, "status": eq.status},
            "confidence": 1.0
        }

    def _search_query(self, term: str) -> Dict[str, Any]:
        results = []

        # Chercher dans les employés
        parts = term.split()
        emp_filters = [
            or_(Employee.first_name.ilike(f"%{p}%"), Employee.last_name.ilike(f"%{p}%"))
            for p in parts if len(p) > 1
        ]
        if emp_filters:
            employees = self.db.query(Employee).filter(*emp_filters).all()
            for emp in employees:
                eqs = self.db.query(Equipment).filter(Equipment.employee_id == emp.id).all()
                eq_str = ", ".join([f"{e.model} ({e.serial_number})" for e in eqs]) if eqs else "Aucun"
                results.append(
                    f"👤 **{emp.first_name} {emp.last_name}**\n"
                    f"  📧 {emp.email} | 🏢 {emp.department or 'N/A'}\n"
                    f"  💻 Équipements : {eq_str}"
                )

        # Chercher dans les équipements (modèle ou serial)
        eqs = self.db.query(Equipment).filter(
            or_(
                Equipment.serial_number.ilike(f"%{term}%"),
                Equipment.model.ilike(f"%{term}%")
            )
        ).limit(5).all()
        for eq in eqs:
            results.append(
                f"💻 **{eq.model or 'N/A'}** (SN: {eq.serial_number})\n"
                f"  Type: {eq.equipment_type} | Statut: {eq.status} | État: {eq.condition}"
            )

        if results:
            return {
                "answer": f"🔍 **Résultats pour '{term}' ({len(results)}) :**\n\n" + "\n\n".join(results),
                "data": None,
                "confidence": 0.9
            }
        return {
            "answer": f"❌ Aucun résultat pour '{term}'.",
            "data": None,
            "confidence": 0.7
        }

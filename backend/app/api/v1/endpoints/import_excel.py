from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.deps import get_current_user  # ✅ récupère l’utilisateur authentifié
from app.models.equipment import Equipment, EquipmentType, EquipmentCondition, EquipmentStatus
from app.db.session import get_db
import pandas as pd

router = APIRouter()


@router.post("/import", status_code=status.HTTP_200_OK)
def import_equipment(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import Excel file containing equipment.
    Only authenticated users can import.
    """
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit être au format Excel (.xlsx ou .xls)"
        )

    try:
        # Lire le fichier Excel avec pandas
        df = pd.read_excel(file.file)

        # Exemple de colonnes attendues : serial_number, model, equipment_type, condition, status
        for _, row in df.iterrows():
            eq = Equipment(
                serial_number=str(row['serial_number']),
                model=row['model'],
                equipment_type=row.get('equipment_type', EquipmentType.PC),
                condition=row.get('condition', EquipmentCondition.NEW),
                status=row.get('status', EquipmentStatus.IN_STOCK)
            )
            db.add(eq)

        db.commit()

        return JSONResponse(content={"detail": "Import réussi ✅"})

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'import : {str(e)}"
        )
        from .import_excel import router as import_excel_router
router.include_router(import_excel_router, prefix="/import", tags=["Import"])
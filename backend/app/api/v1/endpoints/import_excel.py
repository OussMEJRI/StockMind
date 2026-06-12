from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.deps import get_current_user
from app.db.session import get_db
import pandas as pd
import unicodedata

router = APIRouter()


COLUMN_ALIASES = {
    "n serie": "serial_number",
    "numero serie": "serial_number",
    "serial number": "serial_number",
    "serial_number": "serial_number",

    "modele": "model",
    "model": "model",

    "type": "equipment_type",
    "equipment type": "equipment_type",
    "equipment_type": "equipment_type",

    "etat": "condition",
    "condition": "condition",

    "statut": "status",
    "status": "status",
}


TYPE_VALUES = {
    "laptop": ["laptop"],
    "ordinateur portable": ["laptop"],
    "portable": ["laptop"],

    "monitor": ["monitor"],
    "ecran": ["monitor"],
    "screen": ["monitor"],

    "pc": ["pc"],
    "pc de bureau": ["pc"],
    "desktop": ["pc"],
}


CONDITION_VALUES = {
    "new": ["new"],
    "neuf": ["new"],
    "nouveau": ["new"],

    "good": ["good", "used"],
    "bon": ["good", "used"],
    "bon etat": ["good", "used"],

    "fair": ["fair", "used"],
    "correct": ["fair", "used"],
    "etat correct": ["fair", "used"],

    "poor": ["poor", "out_of_service"],
    "mauvais": ["poor", "out_of_service"],
    "mauvais etat": ["poor", "out_of_service"],
}


STATUS_VALUES = {
    "in_stock": ["in_stock"],
    "in stock": ["in_stock"],
    "en stock": ["in_stock"],
    "stock": ["in_stock"],

    "assigned": ["assigned"],
    "assigne": ["assigned"],
    "affecte": ["assigned"],
}


def normalize_text(value) -> str:
    if pd.isna(value):
        return ""

    text_value = str(value).strip().lower()
    text_value = unicodedata.normalize("NFKD", text_value)
    text_value = "".join(char for char in text_value if not unicodedata.combining(char))

    for char in ["°", "*", "_", "-", "/", "\\", ".", ":"]:
        text_value = text_value.replace(char, " ")

    return " ".join(text_value.split())


def clean_cell(value):
    if pd.isna(value):
        return None

    value = str(value).strip()
    return value if value else None


def rename_excel_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename_map = {}

    for column in df.columns:
        normalized = normalize_text(column)
        mapped = COLUMN_ALIASES.get(normalized)

        if mapped:
            rename_map[column] = mapped

    return df.rename(columns=rename_map)


def get_db_enum_values(db: Session, enum_name: str) -> list[str]:
    rows = db.execute(
        text(
            """
            SELECT e.enumlabel
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = :enum_name
            ORDER BY e.enumsortorder
            """
        ),
        {"enum_name": enum_name},
    ).fetchall()

    values = [row[0] for row in rows]

    if not values:
        raise ValueError(f"Type PostgreSQL ENUM introuvable: {enum_name}")

    return values


def choose_db_enum_label(
    raw_value,
    aliases: dict,
    db_values: list[str],
    column_name: str,
    row_number: int,
) -> str:
    value = clean_cell(raw_value)

    if not value:
        raise ValueError(f"Ligne {row_number}: la colonne '{column_name}' est obligatoire")

    normalized = normalize_text(value)
    possible_values = aliases.get(normalized, [normalized])

    normalized_db_values = {
        normalize_text(db_value): db_value
        for db_value in db_values
    }

    for possible_value in possible_values:
        normalized_possible_value = normalize_text(possible_value)

        if normalized_possible_value in normalized_db_values:
            return normalized_db_values[normalized_possible_value]

    accepted = ", ".join(db_values)

    raise ValueError(
        f"Ligne {row_number}: valeur invalide pour '{column_name}' = '{value}'. "
        f"Valeurs acceptées par la base: {accepted}"
    )


def choose_optional_status(raw_value, db_values: list[str], row_number: int) -> str:
    value = clean_cell(raw_value)

    if not value:
        return choose_db_enum_label("in_stock", STATUS_VALUES, db_values, "Statut", row_number)

    return choose_db_enum_label(value, STATUS_VALUES, db_values, "Statut", row_number)


@router.post("/equipment", status_code=status.HTTP_200_OK)
def import_equipment(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit être au format Excel (.xlsx ou .xls)",
        )

    try:
        df = pd.read_excel(file.file)
        df = df.dropna(how="all")
        df = rename_excel_columns(df)

        required_columns = [
            "serial_number",
            "model",
            "equipment_type",
            "condition",
        ]

        missing_columns = [
            column for column in required_columns
            if column not in df.columns
        ]

        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Colonnes obligatoires manquantes: "
                    + ", ".join(missing_columns)
                    + ". Colonnes attendues: N° Série*, Modèle*, Type*, État*, Statut."
                ),
            )

        db_equipment_types = get_db_enum_values(db, "equipmenttype")
        db_conditions = get_db_enum_values(db, "equipmentcondition")
        db_statuses = get_db_enum_values(db, "equipmentstatus")

        imported_count = 0
        skipped_duplicates = 0
        seen_serials = set()

        for index, row in df.iterrows():
            row_number = index + 2

            serial_number = clean_cell(row.get("serial_number"))
            model = clean_cell(row.get("model"))

            if not serial_number:
                raise ValueError(f"Ligne {row_number}: la colonne 'N° Série*' est obligatoire")

            if not model:
                raise ValueError(f"Ligne {row_number}: la colonne 'Modèle*' est obligatoire")

            if serial_number in seen_serials:
                skipped_duplicates += 1
                continue

            seen_serials.add(serial_number)

            existing_equipment = db.execute(
                text("SELECT id FROM equipment WHERE serial_number = :serial_number LIMIT 1"),
                {"serial_number": serial_number},
            ).first()

            if existing_equipment:
                skipped_duplicates += 1
                continue

            equipment_type = choose_db_enum_label(
                row.get("equipment_type"),
                TYPE_VALUES,
                db_equipment_types,
                "Type*",
                row_number,
            )

            condition = choose_db_enum_label(
                row.get("condition"),
                CONDITION_VALUES,
                db_conditions,
                "État*",
                row_number,
            )

            equipment_status = choose_optional_status(
                row.get("status"),
                db_statuses,
                row_number,
            )

            db.execute(
                text(
                    """
                    INSERT INTO equipment
                        (serial_number, model, equipment_type, condition, status, created_at, updated_at)
                    VALUES
                        (
                            :serial_number,
                            :model,
                            CAST(:equipment_type AS equipmenttype),
                            CAST(:condition AS equipmentcondition),
                            CAST(:status AS equipmentstatus),
                            NOW(),
                            NOW()
                        )
                    """
                ),
                {
                    "serial_number": serial_number,
                    "model": model,
                    "equipment_type": equipment_type,
                    "condition": condition,
                    "status": equipment_status,
                },
            )

            imported_count += 1

        db.commit()

        return {
            "detail": "Import Excel terminé",
            "imported": imported_count,
            "skipped_duplicates": skipped_duplicates,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de l'import Excel : {str(e)}",
        )
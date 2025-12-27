from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from . import models, schemas


# Vendor CRUD
def get_vendor(db: Session, vendor_id: int) -> Optional[models.Vendor]:
    return db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()


def get_vendor_by_name(db: Session, name: str) -> Optional[models.Vendor]:
    return db.query(models.Vendor).filter(models.Vendor.name == name).first()


def get_vendors(db: Session, skip: int = 0, limit: int = 100) -> List[models.Vendor]:
    return db.query(models.Vendor).offset(skip).limit(limit).all()


def create_vendor(db: Session, vendor: schemas.VendorCreate) -> models.Vendor:
    db_vendor = models.Vendor(**vendor.model_dump())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


def update_vendor(db: Session, vendor_id: int, vendor: schemas.VendorUpdate) -> Optional[models.Vendor]:
    db_vendor = get_vendor(db, vendor_id)
    if db_vendor:
        update_data = vendor.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_vendor, key, value)
        db.commit()
        db.refresh(db_vendor)
    return db_vendor


def delete_vendor(db: Session, vendor_id: int) -> bool:
    db_vendor = get_vendor(db, vendor_id)
    if db_vendor:
        db.delete(db_vendor)
        db.commit()
        return True
    return False


# Filament CRUD
def get_filament(db: Session, filament_id: int) -> Optional[models.Filament]:
    return db.query(models.Filament).filter(models.Filament.id == filament_id).first()


def get_filament_by_name(db: Session, name: str) -> Optional[models.Filament]:
    return db.query(models.Filament).filter(models.Filament.name == name).first()


def get_filaments(db: Session, skip: int = 0, limit: int = 100) -> List[models.Filament]:
    return db.query(models.Filament).offset(skip).limit(limit).all()


def create_filament(db: Session, filament: schemas.FilamentCreate) -> models.Filament:
    db_filament = models.Filament(**filament.model_dump())
    db.add(db_filament)
    db.commit()
    db.refresh(db_filament)
    return db_filament


def update_filament(db: Session, filament_id: int, filament: schemas.FilamentUpdate) -> Optional[models.Filament]:
    db_filament = get_filament(db, filament_id)
    if db_filament:
        update_data = filament.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_filament, key, value)
        db.commit()
        db.refresh(db_filament)
    return db_filament


def delete_filament(db: Session, filament_id: int) -> bool:
    db_filament = get_filament(db, filament_id)
    if db_filament:
        db.delete(db_filament)
        db.commit()
        return True
    return False


# Purchase CRUD
def get_purchase(db: Session, purchase_id: int) -> Optional[models.Purchase]:
    return db.query(models.Purchase).filter(models.Purchase.id == purchase_id).first()


def get_purchases(db: Session, skip: int = 0, limit: int = 100) -> List[models.Purchase]:
    return db.query(models.Purchase).offset(skip).limit(limit).all()


def create_purchase(db: Session, purchase: schemas.PurchaseCreate) -> models.Purchase:
    # Create purchase without items first
    purchase_data = purchase.model_dump(exclude={'items'})
    db_purchase = models.Purchase(**purchase_data)
    db.add(db_purchase)
    db.flush()  # Get the purchase ID before adding items

    # Create purchase items
    for item in purchase.items:
        item_data = item.model_dump()
        db_item = models.PurchaseItem(**item_data, purchase_id=db_purchase.id)
        db.add(db_item)

    db.commit()
    db.refresh(db_purchase)
    return db_purchase


def update_purchase(db: Session, purchase_id: int, purchase: schemas.PurchaseUpdate) -> Optional[models.Purchase]:
    db_purchase = get_purchase(db, purchase_id)
    if db_purchase:
        update_data = purchase.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_purchase, key, value)
        db.commit()
        db.refresh(db_purchase)
    return db_purchase


def delete_purchase(db: Session, purchase_id: int) -> bool:
    db_purchase = get_purchase(db, purchase_id)
    if db_purchase:
        db.delete(db_purchase)
        db.commit()
        return True
    return False


# Purchase Item CRUD
def get_purchase_item(db: Session, item_id: int) -> Optional[models.PurchaseItem]:
    return db.query(models.PurchaseItem).filter(models.PurchaseItem.id == item_id).first()


def get_purchase_items(db: Session, skip: int = 0, limit: int = 100) -> List[models.PurchaseItem]:
    return db.query(models.PurchaseItem).offset(skip).limit(limit).all()


def get_purchase_items_by_purchase(db: Session, purchase_id: int) -> List[models.PurchaseItem]:
    return db.query(models.PurchaseItem).filter(models.PurchaseItem.purchase_id == purchase_id).all()


def update_purchase_item(db: Session, item_id: int, item: schemas.PurchaseItemUpdate) -> Optional[models.PurchaseItem]:
    db_item = get_purchase_item(db, item_id)
    if db_item:
        update_data = item.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item


def delete_purchase_item(db: Session, item_id: int) -> bool:
    db_item = get_purchase_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False


# Spool CRUD
def get_spool(db: Session, spool_id: int) -> Optional[models.Spool]:
    return db.query(models.Spool).filter(models.Spool.id == spool_id).first()


def get_spools(db: Session, skip: int = 0, limit: int = 100) -> List[models.Spool]:
    return db.query(models.Spool).offset(skip).limit(limit).all()


def get_spools_by_filament(db: Session, filament_name: str) -> List[models.Spool]:
    return db.query(models.Spool).filter(models.Spool.filament_name == filament_name).all()


def create_spool(db: Session, spool: schemas.SpoolCreate) -> models.Spool:
    db_spool = models.Spool(**spool.model_dump())
    db.add(db_spool)
    db.commit()
    db.refresh(db_spool)
    return db_spool


def update_spool(db: Session, spool_id: int, spool: schemas.SpoolUpdate) -> Optional[models.Spool]:
    db_spool = get_spool(db, spool_id)
    if db_spool:
        update_data = spool.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_spool, key, value)
        db.commit()
        db.refresh(db_spool)
    return db_spool


def delete_spool(db: Session, spool_id: int) -> bool:
    db_spool = get_spool(db, spool_id)
    if db_spool:
        db.delete(db_spool)
        db.commit()
        return True
    return False


# Inventory calculations
def get_inventory_summary(db: Session) -> List[dict]:
    """Calculate inventory summary for each filament"""
    filaments = get_filaments(db, limit=1000)
    summaries = []

    for filament in filaments:
        # Calculate total purchased
        purchased = db.query(
            func.sum(models.PurchaseItem.spools * models.PurchaseItem.kg_per_spool)
        ).filter(models.PurchaseItem.filament_name == filament.name).scalar() or 0.0

        # Count spools
        total_spools = db.query(
            func.sum(models.PurchaseItem.spools)
        ).filter(models.PurchaseItem.filament_name == filament.name).scalar() or 0

        opened_spools_count = db.query(func.count(models.Spool.id)).filter(
            models.Spool.filament_name == filament.name
        ).scalar() or 0

        finished_spools_count = db.query(func.count(models.Spool.id)).filter(
            models.Spool.filament_name == filament.name,
            models.Spool.date_finished.isnot(None)
        ).scalar() or 0

        # Calculate remaining in opened spools
        remaining_opened = db.query(
            func.sum(models.Spool.remaining_kg)
        ).filter(
            models.Spool.filament_name == filament.name,
            models.Spool.date_finished.is_(None)
        ).scalar() or 0.0

        unopened_count = total_spools - opened_spools_count

        # Calculate average kg per spool for unopened spools
        avg_kg_per_spool = db.query(
            func.avg(models.PurchaseItem.kg_per_spool)
        ).filter(models.PurchaseItem.filament_name == filament.name).scalar() or 0.0

        # Total remaining = unopened spools at full weight + remaining in opened spools
        unopened_kg = unopened_count * avg_kg_per_spool
        total_remaining = remaining_opened + unopened_kg

        summaries.append({
            "filament_name": filament.name,
            "manufacturer": filament.manufacturer,
            "material": filament.material,
            "color": filament.color,
            "total_purchased_kg": float(purchased),
            "total_opened_kg": float(purchased - total_remaining) if total_remaining > 0 else float(purchased),
            "total_remaining_kg": float(total_remaining),
            "unopened_spools": unopened_count,
            "opened_spools": opened_spools_count - finished_spools_count,
            "finished_spools": finished_spools_count,
        })

    return summaries

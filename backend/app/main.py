from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Filament Inventory API",
    description="API for tracking 3D printing filament inventory, purchases, and spools",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Filament Inventory API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# Vendor endpoints
@app.post("/vendors/", response_model=schemas.Vendor, tags=["Vendors"])
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor = crud.get_vendor_by_name(db, name=vendor.name)
    if db_vendor:
        raise HTTPException(status_code=400, detail="Vendor already exists")
    return crud.create_vendor(db=db, vendor=vendor)


@app.get("/vendors/", response_model=List[schemas.Vendor], tags=["Vendors"])
def read_vendors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_vendors(db, skip=skip, limit=limit)


@app.get("/vendors/{vendor_id}", response_model=schemas.Vendor, tags=["Vendors"])
def read_vendor(vendor_id: int, db: Session = Depends(get_db)):
    db_vendor = crud.get_vendor(db, vendor_id=vendor_id)
    if db_vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return db_vendor


@app.put("/vendors/{vendor_id}", response_model=schemas.Vendor, tags=["Vendors"])
def update_vendor(vendor_id: int, vendor: schemas.VendorUpdate, db: Session = Depends(get_db)):
    db_vendor = crud.update_vendor(db, vendor_id=vendor_id, vendor=vendor)
    if db_vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return db_vendor


@app.delete("/vendors/{vendor_id}", tags=["Vendors"])
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    success = crud.delete_vendor(db, vendor_id=vendor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}


# Filament endpoints
@app.post("/filaments/", response_model=schemas.Filament, tags=["Filaments"])
def create_filament(filament: schemas.FilamentCreate, db: Session = Depends(get_db)):
    db_filament = crud.get_filament_by_name(db, name=filament.name)
    if db_filament:
        raise HTTPException(status_code=400, detail="Filament already exists")

    # Verify manufacturer exists
    db_vendor = crud.get_vendor_by_name(db, name=filament.manufacturer)
    if not db_vendor:
        raise HTTPException(status_code=400, detail=f"Manufacturer '{filament.manufacturer}' not found. Please create the vendor first.")

    return crud.create_filament(db=db, filament=filament)


@app.get("/filaments/", response_model=List[schemas.Filament], tags=["Filaments"])
def read_filaments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_filaments(db, skip=skip, limit=limit)


@app.get("/filaments/{filament_id}", response_model=schemas.Filament, tags=["Filaments"])
def read_filament(filament_id: int, db: Session = Depends(get_db)):
    db_filament = crud.get_filament(db, filament_id=filament_id)
    if db_filament is None:
        raise HTTPException(status_code=404, detail="Filament not found")
    return db_filament


@app.put("/filaments/{filament_id}", response_model=schemas.Filament, tags=["Filaments"])
def update_filament(filament_id: int, filament: schemas.FilamentUpdate, db: Session = Depends(get_db)):
    db_filament = crud.update_filament(db, filament_id=filament_id, filament=filament)
    if db_filament is None:
        raise HTTPException(status_code=404, detail="Filament not found")
    return db_filament


@app.delete("/filaments/{filament_id}", tags=["Filaments"])
def delete_filament(filament_id: int, db: Session = Depends(get_db)):
    success = crud.delete_filament(db, filament_id=filament_id)
    if not success:
        raise HTTPException(status_code=404, detail="Filament not found")
    return {"message": "Filament deleted successfully"}


# Purchase endpoints
@app.post("/purchases/", response_model=schemas.Purchase, tags=["Purchases"])
def create_purchase(purchase: schemas.PurchaseCreate, db: Session = Depends(get_db)):
    # Verify all filaments exist
    for item in purchase.items:
        db_filament = crud.get_filament_by_name(db, name=item.filament_name)
        if not db_filament:
            raise HTTPException(status_code=400, detail=f"Filament '{item.filament_name}' not found")

    return crud.create_purchase(db=db, purchase=purchase)


@app.get("/purchases/", response_model=List[schemas.Purchase], tags=["Purchases"])
def read_purchases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_purchases(db, skip=skip, limit=limit)


@app.get("/purchases/{purchase_id}", response_model=schemas.Purchase, tags=["Purchases"])
def read_purchase(purchase_id: int, db: Session = Depends(get_db)):
    db_purchase = crud.get_purchase(db, purchase_id=purchase_id)
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return db_purchase


@app.put("/purchases/{purchase_id}", response_model=schemas.Purchase, tags=["Purchases"])
def update_purchase(purchase_id: int, purchase: schemas.PurchaseUpdate, db: Session = Depends(get_db)):
    db_purchase = crud.update_purchase(db, purchase_id=purchase_id, purchase=purchase)
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return db_purchase


@app.delete("/purchases/{purchase_id}", tags=["Purchases"])
def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    success = crud.delete_purchase(db, purchase_id=purchase_id)
    if not success:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return {"message": "Purchase deleted successfully"}


# Purchase Item endpoints
@app.get("/purchase-items/", response_model=List[schemas.PurchaseItem], tags=["Purchase Items"])
def read_purchase_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_purchase_items(db, skip=skip, limit=limit)


@app.get("/purchase-items/{item_id}", response_model=schemas.PurchaseItem, tags=["Purchase Items"])
def read_purchase_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_purchase_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Purchase item not found")
    return db_item


@app.put("/purchase-items/{item_id}", response_model=schemas.PurchaseItem, tags=["Purchase Items"])
def update_purchase_item(item_id: int, item: schemas.PurchaseItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.update_purchase_item(db, item_id=item_id, item=item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Purchase item not found")
    return db_item


@app.delete("/purchase-items/{item_id}", tags=["Purchase Items"])
def delete_purchase_item(item_id: int, db: Session = Depends(get_db)):
    success = crud.delete_purchase_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Purchase item not found")
    return {"message": "Purchase item deleted successfully"}


# Spool endpoints
@app.post("/spools/", response_model=schemas.Spool, tags=["Spools"])
def create_spool(spool: schemas.SpoolCreate, db: Session = Depends(get_db)):
    # Verify filament exists
    db_filament = crud.get_filament_by_name(db, name=spool.filament_name)
    if not db_filament:
        raise HTTPException(status_code=400, detail=f"Filament '{spool.filament_name}' not found")

    return crud.create_spool(db=db, spool=spool)


@app.get("/spools/", response_model=List[schemas.Spool], tags=["Spools"])
def read_spools(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_spools(db, skip=skip, limit=limit)


@app.get("/spools/{spool_id}", response_model=schemas.Spool, tags=["Spools"])
def read_spool(spool_id: int, db: Session = Depends(get_db)):
    db_spool = crud.get_spool(db, spool_id=spool_id)
    if db_spool is None:
        raise HTTPException(status_code=404, detail="Spool not found")
    return db_spool


@app.get("/spools/by-filament/{filament_name}", response_model=List[schemas.Spool], tags=["Spools"])
def read_spools_by_filament(filament_name: str, db: Session = Depends(get_db)):
    return crud.get_spools_by_filament(db, filament_name=filament_name)


@app.put("/spools/{spool_id}", response_model=schemas.Spool, tags=["Spools"])
def update_spool(spool_id: int, spool: schemas.SpoolUpdate, db: Session = Depends(get_db)):
    db_spool = crud.update_spool(db, spool_id=spool_id, spool=spool)
    if db_spool is None:
        raise HTTPException(status_code=404, detail="Spool not found")
    return db_spool


@app.delete("/spools/{spool_id}", tags=["Spools"])
def delete_spool(spool_id: int, db: Session = Depends(get_db)):
    success = crud.delete_spool(db, spool_id=spool_id)
    if not success:
        raise HTTPException(status_code=404, detail="Spool not found")
    return {"message": "Spool deleted successfully"}


# Inventory summary endpoint
@app.get("/inventory/summary", response_model=List[schemas.InventorySummary], tags=["Inventory"])
def get_inventory_summary(db: Session = Depends(get_db)):
    """Get inventory summary showing total purchased, opened, and remaining kg for each filament"""
    return crud.get_inventory_summary(db)

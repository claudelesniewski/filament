from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List


# Vendor Schemas
class VendorBase(BaseModel):
    name: str
    notes: Optional[str] = None


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    notes: Optional[str] = None


class Vendor(VendorBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Filament Schemas
class FilamentBase(BaseModel):
    name: str
    manufacturer: str
    line: Optional[str] = None
    material: str
    product: Optional[str] = None
    color: Optional[str] = None
    feature: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None
    date_added: date


class FilamentCreate(FilamentBase):
    pass


class FilamentUpdate(BaseModel):
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    line: Optional[str] = None
    material: Optional[str] = None
    product: Optional[str] = None
    color: Optional[str] = None
    feature: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None
    date_added: Optional[date] = None


class Filament(FilamentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Purchase Item Schemas
class PurchaseItemBase(BaseModel):
    filament_name: str
    seller: Optional[str] = None
    date_ordered: date
    date_received: Optional[date] = None
    spools: int
    kg_per_spool: float
    unit_price: float
    shelf: Optional[str] = None
    notes: Optional[str] = None


class PurchaseItemCreate(PurchaseItemBase):
    pass


class PurchaseItemUpdate(BaseModel):
    filament_name: Optional[str] = None
    seller: Optional[str] = None
    date_ordered: Optional[date] = None
    date_received: Optional[date] = None
    spools: Optional[int] = None
    kg_per_spool: Optional[float] = None
    unit_price: Optional[float] = None
    shelf: Optional[str] = None
    notes: Optional[str] = None


class PurchaseItem(PurchaseItemBase):
    id: int
    purchase_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Purchase Schemas
class PurchaseBase(BaseModel):
    date_ordered: date
    marketplace: Optional[str] = None
    order_url: Optional[str] = None
    subtotal: float
    tax: float = 0.0
    notes: Optional[str] = None


class PurchaseCreate(PurchaseBase):
    items: List[PurchaseItemCreate]


class PurchaseUpdate(BaseModel):
    date_ordered: Optional[date] = None
    marketplace: Optional[str] = None
    order_url: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    notes: Optional[str] = None


class Purchase(PurchaseBase):
    id: int
    created_at: datetime
    items: List[PurchaseItem] = []

    model_config = ConfigDict(from_attributes=True)


# Spool Schemas
class SpoolBase(BaseModel):
    filament_name: str
    date_opened: date
    date_finished: Optional[date] = None
    shelf: Optional[str] = None
    remaining_kg: float
    notes: Optional[str] = None


class SpoolCreate(SpoolBase):
    pass


class SpoolUpdate(BaseModel):
    filament_name: Optional[str] = None
    date_opened: Optional[date] = None
    date_finished: Optional[date] = None
    shelf: Optional[str] = None
    remaining_kg: Optional[float] = None
    notes: Optional[str] = None


class Spool(SpoolBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Inventory Summary Schema
class InventorySummary(BaseModel):
    filament_name: str
    manufacturer: str
    material: str
    color: Optional[str]
    total_purchased_kg: float
    total_opened_kg: float
    total_remaining_kg: float
    unopened_spools: int
    opened_spools: int
    finished_spools: int

    model_config = ConfigDict(from_attributes=True)

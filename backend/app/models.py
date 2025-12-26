from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Vendor(Base):
    """Filament vendors/manufacturers"""
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    filaments = relationship("Filament", back_populates="manufacturer_rel")


class Filament(Base):
    """Catalog of filament types"""
    __tablename__ = "filaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)  # Descriptive name
    manufacturer = Column(String, ForeignKey("vendors.name"), nullable=False)
    line = Column(String)  # Product line, e.g., "Soleyin Ultra PLA"
    material = Column(String, nullable=False, index=True)  # PLA, PETG, ABS, etc.
    product = Column(String)  # e.g., "Matte Black"
    color = Column(String, index=True)
    feature = Column(String)  # e.g., "Matte", "Glossy", "Silk"
    url = Column(String)  # Product URL
    notes = Column(Text)
    date_added = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    manufacturer_rel = relationship("Vendor", back_populates="filaments")
    purchase_items = relationship("PurchaseItem", back_populates="filament_rel")
    spools = relationship("Spool", back_populates="filament_rel")


class Purchase(Base):
    """Overall purchase orders"""
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    date_ordered = Column(Date, nullable=False)
    marketplace = Column(String)  # e.g., eBay, Amazon
    order_url = Column(String)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    items = relationship("PurchaseItem", back_populates="purchase")


class PurchaseItem(Base):
    """Individual items within a purchase"""
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)
    filament_name = Column(String, ForeignKey("filaments.name"), nullable=False)
    seller = Column(String)
    date_ordered = Column(Date, nullable=False)
    date_received = Column(Date)
    spools = Column(Integer, nullable=False)  # Quantity of spools
    kg_per_spool = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    shelf = Column(String)  # Storage location, e.g., "A1LB"
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    purchase = relationship("Purchase", back_populates="items")
    filament_rel = relationship("Filament", back_populates="purchase_items")


class Spool(Base):
    """Individual spool tracking when opened"""
    __tablename__ = "spools"

    id = Column(Integer, primary_key=True, index=True)
    filament_name = Column(String, ForeignKey("filaments.name"), nullable=False)
    date_opened = Column(Date, nullable=False)
    date_finished = Column(Date)  # Optional
    shelf = Column(String)
    remaining_kg = Column(Float, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    filament_rel = relationship("Filament", back_populates="spools")

#!/usr/bin/env python3
"""Populate the database with test data"""

import requests
import json
from datetime import datetime, timedelta

API_URL = "http://localhost:8000"

def create_vendors():
    vendors = [
        {"name": "Creality", "notes": "3D printer and filament manufacturer"},
        {"name": "Polymaker", "notes": "Premium filament manufacturer"},
        {"name": "eSUN", "notes": "Popular filament brand"},
        {"name": "Hatchbox", "notes": "Budget-friendly filaments"},
        {"name": "Prusament", "notes": "Prusa Research filament brand"}
    ]

    for vendor in vendors:
        response = requests.post(f"{API_URL}/vendors/", json=vendor)
        print(f"Created vendor: {vendor['name']}")

def create_filaments():
    filaments = [
        {
            "name": "Creality Hyper PLA Matte Black",
            "manufacturer": "Creality",
            "line": "Hyper Series PLA",
            "material": "PLA",
            "product": "Matte Black",
            "color": "Black",
            "feature": "Matte",
            "date_added": "2024-11-15",
            "url": "https://www.creality.com/products/creality-hyper-series-pla-filament",
            "notes": "High-speed printing filament with matte finish"
        },
        {
            "name": "Polymaker PolyLite PETG Grey",
            "manufacturer": "Polymaker",
            "line": "PolyLite",
            "material": "PETG",
            "product": "Grey",
            "color": "Grey",
            "feature": "Standard",
            "date_added": "2024-10-20",
            "url": "https://polymaker.com/product/polylite-petg/",
            "notes": "Durable and easy to print PETG"
        },
        {
            "name": "eSUN PLA+ White",
            "manufacturer": "eSUN",
            "line": "PLA+",
            "material": "PLA",
            "product": "White",
            "color": "White",
            "feature": "Enhanced",
            "date_added": "2024-12-01",
            "url": "https://www.esun3d.com/pla-pro-product/",
            "notes": "Improved strength and toughness"
        },
        {
            "name": "Hatchbox TPU Blue",
            "manufacturer": "Hatchbox",
            "line": "TPU",
            "material": "TPU",
            "product": "Blue",
            "color": "Blue",
            "feature": "Flexible",
            "date_added": "2024-09-10",
            "url": "https://www.hatchbox3d.com/products/tpu",
            "notes": "Flexible filament for soft parts"
        },
        {
            "name": "Prusament PLA Galaxy Black",
            "manufacturer": "Prusament",
            "line": "PLA",
            "material": "PLA",
            "product": "Galaxy Black",
            "color": "Black",
            "feature": "Sparkle",
            "date_added": "2024-11-25",
            "url": "https://prusament.com/materials/pla-galaxy-black/",
            "notes": "Premium PLA with sparkles"
        },
        {
            "name": "Polymaker PolyLite Silk Red",
            "manufacturer": "Polymaker",
            "line": "PolyLite",
            "material": "PLA",
            "product": "Silk Red",
            "color": "Red",
            "feature": "Silk",
            "date_added": "2024-12-10",
            "url": "https://polymaker.com/product/polylite-pla/",
            "notes": "Silk finish PLA for decorative prints"
        }
    ]

    for filament in filaments:
        response = requests.post(f"{API_URL}/filaments/", json=filament)
        print(f"Created filament: {filament['name']}")

def create_purchases():
    purchases = [
        {
            "date_ordered": "2024-11-15",
            "marketplace": "Amazon",
            "order_url": "https://amazon.com/orders/123-456",
            "subtotal": 42.99,
            "tax": 3.44,
            "notes": "Black Friday deal",
            "items": [
                {
                    "filament_name": "Creality Hyper PLA Matte Black",
                    "seller": "Creality Official",
                    "date_ordered": "2024-11-15",
                    "date_received": "2024-11-20",
                    "spools": 2,
                    "kg_per_spool": 1.0,
                    "unit_price": 21.99,
                    "shelf": "A1",
                    "notes": "Good deal on Black Friday"
                }
            ]
        },
        {
            "date_ordered": "2024-12-01",
            "marketplace": "eBay",
            "order_url": "https://ebay.com/orders/789",
            "subtotal": 65.98,
            "tax": 5.28,
            "notes": "Mixed order",
            "items": [
                {
                    "filament_name": "eSUN PLA+ White",
                    "seller": "eSUN Store",
                    "date_ordered": "2024-12-01",
                    "date_received": "2024-12-08",
                    "spools": 2,
                    "kg_per_spool": 1.0,
                    "unit_price": 22.99,
                    "shelf": "A2",
                    "notes": "Stock up on white"
                },
                {
                    "filament_name": "Polymaker PolyLite PETG Grey",
                    "seller": "Polymaker Official",
                    "date_ordered": "2024-12-01",
                    "date_received": "2024-12-08",
                    "spools": 1,
                    "kg_per_spool": 1.0,
                    "unit_price": 19.99,
                    "shelf": "B1",
                    "notes": "First time trying PETG"
                }
            ]
        },
        {
            "date_ordered": "2024-12-15",
            "marketplace": "Direct",
            "order_url": "https://prusament.com/order/456",
            "subtotal": 99.95,
            "tax": 7.99,
            "notes": "Premium filament order",
            "items": [
                {
                    "filament_name": "Prusament PLA Galaxy Black",
                    "seller": "Prusa Research",
                    "date_ordered": "2024-12-15",
                    "date_received": "2024-12-22",
                    "spools": 3,
                    "kg_per_spool": 1.0,
                    "unit_price": 32.99,
                    "shelf": "C1",
                    "notes": "Premium quality, worth the price"
                },
                {
                    "filament_name": "Polymaker PolyLite Silk Red",
                    "seller": "Polymaker",
                    "date_ordered": "2024-12-15",
                    "date_received": "",
                    "spools": 1,
                    "kg_per_spool": 1.0,
                    "unit_price": 24.99,
                    "shelf": "B2",
                    "notes": "For Christmas decorations"
                }
            ]
        }
    ]

    for purchase in purchases:
        response = requests.post(f"{API_URL}/purchases/", json=purchase)
        print(f"Created purchase from {purchase['marketplace']} on {purchase['date_ordered']}")

def create_spools():
    spools = [
        {
            "filament_name": "Creality Hyper PLA Matte Black",
            "date_opened": "2024-11-22",
            "date_finished": "",
            "shelf": "A1",
            "remaining_kg": 0.35,
            "notes": "Currently printing terrain for D&D"
        },
        {
            "filament_name": "eSUN PLA+ White",
            "date_opened": "2024-12-10",
            "date_finished": "",
            "shelf": "A2",
            "remaining_kg": 0.85,
            "notes": "Using for functional parts"
        },
        {
            "filament_name": "Polymaker PolyLite PETG Grey",
            "date_opened": "2024-12-12",
            "date_finished": "",
            "shelf": "B1",
            "remaining_kg": 0.60,
            "notes": "Testing PETG for outdoor parts"
        },
        {
            "filament_name": "Prusament PLA Galaxy Black",
            "date_opened": "2024-12-24",
            "date_finished": "",
            "shelf": "C1",
            "remaining_kg": 0.95,
            "notes": "Just started, looks amazing!"
        },
        {
            "filament_name": "Creality Hyper PLA Matte Black",
            "date_opened": "2024-10-15",
            "date_finished": "2024-11-18",
            "shelf": "A1",
            "remaining_kg": 0.0,
            "notes": "Finished - used for various projects"
        }
    ]

    for spool in spools:
        response = requests.post(f"{API_URL}/spools/", json=spool)
        status = "Finished" if spool['date_finished'] else "In Use"
        print(f"Created spool: {spool['filament_name']} - {status}")

def main():
    print("Populating database with test data...\n")

    print("Creating vendors...")
    create_vendors()
    print()

    print("Creating filaments...")
    create_filaments()
    print()

    print("Creating purchases...")
    create_purchases()
    print()

    print("Creating spools...")
    create_spools()
    print()

    print("Test data populated successfully!")

if __name__ == "__main__":
    main()

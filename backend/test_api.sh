#!/bin/bash

# Test script for Filament Inventory API
# Make sure the API server is running before executing this script

API_URL="http://localhost:8000"

echo "Testing Filament Inventory API..."
echo

# Test 1: Create a vendor
echo "1. Creating vendor..."
curl -X POST "$API_URL/vendors/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Creality", "notes": "3D printer manufacturer"}' \
  | python -m json.tool
echo

# Test 2: Create a filament
echo "2. Creating filament..."
curl -X POST "$API_URL/filaments/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creality Soleyin PLA Matte Black",
    "manufacturer": "Creality",
    "line": "Soleyin Ultra PLA",
    "material": "PLA",
    "product": "Matte Black",
    "color": "Black",
    "feature": "Matte",
    "date_added": "2025-01-13",
    "url": "https://www.ebay.com/itm/375913733715",
    "notes": "High quality matte finish PLA"
  }' \
  | python -m json.tool
echo

# Test 3: Create a purchase with items
echo "3. Creating purchase..."
curl -X POST "$API_URL/purchases/" \
  -H "Content-Type: application/json" \
  -d '{
    "date_ordered": "2025-01-13",
    "marketplace": "eBay",
    "order_url": "https://order.ebay.com/ord/show?orderId=19-12565-72542",
    "subtotal": 10.99,
    "tax": 0.88,
    "items": [{
      "filament_name": "Creality Soleyin PLA Matte Black",
      "seller": "Creality",
      "date_ordered": "2025-01-13",
      "date_received": "2025-01-18",
      "spools": 1,
      "kg_per_spool": 1.0,
      "unit_price": 10.99,
      "shelf": "A1LB",
      "notes": "First purchase"
    }]
  }' \
  | python -m json.tool
echo

# Test 4: Create a spool entry
echo "4. Creating spool..."
curl -X POST "$API_URL/spools/" \
  -H "Content-Type: application/json" \
  -d '{
    "filament_name": "Creality Soleyin PLA Matte Black",
    "date_opened": "2025-01-20",
    "shelf": "A1LB",
    "remaining_kg": 1.0,
    "notes": "Started using for project XYZ"
  }' \
  | python -m json.tool
echo

# Test 5: Update spool (use some filament)
echo "5. Updating spool (using 0.25 kg)..."
curl -X PUT "$API_URL/spools/1" \
  -H "Content-Type: application/json" \
  -d '{"remaining_kg": 0.75}' \
  | python -m json.tool
echo

# Test 6: Get inventory summary
echo "6. Getting inventory summary..."
curl "$API_URL/inventory/summary" | python -m json.tool
echo

# Test 7: List all filaments
echo "7. Listing all filaments..."
curl "$API_URL/filaments/" | python -m json.tool
echo

# Test 8: List all vendors
echo "8. Listing all vendors..."
curl "$API_URL/vendors/" | python -m json.tool
echo

echo "All tests completed!"

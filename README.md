# Filament Inventory Tracker

A web application for tracking 3D printing filament inventory, purchases, and spool usage.

## Features

- **Filament Catalog**: Track different filament types with detailed attributes (manufacturer, material, color, etc.)
- **Vendor Management**: Manage filament manufacturers and vendors
- **Purchase Tracking**: Record purchases with multiple items, costs, and tax
- **Spool Management**: Track individual spools when opened, usage, and remaining weight
- **Inventory Summary**: View total purchased, opened, and remaining filament by type

## Database Schema

### Tables

1. **Vendors**: Filament manufacturers/vendors
2. **Filaments**: Catalog of filament types with descriptive names
3. **Purchases**: Overall purchase orders with subtotal and tax
4. **Purchase Items**: Individual items within purchases (links to filaments)
5. **Spools**: Individual spool tracking when opened from inventory

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:
```bash
cd filament
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

4. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

2. The API will be available at:
   - API: http://localhost:8000
   - Interactive API docs: http://localhost:8000/docs
   - Alternative API docs: http://localhost:8000/redoc

### API Documentation

Once the server is running, visit http://localhost:8000/docs for interactive API documentation where you can:
- View all available endpoints
- Test API calls directly in the browser
- See request/response schemas

## API Endpoints

### Vendors
- `POST /vendors/` - Create a new vendor
- `GET /vendors/` - List all vendors
- `GET /vendors/{vendor_id}` - Get a specific vendor
- `PUT /vendors/{vendor_id}` - Update a vendor
- `DELETE /vendors/{vendor_id}` - Delete a vendor

### Filaments
- `POST /filaments/` - Create a new filament
- `GET /filaments/` - List all filaments
- `GET /filaments/{filament_id}` - Get a specific filament
- `PUT /filaments/{filament_id}` - Update a filament
- `DELETE /filaments/{filament_id}` - Delete a filament

### Purchases
- `POST /purchases/` - Create a new purchase with items
- `GET /purchases/` - List all purchases
- `GET /purchases/{purchase_id}` - Get a specific purchase
- `PUT /purchases/{purchase_id}` - Update a purchase
- `DELETE /purchases/{purchase_id}` - Delete a purchase

### Purchase Items
- `GET /purchase-items/` - List all purchase items
- `GET /purchase-items/{item_id}` - Get a specific purchase item
- `PUT /purchase-items/{item_id}` - Update a purchase item
- `DELETE /purchase-items/{item_id}` - Delete a purchase item

### Spools
- `POST /spools/` - Create a new spool entry
- `GET /spools/` - List all spools
- `GET /spools/{spool_id}` - Get a specific spool
- `GET /spools/by-filament/{filament_name}` - Get spools for a specific filament
- `PUT /spools/{spool_id}` - Update a spool (e.g., remaining weight)
- `DELETE /spools/{spool_id}` - Delete a spool

### Inventory
- `GET /inventory/summary` - Get inventory summary with totals for each filament

## Example Workflow

1. **Add a vendor**:
```bash
curl -X POST "http://localhost:8000/vendors/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Creality", "notes": "3D printer manufacturer"}'
```

2. **Add a filament**:
```bash
curl -X POST "http://localhost:8000/filaments/" \
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
  }'
```

3. **Record a purchase**:
```bash
curl -X POST "http://localhost:8000/purchases/" \
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
      "date_received": "2025-03-18",
      "spools": 1,
      "kg_per_spool": 1.0,
      "unit_price": 10.99,
      "shelf": "A1LB",
      "notes": "First purchase"
    }]
  }'
```

4. **Open a spool**:
```bash
curl -X POST "http://localhost:8000/spools/" \
  -H "Content-Type: application/json" \
  -d '{
    "filament_name": "Creality Soleyin PLA Matte Black",
    "date_opened": "2025-01-20",
    "shelf": "A1LB",
    "remaining_kg": 1.0,
    "notes": "Started using for project XYZ"
  }'
```

5. **View inventory summary**:
```bash
curl "http://localhost:8000/inventory/summary"
```

## Database

The application uses SQLite by default, storing data in `filament_inventory.db`. The database is created automatically when you first run the application.

## Next Steps

- Build a frontend web interface with spreadsheet-like views
- Add filtering and sorting capabilities
- Implement data import/export functionality
- Add charts and visualizations for inventory tracking
- Create barcode/QR code integration for quick spool lookup

## License

MIT

# Filament Inventory Tracker

A full-stack web application for tracking 3D printing filament inventory, purchases, and spools.

## Overview

This application helps users manage their 3D printing filament inventory by tracking:
- Vendors/manufacturers of filaments
- Filament types (material, color, etc.)
- Purchase records with items
- Individual spools and their usage

## Architecture

### Backend (FastAPI + SQLite)
- **Location**: `backend/`
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite (file-based at `backend/filament_inventory.db`)
- **Port**: 8000 (localhost)

Key files:
- `backend/app/main.py` - API routes and FastAPI app
- `backend/app/models.py` - SQLAlchemy database models
- `backend/app/schemas.py` - Pydantic schemas for validation
- `backend/app/crud.py` - Database operations
- `backend/app/database.py` - Database connection configuration

### Frontend (React + Vite)
- **Location**: `frontend/`
- **Framework**: React 19 with Vite
- **Port**: 5000 (exposed to internet)

Key files:
- `frontend/src/App.jsx` - Main React application
- `frontend/src/api.js` - API client configuration
- `frontend/vite.config.js` - Vite configuration with API proxy

## Running the Application

The application runs via a single workflow that starts both backend and frontend:
- Backend runs on `localhost:8000`
- Frontend runs on `0.0.0.0:5000` and proxies API requests to the backend

## API Endpoints

All API endpoints are prefixed with no base path and proxied through Vite:
- `/vendors/` - Vendor management
- `/filaments/` - Filament type management
- `/purchases/` - Purchase record management
- `/purchase-items/` - Individual purchase item management
- `/spools/` - Spool tracking
- `/inventory/summary` - Inventory summary calculations

API documentation available at `/docs` when running.

## Recent Changes

- 2024-12-27: Initial Replit setup
  - Configured Vite for Replit environment (port 5000, allowedHosts)
  - Added API proxy configuration in Vite
  - Updated frontend API client for Replit compatibility

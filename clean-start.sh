#!/bin/bash

# Clean Start Script for Top14 Live Tracker
# Removes all data and starts fresh

echo "🧹 Cleaning all database files..."
rm -f backend/top14.db backend/data.db backend/*.db 2>/dev/null
echo "✓ Database files removed"

echo ""
echo "📦 Installing dependencies..."
cd backend
npm install --silent 2>/dev/null
cd ../frontend
npm install --silent 2>/dev/null
cd ..
echo "✓ Dependencies installed"

echo ""
echo "🏗️  Building frontend..."
cd frontend
npm run build 2>&1 | tail -3
cd ..
echo "✓ Frontend built"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Clean start complete!"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm start"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 🏉 Fresh Start - Clean Database

## ✅ Database Cleaned Successfully

The database has been completely wiped and will be recreated when you start the server.

## 📊 Current Status

After starting the server, the database was populated with:

```
Total Teams: 105
Total Matches: 150

MATCHES BY COMPETITION:
───────────────────────────────────────
challenge_cup         16 matches
champions_cup         16 matches
mlr                    1 matches
premiership           16 matches
prod2                 16 matches
rugby_championship    15 matches
six_nations_male      16 matches
super_rugby           16 matches
top14                  7 matches ⭐ (from LNR)
urc                   31 matches

TOP14 DETAILS:
───────────────────────────────────────
Status: FT         Count: 6
Status: NS         Count: 1

✓ All 6 finished Top14 matches have try data
✓ Total: 50 tries recorded (~8 tries/match)
```

## 🚀 How to Start

### Option 1: Manual Start (Recommended)

```bash
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend
cd frontend
npm run dev

# Open browser to http://localhost:5173
```

### Option 2: Use Clean Start Script

```bash
./clean-start.sh
```

This will:
- Remove all database files
- Reinstall dependencies
- Build frontend
- Show you how to start

## 🔍 What's Different Now

### Data Sources
- **Top 14**: Official LNR website (accurate, real-time)
  - IDs start with `lnr-`
  - Includes try counts for bonus calculations
  - Updates every 30 seconds when live
  
- **Other Competitions**: SportsDB API (free tier)
  - Numeric IDs
  - ~15 recent/upcoming matches per competition
  - Limited historical data

### Rankings
Now calculated correctly with:
- **Top 14 Rules**: 
  - Win: 4 pts
  - Bonus Offensif: +1 for 3+ tries advantage
  - Bonus Défensif: +1 for losing by ≤5 points
  
- **Other Leagues**:
  - Win: 4 pts
  - Bonus Offensif: +1 for 4+ tries scored
  - Bonus Défensif: +1 for losing by ≤7 points

### Live View
- Shows live matches if any exist
- If no live matches: shows ONLY next day's matches
- No more multi-day clutter

## 🧪 Testing the Clean Data

### 1. Check Top14 Standings

```bash
cd backend
npm start
```

Wait ~30 seconds for data to load, then:

```bash
curl http://localhost:3001/api/standings?competition=top14 | json_pp
```

You should see proper rankings with:
- Correct point totals
- Try-based bonuses
- Proper sorting

### 2. Check Match Data

```bash
# Check Top14 matches
curl http://localhost:3001/api/matches?competition=top14 | json_pp

# Check Premiership
curl http://localhost:3001/api/matches?competition=premiership | json_pp
```

### 3. Verify Data Sources

```bash
sqlite3 backend/top14.db "
  SELECT competition, 
         substr(id, 1, 4) as id_type, 
         COUNT(*) 
  FROM matches 
  GROUP BY competition, substr(id, 1, 4);
"
```

Expected output:
- `top14` + `lnr-` prefix (from LNR)
- Other competitions with numeric prefixes (from SportsDB)

## 📈 Monitoring Data Quality

### Check if data is updating

```bash
# Watch server logs
cd backend
npm start

# Look for these messages every 30 seconds:
# [HybridProvider] Fetched X Top14 matches (LNR) + Y other matches (SportsDB)
```

### Database queries

```bash
sqlite3 backend/top14.db

-- Check match distribution
SELECT competition, status, COUNT(*) 
FROM matches 
GROUP BY competition, status;

-- Check Top14 try data
SELECT id, score_home, score_away, home_tries, away_tries 
FROM matches 
WHERE competition='top14' AND status='FT';

-- Check if standings would work
SELECT COUNT(*) as finished_matches
FROM matches 
WHERE competition='top14' AND status='FT';
-- Should be > 0 for standings to work
```

## ⚠️ Known Limitations

1. **SportsDB Free Tier**: Only ~15 matches per competition
   - This is normal and expected
   - Enough to show recent results and upcoming matches
   - Not enough for full season standings

2. **Top14 Historical Data**: Only current/recent round from LNR
   - LNR website shows current matches only
   - As season progresses, more data accumulates
   - Older matches may not have try data

3. **Initial Load**: First startup takes ~30 seconds
   - Fetching from LNR (scraping HTML)
   - Fetching from SportsDB (API calls)
   - Building database from scratch

## 🐛 Troubleshooting

### No Top14 matches showing

**Possible causes:**
- LNR website unavailable
- Network issues
- HTML structure changed

**Solution:**
```bash
# Check server logs for errors
cd backend
npm start | grep -i error

# Check if LNR is accessible
curl -I https://top14.lnr.fr
```

### Standings showing "No data"

**Possible causes:**
- No finished matches in database yet
- New season just started

**Solution:**
```bash
# Check if there are finished matches
sqlite3 backend/top14.db "
  SELECT COUNT(*) FROM matches 
  WHERE competition='top14' AND status='FT';
"

# If 0: This is normal at season start
# Wait for matches to finish
```

### "Partial data" warning in standings

**This is normal!** It means:
- Less than 5 matches per team on average
- Still early in the data collection
- Standings will improve as more matches are played

## 🔄 Re-cleaning the Database

If you need to start completely fresh again:

```bash
# Option 1: Delete and restart server
rm backend/top14.db
cd backend && npm start

# Option 2: Use script
./clean-start.sh

# Option 3: SQL cleanup (keeps structure)
sqlite3 backend/top14.db "
  DELETE FROM score_events;
  DELETE FROM matches;
  DELETE FROM teams;
"
```

## ✨ What to Expect

After starting with clean database:

1. **First 30 seconds**: Initial data fetch
   - ~61 teams loaded
   - ~150 matches loaded
   - Database created

2. **Every 30 seconds**: Updates
   - Re-fetch all competitions
   - Detect changes (scores, status)
   - Broadcast via WebSocket

3. **In the UI**:
   - Competition switcher works
   - Live view shows current/next matches
   - Results view shows matches by round
   - Standings show calculated rankings

## 📞 Support

If issues persist after clean start:

1. Check server logs for errors
2. Verify network connectivity to LNR and SportsDB
3. Check `artifact/TESTING_GUIDE.md` for detailed troubleshooting
4. Review `artifact/FIXES_SUMMARY.md` for architecture details

---

**Note**: The database will continue to accumulate data over time. The more the server runs (especially during live matches), the more accurate the standings become.

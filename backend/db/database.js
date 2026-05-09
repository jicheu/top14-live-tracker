import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'top14.db');

let db;

export async function initDatabase() {
  const SQL = await initSqlJs();

  // Charger la base existante ou en créer une nouvelle
  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Exécuter le schéma
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.run(schema);

  // Sauvegarder périodiquement
  setInterval(() => saveDatabase(), 30_000);

  console.log('[DB] Base de données initialisée');
  return db;
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

export function getDb() {
  if (!db) {
    throw new Error("La base de données n'est pas initialisée. Appelez initDatabase() d'abord.");
  }
  return db;
}

// Helper: convertit le résultat sql.js en tableau d'objets
function queryAll(sql, params = []) {
  const stmt = getDb().prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function runSql(sql, params = []) {
  const stmt = getDb().prepare(sql);
  if (params.length) stmt.bind(params);
  stmt.step();
  stmt.free();
}

// --- Teams ---

export function upsertTeam(team) {
  runSql(`
    INSERT OR REPLACE INTO teams (id, name, badge_url)
    VALUES (?, ?, ?)
  `, [team.id, team.name, team.badge_url]);
}

export function getAllTeams() {
  return queryAll('SELECT * FROM teams');
}

// --- Matches ---

export function upsertMatch(match) {
  runSql(`
    INSERT OR REPLACE INTO matches (id, home_team_id, away_team_id, score_home, score_away, status, round, match_date, match_time, venue, home_1h, away_1h, home_2h, away_2h, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    match.id, match.home_team_id, match.away_team_id,
    match.score_home, match.score_away, match.status,
    match.round, match.match_date, match.match_time, match.venue,
    match.home_1h, match.away_1h, match.home_2h, match.away_2h,
    match.updated_at
  ]);
}

export function getMatch(id) {
  return queryOne(`
    SELECT m.*,
      ht.name as home_team_name, ht.badge_url as home_team_badge,
      at2.name as away_team_name, at2.badge_url as away_team_badge
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at2 ON m.away_team_id = at2.id
    WHERE m.id = ?
  `, [id]);
}

export function getAllMatches() {
  return queryAll(`
    SELECT m.*,
      ht.name as home_team_name, ht.badge_url as home_team_badge,
      at2.name as away_team_name, at2.badge_url as away_team_badge
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at2 ON m.away_team_id = at2.id
    ORDER BY m.match_date ASC, m.match_time ASC
  `);
}

export function getLiveMatches() {
  return queryAll(`
    SELECT m.*,
      ht.name as home_team_name, ht.badge_url as home_team_badge,
      at2.name as away_team_name, at2.badge_url as away_team_badge
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at2 ON m.away_team_id = at2.id
    WHERE m.status IN ('1H', 'HT', '2H')
    ORDER BY m.match_date ASC, m.match_time ASC
  `);
}

// --- Score Events ---

export function insertScoreEvent(event) {
  runSql(`
    INSERT INTO score_events (match_id, team_id, player, event_type, minute, half, detail)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [event.match_id, event.team_id, event.player, event.event_type, event.minute, event.half, event.detail]);
}

export function getScoreEvents(matchId) {
  return queryAll(`
    SELECT se.*, t.name as team_name, t.badge_url as team_badge
    FROM score_events se
    JOIN teams t ON se.team_id = t.id
    WHERE se.match_id = ?
    ORDER BY se.minute ASC
  `, [matchId]);
}

export function clearScoreEvents(matchId) {
  runSql('DELETE FROM score_events WHERE match_id = ?', [matchId]);
}

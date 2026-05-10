import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { initDatabase, saveDatabase } from './db/database.js';
import createMatchesRouter from './routes/matches.js';
import { setupSocket } from './socket/liveUpdates.js';
import { Poller } from './services/poller.js';
import { HybridProvider } from './providers/HybridProvider.js';

// --- Configuration ---
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.SPORTSDB_API_KEY || '123';

async function main() {
  // --- Initialisation ---
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
    },
  });

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }));
  app.use(express.json());

  // Base de données (async init pour sql.js)
  await initDatabase();

  // Data Provider (Hybrid: LNR for Top14, ESPN for others)
  const provider = new HybridProvider();
  console.log(`[Serveur] Fournisseur de données: Hybrid (LNR + ESPN)`);

  // Routes REST (provider injected for live standings fetch)
  app.use('/api', createMatchesRouter(provider));

  // Route de santé
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', provider: 'hybrid', timestamp: new Date().toISOString() });
  });

  // Socket.IO
  const socketHandler = setupSocket(io);

  // Poller
  const poller = new Poller(provider, (data) => {
    // Diffuser les mises à jour via Socket.IO
    socketHandler.broadcastMatchUpdate({
      matches: data.matches,
      timestamp: new Date().toISOString(),
    });

    // Diffuser les événements de score individuels
    for (const change of data.changes) {
      if (change.type === 'score' && change.event) {
        socketHandler.broadcastScoreEvent(change.event);
      } else if (change.type === 'events_full' && change.events) {
        // Broadcast each event for LNR full-update changes
        for (const event of change.events) {
          socketHandler.broadcastScoreEvent(event);
        }
      }
    }

    if (!data.isInitial) {
      const liveCount = data.matches.filter(m => ['1H', 'HT', '2H'].includes(m.status)).length;
      console.log(`[Poller] ${data.changes.length} changement(s) détecté(s), ${liveCount} match(s) en direct`);
    }
  });

  await poller.start();

  // Démarrage du serveur
  server.listen(PORT, () => {
    console.log(`\n  Top 14 Live Tracker`);
    console.log(`  ───────────────────`);
    console.log(`  Serveur:  http://localhost:${PORT}`);
    console.log(`  API:      http://localhost:${PORT}/api/matches`);
    console.log(`  Provider: Hybrid (LNR + ESPN)\n`);
  });

  // Arrêt propre
  process.on('SIGINT', () => {
    console.log('\n[Serveur] Arrêt...');
    poller.stop();
    saveDatabase();
    server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[Serveur] Erreur fatale:', err);
  process.exit(1);
});

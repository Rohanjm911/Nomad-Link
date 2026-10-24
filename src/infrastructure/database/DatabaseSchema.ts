

export interface DatabaseMigration {
  version: number;
  description: string;
  sqlStatements: string[];
}

export const NOMAD_DATABASE_MIGRATIONS: DatabaseMigration[] = [
  {
    version: 1,
    description: 'Initial schema for identity, peers, messages, and DTN queue',
    sqlStatements: [
      `CREATE TABLE IF NOT EXISTS device_identity (
        peer_id TEXT PRIMARY KEY,
        alias TEXT NOT NULL,
        signing_pubkey TEXT NOT NULL,
        exchange_pubkey TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS peers (
        peer_id TEXT PRIMARY KEY,
        alias TEXT NOT NULL,
        trust_status TEXT NOT NULL,
        transport_type TEXT NOT NULL,
        exchange_pubkey TEXT NOT NULL,
        signing_pubkey TEXT NOT NULL,
        safety_number TEXT NOT NULL,
        last_seen INTEGER NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT PRIMARY KEY,
        peer_id TEXT NOT NULL,
        peer_alias TEXT NOT NULL,
        last_snippet TEXT,
        last_timestamp INTEGER NOT NULL,
        unread_count INTEGER DEFAULT 0,
        is_group INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        delivery_state TEXT NOT NULL,
        hop_count INTEGER DEFAULT 0,
        is_outgoing INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        is_emergency INTEGER DEFAULT 0
      );`,
      `CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, timestamp);`,
      `CREATE TABLE IF NOT EXISTS dtn_routing_queue (
        message_id TEXT PRIMARY KEY,
        destination_id TEXT NOT NULL,
        priority INTEGER NOT NULL,
        envelope_blob BLOB NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        attempts INTEGER DEFAULT 0
      );`,
      `CREATE INDEX IF NOT EXISTS idx_dtn_prio ON dtn_routing_queue(priority DESC, created_at ASC);`,
      `CREATE TABLE IF NOT EXISTS saved_waypoints (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        notes TEXT,
        created_at INTEGER NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS convoy_members (
        peer_id TEXT PRIMARY KEY,
        convoy_id TEXT NOT NULL,
        alias TEXT NOT NULL,
        is_leader INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        speed REAL,
        heading REAL,
        last_fix INTEGER
      );`,
    ],
  },
];

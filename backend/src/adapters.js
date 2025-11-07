const { Pool } = require("pg");
const { MongoClient } = require("mongodb");
const webpush = require("web-push");

function makePg(env) {
  return new Pool({
    host: env.PGHOST,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    port: env.PGPORT,
    ssl: env.PGSSL
  });
}

class Shoutouts {
  constructor(p) { this.p = p; }
  async list(limit) {
    return (
      await this.p.query(
        "SELECT id,text,sender,likes,created_at FROM shoutouts ORDER BY created_at DESC LIMIT $1",
        [limit]
      )
    ).rows;
  }
  async create({ text, sender }) {
    return (
      await this.p.query(
        "INSERT INTO shoutouts(text,sender) VALUES($1,$2) RETURNING id,text,sender,likes,created_at",
        [text, sender]
      )
    ).rows[0];
  }
  async like({ id }) {
    return (
      await this.p.query(
        "UPDATE shoutouts SET likes=likes+1 WHERE id=$1 RETURNING id,text,sender,likes,created_at",
        [id]
      )
    ).rows[0];
  }
}

class Subs {
  constructor(p) { this.p = p; }
  async save({ endpoint, keys }) {
    const { p256dh, auth } = keys || {};
    await this.p.query(
      "INSERT INTO subscriptions(endpoint,p256dh,auth) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
      [endpoint, p256dh, auth]
    );
  }
  async all() {
    return (
      await this.p.query(
        "SELECT endpoint,p256dh,auth FROM subscriptions"
      )
    ).rows;
  }
}

class Page {
  constructor(p) { this.p = p; }
  async get() {
    const r = await this.p.query(
      "SELECT content,updated_at FROM shared_page ORDER BY updated_at DESC LIMIT 1"
    );
    return r.rows[0] || { content: "", updated_at: null };
  }
  async save({ content }) {
    const r = await this.p.query(
      "INSERT INTO shared_page(content) VALUES($1) RETURNING content,updated_at",
      [content]
    );
    return r.rows[0];
  }
}

class Events {
  constructor(db) { this.col = db.collection("events"); }
  async log(type, data) {
    await this.col.insertOne({ type, data, at: new Date() });
  }
}

async function makeEvents(env) {
  const client = new MongoClient(env.MONGO_URL);
  await client.connect();
  const db = client.db(env.MONGO_DB);
  return new Events(db);
}

class Push {
  constructor(env) {
    webpush.setVapidDetails(
      "mailto:" + env.VAPID_EMAIL,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );
  }
  async send(sub, payload) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify(payload)
      );
    } catch (e) {}
  }
}

module.exports = { makePg, Shoutouts, Subs, Page, makeEvents, Push };

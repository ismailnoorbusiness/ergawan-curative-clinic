import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";

const ENTITY_NAMES = ["ActivityLog","Appointment","Article","ClinicSettings","ContactMessage","Feedback","Message","PatientProfile","Service","User"];
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const json = (value) => JSON.parse(value);

function database() {
  if (!env.DB) throw new Error("Cloudflare D1 is not configured. Add a D1 database binding named DB before enabling the clinic backend.");
  return env.DB;
}
function cookieValue(request, name) {
  return (request.headers.get("Cookie") || "").split(";").map(v => v.trim()).find(v => v.startsWith(name + "="))?.slice(name.length + 1) || "";
}
async function currentUser() {
  const request = getRequest();
  const token = cookieValue(request, "clinic_session");
  if (!token) return null;
  const row = await database().prepare(
    "SELECT u.id,u.email,u.full_name,u.role,u.email_verified FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?"
  ).bind(token, now()).first();
  return row ? { id: row.id, email: row.email, full_name: row.full_name, role: row.role, email_verified: !!row.email_verified } : null;
}
const toRecord = row => row ? ({ ...json(row.data), id: row.id, created_date: row.created_date, updated_date: row.updated_date }) : null;

function entityApi(entity) {
  const table = database();
  const where = (filters = {}) => {
    const entries = Object.entries(filters || {});
    if (!entries.length) return { sql: "", values: [] };
    return { sql: " WHERE " + entries.map(([key]) => "json_extract(data, '$." + key.replace(/[^a-zA-Z0-9_]/g, "") + "') = ?").join(" AND "), values: entries.map(([,value]) => typeof value === "boolean" ? Number(value) : value) };
  };
  return {
    async create(data) {
      const stamp = now(), recordId = id(), payload = { ...data };
      await table.prepare("INSERT INTO entity_records(entity,id,data,created_date,updated_date) VALUES(?,?,?,?,?)")
        .bind(entity, recordId, JSON.stringify(payload), stamp, stamp).run();
      return { ...payload, id: recordId, created_date: stamp, updated_date: stamp };
    },
    async get(recordId) {
      return toRecord(await table.prepare("SELECT * FROM entity_records WHERE entity=? AND id=?").bind(entity, recordId).first());
    },
    async filter(filters = {}, options = {}) {
      const w = where(filters), sort = String(options.sort || "-created_date");
      const column = sort.replace(/^-/, "") === "created_date" ? "created_date" : sort.replace(/^-/, "") === "updated_date" ? "updated_date" : "json_extract(data, '$." + sort.replace(/^-/, "").replace(/[^a-zA-Z0-9_]/g, "") + "')";
      const direction = sort.startsWith("-") ? "DESC" : "ASC";
      const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
      const offset = Math.max(Number(options.offset) || 0, 0);
      const rows = await table.prepare("SELECT * FROM entity_records WHERE entity=?" + w.sql + " ORDER BY " + column + " " + direction + " LIMIT ? OFFSET ?")
        .bind(entity, ...w.values, limit, offset).all();
      return { items: (rows.results || []).map(toRecord), total: await this.count(filters) };
    },
    async list(sort = "-created_date", limit = 100) {
      const result = await this.filter({}, { sort, limit });
      return result.items;
    },
    async count(filters = {}) {
      const w = where(filters);
      const row = await table.prepare("SELECT COUNT(*) AS total FROM entity_records WHERE entity=?" + w.sql).bind(entity, ...w.values).first();
      return Number(row?.total || 0);
    },
    async update(recordId, changes) {
      const old = await this.get(recordId);
      if (!old) throw Object.assign(new Error("Record not found"), { status: 404 });
      const { id: _id, created_date: _created, updated_date: _updated, ...data } = old;
      const updated = { ...data, ...changes };
      await table.prepare("UPDATE entity_records SET data=?,updated_date=? WHERE entity=? AND id=?")
        .bind(JSON.stringify(updated), now(), entity, recordId).run();
      return { ...updated, id: recordId, created_date: old.created_date, updated_date: now() };
    },
    async updateMany(filters, update) {
      const w = where(filters), changes = update?.$set || update || {};
      const rows = await table.prepare("SELECT * FROM entity_records WHERE entity=?" + w.sql).bind(entity, ...w.values).all();
      for (const row of rows.results || []) {
        const current = json(row.data);
        await table.prepare("UPDATE entity_records SET data=?,updated_date=? WHERE entity=? AND id=?")
          .bind(JSON.stringify({ ...current, ...changes }), now(), entity, row.id).run();
      }
      return { modifiedCount: rows.results?.length || 0 };
    },
    async delete(recordId) {
      await table.prepare("DELETE FROM entity_records WHERE entity=? AND id=?").bind(entity, recordId).run();
      return { success: true };
    },
  };
}

export function createDatabaseClient() {
  const entities = Object.fromEntries(ENTITY_NAMES.map(name => [name, entityApi(name)]));
  const auth = {
    async me() {
      const user = await currentUser();
      if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
      return user;
    },
    async hasToken() { return !!(await currentUser()); },
    async logout() {
      const token = cookieValue(getRequest(), "clinic_session");
      if (token) await database().prepare("DELETE FROM sessions WHERE id=?").bind(token).run();
    },
  };
  return { entities, asServiceRole: { entities }, auth };
}

export { database };

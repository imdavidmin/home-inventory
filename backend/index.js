const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  const MESSAGES = {
    INVALID_ID: "invalid id",
    NOT_FOUND: "not found",
    LABEL_REQUIRED: "label required",
    INVALID_LOCATION_ID: "invalid location_id",
    LOCATION_CONTAINS_ITEMS: "location contains items",
  };
  
  const json = (d, s = 200) =>
    new Response(JSON.stringify(d), {
      status: s,
      headers: { "content-type": "application/json", ...CORS },
    });
  
  const Validators = {
    id: (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n > 0 ? n : null;
    },
    label: (v) => (typeof v === "string" ? v.trim() : ""),
    quantity: (v) => (Number.isInteger(v) && v > 0 ? v : 1),
  };
  
  const db = {
    all: (env, sql, ...args) =>
      env.DB.prepare(sql)
        .bind(...args)
        .all(),
    first: (env, sql, ...args) =>
      env.DB.prepare(sql)
        .bind(...args)
        .first(),
    run: (env, sql, ...args) =>
      env.DB.prepare(sql)
        .bind(...args)
        .run(),
    changed: (r) => r?.meta?.changes > 0,
  };
  
  const error = (msg, status) => json({ error: msg }, status);
  const ERRORS = {
    InvalidId: () => error(MESSAGES.INVALID_ID, 400),
    NotFound: () => error(MESSAGES.NOT_FOUND, 404),
    LabelRequired: () => error(MESSAGES.LABEL_REQUIRED, 400),
    InvalidLocationId: () => error(MESSAGES.INVALID_LOCATION_ID, 400),
    LocationContainsItems: () => error(MESSAGES.LOCATION_CONTAINS_ITEMS, 409),
  };
  
  const body = async (req) => {
    try {
      return await req.json();
    } catch {
      return null;
    }
  };
  async function health() {
    return json({ status: "ok" });
  }
  
  async function listLocations(req, env) {
    const r = await db.all(env, "SELECT id,label FROM locations ORDER BY label");
    return json(r.results);
  }
  
  async function createLocation(req, env) {
    const b = await body(req);
    const label = Validators.label(b?.label);
    if (!label) return ERRORS.LabelRequired();
    const r = await db.run(env, "INSERT INTO locations(label) VALUES(?)", label);
    return json({ id: r.meta.last_row_id, label }, 201);
  }
  
  async function updateLocation(req, env, id) {
    id = Validators.id(id);
    if (!id) return ERRORS.InvalidId();
    const b = await body(req);
    const label = Validators.label(b?.label);
    if (!label) return ERRORS.LabelRequired();
    const r = await db.run(
      env,
      "UPDATE locations SET label=? WHERE id=?",
      label,
      id,
    );
    if (!db.changed(r)) return ERRORS.NotFound();
    return json({ id, label });
  }
  
  async function deleteLocation(req, env, id) {
    id = Validators.id(id);
    if (!id) return ERRORS.InvalidId();
    const c = await db.first(
      env,
      "SELECT COUNT(*) count FROM items WHERE location_id=?",
      id,
    );
    if (c?.count > 0) return ERRORS.LocationContainsItems();
    const r = await db.run(env, "DELETE FROM locations WHERE id=?", id);
    if (!db.changed(r)) return ERRORS.NotFound();
    return json({ success: true });
  }
  
  async function listItems(req, env) {
    const r = await db.all(
      env,
      "SELECT i.*,l.label location_label FROM items i LEFT JOIN locations l ON l.id=i.location_id ORDER BY i.label",
    );
    return json(r.results);
  }
  
  async function getItem(req, env, id) {
    id = Validators.id(id);
    if (!id) return ERRORS.InvalidId();
    const r = await db.first(
      env,
      "SELECT i.*,l.label location_label FROM items i LEFT JOIN locations l ON l.id=i.location_id WHERE i.id=?",
      id,
    );
    return r ? json(r) : ERRORS.NotFound();
  }
  
  async function createItem(req, env) {
    const b = await body(req);
  
    const label = Validators.label(b?.label);
    if (!label) return ERRORS.LabelRequired();
    
    const locationId =
      b?.location_id == null ? null : Validators.id(b.location_id);
    if (b?.location_id != null && !locationId) return ERRORS.InvalidLocationId();
    
    const quantity = Validators.quantity(b?.quantity);
    const tags = typeof b?.tags === "string" ? b.tags.trim() : null;
    const notes = typeof b?.notes === "string" ? b.notes.trim() : null;
    
    const r = await db.run(
      env,
      "INSERT INTO items(label,location_id,tags,notes,quantity) VALUES(?,?,?,?,?)",
      label,
      locationId,
      tags,
      notes,
      quantity,
    );
  
    return json(
      {
        id: r.meta.last_row_id,
        label,
        location_id: locationId,
        tags,
        notes,
        quantity,
      },
      201,
    );
  }
  
  async function updateItem(req, env, id) {
    id = Validators.id(id);
    if (!id) return ERRORS.InvalidId();
  
    const b = await body(req);
    
    const label = Validators.label(b?.label);
    if (!label) return ERRORS.LabelRequired();
    
    const locationId =
      b?.location_id == null ? null : Validators.id(b.location_id);
    if (b?.location_id != null && !locationId) return ERRORS.InvalidLocationId();
    
    const quantity = Validators.quantity(b?.quantity);
    const tags = typeof b?.tags === "string" ? b.tags.trim() : null;
    const notes = typeof b?.notes === "string" ? b.notes.trim() : null;
    
    const r = await db.run(
      env,
      "UPDATE items SET label=?,location_id=?,tags=?,notes=?,quantity=? WHERE id=?",
      label,
      locationId,
      tags,
      notes,
      quantity,
      id,
    );
  
    if (!db.changed(r)) return ERRORS.NotFound();
    return json({ id, label, location_id: locationId, tags, notes, quantity });
  }
  
  async function deleteItem(req, env, id) {
    id = Validators.id(id);
    if (!id) return ERRORS.InvalidId();
  
    const r = await db.run(env, "DELETE FROM items WHERE id=?", id);
  
    if (!db.changed(r)) return ERRORS.NotFound();
    return json({ success: true });
  }
  
  async function searchItems(req, env) {
    const u = new URL(req.url);
    const q = (u.searchParams.get("q") || "").trim().slice(0, 100);
    if (!q) return json([]);
  
    const t = `%${q}%`;
    const r = await db.all(
      env,
      "SELECT i.*,l.label location_label FROM items i LEFT JOIN locations l ON l.id=i.location_id WHERE i.label LIKE ? OR i.tags LIKE ? OR i.notes LIKE ? ORDER BY i.label",
      t,
      t,
      t,
    );
  
    return json(r.results);
  }
  
  async function locationItems(req, env, id) {
    id = Validators.id(id);
    if (!id) return ERRORS.InvalidId();
  
    const location = await db.first(
      env,
      "SELECT * FROM locations WHERE id=?",
      id,
    );
    if (!location) return ERRORS.NotFound();
  
    const items = await db.all(
      env,
      "SELECT * FROM items WHERE location_id=? ORDER BY label",
      id,
    );
  
    return json({ location, items: items.results });
  }
  
  const routes = [
    ["GET", /^\/health$/, health],
    ["GET", /^\/locations$/, listLocations],
    ["POST", /^\/locations$/, createLocation],
    ["PUT", /^\/locations\/(\d+)$/, updateLocation],
    ["DELETE", /^\/locations\/(\d+)$/, deleteLocation],
    ["GET", /^\/items$/, listItems],
    ["POST", /^\/items$/, createItem],
    ["GET", /^\/items\/search$/, searchItems],
    ["GET", /^\/items\/(\d+)$/, getItem],
    ["PUT", /^\/items\/(\d+)$/, updateItem],
    ["DELETE", /^\/items\/(\d+)$/, deleteItem],
    ["GET", /^\/locations\/(\d+)\/items$/, locationItems],
  ];
  
  export default {
    async fetch(req, env) {
      if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
      try {
        const path = new URL(req.url).pathname;
        for (const [method, pattern, handler] of routes) {
          if (req.method !== method) continue;
          const m = path.match(pattern);
          if (m) return handler(req, env, ...m.slice(1));
        }
        return ERRORS.NotFound();
      } catch (e) {
        return json({ error: e?.message || "internal error" }, 500);
      }
    },
  };
  
import "dotenv/config";
import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { db, migrate } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DEMO_USER_ID = "demo-user-1";

function now() { return Date.now(); }

// --- init / seed ---
if (process.argv.includes("--init")) {
  migrate();
  const u = db.prepare("INSERT OR IGNORE INTO users (id,email,name) VALUES (?,?,?)");
  u.run(DEMO_USER_ID, "demo@flexhub.local", "Demo");
  console.log("DB initialized.");
  process.exit(0);
}
migrate();

// --- helpers ---
const q = {
  userUpsert: db.prepare("INSERT OR IGNORE INTO users (id,email,name) VALUES (?,?,?)"),
  listTasks: db.prepare("SELECT * FROM tasks WHERE user_id=? ORDER BY done ASC, due_ts ASC"),
  getTask: db.prepare("SELECT * FROM tasks WHERE id=? AND user_id=?"),
  insertTask: db.prepare(`INSERT INTO tasks
    (id,user_id,title,notes,due_ts,energy,urgency,created_ts,done)
    VALUES (?,?,?,?,?,?,?, ?,0)`),
  updateTask: db.prepare(UPDATE tasks SET title=?, notes=?, due_ts=?, energy=?, urgency=?, done=? WHERE id=? AND user_id=?),
  deleteTask: db.prepare("DELETE FROM tasks WHERE id=? AND user_id=?"),

  listEvents: db.prepare("SELECT * FROM events WHERE user_id=? ORDER BY start_ts ASC"),
  insertEvent: db.prepare(`INSERT INTO events
    (id,user_id,title,start_ts,end_ts,flexible,location,created_ts)
    VALUES (?,?,?,?,?,?,?,?)`),
  updateEvent: db.prepare(UPDATE events SET title=?, start_ts=?, end_ts=?, flexible=?, location=? WHERE id=? AND user_id=?),
  deleteEvent: db.prepare("DELETE FROM events WHERE id=? AND user_id=?"),

  listBudget: db.prepare("SELECT * FROM budget_items WHERE user_id=? AND month=? ORDER BY category ASC"),
  upsertBudget: db.prepare(`INSERT INTO budget_items
    (id,user_id,category,planned_cents,actual_cents,month)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET planned_cents=excluded.planned_cents, actual_cents=excluded.actual_cents, category=excluded.category, month=excluded.month`),

  listExchange: db.prepare("SELECT * FROM exchange_listings WHERE status='open' ORDER BY created_ts DESC"),
  insertListing: db.prepare(`INSERT INTO exchange_listings
    (id,user_id,type,title,description,created_ts,status)
    VALUES (?,?,?,?,?,?, 'open')`),
  updateListingStatus: db.prepare("UPDATE exchange_listings SET status=? WHERE id=? AND user_id=?")
};

// --- auth (demo) ---
app.post("/auth/demo", (req, res) => {
  q.userUpsert.run(DEMO_USER_ID, "demo@flexhub.local", "Demo");
  res.json({ token: "demo-token", user: { id: DEMO_USER_ID, name: "Demo" } });
});

// --- tasks CRUD ---
app.get("/tasks", (req, res) => {
  res.json(q.listTasks.all(DEMO_USER_ID));
});

app.post("/tasks", (req, res) => {
  const { title, notes="", due_ts=null, energy=2 } = req.body;
  const urgency = estimateUrgency(due_ts, energy);
  const id = uuid();
  q.insertTask.run(id, DEMO_USER_ID, title, notes, due_ts, energy, urgency, now());
  res.status(201).json(q.getTask.get(id, DEMO_USER_ID));
});

app.put("/tasks/:id", (req, res) => {
  const { title, notes, due_ts, energy, urgency, done } = req.body;
  q.updateTask.run(title, notes, due_ts, energy, urgency, done?1:0, req.params.id, DEMO_USER_ID);
  res.json(q.getTask.get(req.params.id, DEMO_USER_ID));
});

app.delete("/tasks/:id", (req, res) => {
  q.deleteTask.run(req.params.id, DEMO_USER_ID);
  res.status(204).end();
});

// AI-ish prioritizer: sorts by (urgency + energy weight + due proximity)
app.get("/tasks/prioritize", (req, res) => {
  const tasks = q.listTasks.all(DEMO_USER_ID).filter(t => !t.done);
  const prioritized = tasks
    .map(t => {
      const dueScore = t.due_ts ? Math.max(0, 10 - daysUntil(t.due_ts)) : 0;
      const energyWeight = t.energy; // 1..3
      const score = t.urgency*2 + energyWeight + dueScore;
      return { ...t, score };
    })
    .sort((a,b) => b.score - a.score);
  res.json(prioritized);
});

function daysUntil(ts){ return Math.floor((ts - Date.now()) / (1000*60*60*24)); }
function estimateUrgency(due_ts, energy){
  if(!due_ts) return Math.min(3, 1 + Math.round(energy/2));
  const d = daysUntil(due_ts);
  if (d <= 1) return 3;
  if (d <= 3) return 2;
  return 1;
}

// --- events CRUD + autoschedule suggestion ---
app.get("/events", (req, res) => {
  res.json(q.listEvents.all(DEMO_USER_ID));
});

app.post("/events", (req, res) => {
  const { title, start_ts, end_ts, flexible=1, location="" } = req.body;
  const id = uuid();
  q.insertEvent.run(id, DEMO_USER_ID, title, start_ts, end_ts, flexible?1:0, location, now());
  res.status(201).json({ id, title, start_ts, end_ts, flexible, location });
});

app.put("/events/:id", (req,res)=>{
  const { title, start_ts, end_ts, flexible, location } = req.body;
  q.updateEvent.run(title, start_ts, end_ts, flexible?1:0, location, req.params.id, DEMO_USER_ID);
  res.json({ ok: true });
});

app.delete("/events/:id", (req,res)=>{
  q.deleteEvent.run(req.params.id, DEMO_USER_ID);
  res.status(204).end();
});

// Adaptive rescheduler: if conflict or rain flag, suggest new slot
app.post("/events/suggest", (req,res)=>{
  const { durationMin=60, dayStart="09:00", dayEnd="18:00", rain=false } = req.body;
  const events = q.listEvents.all(DEMO_USER_ID);
  const today = new Date();
  const startOfDay = (h,m)=> new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m).getTime();
  const [dsH, dsM] = dayStart.split(":").map(Number);
  const [deH, deM] = dayEnd.split(":").map(Number);
  const windowStart = startOfDay(dsH, dsM);
  const windowEnd   = startOfDay(deH, deM);
  const blocks = events
    .filter(e=> e.start_ts && e.end_ts)
    .sort((a,b)=> a.start_ts - b.start_ts);

  // find first gap >= duration
  let cursor = windowStart + (rain ? 60*60*1000 : 0); // if rain, start a bit later (stay indoors AM)
  for (const b of blocks) {
    if (cursor + durationMin*60*1000 <= b.start_ts) {
      return res.json({ suggested_start: cursor, suggested_end: cursor + durationMin*60*1000, reason: rain ? "Rain delay" : "First available gap" });
    }
    cursor = Math.max(cursor, b.end_ts);
  }
  if (cursor + durationMin*60*1000 <= windowEnd) {
    return res.json({ suggested_start: cursor, suggested_end: cursor + durationMin*60*1000, reason: "End-of-day window" });
  }
  res.status(409).json({ error: "No suitable slot today." });
});

// --- budget ---
app.get("/budget/:month", (req,res)=>{
  res.json(q.listBudget.all(DEMO_USER_ID, req.params.month));
});

app.post("/budget", (req,res)=>{
  const { id = uuid(), category, planned_cents, actual_cents=0, month } = req.body;
  q.upsertBudget.run(id, DEMO_USER_ID, category, planned_cents, actual_cents, month);
  res.status(201).json({ id, category, planned_cents, actual_cents, month });
});

// Cost-of-living hint: suggest swap if actual exceeds planned by >15%
app.get("/budget/:month/suggestions", (req,res)=>{
  const items = q.listBudget.all(DEMO_USER_ID, req.params.month);
  const tips = items
    .filter(i => i.actual_cents > i.planned_cents * 1.15)
    .map(i => ({
      category: i.category,
      message: Spending in ${i.category} is ${Math.round((i.actual_cents/i.planned_cents-1)*100)}% over plan. Consider a cheaper alternative this week.
    }));
  res.json(tips);
});

// --- disruptions ---
app.post("/disruptions/analyze", (req,res)=>{
  const { weather="clear", transit="normal", supply="ok" } = req.body;
  const alerts = [];
  if (weather === "rain") alerts.push("Plan indoor tasks AM; auto-shift outdoor to afternoon.");
  if (weather === "extreme_heat") alerts.push("Avoid 12–4pm outdoor; hydrate and move workouts to evening.");
  if (transit === "strike") alerts.push("Enable WFH mode; buffer +30m travel time; switch to video calls.");
  if (supply === "shortage") alerts.push("Buy shelf-stable substitutes; set price alerts.");
  res.json({ alerts, mode: alerts.length ? "disruption" : "normal" });
});

// --- micro exchange ---
app.get("/exchange", (req,res)=>{ res.json(q.listExchange.all()); });

app.post("/exchange", (req,res)=>{
  const { type, title, description="" } = req.body;
  const id = uuid();
  q.insertListing.run(id, DEMO_USER_ID, type, title, description, now());
  res.status(201).json({ id, type, title, description, status:"open" });
});

app.post("/exchange/:id/close", (req,res)=>{
  q.updateListingStatus.run("closed", req.params.id, DEMO_USER_ID);
  res.json({ ok:true });
});

app.listen(PORT, ()=> {
  console.log(FlexHub API listening on http://localhost:${PORT});
});

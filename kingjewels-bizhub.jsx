import { useState, useEffect, useCallback } from "react";

const TABS = ["Daily Focus", "Finances", "Tasks", "Content", "Leads", "Calendar", "Idea Dump"];

const PLATFORMS = ["In-Person", "Shopify", "Instagram", "Facebook", "eBay", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];
const LEAD_STATUSES = ["Hot", "Warm", "Cold", "Closed"];
const TASK_CATS = ["Products", "Marketing", "Content", "Leads", "Finance", "eBay", "Website", "Other"];
const EXPENSE_CATS = ["Inventory", "Shipping", "Platform Fees", "Marketing/Ads", "Supplies", "Other"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const DEFAULT_DATA = {
  sales: [
    { id: 1, date: "2026-03-07", item: "KingJewels cash on hand (starting balance)", amount: 298.00, platform: "In-Person", status: "Received", notes: "Cash in hand as of Mar 7" },
    { id: 2, date: "2026-03-07", item: "KingJewels checking account (starting balance)", amount: 190.85, platform: "In-Person", status: "Received", notes: "New KingJewels bank account balance" },
    { id: 3, date: "2026-03-07", item: "Josue - Earrings pre-order deposit", amount: 28.00, platform: "In-Person", status: "Pending", notes: "Earrings = 9 total. Paid 8 cash. Collect 1 on delivery. ORDER TODAY." },
  ],
  expenses: [
    { id: 1, date: "2026-03-07", item: "Alibaba bulk order - 4 pairs earrings (Josue, Becca, Santi + 1 extra)", amount: 99.19, category: "Inventory", notes: "Order #293428831501024969. Delivery by Mar 18. Gold studs $15.75, Silver VVS screw back $13.50, 8mm silver studs $23.40, 4-prong silver JE8131-RS7.5 $29.25" },
  ],
  tasks: [
    { id: 1, text: "✅ Alibaba order placed — collect $31 from Josue on delivery (arriving Mar 18)", priority: "High", done: true, due: "2026-03-07", category: "Leads", assignee: "Me" },
    { id: 10, text: "📦 Alibaba order arriving Mar 18 — deliver to Josue (collect $31), Becca ($69), Santi ($79)", priority: "High", done: false, due: "2026-03-18", category: "Leads", assignee: "Me" },
    { id: 2, text: "Update Subway subscription to new KingJewels checking card", priority: "High", done: false, due: "2026-03-07", category: "Finance", assignee: "Me" },
    { id: 3, text: "List more products on Shopify", priority: "High", done: false, due: "2026-03-10", category: "Products", assignee: "Me" },
    { id: 4, text: "Set up eBay listings", priority: "High", done: false, due: "2026-03-10", category: "eBay", assignee: "Me" },
    { id: 5, text: "Post on Instagram & Facebook", priority: "High", done: false, due: "2026-03-08", category: "Content", assignee: "Me" },
    { id: 6, text: "Take product photos", priority: "Medium", done: false, due: "2026-03-12", category: "Content", assignee: "Me" },
    { id: 7, text: "Follow up with leads", priority: "High", done: false, due: "2026-03-08", category: "Leads", assignee: "Me" },
    { id: 8, text: "Plan Facebook Ads campaign", priority: "Medium", done: false, due: "2026-03-14", category: "Marketing", assignee: "Me" },
    { id: 9, text: "Build content schedule", priority: "Medium", done: false, due: "2026-03-13", category: "Content", assignee: "Me" },
  ],
  leads: [
    { id: 1, name: "Josue", contact: "", interest: "Earrings - pre-ordered", status: "Hot", lastContact: "2026-03-07", notes: "Paid $28 deposit. Owes $31 on delivery. Order his earrings TODAY ($59 total)." },
    { id: 2, name: "Becca (Godmother)", contact: "", interest: "Silver round studs", status: "Hot", lastContact: "2026-03-07", notes: "Charging $69. Order in bulk with Josue and Santi." },
    { id: 3, name: "Santi", contact: "", interest: "6.5mm round prong studs - silver", status: "Hot", lastContact: "2026-03-07", notes: "Charging $79. Almost guaranteed. Order in bulk with Josue and Becca." },
    { id: 4, name: "Kevin", contact: "", interest: "7.5mm single stone stud - big stone, silver", status: "Cold", lastContact: "2026-03-07", notes: "Might not go through. Low priority." },
  ],
  content: [
    { id: 1, date: "2026-03-08", platform: "Instagram", type: "Product Photo", caption: "New cluster stud earrings 🔥 VVS quality, Texas made", status: "Planned" },
    { id: 2, date: "2026-03-09", platform: "Facebook", type: "Ad", caption: "KingJewels — Shop earrings, chains & bracelets", status: "Planned" },
    { id: 3, date: "2026-03-11", platform: "Instagram", type: "Reel", caption: "Behind the scenes — how we pick our pieces", status: "Planned" },
    { id: 4, date: "2026-03-13", platform: "Instagram", type: "Product Photo", caption: "Clover bracelet in gold 👑", status: "Planned" },
    { id: 5, date: "2026-03-15", platform: "Facebook", type: "Product Listing", caption: "New arrivals just dropped", status: "Planned" },
  ],
  budget: { monthly: 500, adSpend: 100 },
};

function formatCurrency(n) {
  return "$" + Number(n || 0).toFixed(2);
}
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { return new Date(y, m, 1).getDay(); }

const priorityColor = { High: "#ff5757", Medium: "#f5a623", Low: "#4cdf8a" };
const statusColor = { Hot: "#ff5757", Warm: "#f5a623", Cold: "#64b5f6", Closed: "#555" };
const platformColor = { Instagram: "#e1306c", Facebook: "#1877f2", Shopify: "#96bf48", "In-Person": "#7c6af7", eBay: "#e53238", Other: "#888" };

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem("kingjewels_" + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });
  const setPersisted = useCallback((val) => {
    setState(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      try { localStorage.setItem("kingjewels_" + key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [state, setPersisted];
}

export default function App() {
  const [tab, setTab] = useState("Daily Focus");
  const [sales, setSales] = usePersistedState("sales", DEFAULT_DATA.sales);
  const [expenses, setExpenses] = usePersistedState("expenses", DEFAULT_DATA.expenses);
  const [tasks, setTasks] = usePersistedState("tasks", DEFAULT_DATA.tasks);
  const [leads, setLeads] = usePersistedState("leads", DEFAULT_DATA.leads);
  const [content, setContent] = usePersistedState("content", DEFAULT_DATA.content);
  const [budget] = usePersistedState("budget", DEFAULT_DATA.budget);
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(2);

  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);

  const [saleForm, setSaleForm] = useState({ date: "", item: "", amount: "", platform: "In-Person", status: "Received", notes: "" });
  const [expForm, setExpForm] = useState({ date: "", item: "", amount: "", category: "Inventory", notes: "" });
  const [taskForm, setTaskForm] = useState({ text: "", priority: "High", due: "", category: "Products", assignee: "Me" });
  const [leadForm, setLeadForm] = useState({ name: "", contact: "", interest: "", status: "Warm", lastContact: "", notes: "" });
  const [contentForm, setContentForm] = useState({ date: "", platform: "Instagram", type: "Product Photo", caption: "", status: "Planned" });

  const totalRevenue = sales.reduce((s, x) => s + Number(x.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;
  const openTasks = tasks.filter(t => !t.done).length;
  const hotLeads = leads.filter(l => l.status === "Hot").length;
  const todayTasks = tasks.filter(t => !t.done && t.priority === "High");
  const todayContent = content.filter(c => c.date === "2026-03-07" || c.status === "Planned").slice(0, 3);
  const adSpent = expenses.filter(e => e.category === "Marketing/Ads").reduce((s, x) => s + Number(x.amount || 0), 0);

  function addSale() {
    if (!saleForm.item || !saleForm.amount || !saleForm.date) return;
    setSales(s => [...s, { ...saleForm, id: Date.now(), amount: parseFloat(saleForm.amount) }]);
    setSaleForm({ date: "", item: "", amount: "", platform: "In-Person", status: "Received", notes: "" });
    setShowSaleForm(false);
  }
  function addExpense() {
    if (!expForm.item || !expForm.amount || !expForm.date) return;
    setExpenses(e => [...e, { ...expForm, id: Date.now(), amount: parseFloat(expForm.amount) }]);
    setExpForm({ date: "", item: "", amount: "", category: "Inventory", notes: "" });
    setShowExpForm(false);
  }
  function addTask() {
    if (!taskForm.text) return;
    setTasks(t => [...t, { ...taskForm, id: Date.now(), done: false }]);
    setTaskForm({ text: "", priority: "High", due: "", category: "Products", assignee: "Me" });
    setShowTaskForm(false);
  }
  function addLead() {
    if (!leadForm.name) return;
    setLeads(l => [...l, { ...leadForm, id: Date.now() }]);
    setLeadForm({ name: "", contact: "", interest: "", status: "Warm", lastContact: "", notes: "" });
    setShowLeadForm(false);
  }
  function addContent() {
    if (!contentForm.date || !contentForm.caption) return;
    setContent(c => [...c, { ...contentForm, id: Date.now() }]);
    setContentForm({ date: "", platform: "Instagram", type: "Product Photo", caption: "", status: "Planned" });
    setShowContentForm(false);
  }
  function toggleTask(id) { setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x)); }
  function deleteTask(id) { setTasks(t => t.filter(x => x.id !== id)); }
  function deleteSale(id) { setSales(s => s.filter(x => x.id !== id)); }
  function deleteExpense(id) { setExpenses(e => e.filter(x => x.id !== id)); }
  function deleteLead(id) { setLeads(l => l.filter(x => x.id !== id)); }
  function deleteContent(id) { setContent(c => c.filter(x => x.id !== id)); }
  function updateLeadStatus(id, status) { setLeads(l => l.map(x => x.id === id ? { ...x, status } : x)); }
  function updateContentStatus(id, status) { setContent(c => c.map(x => x.id === id ? { ...x, status } : x)); }

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDay(calYear, calMonth);
  function getTasksForDay(day) {
    const d = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return [...tasks.filter(t => t.due === d), ...content.filter(c => c.date === d)];
  }

  const [ideas, setIdeas] = usePersistedState("ideas", []);
  const [ideaDump, setIdeaDump] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  async function analyzeIdeas() {
    if (!ideaDump.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeError("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a business advisor for KingJewels, a physical jewelry business in Texas that sells VVS earrings, chains, bracelets, rings, and custom pieces. They sell on Shopify (shopkingjewels.com), Instagram, Facebook Marketplace, In-Person, and are expanding to eBay. The owner runs it with one other person and wants to grow online sales, get more listings up, build their social media, and run Facebook ads.

Analyze the raw ideas the user dumps and return ONLY a valid JSON array. No markdown, no explanation, just the array.

Each idea should become an object with:
- id: unique number
- idea: the original idea (cleaned up, max 80 chars)
- category: one of "Marketing", "Content", "Finance", "Products", "Website", "eBay", "Leads", "Operations", "Other"
- priority: "High", "Medium", or "Low" based on how much impact it could have on sales
- impact: one sentence on WHY this matters for KingJewels specifically
- action: one concrete next step they can take today
- addToTasks: true if this should become a task, false if it's just an idea to keep

Be generous — extract every distinct idea even if vague.`,
          messages: [{ role: "user", content: `Here are my raw ideas for KingJewels:\n\n${ideaDump}\n\nReturn a JSON array of analyzed ideas.` }]
        })
      });
      const data = await response.json();
      const text = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setIdeas(prev => [...parsed.map((p, i) => ({ ...p, id: Date.now() + i, saved: false })), ...prev]);
      setIdeaDump("");
    } catch (e) {
      setAnalyzeError("Something went wrong analyzing your ideas. Try again!");
    }
    setIsAnalyzing(false);
  }

  function addIdeaAsTask(idea) {
    setTasks(t => [...t, { id: Date.now(), text: idea.idea, priority: idea.priority, done: false, due: "", category: idea.category === "Content" ? "Content" : idea.category === "Finance" ? "Finance" : idea.category === "eBay" ? "eBay" : idea.category === "Marketing" ? "Marketing" : idea.category === "Products" ? "Products" : idea.category === "Website" ? "Website" : "Other", assignee: "Me" }]);
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, saved: true } : i));
  }
  function deleteIdea(id) { setIdeas(i => i.filter(x => x.id !== id)); }

  const tabIcons = { "Daily Focus": "⚡", Finances: "💰", Tasks: "✅", Content: "📅", Leads: "🔥", Calendar: "🗓️", "Idea Dump": "🧠" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a10", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px}
        input,select,textarea{background:#13131e;border:1px solid #232333;color:#f0ede8;border-radius:8px;padding:9px 12px;font-family:inherit;font-size:13px;width:100%;outline:none;transition:border 0.15s}
        input:focus,select:focus,textarea:focus{border-color:#7c6af7}
        .btn{cursor:pointer;border:none;border-radius:8px;padding:9px 16px;font-family:inherit;font-weight:600;font-size:13px;transition:all 0.15s;display:inline-flex;align-items:center;gap:6px}
        .btn-primary{background:#7c6af7;color:#fff}.btn-primary:hover{background:#6a58e8;transform:translateY(-1px)}
        .btn-sm{padding:5px 10px;font-size:12px}
        .btn-danger{background:transparent;color:#ff6b6b;border:1px solid #ff6b6b22}.btn-danger:hover{background:#ff6b6b15}
        .btn-ghost{background:transparent;color:#777;border:1px solid #232333}.btn-ghost:hover{background:#13131e;color:#ddd}
        .btn-green{background:#1a3a2a;color:#4cdf8a;border:1px solid #4cdf8a33}.btn-green:hover{background:#1e4a32}
        .card{background:#11111a;border:1px solid #1e1e2e;border-radius:14px;padding:20px}
        .tag{display:inline-block;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;letter-spacing:0.3px}
        .form-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
        .form-group{display:flex;flex-direction:column;gap:5px;flex:1;min-width:130px}
        .form-group label{font-size:10px;color:#666;font-weight:700;letter-spacing:0.8px;text-transform:uppercase}
        .stat-card{background:linear-gradient(135deg,#11111a,#181826);border:1px solid #1e1e2e;border-radius:14px;padding:20px;transition:transform 0.15s,border-color 0.15s}
        .stat-card:hover{transform:translateY(-2px);border-color:#2e2e42}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;color:#555;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:10px 14px;border-bottom:1px solid #1a1a26}
        td{padding:12px 14px;border-bottom:1px solid #161622;font-size:13px;vertical-align:middle}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:#13131e}
        .progress-bar{height:6px;background:#1e1e2e;border-radius:3px;overflow:hidden}
        .progress-fill{height:100%;border-radius:3px;transition:width 0.4s}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.25s ease}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .pulse{animation:pulse 2s infinite}
        .nav-tab{background:transparent;color:#555;border:none;padding:8px 14px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;border-radius:8px;transition:all 0.15s;display:flex;align-items:center;gap:6px}
        .nav-tab.active{background:#7c6af7;color:#fff}
        .nav-tab:hover:not(.active){color:#aaa;background:#13131e}
      `}</style>

      {/* Header */}
      <div style={{ background: "#0d0d16", borderBottom: "1px solid #1a1a26", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#7c6af7,#c46af7)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👑</div>
            <div>
              <div style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 16, letterSpacing: "-0.5px", lineHeight: 1 }}>KingJewels</div>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.5px" }}>BizHub · shopkingjewels.com</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 2 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`nav-tab${tab === t ? " active" : ""}`}>
                <span>{tabIcons[t]}</span><span style={{ display: window.innerWidth < 700 ? "none" : "inline" }}>{t}</span>
              </button>
            ))}
          </nav>
          <div style={{ fontSize: 11, color: "#444", textAlign: "right" }}>
            <div>Sat, Mar 7</div>
            <div style={{ color: "#555" }}>2026</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "24px 20px" }} className="fade-up">

        {/* ── DAILY FOCUS ── */}
        {tab === "Daily Focus" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 28, letterSpacing: "-1px" }}>Good morning 👑</h1>
              <p style={{ color: "#555", fontSize: 14, marginTop: 4 }}>Here's what needs your attention today for KingJewels.</p>
            </div>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Revenue", value: formatCurrency(totalRevenue), sub: "All platforms", color: "#4cdf8a", icon: "💰" },
                { label: "Total Spent", value: formatCurrency(totalExpenses), sub: "Inventory + fees", color: "#f5a623", icon: "📦" },
                { label: "Net Profit", value: formatCurrency(profit), sub: profit >= 0 ? "You're up! 🔥" : "Keep pushing", color: profit >= 0 ? "#4cdf8a" : "#ff5757", icon: "📈" },
                { label: "Open Tasks", value: openTasks, sub: "Need action", color: "#7c6af7", icon: "✅" },
                { label: "Hot Leads", value: hotLeads, sub: "Ready to buy", color: "#ff5757", icon: "🔥" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Syne", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              {/* Priority Tasks */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15 }}>🎯 Today's Priority Tasks</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab("Tasks")}>View all</button>
                </div>
                {todayTasks.slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: "1px solid #161622" }}>
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ marginTop: 2, width: 16, height: 16, accentColor: "#7c6af7", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#444" : "#e0ddf8" }}>{t.text}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{t.category}{t.due ? ` · Due ${t.due}` : ""}</div>
                    </div>
                    <span className="tag" style={{ background: priorityColor[t.priority] + "22", color: priorityColor[t.priority], flexShrink: 0 }}>{t.priority}</span>
                  </div>
                ))}
                {todayTasks.length === 0 && <p style={{ color: "#444", fontSize: 13, textAlign: "center", padding: "20px 0" }}>All caught up! 🎉</p>}
              </div>

              {/* Leads + Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="card" style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15 }}>🔥 Hot Leads</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("Leads")}>View all</button>
                  </div>
                  {leads.filter(l => l.status === "Hot" || l.status === "Warm").slice(0, 3).map(l => (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #161622" }}>
                      <div style={{ width: 32, height: 32, background: "#1e1e2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{l.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: "#555" }}>{l.interest}</div>
                      </div>
                      <span className="tag" style={{ background: statusColor[l.status] + "22", color: statusColor[l.status] }}>{l.status}</span>
                    </div>
                  ))}
                  {leads.filter(l => l.status === "Hot" || l.status === "Warm").length === 0 && <p style={{ color: "#444", fontSize: 13 }}>No active leads yet. Add some!</p>}
                </div>

                <div className="card" style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15 }}>📸 Upcoming Posts</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("Content")}>View all</button>
                  </div>
                  {todayContent.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #161622" }}>
                      <span className="tag" style={{ background: platformColor[c.platform] + "22", color: platformColor[c.platform], flexShrink: 0 }}>{c.platform}</span>
                      <div style={{ flex: 1, fontSize: 12, color: "#aaa" }}>{c.type} · {c.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform breakdown */}
            <div className="card">
              <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📊 Revenue by Platform</div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {PLATFORMS.map(p => {
                  const pSales = sales.filter(s => s.platform === p);
                  if (!pSales.length) return null;
                  const total = pSales.reduce((s, x) => s + Number(x.amount), 0);
                  const pct = totalRevenue > 0 ? (total / totalRevenue * 100) : 0;
                  return (
                    <div key={p} style={{ minWidth: 120, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: platformColor[p], fontWeight: 600 }}>{p}</span>
                        <span style={{ fontSize: 12, color: "#aaa" }}>{formatCurrency(total)}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: pct + "%", background: platformColor[p] }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{pSales.length} sale{pSales.length !== 1 ? "s" : ""} · {pct.toFixed(0)}%</div>
                    </div>
                  );
                })}
                {sales.length === 0 && <p style={{ color: "#444", fontSize: 13 }}>Log your first sale in the Finances tab to see your breakdown.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── FINANCES ── */}
        {tab === "Finances" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 24 }}>Finance Tracker</h2>
                <p style={{ color: "#555", fontSize: 13, marginTop: 3 }}>Every dollar in and out of KingJewels</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { setShowExpForm(!showExpForm); setShowSaleForm(false); }}>+ Expense</button>
                <button className="btn btn-primary" onClick={() => { setShowSaleForm(!showSaleForm); setShowExpForm(false); }}>+ Log Sale</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
              {[
                { label: "REVENUE", value: formatCurrency(totalRevenue), color: "#4cdf8a" },
                { label: "EXPENSES", value: formatCurrency(totalExpenses), color: "#f5a623" },
                { label: "NET PROFIT", value: formatCurrency(profit), color: profit >= 0 ? "#4cdf8a" : "#ff5757" },
                { label: "AD SPEND", value: formatCurrency(adSpent), color: "#64b5f6" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: "0.8px", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Syne", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {showSaleForm && (
              <div className="card fade-up" style={{ marginBottom: 18, borderColor: "#7c6af755" }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>💰 Log New Sale</div>
                <div className="form-row">
                  <div className="form-group"><label>Date</label><input type="date" value={saleForm.date} onChange={e => setSaleForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div className="form-group" style={{ flex: 2 }}><label>Item Sold</label><input type="text" placeholder="e.g. Gold cluster earrings" value={saleForm.item} onChange={e => setSaleForm(f => ({ ...f, item: e.target.value }))} /></div>
                  <div className="form-group"><label>Amount ($)</label><input type="number" placeholder="0.00" value={saleForm.amount} onChange={e => setSaleForm(f => ({ ...f, amount: e.target.value }))} /></div>
                  <div className="form-group"><label>Platform</label><select value={saleForm.platform} onChange={e => setSaleForm(f => ({ ...f, platform: e.target.value }))}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select></div>
                  <div className="form-group"><label>Status</label><select value={saleForm.status} onChange={e => setSaleForm(f => ({ ...f, status: e.target.value }))}>{["Received","Pending","Refunded"].map(s => <option key={s}>{s}</option>)}</select></div>
                  <button className="btn btn-primary" onClick={addSale} style={{ alignSelf: "flex-end" }}>Add Sale</button>
                </div>
              </div>
            )}

            {showExpForm && (
              <div className="card fade-up" style={{ marginBottom: 18, borderColor: "#f5a62355" }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>📦 Log New Expense</div>
                <div className="form-row">
                  <div className="form-group"><label>Date</label><input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div className="form-group" style={{ flex: 2 }}><label>Description</label><input type="text" placeholder="e.g. Jewelry inventory restock" value={expForm.item} onChange={e => setExpForm(f => ({ ...f, item: e.target.value }))} /></div>
                  <div className="form-group"><label>Amount ($)</label><input type="number" placeholder="0.00" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} /></div>
                  <div className="form-group"><label>Category</label><select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>{EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                  <button className="btn btn-primary" onClick={addExpense} style={{ alignSelf: "flex-end", background: "#f5a623" }}>Add Expense</button>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div className="card">
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, marginBottom: 14 }}>💰 Sales ({sales.length})</div>
                {sales.length === 0 ? <p style={{ color: "#444", fontSize: 13, padding: "16px 0" }}>No sales logged yet. Hit "+ Log Sale" to start!</p> : (
                  <table>
                    <thead><tr><th>Date</th><th>Item</th><th>Platform</th><th>Amount</th><th></th></tr></thead>
                    <tbody>
                      {[...sales].reverse().map(s => (
                        <tr key={s.id}>
                          <td style={{ color: "#555", fontSize: 12 }}>{s.date}</td>
                          <td>{s.item}</td>
                          <td><span className="tag" style={{ background: platformColor[s.platform] + "22", color: platformColor[s.platform] }}>{s.platform}</span></td>
                          <td style={{ color: "#4cdf8a", fontWeight: 700 }}>{formatCurrency(s.amount)}</td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => deleteSale(s.id)}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="card">
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📦 Expenses ({expenses.length})</div>
                {expenses.length === 0 ? <p style={{ color: "#444", fontSize: 13, padding: "16px 0" }}>No expenses logged yet.</p> : (
                  <table>
                    <thead><tr><th>Date</th><th>Item</th><th>Category</th><th>Amount</th><th></th></tr></thead>
                    <tbody>
                      {[...expenses].reverse().map(e => (
                        <tr key={e.id}>
                          <td style={{ color: "#555", fontSize: 12 }}>{e.date}</td>
                          <td>{e.item}</td>
                          <td><span className="tag" style={{ background: "#f5a62322", color: "#f5a623" }}>{e.category}</span></td>
                          <td style={{ color: "#f5a623", fontWeight: 700 }}>{formatCurrency(e.amount)}</td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => deleteExpense(e.id)}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TASKS ── */}
        {tab === "Tasks" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 24 }}>Task Manager</h2>
                <p style={{ color: "#555", fontSize: 13, marginTop: 3 }}>{openTasks} tasks open · KingJewels</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>+ Add Task</button>
            </div>

            {showTaskForm && (
              <div className="card fade-up" style={{ marginBottom: 20, borderColor: "#7c6af755" }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>New Task</div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 3 }}><label>Task</label><input type="text" placeholder="What needs to get done?" value={taskForm.text} onChange={e => setTaskForm(f => ({ ...f, text: e.target.value }))} /></div>
                  <div className="form-group"><label>Priority</label><select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
                  <div className="form-group"><label>Category</label><select value={taskForm.category} onChange={e => setTaskForm(f => ({ ...f, category: e.target.value }))}>{TASK_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label>Due Date</label><input type="date" value={taskForm.due} onChange={e => setTaskForm(f => ({ ...f, due: e.target.value }))} /></div>
                  <div className="form-group"><label>Assignee</label><select value={taskForm.assignee} onChange={e => setTaskForm(f => ({ ...f, assignee: e.target.value }))}><option>Me</option><option>Partner</option></select></div>
                  <button className="btn btn-primary" onClick={addTask} style={{ alignSelf: "flex-end" }}>Add</button>
                </div>
              </div>
            )}

            {TASK_CATS.map(cat => {
              const catTasks = tasks.filter(t => t.category === cat);
              if (!catTasks.length) return null;
              const done = catTasks.filter(t => t.done).length;
              return (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.8px", textTransform: "uppercase" }}>{cat}</div>
                    <div style={{ fontSize: 11, color: "#444" }}>{done}/{catTasks.length} done</div>
                    <div style={{ flex: 1, height: 3, background: "#1e1e2e", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#7c6af7", width: (catTasks.length ? done/catTasks.length*100 : 0) + "%" }} />
                    </div>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {catTasks.map((t, i) => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < catTasks.length - 1 ? "1px solid #161622" : "none", opacity: t.done ? 0.4 : 1, transition: "opacity 0.2s" }}>
                        <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ width: 17, height: 17, accentColor: "#7c6af7", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</div>
                          {t.due && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Due {t.due} · {t.assignee}</div>}
                        </div>
                        <span className="tag" style={{ background: priorityColor[t.priority] + "22", color: priorityColor[t.priority] }}>{t.priority}</span>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTask(t.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CONTENT SCHEDULE ── */}
        {tab === "Content" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 24 }}>Content Schedule</h2>
                <p style={{ color: "#555", fontSize: 13, marginTop: 3 }}>Instagram · Facebook · eBay · Shopify</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowContentForm(!showContentForm)}>+ Add Post</button>
            </div>

            {showContentForm && (
              <div className="card fade-up" style={{ marginBottom: 20, borderColor: "#e1306c55" }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>New Content</div>
                <div className="form-row">
                  <div className="form-group"><label>Date</label><input type="date" value={contentForm.date} onChange={e => setContentForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div className="form-group"><label>Platform</label><select value={contentForm.platform} onChange={e => setContentForm(f => ({ ...f, platform: e.target.value }))}>{["Instagram","Facebook","eBay","Shopify","TikTok"].map(p => <option key={p}>{p}</option>)}</select></div>
                  <div className="form-group"><label>Type</label><select value={contentForm.type} onChange={e => setContentForm(f => ({ ...f, type: e.target.value }))}>{["Product Photo","Reel","Ad","Story","Listing"].map(t => <option key={t}>{t}</option>)}</select></div>
                  <div className="form-group" style={{ flex: 3 }}><label>Caption / Description</label><input type="text" placeholder="Caption or listing description..." value={contentForm.caption} onChange={e => setContentForm(f => ({ ...f, caption: e.target.value }))} /></div>
                  <div className="form-group"><label>Status</label><select value={contentForm.status} onChange={e => setContentForm(f => ({ ...f, status: e.target.value }))}>{["Planned","Posted","Skipped"].map(s => <option key={s}>{s}</option>)}</select></div>
                  <button className="btn btn-primary" onClick={addContent} style={{ alignSelf: "flex-end", background: "#e1306c" }}>Add</button>
                </div>
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table>
                <thead><tr><th>Date</th><th>Platform</th><th>Type</th><th>Caption</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {[...content].sort((a, b) => a.date > b.date ? 1 : -1).map(c => (
                    <tr key={c.id}>
                      <td style={{ color: "#666", fontSize: 12, whiteSpace: "nowrap" }}>{c.date}</td>
                      <td><span className="tag" style={{ background: platformColor[c.platform] + "22", color: platformColor[c.platform] }}>{c.platform}</span></td>
                      <td style={{ color: "#aaa", fontSize: 12 }}>{c.type}</td>
                      <td style={{ fontSize: 12, color: "#bbb", maxWidth: 280 }}>{c.caption}</td>
                      <td>
                        <select value={c.status} onChange={e => updateContentStatus(c.id, e.target.value)}
                          style={{ width: "auto", padding: "4px 8px", fontSize: 12, fontWeight: 700,
                            background: c.status === "Posted" ? "#1a3a2a" : c.status === "Skipped" ? "#2a1a1a" : "#1e1e2e",
                            color: c.status === "Posted" ? "#4cdf8a" : c.status === "Skipped" ? "#ff5757" : "#888", border: "none" }}>
                          {["Planned","Posted","Skipped"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteContent(c.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tips */}
            <div className="card" style={{ marginTop: 18, background: "#0f1a14", borderColor: "#1a3a2a" }}>
              <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 14, color: "#4cdf8a", marginBottom: 12 }}>💡 Content Tips for KingJewels</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                <div>📸 <strong style={{ color: "#aaa" }}>Instagram:</strong> Post product photos with natural lighting. Show it being worn. Use #VVS #JewelryTexas #GoldJewelry</div>
                <div>📘 <strong style={{ color: "#aaa" }}>Facebook Ads:</strong> Start with $5/day retargeting people who visited shopkingjewels.com</div>
                <div>🛒 <strong style={{ color: "#aaa" }}>eBay listings:</strong> Use exact search terms like "10mm VVS moissanite stud earrings gold"</div>
                <div>🎥 <strong style={{ color: "#aaa" }}>Reels:</strong> Unboxing + close-up sparkle videos get huge reach for jewelry. Post 3x/week.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── LEADS ── */}
        {tab === "Leads" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 24 }}>Lead Tracker</h2>
                <p style={{ color: "#555", fontSize: 13, marginTop: 3 }}>Never lose a potential sale</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowLeadForm(!showLeadForm)}>+ Add Lead</button>
            </div>

            {showLeadForm && (
              <div className="card fade-up" style={{ marginBottom: 20, borderColor: "#ff575755" }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>New Lead</div>
                <div className="form-row">
                  <div className="form-group"><label>Name</label><input type="text" placeholder="Customer name" value={leadForm.name} onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="form-group"><label>Contact</label><input type="text" placeholder="Phone or @handle" value={leadForm.contact} onChange={e => setLeadForm(f => ({ ...f, contact: e.target.value }))} /></div>
                  <div className="form-group"><label>Interested In</label><input type="text" placeholder="Which product?" value={leadForm.interest} onChange={e => setLeadForm(f => ({ ...f, interest: e.target.value }))} /></div>
                  <div className="form-group"><label>Status</label><select value={leadForm.status} onChange={e => setLeadForm(f => ({ ...f, status: e.target.value }))}>{LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                  <div className="form-group"><label>Last Contact</label><input type="date" value={leadForm.lastContact} onChange={e => setLeadForm(f => ({ ...f, lastContact: e.target.value }))} /></div>
                  <div className="form-group" style={{ flex: 2 }}><label>Notes</label><input type="text" placeholder="What did they say?" value={leadForm.notes} onChange={e => setLeadForm(f => ({ ...f, notes: e.target.value }))} /></div>
                  <button className="btn btn-primary" onClick={addLead} style={{ alignSelf: "flex-end", background: "#ff5757" }}>Add Lead</button>
                </div>
              </div>
            )}

            {LEAD_STATUSES.filter(s => s !== "Closed").map(status => {
              const sl = leads.filter(l => l.status === status);
              if (!sl.length) return null;
              return (
                <div key={status} style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[status] }} className={status === "Hot" ? "pulse" : ""} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[status], letterSpacing: "0.8px", textTransform: "uppercase" }}>{status}</span>
                    <span style={{ fontSize: 11, color: "#444" }}>{sl.length} lead{sl.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <table>
                      <thead><tr><th>Name</th><th>Contact</th><th>Interested In</th><th>Last Contact</th><th>Notes</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {sl.map(l => (
                          <tr key={l.id}>
                            <td style={{ fontWeight: 600 }}>{l.name}</td>
                            <td style={{ color: "#666", fontSize: 12 }}>{l.contact}</td>
                            <td style={{ fontSize: 13 }}>{l.interest}</td>
                            <td style={{ color: "#555", fontSize: 12 }}>{l.lastContact}</td>
                            <td style={{ color: "#666", fontSize: 12, maxWidth: 180 }}>{l.notes}</td>
                            <td>
                              <select value={l.status} onChange={e => updateLeadStatus(l.id, e.target.value)}
                                style={{ width: "auto", background: statusColor[l.status] + "22", color: statusColor[l.status], border: "none", padding: "4px 8px", fontWeight: 700, fontSize: 12 }}>
                                {LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}
                              </select>
                            </td>
                            <td><button className="btn btn-danger btn-sm" onClick={() => deleteLead(l.id)}>✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CALENDAR ── */}
        {tab === "Calendar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 24 }}>{MONTH_NAMES[calMonth]} {calYear}</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); }}>← Prev</button>
                <button className="btn btn-ghost" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); }}>Next →</button>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 18 }}>
              <table style={{ width: "100%" }}>
                <thead><tr>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <th key={d} style={{ textAlign: "center", padding: "8px 0" }}>{d}</th>)}</tr></thead>
                <tbody>
                  {Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) }, (_, week) => (
                    <tr key={week}>
                      {Array.from({ length: 7 }, (_, dow) => {
                        const day = week * 7 + dow - firstDay + 1;
                        const isToday = day === 7 && calMonth === 2 && calYear === 2026;
                        const items = day >= 1 && day <= daysInMonth ? getTasksForDay(day) : [];
                        return (
                          <td key={dow} style={{ padding: 3, verticalAlign: "top", width: "14.28%" }}>
                            {day >= 1 && day <= daysInMonth && (
                              <div style={{ minHeight: 72, borderRadius: 8, padding: 6, background: isToday ? "#1e1c35" : "#13131e", border: `1px solid ${isToday ? "#7c6af7" : "#1e1e2e"}` }}>
                                <div style={{ fontWeight: isToday ? 800 : 400, color: isToday ? "#7c6af7" : "#666", fontSize: 12, marginBottom: 3 }}>{day}</div>
                                {items.slice(0, 2).map((item, i) => (
                                  <div key={i} style={{ borderRadius: 3, padding: "2px 5px", fontSize: 10, marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                                    background: item.priority ? priorityColor[item.priority] + "33" : platformColor[item.platform] + "33",
                                    color: item.priority ? priorityColor[item.priority] : platformColor[item.platform] }}>
                                    {item.text || item.type}
                                  </div>
                                ))}
                                {items.length > 2 && <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>+{items.length - 2} more</div>}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>Upcoming This Month</div>
              {[...tasks.filter(t => !t.done && t.due && t.due.startsWith(`${calYear}-${String(calMonth+1).padStart(2,"0")}`)),
                ...content.filter(c => c.date && c.date.startsWith(`${calYear}-${String(calMonth+1).padStart(2,"0")}`) && c.status === "Planned")]
                .sort((a, b) => (a.due || a.date) > (b.due || b.date) ? 1 : -1)
                .map((item, i) => (
                  <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 16px", marginBottom: 8 }}>
                    <div style={{ width: 4, height: 34, borderRadius: 2, background: item.priority ? priorityColor[item.priority] : platformColor[item.platform], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>{item.text || `${item.platform} — ${item.type}`}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{item.due || item.date} · {item.category || item.platform}</div>
                    </div>
                    {item.priority && <span className="tag" style={{ background: priorityColor[item.priority] + "22", color: priorityColor[item.priority] }}>{item.priority}</span>}
                    {item.platform && !item.priority && <span className="tag" style={{ background: platformColor[item.platform] + "22", color: platformColor[item.platform] }}>{item.platform}</span>}
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* ── IDEA DUMP ── */}
        {tab === "Idea Dump" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 24 }}>🧠 Idea Dump</h2>
              <p style={{ color: "#555", fontSize: 13, marginTop: 3 }}>Brain-dump anything. AI will sort, prioritize & categorize it all for KingJewels.</p>
            </div>

            <div className="card" style={{ marginBottom: 20, borderColor: "#7c6af755", background: "#0f0f1a" }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Dump your ideas here — don't filter yourself 👇</div>
              <textarea
                rows={6}
                placeholder={"e.g. I want to do a giveaway on Instagram, maybe bundle earrings with a chain for a discount, set up automated emails for abandoned carts, film a reel showing how the VVS stones sparkle, list on eBay with better keywords, run Facebook ads targeting women 18-35 in Texas..."}
                value={ideaDump}
                onChange={e => setIdeaDump(e.target.value)}
                style={{ resize: "vertical", lineHeight: 1.7, fontSize: 13, color: "#ccc", minHeight: 120 }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <button className="btn btn-primary" onClick={analyzeIdeas} disabled={isAnalyzing || !ideaDump.trim()} style={{ opacity: (!ideaDump.trim() || isAnalyzing) ? 0.5 : 1, fontSize: 14, padding: "11px 24px" }}>
                  {isAnalyzing ? "⏳ Analyzing..." : "✨ Analyze My Ideas"}
                </button>
                {isAnalyzing && <span style={{ fontSize: 12, color: "#7c6af7" }} className="pulse">AI is reading your ideas and categorizing them for KingJewels...</span>}
                {analyzeError && <span style={{ fontSize: 12, color: "#ff5757" }}>{analyzeError}</span>}
              </div>
            </div>

            {/* Grouped results */}
            {ideas.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.8px", textTransform: "uppercase" }}>{ideas.length} ideas saved</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setIdeas([])}>Clear all</button>
                </div>

                {/* High priority first */}
                {["High","Medium","Low"].map(pri => {
                  const priIdeas = ideas.filter(i => i.priority === pri);
                  if (!priIdeas.length) return null;
                  return (
                    <div key={pri} style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColor[pri] }} className={pri === "High" ? "pulse" : ""} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: priorityColor[pri], letterSpacing: "0.8px", textTransform: "uppercase" }}>{pri} Impact · {priIdeas.length} ideas</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
                        {priIdeas.map(idea => (
                          <div key={idea.id} className="card" style={{ borderColor: priorityColor[idea.priority] + "22", position: "relative", opacity: idea.saved ? 0.6 : 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <span className="tag" style={{ background: "#1e1e2e", color: "#aaa", fontSize: 11 }}>{idea.category}</span>
                              <div style={{ display: "flex", gap: 6 }}>
                                <span className="tag" style={{ background: priorityColor[idea.priority] + "22", color: priorityColor[idea.priority] }}>{idea.priority}</span>
                                <button className="btn btn-danger btn-sm" style={{ padding: "3px 7px" }} onClick={() => deleteIdea(idea.id)}>✕</button>
                              </div>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>{idea.idea}</div>
                            <div style={{ fontSize: 12, color: "#666", marginBottom: 8, lineHeight: 1.5 }}>💡 {idea.impact}</div>
                            <div style={{ fontSize: 12, color: "#7c6af7", marginBottom: 12, lineHeight: 1.5 }}>→ {idea.action}</div>
                            {!idea.saved ? (
                              <button className="btn btn-green btn-sm" onClick={() => addIdeaAsTask(idea)} style={{ width: "100%" }}>
                                + Add to Tasks
                              </button>
                            ) : (
                              <div style={{ fontSize: 12, color: "#4cdf8a", textAlign: "center", padding: "6px 0" }}>✓ Added to Tasks</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {ideas.length === 0 && !isAnalyzing && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "#333" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
                <div style={{ fontSize: 15, color: "#555" }}>Your analyzed ideas will appear here.</div>
                <div style={{ fontSize: 13, color: "#3a3a4a", marginTop: 6 }}>Type anything above — even half-formed thoughts work.</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import MedicineForm from "./components/MedicineForm.jsx";
import MedicineCard from "./components/MedicineCard.jsx";
import {
  NotificationManager,
  ensurePermission,
} from "./utils/notifications.js";
import { scheduleAll, cancelAll, nextDueForAll } from "./utils/scheduler.js";
import { loadMeds, saveMeds } from "./utils/storage.js";

export default function App() {
  const [meds, setMeds] = useState(() => loadMeds());
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    document.title = "Medi_Time";
  }, []);

  // keep storage in sync
  useEffect(() => saveMeds(meds), [meds]);

  // schedule reminders whenever meds change
  useEffect(() => {
    cancelAll();
    scheduleAll(meds, (payload) => NotificationManager.notify(payload));
    return () => cancelAll();
  }, [meds]);

  // re-check permission changes (e.g., after user grants)
  useEffect(() => {
    const t = setInterval(() => setPermission(Notification.permission), 2000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return meds;
    return meds.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q) ||
        m.times.some((t) => t.includes(q))
    );
  }, [query, meds]);

  function onCreate(newMed) {
    setMeds((prev) => [
      ...prev,
      { ...newMed, id: crypto.randomUUID(), history: [] },
    ]);
    setShowForm(false);
  }
  function onUpdate(updated) {
    setMeds((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditing(null);
    setShowForm(false);
  }
  function onDelete(id) {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  }
  function onMarkTaken(id) {
    const ts = Date.now();
    setMeds((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return { ...m, history: [{ ts }, ...m.history].slice(0, 50) };
      })
    );
  }

  const nextDue = nextDueForAll(meds);

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-500/10 grid place-items-center">
            <span className="text-emerald-600 font-extrabold">💊</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Medi_<span className="text-md italic font-mono">Time</span>
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={async () => setPermission(await ensurePermission())}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                permission === "granted"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
              title="Notification permission"
            >
              {permission === "granted"
                ? "Notifications: ON"
                : "Enable Notifications"}
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              + Add Medicine
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6">
        {/* next due banner */}
        {nextDue && (
          <div className="mb-4 p-4 rounded-2xl bg-white/70 shadow-glass backdrop-blur flex items-center gap-3">
            <div className="text-2xl">⏰</div>
            <div className="text-sm">
              <div className="font-semibold">
                Next: <span className="text-emerald-700">{nextDue.name}</span>{" "}
                at <span className="font-mono">{nextDue.time}</span>
              </div>
              <div className="opacity-70">{nextDue.message}</div>
            </div>
          </div>
        )}

        {/* search */}
        <div className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, notes, or time (e.g., 08:00, night)"
            className="w-full px-4 py-3 rounded-xl border bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        {/* empty state */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-3">🗂️</div>
            <p className="mb-2">No medicines yet.</p>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Add your first medicine
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MedicineCard
                key={m.id}
                med={m}
                onEdit={() => {
                  setEditing(m);
                  setShowForm(true);
                }}
                onDelete={() => onDelete(m.id)}
                onMarkTaken={() => onMarkTaken(m.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* drawer modal */}
      {showForm && (
        <div className="fixed inset-0 z-20 bg-black/40 flex">
          <div className="ml-auto h-full w-full max-w-xl bg-white rounded-l-2xl shadow-xl overflow-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-white">
              <h2 className="text-xl font-semibold">
                {editing ? "Edit Medicine" : "Add Medicine"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <MedicineForm
                initial={editing}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                onSubmit={(data) =>
                  editing ? onUpdate({ ...editing, ...data }) : onCreate(data)
                }
              />
            </div>
          </div>
        </div>
      )}

      <footer className="py-8 text-center text-xs text-gray-500 ">
        Made With ❤️ By{" "}
        <span className="italic underline font-bold">Sheraz Yousaf.</span>
      </footer>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import TimePicker from "./TimePicker.jsx";

const defaultForm = {
  name: "",
  dosage: "",
  notes: "",
  times: ["08:00", "20:00"], // HH:mm 24h
  days: "everyday", // everyday | custom
  daysCustom: [1, 2, 3, 4, 5, 6, 0], // 0=Sun..6=Sat
  sound: true,
  vibrate: true,
};

export default function MedicineForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial ? { ...defaultForm, ...initial } : defaultForm
  );

  useEffect(() => {
    if (initial) setForm({ ...defaultForm, ...initial });
  }, [initial]);

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Please enter medicine name");
    if (!form.times.length) return alert("Add at least one time");
    onSubmit({
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      notes: form.notes.trim(),
      times: [...new Set(form.times)].sort(),
      days: form.days,
      daysCustom:
        form.days === "custom"
          ? [...form.daysCustom].sort()
          : [0, 1, 2, 3, 4, 5, 6],
      sound: form.sound,
      vibrate: form.vibrate,
    });
  }

  function toggleCustomDay(d) {
    setForm((prev) => {
      const set = new Set(prev.daysCustom);
      set.has(d) ? set.delete(d) : set.add(d);
      return { ...prev, daysCustom: [...set].sort() };
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Medicine name
          </label>
          <input
            className="w-full px-3 py-2 rounded-lg border"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g., Metformin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dosage</label>
          <input
            className="w-full px-3 py-2 rounded-lg border"
            value={form.dosage}
            onChange={(e) => update("dosage", e.target.value)}
            placeholder="e.g., 500mg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Times (24h)</label>
        <TimePicker value={form.times} onChange={(t) => update("times", t)} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Repeat on</label>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.days === "everyday"}
              onChange={() => update("days", "everyday")}
            />
            <span>Every day</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.days === "custom"}
              onChange={() => update("days", "custom")}
            />
            <span>Custom days</span>
          </label>
        </div>

        {form.days === "custom" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => toggleCustomDay(idx)}
                className={`px-3 py-1.5 rounded-lg border ${
                  form.daysCustom.includes(idx)
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.sound}
            onChange={(e) => update("sound", e.target.checked)}
          />
          <span>Play sound</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.vibrate}
            onChange={(e) => update("vibrate", e.target.checked)}
          />
          <span>Vibrate (mobile)</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border"
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="e.g., Take after breakfast"
        />
      </div>

      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          type="submit"
        >
          {initial ? "Save changes" : "Add medicine"}
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-gray-100"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

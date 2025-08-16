import React, { useState } from "react";

export default function TimePicker({ value, onChange }) {
  const [time, setTime] = useState("08:00");

  function add() {
    if (!/^\d{2}:\d{2}$/.test(time)) return;
    if (!value.includes(time)) onChange([...value, time].sort());
  }
  function remove(t) {
    onChange(value.filter((x) => x !== t));
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-3 py-2 rounded-lg border"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white"
        >
          Add time
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((t) => (
          <div
            key={t}
            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100"
          >
            <span className="font-mono">{t}</span>
            <button
              type="button"
              onClick={() => remove(t)}
              className="text-rose-600 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

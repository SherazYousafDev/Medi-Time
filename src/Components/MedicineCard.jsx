import React from "react";

export default function MedicineCard({ med, onEdit, onDelete, onMarkTaken }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur shadow-glass p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="text-3xl">💊</div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{med.name}</h3>
            {med.dosage && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {med.dosage}
              </span>
            )}
          </div>
          {med.notes && (
            <p className="text-sm text-gray-600 mt-1">{med.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-2 py-1 rounded-lg bg-blue-600 text-white text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {med.times.map((t) => (
          <span
            key={t}
            className="px-2 py-1 rounded-lg bg-gray-100 text-sm font-mono"
          >
            {t}
          </span>
        ))}
        <span className="ml-auto text-xs text-gray-500">
          {med.days === "everyday" ? "Every day" : "Custom days"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onMarkTaken}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white"
        >
          Mark as taken
        </button>
        <div className="text-xs text-gray-500">
          {med.history?.length
            ? `Last taken: ${new Date(med.history[0].ts).toLocaleString()}`
            : "Not taken yet"}
        </div>
      </div>
    </div>
  );
}

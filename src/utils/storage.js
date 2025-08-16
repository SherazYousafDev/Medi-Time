const KEY = "meds_v1";

export function loadMeds() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMeds(meds) {
  localStorage.setItem(KEY, JSON.stringify(meds));
}

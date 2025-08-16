// simple audio (no libs)
const audio = new Audio(
  // tiny data-uri beep so no assets needed (440Hz ~0.2s)
  "data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAaW1wb3J0YW50AAAAAABkYXRhAAAAAAABAQEBAP8AAP8A/wD/AAAA/wD/AP8A/wAAAA=="
);

export async function ensurePermission() {
  try {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return "denied";
  }
}

export const NotificationManager = {
  notify({ title, body, sound = true, vibrate = true, tag = undefined }) {
    if (!("Notification" in window)) return;

    const show = () => {
      const n = new Notification(title, {
        body,
        tag,
        icon: undefined, // you can add custom icon path if you like
        silent: !sound,
      });
      if (sound) {
        try {
          audio.currentTime = 0;
          audio.play();
        } catch {}
      }
      if (vibrate && "vibrate" in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {}
      }
      n.onclick = () => window.focus();
      return n;
    };

    if (Notification.permission === "granted") {
      return show();
    }
  },
};

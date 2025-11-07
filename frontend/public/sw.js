self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data.json(); } catch {}
  e.waitUntil(
    self.registration.showNotification(d.title || "HighFive", {
      body: d.body || "",
      data: { url: d.url || "/" }
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const win = list.find((w) => w.url.includes("/"));
        return win ? win.focus() : clients.openWindow(url);
      })
  );
});

const API = import.meta.env.VITE_API_URL;

const j = (path, opt = {}) =>
  fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opt
  }).then((r) => r.json());

export const listShoutouts = () => j("/api/shoutouts");
export const createShoutout = (body) =>
  j("/api/shoutouts", { method: "POST", body: JSON.stringify(body) });
export const likeShoutout = (id) =>
  j(`/api/shoutouts/${id}/like`, { method: "POST" });
export const saveSub = (sub) =>
  j("/api/subscribe", { method: "POST", body: JSON.stringify(sub) });

export const getPage = () => j("/api/page");
export const savePage = (content) =>
  j("/api/page", {
    method: "POST",
    body: JSON.stringify({ content })
  });

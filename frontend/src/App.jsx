import React, { useEffect, useState } from "react";
import {
  listShoutouts,
  createShoutout,
  likeShoutout,
  saveSub,
  getPage,
  savePage
} from "./api";

const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const toKey = (b64) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export default function App() {
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [latestId, setLatestId] = useState(null);
  const [pageText, setPageText] = useState("");

  useEffect(() => {
    listShoutouts().then(setList);
    getPage().then((p) => setPageText(p.content || ""));
    setupPush();
  }, []);

  async function setupPush() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toKey(VAPID)
    });
    await saveSub(sub);
  }

  async function add(e) {
    e.preventDefault();
    const made = await createShoutout({ text, sender: name });
    setList((xs) => [made, ...xs]);
    setLatestId(made.id);
    setTimeout(() => setLatestId(null), 800);
    setText("");
  }

  async function like(id) {
    const up = await likeShoutout(id);
    setList((xs) => xs.map((x) => (x.id === id ? up : x)));
  }

  async function saveShared() {
    const p = await savePage(pageText);
    setPageText(p.content);
  }

  return (
    <div className="page">
      <h1>HighFive Tiny 👋</h1>

      <form onSubmit={add} className="row">
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Nice job on..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="big pop">✋ HighFive</button>
</form>

      <ul>
        {list.map((s) => (
          <li
            key={s.id}
            className={s.id === latestId ? "flicker" : ""}
          >
            <b>{s.sender}</b>: {s.text}{" "}
            <button onClick={() => like(s.id)}>❤️ {s.likes}</button>
          </li>
        ))}
      </ul>

      <h2>Shared page (everyone sees this)</h2>
      <textarea
        className="shared"
        value={pageText}
        onChange={(e) => setPageText(e.target.value)}
        placeholder="Type anything here..."
      />
      <br />
      <button onClick={saveShared}>Save shared page</button>
    </div>
  );
}

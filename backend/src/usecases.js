const clean = (s) => (s || "").trim();

const makeList =
  ({ shoutouts }) =>
  async () =>
    shoutouts.list(50);

const makeCreate =
  ({ shoutouts, subs, push, events }) =>
  async ({ text, sender }) => {
    const t = clean(text), s = clean(sender);
    if (t.length < 2 || s.length < 2) throw Error("too short");
    const made = await shoutouts.create({ text: t, sender: s });
    const payload = { title: "New HighFive", body: `${s}: ${t}`, url: "/" };
    (await subs.all()).forEach((sub) => push.send(sub, payload));
    events && events.log("shoutout.created", { id: made.id, sender: made.sender });
    return made;
  };

const makeLike =
  ({ shoutouts, events }) =>
  async ({ id }) => {
    const up = await shoutouts.like({ id });
    events && events.log("shoutout.liked", { id, likes: up.likes });
    return up;
  };

const makeSaveSub =
  ({ subs, events }) =>
  async (sub) => {
    await subs.save(sub);
    events && events.log("sub.saved", { endpoint: sub.endpoint });
    return { ok: true };
  };

const makeGetPage =
  ({ page }) =>
  async () =>
    page.get();

const makeSavePage =
  ({ page, events }) =>
  async ({ content }) => {
    const c = clean(content);
    if (!c) throw Error("empty");
    const saved = await page.save({ content: c });
    events && events.log("page.updated", { at: saved.updated_at });
    return saved;
  };

module.exports = {
  makeList,
  makeCreate,
  makeLike,
  makeSaveSub,
  makeGetPage,
  makeSavePage
};

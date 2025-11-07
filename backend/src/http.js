const express = require("express");
const cors = require("cors");
const env = require("./env");
const {
  makePg,
  Shoutouts,
  Subs,
  Page,
  makeEvents,
  Push
} = require("./adapters");
const {
  makeList,
  makeCreate,
  makeLike,
  makeSaveSub,
  makeGetPage,
  makeSavePage
} = require("./usecases");

(async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const pg = makePg(env);
  const repos = {
    shoutouts: new Shoutouts(pg),
    subs: new Subs(pg),
    page: new Page(pg)
  };
  const push = new Push(env);
  const events = await makeEvents(env);

  const uc = {
    list: makeList({ shoutouts: repos.shoutouts }),
    create: makeCreate({ shoutouts: repos.shoutouts, subs: repos.subs, push, events }),
    like: makeLike({ shoutouts: repos.shoutouts, events }),
    saveSub: makeSaveSub({ subs: repos.subs, events }),
    getPage: makeGetPage({ page: repos.page }),
    savePage: makeSavePage({ page: repos.page, events })
  };

  app.get("/api/health", (_q, r) => r.json({ ok: true }));
  app.get("/api/shoutouts", async (_q, r) => r.json(await uc.list()));
  app.post("/api/shoutouts", async (q, r) =>
    r.status(201).json(await uc.create(q.body))
  );
  app.post("/api/shoutouts/:id/like", async (q, r) =>
    r.json(await uc.like({ id: +q.params.id }))
  );
  app.post("/api/subscribe", async (q, r) =>
    r.json(await uc.saveSub(q.body))
  );
  app.get("/api/page", async (_q, r) => r.json(await uc.getPage()));
  app.post("/api/page", async (q, r) =>
    r.json(await uc.savePage(q.body))
  );

  app.listen(env.PORT, () =>
    console.log("API http://localhost:" + env.PORT)
  );
})();

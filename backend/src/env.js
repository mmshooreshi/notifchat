require("dotenv").config();

["PGHOST","PGUSER","PGPASSWORD","PGDATABASE",
 "MONGO_URL","MONGO_DB",
 "VAPID_PUBLIC_KEY","VAPID_PRIVATE_KEY","VAPID_EMAIL"
].forEach((k) => {
  if (!process.env[k]) throw Error("Missing " + k);
});

module.exports = {
  PGHOST: process.env.PGHOST,
  PGPORT: +(process.env.PGPORT || 5432),
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGDATABASE: process.env.PGDATABASE,
  PGSSL: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  MONGO_URL: process.env.MONGO_URL,
  MONGO_DB: process.env.MONGO_DB,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VAPID_EMAIL: process.env.VAPID_EMAIL,
  PORT: +(process.env.PORT || 3000)
};

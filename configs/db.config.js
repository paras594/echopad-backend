const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/syncpad";

mongoose.connect(mongoURI);

mongoose.connection.on("connected", () =>
  console.log(
    "=> Connected on:",
    mongoURI.includes("localhost") ? "localhost" : "cloud"
  )
);

mongoose.connection.on("error", (err) =>
  console.log("xx = MongoDB error:", err)
);

mongoose.connection.on("disconnected", () =>
  console.log("=> MongoDB disconnected")
);

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("=> App terminated, closing mongo connection");
    process.exit(0);
  });
});

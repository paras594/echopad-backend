const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/syncpad";

mongoose.connect(mongoURI);

mongoose.connection.on("connected", () =>
  console.log("connected on:", mongoURI)
);

mongoose.connection.on("error", (err) => console.log("error:", err));

mongoose.connection.on("disconnected", () => console.log("disconnected"));

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("app terminated, closing mongo connection");
    process.exit(0);
  });
});

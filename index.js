require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const compression = require("compression");
const cron = require("node-cron");
const helmet = require("helmet");
const admin = require("firebase-admin");
const {
  authenticateJWT,
  authenticateToken,
} = require("./middlewares/auth.middleware");
const userFilesService = require("./services/user-files.service");
const Users = require("./models/users.model");
const UserContent = require("./models/user-content.model");
const UserFiles = require("./models/user-files.model");

const app = express();
app.use(helmet());
app.use(cookieParser({}));
app.use(compression());

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined, // Handle potential escaped newlines
};

if (
  !firebaseConfig.projectId ||
  !firebaseConfig.clientEmail ||
  !firebaseConfig.privateKey
) {
  console.error("xx = Missing Firebase service account environment variables!");
  console.error(
    "xx = Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in Railway secrets."
  );
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  });
  console.log("=> Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("xx = Error initializing Firebase Admin SDK:", error);
  process.exit(1);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(", "),
    credentials: true,
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS,
        "Access-Control-Allow-Credentials": true,
      });
    },
  },
});

require("./configs/db.config");

io.on("connection", (socket) => {
  // socket.on("connect", () => console.log("connected")); // { message: "a new client connected" });

  socket.on("register-user", async function (data) {
    socket.handshake.query.email = data.email;
    socket.handshake.query.id = socket.id;
    socket.join(data.email);
    const sockets = await io.in(data.email).fetchSockets(); // returns an array of all sockets
    io.to(data.email).emit("user-joined-room", {
      ...data,
      roomCount: sockets.length,
    });
  });

  // socket.on("user-left-room", async function (data) {
  //   console.log("user-left-room", data);
  //   socket.leave(data.email);
  //   const sockets = await io.in(data.email).fetchSockets(); // returns an array of all sockets
  //   io.to(data.email).emit("user-left-room", {
  //     ...data,
  //     roomCount: sockets.length,
  //   });
  // });

  socket.on("input-change", function (data) {
    io.to(data.email)
      .except(socket.id)
      .emit("input-change", {
        ...data,
        senderid: socket.id,
      });
  });

  socket.on("disconnect", async function () {
    const socketEmail = socket.handshake.query.email;
    socket.leave(socketEmail);
    const sockets = await io.in(socketEmail).fetchSockets();
    io.to(socketEmail).except(socket.id).emit("user-left-room", {
      email: socketEmail,
      roomCount: sockets.length,
    });
  });
});

const every12Hours = "0 */12 * * *";
const every10Secs = "*/10 * * * * *";

cron.schedule(every12Hours, async () => {
  await userFilesService.deleteExpiredUserFiles();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(", "),
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.json({ success: true });
});

app.get("/test-auth", authenticateJWT, (req, res) => {
  // access cookie
  console.log(req.cookies);
  res.json({
    message: "Hello World",
  });
});

app.get("/test-firebase-auth", authenticateToken, (req, res) => {
  // access cookie
  console.log({ user: req.user });

  res.json({
    message: "Hello World",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "working ",
  });
});

app.use("/v1/api/auth", require("./routes/auth.routes"));
app.use(
  "/v1/api/user-content",
  authenticateToken,
  require("./routes/user-content.routes")
);
app.use("/v1/api/user-files", require("./routes/user-files.routes"));

app.put("/v1/api/migrate-user-data", async (req, res) => {
  const { newId, email } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await UserContent.updateMany({ user: user._id }, { userId: newId });
    await UserFiles.updateMany({ user: user._id }, { userId: newId });

    res.json({
      success: true,
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      success: false,
      errors: {
        error: "Failed to migrate user data",
      },
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    error.status = 413;
    error.message = "image too large, max size is 1mb!";
  }

  const status = error.status || 500;
  const message = error.message;
  const response = { status: status, error: message };
  res.status(status).json(response);
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log("=> Server started on port", port);
  console.log("=> Allowed origins", process.env.ALLOWED_ORIGINS);
});

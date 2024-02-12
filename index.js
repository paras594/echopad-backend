require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { authenticateJWT } = require("./middlewares/auth.middleware");

const app = express();
app.use(cookieParser({}));
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
  console.log(`User connected ${socket.id}`);

  socket.on("register-user", async function (data) {
    console.log(data);
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
    console.log(data);
    io.to(data.email)
      .except(socket.id)
      .emit("input-change", {
        ...data,
        sender: socket.id,
      });
  });

  socket.on("disconnect", async function () {
    console.log("user disconnected");
    const socketEmail = socket.handshake.query.email;
    socket.leave(socketEmail);
    const sockets = await io.in(socketEmail).fetchSockets();
    io.to(socketEmail).except(socket.id).emit("user-left-room", {
      email: socketEmail,
      roomCount: sockets.length,
    });
  });
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

app.get("/", authenticateJWT, (req, res) => {
  // access cookie
  console.log(req.cookies);
  res.json({
    message: "Hello World",
  });
});

app.use("/v1/api/auth", require("./routes/auth.routes"));

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log("Server started on port ", port);
  console.log("allowed origins", process.env.ALLOWED_ORIGINS.split(", "));
});

import dotenv from "dotenv";
import express from "express";
import connectDb from "./src/DB/configDB.js";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server as IOServer } from "socket.io";

import authRoutes from "./src/routers/authRoutes.js";
import productRoutes from "./src/routers/productRoutes.js";
import cartRoutes from "./src/routers/cartRoutes.js";
import orderRoutes from "./src/routers/orderRoutes.js";
import shopkeeperRoutes from "./src/routers/shopkeeperRoutes.js";
import paymentRoutes from "./src/routers/paymentRoutes.js";
import notificationRoutes from "./src/routers/notificationRoutes.js";


dotenv.config();

const app = express();


app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://e-mart-dass.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  "/api/payments/razorpay/webhook",
  bodyParser.raw({ type: "application/json" })
);


app.use(express.json());

/* Debug middleware */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

app.use("/uploads", express.static("Public/images/"));


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shopkeepers", shopkeeperRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/", (req, res) => {
  res.send("E-Mart API running...");
});


const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://e-mart-dass.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// Attach io globally
app.set("io", io);

// Socket.io events
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  // join room using shopkeeper/user id
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


connectDb()
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection failed`, error);
  });

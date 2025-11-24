import express from "express";
import { 
  createOrder, 
  getUserOrders, 
  getShopkeeperOrders, 
  getWeeklyStats, 
  updateOrderStatus,
  getOrderDetails
} from "../controllers/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { isUser, isShopkeeper } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// USER ROUTES
router.get("/my", protect, isUser, getUserOrders);
router.post("/", protect, isUser, createOrder);

// SHOPKEEPER ROUTES
router.get("/my-shop-orders", protect, isShopkeeper, getShopkeeperOrders);

router.get("/my-shop-orders-weekly", protect, isShopkeeper, getWeeklyStats);

// ORDER DETAILS (MUST BE BELOW THE ABOVE ROUTES)
router.get("/:id", protect, getOrderDetails);

// UPDATE ORDER STATUS
router.put("/:id", protect, isShopkeeper, updateOrderStatus);

export default router;

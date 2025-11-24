import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// Correct import
import { createNotification } from "../utils/notifications.js";

/* --------------------------------------------------
   Create New Order
-------------------------------------------------- */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { items, totalAmount, address, paymentMethod, shopkeeperId, deliveryLocation } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order items are required" });

    if (!shopkeeperId)
      return res.status(400).json({ message: "Shopkeeper ID is required" });

    const orderItems = [];

    for (const it of items) {
      const product = await Product.findById(it.productId).lean();
      if (!product)
        return res.status(404).json({ message: `Product not found: ${it.productId}` });

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: it.quantity,
        image: product.images?.[0], 
      });
    }

    const order = new Order({
      user: userId,
      shopkeeper: shopkeeperId,
      items: orderItems,
      total: totalAmount,
      address,
      paymentMethod: paymentMethod || "UPI",

      paid: false,
      paymentProvider: null,
      paymentId: null,
      paidAt: null,
      paymentMetadata: {},

      deliveryLocation: deliveryLocation
        ? { type: "Point", coordinates: [deliveryLocation.lng, deliveryLocation.lat] }
        : undefined,

      status: "Pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("❌ createOrder error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* --------------------------------------------------
   Get All Orders for User
-------------------------------------------------- */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate("shopkeeper", "username email location")
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ getUserOrders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* --------------------------------------------------
   Get All Orders for Shopkeeper
-------------------------------------------------- */
export const getShopkeeperOrders = async (req, res) => {
  try {
    const shopkeeperId = req.user._id;

    const orders = await Order.find({ shopkeeper: shopkeeperId })
      .populate("user", "username email location")
      .populate("shopkeeper", "username location")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ getShopkeeperOrders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* --------------------------------------------------
   Weekly Stats
-------------------------------------------------- */
export const getWeeklyStats = async (req, res) => {
  try {
    const shopkeeperId = req.user._id;

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);

    const last7Days = [];
    const tempDate = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      last7Days.push({
        date: tempDate.toISOString().split("T")[0],
        orders: 0,
        revenue: 0,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const orders = await Order.find({
      shopkeeper: shopkeeperId,
      createdAt: { $gte: startDate },
    }).lean();

    orders.forEach((order) => {
      const d = order.createdAt.toISOString().split("T")[0];
      const day = last7Days.find((x) => x.date === d);

      if (day) {
        day.orders += 1;
        day.revenue += order.total;
      }
    });

    res.json(last7Days);
  } catch (error) {
    console.error("Weekly stats error:", error);
    res.status(500).json({ message: "Failed to load weekly stats" });
  }
};

/* --------------------------------------------------
   Update Order Status (No SMS)
-------------------------------------------------- */
export const updateOrderStatus = async (req, res) => {
  try {
    const shopkeeperId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findOne({ _id: id, shopkeeper: shopkeeperId });
    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    order.status = status;
    await order.save();

    /* --------------------------------------------------
       🔔 In-App Notification + Real-time Push
    -------------------------------------------------- */
    try {
      const io = req.app.get("io");

      await createNotification({
        io,
        userId: order.user,
        title: `Order ${status}`,
        message: `Your order #${String(order._id).slice(-6)} was updated to: ${status}`,
        meta: { orderId: order._id, status },
        type: "ORDER_UPDATE",
      });
    } catch (err) {
      console.error("Order status notification error:", err);
    }

    /* --------------------------------------------------
       ❌ SMS Disabled (no Twilio)
    -------------------------------------------------- */
    console.log("📢 SMS disabled — No SMS sent.");

    res.json({ success: true, message: "Order updated", order });

  } catch (error) {
    console.error("❌ updateOrderStatus error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};


export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email location")
      .populate("shopkeeper", "username email location")
      .populate("items.product", "name images price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("getOrderDetails error:", error);
    res.status(500).json({ message: error.message });
  }
};

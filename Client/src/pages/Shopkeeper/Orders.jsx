"use client";

import { useEffect, useState, useCallback } from "react";
import { API } from "../../lib/apiConfig";

/* -----------------------------------------------------
   INLINE ORDER CARD COMPONENT
----------------------------------------------------- */

function OrderCard({ order, onStatusUpdate, onViewDetails }) {
  const handleChange = async (e) => {
    const newStatus = e.target.value;

    // update UI instantly
    onStatusUpdate(order._id, newStatus);

    try {
      await API.put(`/orders/${order._id}`, { status: newStatus });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-100 shadow-lg hover:shadow-xl transition-all">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Order #{order._id.slice(-6)}
        </h3>

        <select
          className="px-3 py-1 rounded-lg border text-sm bg-yellow-50 border-yellow-200 cursor-pointer"
          value={order.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* CUSTOMER INFO */}
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Customer:</span>{" "}
        {order.user?.username || "Unknown"}
      </p>

      <p className="text-sm text-gray-600">
        <span className="font-semibold">Phone:</span>{" "}
        {order.address?.phone || "N/A"}
      </p>

      <p className="text-sm text-gray-600 mb-4">
        <span className="font-semibold">Address:</span> {order.address?.address}
      </p>

      {/* ITEMS LIST */}
      <div className="space-y-4 mt-4">
        {order.items?.map((item, i) => (
          <div key={i} className="flex gap-4 items-center border-b pb-3">
            <img
              src={item.image || "/placeholder.png"}
              className="w-16 h-16 rounded-xl object-cover"
              alt={item.name}
            />

            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>

            <p className="font-semibold text-amber-700">₹{item.price}</p>
          </div>
        ))}
      </div>

      {/* TOTAL + PAYMENT */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-lg font-bold text-amber-600">Total: ₹{order.total}</p>
        <p className="text-sm text-gray-600">{order.paymentMethod || "N/A"}</p>
      </div>

      {/* VIEW ORDER DETAILS BUTTON */}
      <div className="mt-6">
        <button
          onClick={() => onViewDetails(order)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          View Order Details
        </button>
      </div>
    </div>
  );
}


/* -----------------------------------------------------
   MAIN SHOPKEEPER ORDERS PAGE
----------------------------------------------------- */

export default function ShopkeeperOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("/orders/my-shop-orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update status inside state
  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: newStatus } : o
      )
    );
  };

  // Redirect to details page
  const handleViewDetails = (order) => {
    window.location.href = `/shopkeeper/order-details/${order._id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* PAGE HEADER */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Shop Orders
          </h1>
          <p className="text-gray-600 text-lg">Manage and track all your customer orders</p>

          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="px-6 py-3 bg-white rounded-xl shadow-md border-2 border-yellow-100">
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-amber-600">{orders.length}</p>
            </div>

            <div className="px-6 py-3 bg-white rounded-xl shadow-md border-2 border-green-100">
              <p className="text-sm text-gray-500 font-medium">Delivered</p>
              <p className="text-3xl font-bold text-green-600">
                {orders.filter((o) => o.status === "Delivered").length}
              </p>
            </div>

            <div className="px-6 py-3 bg-white rounded-xl shadow-md border-2 border-blue-100">
              <p className="text-sm text-gray-500 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {orders.filter((o) =>
                  o.status !== "Delivered" && o.status !== "Cancelled"
                ).length}
              </p>
            </div>
          </div>
        </div>

        {/* ORDERS GRID */}
        <div className="grid gap-10 md:grid-cols-1 lg:grid-cols-1">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* EMPTY STATE */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600">Orders from customers will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

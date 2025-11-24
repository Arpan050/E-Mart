// src/pages/Shopkeeper/ShopkeeperOrderDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { API } from "../../lib/apiConfig";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ShopkeeperOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Update order status
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await API.put(`/orders/${id}`, { status: newStatus });
      setOrder((prev) => ({ ...prev, status: newStatus }));
      alert("Order Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  // -------- MAP ----------
  useEffect(() => {
    if (!order) return;

    const userLoc = order.user?.location?.coordinates;
    const shopLoc = order.shopkeeper?.location?.coordinates;

    if (!userLoc || !shopLoc) return;

    const user = [userLoc[1], userLoc[0]];
    const shop = [shopLoc[1], shopLoc[0]];

    const existing = document.getElementById("orderMap")?._leaflet_id;
    if (existing) return;

    const map = L.map("orderMap").setView(shop, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    L.marker(shop).addTo(map).bindPopup("Shop Location");
    L.marker(user).addTo(map).bindPopup("Customer Location");

    L.Routing.control({
      waypoints: [L.latLng(...shop), L.latLng(...user)],
      routeWhileDragging: false,
    }).addTo(map);

    return () => map.remove();
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading Order Details…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-5 py-2 rounded-xl bg-white border shadow"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto bg-white border rounded-2xl p-8 shadow-xl">
        <h1 className="text-4xl font-bold mb-4">
          Order #{order._id.slice(-6)}
        </h1>

        {/* STATUS DROPDOWN */}
        <select
          value={order.status}
          disabled={updating}
          onChange={(e) => updateStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-yellow-50"
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* CUSTOMER INFO */}
        <div className="mt-6 space-y-1">
          <p><b>Customer:</b> {order.user?.username}</p>
          <p><b>Email:</b> {order.user?.email}</p>
          <p><b>Phone:</b> {order.address?.phone}</p>
          <p><b>Address:</b> {order.address?.address}</p>
        </div>

        <hr className="my-6" />

        {/* ITEMS */}
        <h2 className="text-2xl font-bold mb-4">Order Items</h2>
        {order.items.map((item, index) => (
          <div key={index} className="flex gap-4 items-center border-b pb-4">
            <img
              src={item.image || "/placeholder.png"}
              className="w-20 h-20 rounded-xl object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>

            <p className="font-bold text-amber-700">₹{item.price}</p>
          </div>
        ))}

        <hr className="my-6" />

        {/* TOTAL */}
        <div className="flex justify-between text-xl font-bold text-amber-700">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>

        {/* MAP */}
        <h2 className="text-2xl font-bold mt-8 mb-3">Delivery Route</h2>
        <div
          id="orderMap"
          className="w-full rounded-xl border"
          style={{ height: "380px" }}
        ></div>
      </div>
    </div>
  );
}

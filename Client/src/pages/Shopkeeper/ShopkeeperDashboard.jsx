// src/pages/Shopkeeper/ShopkeeperDashboard.jsx

import { useEffect, useState } from "react";
import { API } from "../../lib/apiConfig";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

export default function ShopkeeperDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsRes, ordersRes, weeklyRes] = await Promise.all([
          API.get("/products/my"),
          API.get("/orders/my-shop-orders"),
          API.get("/orders/my-shop-orders-weekly"),
        ]);

        const products = productsRes.data.products || [];
        const orders = ordersRes.data.orders || [];
        const weeklyData = Array.isArray(weeklyRes.data) ? weeklyRes.data : [];

        setWeekly(weeklyData);

        // ---- BASIC STATS ----
        const today = new Date().toDateString();
        let todayRevenue = 0;

        orders.forEach((order) => {
          if (order.status === "Delivered") {
            const deliveredDate = new Date(order.updatedAt).toDateString();
            if (deliveredDate === today) todayRevenue += order.total;
          }
        });

        setStats({
          totalProducts: productsRes.data.total ?? products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "Pending").length,
          deliveredOrders: orders.filter((o) => o.status === "Delivered").length,
          todayRevenue,
        });

        // ---- TOP PRODUCTS ----
        const productSales = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            if (!productSales[item.name]) {
              productSales[item.name] = 0;
            }
            productSales[item.name] += item.quantity;
          });
        });

        const top = Object.entries(productSales)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        setTopProducts(top);

        // ---- RECENT ORDERS ----
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // ---- WEEKLY CHART DATA (using revenue like the premium UI) ----
  const chartData = {
    labels: weekly.map((d) => d.date.slice(5)), // MM-DD
    datasets: [
      {
        label: "Sales (₹)",
        data: weekly.map((d) => d.revenue),
        borderColor: "rgb(251, 191, 36)",
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "rgb(251, 191, 36)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        titleColor: "#fbbf24",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(251, 191, 36, 0.1)",
        },
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="📦"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="🛒"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="⏳"
            color="from-yellow-500 to-amber-500"
          />
          <StatCard
            title="Delivered Orders"
            value={stats.deliveredOrders}
            icon="✓"
            color="from-green-500 to-emerald-600"
          />
        </div>

        {/* Chart and Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Weekly Sales Chart */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">📈</span>
              Weekly Sales Performance
            </h3>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2 opacity-90">Today&apos;s Revenue</h3>
              <p className="text-5xl font-black mb-4">
                ₹{stats.todayRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-white/20 rounded-full font-medium">+0%</span>
                <span className="opacity-90">vs yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Top Selling Products */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              Top Selling Products
            </h2>

            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sales yet.</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-yellow-50 hover:to-amber-50 transition-all duration-200 border border-gray-100 hover:border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-bold text-sm">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {item.name}
                      </span>
                    </div>
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg text-sm shadow-md">
                      {item.qty} sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              Recent Orders
            </h2>

            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent orders.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div
                    key={o._id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-yellow-50 hover:to-amber-50 transition-all duration-200 border border-gray-100 hover:border-yellow-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">
                        {o.user?.username || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        #{o._id.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          o.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : o.status === "Out for Delivery"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {o.status}
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{o.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ActionCard
            title="Add Product"
            description="List a new product in your store"
            link="/shopkeeper/add-product"
            icon="➕"
            gradient="from-blue-500 to-blue-600"
          />
          <ActionCard
            title="Manage Products"
            description="View and edit your product catalog"
            link="/shopkeeper/productlist"
            icon="📦"
            gradient="from-purple-500 to-purple-600"
          />
          <ActionCard
            title="View Orders"
            description="Track and manage customer orders"
            link="/shopkeeper/orders"
            icon="📋"
            gradient="from-amber-500 to-orange-500"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
}

// Action Card Component
function ActionCard({ title, description, link, icon, gradient }) {
  return (
    <Link
      to={link}
      className={`block bg-gradient-to-br ${gradient} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-white group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </Link>
  );
}

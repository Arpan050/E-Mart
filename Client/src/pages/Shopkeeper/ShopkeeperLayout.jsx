import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../Context/AppContext";

export default function ShopkeeperLayout() {
  const { setIsShopkeeper, setUser, user } = useAppContext();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(true);
  const sidebarRef = useRef(null);

  // ✅ Collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setIsShopkeeper(false);
    navigate("/login");
  };

  // -----------------------
  // Sidebar Link Component
  // -----------------------
  const SidebarLink = ({ to, icon, label }) => {
    return (
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `
            flex items-center gap-4 rounded-xl transition-all duration-300
            ${collapsed ? "justify-center px-3 py-3" : "px-4 py-3.5"}
            ${
              isActive
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-200"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 hover:text-yellow-700"
            }
          `
        }
      >
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
            ${
              icon.startsWith("http")
                ? ""
                : ""
            }
            ${
              collapsed
                ? "bg-white shadow-md"
                : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-yellow-100 group-hover:to-amber-100"
            }
          `}
        >
          {icon.startsWith("http") ? (
            <img src={icon} alt={label} className="w-6 h-6" />
          ) : (
            <span className="text-xl">{icon}</span>
          )}
        </div>

        {/* Hide label when collapsed */}
        {!collapsed && (
          <span className="font-semibold text-sm">{label}</span>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={`
          relative bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-2xl flex flex-col z-10
          transition-all duration-300
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Profile Header */}
        <Link
          to="/shopkeeper"
          className={`
            relative border-b border-gray-200 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 
            text-white flex items-center gap-4 cursor-pointer hover:brightness-110 transition-all duration-300
            overflow-hidden
            ${collapsed ? "p-4 justify-center" : "p-6"}
          `}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl border-3 border-white shadow-xl overflow-hidden ring-4 ring-white/30">
              <img
                src="https://www.shutterstock.com/image-vector/user-icon-trendy-flat-style-600nw-418179856.jpg"
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Username (hidden when collapsed) */}
          {!collapsed && (
            <div className="relative">
              <p className="text-lg font-bold">
                {user?.username || "Shopkeeper"}
              </p>
              {/* Dashboard → removed permanently */}
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
              Management
            </p>
          )}

          <SidebarLink to="/shopkeeper" icon="📊" label="Dashboard" />
          <SidebarLink to="/shopkeeper/add-product" icon="➕" label="Add Product" />
          <SidebarLink to="/shopkeeper/productlist" icon="📦" label="Product List" />
          <SidebarLink to="/shopkeeper/orders" icon="📋" label="Orders" />

          {!collapsed && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
                Account
              </p>
            </div>
          )}

          <SidebarLink to="/shopkeeper/settings" icon="⚙️" label="Settings" />
        </nav>

        {/* Logout */}
        <div className={`${collapsed ? "p-3" : "p-6"} border-t border-gray-200`}>
          <button
            onClick={logout}
            className={`
              bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg 
              hover:shadow-xl transition-all duration-300 w-full
              ${collapsed ? "py-3 text-xl" : "py-3.5 font-bold flex items-center justify-center gap-2"}
            `}
          >
            🚪 {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

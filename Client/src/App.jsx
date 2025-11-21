import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// 🧭 User Pages
import Home from "./pages/Home";
import CategoryPage from "./pages/Categorypage";
import OffersPage from "./pages/OffersPage";
import Products from "./pages/Products";
import ShopsPage from "./pages/Shopspage";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import AddDeliveryAddress from "./pages/AddDeliveryAddress";
import SelectAddress from "./pages/SelectAddress";
import Payment from "./pages/Payment";

// 🏪 Shopkeeper Pages
import ShopkeeperLayout from "./pages/Shopkeeper/ShopkeeperLayout";
import ProductList from "./pages/Shopkeeper/ProductList";
import Orders from "./pages/Shopkeeper/Orders";
import AddProduct from "./pages/Shopkeeper/AddProduct";
import ShopkeeperDashboard from "./pages/Shopkeeper/ShopkeeperDashboard";
import ShopkeeperSettings from "./pages/Shopkeeper/ShopkeeperSettings";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppContext } from "./Context/AppContext";

const App = () => {
  const location = useLocation();
  const isShopkeeperPath = location.pathname.includes("shopkeeper");
  
  return (
    
    <div className="text-default min-h-screen text-gray-700 bg-white">
      {/* 🧱 Hide Navbar for shopkeeper routes */}
      {!isShopkeeperPath && <Navbar />}
      



      <div className={`${isShopkeeperPath ? "" : "px-6 mid:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
        
          <Route path="/login" element={<Login />} />

          {/* USER ROUTES (Protected) */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/:categoryName"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Categorypage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <OffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shopId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ShopsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-delivery-address"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <AddDeliveryAddress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-address"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <SelectAddress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* 🏪 SHOPKEEPER ROUTES (Protected) */}
          
          <Route
            path="/shopkeeper"
            element={
              <ProtectedRoute allowedRoles={["shopkeeper"]}>
                <ShopkeeperLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ShopkeeperDashboard />} />
            <Route path="settings" element={<ShopkeeperSettings />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="productlist" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </div>

      {/* 🧱 Hide Footer for shopkeeper routes */}
      {!isShopkeeperPath && <Footer />}
    </div>
  );
};

export default App;

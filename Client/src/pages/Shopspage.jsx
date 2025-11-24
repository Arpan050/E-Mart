import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import ProductCard from "../components/ProductCard";

const ShopsPage = () => {
  const { shopId } = useParams();
  const { fetchNearbyShopkeepers, shopkeepers } = useAppContext();
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Load Nearby Shops or Specific Shop
  useEffect(() => {
    const loadShops = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔹 Get location from localStorage (if available)
        const savedLoc = localStorage.getItem("userLocation");
        let lat = null;
        let lng = null;

        if (savedLoc) {
          const parsed = JSON.parse(savedLoc);
          lat = parsed.lat;
          lng = parsed.lng;
        }

        // 🔹 If location not saved, use geolocation
        if (!lat || !lng) {
          if (navigator.geolocation) {
            await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  lat = pos.coords.latitude;
                  lng = pos.coords.longitude;
                  resolve();
                },
                (err) => {
                  console.warn("Geolocation failed:", err.message);
                  reject(err);
                },
                { enableHighAccuracy: true }
              );
            });
          } else {
            throw new Error("Geolocation not supported by your browser");
          }
        }

        // 🔹 Fetch nearby shopkeepers
        const shops = await fetchNearbyShopkeepers(lat, lng, 2);
        setNearbyShops(shops);
      } catch (err) {
        setError(err.message || "Failed to load nearby shops");
      } finally {
        setLoading(false);
      }
    };

    if (!shopId) loadShops();
  }, [shopId]);

  // ✅ If viewing a specific shop page
  if (shopId) {
    const selectedShop = shopkeepers?.find(
      (s) => String(s._id) === String(shopId)
    );
    const shopProducts = selectedShop?.products || [];

    return (
      <div className="container mx-auto mt-6 px-4 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {selectedShop?.username || "Shop"}’s Products
        </h2>

        {shopProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {shopProducts.map((product) => (
              <ProductCard key={product._id || product.name} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No products found for this shop.</p>
        )}
      </div>
    );
  }

  // ✅ Nearby Shops Mode
  return (
    <div className="container mx-auto mt-8 px-4 md:px-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shops Near You</h2>

      {loading && (
        <p className="text-gray-600 animate-pulse">
          Searching for nearby shops... (please allow location access)
        </p>
      )}

      {error && (
        <p className="text-red-500 mt-4">
          ⚠️ {error} — try refreshing or selecting location again.
        </p>
      )}

      {!loading && !error && nearbyShops.length === 0 && (
        <p className="text-gray-600 mt-4">
          No shops found near your selected location.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {nearbyShops.map((shop) => (
          <div
            key={shop._id}
            className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {shop.username || shop.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {shop.distanceKm ? `${shop.distanceKm.toFixed(2)} km away` : ""}
            </p>
            <p className="text-sm text-gray-500">{shop.email}</p>

            <button
              onClick={() => navigate(`/shop/${shop._id}`)}
              className="mt-3 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              View Products
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopsPage;

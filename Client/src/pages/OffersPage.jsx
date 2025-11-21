// src/pages/Offerspage.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const OffersPage = () => {
  const [offerProducts, setOfferProducts] = useState([]);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/offers`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setOfferProducts(data);
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 mt-10">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black border-b-2 border-white inline-block mb-6">
        Today's Offers
      </h2>

      {offerProducts.length === 0 ? (
        <p className="text-gray-600">No offers available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {offerProducts.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;

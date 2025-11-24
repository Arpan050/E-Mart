import React, { useState } from "react";
import { uploadarea } from "../../assets/assets";
import { useAppContext } from "../../Context/AppContext";
import { API } from "../../lib/apiConfig";

export default function AddProduct() {
  const { categories, setShopkeeperProducts } = useAppContext();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (file, index) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed!");
      return;
    }
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated[index] = null;
    setImages(updated);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!images.length || images.every((i) => !i)) {
      return alert("Please upload at least 1 image.");
    }

    if (!category) {
      return alert("Please select a category.");
    }

    if (Number(offerPrice) >= Number(price)) {
      return alert("Offer price must be less than actual price.");
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);

    images.forEach((file) => file && formData.append("images", file));

    try {
      setLoading(true);

      const res = await API.post("/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Product added successfully!");

      setShopkeeperProducts((prev) => [res.data.product, ...prev]);

      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setOfferPrice("");
      setImages([]);
    } catch (err) {
      console.error("❌ Add Product Error:", err);
      alert(err.response?.data?.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative py-8 px-4 sm:px-6 lg:px-12">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-6 left-8 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-28 right-8 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-18 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-amber-500 to-orange-500">
            Add New Product
          </h1>
          <p className="text-sm text-gray-600 mt-1">List your product with attractive images and pricing</p>
        </header>

        <form onSubmit={onSubmitHandler} className="bg-white rounded-2xl shadow-xl border border-yellow-100 overflow-hidden">
          {/* Image upload area */}
          <div className="p-6 border-b border-yellow-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold shadow">
                1
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Product Images</h2>
                <p className="text-sm text-gray-500">Upload up to 5 images. High-quality pictures attract more buyers.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-100">
              <div className="grid grid-cols-5 gap-3">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="relative group">
                      <input
                        id={`img-${i}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files?.[0], i)}
                      />
                      <label
                        htmlFor={`img-${i}`}
                        className="cursor-pointer block w-full h-28 rounded-xl border-2 border-dashed border-yellow-200 bg-white items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition"
                        title="Click to upload"
                      >
                        {images[i] ? (
                          <img
                            src={URL.createObjectURL(images[i])}
                            alt={`preview-${i}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-yellow-600 px-2">
                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs font-medium">Add Image</span>
                          </div>
                        )}
                      </label>

                      {/* remove button */}
                      {images[i] && (
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow hover:scale-105 transition"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">Tip: Use landscape images, clear background, and show the product from multiple angles.</p>
            </div>
          </div>

          {/* Product Basic Info */}
          <div className="p-6 border-b border-yellow-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold shadow">
                2
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                <p className="text-sm text-gray-500">Name, description and select category</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-100 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-100 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-200 outline-none transition resize-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-100 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-200 outline-none transition bg-white"
                >
                  <option value="">Select a category</option>
                  {categories?.map((cat, idx) => (
                    <option key={idx} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold shadow">
                3
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Pricing</h2>
                <p className="text-sm text-gray-500">Set actual & offer price</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-100 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    required
                    min="0"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-100 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {price && offerPrice && Number(price) > Number(offerPrice) && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-green-700 font-semibold">
                  Customers save ₹{Number(price) - Number(offerPrice)} ({Math.round(((Number(price) - Number(offerPrice)) / Number(price)) * 100)}% off)
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-lg ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 hover:shadow-2xl transform hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Adding Product..." : "Add Product to Store"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Local styles for blobs */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

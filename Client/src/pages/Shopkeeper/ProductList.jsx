// src/pages/Shopkeeper/ProductList.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAppContext } from "../../Context/AppContext";
import { API } from "../../lib/apiConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const IMG_BASE = API_BASE.replace(/\/api\/?$/, "");

/* ---------------- Toast Component ---------------- */
function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-3 items-center">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-lg shadow-xl text-white text-sm cursor-pointer min-w-[240px] text-center animate-in slide-in-from-bottom-5 ${
            t.type === "error" ? "bg-red-600" : t.type === "success" ? "bg-green-600" : "bg-gray-800"
          }`}
          onClick={() => remove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Main Component ---------------- */
export default function ProductList() {
  const { shopkeeperProducts, setShopkeeperProducts } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [deletedProduct, setDeletedProduct] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  const [detailsProduct, setDetailsProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const undoTimeout = useRef(null);
  const searchTimeout = useRef(null);

  /* -------- Toast System -------- */
  const [toasts, setToasts] = useState([]);
  const pushToast = (msg, type = "info", ms = 3000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, message: msg, type }]);
    setTimeout(() => removeToast(id), ms);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  /* -------- Fetch products (pagination + search) -------- */
  const fetchProducts = useCallback(
    async (p = 1, s = "") => {
      try {
        setLoading(true);
        const res = await API.get("/products/my", { params: { page: p, limit, search: s } });
        const json = res.data;

        setShopkeeperProducts(json.products || []);
        setTotal(json.total || json.products?.length || 0);
        setPage(json.page || p);
      } catch (err) {
        console.error(err);
        pushToast("Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    },
    [limit, setShopkeeperProducts]
  );

  useEffect(() => {
    fetchProducts(1, "");
  }, []);

  /* -------- Debounced Search -------- */
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchProducts(1, search), 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  /* -------- Delete with Undo -------- */
  const handleDelete = (id) => {
    const product = shopkeeperProducts.find((p) => p._id === id);
    if (!product) return;

    setShopkeeperProducts((prev) => prev.filter((p) => p._id !== id));
    setDeletedProduct(product);
    setShowUndo(true);

    undoTimeout.current = setTimeout(async () => {
      try {
        await API.delete(`/products/${id}`);
        setTotal((t) => Math.max(0, t - 1));
        pushToast("Product deleted", "success");
      } catch (err) {
        pushToast("Delete failed", "error");
        setShopkeeperProducts((prev) => [product, ...prev]);
      } finally {
        setShowUndo(false);
        setDeletedProduct(null);
      }
    }, 5000);
  };

  const handleUndo = () => {
    clearTimeout(undoTimeout.current);
    if (deletedProduct) {
      setShopkeeperProducts((prev) => [deletedProduct, ...prev]);
      setTotal((t) => t + 1);
      pushToast("Delete undone", "success");
    }
    setShowUndo(false);
    setDeletedProduct(null);
  };

  /* -------- Toggle Stock -------- */
  const handleToggleStock = async (product) => {
    try {
      setShopkeeperProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: !p.inStock } : p))
      );

      const res = await API.patch(`/products/${product._id}/stock`, {
        inStock: !product.inStock,
      });

      if (!res.data.success) throw new Error(res.data.message || "Failed");
      pushToast("Stock updated", "success");
    } catch (err) {
      setShopkeeperProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: product.inStock } : p))
      );
      pushToast("Failed to update stock", "error");
    }
  };

  /* -------- UI -------- */
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading...
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-10">
      <ToastContainer toasts={toasts} remove={removeToast} />

      <div className="max-w-5xl mx-auto px-4">

        {/* Search Bar */}
        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white/80 backdrop-blur shadow-lg focus:ring-2 focus:ring-yellow-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
            >
              <path strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 10-14 0 7 7 0 0014 0z" />
            </svg>
          </div>
        </div>

        {/* Product Cards */}
        <div className="space-y-6">
          {shopkeeperProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onView={() => setDetailsProduct(product)}
              onEdit={() => setEditProduct(product)}
              onDelete={() => handleDelete(product._id)}
              onToggleStock={() => handleToggleStock(product)}
            />
          ))}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="mt-8 flex justify-between items-center bg-white/70 backdrop-blur border rounded-xl p-4 shadow">
            <span className="text-gray-600">
              Page {page} of {Math.ceil(total / limit)}
            </span>

            <div className="flex gap-3">
              <button
                disabled={page === 1}
                onClick={() => fetchProducts(Math.max(1, page - 1), search)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:border-yellow-400"
              >
                Prev
              </button>

              <button
                disabled={page * limit >= total}
                onClick={() => fetchProducts(page + 1, search)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:border-yellow-400"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Undo Snackbar */}
      {showUndo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-xl z-[999999]">
          <div className="flex items-center gap-4">
            <span>Product deleted</span>
            <button
              onClick={handleUndo}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {detailsProduct && (
        <ProductDetailsModal product={detailsProduct} onClose={() => setDetailsProduct(null)} />
      )}

      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={(updated) => {
            setShopkeeperProducts((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            );
            setEditProduct(null);
            pushToast("Product updated", "success");
          }}
          pushToast={pushToast}
        />
      )}

    </main>
  );
}
/* ---------------- ProductCard (PART 2) ---------------- */
function ProductCard({ product, onView, onEdit, onDelete, onToggleStock }) {
  // IMG_BASE is defined in PART 1
  return (
    <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-transform group transform-gpu hover:-translate-y-1 border-2 border-yellow-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="flex-shrink-0 w-full lg:w-40 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <img
              src={`${IMG_BASE}${product.images?.[0] || "/uploads/placeholder.png"}`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                <span className="text-white text-sm font-bold">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
              </div>

              <div className="flex-shrink-0 flex items-start gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-300">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-2xl font-bold text-green-600">₹{product.offerPrice}</div>
                  <div className="text-sm text-gray-500 line-through">₹{product.price}</div>
                </div>
                <div className="px-2 py-1 bg-green-100 rounded text-green-700 text-xs font-semibold">
                  {product.price > 0
                    ? `${Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF`
                    : "—"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleStock}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                    product.inStock ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {product.inStock ? "✓ In Stock" : "✕ Out of Stock"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={onView}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
              >
                View Details
              </button>

              <button
                onClick={onEdit}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium text-sm shadow"
              >
                Edit Product
              </button>

              <button
                onClick={onDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium text-sm shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Product Details Modal (PART 3) ---------------- */
function ProductDetailsModal({ product, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          
          {/* Images */}
          <div>
            <img
              src={`${IMG_BASE}${product.images[0]}`}
              alt={product.name}
              className="w-full h-72 object-cover rounded-xl border-2 border-yellow-200"
            />

            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={`${IMG_BASE}${img}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-yellow-100 hover:border-yellow-400 transition-all cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <p className="text-gray-700">{product.description}</p>

            <div>
              <h4 className="uppercase text-sm font-bold text-gray-500 mb-1">Pricing</h4>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-600">₹{product.offerPrice}</span>
                <span className="text-lg text-gray-500 line-through">₹{product.price}</span>
              </div>
              <p className="text-sm text-green-600 font-semibold mt-2">
                Save ₹{product.price - product.offerPrice} (
                {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF)
              </p>
            </div>

            <div>
              <h4 className="uppercase text-sm font-bold text-gray-500 mb-1">Category</h4>
              <span className="px-4 py-2 rounded-lg font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                {product.category}
              </span>
            </div>

            <div>
              <h4 className="uppercase text-sm font-bold text-gray-500 mb-1">Stock Status</h4>
              <span
                className={`px-4 py-2 rounded-lg font-semibold ${
                  product.inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div>
              <h4 className="uppercase text-sm font-bold text-gray-500 mb-1">Created</h4>
              <p className="text-gray-700">
                {new Date(product.createdAt).toLocaleString()}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------- Edit Product Modal (PART 3) ---------------- */
function EditProductModal({ product, onClose, onSaved, pushToast }) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(product.price.toString());
  const [offerPrice, setOfferPrice] = useState(product.offerPrice.toString());
  const [inStock, setInStock] = useState(product.inStock);

  const [existingImages, setExistingImages] = useState([...product.images]);
  const [newImages, setNewImages] = useState([]);

  const [loading, setLoading] = useState(false);

  /* -------- DELETE EXISTING IMAGE -------- */
  const handleDeleteImage = (index) => {
    setExistingImages((imgs) => imgs.filter((_, i) => i !== index));
  };

  /* -------- REPLACE EXISTING IMAGE -------- */
  const handleReplaceImage = (index, file) => {
    if (!file) return;
    const previewURL = URL.createObjectURL(file);

    setExistingImages((imgs) =>
      imgs.map((img, i) => (i === index ? previewURL : img))
    );

    setNewImages((prev) => [...prev, { type: "replace", index, file }]);
  };

  /* -------- ADD NEW IMAGE -------- */
  const handleAddNewImage = (file) => {
    if (!file) return;
    const previewURL = URL.createObjectURL(file);

    setExistingImages((imgs) => [...imgs, previewURL]);
    setNewImages((prev) => [...prev, { type: "add", index: -1, file }]);
  };

  /* -------- SAVE PRODUCT -------- */
  const handleSave = async () => {
    try {
      if (Number(offerPrice) > Number(price)) {
        return pushToast("Offer price must be less than price", "error");
      }

      const form = new FormData();
      form.append("name", name);
      form.append("description", description);
      form.append("category", category);
      form.append("price", Number(price));
      form.append("offerPrice", Number(offerPrice));
      form.append("inStock", inStock);

      // keep only server-side images (not blob:)
      const realImages = existingImages.filter(img => !img.startsWith("blob"));
      form.append("existingImages", JSON.stringify(realImages));

      const actions = [];
      newImages.forEach((imgObj) => {
        form.append("images", imgObj.file);
        actions.push({ type: imgObj.type, index: imgObj.index });
      });
      form.append("imageActions", JSON.stringify(actions));

      setLoading(true);

      const res = await API.put(`/products/${product._id}`, form);
      pushToast("Product updated successfully!", "success");
      onSaved(res.data.product);

    } catch (err) {
      pushToast("Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-start justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl mt-10 animate-in zoom-in-95">

        {/* Header */}
        <div className="p-6 border-b-2 border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50 flex justify-between">
          <h3 className="text-2xl font-bold text-gray-800">Edit Product</h3>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Inputs */}
          <div>
            <label className="font-semibold">Product Name</label>
            <input
              className="w-full mt-1 p-3 border-2 border-gray-200 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Description</label>
            <textarea
              rows={4}
              className="w-full mt-1 p-3 border-2 border-gray-200 rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold">Category</label>
              <input
                className="w-full mt-1 p-3 border-2 border-gray-200 rounded-lg"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Price</label>
              <input
                type="number"
                className="w-full mt-1 p-3 border-2 border-gray-200 rounded-lg"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Offer Price</label>
              <input
                type="number"
                className="w-full mt-1 p-3 border-2 border-gray-200 rounded-lg"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            <span className="font-medium">In Stock</span>
          </label>

          {/* Images Section */}
          <div>
            <p className="font-semibold mb-2">Product Images</p>
            <div className="flex gap-4 flex-wrap">

              {existingImages.map((img, i) => (
                <div key={i} className="w-28 h-28 relative border rounded-lg overflow-hidden">
                  <img
                    src={img.startsWith("blob") ? img : IMG_BASE + img}
                    className="w-full h-full object-cover"
                  />

                  <label className="absolute bottom-0 left-0 w-full bg-black/40 text-white text-center text-xs py-1 cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleReplaceImage(i, e.target.files?.[0])}
                    />
                  </label>

                  <button
                    onClick={() => handleDeleteImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add new image */}
              <label className="w-28 h-28 border rounded-lg flex items-center justify-center bg-gray-100 text-2xl cursor-pointer">
                +
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleAddNewImage(e.target.files?.[0])}
                />
              </label>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold ${
              loading
                ? "bg-gray-400"
                : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}

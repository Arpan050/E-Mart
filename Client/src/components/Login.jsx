// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../lib/apiConfig";
import { useAppContext } from "../Context/AppContext";
import Toast from "./Toast";
import SelectLocationMap from "../components/SelectLocationMap";

/**
 * Premium Login / Signup page (React Router)
 * - UI copied from your Next.js design (gradients, blobs, rounded card)
 * - Keeps your existing API logic (login/signup)
 * - Includes SelectLocationMap for signup location capture
 *
 * Usage: replace your current Login component with this file (or import it into your router)
 */

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);

  // core auth fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  // ui + state
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // signup extras
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const navigate = useNavigate();
  const { setUser, setIsShopkeeper } = useAppContext();


const [toast, setToast] = useState(null);

const showToast = (msg, type="success") => {
  setToast({ msg, type });
};


  // --------- SIGNUP ----------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("⚠ Passwords do not match");
      return;
    }

    if (!latitude || !longitude) {
      alert("Please select your location on the map.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/signup", {
        username,
        email,
        password,
        role,
        location: { latitude, longitude },
        addresses: [
          {
            name: name || username,
            phone,
            address: signupAddress,
            city,
            state: stateVal,
            zip,
          },
        ],
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser?.(res.data.user);
      setIsShopkeeper?.(res.data.user.role === "shopkeeper");

      showToast("Signup successful!");

      setTimeout(() => {
        navigate(res.data.user.role === "shopkeeper" ? "/shopkeeper" : "/");
      }, 700);
      
    } catch (err) {
      const msg=err?.response?.data?.message || "Signup failed";
      setError(msg);
      showToast(msg,"error")
    } finally {
      setLoading(false);
    }
  };

  // --------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      setUser?.(user);
      setIsShopkeeper?.(user.role === "shopkeeper");

      showToast("Login successful!");

      setTimeout(() => {
        navigate(user.role === "shopkeeper" ? "/shopkeeper" : "/");
      }, 700);
      
    } catch (err) {
      const msg=err?.response?.data?.message || "Login failed";
      setError(msg);
      showToast(msg, "error")
    } finally {
      setLoading(false);
    }
  };


   const useCurrentLocation = () => {
  if (!("geolocation" in navigator)) {
    alert("Geolocation not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      setLatitude(latitude);
      setLongitude(longitude);
      alert(`📍 Location captured:\nLat: ${latitude}\nLng: ${longitude}`);
    },
    (err) => {
      console.error("Geolocation error:", err);
      if (err.code === 1) {
        alert("❌ Permission denied — please allow location access in your browser.");
      } else if (err.code === 2) {
        alert("⚠️ Position unavailable — try again.");
      } else if (err.code === 3) {
        alert("⏰ Request timed out — check your connection.");
      } else {
        alert("Failed to get location: " + err.message);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0,
    }
  );
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center px-4 py-12">


      {/* Toast Component */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}


      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-yellow-100">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-10 text-6xl">◆</div>
              <div className="absolute bottom-3 left-5 text-5xl">◆</div>
            </div>

            <div className="relative h-full flex flex-col items-center justify-center">
              <Link to="/" className="inline-flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-yellow-600 font-bold text-lg">U</span>
                </div>
              </Link>
              <h1 className="text-white font-bold text-2xl">E-Mart</h1>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-center text-gray-600 text-sm mb-8">
              {isSignup ? "Join our community and start shopping" : "Sign in to your account to continue"}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <span className="text-red-600 font-semibold text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
              {/* Username (signup) */}
              {isSignup && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-yellow-50 focus:bg-white transition-all duration-200 font-medium"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-yellow-600 text-lg">✉</span>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-yellow-50 focus:bg-white transition-all duration-200 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-yellow-600 text-lg">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-yellow-50 focus:bg-white transition-all duration-200 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-yellow-600 transition-colors text-lg"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Confirm password & role (signup) */}
              {isSignup && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-yellow-600 text-lg">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-yellow-50 focus:bg-white transition-all duration-200 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-yellow-50 focus:bg-white transition-all duration-200 font-medium cursor-pointer"
                    >
                      <option value="user">Regular Customer</option>
                      <option value="shopkeeper">Shopkeeper</option>
                    </select>
                  </div>
                </>
              )}

              {/* Remember / Forgot (login) */}
              {!isSignup && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-yellow-300 accent-yellow-400" />
                    <span className="text-sm text-gray-700">Remember me</span>
                  </label>
                  <Link to="#" className="text-sm text-yellow-600 hover:text-yellow-700 font-semibold">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Signup extra fields */}
              {isSignup && (
                <>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-2">
                    <p className="text-xs uppercase font-semibold text-gray-600 mb-3">Personal Details</p>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-yellow-100 mb-3 focus:border-yellow-400 focus:outline-none bg-white"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-white"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-4">
                    <p className="text-xs uppercase font-semibold text-gray-600 mb-3">Address Information</p>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-yellow-100 mb-3 focus:border-yellow-400 focus:outline-none bg-white"
                      placeholder="Complete address"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        className="px-3 py-2 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-white"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      <input
                        className="px-3 py-2 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-white"
                        placeholder="State"
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                      />
                      <input
                        className="px-3 py-2 rounded-xl border-2 border-yellow-100 focus:border-yellow-400 focus:outline-none bg-white"
                        placeholder="ZIP"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-4">
                    <p className="text-xs uppercase font-semibold text-gray-600 mb-3">Your Location</p>
                    <SelectLocationMap
                      onLocationSelect={(loc) => {
                        setLatitude(loc.lat);
                        setLongitude(loc.lng);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">Please select your exact map location.</p>
                  </div>
                </>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  isSignup ? "Create Account" : "Sign In"
                )}
              </button>
            </form>

            {/* Switch mode */}
            <div className="mt-8 pt-8 border-t border-yellow-100">
              <p className="text-center text-gray-600 text-sm">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError("");
                  }}
                  className="text-yellow-600 hover:text-yellow-700 font-bold"
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>

            {/* Social buttons */}
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-yellow-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-600">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 px-3 border-2 border-yellow-100 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-sm font-semibold text-gray-700">
                  Google
                </button>
                <button className="py-2.5 px-3 border-2 border-yellow-100 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-sm font-semibold text-gray-700">
                  GitHub
                </button>
              </div>
            </div>

            {!isSignup && (
              <p className="text-center text-xs text-gray-400 mt-6">Demo: user@example.com / password123</p>
            )}
          </div>
        </div>

        {/* Footer badges */}
        <div className="mt-8 flex justify-center gap-6 text-center">
          <div className="text-center">
            <div className="inline-block p-2 bg-yellow-100 rounded-lg mb-2">
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-xs text-gray-600 font-semibold">Secure</p>
          </div>
          <div className="text-center">
            <div className="inline-block p-2 bg-yellow-100 rounded-lg mb-2">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-xs text-gray-600 font-semibold">Fast</p>
          </div>
          <div className="text-center">
            <div className="inline-block p-2 bg-yellow-100 rounded-lg mb-2">
              <span className="text-2xl">💯</span>
            </div>
            <p className="text-xs text-gray-600 font-semibold">Trusted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

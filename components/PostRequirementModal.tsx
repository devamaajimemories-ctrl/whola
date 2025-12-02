"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, Search, MapPin, Crosshair, Lock } from "lucide-react";
import { industrialProducts } from "@/lib/industrialData";
import Link from "next/link";

interface PostRequirementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PostRequirementModal: React.FC<PostRequirementModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        product: "",
        quantity: "",
        unit: "Pieces",
        estimatedPrice: "", // Target Price / Budget
        buyerName: "",
        buyerPhone: "",
        description: "",    // Additional Details
        city: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Check Auth on Mount
    useEffect(() => {
        if (isOpen) {
            checkAuth();
        }
    }, [isOpen]);

    const checkAuth = async () => {
        setCheckingAuth(true);
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.success && data.user) {
                setIsAuthenticated(true);
                setFormData(prev => ({
                    ...prev,
                    buyerName: data.user.name || "",
                    buyerPhone: data.user.phone || ""
                }));
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setIsAuthenticated(false);
        } finally {
            setCheckingAuth(false);
        }
    };

    const allProducts = React.useMemo(() => {
        return industrialProducts.flatMap(cat => cat.products);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();

                const detectedCity = data.address.city || data.address.town || data.address.state_district || data.address.state;
                if (detectedCity) {
                    setFormData(prev => ({ ...prev, city: detectedCity }));
                }
            } catch (e) {
                alert("Could not fetch location.");
            } finally {
                setIsLocating(false);
            }
        }, () => {
            setIsLocating(false);
            alert("Permission denied for location.");
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "product") {
            if (value.trim().length > 1) {
                const filtered = allProducts.filter(item =>
                    item.toLowerCase().includes(value.toLowerCase())
                ).slice(0, 5);
                setSuggestions(filtered);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                    setFormData({
                        product: "", quantity: "", unit: "Pieces", estimatedPrice: "",
                        buyerName: "", buyerPhone: "", description: "", city: ""
                    });
                }, 3000);
            } else {
                alert(result.error || "Failed to post requirement.");
            }
        } catch (error) {
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 flex justify-between items-center text-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-xl font-bold">Post Your Requirement</h2>
                        <p className="text-red-100 text-sm mt-1">Get quotes from verified sellers instantly</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Requirement Posted!</h3>
                            <p className="text-gray-600">We are contacting sellers in <b>{formData.city || 'your area'}</b> and will update you shortly.</p>
                        </div>
                    ) : !isAuthenticated && !checkingAuth ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
                            <p className="text-gray-600 px-4">
                                You must be logged in to post a requirement. This ensures valid inquiries for our sellers.
                            </p>
                            <Link href="/login" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                                Login Now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Product Input */}
                            <div className="relative" ref={suggestionsRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product / Service Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="product"
                                    required
                                    value={formData.product}
                                    onChange={handleChange}
                                    placeholder="E.g. TMT Steel Bars"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    autoComplete="off"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {suggestions.map((item, index) => (
                                            <div key={index} onClick={() => { setFormData({ ...formData, product: item }); setShowSuggestions(false); }} className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm text-gray-700 flex items-center">
                                                <Search size={14} className="mr-2 text-gray-400" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Location (City) Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City / Location <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter City or Detect"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                    <MapPin size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={isLocating}
                                        className="absolute right-2 top-1 text-xs bg-blue-50 text-blue-600 px-2 py-1.5 rounded hover:bg-blue-100 flex items-center gap-1 transition-colors"
                                    >
                                        {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                                        Detect
                                    </button>
                                </div>
                            </div>

                            {/* Quantity & Price Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            name="quantity"
                                            required
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            placeholder="500"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-red-500 outline-none border-r-0"
                                        />
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-700 rounded-r-lg focus:ring-2 focus:ring-red-500 outline-none px-2 text-sm"
                                        >
                                            <option value="Pieces">Pcs</option>
                                            <option value="Tons">Tons</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Sets">Sets</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Price <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="estimatedPrice"
                                        required
                                        value={formData.estimatedPrice}
                                        onChange={handleChange}
                                        placeholder="e.g. ₹50/pc"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Description - Optional */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Specific Details</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Describe your requirement in detail (brand, size, grade, etc.)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                />
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="buyerName"
                                        required
                                        value={formData.buyerName}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-lg focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        name="buyerPhone"
                                        required
                                        value={formData.buyerPhone}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-lg focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Post Requirement Now"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostRequirementModal;
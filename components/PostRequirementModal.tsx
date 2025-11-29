"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, Search } from "lucide-react";
import { industrialProducts } from "@/lib/industrialData";

interface PostRequirementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PostRequirementModal: React.FC<PostRequirementModalProps> = ({ isOpen, onClose }) => {
    // 1. FIX: Renamed 'mobile' to 'buyerPhone' to match API expectations
    const [formData, setFormData] = useState({
        product: "",
        quantity: "",
        unit: "Pieces",
        estimatedPrice: "",
        buyerName: "",
        buyerPhone: "", // <--- Changed from 'mobile'
        description: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Flatten products for easier searching
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

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Autocomplete Logic for Product Name
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

    const handleSuggestionClick = (productName: string) => {
        setFormData({ ...formData, product: productName });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 2. API Call: Now sends 'buyerPhone' correctly because we fixed the state key
            const response = await fetch("/api/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    category: "General" // You might want to make this dynamic later
                }),
            });

            const result = await response.json();
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                    // 3. Reset Form with correct keys
                    setFormData({
                        product: "",
                        quantity: "",
                        unit: "Pieces",
                        estimatedPrice: "",
                        buyerName: "",
                        buyerPhone: "", // <--- Reset buyerPhone
                        description: ""
                    });
                }, 3000);
            } else {
                alert(result.error || "Failed to post requirement. Please try again.");
            }
        } catch (error) {
            console.error("Error posting requirement:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">Post Your Requirement</h2>
                        <p className="text-red-100 text-sm mt-1">Get quotes from verified sellers instantly</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Requirement Posted!</h3>
                            <p className="text-gray-600">Your requirement has been broadcasted to top sellers. You will receive quotes shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative" ref={suggestionsRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product / Service Name</label>
                                <input
                                    type="text"
                                    name="product"
                                    required
                                    value={formData.product}
                                    onChange={handleChange}
                                    placeholder="E.g. TMT Steel Bars, Rice, CNC Machine"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    autoComplete="off"
                                />
                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {suggestions.map((item, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick(item)}
                                                className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm text-gray-700 flex items-center"
                                            >
                                                <Search size={14} className="mr-2 text-gray-400" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="text"
                                        name="quantity"
                                        required
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder="E.g. 500"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                                    >
                                        <option value="Pieces">Pieces</option>
                                        <option value="Tons">Tons</option>
                                        <option value="Kg">Kg</option>
                                        <option value="Sets">Sets</option>
                                        <option value="Liters">Liters</option>
                                        <option value="Meters">Meters</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Price / Budget</label>
                                <input
                                    type="text"
                                    name="estimatedPrice"
                                    required
                                    value={formData.estimatedPrice}
                                    onChange={handleChange}
                                    placeholder="E.g. ₹50,000 or Best Market Price"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add more details like grade, size, brand preference..."
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        name="buyerName"
                                        required
                                        value={formData.buyerName}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="buyerPhone" // <--- 4. Updated name attribute
                                        required
                                        value={formData.buyerPhone} // <--- Updated value binding
                                        onChange={handleChange}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin mr-2" />
                                        Posting...
                                    </>
                                ) : (
                                    "Post Requirement Now"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostRequirementModal;
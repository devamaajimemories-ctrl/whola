"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

export default function ManageProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Form State
    const [newProduct, setNewProduct] = useState({ 
        name: '', 
        price: '', 
        category: 'General', 
        unit: 'Piece' 
    });

    // Fetch products on load
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/seller/products/my');
            const data = await res.json();
            if (data.success) setProducts(data.data);
        } catch (e) {
            console.error("Failed to fetch products");
        }
    };

    const handleSave = async () => {
        if (!newProduct.name || !newProduct.price) {
            setError("Name and Price are required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/products/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newProduct.name,
                    price: newProduct.price,
                    category: newProduct.category,
                    unit: newProduct.unit,
                    description: "" // Optional
                })
            });

            const data = await res.json();

            if (data.success) {
                setIsAdding(false);
                setNewProduct({ name: '', price: '', category: 'General', unit: 'Piece' });
                fetchProducts();
            } else {
                setError(data.error || "Failed to save product.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
                <button 
                    onClick={() => setIsAdding(!isAdding)} 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={18} /> {isAdding ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {/* Quick Add Form */}
            {isAdding && (
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-orange-200 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Add New Item</h3>
                    
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <input 
                            placeholder="Product Name" 
                            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 outline-none"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} 
                        />
                        <input 
                            placeholder="Price (₹)" 
                            type="number" 
                            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 outline-none"
                            value={newProduct.price}
                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} 
                        />
                        <input 
                            placeholder="Category" 
                            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 outline-none"
                            value={newProduct.category}
                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} 
                        />
                        <select
                            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                            value={newProduct.unit}
                            onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                        >
                            <option value="Piece">Piece</option>
                            <option value="Kg">Kg</option>
                            <option value="Set">Set</option>
                            <option value="Box">Box</option>
                            <option value="Ton">Ton</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : null}
                        {loading ? "Saving..." : "Save Product"}
                    </button>
                </div>
            )}

            {/* List Products */}
            <div className="space-y-4">
                {products.length > 0 ? (
                    products.map((p: any) => (
                        <div key={p._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                    {p.images && p.images[0] ? (
                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover rounded-lg"/>
                                    ) : (
                                        <ImageIcon className="text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                                    <p className="text-green-600 font-semibold text-sm">₹{p.price} / {p.unit}</p>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 mt-1 inline-block">{p.category}</span>
                                </div>
                            </div>
                            <button className="text-blue-600 font-bold text-sm border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                Edit
                            </button>
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Plus className="text-gray-400" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">No products yet.</p>
                            <p className="text-sm text-gray-400">Click "Add Product" to list your first item.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, Image as ImageIcon } from 'lucide-react';

export default function ManageProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'General', unit: 'Piece' });

    // Fetch products on load
    useEffect(() => {
        fetch('/api/seller/products/my')
            .then(res => res.json())
            .then(data => { if (data.success) setProducts(data.data); });
    }, [isAdding]); // Refresh when adding is done

    const handleSave = async () => {
        await fetch('/api/products/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        setIsAdding(false);
        setNewProduct({ name: '', price: '', category: 'General', unit: 'Piece' });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Products</h1>
                <button onClick={() => setIsAdding(!isAdding)} className="bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18} /> {isAdding ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {/* Add Product Form */}
            {isAdding && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-orange-200">
                    <h3 className="font-bold mb-4">Add New Item</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <input placeholder="Product Name" className="border p-2 rounded"
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                        <input placeholder="Price (₹)" type="number" className="border p-2 rounded"
                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                        <input placeholder="Category" className="border p-2 rounded"
                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                    </div>
                    <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save Product</button>
                </div>
            )}

            {/* List Products */}
            <div className="space-y-4">
                {products.map((p: any) => (
                    <div key={p._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>
                            <div>
                                <h3 className="font-bold text-lg">{p.name}</h3>
                                <p className="text-gray-600">₹{p.price} / {p.unit}</p>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{p.category}</span>
                            </div>
                        </div>
                        <button className="text-blue-600 font-bold text-sm border border-blue-600 px-4 py-1 rounded hover:bg-blue-50">Edit</button>
                    </div>
                ))}
                {products.length === 0 && !isAdding && <div className="text-center text-gray-500 py-10">No products yet. Click "Add Product" to start selling!</div>}
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Upload, DollarSign, Tag, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '', // Simple URL input for now
        specKey: '',
        specValue: ''
    });

    const [specifications, setSpecifications] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSpecification = () => {
        if (formData.specKey && formData.specValue) {
            setSpecifications({
                ...specifications,
                [formData.specKey]: formData.specValue
            });
            setFormData({ ...formData, specKey: '', specValue: '' });
        }
    };

    const removeSpecification = (key: string) => {
        const newSpecs = { ...specifications };
        delete newSpecs[key];
        setSpecifications(newSpecs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/products/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    images: formData.imageUrl ? [formData.imageUrl] : [],
                    specifications
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Product added successfully!');
                setTimeout(() => router.push('/seller/dashboard'), 2000);
            } else {
                setError(data.error || 'Failed to add product');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/seller/dashboard" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-600 p-6 text-white">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Package size={24} />
                            Add New Product
                        </h1>
                        <p className="text-blue-100 mt-1">List your products for thousands of buyers to see.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
                                <CheckCircle size={20} />
                                {success}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Industrial Steel Pipes"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Industrial Machinery">Industrial Machinery</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Construction Material">Construction Material</option>
                                    <option value="Chemicals">Chemicals</option>
                                    <option value="Packaging Material">Packaging Material</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                <div className="relative">
                                    <DollarSign size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Describe your product features, material, usage, etc."
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Product Image</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Upload size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="url"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Enter a direct link to an image (e.g. from Imgur or Google Photos).</p>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Specifications (Optional)</h3>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="specKey"
                                    value={formData.specKey}
                                    onChange={handleChange}
                                    placeholder="Feature (e.g. Color)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    name="specValue"
                                    value={formData.specValue}
                                    onChange={handleChange}
                                    placeholder="Value (e.g. Red)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            {Object.keys(specifications).length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    {Object.entries(specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <span className="text-sm"><span className="font-semibold">{key}:</span> {value}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(key)}
                                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Saving...' : 'Submit Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, FileText, Loader2 } from 'lucide-react';

export default function SellerProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', city: '', category: '',
        gstin: '', businessType: '', yearEstablished: '',
        address: '', pincode: '', state: '', country: 'India'
    });

    useEffect(() => {
        fetch('/api/seller/profile').then(res => res.json()).then(data => {
            if (data.success) setFormData(prev => ({ ...prev, ...data.profile }));
            setLoading(false);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setSaving(true);
        await fetch('/api/seller/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setSaving(false);
        alert("Profile Updated!");
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Business Profile</h1>
                    <button onClick={handleSubmit} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Changes
                    </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">GSTIN</label>
                        <input name="gstin" value={formData.gstin} onChange={handleChange} className="w-full border p-2 rounded" placeholder="27AAAAA0000A1Z5" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Business Type</label>
                        <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="">Select...</option>
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Trader">Trader</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                        <input name="address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Full Address" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                        <input name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
                        <input name="pincode" value={formData.pincode} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

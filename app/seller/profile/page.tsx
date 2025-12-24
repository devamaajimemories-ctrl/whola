"use client";
import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Loader2, User } from 'lucide-react';
import VerificationCard from '@/components/seller/VerificationCard';

export default function SellerProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', city: '', category: '',
        businessType: '', yearEstablished: '',
        address: '', pincode: '', state: '', country: 'India'
    });

    // Verification State (Separated for the Card)
    const [verificationData, setVerificationData] = useState({
        isVerified: false,
        gstin: ''
    });

    useEffect(() => {
        fetch('/api/seller/profile')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFormData(prev => ({ ...prev, ...data.profile }));
                    setVerificationData({
                        isVerified: data.profile.isVerified || !!data.profile.gstin, // Fallback check
                        gstin: data.profile.gstin || ''
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await fetch('/api/seller/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            alert("Profile details updated successfully!");
        } catch (e) {
            alert("Failed to save changes.");
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* 1. Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
                        <p className="text-gray-500">Manage your business information and verification status</p>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={saving} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* 2. Left Column: Basic Info & Verification */}
                    <div className="md:col-span-1 space-y-6">
                        
                        {/* Verification Card Component */}
                        <VerificationCard 
                            initialStatus={verificationData.isVerified}
                            existingGst={verificationData.gstin}
                        />

                        {/* Basic Contact Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={18} className="text-gray-500" /> Contact Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Owner Name</label>
                                    <input 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                                    <input 
                                        value={formData.phone} 
                                        disabled 
                                        className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg text-sm text-gray-500 cursor-not-allowed" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                                    <input 
                                        value={formData.email} 
                                        disabled 
                                        className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg text-sm text-gray-500 cursor-not-allowed" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Right Column: Business Details */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
                            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                                <Building2 size={20} className="text-gray-500" /> Company Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
                                    <select 
                                        name="businessType" 
                                        value={formData.businessType} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="">Select Type...</option>
                                        <option value="Manufacturer">Manufacturer</option>
                                        <option value="Wholesaler">Wholesaler</option>
                                        <option value="Trader">Trader</option>
                                        <option value="Distributor">Distributor</option>
                                        <option value="Retailer">Retailer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year Established</label>
                                    <input 
                                        type="number"
                                        name="yearEstablished" 
                                        value={formData.yearEstablished} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 2015" 
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <MapPin size={16} className="inline mr-1 text-gray-400" /> 
                                        Registered Address
                                    </label>
                                    <input 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="Shop No, Building, Street..." 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                    <input 
                                        name="city" 
                                        value={formData.city} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                    <input 
                                        name="state" 
                                        value={formData.state} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                                    <input 
                                        name="pincode" 
                                        value={formData.pincode} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                    <input 
                                        value={formData.country} 
                                        disabled 
                                        className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm text-gray-500 cursor-not-allowed" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
"use client";
export const dynamic = "force-dynamic"; // <--- THIS FIXES THE BUILD ERROR

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, CreditCard, User, Shield, Loader2, CheckCircle } from 'lucide-react';

// 2. Create a sub-component for the logic that uses search params
function BankDetailsForm() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [accountNumber, setAccountNumber] = useState("");
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (accountNumber !== confirmAccountNumber) {
            alert("Account numbers do not match!");
            return;
        }

        setLoading(true);

        const res = await fetch('/api/seller/add-bank-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId,
                accountNumber,
                ifsc,
                accountHolderName
            })
        });

        const data = await res.json();

        if (res.ok) {
            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/seller/messages';
            }, 3000);
        } else {
            alert(data.error || "Failed to add bank details");
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing!</h2>
                    <p className="text-gray-600 mb-4">
                        Your bank details have been saved. Payment is being transferred to your account now.
                    </p>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <div className="text-center mb-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="text-blue-600" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Bank Details</h1>
                <p className="text-gray-600">
                    Receive your payment instantly via secure bank transfer
                </p>
                {orderId && (
                    <p className="text-sm text-blue-600 font-mono mt-2">Order: {orderId}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Holder Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User size={16} />
                        Account Holder Name (as per bank)
                    </label>
                    <input
                        type="text"
                        required
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())}
                        placeholder="JOHN DOE"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    />
                </div>

                {/* Account Number */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <CreditCard size={16} />
                        Bank Account Number
                    </label>
                    <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234567890"
                        maxLength={18}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                </div>

                {/* Confirm Account Number */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Shield size={16} />
                        Re-enter Account Number
                    </label>
                    <input
                        type="text"
                        required
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234567890"
                        maxLength={18}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                </div>

                {/* IFSC Code */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Building2 size={16} />
                        IFSC Code
                    </label>
                    <input
                        type="text"
                        required
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        placeholder="SBIN0001234"
                        maxLength={11}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">11-character alphanumeric code (e.g., SBIN0001234)</p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || accountNumber !== confirmAccountNumber}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={20} />
                            Submit & Receive Payment
                        </>
                    )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                    🔒 Your bank details are encrypted and securely stored. Payment will be transferred within 5 minutes.
                </p>
            </form>
        </div>
    );
}

// 3. Wrap the form in Suspense in the main Page component
export default function AddBankDetailsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <Suspense fallback={<div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>}>
                <BankDetailsForm />
            </Suspense>
        </div>
    );
}
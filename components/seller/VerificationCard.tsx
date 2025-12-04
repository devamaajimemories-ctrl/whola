"use client";

import { useState } from 'react';
import { ShieldCheck, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

interface VerificationCardProps {
    initialStatus: boolean;
    existingGst?: string;
    onVerifyComplete?: () => void; // Optional callback to refresh parent data
}

export default function VerificationCard({ initialStatus, existingGst, onVerifyComplete }: VerificationCardProps) {
    const [isVerified, setIsVerified] = useState(initialStatus);
    const [gstInput, setGstInput] = useState(existingGst || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleVerify = async () => {
        setError('');
        setSuccessMsg('');
        
        const cleanGST = gstInput.trim().toUpperCase();

        // Client-side pre-validation
        if (!cleanGST) {
            setError("Please enter your GSTIN");
            return;
        }
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGST)) {
            setError("Invalid format. Format: 22AAAAA0000A1Z5");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/seller/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gstin: cleanGST }),
            });

            const data = await response.json();

            if (data.success) {
                setIsVerified(true);
                setSuccessMsg("Business Verified Successfully!");
                if (onVerifyComplete) onVerifyComplete();
            } else {
                setError(data.error || "Verification failed");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // UI: Verified State
    if (isVerified) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                        Verified Business <CheckCircle size={16} />
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                        GSTIN: <span className="font-mono font-bold">{gstInput || existingGst}</span>
                    </p>
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800 uppercase tracking-wide">
                        Trust Badge Active
                    </div>
                </div>
            </div>
        );
    }

    // UI: Unverified State (Form)
    return (
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Get Verified Badge</h3>
                    <p className="text-sm text-gray-500">Boost buyer trust by 50% with GST verification</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="gstin" className="block text-sm font-semibold text-gray-700 mb-1">
                        Enter GSTIN Number
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="gstin"
                            value={gstInput}
                            onChange={(e) => {
                                setGstInput(e.target.value.toUpperCase());
                                setError('');
                            }}
                            placeholder="22AAAAA0000A1Z5"
                            disabled={isLoading}
                            className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono transition-all"
                            maxLength={15}
                        />
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={isLoading || !gstInput}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify Now"
                    )}
                </button>
                
                <p className="text-xs text-gray-400 text-center">
                    Instant verification. No documents upload required.
                </p>
            </div>
        </div>
    );
}
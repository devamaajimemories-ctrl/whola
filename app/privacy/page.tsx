import React from 'react';
import { Lock, Eye, Database, ShieldCheck, UserCheck, AlertCircle, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12 border-b-4 border-green-500">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Lock className="h-10 w-10 text-green-400" />
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl">
            At YouthBharat WholesaleMart, we value your trust. This policy outlines how we handle your data, 
            including business listings and advertising data.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          
          <div className="border-b border-gray-100 pb-6">
            <p className="text-sm text-gray-500 mb-2">Last Updated: {new Date().toLocaleDateString()}</p>
            <p className="leading-relaxed">
              This Privacy Policy explains how <strong>YouthBharat</strong> ("we", "us") collects, uses, and protects your information. 
              By using our platform, you agree to the practices described below.
            </p>
          </div>

          {/* Section 1: Information Collection */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database size={20} className="text-blue-600"/> 1. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li>
                <strong>User-Provided Information:</strong> When you register, we collect your Name, Mobile Number, Email, City, and Business Category.
              </li>
              <li>
                <strong>Financial Information:</strong> For Sellers, we collect GSTIN and Bank Account details to process payouts via our Escrow system.
              </li>
              <li>
                <strong>Publicly Available Data:</strong> We use automated technology to aggregate business contact information (Business Name, City, Category, Public Phone) from publicly available sources to create a comprehensive business directory.
              </li>
            </ul>
          </section>

          {/* Section 2: How We Use Data */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={20} className="text-blue-600"/> 2. How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li>
                <strong>To Facilitate Trade:</strong> We display your Business Name, City, and Products to potential buyers.
              </li>
              <li>
                <strong>Safety & Fraud Prevention:</strong> We mask your phone number on public profiles to prevent spam. Contact details are only shared when a connection is "Unlocked" or a deal is initiated.
              </li>
              <li>
                <strong>Chat Monitoring:</strong> To ensure platform safety and prevent fee avoidance, our automated systems monitor and redact Personally Identifiable Information (PII) like phone numbers shared in chat messages.
              </li>
            </ul>
          </section>

          {/* Section 3: Advertising (NEW REQUIRED SECTION) */}
          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={20} className="text-blue-600"/> 3. Advertising Partners
            </h2>
            <p className="text-gray-600 mb-3">
              We use third-party advertising companies to serve ads when you visit our website.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong>Google AdSense:</strong> Google uses cookies to serve ads based on your prior visits to our website or other websites. 
                Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="nofollow" className="text-blue-600 hover:underline">Google Ad Settings</a>.
              </li>
            </ul>
          </section>

          {/* Section 4: Data Sharing */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-blue-600"/> 4. Data Sharing & Disclosure
            </h2>
            <p className="text-gray-600 mb-3">We do not sell your personal data. We share data only in the following ways:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong>With Payment Processors:</strong> Transaction details are shared with <strong>Razorpay</strong> to facilitate Escrow payments and settlements.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose data if required by Indian law or legal process.
              </li>
            </ul>
          </section>

          {/* Section 5: Security */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600"/> 5. Data Security
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                We use <strong>OTP Verification</strong> for all logins to prevent unauthorized access.
              </li>
              <li>
                Your financial data (Bank Details) is stored securely and used strictly for payouts.
              </li>
              <li>
                We employ standard encryption protocols to protect data in transit and at rest.
              </li>
            </ul>
          </section>

          {/* Section 6: Disclaimer for Listed Businesses */}
          <section className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20}/> 6. Notice for Unclaimed Listings
            </h2>
            <p className="text-yellow-800/80 mb-3">
              If your business is listed on YouthBharat and you did not create the listing (sourced via our 
 Directory), you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-yellow-800/80">
              <li><strong>Claim your listing:</strong> Register and verify your phone number to take control of the profile.</li>
              <li><strong>Request Removal:</strong> If you wish to be removed from our directory, please contact support with your business details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-600 mb-2">
              For any privacy-related concerns or to request data deletion, please reach out to our Grievance Officer:
            </p>
            <ul className="space-y-1 text-gray-700 font-medium">
              <li>Email: <a href="mailto:privacy@youthbharat.com" className="text-blue-600 hover:underline">privacy@youthbharat.com</a></li>
              <li>Address: New Delhi, India</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
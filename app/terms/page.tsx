import React from 'react';
import { Shield, FileText, Scale, Mail, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <FileText className="h-10 w-10 text-blue-400" />
            Terms of Use
          </h1>
          <p className="mt-4 text-blue-100 max-w-2xl">
            Please read these terms carefully before using YouthBharat WholesaleMart.
            By using our platform, you agree to abide by these rules.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          
          <div className="border-b border-gray-100 pb-6">
            <p className="text-sm text-gray-500 mb-2">Last Updated: {new Date().toLocaleDateString()}</p>
            <p className="leading-relaxed">
              Welcome to <strong>YouthBharat WholesaleMart</strong>. By accessing or using our website, mobile application, or services, 
              you agree to be bound by these Terms of Use ("Terms"). If you do not agree, please do not use our services.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale size={20} className="text-blue-600"/> 1. Nature of Platform
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong>Intermediary Role:</strong> We act as an intermediary. We do not own, sell, or resell the products listed (unless explicitly stated).
              </li>
              <li>
                <strong>Data Aggregation:</strong> Some business listings are aggregated from publicly available sources  to help buyers find suppliers. We do not claim ownership of third-party trademarks.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
               2. Account Registration
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Eligibility:</strong> You must be at least 18 years old and capable of forming a binding contract.</li>
              <li><strong>Verification:</strong> Sellers may be required to provide GSTIN, Bank Details, and other business proofs. We reserve the right to suspend accounts with false information.</li>
              <li><strong>Security:</strong> Accounts are secured via mobile OTP. You are responsible for maintaining the confidentiality of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
               3. Buying & Selling Rules
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">For Buyers</h3>
                <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                    <li>You agree to pay for goods/services ordered via our secured payment gateways.</li>
                    <li>You must verify product details with the seller via Chat before making a payment.</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">For Sellers</h3>
                 <ul className="list-disc pl-5 text-sm text-green-800 space-y-1">
                    <li>You warrant that you have the right to sell the products listed.</li>
                    <li>You agree to the <strong>5% Platform Fee</strong> deducted from every successful order.</li>
                    <li>You must ship orders within the stipulated time to avoid cancellation.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Shield size={20} className="text-blue-600"/> 4. Payments & Escrow Policy
            </h2>
            <p className="text-gray-600 mb-3">To ensure safety, YouthBharat uses an <strong>Escrow System</strong> powered by Razorpay.</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Hold Period:</strong> Buyer payments are held in a secure Node/Escrow account.</li>
              <li><strong>Release of Funds:</strong> Funds are released to the Seller's wallet/bank account <strong>only after</strong> the Buyer confirms delivery or after a standard cooling period.</li>
              <li><strong>Payouts:</strong> Sellers receive <strong>95%</strong> of the order value. The remaining <strong>5%</strong> is retained as a service fee.</li>
              <li><strong>Refunds:</strong> If an order is cancelled before shipment or a dispute is won by the Buyer, a refund is processed to the source account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Communication & Data Policy</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Chat Monitoring:</strong> We use automated systems to detect and redact Personally Identifiable Information (PII) like phone numbers and external links in chat messages until a connection is officially unlocked.</li>
              <li><strong>Privacy:</strong> We respect your data. However, business contact information (Name, City, Business Category) made public by you or aggregated from public sources may be displayed to facilitate trade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500"/> 6. Prohibited Activities
            </h2>
            <p className="text-gray-600 mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Post false requirements or fake products.</li>
                <li>Attempt to bypass the platform's payment system to avoid fees.</li>
                <li>Scrape, spider, or crawl our website without written permission.</li>
                <li>Harass or defraud other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600">
                YouthBharat is not liable for the quality, safety, or legality of items advertised, nor the truth or accuracy of users' content. 
                We provide the technology to connect; the actual contract for sale is directly between Buyer and Seller.
            </p>
          </section>

           <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={20} className="text-gray-600"/> Contact Us
            </h2>
            <p className="text-gray-600 mb-2">For questions regarding these Terms, please contact us at:</p>
            <ul className="space-y-1 text-gray-700 font-medium">
                <li>Email: <a href="mailto:support@youthbharat.com" className="text-blue-600 hover:underline">support@youthbharat.com</a></li>
                <li>Address: Delhi, India</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
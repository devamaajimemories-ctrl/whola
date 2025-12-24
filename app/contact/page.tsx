import React from 'react';
// Icons removed as they were part of the "Get in Touch" section

export default function Contact() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Contact Support</h1>
                    <p className="text-xl text-blue-200">We're here to help you 24/7</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Changed from grid to centered single column */}
                <div className="max-w-2xl mx-auto">
                    
                    {/* Contact Form */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Payment Issue</option>
                                    <option>Account Problem</option>
                                    <option>Dispute Resolution</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                                    placeholder="How can we help?"
                                ></textarea>
                            </div>

                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
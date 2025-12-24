import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  Award, 
  Briefcase, 
  HeartHandshake 
} from 'lucide-react';

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Empowering India's Business Ecosystem
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-light leading-relaxed">
            Bridging the gap between Wholesale Manufacturers, Suppliers, and Local Service Providers across the nation.
          </p>
        </div>
      </section>

      {/* --- OUR MISSION & VISION --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-2">
                Who We Are
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Your Trusted Partner in <span className="text-blue-600">B2B Growth</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                YouthBharat WholesaleMart is more than just a marketplace; it is a movement to digitalize and democratize trade in India. We provide a robust platform where manufacturers, wholesalers, and traders can connect directly with buyers, eliminating inefficiencies and maximizing value.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Beyond products, we recognize the heartbeat of local commerce. That's why we integrate essential local services—from doctors and transporters to repair specialists—creating a comprehensive ecosystem for every business need.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                <Target className="text-blue-600 w-10 h-10 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600">To simplify B2B trade and local service discovery for every Indian business, big or small.</p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 hover:shadow-md transition-shadow">
                <TrendingUp className="text-indigo-600 w-10 h-10 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-600">To be India's most reliable digital backbone for wholesale commerce and local connectivity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHAT WE DO (Three Pillars) --- */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The YouthBharat Ecosystem</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We bring together three critical components of the Indian economy onto a single, easy-to-use platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:translate-y-[-5px] transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Wholesale Marketplace</h3>
              <p className="text-gray-600">
                Direct access to thousands of verified manufacturers and super-stockists across fashion, electronics, industrial goods, and more.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:translate-y-[-5px] transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Local Services</h3>
              <p className="text-gray-600">
                Find trusted professionals in your city. From healthcare providers (Doctors) to logistics (Transporters) and skilled technicians.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:translate-y-[-5px] transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="text-orange-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Verification</h3>
              <p className="text-gray-600">
                We prioritize safety. Our rigorous seller verification process ensures that you deal with genuine businesses, protecting your capital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US (Values) --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <div className="bg-gray-100 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                {/* Abstract Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-6 relative z-10">Driven by Values</h3>
                <ul className="space-y-5 relative z-10">
                  <li className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <HeartHandshake size={20} className="text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Customer First</h4>
                      <p className="text-sm text-gray-600 mt-1">Every feature we build is designed to solve real problems for our buyers and sellers.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Globe size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Pan-India Network</h4>
                      <p className="text-sm text-gray-600 mt-1">Connecting Tier-1 manufacturers with Tier-2 and Tier-3 retailers.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Award size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Quality Assurance</h4>
                      <p className="text-sm text-gray-600 mt-1">We strive to maintain a high-quality catalog with transparent pricing.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Why Businesses Choose YouthBharat</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                In a fragmented market, finding reliable suppliers or getting visibility as a seller is a challenge. We solve this by offering a unified platform that combines the reach of a search engine with the reliability of a managed marketplace.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Whether you are a retailer looking to stock up your shop, or a doctor wanting to serve your local community, YouthBharat provides the digital infrastructure to help you succeed.
              </p>
              
              <div className="pt-4">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Join Our Journey
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            Join thousands of businesses across India who trust YouthBharat WholesaleMart for their sourcing and selling needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register?type=seller" className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors">
              Become a Seller
            </Link>
            <Link href="/register" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors">
              Register as Buyer
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
import Link from 'next/link';
import connectToDatabase from '@/lib/db'; 
import Seller from '@/lib/models/Seller';
import { TARGET_CITIES } from '@/lib/locations'; 
import { 
    Facebook, 
    Twitter, 
    Instagram, 
    Linkedin, 
    Mail, 
    Phone, 
    MapPin, 
    ShieldCheck 
} from 'lucide-react';

const SeoFooter = async () => {
    let displayCities: string[] = [];
    const displayCategories = [
        "Shirts", "T-shirts", "Womens Wear", "Jewellery", "Infant Wear",
        "Electronics", "Industrial Machinery", "Home Decor", "Furniture",
        "Textiles", "Automotive Parts", "Packaging Material"
    ];

    try {
        await connectToDatabase();
        // 1. Fetch distinct cities from DB
        const dbCities = await Seller.distinct('city', {});
        
        // 2. STRICT FILTERING: Remove garbage data (numbers, dates, symbols)
        const cleanDbCities = dbCities.filter((c: unknown) => {
            if (typeof c !== 'string') return false;
            const clean = c.trim();
            // Rule: Must be >2 chars and ONLY letters/spaces (No numbers like "1.0")
            return clean.length > 2 && /^[a-zA-Z\s.-]+$/.test(clean);
        });

        // 3. Merge with clean TARGET_CITIES to ensure footer is never empty/ugly
        // Use Set to remove duplicates
        const combinedCities = new Set([...cleanDbCities, ...TARGET_CITIES]);
        
        // Convert back to array, sort A-Z, and take top 40
        displayCities = Array.from(combinedCities)
            .filter(c => c && c !== 'Unknown' && c !== 'India')
            .slice(0, 40)
            .sort();
            
    } catch (error) {
        console.error("Error fetching footer data:", error);
        // Fallback: Just use the clean list if DB fails
        displayCities = TARGET_CITIES.slice(0, 40).sort(); 
    }

    return (
        <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 text-sm font-sans border-t-4 border-blue-600">
            <div className="container mx-auto px-4">
                
                {/* --- Top Section --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    
                    {/* About Us */}
                    <div>
                        <h4 className="text-white text-lg font-bold mb-6 relative inline-block">
                            About Us
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Our Company</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* For Business */}
                    <div>
                        <h4 className="text-white text-lg font-bold mb-6 relative inline-block">
                            For Business
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-red-500"></span>
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/register?type=seller" className="hover:text-white transition-colors text-red-400">Sell on Platform</Link></li>
                            <li><Link href="/post-requirement" className="hover:text-white transition-colors">Post Buy Requirement</Link></li>
                            <li><Link href="/login" className="hover:text-white transition-colors">Supplier Login</Link></li>
                            <li><Link href="/advertise" className="hover:text-white transition-colors">Advertise With Us</Link></li>
                        </ul>
                    </div>

                    {/* Help & Legal */}
                    <div>
                        <h4 className="text-white text-lg font-bold mb-6 relative inline-block">
                            Help & Legal
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-green-500"></span>
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/safety" className="hover:text-white transition-colors flex items-center gap-2"><ShieldCheck size={14}/> Safety Tips</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Reach Us */}
                    <div>
                        <h4 className="text-white text-lg font-bold mb-6 relative inline-block">
                            Reach Us
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-yellow-500"></span>
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                <span>KK-101 Kavi Nagar Ghaziabad, UP, India</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <span>+91-8384049914</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <a href="mailto:youthbharatwholesaletrade@gmail.com" className="hover:text-white transition-colors">
                                    youthbharatwholesaletrade@gmail.com
                                </a>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <a href="#" className="bg-gray-800 p-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Facebook size={18} /></a>
                                <a href="#" className="bg-gray-800 p-2.5 rounded-full hover:bg-sky-500 hover:text-white transition-all"><Twitter size={18} /></a>
                                <a href="#" className="bg-gray-800 p-2.5 rounded-full hover:bg-pink-600 hover:text-white transition-all"><Instagram size={18} /></a>
                                <a href="#" className="bg-gray-800 p-2.5 rounded-full hover:bg-blue-700 hover:text-white transition-all"><Linkedin size={18} /></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-800 my-8"></div>

                {/* --- Dynamic City Links (Fixed) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {displayCities.length > 0 && (
                        <div>
                            <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider opacity-70">Suppliers by City</h5>
                            <div className="flex flex-wrap gap-x-2 gap-y-2 text-xs text-gray-500 leading-relaxed">
                                {displayCities.map((city, idx) => (
                                    <span key={city} className="flex items-center">
                                        <Link 
                                            href={`/search?q=${encodeURIComponent(`Wholesalers in ${city}`)}`} 
                                            className="hover:text-blue-400 transition-colors capitalize text-gray-400"
                                        >
                                            {city}
                                        </Link>
                                        {idx < displayCities.length - 1 && <span className="ml-2 text-gray-700">|</span>}
                                    </span>
                                ))}
                                <Link href="/locations" className="text-blue-500 hover:underline ml-1 font-bold">View All Cities</Link>
                            </div>
                        </div>
                    )}

                    <div>
                        <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider opacity-70">Popular Categories</h5>
                        <div className="flex flex-wrap gap-x-2 gap-y-2 text-xs text-gray-500 leading-relaxed">
                            {displayCategories.map((cat, idx) => (
                                <span key={cat} className="flex items-center">
                                    <Link 
                                        href={`/search?q=${encodeURIComponent(cat)}`} 
                                        className="hover:text-blue-400 transition-colors capitalize text-gray-400"
                                    >
                                        {cat}
                                    </Link>
                                    {idx < displayCategories.length - 1 && <span className="ml-2 text-gray-700">|</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p className="text-gray-500">© 2025 YouthBharat WholesaleMart. All rights reserved.</p>
                    <div className="flex gap-6 text-gray-500">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SeoFooter;
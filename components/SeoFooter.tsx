import Link from 'next/link';
import { industrialProducts } from '@/lib/industrialData';
import { TARGET_CITIES } from '@/lib/locations';

const SeoFooter = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12 mt-12 text-sm">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="text-white font-bold mb-4">Top Cities</h4>
                    <ul className="space-y-2">
                        {TARGET_CITIES.slice(0, 10).map(city => (
                            <li key={city}>
                                <Link href={`/search?q=Suppliers in ${city}`} className="hover:text-white transition">
                                    Suppliers in {city}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Popular Products</h4>
                    <ul className="space-y-2">
                        {industrialProducts.slice(0, 10).map(cat => (
                            <li key={cat.category}>
                                <Link href={`/category/${cat.category.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition">
                                    {cat.category}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Add Company Info & Social Links columns here */}
            </div>
            <div className="text-center mt-12 border-t border-gray-800 pt-8">
                <p>© 2025 YouthBharat WholesaleMart. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default SeoFooter;

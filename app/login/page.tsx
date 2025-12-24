import Link from 'next/link';
import { ShoppingBag, Store } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Buyer Option */}
        <Link href="/login/buyer" className="group relative bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all duration-300 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <ShoppingBag className="w-10 h-10 text-blue-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">I am a Buyer</h2>
          <p className="text-gray-500">Find products, get quotes, and manage orders.</p>
          <span className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Login as Buyer</span>
        </Link>

        {/* Seller Option */}
        <Link href="/login/seller" className="group relative bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-500 transition-all duration-300 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
            <Store className="w-10 h-10 text-indigo-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">I am a Seller</h2>
          <p className="text-gray-500">List products, manage leads, and grow business.</p>
          <span className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Login as Seller</span>
        </Link>

      </div>
    </div>
  );
}
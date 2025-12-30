import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { CheckCircle, MessageCircle, Package, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; 

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  
  const product = await Product.findOne({ slug, status: 'APPROVED' }).select('name description images price').lean();
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.name} | Best Wholesale Price in India`,
    description: product.description?.substring(0, 160) || `Buy ${product.name} at the best wholesale price.`,
    openGraph: {
      images: product.images && product.images[0] ? [product.images[0]] : [],
    },
    alternates: {
       canonical: `/product/${slug}`
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await dbConnect();

  // ✅ CRITICAL: Only fetch APPROVED products.
  const product = await Product.findOne({ slug, status: 'APPROVED' }).lean();

  // ⛔ 404 if not found (Prevents indexing of low-quality/pending items)
  if (!product) {
    return notFound(); 
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0] || 'https://youthbharatwholesalemart.com/logo.png',
    sku: product._id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `https://youthbharatwholesalemart.com/product/${slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-4 max-w-6xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link> / 
          <span className="mx-1">Products</span> / 
          <span className="text-gray-900 font-medium ml-1">{product.name}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            
            <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[400px]">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="max-h-[400px] w-auto object-contain rounded-lg shadow-sm" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Package size={64} />
                  <span className="mt-2">No Image Available</span>
                </div>
              )}
            </div>

            <div className="p-8 flex flex-col">
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                  <ShieldCheck size={12} /> Verified Supplier
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-blue-600">₹{product.price}</span>
                <span className="text-gray-500 font-medium mb-1">/ {product.unit}</span>
              </div>

              <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                <h3 className="text-gray-900 font-bold mb-2">Product Description</h3>
                <p>{product.description || "No description provided by the seller."}</p>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <Link 
                  href={`/post-requirement?product=${encodeURIComponent(product.name)}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg transition-colors shadow-md"
                >
                  <MessageCircle size={20} />
                  Contact Seller for Best Price
                </Link>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Response typically within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
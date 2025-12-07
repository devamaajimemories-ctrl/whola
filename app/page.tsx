import React from "react";
import Categories from "@/components/Categories";
import GoogleAd from "@/components/GoogleAd"; // Updated Import
import TrendingCategories from "@/components/TrendingCategories";
import ApparelFashion from "@/components/ApparelFashion";
import ConsumerElectronics from "@/components/ConsumerElectronics";
import HomeSupplies from "@/components/HomeSupplies";
import CosmeticsPersonalCare from "@/components/CosmeticsPersonalCare";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <div className="w-full bg-blue-900 py-16 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to YouthBharat WholesaleMart
        </h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          The largest searchable B2B marketplace. Connect with verified sellers and buyers.
        </p>
      </div>

      <Categories />

      {/* 1. First Ad Unit */}
      <GoogleAd slot="YOUR_AD_SLOT_ID_1" />

      <TrendingCategories />
      <ApparelFashion />
      <ConsumerElectronics />

      {/* 2. Second Ad Unit */}
      <GoogleAd slot="YOUR_AD_SLOT_ID_2" />

      <HomeSupplies />
      <CosmeticsPersonalCare />
    </main>
  );
}
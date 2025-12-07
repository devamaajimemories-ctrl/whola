"use client";
import { useEffect, useRef } from "react";

type AdProps = {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: boolean;
};

const GoogleAd = ({ slot, format = "auto", responsive = true }: AdProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // Safely push to the adsbygoogle array
      const pushAd = () => {
        if (typeof window !== "undefined") {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        }
      };

      // Only execute if the ins element is empty (not already loaded)
      if (adRef.current && adRef.current.innerHTML === "") {
        pushAd();
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-8 overflow-hidden bg-gray-50 border border-gray-100 rounded-lg min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-1998616030682500"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        ref={adRef as any}
      />
      <span className="sr-only">Advertisement</span>
    </div>
  );
};

export default GoogleAd;
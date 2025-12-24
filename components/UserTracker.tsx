"use client";

import { useEffect } from "react";

export default function UserTracker() {
    useEffect(() => {
        // Fire and forget tracking request
        const track = async () => {
            try {
                await fetch('/api/track', { method: 'POST' });
            } catch (e) {
                console.error("Tracking failed", e);
            }
        };

        track();

        // Optional: Heartbeat every 5 minutes to keep "Active" status alive while tab is open
        const interval = setInterval(track, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return null; // Invisible component
}

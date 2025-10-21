'use client'
import React, { useEffect, useRef, useState } from "react";
// import dynamic from "next/dynamic";
import { useMap } from "react-leaflet"; // Moved to dynamic import
import L from "leaflet"; // Moved to dynamic import

// Dynamically import leaflet-arrowheads only on client side
if (typeof window !== 'undefined') {
  require("leaflet-arrowheads");
}

interface ClickPosition {
    lat: number;
    lng: number;
    address?: { display_name?: string };
    date?: string;
    speed?: string;
}
function DirectionalPolyline({
    polylinedata,
    onClick,
    isPlaying, clickPosition
}: {
    polylinedata: [number, number][];
    onClick: (e: any) => void; // Changed from L.LeafletMouseEvent to any
    isPlaying: boolean;
    clickPosition: ClickPosition | null
}) {
    // const [map, setMap] = useState<any>(null);
    // const [L, setL] = useState<any>(null);
    const map = useMap();

    const polylineRef = useRef<any>(null);
    const arrowheadsRef = useRef<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load Leaflet and useMap dynamically
    // useEffect(() => {
    //     const loadLeaflet = async () => {
    //         if (typeof window !== 'undefined') {
    //             const { useMap } = await import("react-leaflet");
    //             const Leaflet = await import("leaflet");
    //             // setL(Leaflet.default);
    //             setMap(useMap());
    //         }
    //     };
    //     loadLeaflet();
    // }, []);

    useEffect(() => {
        if (!map || !L) return;

        if (!map.getPane("arrowPane")) {
            map.createPane("arrowPane");
            map.getPane("arrowPane")!.style.zIndex = "400"; // higher than default overlays (default is 400-600)
        }
    }, [map, L]);

    useEffect(() => {
        if (!map || !L || polylinedata.length < 2) return;
        // Create or update polyline
        if (!polylineRef.current) {
            polylineRef.current = L.polyline(polylinedata, {
                color: "red",
                weight: 6,
                pane: "overlayPane",
            }).addTo(map);

            polylineRef.current.on("click", onClick);
            setIsInitialized(true);
        } else {
            polylineRef.current.setLatLngs(polylinedata);
        }

        // Apply arrowheads only when needed
        if (!arrowheadsRef.current && polylineRef.current) {
            arrowheadsRef.current = (polylineRef.current as any).arrowheads({
                size: "12px",
                frequency: "50px",  // Render arrows less frequently
                yawn: 40,
                color: "blue",
                fill: true,
                pane: "arrowPane"
            });
        }

        // Cleanup function
        return () => {
            if (clickPosition === null) {
                if (polylineRef.current) {
                    map.removeLayer(polylineRef.current);
                    polylineRef.current = null;
                }
                arrowheadsRef.current = null;
            }
        };
    }, [map, polylinedata, isPlaying, clickPosition]);
    useEffect(() => {
        if (isInitialized && arrowheadsRef.current) {
            // Destroy existing arrowheads
            if (arrowheadsRef.current._arrowheads) {
                arrowheadsRef.current._arrowheads.remove();
            }

            // Recreate arrowheads with updated polyline
            if (polylineRef.current) {
                arrowheadsRef.current = (polylineRef.current as any).arrowheads({
                    size: "12px",
                    frequency: "50px",
                    yawn: 40,
                    color: "blue",
                    fill: true,
                    pane: "arrowPane"
                });
            }
        }
    }, [polylinedata.length]); // Only update when polyline length changes
    return null;
}

// Wrap in React.memo
export default React.memo(DirectionalPolyline);
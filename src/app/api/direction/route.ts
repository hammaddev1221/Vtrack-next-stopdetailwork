import { NextResponse } from "next/server";
import polyline from "@mapbox/polyline";
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");

    if (!origin || !destination) {
        return NextResponse.json(
            { error: "Origin and destination are required" },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=AIzaSyASPmp4BkVYiigDzyrsmunZsSkEUXZQhl8`,
            { cache: "no-store" } // avoids stale caching
        );

        const data = await response.json();
        if (data.routes.length > 0) {
            const route = data.routes[0].legs[0];
            return NextResponse.json({
                distance: route.distance?.text,
                duration: route.duration?.text,
                Polyline: polyline.decode(data.routes[0]?.overview_polyline?.points)
            });
        } else {
            return NextResponse.json(
                { error: "Failed to fetch directions" },
            );
        }
    } catch (error: any) {
        console.error("Directions API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch directions" },
            { status: 500 }
        );
    }
}

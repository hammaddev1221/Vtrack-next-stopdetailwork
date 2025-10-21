"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { VehicleData } from "@/types/vehicle";
import { ClientSettings } from "@/types/clientSettings";
import { LatLng } from "leaflet";
import logo from "@/../public/Images/logo.png";
import { getVehicleDataByClientId } from "@/utils/API_CALLS";
import { socket } from "@/utils/socket";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeShareToken } from "@/utils/decodeShareTokens";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import BlinkingTime from "@/components/General/BlinkingTime";

const LiveMap = dynamic(() => import("@/components/LiveTracking/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      Loading map...
    </div>
  ),
});

export default function SharePage() {
  const carData = useRef<VehicleData[]>([]);
//   const [updatedData, setUpdatedData] = useState<VehicleData[]>([]);
  const searchParams = useSearchParams();
  const vehicleReg = searchParams.get("vehicleReg")?.replaceAll("%", " ");
  const [clientSettings, setClientSettings] = useState<ClientSettings[]>([]);  
  const [activeColor, setIsActiveColor] = useState<any>("");
  
  const [isOnline, setIsOnline] = useState(false);
  const [query, setQuery] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(
    { vehicleReg } || null
  );
  const [unselectVehicles, setUnselectVehicles] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [showZones, setShowZones] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<LatLng | null>(null);
  const router = useRouter();
  const qparams = searchParams.get("q");

  // Link expiry check
  const checkExpiry = useCallback(() => {
    if (!query) return;
    const diff =
      (Date.now() - new Date(query.createdAt).getTime()) / (1000 * 60 * 60);
    if (diff >= query.expirationHours) {
      toast.error("Link expired");
      router.push("/Thankyou");
    }
  }, [query, router]);

  // Decode token
  useEffect(() => {
    const data = decodeShareToken(qparams);
    if (!data) return;
    setQuery(data);
    const diff =
      (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60);
    if (diff >= data.expirationHours) {
      toast.error("Link expired");
      router.push("/Thankyou");
    }
  }, [qparams, router]);

  // Extract map & zoom settings
  useEffect(() => {
    if (!clientSettings.length) return;
    const mapSetting = clientSettings.find((el) => el.PropertDesc === "Map")
      ?.PropertyValue;
    const zoomSetting = clientSettings.find((el) => el.PropertDesc === "Zoom")
      ?.PropertyValue;

    if (mapSetting) {
      const match = /lat:([^,]+),lng:([^}]+)/.exec(mapSetting);
      if (match) {
        setMapCoordinates([parseFloat(match[1]), parseFloat(match[2])]);
      }
    }
    setZoom(zoomSetting ? parseInt(zoomSetting) : 11);
  }, [clientSettings]);

  // Initial online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Data fetch handler
  const fetchData = useCallback(async () => {
    if (!query?.clientId || !query?.vehicleReg) return;
    const clientVehicleData = await getVehicleDataByClientId(
      `data?user=${query.clientId}&vehicleReg=${query.vehicleReg}`
    );
    if (clientVehicleData?.data) {
      const uniqueData = uniqueDataByIMEIAndLatestTimestamp(
        clientVehicleData.data
      );
    //   setUpdatedData(uniqueData);
      carData.current = uniqueData;
    }
    if (!clientSettings.length) {
      setClientSettings(query?.clientSetting || []);
    }
  }, [query, clientSettings.length]);

  // Auto refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
      checkExpiry();
    }, 60000);
    return () => clearInterval(interval);
  }, [isOnline,
        query?.clientId]);

  // Socket live updates
  useEffect(() => {
    if (!isOnline || !query?.clientId) return;
    socket.io.opts.query = { clientId: query.clientId };
    socket.connect();

    socket.on("message", (data: { cacheList: VehicleData[] } | null) => {
      if (!data) return;
      const uniqueData = uniqueDataByIMEIAndLatestTimestamp(data.cacheList);
      const matchingVehicles = uniqueData.filter(
        (vehicle) => query.vehicleReg === vehicle.vehicleReg
      );
    //   setUpdatedData(matchingVehicles);
      carData.current = matchingVehicles;
    });

    return () => socket.disconnect();
  }, [isOnline, query?.clientId, query?.vehicleReg]);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-green px-5 py-2 sticky top-0 z-10">
        <Image src={logo} alt="Logo" className="h-10 w-auto lg:h-14" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 text-white text-center lg:text-left">
          <p className="font-popins text-lg lg:text-2xl">{query?.clientName}</p>
           <div className="text-lg lg:text-xl">

          <BlinkingTime
            timezone={query?.timezone}
            dateFormat="DD MMM"
            timeFormat="hh:mm:ss A"
          />
           </div>
        </div>
      </nav>

      {/* Map */}
      <div className="flex-1 overflow-hidden">
        {carData.current.length !== 0 && (
          <LiveMap
            carData={carData.current}
            clientSettings={clientSettings}
            selectedVehicle={selectedVehicle}
            setIsActiveColor={setIsActiveColor}
            setSelectedVehicle={setSelectedVehicle}
            showAllVehicles={false}
            setunselectVehicles={setUnselectVehicles}
            unselectVehicles={unselectVehicles}
            mapCoordinates={mapCoordinates}
            zoom={zoom}
            setShowZones={setShowZones}
            showZones={showZones}
          />
        )}
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

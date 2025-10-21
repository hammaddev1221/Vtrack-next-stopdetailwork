"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { VehicleData } from "@/types/vehicle";
import { ClientSettings } from "@/types/clientSettings";
import logo from "@/../public/Images/logo.png";
import { getVehicleDataByClientId, TravelHistoryByBucketV2 } from "@/utils/API_CALLS";
import { socket } from "@/utils/socket";
import { useSearchParams } from "next/navigation";
import { decodeShareToken } from "@/utils/decodeShareTokens";
import Image from "next/image";
import dynamic from "next/dynamic";
import BlinkingTime from "@/components/General/BlinkingTime";
import { TravelHistoryData } from "@/types/TripsByBucket";
import { calculateZoomCenter } from "@/utils/JourneyReplayFunctions";
import moment from "moment-timezone";
import stopcar from "../../../public/Stop_Car.svg";
import movecar from "../../../public/Move_Car.svg";
import pauscar from "../../../public/Pause_Car.svg"
const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      Loading map...
    </div>
  ),
});

export default function TrackVehicle() {
  const { data: session } = useSession();
  const carData = useRef<VehicleData[]>([]);
  const searchParams = useSearchParams();
  const qparams = searchParams.get("q");
  const [carstop, setcarstop] = useState("")
  const [carpause, setcarpause] = useState("")
  const [carmove, setcarmove] = useState("")
  // const vehicleReg = searchParams.get("vehicleReg")?.replaceAll("%", " ");

  async function loadSVG(filepath: string) {
    const response = await fetch(filepath);
    return await response.text();
  }

  useEffect(() => {
    async function setdata() {
      setcarstop(await loadSVG(stopcar.src))
      setcarpause(await loadSVG(pauscar.src))
      setcarmove(await loadSVG(movecar.src))
    }
    setdata()
  }, [])

  const [clientSettings, setClientSettings] = useState<ClientSettings[]>([]);
  const [travelHistory, setTravelHistory] = useState<TravelHistoryData[]>([]);
  const [polylineData, setPolylineData] = useState<[number, number][]>([]);
  const [polylinePosition, setPolylinePosition] = useState<any>(null);
  const [zoomToFly, setZoomToFly] = useState(10); const [mapCenterToFly, setMapCenterToFly] = useState<[number, number] | null>(null);
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(10);
  const [query, setQuery] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!qparams) return;
    const data = decodeShareToken(qparams as string);
    if (!data) return;
    setQuery(data);
  }, [qparams]);
  const getTravelHistory = useCallback(async () => {
    if (!session?.accessToken || !query?.lastignitionOn) return;

    try {
      const res = await TravelHistoryByBucketV2({
        token: session.accessToken,
        payload: {
          TimeZone: session?.timezone || "",
          VehicleReg: query?.vehicleReg,
          clientId: session?.clientId || "",
          fromDateTime: moment(query?.lastignitionOn, "DD MMM YYYY hh:mm:ss A")
            .format("YYYY-MM-DDTHH:mm:ss.SSS"),
          toDateTime: moment(new Date()).tz(session?.timezone).format("YYYY-MM-DDTHH:mm:ss.SSS"),
          period: "today",
          unit: session?.unit || "",
          fuelTankCapacity: 0
        },
      });

      if (res.data?.length > 0) {
        setTravelHistory(res.data);
      }
    } catch (error) {
      console.error("Error fetching travel history:", error);
    }
  }, [query, session]);

  useEffect(() => {
    if (query?.lastignitionOn) getTravelHistory();
  }, [query, getTravelHistory]);

  useEffect(() => {
    if (travelHistory.length > 0) {
      setPolylineData(travelHistory.map((i) => [i.lat, i.lng]));
      const { zoomlevel, centerLat, centerLng } = calculateZoomCenter(travelHistory);
      setMapCenterToFly([centerLat, centerLng]);
      setZoomToFly(zoomlevel);
    }
  }, [travelHistory]);
  useEffect(() => {
    if (!clientSettings.length) return;
    const mapSetting = clientSettings.find((el) => el.PropertDesc === "Map")?.PropertyValue;
    const zoomSetting = clientSettings.find((el) => el.PropertDesc === "Zoom")?.PropertyValue;

    if (mapSetting) {
      const match = /lat:([^,]+),lng:([^}]+)/.exec(mapSetting);
      if (match) {
        // Store as simple tuple, not Leaflet object
        setMapCoordinates([parseFloat(match[1]), parseFloat(match[2])]);
      }
    }
    setZoom(zoomSetting ? parseInt(zoomSetting) : 11);
  }, [clientSettings]);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
  }, []);


  const fetchData = useCallback(async () => {
    if (!query?.clientId || !query?.vehicleReg) return;

    try {
      const clientVehicleData = await getVehicleDataByClientId(
        `data?user=${query?.clientId}&vehicleReg=${query?.vehicleReg}`
      );

      if (clientVehicleData?.data) {
        const uniqueData = uniqueDataByIMEIAndLatestTimestamp(clientVehicleData.data);
        carData.current = uniqueData;

        if (uniqueData.length > 0) {
          setTravelHistory((prev) => [
            ...prev,
            {
              lat: uniqueData[0].gps.latitude,
              lng: uniqueData[0].gps.longitude,
              driverName: uniqueData[0].DriverName,
              date: uniqueData[0].timestamp,
              speed: (uniqueData[0].gps as any).speedWithUnitDesc,
              address: (uniqueData[0] as any).address,
            } as TravelHistoryData,
          ]);
        }
      }

      if (!clientSettings.length && query?.clientSetting) {
        setClientSettings(query.clientSetting);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  }, [query, clientSettings.length]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);
  useEffect(() => {
    if (!socket || !isOnline || !query?.clientId) return;
    socket.io.opts.query = { clientId: query?.clientId };
    socket.connect();
    const handleMessage = (data: { cacheList: VehicleData[] }) => {
      if (!data) return;
      const uniqueData = uniqueDataByIMEIAndLatestTimestamp(data.cacheList);
      carData.current = uniqueData.filter((v) => v.vehicleReg === query?.vehicleReg);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
      socket.disconnect();
    };
  }, [socket, isOnline, query?.clientId, query?.vehicleReg]);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      {/* ✅ Navbar */}
      <nav className="flex items-center justify-between bg-green px-5 py-2 sticky top-0 z-10">
        <Image src={logo} alt="Logo" className="h-10 w-auto lg:h-14" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 text-white">
          <p className="font-popins text-lg lg:text-2xl">{session?.clientName}</p>
          <BlinkingTime timezone={session?.timezone} dateFormat="DD MMM" timeFormat="hh:mm:ss A" />
        </div>
      </nav>

      {/* ✅ Map */}
      <div className="flex-1 overflow-hidden relative">
        {(travelHistory.length > 0 || carData.current.length > 0) ? (
          <>
            <LiveMap
              travelHistoryResponse={travelHistory}
              polylineData={polylineData}
              polylinePosition={polylinePosition}
              setPolylinePosition={setPolylinePosition}
              carData={carData.current}
              clientSettings={clientSettings}
              mapCenterToFly={mapCenterToFly}
              zoomToFly={zoomToFly}
              mapCoordinates={mapCoordinates}
              zoom={zoom}
              session={session}
              carstop={carstop}
              carpause={carpause}
              carmove={carmove}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map and travel history...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
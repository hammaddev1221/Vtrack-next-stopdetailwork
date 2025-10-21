"use client";
import React, { useEffect, useRef, useState } from "react";

// Force dynamic rendering to avoid SSR issues with Leaflet
export const dynamic = 'force-dynamic';
import dynamicImport from "next/dynamic";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { VehicleData } from "@/types/vehicle";
import { ClientSettings } from "@/types/clientSettings";
// import L, { LatLng } from "leaflet"; // Moved to dynamic import to fix SSR
import {
  getVehicleDataByClientId,
  getAllVehicleByUserId,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { socket } from "@/utils/socket";
import countCars from "@/utils/countCars";
import LiveSidebar from "@/components/LiveTracking/LiveSidebar";
import { useSearchParams } from "next/navigation";
const LiveMap = dynamicImport(() => import("@/components/LiveTracking/LiveMap"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading map...</div>,
});

const LiveTracking = () => {
  let { data: session } = useSession();
  if(!session){
    session=  JSON.parse(localStorage.getItem("user")||"{}")
  }
  const carData = useRef<VehicleData[]>([]);
  const [updatedData, setUpdateData] = useState<VehicleData[]>([]);
  const searchParams = useSearchParams();
  const vehicleReg = searchParams.get("vehicleReg")?.replaceAll("%", " ");

  const [clientSettings, setClientSettings] = useState<ClientSettings[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [activeColor, setIsActiveColor] = useState<any>("");
  const [showAllVehicles, setshowAllVehicles] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  // const [showZonePopUp, setShowZonePopUp] = useState(true);
  const [isFirstTimeFetchedFromGraphQL, setIsFirstTimeFetchedFromGraphQL] =
    useState(false);
  // const [lastDataReceivedTimestamp, setLastDataReceivedTimestamp] = useState(
  //   new Date()
  // );
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(
    { vehicleReg } || null
  );
  // const [selectedOdoVehicle, setSelectedOdoVehicle] = useState(
  //   null
  // );
  const [userVehicle, setuserVehicle] = useState([]);
  const [unselectVehicles, setunselectVehicles] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [showZones, setShowZones] = useState(false);

  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(
    null
  );



  const fullparams = searchParams.get("screen");


  const clientMapSettings = clientSettings?.filter(
    (el) => el?.PropertDesc === "Map"
  )[0]?.PropertyValue;
  const clientZoomSettings = clientSettings?.filter(
    (el) => el?.PropertDesc === "Zoom"
  )[0]?.PropertyValue;
  useEffect(() => {
    const regex = /lat:([^,]+),lng:([^}]+)/;
    if (clientMapSettings) {
      const match = clientMapSettings.match(regex);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        setMapCoordinates([lat, lng]);
      }
    }
    let zoomLevel = clientZoomSettings ? parseInt(clientZoomSettings) : 11;
    setZoom(zoomLevel);
  }, [clientMapSettings]);
  // This useEffect is responsible for checking internet connection in the browser.
  useEffect(() => {
    setIsOnline(navigator.onLine);
  }, []);

  useEffect(() => {
    async function userVehicles() {
      if (session && session?.userRole === "Controller") {
        const data = await getAllVehicleByUserId({
          token: session?.accessToken,
          userId: session?.userId,
        });
        setuserVehicle(data.data);
      }
    }
    userVehicles();
  }, []);
  const role = session?.userRole;
  const fetchTimeoutGraphQL = 60 * 1000; //60 seconds

  useEffect(() => {
    async function dataFetchHandler() {
      if (session?.clientId) {
        const clientVehicleData = await getVehicleDataByClientId(
          session?.clientId
        );

        if (clientVehicleData?.data?.Value) {
          let parsedData = JSON.parse(
            clientVehicleData?.data?.Value
          )?.cacheList;

          let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);

          let matchingVehicles;
          if (role === "Controller") {
            let vehicleIds = userVehicle.map((item: any) => item._id);
            // Filter carData.current based on vehicleIds
            matchingVehicles = uniqueData.filter((vehicle) =>
              vehicleIds.includes(vehicle.vehicleId)
            );

            setUpdateData(matchingVehicles)

            carData.current = matchingVehicles;
          } else {

            setUpdateData(uniqueData)
            carData.current = uniqueData;
          }


        }
        // const clientSettingData = await getClientSettingByClinetIdAndToken({
        //   token: session?.accessToken,
        //   clientId: session?.clientId,
        // });
        if (clientSettings.length == 0) {
          setClientSettings(session?.clientSetting);
        }
      }
    }
    dataFetchHandler();

  }, [isFirstTimeFetchedFromGraphQL, userVehicle
  ]);

  useEffect(() => {
    let interval = setInterval(() => {
      setIsFirstTimeFetchedFromGraphQL(prev => !prev)
    }, fetchTimeoutGraphQL); // Runs every fetchTimeoutGraphQL seconds

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, [isOnline,
    session?.clientId, userVehicle])

  // This useEffect is responsible for getting the data from socket and updating it into the state.
  useEffect(() => {
    if (isOnline && session?.clientId) {
      try {
        socket.io.opts.query = { clientId: session?.clientId };
        socket.connect();
        socket.on(
          "message",
          async (data: { cacheList: VehicleData[] } | null | undefined) => {
            if (data === null || data === undefined) {
              return;
            }

            const uniqueData = uniqueDataByIMEIAndLatestTimestamp(
              data?.cacheList
            );

            let matchingVehicles;
            if (role === "Controller") {
              let vehicleIds = userVehicle.map((item: any) => item._id);
              // Filter carData.current based on vehicleIds
              matchingVehicles = uniqueData.filter((vehicle) =>
                vehicleIds.includes(vehicle.vehicleId)
              );
              setUpdateData(matchingVehicles)


              carData.current = matchingVehicles;
            } else {
              setUpdateData(uniqueData)

              carData.current = uniqueData;
            }
            // carData.current = uniqueData;

            // setLastDataReceivedTimestamp(new Date());
          }
        );
      } catch (err) {

      }
    }
    if (!isOnline) {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isOnline, session?.clientId, userVehicle]);
  useEffect(() => {
    carData.current = updatedData
  }, [carData.current])
  const { countParked, countMoving, countPause } = countCars(carData?.current);

  return (
    <>
      {/*  <div className="grid lg:grid-cols-6 sm:grid-cols-6 md:grid-cols-6 grid-cols-1"> */}
      <div className={`${fullparams ? "grid lg:grid-cols-6 sm:grid-cols-6 md:grid-cols-6 grid-cols-1" : "grid lg:grid-cols-5 sm:grid-cols-5 md:grid-cols-5 grid-cols-1"}`}>
        <LiveSidebar
          carData={carData.current}
          countMoving={countMoving}
          countPause={countPause}
          countParked={countParked}
          setSelectedVehicle={setSelectedVehicle}
          activeColor={activeColor}
          setIsActiveColor={setIsActiveColor}
          setshowAllVehicles={setshowAllVehicles}
          setunselectVehicles={setunselectVehicles}
          // unselectVehicles={unselectVehicles}
          setZoom={setZoom}
          setShowZones={setShowZones}
          // setShowZonePopUp={setShowZonePopUp}
          // setSelectedOdoVehicle={setSelectedOdoVehicle}
          // selectedOdoVehicle={selectedOdoVehicle}
          // setPosition={setPosition}
        />
        {carData?.current?.length !== 0 && (
          <LiveMap
            carData={carData?.current}
            clientSettings={clientSettings}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            setIsActiveColor={setIsActiveColor}
            showAllVehicles={showAllVehicles}
            setunselectVehicles={setunselectVehicles}
            unselectVehicles={unselectVehicles}
            mapCoordinates={mapCoordinates}
            zoom={zoom}
            setShowZones={setShowZones}
            showZones={showZones}
            // selectedOdoVehicle={selectedOdoVehicle}
            position={position}
          />
        )}
      </div>
    </>
  );
};

export default LiveTracking;

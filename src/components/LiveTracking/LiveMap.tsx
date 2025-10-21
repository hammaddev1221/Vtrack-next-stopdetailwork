"use client";
import "./index.css";
import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { VehicleData } from "@/types/vehicle";
import LiveCars from "./LiveCars";
import { zonelistType } from "@/types/zoneType";
import dynamic from "next/dynamic";
import { ClientSettings } from "@/types/clientSettings";
import { useSession } from "next-auth/react";
import { fetchZone } from "@/lib/slices/zoneSlice";
import { useSelector } from "react-redux";
// import { LayersControl, Marker, Popup, Tooltip } from "react-leaflet"; // Moved to dynamic import
import L, { LatLng } from "leaflet"; // Moved to dynamic import
import { useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);

const Polygon = dynamic(
  () => import("react-leaflet/Polygon").then((module) => module.Polygon),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet/Circle").then((module) => module.Circle),
  { ssr: false }
);

// Additional dynamic imports for components that were causing SSR issues
const LayersControl = dynamic(
  () => import("react-leaflet").then((module) => module.LayersControl),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false }
);

const Tooltip = dynamic(
  () => import("react-leaflet").then((module) => module.Tooltip),
  { ssr: false }
);
const BaseLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl.BaseLayer),
  { ssr: false }
);

const DynamicCarMap = ({
  carData,
  clientSettings,
  selectedVehicle,
  setIsActiveColor,
  setSelectedVehicle,
  showAllVehicles,
  setunselectVehicles,
  unselectVehicles,
  mapCoordinates,
  zoom,
  setShowZones,
  showZones,
}: {
  carData: VehicleData[];
  clientSettings: ClientSettings[];
  selectedVehicle: VehicleData | null; // Make sure it can handle null values
  setIsActiveColor: any;
  setSelectedVehicle: any;
  showAllVehicles: any;
  setunselectVehicles: any;
  unselectVehicles: any;
  mapCoordinates: any;
  zoom: any;
  setShowZones: any;
  showZones: any;
}) => {
  const searchParams = useSearchParams();

  const fullparams = searchParams.get("screen");

  const { data: session } = useSession();
  // const { BaseLayer } = LayersControl;

  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const handleClear = () => {
    setIsActiveColor("");
  };

  const allZones = useSelector((state: any) => state.zone);

  useEffect(() => {
    setZoneList(allZones?.zone);
  }, [allZones]);
  const handleShowZone = () => {
    setShowZones(!showZones);
  };

  return (
    <>
      {/*  <div className="xl:col-span-4 lg:col-span-3  md:col-span-3  sm:col-span-3 col-span-4 main_map"> */}
      <div className={`${fullparams == "full" ? "xl:col-span-4 lg:col-span-4  md:col-span-4  sm:col-span-4 col-span-4" : "xl:col-span-4 lg:col-span-3  md:col-span-3  sm:col-span-3 col-span-4 main_map"}`}>
        <div className="relative" onClick={handleClear}>
          {mapCoordinates !== null && zoom !== null && (
            <MapContainer
              id="maps"
              key={zoom}
              style={{ height: fullparams == "full" ? "100vh" : "" }}
              center={mapCoordinates}
              className="z-0"
              zoom={zoom}
            >
              {session?.livemapType === 'Google' && (
                <LayersControl position="bottomright">
                  <>
                    {/* Google Map Layer */}
                    <BaseLayer checked name="Google Map">
                      <TileLayer
                        url={`https://{s}.googleapis.com/maps/vt?lyrs=m&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        attribution="Google Maps"
                      />
                    </BaseLayer>
                    {/* Google Street View Layer */}
                    <BaseLayer name="Google Maps Street View">
                      <TileLayer
                        url={`https://{s}.googleapis.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        attribution="Street View"
                      />
                    </BaseLayer>
                  </>
                </LayersControl>
              )
              }
              {session?.livemapType !== 'Google' && (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                />
              )
              }
              {/* <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
              /> */}

              {showZones &&
                zoneList.map((singleRecord: any) => {
                  const radius = Number(singleRecord.latlngCordinates);
                  const isRestrictedArea =
                    singleRecord.GeoFenceType === "Restricted-Area"; // && session?.clickToCall === true;
                  const isCityArea = singleRecord.GeoFenceType === "City-Area"; // && session?.clickToCall === true;

                  return singleRecord.zoneType === "Circle" &&
                    !isNaN(radius) ? (
                    <Circle
                      key={singleRecord.zoneName}
                      center={[
                        Number(singleRecord.centerPoints.split(",")[0]),
                        Number(singleRecord.centerPoints.split(",")[1]),
                      ]}
                      radius={radius}
                      color={
                        isCityArea ? "green" : isRestrictedArea ? "red" : "blue"
                      }
                    >
                      {/* <Tooltip>{singleRecord.zoneName}</Tooltip> */}
                      <Popup>{singleRecord.zoneName}</Popup>
                    </Circle>
                  ) : (
                    <Polygon
                      key={singleRecord.zoneName}
                      positions={JSON.parse(singleRecord.latlngCordinates)}
                      color={
                        isCityArea ? "green" : isRestrictedArea ? "red" : "blue"
                      }
                    >
                      {/* <Tooltip>{singleRecord.zoneName}</Tooltip> */}
                      <Popup>{singleRecord.zoneName}</Popup>
                    </Polygon>
                  );
                })}
              <button
                className="bg-[#00B56C] text-white"
                onClick={handleShowZone}
              ></button>

              <LiveCars
                carData={carData}
                clientSettings={clientSettings}
                selectedVehicle={selectedVehicle}
                setSelectedVehicle={setSelectedVehicle}
                showAllVehicles={showAllVehicles}
                setunselectVehicles={setunselectVehicles}
                unselectVehicles={unselectVehicles}
                // center={mapCoordinates}
                // zoom={zoom}
              />
            </MapContainer>
          )}
          {zoneList !== null && zoneList?.length > 0 && (
            <div
              className="grid grid-cols-1 absolute lg:top-10 xl:top-10 md:top-10 top-5 right-10 bg-bgLight py-2 px-2"
              style={{
                borderRadius: "10px",
                borderColor: "green",
                borderWidth: "3px",
                borderStyle: "solid",
              }}
            >
              <div className="col-span-1" style={{ color: "green" }}>
                <input
                  type="checkbox"
                  onClick={() => {
                    setShowZones(!showZones);
                  }}
                  checked={showZones}
                  className="mx-2 mt-1"
                  style={{ accentColor: "green" }}
                />
                <button className="text-labelColor font-popins text-sm font-bold">
                  Show Zones
                </button>
              </div>

              {/* Three rows with colored dots and text meaning */}
              {showZones && (
                <>
                  <div className="flex items-center mt-2 ml-2">
                    <div className="lg:col-span-1">
                      <svg
                        className={`h-6 w-3 text-blue mr-2`}
                        viewBox="0 0 24 24"
                        fill="blue"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <span className="text-sm text-labelColor">On/Off-site</span>
                  </div>
                  <div className="flex items-center mt-2 ml-2">
                    <div className="lg:col-span-1">
                      <svg
                        className={`h-6 w-3 text-red mr-2`}
                        viewBox="0 0 24 24"
                        fill="red"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <span className="text-sm text-labelColor">Restricted</span>
                  </div>
                  <div className="flex items-center mt-2 ml-2">
                    <div className="lg:col-span-1">
                      <svg
                        className={`h-6 w-3 text-green mr-2`}
                        viewBox="0 0 24 24"
                        fill="green"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <span className="text-sm text-labelColor">City Area</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DynamicCarMap;

"use client";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { zonelistType } from "@/types/zoneType";
import { ZoneFindById, postZoneDataByClientId } from "@/utils/API_CALLS";
import L, { LatLngTuple } from "leaflet"; // Moved to dynamic import
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import { Button, MenuItem, Select } from "@mui/material";
import EditRoadIcon from "@mui/icons-material/EditRoad";
import { fetchZone } from "@/lib/slices/zoneSlice";
import { UseSelector, useDispatch } from "react-redux";
import "./editZone.css";
// import { LayersControl } from "react-leaflet"; // Moved to dynamic import

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);
const FeatureGroup = dynamic(
  () => import("react-leaflet").then((module) => module.FeatureGroup),
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
const EditControl = dynamic(
  () => import("react-leaflet-draw").then((module) => module.EditControl),
  { ssr: false }
);

const LayersControl = dynamic(
  () => import("react-leaflet").then((module) => module.LayersControl),
  { ssr: false }
);

const BaseLayer = dynamic(
  () => import("react-leaflet").then((module) => module.LayersControl.BaseLayer),
  { ssr: false }
);

export default function EditZoneComp() {
  const isBrowser = typeof window !== "undefined";
  const { data: session } = useSession();
  // const { BaseLayer } = LayersControl; // Will be handled dynamically
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [zoneDataById, setZoneDataById] = useState<zonelistType | null>(null);
  const [polygondataById, setPolygondataById] = useState<[number, number][]>(
    []
  );
  const [circleDataById, setCircleDataById] = useState<{
    radius: string;
  } | null>(null);
  const [drawShape, setDrawShape] = useState<boolean>(false);
  const [shapeType, setShapeType] = useState<"Polygon" | "Circle">();
  const [mapcenter, setMapcenter] = useState<LatLngTuple | null>(null);
  const [polygondata, setPolygondata] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [circleData, setCircleData] = useState({
    latlng: "",
    radius: "",
  });
  const [Form, setForm] = useState({
    GeoFenceType: "",
    centerPoints: "",
    id: "",
    zoneName: "",
    zoneShortName: "",
    zoneType: "",
    latlngCordinates: "",
  });

  const router = useRouter();
  const dispatch = useDispatch();
  if (session?.userRole === "Controller") {
    router.push("/signin");
    return null;
  }
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchZoneDataById = async () => {
        try {
          if (id && session) {
            const data = await ZoneFindById({
              token: session?.accessToken,
              id: id,
            });

            setZoneDataById(data);
          }
        } catch (error) {
          console.error("Error fetching zone data:", error);
        }
      };

      fetchZoneDataById();
    }
  }, []);
  function calculateZoomLevel(circleRadius: number) {
    let zoomLevel = 20;
    const radiusStep = 230;

    while (circleRadius > 0 && zoomLevel > 8) {
      circleRadius -= radiusStep;
      zoomLevel--;
    }

    return Math.max(zoomLevel, 8);
  }

  useEffect(() => {
    if (zoneDataById?.zoneType === "Polygon") {
      const latdata = zoneDataById?.latlngCordinates;
      setShapeType("Polygon");
      if (latdata) {
        const latlngdata = JSON.parse(latdata);
        const formattedCoordinates = latlngdata?.map(
          (coord: { lat: number; lng: number }) => [coord.lat, coord.lng]
        );
        setPolygondataById(formattedCoordinates);
        if (formattedCoordinates) {
          const lats = formattedCoordinates.map((coord: any[]) => coord[0]);
          const lngs = formattedCoordinates.map((coord: any[]) => coord[1]);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const latDistance = maxLat - minLat;
          const lngDistance = maxLng - minLng;
          const latZoom = Math.floor(Math.log2(360 / (0.5 * latDistance)));
          const lngZoom = Math.floor(Math.log2(360 / (0.5 * lngDistance)));

          setZoom(Math.min(latZoom, lngZoom));

          setMapcenter([
            ((minLat + maxLat) / 2) as number,
            ((minLng + maxLng) / 2) as number,
          ]);
        }
      }
    } else if (zoneDataById?.zoneType === "Circle") {
      let circledata = Number(zoneDataById?.latlngCordinates);
      const newcenterPoints = zoneDataById?.centerPoints;
      const latlng = newcenterPoints?.split(",").map(Number);

      const integerPart = Math.floor(circledata);
      const zoomLevel = calculateZoomLevel(integerPart);

      setZoom(Math.min(Math.max(Math.floor(zoomLevel), 2), 16));

      if (latlng && latlng.length === 2) {
        setMapcenter([latlng[0], latlng[1]]);
        setCircleDataById({ radius: circledata.toString() });
        setShapeType("Circle");
      }
    }

    const formData = {
      GeoFenceType: zoneDataById?.GeoFenceType || "",
      centerPoints: zoneDataById?.centerPoints || "",
      id: zoneDataById?.id || "",
      zoneName: zoneDataById?.zoneName || "",
      zoneShortName: zoneDataById?.zoneShortName || "",
      zoneType: zoneDataById?.zoneType || "",
      latlngCordinates: zoneDataById?.latlngCordinates || "",
    };
    setForm(formData);
  }, [zoneDataById]);

  useEffect(() => {
    if (polygondata.length > 0) {
      setForm({
        ...Form,
        latlngCordinates: JSON.stringify(
          polygondata.map(({ latitude, longitude }) => ({
            lat: latitude,
            lng: longitude,
          }))
        ),
        centerPoints: "",
        zoneType: "Polygon",
      });
    } else if (circleData.radius) {
      setForm({
        ...Form,
        latlngCordinates: circleData.radius.toString(),
        centerPoints: circleData.latlng,
        zoneType: "Circle",
      });
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        latlngCordinates: "",
        centerPoints: "",
      }));
    }
  }, [polygondata, circleData]);
  const handlePolygonSave = (coordinates: [number, number][]) => {
    const zoneCoords = coordinates.slice(0, -1).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    if (drawShape == true) {
      const formattedCoordinate: [number, number][] = zoneCoords.map(
        (coord: { latitude: number; longitude: number }) => [
          coord.latitude,
          coord.longitude,
        ]
      );

      setPolygondataById(formattedCoordinate);
      setPolygondata(zoneCoords);
      setDrawShape(!drawShape);
    }
  };

  const handleCircleSave = (latlng: any, radius: string) => {
    const formatCenterPoints = (
      latitude: number,
      longitude: number
    ): string => {
      return `${latitude},${longitude}`;
    };

    let circlePoint = formatCenterPoints(latlng.lat, latlng.lng);

    const newlatlng = circlePoint?.split(",").map(Number);

    if (drawShape == true || drawShape == false) {
      setCircleDataById({ radius: radius });
      const updateCircleData = (newLatlng: string, newRadius: string): void => {
        setCircleData({
          latlng: newLatlng,
          radius: newRadius,
        });
      };
      updateCircleData(circlePoint, radius);
      setMapcenter([newlatlng[0], newlatlng[1]]);
    }
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...Form, [name]: value });
  };
  
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!Form.latlngCordinates) {
      toast.error("Please Draw a Zone");
      return;
    } else if (polygondataById.length == 0 && circleDataById?.radius == null) {
      toast.error("Please Draw a Zone");
      return;
    }
    try {
      if (session) {
        const newformdata = {
          ...Form,
          clientId: session?.clientId,
        };

        const response = await toast.promise(
          postZoneDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata,
          }),
          {
            loading: "Saving data...",
            success: "Data saved successfully!",
            error: "Error saving data. Please try again.",
          },
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C",
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE",
              },
            },
            error: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE",
              },
            },
          }
        );

        if (response.id !== null) {
          setTimeout(() => {
            router.push("/Zone");
          }, 2000);
        }
        dispatch(
          fetchZone({
            clientId: session?.clientId,
            token: session?.accessToken,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  const handleEdited = (e: any) => {
    const layer = e.layers;
    layer.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        const coordinates: [number, number][] = (
          layer.getLatLngs()[0] as L.LatLng[]
        ).map((latLng: L.LatLng) => [latLng.lat, latLng.lng]);
        const zoneCoords = coordinates.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setPolygondata(zoneCoords);
      } else if (layer instanceof L.Circle) {
        const latlng: L.LatLng = layer.getLatLng();
        const radius: number = layer.getRadius();
        handleCircleSave(latlng, radius.toString());
        setDrawShape(true);
      }
    });
  };

  const handleredraw = (e: any) => {
    setDrawShape(true);
    if (polygondataById.length > 0) {
      setDrawShape(true);
      setPolygondataById([]);
      setPolygondata([]);
      setForm({ ...Form, zoneType: "" });
    } else if (circleDataById !== null) {
      setCircleDataById(null);
      setCircleData({ radius: "", latlng: "" });
      setForm({ ...Form, zoneType: "" });
      setDrawShape(true);
    } else {
      setDrawShape(true);
    }
  };
  
  const handleCreated = (e: any) => {
    const createdLayer = e.layer;
    const type = e.layerType;

    if (type === "polygon") {
      setShapeType("Polygon");

      const coordinates = e.layer
        .toGeoJSON()
        .geometry.coordinates[0].map((coord: any[]) => [coord[1], coord[0]]);
      handlePolygonSave(coordinates);

      e.target.removeLayer(e.layer);
    } else if (type === "circle") {
      setShapeType("Circle");
      const latlng = e.layer.getLatLng();
      const radius = e.layer.getRadius();
      handleCircleSave(latlng, radius);
      e.target.removeLayer(createdLayer);
    }
  };

  return (
    <>
      <div className="  shadow-lg bg-bgLight  border-t text-white edit_zone_main  ">
        <p className="bg-green px-4 py-1 text-black text-center text-2xl text-white font-bold edit_zone_text ">
          Edit Zone
        </p>
        <div className="grid lg:grid-cols-6 sm:grid-cols-5 md:grid-cols-6 grid-cols-1  pt-8">
          <div className=" xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-6 col-span-4 bg-gray-200 mx-5 edit_zone_side_bar">
            <form onSubmit={handleSave}>
              <label className="text-md font-popins text-black font-semibold">
                <span className="text-red  font-extraboldbold">*</span> Please
                Enter Zone Name:{" "}
              </label>
              <input
                onChange={handleChange}
                type="text"
                name="zoneName"
                value={Form.zoneName}
                className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
                placeholder="Enter Zone Name"
                required
              />
              <label className="text-md font-popins text-black font-semibold">
                <span className="text-red font-extraboldbold">*</span> Geofence:{" "}
              </label>

              {session?.clickToCall === true ? (
                <Select
                  onChange={handleChange}
                  value={Form?.GeoFenceType}
                  id="select_box_journey"
                  className="h-8 text-sm text-gray  w-full  outline-green hover:border-green"
                  required
                  name="GeoFenceType"
                >
                  <MenuItem className="hover_select" value="On-Site">
                    On-Site
                  </MenuItem>
                  <MenuItem className="hover_select" value="Off-Site">
                    Off-Site
                  </MenuItem>
                  <MenuItem className="hover_select" value="City-Area">
                    City-Area
                  </MenuItem>
                  <MenuItem className="hover_select" value="Restricted-Area">
                    Restricted-Area
                  </MenuItem>
                </Select>
              ) : (
                <Select
                  onChange={handleChange}
                  value={Form?.GeoFenceType}
                  id="select_box_journey"
                  className="h-8 text-sm text-gray  w-full  outline-green hover:border-green"
                  required
                  name="GeoFenceType"
                >
                  <MenuItem className="hover_select" value="On-Site">
                    On-Site
                  </MenuItem>
                  <MenuItem className="hover_select" value="Off-Site">
                    Off-Site
                  </MenuItem>
                </Select>
              )}
              <br></br>
              <br></br>
              <label className="text-md font-popins text-black font-semibold">
                <span className="text-red font-extraboldbold">*</span> Zone
                Short Name:{" "}
              </label>
              <input
                aria-required
                onChange={handleChange}
                type="text"
                name="zoneShortName"
                value={Form?.zoneShortName}
                className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
                placeholder="Enter Zone Name "
                required
              />
              <div className="flex justify-center">
                <div
                  className="grid grid-cols-12  
                "
                >
                  <div className="lg:col-span-5 md:col-span-5 sm:col-span-2 col-span-4 ">
                    {/* <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-1"></div>
                      <div className="col-span-3 ">
                        <svg
                          className="h-10 py-2  w-full text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                      </div>
                      <div className="col-span-8">
                        <button
                          className="text-white font-popins font-bold h-10 bg-[#00B56C] "
                          type="submit"
                        >
                          Update
                        </button>
                      </div>
                    </div> */}
                    <Button
                      className=" bg-green shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none h-10 "
                      variant="outlined"
                      type="submit"
                      // onClick={handleClear}
                      style={{
                        fontSize: "16px",
                        backgroundColor: "#00b56c",
                        color: "white",
                        border: "none",
                      }}
                      startIcon={
                        <span style={{ fontWeight: "600" }}>
                          <SaveIcon className="-mt-1" />
                        </span>
                      }
                    >
                      <b>U</b>{" "}
                      <span style={{ textTransform: "lowercase" }}>
                        <b>pdate</b>
                      </span>
                    </Button>
                  </div>
                  <div className="col-span-1"></div>
                  <div className="lg:col-span-5 md:col-span-5 sm:col-span-2 col-span-4 ">
                    {/* <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-1"></div>
                      <div className="col-span-2 ">
                        <ClearIcon className="mt-2 font-bold" />
                      </div>
                      <div className="col-span-8 bg-red  rounded-md">
                        <Button
                          className="text-white font-popins font-bold h-10"
                          onClick={() => router.push("/Zone")}
                          style={{
                            color: "white",
                            textTransform: "capitalize",
                          }}
                        >
                          <b> Cancel</b>
                        </Button>
                      </div>
                    </div> */}
                    <Button
                      className=" bg-red shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-red border-none hover:border-none h-10 "
                      variant="outlined"
                      onClick={() => router.push("/Zone")}
                      style={{
                        fontSize: "16px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                      }}
                      startIcon={
                        <span style={{ fontWeight: "600" }}>
                          <ClearIcon className="-mt-1" />
                        </span>
                      }
                    >
                      <b>C</b>{" "}
                      <span style={{ textTransform: "lowercase" }}>
                        <b>ancel</b>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
              <br></br>
            </form>
          </div>

          <div className="xl:col-span-5 lg:col-span-4 md:col-span-4 sm:col-span-5 col-span-4 mx-3 edit-zone_map_child">
            <div className="edit_zone_map_text">
              <label className="text-md font-popins text-black font-semibold">
                please enter text to search{" "}
              </label>
              <input
                type="text"
                className="   block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
                placeholder="Search"
                required
              />
            </div>
            <Button
              className=" bg-green shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none h-10 "
              variant="outlined"
              onClick={handleredraw}
              style={{
                fontSize: "16px",
                backgroundColor: "#00b56c",
                color: "white",
                border: "none",
              }}
              startIcon={
                <span style={{ fontWeight: "600" }}>
                  <EditRoadIcon className="-mt-1" />
                </span>
              }
            >
              <b>R</b>{" "}
              <span style={{ textTransform: "lowercase" }}>
                <b>edraw</b>
              </span>
            </Button>
            {/* <div
              className="grid lg:grid-cols-3 grid-cols-3  bg-green lg:w-28 md:w-28 sm:w-28
            w-32
              rounded-md shadow-md  hover:shadow-gray transition duration-500 h-10 redraw_btn"
     
            >
              <div className="col-span-1">
                <svg
                  className="h-10 py-2 w-full text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div className="col-span-2">
                <button
                  className="text-white font-popins font-bold pt-2    px-2  "
                  type="submit"
                  onClick={handleredraw}
                >
                  Redraw
                </button>
              </div>
            </div> */}

            <div className="flex justify-start"></div>
            <div className="lg:col-span-5  md:col-span-4  sm:col-span-5 col-span-4 mx-3">
              <div className="flex justify-start"></div>
              <div className="w-full  mt-4 overflow-hidden">
                {mapcenter !== null && zoom >= 0 && (
                  <MapContainer
                    zoom={zoom}
                    center={mapcenter}
                    className="z-10 edit_zone_map_main"
                  >
                    {/* <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                    /> */}
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
                    {drawShape == false && (
                      <FeatureGroup>
                        <EditControl
                          position="topright"
                          onEdited={handleEdited}
                          onCreated={handleCreated}
                          draw={{
                            polyline: false,
                            polygon: drawShape,
                            circle: drawShape,
                            marker: false,
                            circlemarker: false,
                            rectangle: false,
                          }}
                        />
                        {shapeType === "Polygon" &&
                        polygondataById.length > 0 ? (
                          <>
                            {zoneDataById?.GeoFenceType ===
                              "Restricted-Area" && (
                              <Polygon
                                positions={polygondataById}
                                color="red"
                              />
                            )}
                            {zoneDataById?.GeoFenceType !==
                              "Restricted-Area" && (
                              <Polygon
                                positions={polygondataById}
                                color="#97009c"
                              />
                            )}
                            {zoneDataById?.GeoFenceType === "City-Area" && (
                              <Polygon
                                positions={polygondataById}
                                color="green"
                              />
                            )}
                          </>
                        ) : null}

                        {shapeType === "Circle" &&
                        !isNaN(mapcenter[0]) &&
                        !isNaN(mapcenter[1]) &&
                        !isNaN(Number(circleDataById?.radius)) ? (
                          <>
                            {zoneDataById?.GeoFenceType ===
                              "Restricted-Area" && (
                              <Circle
                                radius={Number(circleDataById?.radius)}
                                center={mapcenter}
                                color="red"
                              />
                            )}
                            {zoneDataById?.GeoFenceType !==
                              "Restricted-Area" && (
                              <Circle
                                radius={Number(circleDataById?.radius)}
                                center={mapcenter}
                                color="#97009c"
                              />
                            )}
                            {zoneDataById?.GeoFenceType === "City-Area" && (
                              <Circle
                                radius={Number(circleDataById?.radius)}
                                center={mapcenter}
                                color="green"
                              />
                            )}
                          </>
                        ) : null}
                      </FeatureGroup>
                    )}
                    {drawShape == true && (
                      <FeatureGroup>
                        <EditControl
                          position="topright"
                          onEdited={handleEdited}
                          onCreated={handleCreated}
                          draw={{
                            polyline: false,
                            polygon: true,
                            circle: true,
                            marker: false,
                            circlemarker: false,
                            rectangle: false,
                          }}
                        />
                        {shapeType === "Polygon" &&
                        polygondataById.length > 0 ? (
                          <Polygon
                            positions={polygondataById}
                            color="#97009c"
                          />
                        ) : null}

                        {shapeType === "Circle" &&
                        !isNaN(mapcenter[0]) &&
                        !isNaN(mapcenter[1]) &&
                        !isNaN(Number(circleDataById?.radius)) ? (
                          <Circle
                            radius={Number(circleDataById?.radius)}
                            center={mapcenter}
                            color="#97009c"
                          />
                        ) : null}
                      </FeatureGroup>
                    )}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
}

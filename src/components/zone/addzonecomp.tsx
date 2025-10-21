"use client";
import React, { useEffect, useRef, useState } from "react";
/* import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css"; */
import dynamic from "next/dynamic"; // Import dynamic from Next.js
import { useSession } from "next-auth/react";
import { ClientSettings } from "@/types/clientSettings";
import {  useMap } from "react-leaflet"; // Moved to dynamic import
import Select from "react-select";
import {
  // getClientSettingByClinetIdAndToken,
  postZoneDataByClientId,
  getSearchAddress
} from "@/utils/API_CALLS";
import L, { LatLngTuple } from "leaflet"; // Moved to dynamic import
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
// import { Polygon } from "react-leaflet/Polygon"; // Moved to dynamic import
// import { Circle } from "react-leaflet/Circle"; // Moved to dynamic import
// import { LayerGroup } from "leaflet"; // Moved to dynamic import
import EditRoadIcon from "@mui/icons-material/EditRoad";
import { Button, MenuItem } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
// import { EditControl } from "react-leaflet-draw"; // Moved to dynamic import
import { fetchZone } from "@/lib/slices/zoneSlice";
import { UseDispatch, useDispatch } from "react-redux";
import "./editZone.css";
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

// Dynamic imports for Leaflet components
const LayersControl = dynamic(
  () => import("react-leaflet").then((module) => module.LayersControl),
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

const BaseLayer = dynamic(
  () => import("react-leaflet").then((module) => module.LayersControl.BaseLayer),
  { ssr: false }
);

export default function AddZoneComp() {
  const { data: session } = useSession();
  // const { BaseLayer } = LayersControl; // Will be handled dynamically
  const [polygondataById, setPolygondataById] = useState<[number, number][]>(
    []
  );
  const [circleDataById, setCircleDataById] = useState<{
    radius: string;
  } | null>(null);

  const [drawShape, setDrawShape] = useState<boolean>(true);
  const [shapeType, setShapeType] = useState<"Polygon" | "Circle">();
  const [mapcenter, setMapcenter] = useState<LatLngTuple | null>(null);
  const [selectLatLng, setSelectLatLng] = useState<any>("");
  const [polygondata, setPolygondata] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [circleData, setCircleData] = useState({
    latlng: "",
    radius: ""
  });

  const [clientsetting, setClientsetting] = useState<ClientSettings[] | null>(
    null
  );
  const [Form, setForm] = useState({
    centerPoints: "",
    id: "",
    zoneName: "",
    zoneShortName: "",
    zoneType: "",
    latlngCordinates: "",
    GeoFenceType: ""
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const router = useRouter();
  if (session?.userRole === "Controller") {
    router.push("/signin");
    return null;
  }
  const dispatch = useDispatch();
  useEffect(() => {
    // if (typeof window !== "undefined") {
    // }
    (async function () {
      if (session) {
        // const clientSettingData = await getClientSettingByClinetIdAndToken({
        //   token: session?.accessToken,
        //   clientId: session?.clientId,
        // });

        if (session) {
          //   const centervalue = await clientSettingData?.[0].PropertyValue;
          const mapObject = session?.clientSetting.find(
            (obj: { PropertDesc: string }) => obj.PropertDesc === "Map"
          );

          // Get the PropertyValue from the found object
          const centervalue = mapObject ? mapObject.PropertyValue : null;
          if (centervalue) {
            const match = centervalue.match(/\{lat:([^,]+),lng:([^}]+)\}/);
            if (match) {
              const lat = parseFloat(match[1]);
              const lng = parseFloat(match[2]);

              if (!isNaN(lat) && !isNaN(lng)) {
                setMapcenter([lat, lng]);
              }
            }
          }
          setClientsetting(session?.clientSetting);
        }
      }
    })();
  }, []);
  const clientZoomSettings = clientsetting?.filter(
    (el) => el?.PropertDesc === "Zoom"
  )[0]?.PropertyValue;
  const zoom = clientZoomSettings ? parseInt(clientZoomSettings) : 11;

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (polygondata.length > 0) {
        setForm({
          ...Form,
          latlngCordinates: JSON.stringify(
            polygondata.map(({ latitude, longitude }) => ({
              lat: latitude,
              lng: longitude
            }))
          ),
          centerPoints: "",
          zoneType: "Polygon"
        });
      } else if (circleData.radius) {
        setForm({
          ...Form,
          latlngCordinates: circleData.radius.toString(),
          centerPoints: circleData.latlng,
          zoneType: "Circle"
        });
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          latlngCordinates: "",
          centerPoints: ""
        }));
      }
    }
  }, [polygondata, circleData]);

  const handlePolygonSave = (coordinates: [number, number][]) => {
    const zoneCoords = coordinates.slice(0, -1).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng
    }));

    if (drawShape == true) {
      const formattedCoordinate: [number, number][] = zoneCoords.map(
        (coord: { latitude: number; longitude: number }) => [
          coord.latitude,
          coord.longitude
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
    if (drawShape == true) {
      setCircleDataById({ radius: radius });
      const updateCircleData = (newLatlng: string, newRadius: string): void => {
        setCircleData({
          latlng: newLatlng,
          radius: newRadius
        });
      };
      updateCircleData(circlePoint, radius);

      setMapcenter([newlatlng[0], newlatlng[1]]);

      setDrawShape(!drawShape);
    }
  };

  const handleSelectAddressOne = (e: any) => {
    // const selectedIndex = e.target.selectedIndex;
    // setSelectedAddress(addresses[selectedIndex]);
    if (!e) return;
    const latlng = JSON.parse(e.value);
    if ("lat" in latlng && "lon" in latlng) {
      setSelectLatLng({ lat: latlng.lat, lon: latlng.lon });
    } else {
      console.error("Invalid latlng object:", latlng);
    }
  };

  const handleInputChange = (e: any) => {
    let query: string = e;
    if (session) {
      getSearchAddress({
        query: query,
        country: session?.country
      })
        .then((response) => {
          setAddresses(response);
        })
        .catch((error) => {});
    }
  };

  // const handleAAdressSearch = async (inputValue: any) => {
  //
  //   let query: string = inputValue.target.value;
  //   if (session) {
  //     const getAddress = await getSearchAddress({
  //       query: query,
  //       country: session?.country,
  //     });
  //     setAddresses(getAddress);
  //   }
  // };

  const SetViewfly = () => {
    const map = useMap();
    if (selectLatLng) {
      map.flyTo([selectLatLng.lat, selectLatLng.lon], 18);
    }

    return null;
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...Form, [name]: value });
  };
  const handleChangeSelectValue = (e: any) => {
    if (e.value) {
      setForm({ ...Form, GeoFenceType: e.value });
    }    
  };
  
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if any of the required fields are empty
    if (
      !Form.latlngCordinates ||
      !Form.zoneName ||
      !Form.zoneShortName ||
      !Form.GeoFenceType
    ) {
      toast.error("Please Select All Field");
      return;
    } else if (polygondataById.length == 0 && circleDataById?.radius == null) {
      toast.error("Please Draw a Zone");
      return;
    }
    try {
      if (session) {
        const newformdata = {
          ...Form,
          clientId: session?.clientId
        };

        const response = await toast.promise(
          postZoneDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata
          }),
          {
            loading: "Saving data...",
            success: "Data saved successfully!",
            error: "Error saving data. Please try again."
          },
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C"
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            },
            error: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            }
          }
        );

        // if (response.id !== null) {

        //   setTimeout(() => {
        //     router.push("/Zone");
        //   }, 2000);
        // }
        dispatch(
          fetchZone({
            clientId: session?.clientId,
            token: session?.accessToken
          })
        );
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
    setForm({
      centerPoints: "",
      id: "",
      zoneName: "",
      zoneShortName: "",
      zoneType: "",
      latlngCordinates: "",
      label: ""
    });
    router.push("/Zone");
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

  const handleEdited = (e: any) => {
    const layer = e.layers;
    layer.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        const coordinates: [number, number][] = (
          layer.getLatLngs()[0] as L.LatLng[]
        ).map((latLng: L.LatLng) => [latLng.lat, latLng.lng]);
        const zoneCoords = coordinates.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng
        }));
        setPolygondata(zoneCoords);
      } else if (layer instanceof L.Circle) {
        const latlng: L.LatLng = layer.getLatLng();
        const radius: number = layer.getRadius();
        handleCircleSave(latlng, radius.toString());
      }
    });
  };
  const handleredraw = (e: any) => {
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
      setDrawShape(drawShape);
    }
  };
  const optionsSiteClickCall: any = [
    { value: "On-Site", label: "On-Site" },
    { value: "Off-Site", label: "Off-Site" },
    { value: "City-Area", label: "City-Area" },
    { value: "Restricted-Area", label: "Restricted-Area" }
  ];
  const optionsSite: any = [
    { value: "On-Site", label: "On-Site" },
    { value: "Off-Site", label: "Off-Site" }
  ];
  const optionsCitys: any =
    addresses?.map((item: any) => ({
      value: JSON.stringify(item),
      label: item.display_name
    })) || [];
  // {addresses.map((address, index) => (
  //   <option key={address.place_id} value={JSON.stringify(address)}>
  //     {address.display_name}
  //   </option>
  // ))}

  return (
    <div className="shadow-lg bg-bgLight h-5/6  border-t text-white edit_zone_main ">
      <p className="bg-green px-4 py-1 text-black text-center text-2xl text-white font-bold edit_zone_text">
        Add Zone
      </p>

      <div className="grid lg:grid-cols-6 sm:grid-cols-5 md:grid-cols-5 grid-cols-1 pt-8 edit_zone_map">
        <div className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-6 col-span-4 bg-gray-200 mx-5 edit_zone_side_bar">
          <form onSubmit={handleSave}>
            <label className="text-black text-md w-full font-popins font-medium">
              <span className="text-red">
                <b> *</b>
              </span>
              <b> Please Enter Zone Name:</b>{" "}
            </label>
            <input
              onChange={handleChange}
              type="text"
              name="zoneName"
              value={Form.zoneName}
              className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
              placeholder="Enter Zone Name "
              required
            />
            <label className="text-black text-md w-full font-popins font-medium">
              <span className="text-red">
                <b>*</b>
              </span>
              <b> Geofence:</b>{" "}
            </label>
            {session?.clickToCall === true ? (
              <Select
                // value={Ignitionreport?.vehicleNo}
                // value={Form?.GeoFenceType}
                onChange={handleChangeSelectValue}
                options={optionsSiteClickCall}
                placeholder="Select Report Type"
                isSearchable
                isClearable
                noOptionsMessage={() => "No options available"}
                className="   rounded-md w-full  outline-green border border-grayLight"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    border: "none",
                    boxShadow: state.isFocused ? null : null
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                      ? "#00B56C"
                      : state.isFocused
                      ? "#e1f0e3"
                      : "transparent",
                    color: state.isSelected
                      ? "white"
                      : state.isFocused
                      ? "black"
                      : "black",
                    "&:hover": {
                      backgroundColor: "#e1f0e3",
                      color: "black"
                    }
                  })
                }}
              />
            ) : (
              <Select
                // value={Ignitionreport?.vehicleNo}
                // value={Form?.GeoFenceType}
                onChange={handleChangeSelectValue}
                options={optionsSite}
                placeholder="Select Report Type"
                isSearchable
                isClearable
                noOptionsMessage={() => "No options available"}
                className="   rounded-md w-full  outline-green border border-grayLight"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    border: "none",
                    boxShadow: state.isFocused ? null : null
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                      ? "#00B56C"
                      : state.isFocused
                      ? "#e1f0e3"
                      : "transparent",
                    color: state.isSelected
                      ? "white"
                      : state.isFocused
                      ? "black"
                      : "black",
                    "&:hover": {
                      backgroundColor: "#e1f0e3",
                      color: "black"
                    }
                  })
                }}
              />
            )}
            <br></br>
            <br></br>
            <label className="text-black text-md w-full font-popins font-medium">
              <span className="text-red">
                <b>*</b>
              </span>
              <b> Zone Short Name:</b>{" "}
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
            <div className="flex justify-start">
              {/* <div className="grid lg:grid-cols-8 grid-cols-6 bg-green shadow-md  w-24 rounded-md   hover:shadow-gray transition duration-500 ">
                <div className="col-span-2">
                  <svg
                    className="h-10 py-3 w-full text-white"
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
                <div className="col-span-1 ">
                  <button
                    className="text-white  font-popins font-bold  h-10 bg-green "
                    type="submit"
                  >
                    Save
                  </button>
                </div>
                <div className="col-span-2">
                  <ClearIcon />
                </div>
                <div className="col-span-2 ">
                  <button
                    className="ms-14  font-popins font-bold  h-10 bg-red text-white px-6 rounded-md shadow-md  hover:shadow-gray transition duration-500"
                    onClick={() => router.push("http://localhost:3010/Zone")}
                  >
                    Cancel
                  </button>
                </div>
              </div> */}
              <div
                className="grid grid-cols-12  
                "
              >
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-2 col-span-4    
"
                >
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
                        Save
                      </button>
                    </div>
                  </div> */}
                  <Button
                    className="  shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none h-10 "
                    variant="outlined"
                    type="submit"
                    // onClick={handleClear}
                    style={{
                      fontSize: "16px",
                      backgroundColor: "#00b56c",
                      color: "white",
                      border: "none"
                    }}
                    startIcon={
                      <span style={{ fontWeight: "600" }}>
                        <SaveIcon className="-mt-1" />
                      </span>
                    }
                  >
                    <b>S</b>{" "}
                    <span style={{ textTransform: "lowercase" }}>
                      <b>ave</b>
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
                        className="font-popins font-bold h-10 text-center"
                        onClick={() => router.push("/Zone")}
                        style={{
                          color: "white",
                          textTransform: "capitalize",
                          border: "none",
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
                      border: "none"
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

        <div className="xl:col-span-5 lg:col-span-4 md:col-span-3 sm:col-span-5 col-span-4 mx-3 edit-zone_map_child ">
          <div className="edit_zone_map_text">
            <label className="text-black text-md w-full font-popins font-medium ">
              <b>Please Enter Text To Search </b>
            </label>
            {/* <input
              type="text"
              className="  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
              placeholder="Search"
              onChange={handleAAdressSearch}
              required
            /> */}

            <Select
              onChange={handleSelectAddressOne}
              onInputChange={handleInputChange}
              options={optionsCitys}
              placeholder="Search"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="rounded-md w-full outline-green border border-grayLight hover:border-green"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  border: "none",
                  boxShadow: state.isFocused ? null : null
                }),
                option: (provided, state) => ({
                  ...provided,
                  zIndex: "9999",
                  backgroundColor: state.isSelected
                    ? "#00B56C"
                    : state.isFocused
                    ? "#e1f0e3"
                    : "transparent",
                  color: state.isSelected
                    ? "white"
                    : state.isFocused
                    ? "black"
                    : "black",
                  "&:hover": {
                    backgroundColor: "#e1f0e3",
                    color: "black"
                  }
                })
              }}
            />
          </div>
          {/* <button
            className="text-white px-30px h-10 bg-[#00B56C] "
            type="submit"
            onClick={handleredraw}
          >
            Redraw
          </button> */}
          <Button
            className=" bg-green shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none h-10 "
            variant="outlined"
            onClick={handleredraw}
            style={{
              fontSize: "16px",
              backgroundColor: "#00b56c",
              color: "white",
              border: "none"
            }}
            id="add_zone_redraw_btn"
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
            <div className="col-span-1  ms-1">
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
            <div className="col-span-2 mt-1 ">
              <button
                className="text-white  font-popins font-bold h-9 px-3"
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
              {mapcenter !== null && (
                <MapContainer
                  zoom={15}
                  center={mapcenter}
                  className="z-0 edit_zone_map_main"
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

                  <SetViewfly />
                  {drawShape == false && (
                    <FeatureGroup>
                      <EditControl
                        position="topright"
                        onEdited={handleEdited}
                        // edit={true}
                        onCreated={handleCreated}
                        draw={{
                          polyline: false,
                          polygon: drawShape,
                          circle: drawShape,
                          marker: false,
                          circlemarker: false,
                          rectangle: false
                        }}
                      />
                      {shapeType === "Polygon" && polygondataById.length > 0 ? (
                        <Polygon
                          positions={polygondataById}
                          color={
                            Form.GeoFenceType == "City-Area"
                              ? "green"
                              : Form.GeoFenceType == "Restricted-Area"
                              ? "red"
                              : "blue"
                          }
                        />
                      ) : null}

                      {shapeType === "Circle" &&
                      !isNaN(mapcenter[0]) &&
                      !isNaN(mapcenter[1]) &&
                      !isNaN(Number(circleDataById?.radius)) ? (
                        <Circle
                          radius={Number(circleDataById?.radius)}
                          center={mapcenter}
                          color={
                            Form.GeoFenceType == "City-Area"
                              ? "green"
                              : Form.GeoFenceType == "Restricted-Area"
                              ? "red"
                              : "blue"
                          }
                        />
                      ) : null}
                    </FeatureGroup>
                  )}
                  {drawShape == true && (
                    <FeatureGroup>
                      <EditControl
                        position="topright"
                        onEdited={handleEdited}
                        // edit={true}
                        onCreated={handleCreated}
                        draw={{
                          polyline: false,
                          polygon: true,
                          circle: true,
                          marker: false,
                          circlemarker: false,
                          rectangle: false
                        }}
                      />
                      {shapeType === "Polygon" && polygondataById.length > 0 ? (
                        <Polygon positions={polygondataById} color="#97009c" />
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
  );
}

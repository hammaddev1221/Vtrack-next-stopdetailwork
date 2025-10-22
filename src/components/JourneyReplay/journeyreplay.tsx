"use client";
import React, { useEffect, useRef, useState } from "react";
import DateFnsMomemtUtils from "@date-io/moment";
import { DatePicker } from "@material-ui/pickers";
import axios from "axios";
import EventIcon from "@material-ui/icons/Event";
import dynamic from "next/dynamic";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import Image from "next/image";
// import { LayersControl, Popup } from "react-leaflet"; // Moved to dynamic import
import HarshAccelerationIcon from "../../../public/Images/HarshAccelerationIcon.png";
import HarshCornerningIcon from "../../../public/harshcornering.png";
import markerA from "../../../public/Images/marker-a.png";
import markerB from "../../../public/Images/marker-b.png";
import harshAcceleration from "../../../public/Images/brake-discs.png";
import FocusIconNew from "../../../public/car-icon-vtrack.png";
import { useSelector } from "react-redux";
import CustomSpeedometer from "./CustomSpeedometer";
import JourneyInfo from "./JourneyInfo";
import {
  TravelHistoryByBucketV2,
  TripsByBucketAndVehicle,
  getAllVehicleByUserId,
  vehicleListByClientId,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { ClientSettings } from "@/types/clientSettings";
import TripsByBucket, { TravelHistoryData } from "@/types/TripsByBucket";
// import L, { LatLng, LatLngTuple, point } from "leaflet"; // Moved to dynamic import
// import { Marker } from "react-leaflet/Marker"; // Moved to dynamic import
import { Toaster, toast } from "react-hot-toast";
import { useMap } from "react-leaflet"; // Moved to dynamic import
import {
  calculateZoomCenter,
  createMarkerIcon,
} from "@/utils/JourneyReplayFunctions";
import { Tooltip } from "@material-tailwind/react";
import {
  MuiPickersUtilsProvider
} from "@material-ui/pickers";

// Dynamically import leaflet-arrowheads only on client side
if (typeof window !== 'undefined') {
  require("leaflet-arrowheads");
}
import Slider from "@mui/material/Slider";
import Select from "react-select";
import "./index.css";
import DirectionalPolyline from "./DirectionalPolyline";
import movebike from "../../../public/Move_Bike.svg"
import moveboat from "../../../public/Move_Boat.svg"
import movecar from "../../../public/Move_Car.svg"

const moment = require("moment-timezone");
const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((module) => module.Polyline),
  { ssr: false }
);
// const Polygon = dynamic(
//   () => import("react-leaflet").then((module) => module.Polygon),
//   { ssr: false }
// );
// const Circle = dynamic(
//   () => import("react-leaflet").then((module) => module.Circle),
//   { ssr: false }
// );

// Additional dynamic imports for components that were causing SSR issues
const LayersControl = dynamic(
  () => import("react-leaflet").then((module) => module.LayersControl),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet/Marker").then((module) => module.Marker),
  { ssr: false }
);

// 1. Define a type for clickPosition
interface ClickPosition {
  lat: number;
  lng: number;
  address?: { display_name?: string };
  date?: string;
  speed?: string;
}
const BaseLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl.BaseLayer),
  { ssr: false }
);

export default function JourneyReplayComp() {
  const { data: session } = useSession();
  const [bikemove, setbikemove] = useState("")
  const [boatmove, setboatmove] = useState("")
  const [carmove, setcarmove] = useState("")
  async function loadSVG(filepath: string) {
    const response = await fetch(filepath);
    return await response.text();
  }

  useEffect(() => {
    async function setdata() {

      setbikemove(await loadSVG(movebike.src))
      setboatmove(await loadSVG(moveboat.src))
      setcarmove(await loadSVG(movecar.src))

    }
    setdata()
  }, [])

  // const { BaseLayer } = LayersControl;
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(null);
  const [clientsetting, setClientsetting] = useState<ClientSettings[] | null>(
    null
  );
  const [dataresponse, setDataResponse] = useState<any>();
  const [TravelHistoryresponse, setTravelHistoryresponse] = useState<
    TravelHistoryData[]
  >([]);
  const [mapcenter, setMapcenter] = useState<LatLngTuple | null>(null);
  const [mapcenterToFly, setMapcenterToFly] = useState<LatLngTuple | null>(
    null
  );
  const [zoomToFly, setzoomToFly] = useState(10);
  const [zoom, setzoom] = useState(10);
  const [polylinedata, setPolylinedata] = useState<[number, number][]>([]);
  const [Ignitionreport, setIgnitionreport] = useState<any>({
    TimeZone: session?.timezone || "",
    VehicleReg: "",
    clientId: session?.clientId || "",
    fromDateTime: "",
    period: "",
    toDateTime: "",
    unit: session?.unit || "",
    fuelTankCapacity: ""
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [carPosition, setCarPosition] = useState<LatLng | null>(null);
  const [speedFactor, setSpeedFactor] = useState<any>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseColor, setIsPauseColor] = useState(false);
  const [getShowRadioButton, setShowRadioButton] = useState(false);
  const [getShowdetails, setShowDetails] = useState(false);
  const [getShowICon, setShowIcon] = useState(false);
  const [getCheckedInput, setCheckedInput] = useState<any>(false);
  const [isDynamicTime, setIsDynamicTime] = useState<any>([]);
  const [stopVehicle, setstopVehicle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weekDataGrouped, setweekDataGrouped] = useState(false);
  const [playbtn, setPlayBtn] = useState(false);
  const [stopbtn, setStopBtn] = useState(false);
  const [pausebtn, setPauseBtn] = useState(false);
  const [stopDetailsOpen, setStopDetailsOpen] = useState(false);
  const [activeTripColor, setactiveTripColor] = useState<any>("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loadingMap, setloadingMap] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [seacrhLoading, setSearchLoading] = useState(true);
  const [minzoom, setminzoom] = useState(6);
  const [maxzoom, setmaxzoom] = useState(18);
  const [harshPopUp, setHarshPopUp] = useState(true);
  const [harshAccPopUp, setAccHarshPopUp] = useState(true);
  const [addressTravelHistory, setAddressTravelHistory] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [userclick, setuserclick] = useState(false);
  const [stopWithSecond, setStopWithSecond] = useState([]);
  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : null);
  };
  const allData = useSelector((state) => state?.zone);
  const [hidediv, sethidediv] = useState(false);
  const [hideicondiv, sethideicondiv] = useState(true);
  const togglePicker = () => {
    setIsPickerOpen(!isPickerOpen);
  };
  const SPEED_CONFIG = {
    1: 18,
    2: 17,
    4: 16,
    6: 15,
  };
  const SetViewOnClick = ({ coords, zoom }: { coords: any, zoom: any }) => {
    const map = useMap();
    if (userclick && isPlaying) return
    if (coords) {
      const dynamicZoom: number = SPEED_CONFIG[speedFactor] || SPEED_CONFIG[1];
      map.setView(coords, dynamicZoom);
    }
    return null;
  };

  const SetViewfly = ({ coords, zoom }: { coords: any; zoom: number }) => {
    const map = useMap();
    if (selectedItemId) {
      return null
    }
    if (coords && !Number.isNaN(coords[0]) && coords[0] != null) {
      map.flyTo(coords, zoom);
    }
    return null;
  };

  const tick = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setIsChecked(false)
    sethideicondiv(false)
    setuserclick(false)
    setPlayBtn(false);
    setStopBtn(true);
    setPauseBtn(true);
    setstopVehicle(false);
    setIsPauseColor(false);
    setHarshPopUp(false);
    setAccHarshPopUp(false);
  };

  const pauseTick = async () => {
    setIsPlaying(false);
    setPauseBtn(false);
    sethideicondiv(false)
    setStopBtn(true);
    setPlayBtn(true);
    setstopVehicle(false);
    setIsPauseColor(true);
    setIsPaused(true);
    setuserclick(false)
    setHarshPopUp(true);
    setAccHarshPopUp(true);
  };

  const stopTick = async () => {
    setuserclick(false)
    setIsPlaying(false);
    sethideicondiv(true)
    setIsPaused(false);
    setPlayBtn(true);
    setPauseBtn(false);
    setIsPauseColor(false);
    setStopBtn(false);
    setstopVehicle(true);
    setHarshPopUp(true);
    setAccHarshPopUp(true);
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][1]));
      const { zoomlevel, centerLat, centerLng } = calculateZoomCenter(
        TravelHistoryresponse
      );
      setMapcenterToFly([centerLat, centerLng]);
      setzoomToFly(zoomlevel);
    }
    setCurrentPositionIndex(0);
  };
  const SEGMENT_DURATIONS = {
    1: 500, // ms per segment at speed 1
    2: 250,
    4: 125,
    6: 75,  // ms per segment at speed 6
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isPlaying || isPaused) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    let currentSegmentIndex = currentPositionIndex;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const segmentDuration = SEGMENT_DURATIONS[speedFactor];

      // Calculate how far we are through the current segment
      const segmentProgress = Math.min(1, elapsed / segmentDuration);

      // Get current and next points
      const currentData = TravelHistoryresponse[currentSegmentIndex];
      const nextData = TravelHistoryresponse[currentSegmentIndex + 1];

      // Interpolate position
      const interpolatedLat = currentData.lat +
        (nextData.lat - currentData.lat) * segmentProgress;
      const interpolatedLng = currentData.lng +
        (nextData.lng - currentData.lng) * segmentProgress;

      // Update position
      setCarPosition([interpolatedLat, interpolatedLng]);
      setMapcenter([interpolatedLat, interpolatedLng]);

      // Move to next segment if finished current segment
      if (segmentProgress >= 1) {
        currentSegmentIndex++;
        startTime = timestamp; // Reset timer for new segment

        // Update address
        if (currentSegmentIndex < TravelHistoryresponse.length) {
          const addressSplit = TravelHistoryresponse[currentSegmentIndex]?.address?.display_name?.split(",");
          setAddressTravelHistory(addressSplit);
        }

        // Update position index
        setCurrentPositionIndex(currentSegmentIndex);
      }

      // Check if journey is complete
      if (currentSegmentIndex >= TravelHistoryresponse.length - 1) {
        handleAnimationEnd();
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const handleAnimationEnd = () => {
      const { zoomlevel, centerLat, centerLng } = calculateZoomCenter(TravelHistoryresponse);
      setCurrentPositionIndex(0);
      setMapcenterToFly([centerLat, centerLng]);
      setzoomToFly(zoomlevel);
      setzoom(zoomlevel);
      setIsPlaying(false);
      setPlayBtn(true);
      setPauseBtn(false);
      setStopBtn(false);
    };

    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isPaused, speedFactor, TravelHistoryresponse, currentPositionIndex]);
  useEffect(() => {
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][1]));
    }
  }, [polylinedata]);
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [showZones, setShowZones] = useState(false);

  const allZones = useSelector((state: any) => state.zone);

  useEffect(() => {
    setZoneList(allZones?.zone);
  }, [allZones]);
  const handleShowZone = () => {
    setShowZones(!showZones);
  };
  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session) {
          if (session?.userRole == "Admin" || session?.userRole == "SuperAdmin") {

            // if (allData?.vehicle.data?.length == 0) {
            //   const Data = await vehicleListByClientId({
            //     token: session?.accessToken,
            //     clientId: session?.clientId,
            //   });
            //   setVehicleList(Data.data);
            // } else {
            //   setVehicleList(allData?.vehicle.data);
            // }
            const Data = await vehicleListByClientId({
              token: session?.accessToken,
              clientId: session?.clientId,
            });
            setVehicleList(Data.data);


          } else {


            // if (allData?.vehicle?.data?.length == 0) {
            //   const data = await getAllVehicleByUserId({
            //     token: session?.accessToken,
            //     userId: session?.userId,
            //   });
            //   setVehicleList(data);
            // } else {
            //   setVehicleList(allData?.vehicle.data.filter((i: any) => {
            //     return i.userId.includes(session?.userId)
            //   }));
            // }
            const data = await getAllVehicleByUserId({
              token: session?.accessToken,
              userId: session?.userId,
            });
            setVehicleList(data);

          }
        }
      } catch (error) { }
    };
    vehicleListData();

    (async function () {
      if (session) {

        const centervalue = await session?.clientSetting.filter(
          (item: any) => item.PropertDesc == "Map"
        );
        const centerMapValue = centervalue.map(
          (item: any) => item.PropertyValue
        );

        if (centerMapValue) {
          const match = centerMapValue?.[0]?.match(
            /\{lat:([^,]+),lng:([^}]+)\}/
          );
          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);

            if (!isNaN(lat) && !isNaN(lng)) {
              setMapcenter([lat, lng]);
            }
          }
        }
        setClientsetting(session?.clientSetting);
        const clientZoomSettings = clientsetting?.filter(
          (el) => el?.PropertDesc === "Zoom"
        )[0]?.PropertyValue;
        const zoomLevel = clientZoomSettings
          ? parseInt(clientZoomSettings)
          : 13;
        setzoom(zoomLevel);
      }


    })();
  }, []);


  useEffect(() => {


    vehicleListData();


  }, []);
  const vehicleListData = async () => {
    try {
      if (session) {
        if (session?.userRole == "Admin" || session?.userRole == "SuperAdmin") {

          if (allData?.vehicle.data?.length == 0) {
            const Data = await vehicleListByClientId({
              token: session?.accessToken,
              clientId: session?.clientId,
            });
            setVehicleList(Data.data);
          } else {
            setVehicleList(allData?.vehicle.data);
          }

        } else {


          if (allData?.vehicle?.data?.length == 0) {
            const data = await getAllVehicleByUserId({
              token: session?.accessToken,
              userId: session?.userId,
            });
            setVehicleList(data);
          } else {
            setVehicleList(allData?.vehicle.data.filter((i: any) => {
              return i.userId.includes(session?.userId)
            }));
          }


        }
      }
    } catch (error) { }
  };
  useEffect(() => {

    const clientMinZoomSettings = session?.clientSetting?.filter(
      (el) => el?.PropertDesc === "MinZoom"
    )[0]?.PropertyValue;

    const minzoomLevel = clientMinZoomSettings ? parseInt(clientMinZoomSettings) : 6;

    setminzoom(minzoomLevel);
    const clientMaxZoomSettings = session?.clientSetting?.filter(
      (el) => el?.PropertDesc === "MaxZoom"
    )[0]?.PropertyValue;
    const maxzoomLevel = clientMaxZoomSettings ? parseInt(clientMaxZoomSettings) : 18;
    setmaxzoom(maxzoomLevel);
  }, [clientsetting, zoneList])

  // useEffect(() => {
  //   const clientZoomSettings = clientsetting?.filter(
  //     (el) => el?.PropertDesc === "Zoom"
  //   )[0]?.PropertyValue;
  //   const zoomLevel = clientZoomSettings ? parseInt(clientZoomSettings) : 11;
  //   setzoom(zoomLevel);
  // }, [clientsetting]);

  let currentTime = new Date().toLocaleString("en-US", {
    timeZone: session?.timezone,
  });

  let timeOnly = currentTime.split(",")[1].trim();
  timeOnly = timeOnly.replace(/\s+[APap][Mm]\s*$/, "");





  const handleCloseDateTime = () => {
    setShowRadioButton(false);

    setIgnitionreport((preData: any) => ({
      ...preData,
      fromDateTime: "",
      toDateTime: "",
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsDynamicTime("");
    setlat("");
    setlng("");

    setIsPaused(false);
    setPlayBtn(false);
    setStopBtn(false);
    setPauseBtn(false);
    setloadingMap(false);
    setIsPlaying(false);
    setCarPosition(null);
    setactiveTripColor("");
    setTravelHistoryresponse([]);

    setShowDetails(false);

    setLoading(true);

    setDataResponse(null);
    setExpanded(null);
    setSearchLoading(false);
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][0]));
    }
    setCurrentPositionIndex(0);

    if (
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "today") ||
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "yesterday") ||
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "week") ||
      (Ignitionreport?.VehicleReg &&
        Ignitionreport?.VehicleReg &&
        Ignitionreport?.toDateTime &&
        Ignitionreport?.fromDateTime)
    ) {
      let startDateTime: any;
      let endDateTime: any;
      if (session) {
        const { VehicleReg, period } = await Ignitionreport;

        if (period == "today") {

          const today = moment().tz(session?.timezone);
          startDateTime = today.clone().startOf("day").format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = today.clone().endOf("day").format("YYYY-MM-DDT23:59:59") + "Z";

        }
        if (period === "yesterday") {
          const yesterday = moment().subtract(1, "day").tz(session?.timezone);
          startDateTime = yesterday.clone().startOf("day").format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = yesterday.clone().endOf("day").format("YYYY-MM-DDT23:59:59") + "Z";
        }
        if (period == "week") {


          const startOfWeek = moment().subtract(7, "days").tz(session?.timezone).startOf("day");
          const endOfWeek = moment().subtract(1, "day").tz(session?.timezone).endOf("day");
          startDateTime = startOfWeek.format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = endOfWeek.format("YYYY-MM-DDT23:59:59") + "Z";
        }
        if (period === "custom") {
          startDateTime = moment(Ignitionreport.fromDateTime).startOf("day").format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = moment(Ignitionreport.toDateTime).endOf("day").format("YYYY-MM-DDT23:59:59") + "Z";
        }
        if (VehicleReg && period) {
          let newdata = {
            unit: session?.unit,
            period: period,
            VehicleReg: VehicleReg,
            TimeZone: session?.timezone,
            clientId: session?.clientId,
            fromDateTime: startDateTime,
            toDateTime: endDateTime,
            fuelTankCapacity: Ignitionreport.fuelTankCapacity
          };
          const fromDate: any = new Date(Ignitionreport?.fromDateTime);
          const toDate: any = new Date(Ignitionreport?.toDateTime);

          const differenceMs = toDate - fromDate;
          const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

          if (differenceDays > 5 || differenceDays < 0) {
            toast.error("please Select 0nly Five Days");
          } else {
            try {
              setClickPosition(null)
              const response = await toast.promise(
                TripsByBucketAndVehicle({
                  token: session?.accessToken,
                  payload: newdata, version: session.V2 ? "v2" : "v3"
                }),

                {
                  loading: "Loading...",
                  success: "",
                  error: "",
                },
                {
                  style: {
                    border: "1px solid #00B56C",
                    padding: "16px",
                    color: "#1A202C",
                  },
                  success: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE",
                    },
                  },
                  error: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE",
                    },
                  },
                }
              );
              if (
                Ignitionreport.period == "today" ||
                Ignitionreport.period == "yesterday"
              ) {

                setweekDataGrouped(false);
              }
              if (
                Ignitionreport.period == "week" ||
                Ignitionreport.period == "custom"
              ) {

                setweekDataGrouped(true);
              }
              setDataResponse(response?.data);

              if (response.success === true) {

                toast.success(`${response.message}`, {
                  style: {
                    border: "1px solid #00B56C",
                    padding: "16px",
                    color: "#1A202C",
                  },
                  duration: 4000,
                  iconTheme: {
                    primary: "#00B56C",
                    secondary: "#FFFAEE",
                  },
                });
              } else {
                toast.error(`${response.message}`, {
                  style: {
                    border: "1px solid red",
                    padding: "16px",
                    color: "red",
                  },
                  iconTheme: {
                    primary: "red",
                    secondary: "white",
                  },
                });
              }
            } catch (error) { }
          }
        }
      }
    }
    setSearchLoading(true);
    setLoading(false);
  };


  const handleClick = () => {
    setShowRadioButton(!getShowRadioButton);
  };

  function getFormattedDate(date: any) {
    return date.toISOString().slice(0, 10);
  }
  const handleDivClick = async (
    TripStart: TripsByBucket["TripStart"],
    TripEnd: TripsByBucket["TripEnd"],
    id: any
  ) => {
    sethidediv(true)
    setPolylinedata([])
    setCarPosition(null)
    setlat(null);
    setlng(null);
    setPlayBtn(true);
    setStopBtn(false);
    setStopDetailsOpen(true);
    setIsPlaying(false);
    setIsPaused(false);
    setstopVehicle(false);
    try {
      setTravelHistoryresponse([]);
      setIsPauseColor(false);
      setCurrentPositionIndex(0);
      if (session) {
        let newresponsedata = {
          ...Ignitionreport,
          fromDateTime: `${TripStart}`,
          toDateTime: `${TripEnd}`,
          id,
        };

        setloadingMap(true);
        setClickPosition(null)
        const TravelHistoryresponseapi = await toast.promise(
          TravelHistoryByBucketV2({
            token: session?.accessToken,
            payload: newresponsedata,
            version: session.V2 ? "v2" : "v3"
          }),
          {
            loading: "Loading...",
            success: "",
            error: "",
          },
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C",
            },
            success: {
              duration: 10,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE",
              },
            },
            error: {
              duration: 10,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE",
              },
            },
          }
        );

        var stopPoints = [];
        if (session?.unit == "KM") {
          stopPoints = TravelHistoryresponseapi.data
            .filter((x: any) => x.speed == "0 Kph")
            .sort((x: any) => x.date);
        } else {
          stopPoints = TravelHistoryresponseapi.data
            .filter((x: any) => x.speed == "0 Mph")
            .sort((x: any) => x.date);
        }

        var addresses: any = [];
        if (TravelHistoryresponse)
          stopPoints.map(async function (singlePoint: any) {
            let completeAddress;
            if (!singlePoint.address?.display_name) {
              completeAddress = await axios
                .get(
                  `http://osm.vtracksolutions.com/nominatim/reverse.php?lat=${singlePoint.lat}&lon=${singlePoint.lng}&zoom=19&format=jsonv2`
                )
                .then(async (response: any) => {
                  return response.data;
                });
            } else {
              completeAddress = singlePoint.address;
            }

            var record: any = {};
            record["_id"] = singlePoint._id;
            record["lat"] = singlePoint.lat;
            record["lng"] = singlePoint.lng;
            record["date"] = singlePoint.date;
            record["speed"] = singlePoint.speed;
            record["TimeStamp"] = singlePoint.TimeStamp;
            record["address"] = completeAddress.display_name;
            if (
              addresses.filter(
                (x: any) => x.lat == record.lat && x.lng == record.lng
              ).length == 0
            ) {
              addresses.push(record);
            }
          });

        // let stopTimesArray: any = [];
        // for (let i = 0; i < TravelHistoryresponseapi?.data?.length; i++) {
        //   var currentData = TravelHistoryresponseapi?.data[i];


        //   if (
        //     currentData.ignition === 1 &&
        //     currentData.trip === 1 &&
        //     (currentData.speed === "0 Mph" || currentData.speed === "0 Kph")
        //   ) {
        //     let timeDiffInSeconds = 0;
        //     let nextIndex = i + 1;


        //     while (
        //       nextIndex < TravelHistoryresponseapi?.data?.length &&
        //       (TravelHistoryresponseapi?.data[nextIndex]?.speed === "0 Mph" ||
        //         TravelHistoryresponseapi?.data[nextIndex]?.speed === "0 Kph")

        //     ) {

        //       const currentTime: any = new Date(currentData.date);

        //       const nextTime: any = new Date(
        //         TravelHistoryresponseapi?.data[nextIndex].date
        //       );

        //       timeDiffInSeconds += Math.floor((nextTime - currentTime) / 1000);
        //       nextIndex = TravelHistoryresponseapi?.data[nextIndex];
        //       nextIndex++;
        //     }

        //     if (timeDiffInSeconds != 0) {
        //       i = nextIndex - 1;
        //     }
        //     if (
        //       timeDiffInSeconds == 0 &&
        //       (TravelHistoryresponseapi?.data[nextIndex]?.speed !== "0 Mph" ||
        //         TravelHistoryresponseapi?.data[nextIndex]?.speed !== "0 Kph") &&
        //       nextIndex < TravelHistoryresponseapi?.data?.length
        //     ) {
        //       const currentTime: any = new Date(currentData.date);
        //       const nextTime: any = new Date(
        //         TravelHistoryresponseapi?.data[nextIndex].date
        //       );
        //       timeDiffInSeconds += Math.floor((nextTime - currentTime) / 1000);
        //     }

        //     const minutes = Math.floor(timeDiffInSeconds / 60);
        //     const seconds = timeDiffInSeconds % 60;


        //     const formattedTime = ` ${minutes > 0 ? minutes + "m" : ""
        //       } ${seconds}s`;

        //     // Display the time difference
        //     stopTimesArray.push({
        //       date: currentData.date,
        //       time: formattedTime,
        //       address: currentData.address,
        //       lat: currentData.lat,
        //       lng: currentData.lng,
        //     });
        //   }
        // }
   const stopTimesArray: any[] = [];
const data = TravelHistoryresponseapi?.data || [];

let conditionMet = false;
let startTime: Date | null = null;

const zeroSpeedString = session.unit === "KM" ? "0 Kph" : "0 Mph";

for (let i = 0; i < data.length; i++) {
  const current = data[i];

  const hasIgnitionOn = current.ignition === 1;
  const hasTripOn = current.trip === 1;
  const hasSpeedZero = current.speed === zeroSpeedString;

  if (hasSpeedZero && hasIgnitionOn && hasTripOn && !conditionMet) {
    // Start stop period
    conditionMet = true;
    startTime = new Date(current.timeStamp);

    // Temporarily push object with date, address, lat, lng only
    // Duration/time will be added once stop ends
    stopTimesArray.push({
      date: current.timeStamp,
      address: current.address?.display_name || "",
      lat: current.lat,
      lng: current.lng,
      time: "",      // Will be updated later
      duration: 0,   // Will be updated later
    });
  } else if (
    (!hasSpeedZero || !hasIgnitionOn || !hasTripOn) &&
    conditionMet
  ) {
    // Stop period ends here
    const endTime = new Date(current.timeStamp);

    if (startTime) {
      const diffInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      const formattedTime = `${minutes > 0 ? minutes + "m " : ""}${seconds}s`;

      const lastIndex = stopTimesArray.length - 1;
      stopTimesArray[lastIndex].time = formattedTime;
      stopTimesArray[lastIndex].duration = diffInSeconds;

      conditionMet = false;
      startTime = null;
    }
  }
}

// Handle case when stop period lasts until last record
if (conditionMet && startTime && data.length > 0) {
  const endTime = new Date(data[data.length - 1].timeStamp);
  const diffInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  const formattedTime = `${minutes > 0 ? minutes + "m " : ""}${seconds}s`;

  const lastIndex = stopTimesArray.length - 1;
  stopTimesArray[lastIndex].time = formattedTime;
  stopTimesArray[lastIndex].duration = diffInSeconds;
}

console.log("stopTimesArray", stopTimesArray);
setStopWithSecond(stopTimesArray);



        setTravelHistoryresponse(TravelHistoryresponseapi.data);

      }
    } catch (error) { }

    setloadingMap(true);
  };
  useEffect(() => {

    if (TravelHistoryresponse && TravelHistoryresponse.length > 0) {
      setPolylinedata(
        TravelHistoryresponse?.map((item: TravelHistoryData) => [
          item.lat,
          item.lng,
        ])
      );

      const { zoomlevel, centerLat, centerLng } = calculateZoomCenter(
        TravelHistoryresponse
      );
      setMapcenterToFly([centerLat, centerLng]);
      setzoomToFly(zoomlevel);
    }

  }, [TravelHistoryresponse]);

  const getSpeedAndDistance = () => {
    if (
      currentPositionIndex >= 0 &&
      currentPositionIndex < TravelHistoryresponse.length
    ) {
      const item = TravelHistoryresponse[currentPositionIndex];
      return {
        speed: item.speed,
        distanceCovered: item.distanceCovered,
        date: item.date.split("T")[1].split(".")[0]
      };
    }
    return null;
  };

  const getCurrentAngle = () => {
    if (
      currentPositionIndex >= 0 &&
      currentPositionIndex < TravelHistoryresponse.length
    ) {
      return TravelHistoryresponse[currentPositionIndex].angle;
    }
    return 0;
  };

  const handleShowDetails = () => {
    setShowDetails(!getShowdetails);
    setShowIcon(!getShowICon);
  };
  const handleChangeChecked = () => {
    setCheckedInput(!getCheckedInput);
  };



  const handleDateChange = (fieldName: string, newDate: any) => {



    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [fieldName]: newDate?.toISOString(),
    }));
  };

  const currenTDates = new Date();


  const handleGetItem = (item: any, index: any) => {
    setIsDynamicTime(item);
    const filterData = dataresponse?.find((items: any) => items.id === item.id);
    setactiveTripColor(filterData);
  };

  const handleItemClick = (item) => {

    handleClickStopCar(item);


    if (item.date === selectedItemId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(item.date); // Select new item
    }

  };


  const handleInputChangeSelect = (e: any) => {

    if (!e) {
      return setIgnitionreport((prevReport: any) => ({
        ...prevReport,
        period: "",
        VehicleReg: "",
      }));
    }
    const { value, label, fuelTankCapacity, vehicleType } = e;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      ["VehicleReg"]: value,
      ["label"]: label,
      ["fuelTankCapacity"]: fuelTankCapacity,
      vehicleType: vehicleType
    }));

  };

  const handleInputChange: any = (e: any) => {

    const { name, value } = e.target;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [name]: value,
    }));


  };

  const [lat, setlat] = useState<any>("");
  const [lng, setlng] = useState<any>("");
  const handleClickStopCar = (item: any) => {
    if (item?.lat === lat) {
      setlat(null);
    } else {
      setlat(item?.lat);
    }

    if (item?.lng === lng) {
      setlng(null);
    } else {
      setlng(item?.lng);
    }
  };
  const handleChangeValueSlider = (value: any) => {

    setCurrentPositionIndex(value.target.value);
  };

  function getDayName(date: any) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }
  const groupedData: any = {};

  dataresponse?.map((item: any) => {
    const tripDate = new Date(item.TripEndDateLabel);
    const dayName = getDayName(tripDate);
    if (!groupedData[item.TripEndDateLabel]) {

      groupedData[item.TripEndDateLabel] = {
        trips: [item],
        count: 1,
        day: dayName,
      };
    } else {

      groupedData[item.TripEndDateLabel].trips.push(item);
      groupedData[item.TripEndDateLabel].count += 1;
    }
  });
  const options =
    vehicleList?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
      fuelTankCapacity: item.fuelTankCapacity,
      vehicleType: item.vehicleType

    })) || [];

  const SpeedOption = [
    { value: "1", label: "1X" },
    { value: "2", label: "2X" },
    { value: "4", label: "4X" },
    { value: "6", label: "6X" },
  ];
  const handleuserclick = () => {

    setuserclick(true)
  }

  const [isChecked, setIsChecked] = useState(false);


  const handleFocus = () => {
    setuserclick(false)
    setIsHovered(false);
    setIsHovered(false);
  }
  const [isHovered, setIsHovered] = useState(false);


  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  function isClose(a, b, epsilon = 0.0001) {
    return Math.abs(a - b) < epsilon;
  }

  return (
    <>
      <div className="main_journey">
        <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
          Journey Replay
        </p>



        <div
          className="grid xl:grid-cols-10 lg:grid-cols-10 md:grid-cols-12  gap-2
         lg:px-4 text-start  bg-bgLight select_box_journey"
        >
          <div
            className="xl:col-span-1 lg:col-span-2 md:col-span-3   col-span-12
            select_box_column 
          "

          >
            <Select
              onChange={handleInputChangeSelect}
              options={options}
              placeholder="Pick Vehicle"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="   rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  border: "none",
                  boxShadow: state.isFocused ? null : null,
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
                    color: "black",
                  },
                }),
              }}
            />


          </div>

          <div className="xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12 days_select">
            {getShowRadioButton ? (
              <div className="grid lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12  -mt-2  grid-cols-12  xl:px-10 lg:px-10 xl:gap-5 lg:gap-5 gap-2 flex justify-center ">
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 lg:mt-0 md:mt-0 sm:mt-0  "

                >
                  <label className="text-green">From</label>
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <DatePicker

                      format="MM/DD/yyyy"
                      value={Ignitionreport.fromDateTime || null}
                      onChange={(newDate: any) =>
                        handleDateChange("fromDateTime", newDate)
                      }
                      style={{ marginTop: "-3%" }}
                      variant="inline"
                      placeholder="Start Date"
                      maxDate={currenTDates}
                      autoOk
                      inputProps={{ readOnly: true }}
                      InputProps={{
                        endAdornment: (
                          <EventIcon
                            style={{ width: "20", height: "20" }}
                            className="text-gray"
                          />
                        ),
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 "
                  onClick={togglePicker}
                >
                  <label className="text-green">To</label>
                  <div>

                    <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                      <DatePicker
                        style={{ marginTop: "-3%" }}
                        className="text-red"
                        format="MM/DD/yyyy"
                        value={Ignitionreport.toDateTime || null}
                        onChange={(newDate: any) =>
                          handleDateChange("toDateTime", newDate)
                        }
                        variant="inline"
                        minDate={Ignitionreport.fromDateTime}
                        placeholder="End Date"
                        inputProps={{ readOnly: true }}
                        maxDate={currenTDates}

                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "20", height: "20" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        autoOk
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                </div>
                <div className="lg:col-span-1 col-span-1   ">
                  <button
                    className="text-green ms-5  text-2xl font-bold"
                    onClick={handleCloseDateTime}
                  >
                    x
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="grid xl:grid-cols-11 lg:grid-cols-12  md:grid-cols-12 grid-cols-12 -mt-2 "
              >
                <div
                  className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2 col-span-4 period_select"
                  id="today_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4 form-radio"
                      style={{ accentColor: "green" }}
                      name="period"
                      disabled={loading}
                      value="today"
                      checked={Ignitionreport?.period === "today"}
                      onChange={handleInputChange}
                    />
                    &nbsp;Today
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2  lg:-ms-4 col-span-4 period_select">
                  <label className="text-sm  text-black font-bold font-popins  w-full pt-3 ">
                    <input
                      type="radio"
                      className="lg:w-5 w-4  md:w-4 h-4 md:-ms-3 -ms-0 lg:-ms-0 xl:-ms-0   form-radio text-green"
                      name="period"
                      id="yesterday_radio_button"
                      disabled={loading}
                      value="yesterday"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport?.period === "yesterday"}
                      onChange={handleInputChange}
                    />
                    <span className="lg:ms-1 md:ms-1 sm:ms-1 ms-2">
                      Yesterday
                    </span>
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3 md:col-span-3  lg:-ms-1 col-span-4 period_select">
                  <label className="text-sm text-black font-bold font-popins  ">
                    <input
                      type="radio"
                      className="w-5 h-4 lg:w-4  "
                      name="period"
                      disabled={loading}
                      value="week"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport?.period === "week"}
                      onChange={handleInputChange}
                    />
                    &nbsp;&nbsp;Week
                  </label>
                </div>

                <div
                  className="xl:col-span-2 lg:col-span-3 md:col-span-3 lg:-ms-4
                md:-ms-4 sm:-ms-4 -ms-0 col-span-3 period_select_custom"
                  id="custom_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4  lg:w-4 "
                      disabled={loading}
                      name="period"
                      value="custom"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport?.period === "custom"}
                      onChange={handleInputChange}
                      onClick={handleClick}
                    />
                    &nbsp;&nbsp;Custom
                  </label>
                </div>
              </div>

            )}
          </div>
          <div className="xl:col-span-1 lg:col-span-1 md:col-span-1 col-span-12 text-white font-bold flex justify-center items-center mt-2 journey_replay_search">

            <div
              onClick={(e) => seacrhLoading && handleSubmit(e)}
              className={` grid grid-cols-12  h-10 bg-green py-2 px-4 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500 text-white cursor-pointer    search_btn_journey
                    ${(Ignitionreport?.VehicleReg &&
                  Ignitionreport?.period === "today") ||
                  (Ignitionreport?.VehicleReg &&
                    Ignitionreport?.period === "yesterday") ||
                  (Ignitionreport?.VehicleReg &&
                    Ignitionreport?.period === "week") ||
                  (Ignitionreport?.VehicleReg &&
                    Ignitionreport?.period === "custom" &&
                    Ignitionreport?.toDateTime &&
                    Ignitionreport?.fromDateTime)
                  ? ""
                  : "opacity-50 cursor-not-allowed"
                }`}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div className="col-span-3">
                <svg
                  className="lg:h-18 lg:w-10 md:h-12 md:w-12 sm:h-10 sm:w-10 h-12 w-12 py-3 px-2  text-white"
                  viewBox="0 0 24 24"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <circle cx="10" cy="10" r="7" />{" "}
                  <line x1="21" y1="21" x2="15" y2="15" />
                </svg>
              </div>
              <div className="lg:col-span-8 md:col-span-8">
                <button>Search</button>
              </div>
            </div>

          </div>


        </div>
        <div className="grid lg:grid-cols-5   md:grid-cols-12 sm:grid-cols-12 grid-cols-1 journey_sidebar">
          <div className="xl:col-span-1 lg:col-span-2 md:col-span-5 sm:col-span-12 col-span-4 trips_journey">
            <p className="bg-green px-4 py-1 text-white font-semibold journey_sidebar_text flex items-center">
              Trips ({dataresponse?.length})
            </p>
            <div
              id="trips_handle"
              className="overflow-y-scroll overflow-x-hidden bg-bgLight"
            >
              {weekDataGrouped == true
                ? Object.entries(groupedData).map(
                  ([date, items]: any, index) => (
                    <div key={date}>
                      <ul>
                        <div>
                          <Accordion
                            className="cursor-pointer"
                            expanded={expanded === `panel${index}`}
                            onChange={handleChange(`panel${index}`)}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                paddingLeft: getShowRadioButton ? "5%" : "5%",
                                paddingRight: getShowRadioButton
                                  ? "5%"
                                  : "5%",
                                borderBottom: "1px solid gray",
                                width: "100%",
                                paddingTop: "2%",
                                paddingBottom: "2%",
                              }}
                            >

                              <div className="grid grid-cols-12 space-x-3 justify-center text-green font-semibold">
                                <div className="col-span-5 w-full text-start">
                                  <p>{date}</p>
                                </div>
                                <div className="col-span-5 w-full text-start">
                                  <p>{items.day}</p>
                                </div>
                                <div className="col-span-1 w-full text-center">
                                  <p>x{items.count}</p>
                                </div>
                              </div>
                            </AccordionSummary>
                            {items?.trips?.map((item: any, index: any) => (
                              <AccordionDetails
                                key={index}
                                onClick={() =>
                                  handleDivClick(
                                    item.fromDateTime,
                                    item.toDateTime,
                                    item.id
                                  )
                                }
                                className="border-b hover:bg-[#e1f0e3]"
                                style={{
                                  backgroundColor:
                                    activeTripColor.id === item.id
                                      ? "#e1f0e3"
                                      : "",
                                }}
                              >
                                <Typography>
                                  <div
                                    className="py-5 cursor-pointer"
                                    onClick={() => handleGetItem(item, index)}
                                  >
                                    <div className="grid grid-cols-12 space-x-4 ">
                                      <div className="col-span-1">

                                        <svg
                                          fill="#00b576"
                                          height="50"
                                          width="40"
                                          viewBox="0 -43.92 122.88 122.88"
                                          version="1.1"
                                          id="Layer_1"
                                          xmlns="http://www.w3.org/2000/svg"
                                          xmlnsXlink="http://www.w3.org/1999/xlink"
                                          style={{
                                            filter:
                                              "drop-shadow(1px 2px 2px #000000)",
                                            marginTop: "-0.8rem",
                                          }}
                                          xmlSpace="preserve"
                                          transform="matrix(1, 0, 0, 1, 0, 0)"
                                          stroke="#00b576"
                                        >
                                          <g
                                            id="SVGRepo_bgCarrier"
                                            strokeWidth="0"
                                          />
                                          <g
                                            id="SVGRepo_tracerCarrier"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                          <g id="SVGRepo_iconCarrier">
                                            <g>
                                              <path
                                                className="st0"
                                                d="M99.42,13.57c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73 C88.69,18.37,93.49,13.57,99.42,13.57L99.42,13.57z M79.05,5c-0.59,1.27-1.06,2.69-1.42,4.23c-0.82,2.57,0.39,3.11,3.19,2.06 c2.06-1.23,4.12-2.47,6.18-3.7c1.05-0.74,1.55-1.47,1.38-2.19c-0.34-1.42-3.08-2.16-5.33-2.6C80.19,2.23,80.39,2.11,79.05,5 L79.05,5z M23.86,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99c-2.75,0-4.99-2.23-4.99-4.99 C18.87,21.54,21.1,19.31,23.86,19.31L23.86,19.31z M99.42,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99 c-2.75,0-4.99-2.23-4.99-4.99C94.43,21.54,96.66,19.31,99.42,19.31L99.42,19.31z M46.14,12.5c2.77-2.97,5.97-4.9,9.67-6.76 c8.1-4.08,13.06-3.58,21.66-3.58l-2.89,7.5c-1.21,1.6-2.58,2.73-4.66,2.84H46.14L46.14,12.5z M23.86,13.57 c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73C13.13,18.37,17.93,13.57,23.86,13.57 L23.86,13.57z M40.82,10.3c3.52-2.19,7.35-4.15,11.59-5.82c12.91-5.09,22.78-6,36.32-1.9c4.08,1.55,8.16,3.1,12.24,4.06 c4.03,0.96,21.48,1.88,21.91,4.81l-4.31,5.15c1.57,1.36,2.85,3.03,3.32,5.64c-0.13,1.61-0.57,2.96-1.33,4.04 c-1.29,1.85-5.07,3.76-7.11,2.67c-0.65-0.35-1.02-1.05-1.01-2.24c0.06-23.9-28.79-21.18-26.62,2.82H35.48 C44.8,5.49,5.04,5.4,12.1,28.7C9.62,31.38,3.77,27.34,0,18.75c1.03-1.02,2.16-1.99,3.42-2.89c-0.06-0.05,0.06,0.19-0.15-0.17 c-0.21-0.36,0.51-1.87,1.99-2.74C13.02,8.4,31.73,8.52,40.82,10.3L40.82,10.3z"
                                              />
                                            </g>
                                          </g>
                                        </svg>
                                      </div>
                                      <div className="col-span-10 ">
                                        <p className="text-start text-md   text-black font-popins font-semibold">
                                          Duration: {item.TripDurationHr}{" "}
                                          Hour(s) {item.TripDurationMins}{" "}
                                          Minute(s)
                                        </p>
                                        <p className=" text-green text-start font-popins font-semibold text-sm">
                                          {" "}
                                          Distance: {item.TotalDistance}
                                          {item.endFuel && item.startFuel && (
                                            <div>
                                              <p style={{ display: "flex" }}>
                                                Start Fuel: {item.startFuel} %
                                              </p>
                                              <p style={{ display: "flex" }}>
                                                End Fuel: {item.endFuel} %
                                              </p>
                                              <p style={{ display: "flex" }}>
                                                Consumed Fuel (in per%): {item.consumedpercentage}
                                              </p>
                                              <p style={{ display: "flex" }}>
                                                Consumed Fuel (in ltr): {item.fuelComsumed}
                                              </p>

                                            </div>
                                          )}
                                          {item.mpl && (
                                            <div>
                                              <p style={{ display: "flex" }}>
                                                {" "}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                  <path d="M3 13L5 6H19L21 13H3Z" fill="#555" />
                                                  <circle cx="7" cy="17" r="2" fill="#555" />
                                                  <circle cx="17" cy="17" r="2" fill="#555" />
                                                  <path d="M17 3C17 3 19 5 19 7.5C19 9.985 17 11 17 11C17 11 15 9.985 15 7.5C15 5 17 3 17 3Z" fill="#00A86B" />
                                                </svg>
                                                {item?.mpl}
                                              </p>
                                            </div>
                                          )
                                          }
                                          {item?.DriverName && (
                                            <div>
                                              <p style={{ display: "flex" }}>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="20"
                                                  height="20"
                                                  style={{
                                                    filter:
                                                      "drop-shadow(1px 2px 2px #000000)",
                                                    marginRight: "0.5%",
                                                  }}
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    fill="currentColor"
                                                    d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"
                                                  />
                                                </svg>
                                                {item?.DriverName}
                                              </p>
                                            </div>
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-10 mt-5">
                                      <div className="col-span-1">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-8 w-8 text-green"
                                          viewBox="0 0 512 512"
                                          style={{
                                            filter:
                                              "drop-shadow(1px 2px 2px #000000)",
                                          }}
                                        >
                                          <circle
                                            cx="256"
                                            cy="192"
                                            r="32"
                                          // fill="currentColor"
                                          />
                                          <path
                                            fill="currentColor"
                                            d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                                          />
                                        </svg>
                                        <div className=" border-l-2 h-10 border-green  mx-4 my-3"></div>
                                      </div>
                                      <div className="col-span-8 ">
                                        <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                                          <p className="text-green ">
                                            {" "}
                                            Location Start:
                                          </p>{" "}
                                          <p className="text-black text-sm font-popins">
                                            {item.StartingPoint}
                                          </p>
                                        </p>
                                        <p className=" text-black text-start font-semibold text-sm font-popins">
                                          {" "}
                                          Trip Start:{" "}
                                          {item.TripStartDateLabel} &nbsp;
                                          {item.TripStartTimeLabel}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-10">
                                      <div className="col-span-1">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-8 w-8 text-green"
                                          viewBox="0 0 512 512"
                                          style={{
                                            filter:
                                              "drop-shadow(1px 2px 2px #000000)",
                                          }}
                                        >
                                          <circle
                                            cx="256"
                                            cy="192"
                                            r="32"
                                          // fill="currentColor"
                                          />
                                          <path
                                            fill="currentColor"
                                            d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                                          />
                                        </svg>
                                      </div>
                                      <div className="col-span-8 ">
                                        <div className="text-start font-bold text-md text-labelColor">
                                          <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                                            <span className="text-green">
                                              {" "}
                                              Location End:
                                            </span>{" "}
                                            <br></br>
                                            <p className="text-black text-sm font-popins">
                                              {" "}
                                              {item.EndingPoint}
                                            </p>
                                          </p>
                                        </div>
                                        <p className=" text-black text-start font-semibold text-sm">
                                          {" "}
                                          Trip End:{
                                            item.TripEndDateLabel
                                          }{" "}
                                          &nbsp;
                                          {item.TripEndTimeLabel}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Typography>
                              </AccordionDetails>
                            ))}
                          </Accordion>
                        </div>
                      </ul>
                    </div>
                  )
                )
                : dataresponse?.map((item: TripsByBucket, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleDivClick(
                        item.fromDateTime,
                        item.toDateTime,
                        item.id
                      )
                    }}
                  >
                    <div
                      className="py-5 hover:bg-[#e1f0e3] px-5 cursor-pointer border-b"
                      onClick={() => handleGetItem(item, index)}
                      style={{
                        backgroundColor:
                          activeTripColor.id === item.id ? "#e1f0e3" : "",
                      }}
                    >
                      <div className="grid grid-cols-12 space-x-3">
                        <div className="col-span-1">

                          <svg
                            fill="#00b576"
                            height="50"
                            width="45"
                            viewBox="0 -43.92 122.88 122.88"
                            version="1.1"
                            id="Layer_1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            style={{
                              filter: "drop-shadow(1px 2px 2px #000000)",
                              marginTop: "-0.8rem",
                            }}
                            xmlSpace="preserve"
                            transform="matrix(1, 0, 0, 1, 0, 0)"
                            stroke="#00b576"
                          >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                            <g
                              id="SVGRepo_tracerCarrier"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <g id="SVGRepo_iconCarrier">
                              <g>
                                <path
                                  className="st0"
                                  d="M99.42,13.57c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73 C88.69,18.37,93.49,13.57,99.42,13.57L99.42,13.57z M79.05,5c-0.59,1.27-1.06,2.69-1.42,4.23c-0.82,2.57,0.39,3.11,3.19,2.06 c2.06-1.23,4.12-2.47,6.18-3.7c1.05-0.74,1.55-1.47,1.38-2.19c-0.34-1.42-3.08-2.16-5.33-2.6C80.19,2.23,80.39,2.11,79.05,5 L79.05,5z M23.86,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99c-2.75,0-4.99-2.23-4.99-4.99 C18.87,21.54,21.1,19.31,23.86,19.31L23.86,19.31z M99.42,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99 c-2.75,0-4.99-2.23-4.99-4.99C94.43,21.54,96.66,19.31,99.42,19.31L99.42,19.31z M46.14,12.5c2.77-2.97,5.97-4.9,9.67-6.76 c8.1-4.08,13.06-3.58,21.66-3.58l-2.89,7.5c-1.21,1.6-2.58,2.73-4.66,2.84H46.14L46.14,12.5z M23.86,13.57 c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73C13.13,18.37,17.93,13.57,23.86,13.57 L23.86,13.57z M40.82,10.3c3.52-2.19,7.35-4.15,11.59-5.82c12.91-5.09,22.78-6,36.32-1.9c4.08,1.55,8.16,3.1,12.24,4.06 c4.03,0.96,21.48,1.88,21.91,4.81l-4.31,5.15c1.57,1.36,2.85,3.03,3.32,5.64c-0.13,1.61-0.57,2.96-1.33,4.04 c-1.29,1.85-5.07,3.76-7.11,2.67c-0.65-0.35-1.02-1.05-1.01-2.24c0.06-23.9-28.79-21.18-26.62,2.82H35.48 C44.8,5.49,5.04,5.4,12.1,28.7C9.62,31.38,3.77,27.34,0,18.75c1.03-1.02,2.16-1.99,3.42-2.89c-0.06-0.05,0.06,0.19-0.15-0.17 c-0.21-0.36,0.51-1.87,1.99-2.74C13.02,8.4,31.73,8.52,40.82,10.3L40.82,10.3z"
                                />
                              </g>
                            </g>
                          </svg>
                        </div>
                        <div className="col-span-10 ">
                          <p className="text-start text-md   text-black font-popins font-semibold">
                            Duration: {item.TripDurationHr} Hour(s){" "}
                            {item.TripDurationMins} Minute(s)
                          </p>
                          <p className=" text-green text-start font-popins font-semibold text-sm">
                            {" "}
                            Distance: {item.TotalDistance}
                            {item.endFuel && item.startFuel && (
                              <div>
                                <p style={{ display: "flex" }}>
                                  Start Fuel: {item.startFuel} %
                                </p>
                                <p style={{ display: "flex" }}>
                                  End Fuel: {item.endFuel} %
                                </p>
                                <p style={{ display: "flex" }}>
                                  Consumed Fuel (in per%): {item.consumedpercentage}
                                </p>
                                <p style={{ display: "flex" }}>
                                  Consumed Fuel (in ltr): {item.fuelComsumed}
                                </p>

                              </div>
                            )}
                            {item.mpl && (
                              <div>
                                <p style={{ display: "flex" }}>
                                  {" "}
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 13L5 6H19L21 13H3Z" fill="#555" />
                                    <circle cx="7" cy="17" r="2" fill="#555" />
                                    <circle cx="17" cy="17" r="2" fill="#555" />
                                    <path d="M17 3C17 3 19 5 19 7.5C19 9.985 17 11 17 11C17 11 15 9.985 15 7.5C15 5 17 3 17 3Z" fill="#00A86B" />
                                  </svg>
                                  {item?.mpl}
                                </p>
                              </div>
                            )
                            }
                            {item?.DriverName && (
                              <div>
                                <p style={{ display: "flex" }}>
                                  {" "}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    style={{
                                      filter:
                                        "drop-shadow(1px 2px 2px #000000)",
                                      marginRight: "0.5%",
                                    }}
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"
                                    />
                                  </svg>
                                  {item?.DriverName}
                                </p>
                              </div>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-10 mt-5">
                        <div className="col-span-1">

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green"
                            viewBox="0 0 512 512"
                            style={{
                              filter: "drop-shadow(1px 2px 2px #000000)",
                            }}
                          >
                            <circle
                              cx="256"
                              cy="192"
                              r="32"

                            />
                            <path
                              fill="currentColor"
                              d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                            />
                          </svg>
                          <div className=" border-l-2 h-10 border-green  mx-4 my-3"></div>
                        </div>
                        <div className="col-span-8 ">
                          <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                            <p className="text-green "> Location Start:</p>{" "}
                            {/* <br></br>{" "} */}
                            <p className="text-black text-sm font-popins">
                              {item.StartingPoint}
                            </p>
                          </p>
                          <p className=" text-black font-popins text-start font-semibold text-sm lg:mr-0 md:mr-10">
                            {" "}
                            Trip Start: {item.TripStartDateLabel} &nbsp;
                            {item.TripStartTimeLabel}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-10">
                        <div className="col-span-1">

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green"
                            viewBox="0 0 512 512"
                            style={{
                              filter: "drop-shadow(1px 2px 2px #000000)",
                            }}
                          >
                            <circle
                              cx="256"
                              cy="192"
                              r="32"

                            />
                            <path
                              fill="currentColor"
                              d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                            />
                          </svg>
                        </div>
                        <div className="col-span-8 ">
                          <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                            <span className="text-green"> Location End:</span>{" "}
                            <br></br>
                            <p className="text-black text-sm font-popins">
                              {" "}
                              {item.EndingPoint}
                            </p>
                          </p>
                          <p className=" text-black  lg:mr-0 md:mr-10 text-start font-bold text-sm">
                            {" "}
                            Trip End:{item.TripEndDateLabel} &nbsp;
                            {item.TripEndTimeLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
          <div
            className="xl:col-span-4 lg:col-span-3 md:col-span-7 sm:col-span-12 col-span-4 journey_map"
            style={{ position: "relative" }}
          >
            <div onClick={() => {
              setMapcenterToFly(null);

            }}>
              <div onClick={handleuserclick}>

                {mapcenter !== null && (
                  <MapContainer
                    id="map"
                    zoom={zoom}
                    center={mapcenter}
                    className="z-0 journey_map"
                    minZoom={minzoom}
                    maxZoom={maxzoom}
                  >
                    {session?.journeymapType === 'Google' ? (
                      <LayersControl position="bottomright">
                        <>

                          <BaseLayer checked name="Google Map">
                            <TileLayer
                              url={`https://{s}.googleapis.com/maps/vt?lyrs=m&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                              attribution="Google Maps"
                            />
                          </BaseLayer>
                          <BaseLayer name="Google Maps Street View">
                            <TileLayer
                              url={`https://{s}.googleapis.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                              attribution="Street View"
                            />
                          </BaseLayer>
                        </>
                      </LayersControl>
                    ) :
                      (
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                        />
                      )
                    }



                    {loadingMap && polylinedata.length > 0 ? (
                      <>
                        <Polyline
                          pathOptions={{ color: "red", weight: 6 }}
                          positions={polylinedata}
                          eventHandlers={{
                            click: (e) => {
                              setClickPosition(TravelHistoryresponse.find((i) => {
                                return isClose(i.lat, e.latlng.lat) && isClose(i.lng, e.latlng.lng);
                              }));
                            },
                          }}

                        />
                        {/* <DirectionalPolyline
                          polylinedata={polylinedata}
                          isPlaying={isPlaying}
                          clickPosition={clickPosition}
                          onClick={
                            (e: L.LeafletMouseEvent) => {
                              let clickedPoint: any = TravelHistoryresponse.find((i) =>
                                isClose(i.lat, e.latlng.lat) && isClose(i.lng, e.latlng.lng)
                              );

                              if (clickedPoint) {
                                setClickPosition(clickedPoint);
                              } else {
                                const approx = TravelHistoryresponse.find((i) =>
                                  isClose(i.lat, e.latlng.lat, 0.001) && isClose(i.lng, e.latlng.lng, 0.001)
                                );

                                if (approx) {
                                  setClickPosition(approx);
                                }
                              }
                            }
                          }
                        /> */}
                      </>
                    ) : null}
                    {clickPosition && (
                      <Popup position={[clickPosition.lat, clickPosition.lng]} eventHandlers={{ remove: () => setClickPosition(null) }}>
                        <div>
                          <strong>Address:</strong> {clickPosition?.address?.display_name}<br />
                          <strong>Date:</strong> {clickPosition.date?.split("T").join(" ").split('.')[0]}<br />
                          <strong>Speed:</strong> {clickPosition.speed}<br />
                          <strong>Coordinates:</strong> {clickPosition.lat?.toFixed(6)}, {clickPosition.lng?.toFixed(6)}<br />
                        </div>
                      </Popup>
                    )}
                    {isPlaying ? (
                      <SetViewOnClick coords={mapcenter} zoom={zoom} />
                    ) : isPaused ? (
                      <SetViewOnClick coords={mapcenter} zoom={zoom} />
                    )
                      :

                      (
                        <SetViewfly coords={mapcenterToFly} zoom={zoomToFly} />
                      )
                    }



                    {loadingMap
                      ? carPosition && (
                        <Marker
                          position={carPosition}
                          icon={createMarkerIcon(getCurrentAngle(), Ignitionreport.vehicleType == "Bike1" ? bikemove :
                            Ignitionreport.vehicleType == "Boat" ? boatmove : carmove, Ignitionreport.vehicleType == "Bike1" ? [40, 60] : [30, 50])}
                        ></Marker>
                      )
                      : ""}

                    {lat && lng && (
                      <Marker
                        position={[lat, lng]}
                        icon={
                          new L.Icon({
                            iconUrl:
                              "https://img.icons8.com/fluency/48/000000/stop-sign.png",
                            iconAnchor: [22, 47],
                            popupAnchor: [1, -34],
                          })
                        }
                      ></Marker>
                    )}
                    {TravelHistoryresponse?.length > 0 && (
                      <div>
                        {loadingMap ? (
                          <Marker
                            position={[
                              TravelHistoryresponse[0].lat,
                              TravelHistoryresponse[0].lng,
                            ]}
                            icon={
                              new L.Icon({
                                iconUrl:
                                  "https://img.icons8.com/fluent/48/000000/marker-a.png",
                                iconAnchor: [22, 47],
                                popupAnchor: [1, -34],
                              })
                            }
                          ></Marker>
                        ) : (
                          ""
                        )}

                        {loadingMap ? (
                          <Marker
                            position={[
                              TravelHistoryresponse[
                                TravelHistoryresponse?.length - 1
                              ].lat,
                              TravelHistoryresponse[
                                TravelHistoryresponse?.length - 1
                              ].lng,
                            ]}
                            icon={
                              new L.Icon({
                                iconUrl:
                                  "https://img.icons8.com/fluent/48/000000/marker-b.png",
                                iconAnchor: [22, 47],
                                popupAnchor: [1, -34],
                              })
                            }
                          ></Marker>
                        ) : (
                          ""
                        )}
                      </div>
                    )}

                    {TravelHistoryresponse?.map((item) => {
                      if (item.vehicleEvents.length > 0) {
                        return item.vehicleEvents.map((items) => {
                          if (items.Event === "HarshBreak") {
                            return loadingMap ? (
                              <Marker
                                position={[item.lat, item.lng]}
                                icon={
                                  new L.Icon({
                                    iconUrl:
                                      "https://img.icons8.com/color/48/000000/brake-discs.png",
                                    iconSize: [40, 40],
                                    iconAnchor: [16, 37],
                                  })
                                }
                              >
                                {harshPopUp && <Popup>Harsh Break</Popup>}
                              </Marker>
                            ) : (
                              ""
                            );
                          }
                          if (items.Event === "HarshAcceleration") {
                            return loadingMap ? (
                              <Marker
                                position={[item.lat, item.lng]}
                                icon={
                                  new L.Icon({
                                    iconUrl:
                                      "https://img.icons8.com/nolan/64/speed-up.png",
                                    iconSize: [30, 30],
                                    iconAnchor: [16, 37],
                                  })
                                }
                              >
                                {harshAccPopUp && (
                                  <Popup>Harsh Acceleration</Popup>
                                )}
                              </Marker>
                            ) : (
                              ""
                            );
                          }
                          if (items.Event === "HarshCornering") {
                            return loadingMap ? (
                              <Marker
                                position={[item.lat, item.lng]}
                                icon={
                                  new L.Icon({
                                    iconUrl: HarshCornerningIcon.src,
                                    iconSize: [30, 30],
                                    iconAnchor: [16, 37],
                                  })
                                }
                              >
                                {harshAccPopUp && (
                                  <Popup>Harsh Cornering</Popup>
                                )}
                              </Marker>
                            ) : (
                              ""
                            );
                          }
                        });
                      }
                    })}



                  </MapContainer>
                )}

              </div>
            </div>

            {hidediv && (
              <>
                <div >

                  <div className="absolute flex items-start lg:top-4 lg:left-20 left-12 top-6 space-x-4">
                    <div className="xl:col-span-2 lg:col-span-4 md:col-span-5 sm:col-span-3 col-span-6 stop_journey max-w-xs lg:max-w-sm">
                      <div
                        className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 bg-green py-2 shadow-lg rounded-md cursor-pointer"
                        onClick={() => stopDetailsOpen && handleShowDetails()}
                      >
                        <div className="lg:col-span-11 md:col-span-10 sm:col-span-10 col-span-11 stop_details_responsive">
                          <p className="text-white lg:px-2 ps-1 text-lg text_responsive mr-24">
                            Stop Details ({loadingMap ? stopWithSecond.length : ""})
                          </p>
                        </div>
                        <div className="col-span-1 mt-1 lg:-ms-2 md:-ms-1 -ms-2">
                          {getShowICon ? (
                            <svg
                              className="h-5 w-5 text-white"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5 text-white"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" />
                              <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                              <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                              <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                              <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {getShowdetails && (
                        <div className={`bg-white overflow-y-scroll resposive_stop_details ${stopWithSecond.length > 1 ? "lg:h-60 md:h-60 sm:h-60 h-24" : ""}`}>
                          {stopWithSecond?.map((item: any) => {
                            let isActive = item.date === selectedItemId;
                            return loadingMap ? (
                              <div
                                key={item.date}
                                onClick={() => handleItemClick(item)}
                                className={`cursor-pointer ${isActive ? 'bg-[#e1f0e3]' : ''}`}
                              >
                                <p className="text-black font-popins px-2 py-2 text-sm">
                                  <b>{item?.address}</b>
                                </p>
                                <div className="grid grid-cols-12">
                                  <div className="lg:col-span-1 md:col-span-2 sm:col-span-6 col-span-2"></div>
                                  <div className="lg:col-span-8 md:col-span-8 sm:col-span-8 col-span-9 mx-2 text-center text-red text-bold px-1 w-full text-sm border-2 border-red stop_details_time">
                                    {item?.date?.slice(11, 19)}, {item?.time}
                                  </div>
                                </div>
                                <br />
                                <hr className="text-gray" />
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div onClick={handleFocus}
                      className="relative  cursor-pointer"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {isPlaying && userclick && (

                        <>
                          <Image src={FocusIconNew} alt="buttonIcon" className="h-11 p-1 bg-green" style={{
                            borderRadius: '10px',
                            borderWidth: '0px',
                            width: '44px',
                            borderStyle: 'solid',
                          }} />

                          {isHovered && (
                            <>
                              <div className="absolute top-0 left-full ml-2 bg-green text-white p-2 rounded-md whitespace-nowrap">
                                Focus
                              </div>


                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>



              </>
            )}

            <div className="grid lg:grid-cols-10 grid-cols-10" id="speed_meter">
              {isPlaying || isPaused ? (
                <div className="col-span-2 lg:w-64 md:w-60 sm:w-52 w-64">
                  <div className="flex flex-col gap-4">
                    {/* Speedometer Box */}
                    <CustomSpeedometer
                      value={
                        parseFloat(
                          getSpeedAndDistance()?.speed?.includes("Mph")
                            ? getSpeedAndDistance()?.speed?.replace("Mph", "")
                            : getSpeedAndDistance()?.speed?.replace("Kph", "")
                        ) || 0
                      }
                      max={140}
                      unit={getSpeedAndDistance()?.speed?.includes("Mph") ? "mph" : "km/h"}
                    />

                    {/* Journey Info Box Below */}
                    <JourneyInfo
                      distance={getSpeedAndDistance()?.distanceCovered}
                      address={addressTravelHistory}
                      time={getSpeedAndDistance()?.date}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {hideicondiv && hidediv && (
              <div
                className="grid grid-cols-1 absolute lg:top-10 xl:top-10 md:top-10 top-5 right-10 bg-bgLight py-2 px-2 cursor-pointer"
                onClick={() => setIsChecked(!isChecked)}
                style={{
                  borderRadius: '10px',
                  borderColor: 'green',
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  width: '160px', // Adjust width to make the div smaller
                  backgroundColor: 'white',

                }}
              >

                <div className="col-span-1" style={{ color: 'green' }}>
                  <button
                    className="text-labelColor font-popins text-xs font-bold ml-4" // Reduced font size and margin
                    style={{
                      width: '80%', // Make the button fill the container width
                      backgroundColor: 'white',
                    }}
                  >
                    Show Icon Details
                  </button>
                </div>


                {isChecked && TravelHistoryresponse?.length > 0 && (
                  <div className="mt-2 ml-1">
                    {/* Location Start and End */}
                    <div className="grid grid-cols-12 gap-2 mb-3">
                      <div className="col-span-2 flex flex-col items-center mt-1">
                        <Image src={markerA} alt="startIcon" className="h-4 w-4 mb-1" /> {/* Smaller icon size */}
                        <Image src={markerB} alt="endIcon" className="h-4 w-4 mt-1" /> {/* Smaller icon size */}
                      </div>
                      <div className="col-span-10 text-xs font-semibold mt-1"> {/* Reduced font size */}
                        <p>Location start</p>
                        <p className="mt-2">Location End</p>
                      </div>
                    </div>


                    <div className="space-y-2"> {/* Reduced spacing */}
                      {TravelHistoryresponse?.filter((item) =>
                        item.vehicleEvents.some(
                          (event) => event.Event === 'HarshAcceleration'
                        )
                      ).length > 0 && (
                          <div className="flex items-center gap-2">
                            <Image src={HarshAccelerationIcon} alt="harshAccelerationIcon" className="h-4 w-4" /> {/* Smaller icon size */}
                            <div
                              className="text-xs font-semibold"
                              style={{
                                maxWidth: 'calc(100% - 24px)', // Adjust width to account for icon size
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              Harsh Acceleration (x
                              {TravelHistoryresponse.reduce((count, item) =>
                                count +
                                item.vehicleEvents.filter(
                                  (event) => event.Event === 'HarshAcceleration'
                                ).length
                                , 0)}
                              )
                            </div>
                          </div>
                        )}

                      {TravelHistoryresponse?.filter((item) =>
                        item.vehicleEvents.some(
                          (event) => event.Event === 'HarshCornering'
                        )
                      ).length > 0 && (
                          <div className="flex items-center gap-2">
                            <Image src={HarshCornerningIcon} alt="harshCorneringIcon" className="h-4 w-4" /> {/* Smaller icon size */}
                            <div
                              className="text-xs font-semibold"
                              style={{
                                maxWidth: 'calc(100% - 24px)', // Adjust width to account for icon size
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              Harsh Cornering (x
                              {TravelHistoryresponse.reduce((count, item) =>
                                count +
                                item.vehicleEvents.filter(
                                  (event) => event.Event === 'HarshCornering'
                                ).length
                                , 0)}
                              )
                            </div>
                          </div>
                        )}

                      {TravelHistoryresponse?.filter((item) =>
                        item.vehicleEvents.some(
                          (event) => event.Event === 'HarshBreak'
                        )
                      ).length > 0 && (
                          <div className="flex items-center gap-2">
                            <Image src={harshAcceleration} alt="harshBrakingIcon" className="h-4 w-4" /> {/* Smaller icon size */}
                            <div
                              className="text-xs font-semibold"
                              style={{
                                maxWidth: 'calc(100% - 24px)', // Adjust width to account for icon size
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              Harsh Break (x
                              {TravelHistoryresponse.reduce((count, item) =>
                                count +
                                item.vehicleEvents.filter(
                                  (event) => event.Event === 'HarshBreak'
                                ).length
                                , 0)}
                              )
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}



            {hidediv && (

              <div className="absolute xl:left-56  xl:bottom-8 lg:bottom-8 md:bottom-8 sm:bottom-8 bottom-2 left-10  rounded-md  ml-0  2xl:ml-48">
                <div className="grid lg:grid-cols-5 grid-cols-5 gap-1 lg:py-5 py-2 pt-4 lg:pt-4 rounded-md mx-2 px-5 bg-white space-x-4">
                  <div className="lg:col-span-4 md:col-span-4 col-span-4">
                    <Slider
                      value={currentPositionIndex}
                      onChange={handleChangeValueSlider}
                      color="secondary"
                      style={{
                        color: "#00B56C",
                        cursor: isPlaying ? "pointer" : "not-allowed",
                      }}
                      max={polylinedata.length}
                      disabled={!isPlaying}
                    />
                    <div className="flex justify-center">
                      <div className="grid grid-cols-6">
                        <div className="col-span-2">
                          {isDynamicTime.TripStartTimeLabel}
                        </div>
                        <div className="col-span-3 flex items-center justify-center space-x-2">
                          <Tooltip content="Pause" className="bg-black">
                            <button
                              onClick={() => pausebtn && pauseTick()}
                              className={`h-5 w-5 ${pausebtn ? "cursor-pointer" : "cursor-not-allowed"}`}
                            >
                              <svg
                                className="h-5 w-5"
                                style={{ color: isPauseColor ? "green" : "black" }}
                                fill={isPauseColor ? "none" : "none"}
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" />
                                <line x1="4" y1="4" x2="4" y2="20" />
                                <line x1="20" y1="4" x2="20" y2="20" />
                                <rect x="9" y="6" width="6" height="12" rx="2" />
                              </svg>
                            </button>
                          </Tooltip>
                          <Tooltip content="Play" className="bg-black">
                            <button
                              onClick={() => playbtn && tick()}
                              className={`h-5 w-5 ${playbtn ? "cursor-pointer" : "cursor-not-allowed"}`}
                            >
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                style={{ color: isPlaying ? "green" : "black" }}
                                fill={isPlaying ? "green" : "black"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </button>
                          </Tooltip>
                          <Tooltip content="Stop" className="bg-black">
                            <button
                              onClick={() => stopbtn && stopTick()}
                              className={`h-4 w-4 ${stopbtn ? "cursor-pointer" : "cursor-not-allowed"}`}
                            >
                              <svg
                                className="h-4 w-4"
                                width="24"
                                style={{ color: stopVehicle ? "green" : "black" }}
                                fill={stopVehicle ? "green" : "black"}
                                height="24"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" />
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                              </svg>
                            </button>
                          </Tooltip>
                        </div>
                        <div className="col-span-1">
                          {isDynamicTime.TripEndTimeLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-1 md:col-span-1 col-span-1 mt-2">
                    {(isPlaying || isPaused) && (
                      <Select
                        onChange={(e: any) => setSpeedFactor(Number(e.value))}
                        options={SpeedOption}
                        placeholder="1X"
                        isSearchable={false}
                        className="rounded-md h-10 w-full outline-green border border-gray-300"
                        defaultValue={SpeedOption[0]}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            border: "none",
                            boxShadow: state.isFocused ? null : null,
                          }),
                          menu: (provided, state) => ({
                            ...provided,
                            zIndex: 9999,
                            position: "absolute",
                            top: "auto",
                            bottom: "100%",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? "#00B56C"
                              : state.isFocused
                                ? "white"
                                : "transparent",
                            color: state.isSelected
                              ? "white"
                              : state.isFocused
                                ? "black"
                                : "black",
                            "&:hover": {
                              backgroundColor: "#00B56C",
                              color: "white",
                            },
                          }),
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
}

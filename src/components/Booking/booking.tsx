"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";
import { Table, Tooltip, Tag, Image, Dropdown } from "antd";
import { CloseCircleOutlined, CarOutlined } from "@ant-design/icons";
import moment from "moment";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons"; // Specific icons for actions
import {
  createBooking,
  getAllVehicleByUserId,
  getBooking,
  GetDriverDataByClientId,
  vehicleListByClientId,
  deleteBooking,
  updateBooking,
  getSearchAddress,
  getCurrentAddress,
  //   fetchRoute,
  getVehicleDataByClientId,
} from "@/utils/API_CALLS";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import L from "leaflet"; // Moved to dynamic import to fix SSR
import { useMap } from "react-leaflet"; // Moved to dynamic import
import DatePicker from "react-datepicker";
import { addWeeks, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

/////////////////
interface ModalProps {
  title: string;
  color: string; // Tailwind color like "bg-red", "bg-green", "bg-yellow"
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

const Modal: React.FC<ModalProps> = ({ title, color, onClose, children, footer, width = "w-[400px]" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center !z-[9999]">
    <div className={`bg-white rounded-lg shadow-xl ${width}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${color} px-4 py-2 rounded-t-lg`}>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="text-white hover:text-gray-200">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-6">{children}</div>

      {/* Footer */}
      {footer && <div className="flex justify-center my-4">{footer}</div>}
    </div>
  </div>
);

/////////////////



const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  {
    ssr: false,

    loading: () => (
      <div className="flex items-center justify-center h-full">
        Loading map...
      </div>
    ),
  }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((module) => module.Polyline),
  { ssr: false }
);

// Additional dynamic imports for components that were causing SSR issues
const LayersControl = dynamic(
  () => import("react-leaflet").then((module) => module.LayersControl),
  { ssr: false }
);

import "./index.css";
import "leaflet/dist/leaflet.css";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { VehicleData } from "@/types/vehicle";
import { socket } from "@/utils/socket";
import LiveCars from "../LiveTracking/LiveCars";
import { ClientSettings } from "@/types/clientSettings";

import { redirect } from "next/navigation";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../utils/firebaseConfig";
// import { LoadScript } from "@react-google-maps/api";
// import MapComponent from "@/app/Bookings/direction";
import { calculateZoomCenter } from "@/utils/JourneyReplayFunctions";
// import { usePlacesAutocomplete } from "./usePlaceAutoComplet";
import AddressAutocomplete from "./AddressautoComplete";

// const libraries: ("places")[] = ["places"];
const BaseLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl.BaseLayer),
  { ssr: false }
);

function Bookings() {
  const { data: session } = useSession();
  // const { BaseLayer } = LayersControl;
  const [disabledPickup, setDisabledPickup] = useState(false);
  const defaultFormData = {    
    _id: "",
    id: "",
    pickup: "",
    pickupNotes: "",
    destination: "",
    destinationNotes: "",
    date: "",
    time: "",
    name: "",
    contact: "",
    email: "",
    vehicleId: null,
    driverId: null,
    description: "",
    clientId: session?.clientId,
    coordinates: [],
    journey: "oneway",
    bookingType: "local",
    multiBooking: false,
    confirmEmail: false,
    serviceType: "",
    timer: 0,
    disabledPickup: false,
    AllowImage: false,
    Allowsignature: false,
    status:""
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [bookings, setbookings] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [cancelModal, setCancelModal] = useState(false);
  const [dispatchModal, setDispatchModal] = useState(false);
  const [bookingUpdate, setUpdateBooking] = useState(null);
  const [category, setCategory] = useState<string>("delivery");
  // const [selectedBooking, setSelectedBooking] = useState(null);
  const menuItems = [
    {
      key: "dispatch",
      icon: <CarOutlined style={{ color: "green", fontSize: "18px" }} />,
      label: (
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "green" }}>
          Dispatch
        </span>
      ),
      onClick: () => {
        if (bookingUpdate?.driverId != null) {
          toast.error("Booking Already Dispatch");
          return;
        }
        setDispatchModal(true);
        setMenuVisible(false);
      },
    },
    {
      key: "cancel",
      icon: <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />,
      label: (
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "red" }}>
          Cancel
        </span>
      ),
      onClick: () => {
        setCancelModal(true);
        setMenuVisible(false);
      },
    },
  ];
  const [isEdit, setisEdit] = useState(false);
  const [rawbookings, setRawbookings] = useState<any[]>([]);
  const [metadata, setMetaData] = useState({
    today: 0,
    pre: 0,
    recent: 0,
    complete: 0,
    cancel: 0,
    Scheduled: 0
  });

  useEffect(() => {
    const handleClick = () => setMenuVisible(false);

    // Attach listener
    document.addEventListener("click", handleClick);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const [period, setPeriod] = useState("");
  const [pickupPoint, setPickup] = useState<{
    address: string | null;
    lat: number | null;
    lng: number | null;
  }>({
    address: "",
    lat: null,
    lng: null,
    // lat: 24.89991082510067, lng: 67.10752562007359
  });
  const [destinationPoint, setDestination] = useState<{
    address: string | null;
    lat: number | null;
    lng: number | null;
  }>({
    address: "",
    lat: null,
    lng: null,
    // lat: 24.898568771127, lng: 67.11744062181613
  });
  // const [selectingField, setSelectingField] = useState<'pickup' | 'destination'>('pickup');
  // const [googlemodal, setGoogleModal] = useState(false);
  const [formdata, setFormData] = useState(defaultFormData);
  const [mapcenter, setMapcenter] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const [zoom, setZoom] = useState(12);
  const [mapcenterToFly, setMapcenterToFly] = useState<LatLngTuple | null>(
    null
  );
  const [zoomToFly, setzoomToFly] = useState(10);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [showdrivers, setShowDriver] = useState(false);
  const [allowMultiBook, setAllowMultiBook] = useState(false);

  const [id, setId] = useState("");



  if (!session?.featureBookingApp) {
    redirect("/liveTracking");
  }

  function getBookings() {
    const today = moment()
      .tz(session?.timezone)
      .clone()
      .startOf("day")
      .format("YYYY-MM-DD");

    getBooking({
      token: session?.accessToken,
      query: { clientId: session?.clientId },
    }).then((resp: any) => {
      if (resp?.success) {
        setRawbookings(resp.data);
        setMetaData({
          today: resp.data.filter((i) => {
            return i.date.toString() === today.toString();
          }).length,
          pre: resp.data.filter((i) => {
            return i.status.toString() === "Allocated";
          }).length,

          recent: resp.data.length,
          complete: resp.data.filter((i) => {
            return i.status.toString() === "Complete";
          }).length,
          cancel: resp.data.filter((i) => {
            return i.status.toString() === "Cancelled";
          }).length,
        });
        setbookings(resp.data);
      } else {
        toast.error(resp.message);
      }
    });
  }
  const [clientSettings, setClientSettings] = useState<ClientSettings[]>([]);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      // Example: Show custom alert/toast
      if (payload?.notification) {
        if (payload?.notification.title?.includes("Driver")) {
          getdriverData();
        }

        if (payload?.notification.title?.includes("Booking")) {

          getBookings();
        }


      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getclientSettings = async () => {
      if (session) {
        setClientSettings(session?.clientSetting);
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
              setMapcenter({ lat, lng });
            }
          }
        }

        const clientZoomSettings = await session?.clientSetting?.filter(
          (el) => el?.PropertDesc === "Zoom"
        )[0]?.PropertyValue;
        const zoomLevel = clientZoomSettings
          ? parseInt(clientZoomSettings)
          : 13;
        setZoom(zoomLevel);
      }
    };
    getclientSettings();
  }, [session]);

  useEffect(() => {
    if (pickupPoint?.lat && destinationPoint?.lat) {
      const getroutes = async () => {
        if (typeof window !== "undefined") {
          const res = await fetch(
            `/api/direction?origin=${pickupPoint?.lat},${pickupPoint?.lng}&destination=${destinationPoint?.lat},${destinationPoint?.lng}`
          );
          const { distance, duration, Polyline } = await res.json();
          setRouteCoords(Polyline);
          setDistance(distance);
          setDuration(duration);

          const { zoomlevel, centerLat, centerLng } = calculateZoomCenter(
            Polyline.map((i) => {
              return { lat: i[0], lng: i[1] };
            })
          );

          setzoomToFly(zoomlevel);
          setMapcenterToFly([centerLat, centerLng]);
        }
      };
      if (pickupPoint?.lat && pickupPoint?.lng && destinationPoint?.lat && destinationPoint?.lng) {
        getroutes();
      }
    }
  }, [pickupPoint, destinationPoint]);

  useEffect(() => {
    const today = moment()
      .tz(session?.timezone)
      .clone()
      .startOf("day")
      .format("YYYY-MM-DD");
    switch (period) {
      case "today":
        setbookings(
          rawbookings.filter((i) => {
            return i.date.toString() === today.toString();
          })
        );
        break;
      case "Recent":
        setbookings(rawbookings);
        break;
      case "Complete":
        setbookings(
          rawbookings.filter((i) => {
            return i.status.toString() === "Complete";
          })
        );
        break;
      case "Allocated":
        setbookings(
          rawbookings.filter((i) => {
            return i.status.toString() === "Allocated";
          })
        );
        break;
      case "Cancelled":
        setbookings(
          rawbookings.filter((i) => {
            return i.status.toString() === "Cancelled";
          })
        );
        break;

      //todaywork
      case "Scheduled":
        setbookings(
          rawbookings.filter((i) => {
            return i.status.toString() === "Scheduled";
          })
        );
        break;
      ///////
      case "future":
        setbookings(
          rawbookings.filter((i) => {
            const inputDate = new Date(i.date);
            inputDate.setHours(0, 0, 0, 0);
            let date = new Date(today);
            date.setHours(0, 0, 0, 0);
            return i.status.toString() === "Allocated" && inputDate > date;
          })
        );
        break;
      case "":
        setbookings(rawbookings);
        break;
      default:
        null;
    }
  }, [period]);
  const [columns] = useState([
    {
      title: "Pickup Point",
      dataIndex: "pickup",
      key: "pickup",
      width: 180, // Fixed width for better control
      ellipsis: {
        showTitle: false, // Prevents default title attribute, use custom Tooltip
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
      width: 180, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Vehicle Reg",
      dataIndex: "vehicleReg",
      key: "vehicleReg",
      width: 100, // Fixed width for consistency
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Driver",
      dataIndex: "driver",
      key: "driver",
      width: 100, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 100, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      width: 100, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 150, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Driver Notes",
      dataIndex: "description",
      key: "description",
      width: 150, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Date Time",
      dataIndex: "datetime",
      key: "datetime",
      width: 140, // Fixed width for date/time
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status", // Key should match dataIndex for unique identification
      width: 100, // Fixed width
      render: (status: any, record: any) => {
        let color;
        switch (status) {
          case "Allocated":
            color = "processing"; // Blue, indicates it's in the system/being processed
            break;
          case "OnMyWay":
            color = "volcano"; // Orange/Red, indicates active movement
            break;
          case "Arrived":
            color = "cyan"; // Cyan, indicates arrival
            break;
          case "InTrip":
            color = "geekblue"; // Blue, indicates trip in progress
            break;
          case "Approaching":
            color = "purple"; // Purple, indicates nearing destination
            break;
          case "Complete":
            color = "success"; // Green, indicates successful completion
            break;
          case "Cancelled":
            color = "error"; // Red, indicates cancellation
            break;
          case "Pending":
            color = "warning"; // Yellow, indicates waiting/not started yet
            break;
          default:
            color = "default"; // Grey for unknown/unexpected status
        }

        if (status === "Complete" && record.signature) {
          return (
            <Tooltip
              placement="topLeft"
              title={
                <div className="flex flex-col items-center">
                  <span>{status}</span>
                  <Image
                    src={
                      record.signature
                      // "https://vtracksolutions.s3.eu-west-2.amazonaws.com/images/signature.png"
                    }
                    alt="status"
                    className="mt-2 rounded-md"
                    width={120}
                  />
                </div>
              }
            >
              <Tag color={color}>{status.toUpperCase()}</Tag>
            </Tooltip>
          );
        }

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },

    {
      title: "Actions",
      key: "_id",
      dataIndex: "_id",
      width: 90, // Fixed width for action buttons
      fixed: "right", // Keep actions column visible when scrolling horizontally
      render: (text, record) => (
        <div className="flex gap-2 justify-center">
          {/* Edit Icon */}
          <FontAwesomeIcon
            icon={faEdit}
            className="w-5 h-5 cursor-pointer text-blue-500 hover:text-blue-700 transition-colors"
            onClick={() => {
              setPickup(record.pickupPoint);
              setDestination(record.destinationPoint);
              setisEdit(true);
              setModalOpen(true);
              setFormData(record);
              console.log(record)
              setRouteCoords(record?.coordinates);
            }}
          />

          {/* Delete Icon */}
          <FontAwesomeIcon
            icon={faTrashAlt}
            className="w-5 h-5 cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            onClick={() => {
              setId(text);
              setDeleteModal(true);
            }}
          />
        </div>
      ),
    },
  ]);

  const handleInputChangeJourney: any = (e: any) => {
    setFormData((prev) => ({ ...prev, journey: e.target.value }));
  };
  const handleInputChangeConfirmEmail: any = (e: any) => {
    setFormData((prev) => ({ ...prev, confirmEmail: !formdata.confirmEmail }));
  };

  const handleInputChangesignature: any = (e: any) => {
    setFormData((prev) => ({ ...prev, Allowsignature: !formdata.Allowsignature }));
  };
  const handleInputChangeAllowImage: any = (e: any) => {
    setFormData((prev) => ({ ...prev, AllowImage: !formdata.AllowImage }));
  };

  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [DriverData, setDriverData] = useState<pictureVideoDataOfVehicleT[]>(
    []
  );

  const [Drivertracking, setDriverTracking] = useState<
    pictureVideoDataOfVehicleT[]
  >([]);

  const [driverOptions, setDriverOptions] = useState<any[]>([]);

  const vehicleListData = async () => {
    try {
      if (session?.userRole == "Admin" || session?.userRole == "SuperAdmin") {
        if (session) {
          const Data = await vehicleListByClientId({
            token: session?.accessToken,
            clientId: session?.clientId,
          });
          setVehicleList(Data.data);
        }
      } else {
        if (session) {
          const Data = await getAllVehicleByUserId({
            token: session?.accessToken,
            userId: session?.userId,
          });
          setVehicleList(Data.data);
        }
      }
    } catch (error) { }
  };

  const getdriverData = async () => {
    const response = await GetDriverDataByClientId({
      token: session?.accessToken,
      clientId: session?.clientId,
    });
    let drivers = response
      .filter((item: any) => item.isDeleted === false)
      .sort((a: any, b: any) =>
        a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1
      );
    setDriverData(drivers);
    setDriverTracking(
      drivers
        .filter((item: any) => item.GpsElement?.Y && item.GpsElement?.X)
        .map((i) => {
          return {
            ...i,
            gps: {
              latitude: i?.GpsElement?.Y,
              longitude: i?.GpsElement?.X,
            },
            vehicleReg: `${i.driverfirstName || ""} ${i.driverMiddleName || ""} ${i.driverLastName || ""
              }`.trim(),
            vehicleStatus: "Parked",
          };
        })
    );

    setDriverOptions(
      drivers.map((i) => ({
        label: `${i.driverfirstName || ""} ${i.driverMiddleName || ""} ${i.driverLastName || ""
          }`.trim(),
        value: i._id,
      }))
    );
  };
  useEffect(() => {
    vehicleListData();
    getdriverData();
    if (typeof window !== "undefined") {
      getdriverData();
      vehicleListData();
      getBookings();
    }
  }, []);
  const fetchTimeoutGraphQL = 60 * 1000; //60 seconds
  const [isOnline, setIsOnline] = useState(false);
  const [updatedData, setUpdateData] = useState<VehicleData[]>([]);
  const carData = useRef<VehicleData[]>([]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
  }, []);

  const [isFirstTimeFetchedFromGraphQL, setIsFirstTimeFetchedFromGraphQL] =
    useState(false);

  useEffect(() => {
    let interval = setInterval(() => {
      setIsFirstTimeFetchedFromGraphQL((prev) => !prev);
      getdriverData();
    }, fetchTimeoutGraphQL); // Runs every fetchTimeoutGraphQL seconds

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, [isOnline, session?.clientId]);
  ///get vehicle data
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

          let uniqueData = uniqueDataByIMEIAndLatestTimestamp(
            parsedData
          ).filter((i) => {
            return i.DriverName != "" && i.DriverName != null;
          });

          setUpdateData(uniqueData);
          carData.current = uniqueData;
        }
      }
    }
    dataFetchHandler();
  }, [isFirstTimeFetchedFromGraphQL]);

  useEffect(() => {
    if (updatedData && updatedData.length > 0) {
      const positions: LatLng[] = updatedData.map((data) =>
        L.latLng(data.gps.latitude, data.gps.longitude)
      );

      const bounds = L.latLngBounds(positions);
      var zoom;
      var center: LatLng | undefined;

      if (bounds.isValid()) {
        center = bounds.getCenter();
        /*  setMapCoordinates(center); */
        setMapcenterToFly(center);
        const lats = updatedData.map((data) => data.gps.latitude);
        const lngs = updatedData.map((data) => data.gps.longitude);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const latDistance = maxLat - minLat;
        const lngDistance = maxLng - minLng;

        const latZoom = Math.floor(Math.log2(360 / (0.5 * latDistance)));
        const lngZoom = Math.floor(Math.log2(360 / (0.5 * lngDistance)));

        zoom = Math.min(latZoom, lngZoom);
        setzoomToFly(zoom);
      }
    }
  }, [carData.current, updatedData]);
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
            ).filter((i) => {
              return i.DriverName != "" && i.DriverName != null;
            });

            setUpdateData(uniqueData);

            carData.current = uniqueData;
          }
        );
      } catch (err) { }
    }
    if (!isOnline) {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isOnline, session?.clientId]);
  const handleInputChangeVehicle = (e: any) => {
    if (e?.value) {
      setFormData((prev) => ({ ...prev, vehicleId: e.value }));
    }
  };

  const serviceOptions = [
    { value: "engineering", label: "Engineering", timer: 30 },
    { value: "support", label: "Support", timer: 20 },
    { value: "IT", label: "IT", timer: 40 },
    { value: "cleaning", label: "Cleaning", timer: 40 },
  ];

  const handleInputChangeServiceType = (e: any) => {
    if (e?.value) {
      setFormData((prev) => ({
        ...prev,
        serviceType: e.value,
        timer: serviceOptions.find((i) => i.value == e?.value)?.timer,
      }));
    }
  };
  const handleInputChangeDriver = (e: any) => {
    if (e?.value) {
      let vehicle: string | undefined = vehicleList.find(
        (i: DeviceAttach) => i.driverId == e.value
      )?._id;

      setFormData((prev) => ({
        ...prev,
        driverId: e.value,
        vehicleId: vehicle
          ? vehicle
          : formdata.vehicleId
            ? formdata.vehicleId
            : null
      }));
    }
  };

  const options =
    vehicleList?.map((item: any) => ({
      value: item._id,
      label: item.vehicleReg,
    })) || [];
  const [addresses, setAddresses] = useState<[]>([]);
  const [query, setquery] = useState("");
  const [addresses1, setAddresses1] = useState<[]>([]);
  const [query1, setquery1] = useState("");

  const handleInputChange = (e: any, key: any) => {
    let query: string = e;

    if (session && query) {
      getSearchAddress({
        query: query,
        country: session?.country,
      })
        .then((response) => {
          if (key == "pickup") {
            setAddresses(response);
            setquery(query);
          } else {
            setAddresses1(response);
            setquery1(query);
          }
          // if (query != "") {

          //     setFormData((prev) => ({ ...prev, [key]: query }))
          // }
        })
        .catch((error) => { });
    }
  };
  const optionsCitys: any =
    query != ""
      ? [
        { label: query },
        ...addresses?.map((item: any) => ({
          value: JSON.stringify(item),
          label: item.display_name,
        })),
      ]
      : formdata.pickup != ""
        ? [{ label: formdata.pickup }]
        : [];

  const optionsCitys2: any =
    query1 != ""
      ? [
        { label: query1 },
        ...addresses1?.map((item: any) => ({
          value: JSON.stringify(item),
          label: item.display_name,
        })),
      ]
      : formdata.destination != ""
        ? [{ label: formdata.destination }]
        : [];

  const bookingTypeOptions = [
    { label: "Local", value: "local" },
    { label: "Web", value: "web" },
    { label: "On Call", value: "call" },
  ];
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formdata.date == "") {
      toast.error("Enter Date");
      return;
    }
    if (formdata.time == "") {
      toast.error("Enter Time");
      return;
    }
    if (formdata.contact == "") {
      toast.error("Contact No field is Compulsory");
      return;
    }

    if (isEdit == true) {
      
      updateBooking({
        token: session?.accessToken,
        payload: {
          ...formdata,
          pickupPoint,
          destinationPoint,
          coordinates: routeCoords,
          status: bookings.find((i) => { i._id == formdata._id })?.driverId == formdata.driverId ? formdata.status : "allocated"
        },
      }).then((resp) => {
        if (resp?.success) {
          toast.success(resp.message);
          getBookings();
          setModalOpen(false);
          setDuration("")
          setDistance("")
          setFormData(defaultFormData);
          setisEdit(false);
          setPickup({ address: "", lat: null, lng: null });
          setDestination({ address: "", lat: null, lng: null });
          setRouteCoords([]);
          return;
        } else {
          toast.error(resp.message);
          return;
        }
      });
    } else {
      const payload = {
        ...formdata,
        selectedDays,
        startingAt: startDate,
        endingAt: endDate,
        numWeeks,
        category,
        pickupPoint,
        destinationPoint,
        coordinates: routeCoords,
        status: formdata.driverId ? "allocated" : "pending"

      }

      createBooking({
        token: session?.accessToken,
        payload
      }).then((resp) => {
        if (resp?.success) {
          toast.success(resp.message);
          getBookings();
          setModalOpen(false);
          setFormData(defaultFormData);
          setisEdit(false);
          setPickup({ address: "", lat: null, lng: null });
          setDestination({ address: "", lat: null, lng: null });
          setRouteCoords([]);
          setAllowMultiBook(false)
          setSelectedDays([])
          setNumWeeks(1)
          setStartDate(new Date())
          setEndDate(addWeeks(new Date(), 1))
          return;
        } else {
          toast.error(resp.message);
          return;
        }
      });
    }
  };

  const handleMultiBooking = async () => {
    setAllowMultiBook((prev) => !prev);
    if (allowMultiBook == false) {
      setFormData((prev) => ({ ...prev, multiBooking: true }));
    } else {
      setFormData((prev) => ({ ...prev, multiBooking: false }));
    }
  }

  const [filterValue, setFilterValue] = useState("");

  const filterValueChange = (e) => {
    const filterValue = e.target?.value.toLowerCase();
    setFilterValue(filterValue);
  };

  useEffect(() => {
    setbookings(
      rawbookings.filter((item: any) => {
        if (
          item.driver?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.vehicleReg?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.contact?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.pickup?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.destination?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.description?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.datetime?.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.status?.toLowerCase().includes(filterValue.toLowerCase())
        ) {
          return item;
        } else {
          return false;
        }
      })
    );
  }, [filterValue]);

  const SetViewfly = ({ coords, zoom }: { coords: any; zoom: number }) => {
    const map = useMap();
    if (coords && !Number.isNaN(coords[0]) && coords[0] != null) {
      map.flyTo(coords, zoom);
    }
    return null;
  };




  const daysOptions = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const [selectedDays, setSelectedDays] = useState([]);
  const [availableDays, setAvailableDays] = useState(daysOptions);
  const [numWeeks, setNumWeeks] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addWeeks(new Date(), 1));
  const [manualEndDate, setManualEndDate] = useState(false);


  // Handle selecting a day
  const handleDaySelect = (option) => {
    if (!option) return;
    setSelectedDays((prev) => [...prev, option]);
    setAvailableDays((prev) => prev.filter((day) => day.value !== option.value));
  };

  // Handle deselecting a day
  const removeDay = (day) => {
    setSelectedDays((prev) => prev.filter((d) => d.value !== day.value));
    setAvailableDays((prev) => [...prev, day].sort((a, b) => daysOptions.findIndex(d => d.value === a.value) - daysOptions.findIndex(d => d.value === b.value)));
  };

  // Auto update end date if not manually changed
  useEffect(() => {
    if (!manualEndDate) {
      setEndDate(addWeeks(startDate, numWeeks));
    }
  }, [startDate, numWeeks, manualEndDate]);














  return (
    <div className="flex flex-col">
      <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
        Manage Bookings
      </p>
      <div className="grid xl:grid-cols-12 lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12 bg-white ">
        <div className="xl:col-span-4 lg:col-span-4 md:col-span-4   sm:col-span-4 p-4">
          <div className="relative w-full bg-white overflow-x-auto max-h-[250px] min-h-[250px] p-4 border rounded-md border-black">
            <div className="text-lg flex   justify-center font-medium">
              Driver On Board
            </div>
            <table className="min-w-full table-auto">
              <thead className="bg-[#E2E8F0]">
                <tr>
                  <th className=" text-center  ">S.No</th>
                  <th className="  text-left">Driver</th>
                  <th className=" text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {DriverData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className=" text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  DriverData.map((item: any, index) => (
                    <tr
                      key={item.id} // Ensure you have a unique key, here using item.id
                      className="border-b hover:bg-[#D1FAE5]"
                      onClick={(e) => {
                        setSelectedVehicle({
                          DriverName:
                            `${item.driverfirstName || ""} ${item.driverMiddleName || ""} ${item.driverLastName || ""
                              }`.trim()
                        });
                      }}
                    >
                      <td className="text-center">{index + 1}</td>
                      <td className="text-left">
                        {(
                          item.driverfirstName +
                          " " +
                          item.driverMiddleName +
                          " " +
                          item.driverLastName
                        )?.replaceAll("undefined", "")}
                      </td>
                      <td
                        className={`break-words text-left ${item.isOnline ? "text-green" : "text-red"
                          }`}
                      >
                        {item.isOnline ? "Online" : "Offline"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* </div> */}
          </div>
        </div>
        <div className="xl:col-span-8 lg:col-span-8 md:col-span-8 sm:col-span-4 p-4">
          {typeof window !== "undefined" && mapcenter?.lat !== null && (
            <div className="relative w-full bg-white border rounded-md border-black max-h-[250px] min-h-[250px] h-[250px] overflow-hidden z-0">
              <MapContainer
                center={mapcenter}
                zoom={zoom}
                style={{ height: "250px", width: "100%" }} // clean inline style
              >
                {session?.livemapType === "Google" && (
                  <LayersControl position="bottomright">
                    <>
                      {/* Google Map Layer */}
                      <BaseLayer checked name="Google Map">
                        <TileLayer
                          url={`https://{s}.googleapis.com/maps/vt?lyrs=m&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                          subdomains={["mt0", "mt1", "mt2", "mt3"]}
                          attribution="Google Maps"
                        />
                      </BaseLayer>
                      {/* Google Street View Layer */}
                      <BaseLayer name="Google Maps Street View">
                        <TileLayer
                          url={`https://{s}.googleapis.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                          subdomains={["mt0", "mt1", "mt2", "mt3"]}
                          attribution="Street View"
                        />
                      </BaseLayer>
                    </>
                  </LayersControl>
                )}
                {session?.livemapType !== "Google" && (
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                  />
                )}

                <div
                  className="absolute lg:top-8 xl:top-8 md:top-8 top-5 right-10 
             bg-white shadow-md rounded-xl border border-green-500 px-2 py-1 flex items-center gap-2"
                  style={{ zIndex: 1000 }}
                >
                  {[
                    {
                      label: "Vtrack",
                      active: !showdrivers,
                      onClick: () => setShowDriver(false),
                    },
                    {
                      label: "Driver",
                      active: showdrivers,
                      onClick: () => setShowDriver(true),
                    },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.onClick}
                      className={`px-2 py-1 rounded-md font-poppins text-xs font-medium transition-all duration-300 
        ${btn.active
                          ? "bg-green text-white shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <LiveCars
                  carData={showdrivers ? Drivertracking : carData?.current}
                  clientSettings={clientSettings}
                  selectedVehicle={selectedVehicle}
                  // mapCoordinates={mapCoordinates}
                  setSelectedVehicle={setSelectedVehicle}
                  showAllVehicles={false}
                  setunselectVehicles={null}
                  unselectVehicles={null}
                />
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4">
        <div className="md:col-span-12 border rounded-md p-4 bg-white">
          {/* Top Bar - Search, Stats, Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-4 col-span-12">
              <input
                onChange={filterValueChange}
                type="text"
                name="search"
                value={filterValue}
                placeholder="Search..."
                className="
            block w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-300 
            rounded-lg shadow-sm placeholder-gray-500 focus:outline-none 
            focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>

            {/* Booking Count */}
            <div className="md:col-span-4 col-span-12 text-md text-gray-700 font-medium text-center md:text-left">
              <span>Bookings: </span>
              <span className="text-lg font-semibold text-gray-900">
                {bookings.length}
              </span>
            </div>

            {/* Add Booking Button */}
            <div className="md:col-span-4 col-span-12 flex justify-center md:justify-end">
              <button
                onClick={() => {
                  if (!vehicleList || vehicleList?.length === 0) {
                    toast.error("Must have at least one vehicle");
                    return;
                  }
                  if (!DriverData || DriverData.length === 0) {
                    toast.error("First add a driver");
                    return;
                  }
                  setModalOpen(true);
                  setFormData({
                    ...defaultFormData,
                    time: moment().tz(session.timezone).format("HH:mm"),
                    date: moment().tz(session.timezone).format("YYYY-MM-DD"),
                  });
                }}
                className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Booking
              </button>
            </div>
          </div>
          <div
            style={{ position: "relative" }}
            onClick={() => setMenuVisible(false)} // close menu when clicking outside
          >
            {/* Table */}
            <Table
              columns={columns}
              dataSource={bookings}
              rowKey="_id"
              className="antd-responsive-table custom-table fixed-height-table"
              size="middle"
              bordered
              pagination={false}
              rowClassName={(_, index) =>
                index % 2 === 1 ? "bg-[#f2f2f2]" : "bg-white" // alternate backgrounds
              }
              onRow={(record) => ({
                onContextMenu: (event) => {
                  event.preventDefault();
                  setUpdateBooking(record);
                  setMenuPosition({ x: event.clientX, y: event.clientY });
                  setMenuVisible(true);
                },
              })}
            />
            {menuVisible && (
              <Dropdown menu={{ items: menuItems }} open trigger={[]}>
                <div
                  style={{
                    position: "fixed",
                    left: menuPosition.x,
                    top: menuPosition.y,
                    background: "transparent",
                    width: "1px",
                    height: "1px",
                  }}
                />
              </Dropdown>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-start items-center px-4 py-2 mt-1 bg-[#00B56C] rounded-t-md shadow-sm gap-4">
        {[
          { key: "today", label: "Today's Bookings", count: metadata?.today },
          { key: "Allocated", label: "Pre Bookings", count: metadata?.pre },
          { key: "Recent", label: "Recent Bookings", count: metadata?.recent },
          { key: "Complete", label: "Completed", count: metadata?.complete },
          { key: "Cancelled", label: "Cancelled", count: metadata?.cancel },

        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setPeriod(period === key ? "" : key)}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all duration-200 
        ${period === key
                ? "bg-white text-black shadow-md"
                : "bg-transparent text-white hover:bg-white/20"
              }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {modalOpen && (
        <>
          <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center">
            <div className={`bg-white p-4 rounded-lg w-[100rem]`}>
              <div className="flex items-center justify-between bg-green py-2 mb-2 rounded-sm">
                <h2 className="text-white font-semibold text-lg ml-2">
                  {" "}
                  {isEdit ? "Edit " : "Add "} Booking
                </h2>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setFormData(defaultFormData);
                    setisEdit(false);
                    setAllowMultiBook(false)
                    setSelectedDays([])
                    setNumWeeks(1)
                    setStartDate(new Date())
                    setEndDate(addWeeks(new Date(), 1))
                  }}
                  aria-label="Close"
                >
                  <svg
                    className="h-5 w-5 text-white mr-2"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <>
                  <div className="flex">


                    <div className="w-full p-4 pb-0 w-[70rem]">

                      {allowMultiBook && (
                        <>
                          {/* Row 1: Day selection and selected days */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Day</label>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Day Dropdown */}
                              <div className="w-48">
                                <Select
                                  options={availableDays}
                                  onChange={handleDaySelect}
                                  placeholder="Select Day"
                                  isClearable

                                />
                              </div>

                              {/* Selected Days */}
                              <div className="flex flex-wrap gap-2 ">
                                {selectedDays.map((day) => (
                                  <span
                                    key={day.value}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center border border-black rounded-lg"
                                  >
                                    <span>{day.label}</span>
                                    <button
                                      onClick={() => removeDay(day)}
                                      className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                      ❌
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Row 2: No. of Weeks, Start Date, End Date */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end">
                            {/* No. of Weeks */}
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">No. of Weeks</label>
                              <input
                                type="number"
                                min={1}
                                value={numWeeks}
                                onChange={(e) => {
                                  setNumWeeks(Number(e.target.value));
                                  setManualEndDate(false);
                                }}
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                              />
                            </div>

                            {/* Start Date */}
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                              <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                  setStartDate(date);
                                  setManualEndDate(false);
                                }}
                                dateFormat="dd-MMM-yyyy"
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                              />
                            </div>

                            {/* End Date */}
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                              <DatePicker
                                selected={endDate}
                                onChange={(date) => {
                                  setEndDate(date);
                                  setManualEndDate(true);
                                }}
                                dateFormat="dd-MMM-yyyy"
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                              />
                            </div>
                          </div>
                        </>
                      )}





                      {/* First Row - Date/Time/Booking Type */}
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-4">
                        {/* Pickup Date */}
                        {/* Pickup Date */}
                        {!allowMultiBook && (
                          <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pickup Date
                            </label>
                            <input
                              type="date"
                              className="form-input w-full border rounded p-2 text-sm"
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  date: e.target.value,
                                }));
                              }}
                              name="Date"
                              value={formdata.date}
                              required
                            />
                          </div>
                        )}


                        {/* Pickup Time */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Time
                          </label>
                          <input
                            type="time"
                            className="form-input w-full border rounded p-2 text-sm"
                            min={
                              formdata.date === new Date().toISOString().split("T")[0]
                                ? new Date().toISOString().slice(11, 16)
                                : undefined
                            }
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                time: e.target.value,
                              }));
                            }}
                            name="time"
                            value={formdata.time}
                            required
                          />
                        </div>

                        {/* Booking Type (smaller) */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Booking Type
                          </label>
                          <Select
                            onChange={(e) =>
                              e &&
                              setFormData((prev) => ({
                                ...prev,
                                bookingType: e.value,
                              }))
                            }
                            value={
                              bookingTypeOptions.find(
                                (option) =>
                                  option.value === formdata.bookingType
                              ) || null
                            }
                            options={bookingTypeOptions}
                            placeholder="Select"
                            className="text-sm"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                minHeight: "36px",
                                height: "36px",
                                fontSize: "14px",
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? "#00B56C"
                                  : state.isFocused
                                    ? "#e1f0e3"
                                    : "transparent",
                                color: state.isSelected ? "white" : "black",
                                fontSize: "14px",
                              }),
                            }}
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <Select
                            onChange={(e) => setCategory(e?.value || null)}
                            value={
                              category ? { value: category, label: category.charAt(0).toUpperCase() + category.slice(1) } : null
                            }
                            options={[
                              { value: "delivery", label: "Delivery" },
                              { value: "pickup", label: "Pickup" },
                              { value: "destination", label: "Destination" },
                            ]}
                            placeholder="Select Category"
                            className="text-sm"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                minHeight: "36px",
                                height: "36px",
                                fontSize: "14px",
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? "#00B56C"
                                  : state.isFocused
                                    ? "#e1f0e3"
                                    : "transparent",
                                color: state.isSelected ? "white" : "black",
                                fontSize: "14px",
                              }),
                            }}
                          />
                        </div>

                        <div className={`col-span-${allowMultiBook ? "2" : "1"}`}></div>

                        <div className="col-span-1">
                          <button
                            onClick={handleMultiBooking}
                            className="bg-[#00B56C] text-white px-4 py-2 rounded-lg flex items-center space-x-2 w-full justify-center"
                          >
                            <input
                              type="checkbox"
                              checked={allowMultiBook}
                              readOnly
                              className="form-checkbox h-4 w-4 text-white accent-white"
                            />
                            <span>Multi Bookings</span>
                          </button>
                        </div>
                      </div>

                      {/* Second Row - Pickup/Destination */}
                      {["delivery", "pickup"].includes(category) && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                          {/* Pickup Point */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pickup Point
                            </label>
                            <AddressAutocomplete
                              region={session?.timezone}
                              onSelect={(e: any) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  pickup: e.address,
                                }));
                                setPickup(e);
                              }}
                              value={formdata.pickup}
                              onChange={(val) =>
                                setFormData((prev) => ({ ...prev, pickup: val }))
                              }
                            />
                          </div>

                          {/* Pickup Notes */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pickup Notes
                            </label>
                            <input
                              type="text"
                              placeholder="Notes"
                              className="form-input w-full border rounded p-2 text-sm"
                              value={formdata.pickupNotes}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  pickupNotes: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}


                      {/* Third Row - Destination/Destination Notes */}
                      {["delivery", "destination"].includes(category) && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                          {/* Destination */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Destination
                            </label>
                            <AddressAutocomplete
                              region={session?.timezone}
                              onSelect={(e: any) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  destination: e.address,
                                }));
                                setDestination(e);
                              }}
                              value={formdata.destination}
                              onChange={(val) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  destination: val,
                                }))
                              }
                            />
                          </div>

                          {/* Destination Notes */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Destination Notes
                            </label>
                            <input
                              type="text"
                              placeholder="Notes"
                              className="form-input w-full border rounded p-2 text-sm"
                              value={formdata.destinationNotes}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  destinationNotes: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* <p className="mb-1">Customer Details</p> */}
                      {/* Fourth Row - Name/Contact/Email */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            placeholder="Full name"
                            className="form-input w-full border rounded p-2 text-sm"
                            value={formdata.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile
                          </label>
                          <input
                            type="text"
                            placeholder="Mobile"
                            className="form-input w-full border rounded p-2 text-sm"
                            value={formdata.contact}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                contact: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            placeholder="Email"
                            className="form-input w-full border rounded p-2 text-sm"
                            value={formdata.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Fifth Row - Vehicle/Driver */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {/* Pick Driver */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver
                          </label>
                          <Select
                            onChange={handleInputChangeDriver}
                            options={driverOptions}
                            value={
                              driverOptions.find(
                                (i) => i.value === formdata.driverId
                              ) || null
                            }
                            placeholder="Select driver"
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No options available"}
                            className="text-sm"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                minHeight: "36px",
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? "#00B56C"
                                  : state.isFocused
                                    ? "#e1f0e3"
                                    : "transparent",
                                color: state.isSelected ? "white" : "black",
                                fontSize: "14px",
                              }),
                            }}
                          />
                        </div>

                        {/* Pick Vehicle */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle
                          </label>
                          <Select
                            onChange={handleInputChangeVehicle}
                            options={options}
                            value={
                              vehicleList.find(
                                (i) => i._id === formdata.vehicleId
                              )
                                ? {
                                  value: formdata.vehicleId,
                                  label: vehicleList.find(
                                    (i) => i._id === formdata.vehicleId
                                  )?.vehicleReg,
                                }
                                : null
                            }
                            placeholder="Select vehicle"
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No options available"}
                            className="text-sm"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                minHeight: "36px",
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? "#00B56C"
                                  : state.isFocused
                                    ? "#e1f0e3"
                                    : "transparent",
                                color: state.isSelected ? "white" : "black",
                                fontSize: "14px",
                              }),
                            }}
                          />
                        </div>
                      </div>

                      {/* Sixth Row - Special Request (full width) */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requirements
                        </label>
                        <textarea
                          placeholder="Add Special Requirement"
                          className="form-textarea w-full border rounded p-2 text-sm"
                          rows={3}
                          value={formdata.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {/* Seventh Row - Journey Type and Confirmation Email */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 ">
                        {/* Pick Serive Type */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type
                          </label>
                          <Select
                            onChange={handleInputChangeServiceType}
                            options={serviceOptions}
                            value={
                              serviceOptions.find(
                                (i) => i.value === formdata.serviceType
                              ) || null
                            }
                            placeholder="Select Service Type"
                            isClearable
                            isSearchable
                            menuPlacement="top"
                            noOptionsMessage={() => "No options available"}
                            className="text-sm"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                minHeight: "36px",
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? "#00B56C"
                                  : state.isFocused
                                    ? "#e1f0e3"
                                    : "transparent",
                                color: state.isSelected ? "white" : "black",
                                fontSize: "14px",
                              }),
                              menuList: (provided) => ({
                                ...provided,
                                maxHeight: serviceOptions.length > 5 ? "100px" : "auto",
                                overflowY: serviceOptions.length > 5 ? "auto" : "visible",
                              }),
                            }}
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timer (minutes)
                          </label>
                          <input
                            type="number"
                            placeholder="Enter Timer"
                            className="form-input w-full border rounded p-2 text-sm"
                            value={formdata.timer}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                timer: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center col-span-1">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-green-600"
                              checked={formdata.confirmEmail === true}
                              onChange={handleInputChangeConfirmEmail}
                              style={{ accentColor: "green" }}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Send confirmation email
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center col-span-1">

                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-green-600"
                              /*  checked={formdata.signature === true} */
                              onChange={handleInputChangesignature}
                              style={{ accentColor: "green" }}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Signature
                            </span>
                          </label>

                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 ml-4 text-green-600"
                              /*   checked={formdata.AllowImage === true} */
                              onChange={handleInputChangeAllowImage}
                              style={{ accentColor: "green" }}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Upload Image
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="w-[30rem] pb-2">
                      {typeof window !== "undefined" &&
                        mapcenter?.lat !== null && (
                          <div
                            className="relative bg-white border rounded-md border-black w-full
                                                max-h-[40rem] min-h-[40rem] h-[40rem]
                                                 overflow-hidden"
                          >
                            <MapContainer // modalmap
                              center={mapcenter}
                              zoom={zoom}
                              style={{ height: "40rem", width: "100%" }}
                            >
                              {session?.livemapType === "Google" && (
                                <LayersControl position="bottomright">
                                  <>
                                    <BaseLayer checked name="Google Map">
                                      <TileLayer
                                        url={`https://{s}.googleapis.com/maps/vt?lyrs=m&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                                        subdomains={[
                                          "mt0",
                                          "mt1",
                                          "mt2",
                                          "mt3",
                                        ]}
                                        attribution="Google Maps"
                                      />
                                    </BaseLayer>
                                    <BaseLayer name="Google Maps Street View">
                                      <TileLayer
                                        url={`https://{s}.googleapis.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}
                                        subdomains={[
                                          "mt0",
                                          "mt1",
                                          "mt2",
                                          "mt3",
                                        ]}
                                        attribution="Street View"
                                      />
                                    </BaseLayer>
                                  </>
                                </LayersControl>
                              )}
                              {session?.livemapType !== "Google" && (
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                                />
                              )}
                              <SetViewfly
                                coords={mapcenterToFly}
                                zoom={zoomToFly}
                              />

                              {pickupPoint?.lat && (
                                <Marker
                                  position={[pickupPoint?.lat, pickupPoint?.lng]}
                                  icon={
                                    new L.Icon({
                                      iconUrl:
                                        "https://img.icons8.com/fluent/48/000000/marker-a.png",
                                      iconAnchor: [22, 47],
                                      popupAnchor: [1, -34],
                                    })
                                  }
                                />
                              )}
                              {destinationPoint?.lat && (
                                <Marker
                                  position={[
                                    destinationPoint?.lat,
                                    destinationPoint?.lng,
                                  ]}
                                  icon={
                                    new L.Icon({
                                      iconUrl:
                                        "https://img.icons8.com/fluent/48/000000/marker-b.png",
                                      iconAnchor: [22, 47],
                                      popupAnchor: [1, -34],
                                    })
                                  }
                                />
                              )}
                              {routeCoords?.length > 0 && (
                                <Polyline
                                  pathOptions={{ color: "red", weight: 6 }}
                                  positions={routeCoords}
                                />
                              )}
                            </MapContainer>
                            {(distance || duration) && (
                              <div className="absolute top-4 left-4 bg-white shadow-lg rounded-md px-4 py-2 z-[1000] ml-8">
                                {distance && (
                                  <p className="text-sm font-semibold text-gray-800">
                                    Distance: {distance}
                                  </p>
                                )}
                                {duration && (
                                  <p className="text-sm font-semibold text-gray-800">
                                    Duration: {duration}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#00B56C] text-white px-8 py-2 rounded-lg ml-2"
                  >
                    {isEdit ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {deleteModal && (
        <Modal
          title="Delete Booking"
          color="bg-red"
          onClose={() => {
            setDeleteModal(false);
            setId("");
          }}
          footer={
            <button
              onClick={() => {
                setDeleteModal(false);
                setId("");
                deleteBooking({ token: session?.accessToken, id }).then((resp) => {
                  if (resp?.success) toast.success(resp.message);
                  getBookings();
                });
              }}
              className="bg-red hover:bg-red text-white font-medium px-6 py-2 rounded-lg transition"
            >
              Yes, Delete
            </button>
          }
        >
          <p className="text-gray-700 text-base text-center">
            Are you sure you want to{" "}
            <span className="font-semibold text-red-600">delete</span> this booking?
          </p>
        </Modal>
      )}


      {dispatchModal && (
        <Modal
          title="Dispatch Booking"
          color="bg-green"
          onClose={() => {
            setDispatchModal(false);
            setUpdateBooking(null);
          }}
          width="w-[500px]"
          footer={
            <button
              onClick={() => {
                updateBooking({
                  token: session?.accessToken,
                  payload: { id: bookingUpdate._id, driverId: bookingUpdate.driverId },
                }).then((resp) => {
                  if (resp?.success) toast.success(resp.message);
                  setDispatchModal(false);
                  setUpdateBooking(null);
                  getBookings();
                });
              }}
              className="bg-[#00B56C] text-white px-6 py-2 rounded-lg "
            >
              Dispatch
            </button>
          }
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
          <Select
            onChange={(e) => {
              if (e?.value) {
                setUpdateBooking((prev) => ({ ...prev, driverId: e.value }));
              }
            }}
            options={driverOptions}
            value={driverOptions.find((i) => i.value === bookingUpdate.driverId) || null}
            placeholder="Select driver"
            isClearable
            isSearchable
            noOptionsMessage={() => "No options available"}
            className="text-sm"
            styles={{
              control: (provided) => ({ ...provided, minHeight: "36px" }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? "#00B56C"
                  : state.isFocused
                    ? "#e1f0e3"
                    : "transparent",
                color: state.isSelected ? "white" : "black",
                fontSize: "14px",
              }),
            }}
          />
        </Modal>
      )}


      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center !z-[9999]">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between bg-yellow px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">
                Cancel Booking
              </h3>
              <button
                onClick={() => {
                  setCancelModal(false);
                  setUpdateBooking(null);
                }}
                aria-label="Close"
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-center">
              <p className="text-gray-700 text-base">
                Are you sure you want to{" "}
                <span className="font-semibold text-yellow-600">cancel</span>{" "}
                this booking?
              </p>

              {/* Footer */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    updateBooking({
                      token: session?.accessToken,
                      payload: {
                        id: bookingUpdate._id,
                        driverId: null,
                        status: "Pending",
                      },
                    }).then((resp) => {
                      setCancelModal(false);
                      setUpdateBooking(null);
                      getBookings();
                      if (resp?.success) {
                        toast.success(resp.message);
                      }
                    });
                  }}
                  className="bg-yellow hover:bg-yellow text-white font-medium px-6 py-2 rounded-lg transition"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
export default Bookings;

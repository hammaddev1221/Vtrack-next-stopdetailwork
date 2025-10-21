
'use client'
import dynamic from 'next/dynamic';
import { LoadScriptNext, Libraries } from "@react-google-maps/api";
const libraries: Libraries = ["places"];
const Booking = dynamic(() => import('@/components/Booking/booking').then((mod) => mod.default), {
  ssr: false,
});

export default function BookingPage() {
  return (
    <LoadScriptNext
          googleMapsApiKey="AIzaSyASPmp4BkVYiigDzyrsmunZsSkEUXZQhl8"

      libraries={libraries}
      id="google-map-script"
    >
      <Booking />
    </LoadScriptNext>
  );
}
// export default booking;

// "use client";
// import React, { useEffect, useState, useRef } from "react";
// import dynamic from "next/dynamic";
// import { useSession } from "next-auth/react";
// import { Toaster, toast } from "react-hot-toast";
// import { Table, Tooltip, Tag } from "antd";
// import moment from 'moment'
// // import axios from "axios";
// import Select from "react-select";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Specific icons for actions

// import EventIcon from "@material-ui/icons/Event";
// import DateFnsMomemtUtils from "@date-io/moment";
// import { DatePicker } from "@material-ui/pickers";
// import { createBooking, getAllVehicleByUserId, getBooking, GetDriverDataByClientId, vehicleListByClientId, deleteBooking, updateBooking, getSearchAddress, getCurrentAddress, fetchRoute } from "@/utils/API_CALLS";
// import { DeviceAttach } from "@/types/vehiclelistreports";
// import { pictureVideoDataOfVehicleT } from "@/types/videoType";

// import {
//     // MapContainer, TileLayer, Marker,
//     useMapEvents
// } from "react-leaflet";
// import L from "leaflet";
// import {
//     MuiPickersUtilsProvider
// } from "@material-ui/pickers"
// // import {
// //     useJsApiLoader
// // } from '@react-google-maps/api';

// const MapContainer = dynamic(
//     () => import("react-leaflet").then((module) => module.MapContainer),
//     { ssr: false }
// );
// const TileLayer = dynamic(
//     () => import("react-leaflet").then((module) => module.TileLayer),
//     { ssr: false }
// );
// const Marker = dynamic(
//     () => import("react-leaflet").then((mod) => mod.Marker),
//     { ssr: false }
// );
// const Polyline = dynamic(
//     () => import("react-leaflet").then((module) => module.Polyline),
//     { ssr: false }
// );
// // L.Icon.Default.mergeOptions({
// //     iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// //     shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // });
// import "./index.css";
// import 'leaflet/dist/leaflet.css';


// const LocationSelector = ({ selectingField, setFormData, setPickup, setDestination }: { selectingField: any, setFormData: any, setPickup: any, setDestination: any }) => {
//     useMapEvents({
//         click: async (e) => {
//             const { lat, lng } = e.latlng;

//             const res = await getCurrentAddress({ lat, lon: lng, token: "" })
            
//             //  await axios.get(
//             //     `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
//             // );
//             const address = res.display_name || `${lat}, ${lng}`;

//             if (selectingField == "pickup") {
//                 setFormData((prev) => ({ ...prev, pickup: address }))

//                 setPickup({
//                     address: address,
//                     lat, lng
//                 })

//             } else {
//                 setFormData((prev) => ({ ...prev, destination: address }))

//                 setDestination({
//                     address: address,
//                     lat, lng
//                 })
//             }

//         },
//     });

//     return null;
// };

// function Bookings() {
//     const { data: session } = useSession();
//     const [modalOpen, setModalOpen] = useState(false);
//     const [bookings, setbookings] = useState<any[]>([]);
//     const [isEdit, setisEdit] = useState(false)
//     const [rawbookings, setRawbookings] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [getShowRadioButton, setShowRadioButton] = useState(false);
//     const [period, setPeriod] = useState("");
//     // const { isLoaded } = useJsApiLoader({
//     //     googleMapsApiKey: GOOGLE_MAPS_API_KEY,
//     // });


//     const [pickupPoint, setPickup] = useState<{ address: string | null, lat: number | null, lng: number | null }>({ address: '', lat: null, lng: null });
//     const [destinationPoint, setDestination] = useState<{ address: string | null, lat: number | null, lng: number | null }>({ address: '', lat: null, lng: null });
//     const [selectingField, setSelectingField] = useState<'pickup' | 'destination'>('pickup');
//     const [googlemodal, setGoogleModal] = useState(false);





//     const [formdata, setFormData] = useState({

//         id: "",
//         pickup: "",
//         destination: "",
//         time: "",
//         name: "",
//         date: "",
//         contact: "",
//         email: "",
//         vehicleId: "",
//         driverId: "",
//         description: "",
//         clientId: session?.clientId,
//         coordinates: []
//     })

//     function getBookings() {
//         setLoading(true)
//         getBooking({ token: session?.accessToken, query: { clientId: session?.clientId } }).then((resp: any) => {
//             if (resp.success) {
//                 setRawbookings(resp.data)
//                 setbookings(resp.data)
//             } else {
//                 toast.error(resp.message)
//             }
//         })
//         setLoading(false)
//     }
//     const [mapcenter, setMapcenter] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });

//     useEffect(() => {
//         const getclientSettings = async () => {

//             if (session) {
//                 const centervalue = await session?.clientSetting.filter(
//                     (item: any) => item.PropertDesc == "Map"
//                 );
//                 const centerMapValue = centervalue.map(
//                     (item: any) => item.PropertyValue
//                 );

//                 if (centerMapValue) {
//                     const match = centerMapValue?.[0]?.match(
//                         /\{lat:([^,]+),lng:([^}]+)\}/
//                     );
//                     if (match) {
//                         const lat = parseFloat(match[1]);
//                         const lng = parseFloat(match[2]);

//                         if (!isNaN(lat) && !isNaN(lng)) {
//                             setMapcenter({ lat, lng });
//                         }
//                     }
//                 }

//             }
//         }
//         getclientSettings()
//     }, [session])
//     const [routeCoords, setRouteCoords] = useState([]);
//     useEffect(() => {
//         //TODO: convert this code in to google 
//         // const fetchRoute = async () => {
//         //     try {
//         //         const apiKey = "5b3ce3597851110001cf62489587736f58f4430887e51e4ee73060ee"; // Replace this                
//         //         const response = await axios.post(
//         //             "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
//         //             {
//         //                 coordinates:
//         //                     //     [[24.898679299802872, 67.1049922869401], [24.896051731614406, 67.09685982970147]],
//         //                     [
//         //                         [pickupPoint.lng, pickupPoint.lat],
//         //                         [destinationPoint.lng, destinationPoint.lat],
//         //                     ],
//         //                 radiuses: 10000
//         //             },
//         //             {
//         //                 headers: {
//         //                     Authorization: apiKey,
//         //                     "Content-Type": "application/json",
//         //                 },
//         //             }
//         //         );
//         //         const coords = response.data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
//         //         setRouteCoords(coords);
//         //     } catch (err) {
//         //         console.error("Failed to fetch route", err);
//         //     }
//         // }
        

//         if (pickupPoint.lat && destinationPoint.lat) {
//             setMapcenter
//                 (
//                     {
//                         lat: (pickupPoint.lat + destinationPoint.lat) / 2,
//                         lng: (pickupPoint.lng + destinationPoint.lng) / 2
//                     }
//                 )
        
//             const getroutes = async () => {

//                 if (typeof window !== "undefined") {             
//                     let coord: any = await fetchRoute({pickupPoint, destinationPoint});                    
//                     setRouteCoords(coord)
//                 }
//             }
//             getroutes()


//         }
//     }, [pickupPoint, destinationPoint])

//     const [deleteModal, setDeleteModal] = useState(false)
//     const [id, setId] = useState("")
//     useEffect(() => {
//         switch (period) {
//             case "today":
//                 const today = moment().tz(session?.timezone).clone().startOf("day").format("YYYY-MM-DD");

//                 setbookings(rawbookings.filter((i) => {
//                     return i.date.toString() === today.toString()
//                 }))
//                 break;
//             case "recent":
//                 setbookings(rawbookings)
//                 break;
//             case "completed":
//                 setbookings(rawbookings.filter((i) => {
//                     return i.status.toString() === "Complete"
//                 }))
//                 break;
//             case "custom":
//                 break;
//             default:
//                 null
//         }
//     }, [period])
//     const [columns] = useState([
//         {
//             title: "Pickup Point",
//             dataIndex: "pickup",
//             key: "pickup",
//             width: 180, // Fixed width for better control
//             ellipsis: {
//                 showTitle: false, // Prevents default title attribute, use custom Tooltip
//             },
//             render: (text) => (
//                 <Tooltip placement="topLeft" title={text}>
//                     {text}
//                 </Tooltip>
//             ),
//         },
//         {
//             title: "Destination",
//             dataIndex: "destination",
//             key: "destination",
//             width: 180, // Fixed width
//             ellipsis: {
//                 showTitle: false,
//             },
//             render: (text) => (
//                 <Tooltip placement="topLeft" title={text}>
//                     {text}
//                 </Tooltip>
//             ),
//         },
//         {
//             title: "Vehicle Reg",
//             dataIndex: "vehicleReg",
//             key: "vehicleReg",
//             width: 100, // Fixed width for consistency
//         },
//         {
//             title: "Driver",
//             dataIndex: "driver",
//             key: "driver",
//             width: 100, // Fixed width
//         },
//         {
//             title: "Name",
//             dataIndex: "name",
//             key: "name",
//             width: 100, // Fixed width
//         },
//         {
//             title: "Contact",
//             dataIndex: "contact",
//             key: "contact",
//             width: 100, // Fixed width
//         },
//         {
//             title: "Email",
//             dataIndex: "email",
//             key: "email",
//             width: 150, // Fixed width
//             ellipsis: {
//                 showTitle: false,
//             },
//             render: (text) => (
//                 <Tooltip placement="topLeft" title={text}>
//                     {text}
//                 </Tooltip>
//             ),
//         },
//         {
//             title: "Description",
//             dataIndex: "description",
//             key: "description",
//             width: 150, // Fixed width
//             ellipsis: {
//                 showTitle: false,
//             },
//             render: (text) => (
//                 <Tooltip placement="topLeft" title={text}>
//                     {text}
//                 </Tooltip>
//             ),
//         },
//         {
//             title: "Date Time",
//             dataIndex: "datetime",
//             key: "datetime",
//             width: 140, // Fixed width for date/time
//         },

//         {
//             title: "Status",
//             dataIndex: "status",
//             key: "status", // Key should match dataIndex for unique identification
//             width: 100, // Fixed width
//             render: (status) => {
//                 let color;
//                 switch (status) {
//                     case 'Allocated':
//                         color = 'processing'; // Blue, indicates it's in the system/being processed
//                         break;
//                     case 'OnRoute':
//                         color = 'gold';       // Yellow/Orange, indicates active movement
//                         break;
//                     case 'Complete':
//                         color = 'success';    // Green, indicates successful completion
//                         break;
//                     default:
//                         color = 'default';    // Grey for any unknown/unexpected status
//                 }
//                 return <Tag color={color}>{status.toUpperCase()}</Tag>;
//             },
//         },


//         {
//             title: "Actions",
//             key: "_id",
//             dataIndex: "_id",
//             width: 90, // Fixed width for action buttons
//             fixed: 'right', // Keep actions column visible when scrolling horizontally
//             render: (text, record) => (
//                 <div className="flex gap-2 justify-center">
//                     {/* Edit Icon */}
//                     <FontAwesomeIcon
//                         icon={faEdit}
//                         className="w-5 h-5 cursor-pointer text-blue-500 hover:text-blue-700 transition-colors"
//                         onClick={() => {
//                             setPickup(record.pickupPoint)
//                             setDestination(record.destinationPoint)
//                             setisEdit(true);
//                             setModalOpen(true);
//                             // setFormData((prev) => ({ ...prev, id: text }))
                            
//                             setFormData(record);
//                             setRouteCoords(record?.coordinates)
//                         }}
//                     />

//                     {/* Delete Icon */}
//                     <FontAwesomeIcon
//                         icon={faTrashAlt}
//                         className="w-5 h-5 cursor-pointer text-red-500 hover:text-red-700 transition-colors"
//                         onClick={() => {
//                             setId(text);
//                             setDeleteModal(true);
//                         }}
//                     />
//                 </div>
//             ),
//         },
//     ]);
//     const handleClick = () => {
//         setShowRadioButton(!getShowRadioButton);
//     };
//     const handleInputChangePeriod: any = (e: any) => {
//         setPeriod(e.target?.value)
//     }
//     const handleCloseDateTime = () => {
//         setShowRadioButton(false);
//         setPeriod("")
//     }
//     const [fromdate, setFromDate] = useState(null)
//     const [todate, setToDate] = useState(null)

//     const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
//     const [DriverData, setDriverData] = useState<pictureVideoDataOfVehicleT[]>(
//         []
//     );

//     const [selectedRowKeys, setSelectedRowKeys] = useState("")
//     const rowSelection: TableProps<DataType>['rowSelection'] = {
//         onChange: (selectedRowKey: React.Key[], selectedRows: DataType[]) => {
//             setSelectedRowKeys(selectedRowKey.join(","))
//         },
//         getCheckboxProps: (record: DataType) => ({
//             disabled: record.name === 'Disabled User', // Column configuration not to be checked
//             name: record.name,
//         }),
//     };

//     useEffect(() => {

//         const vehicleListData = async () => {
//             try {
//                 if (session?.userRole == "Admin" || session?.userRole == "SuperAdmin") {
//                     if (session) {
//                         const Data = await vehicleListByClientId({
//                             token: session?.accessToken,
//                             clientId: session?.clientId,
//                         });
//                         setVehicleList(Data.data);
//                         //   if (allData?.vehicle.length <= 0) {
//                         // }
//                         // setVehicleList(allData?.vehicle);
//                     }
//                 } else {
//                     if (session) {
//                         const Data = await getAllVehicleByUserId({
//                             token: session?.accessToken,
//                             userId: session?.userId,
//                         });
//                         setVehicleList(Data.data);
//                     }
//                 }
//             } catch (error) { }
//         };

//         const getdriverData = async () => {
//             const response = await GetDriverDataByClientId({
//                 token: session?.accessToken,
//                 clientId: session?.clientId,
//             });
//             setDriverData(response.filter((item: any) => item.isDeleted === false));
//         }

//         if (typeof window !== "undefined") {
//             getdriverData()
//             vehicleListData();
//             getBookings()
//         }
//     }, []);
//     const handleInputChangeVehicle = (e: any) => {

//         if (e?.value) {
//             setFormData((prev) => ({ ...prev, vehicleId: e.value }))
//         }

//     };
//     const handleInputChangeDriver = (e: any) => {

//         if (e?.value) {
//             setFormData((prev) => ({ ...prev, driverId: e.value }))

//         }
//     };

//     const options =
//         vehicleList?.map((item: any) => ({
//             value: item._id,
//             label: item.vehicleReg,
//         })) || [];
//     const [addresses, setAddresses] = useState<[]>([]);
//     const [query, setquery] = useState("");


//     const handleInputChange = (e: any) => {
//         let query: string = e;
//         if (session) {
//             getSearchAddress({
//                 query: query,
//                 country: session?.country
//             })
//                 .then((response) => {
//                     setAddresses(response);
//                     setquery(query)
//                     setFormData((prev) => ({ ...prev, "pickup": query }))

//                 })
//                 .catch((error) => { });
//         }
//     };
//     const optionsCitys: any =
//         [{ label: query || formdata.pickup }, ...addresses?.map((item: any) => ({
//             value: JSON.stringify(item),
//             label: item.display_name
//         }))];
//     const optionsCitys2: any =
//         [{ label: query || formdata.destination }, ...addresses?.map((item: any) => ({
//             value: JSON.stringify(item),
//             label: item.display_name
//         }))];

//     const handleSubmit = (e) => {
//         e.preventDefault()

//         if (formdata.vehicleId == "") {
//             toast.error("Select Vehicle")
//         }

//         if (formdata.date == "") {
//             toast.error("Enter Date")
//         }
//         if (formdata.time == "") {
//             toast.error("Enter Time")
//         }
//         if (formdata.contact == "") {
//             toast.error("Contact No field is Compulsory")
//         }

//         if (isEdit == true) {
//             updateBooking({ token: session?.accessToken, payload: { ...formdata, pickupPoint, destinationPoint, coordinates: [] } }).then((resp) => {
//                 if (resp.success) {
//                     toast.success(resp.message)
//                     getBookings()
//                     setModalOpen(false)
//                     setFormData({

//                         id: "",
//                         pickup: "",
//                         destination: "",
//                         time: "",
//                         name: "",
//                         date: "",
//                         contact: "",
//                         email: "",
//                         vehicleId: "",
//                         driverId: "",
//                         description: "",
//                         clientId: session?.clientId,
//                         coordinates: []
//                         // fair: 0
//                     })
//                     setisEdit(false)
//                 } else {
//                     toast.error(resp.message)
//                 }
//             })
//         } else {

//             createBooking(
//                 { token: session?.accessToken, payload: { ...formdata, pickupPoint, destinationPoint } }).then((resp) => {
//                     if (resp.success) {
//                         toast.success(resp.message)
//                         getBookings()
//                         setModalOpen(false)
//                         setFormData({

//                             id: "",
//                             pickup: "",
//                             destination: "",
//                             time: "",
//                             name: "",
//                             date: "",
//                             contact: "",
//                             email: "",
//                             vehicleId: "",
//                             driverId: "",
//                             description: "",
//                             clientId: session?.clientId,
//                             coordinates: []
//                             // fair: 0
//                         })
//                     } else {
//                         toast.error(resp.message)
//                     }
//                 })
//         }
//     }

//     // const [selectedBooking, setSelectedBooking] = useState()
//     // const calendarRef = React.useRef<any>(null);
//     // const goPrev = () => {
//     //     const calendarApi = calendarRef?.current?.getApi()
//     //     calendarApi?.prev()
//     //     updateCurrentMonth()
//     // }

//     // const goNext = () => {
//     //     const calendarApi = calendarRef?.current?.getApi()
//     //     calendarApi?.next();
//     //     updateCurrentMonth()
//     // }
//     // useEffect(() => {
//     //     if (
//     //         selectedBooking != null && selectedBooking != undefined
//     //     ) {
//     //         setModalOpen2(true)
//     //     }
//     // }, [selectedBooking])
//     // const [currentMonth, setCurrentMonth] = useState<string>(moment().format('MMMM'));
//     // const updateCurrentMonth = () => {
//     //     const calendarApi = calendarRef.current?.getApi();
//     //     const currentDate = calendarApi?.getDate();
//     //     if (currentDate) {
//     //         setCurrentMonth(moment(currentDate).format('MMMM'));
//     //     }
//     // };
//     const [filterValue, setFilterValue] = useState("");

//     const filterValueChange = (e) => {
//         const filterValue = e.target?.value.toLowerCase();
//         setFilterValue(filterValue);
//     }

//     useEffect(() => {
//         setbookings(rawbookings.filter((item: any) => {
//             if (
//                 item.driver?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.vehicleReg?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.contact?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.pickupPoint?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.destination?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.description?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.datetime?.toLowerCase().includes(filterValue.toLowerCase()) ||
//                 item.status?.toLowerCase().includes(filterValue.toLowerCase())
//             ) {
//                 return item;
//             } else {
//                 return false
//             }
//         }))
//     }, [filterValue])
//     return (
//         <div className="">
//             <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
//                 Manage Bookings
//             </p>

//             <div
//                 className="grid xl:grid-cols-10 lg:grid-cols-10 md:grid-cols-12  gap-2
//          lg:px-4 text-start  bg-bgLight select_box_journey"
//             >
//                 <div className="xl:col-span-1 lg:col-span-2 md:col-span-3 col-span-12">
//                     <input
//                         aria-required
//                         onChange={filterValueChange}
//                         type="text"
//                         name="search"
//                         value={filterValue}
//                         class="
//             text-black 
//             block 
//             py-1.5        {# Increased padding slightly #}
//             px-3 
//             w-full 
//             text-sm 
//             text-labelColor 
//             bg-white 
//             outline-none
//             border 
//             border-gray-300  {# Slightly lighter default border #}
//             rounded-lg       {# More rounded corners #}
//             appearance-none 
//             shadow-sm        {# Subtle shadow for depth #}
//             placeholder-gray-500  {# Improved placeholder color #}
//             focus:outline-none   {# Remove default outline #}
//             focus:ring-2     {# Add a subtle ring on focus #}
//             focus:ring-green-500 {# Green ring color #}
//             focus:border-green-500 {# Green border on focus #}
//             transition-all duration-200 ease-in-out {# Smooth transitions for focus effects #}
//         "
//                         placeholder="Search...."
//                     />
//                 </div>

//                 <div className="xl:col-span-3 lg:col-span-3 md:col-span-3 col-span-12 days_select">


//                     {getShowRadioButton ? (
//                         <div className="grid lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12  -mt-2  grid-cols-12  xl:px-10 lg:px-10 xl:gap-5 lg:gap-5 gap-2 flex justify-center ">
//                             <div
//                                 className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 lg:mt-0 md:mt-0 sm:mt-0"
//                             >
//                                 <label className="text-green">From</label>
//                                 <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
//                                     <DatePicker
//                                         // open={isPickerOpenFromDate}
//                                         format="MM/DD/yyyy"
//                                         value={fromdate}
//                                         onChange={(newDate: any) =>
//                                             setFromDate(newDate)
//                                         }
//                                         style={{ marginTop: "-3%" }}
//                                         variant="inline"
//                                         placeholder="Start Date"
//                                         autoOk
//                                         inputProps={{ readOnly: true }}
//                                         InputProps={{
//                                             endAdornment: (
//                                                 <EventIcon
//                                                     style={{ width: "20", height: "20" }}
//                                                     className="text-gray"
//                                                 />
//                                             ),
//                                         }}
//                                     />
//                                 </MuiPickersUtilsProvider>
//                             </div>
//                             <div
//                                 className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 "
//                             >
//                                 <label className="text-green">To</label>
//                                 <div>
//                                     {/* <h1>test</h1> */}
//                                     <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
//                                         <DatePicker
//                                             style={{ marginTop: "-3%" }}
//                                             className="text-red"
//                                             format="MM/DD/yyyy"
//                                             value={todate}
//                                             onChange={(newDate: any) =>
//                                                 setToDate(newDate)
//                                             }
//                                             variant="inline"
//                                             placeholder="End Date"
//                                             inputProps={{ readOnly: true }}
//                                             // shouldDisableDate={(date) => !isCurrentDate(date)}
//                                             InputProps={{
//                                                 endAdornment: (
//                                                     <EventIcon
//                                                         style={{ width: "20", height: "20" }}
//                                                         className="text-gray"
//                                                     />
//                                                 ),
//                                             }}
//                                             autoOk
//                                         />
//                                     </MuiPickersUtilsProvider>
//                                 </div>
//                             </div>
//                             <div className="lg:col-span-1 col-span-1   ">
//                                 <button
//                                     className="text-green ms-5  text-2xl font-bold"
//                                     onClick={handleCloseDateTime}
//                                 >
//                                     x
//                                 </button>
//                             </div>
//                         </div>) : (
//                         <div
//                             className="grid xl:grid-cols-11 lg:grid-cols-12 md:grid-cols-12 grid-cols-12
//              gap-x-4 gap-y-2 -mt-2" // Added gap-x for horizontal spacing
//                         >
//                             {/* Today Radio Button */}
//                             <div
//                                 className="xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-6 period_select"
//                                 id="today_journey"
//                             >
//                                 <label className="text-sm text-black font-bold font-popins flex items-center">
//                                     <input
//                                         type="radio"
//                                         className="w-5 h-4 form-radio"
//                                         style={{ accentColor: "green" }}
//                                         name="period"
//                                         disabled={loading}
//                                         value="today"
//                                         checked={period === "today"}
//                                         onChange={handleInputChangePeriod}
//                                     />
//                                     <span className="ml-2">Today</span> {/* Use ml-2 for consistent spacing */}
//                                 </label>
//                             </div>

//                             {/* Recent Radio Button */}
//                             <div
//                                 className="xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-6 period_select"
//                             >
//                                 <label className="text-sm text-black font-bold font-popins flex items-center">
//                                     <input
//                                         type="radio"
//                                         className="w-5 h-4 form-radio"
//                                         name="period"
//                                         id="recent_radio_button"
//                                         disabled={loading}
//                                         value="recent"
//                                         style={{ accentColor: "green" }}
//                                         checked={period === "recent"}
//                                         onChange={handleInputChangePeriod}
//                                     />
//                                     <span className="ml-2">Recent</span> {/* Use ml-2 for consistent spacing */}
//                                 </label>
//                             </div>

//                             {/* Completed Radio Button */}
//                             <div
//                                 className="xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-6 period_select"
//                             >
//                                 <label className="text-sm text-black font-bold font-popins flex items-center">
//                                     <input
//                                         type="radio"
//                                         className="w-5 h-4 form-radio"
//                                         name="period"
//                                         disabled={loading}
//                                         value="completed"
//                                         style={{ accentColor: "green" }}
//                                         checked={period === "completed"}
//                                         onChange={handleInputChangePeriod}
//                                     />
//                                     <span className="ml-2">Completed</span> {/* Use ml-2 for consistent spacing */}
//                                 </label>
//                             </div>

//                             {/* Custom Radio Button */}
//                             {/* <div
//                                 className="xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-6 period_select_custom"
//                                 id="custom_journey"
//                             >
//                                 <label className="text-sm text-black font-bold font-popins flex items-center">
//                                     <input
//                                         type="radio"
//                                         className="w-5 h-4 form-radio"
//                                         disabled={loading}
//                                         name="period"
//                                         value="custom"
//                                         style={{ accentColor: "green" }}
//                                         checked={period === "custom"}
//                                         onChange={handleInputChangePeriod}
//                                         onClick={handleClick}
//                                     />
//                                     <span className="ml-2">Custom</span>
//                                 </label>
//                             </div> */}
//                         </div>
//                     )}


//                 </div>
//                 <div className="xl:col-span-4 lg:col-span-3 md:col-span-3 col-span-12 text-right">
//                     <span className="text-sm text-gray-500 font-medium">Bookings:</span>
//                     <span className="ml-2 text-lg font-semibold text-gray-800">{bookings.length}</span>
//                 </div>
//                 <div className="xl:col-span-1 lg:col-span-1 md:col-span-1 col-span-12 flex justify-end">
//                     <button
//                         onClick={() => {
//                             let keys = selectedRowKeys.split(",")

//                             if (keys.length > 0 && keys[0] != "") {

//                                 keys.map((item, i) => {
//                                     deleteBooking({ token: session?.accessToken, id: item }).then((resp) => {
//                                         if (i == selectedRowKeys.split(",").length - 1) {
//                                             getBookings()
//                                             setSelectedRowKeys("")
//                                         }
//                                     })

//                                 })
//                             } else {

//                                 toast.error("Select Bookings first")

//                             }

//                         }}
//                         className="p-2 rounded-full hover:bg-red-100 transition-colors"
//                         title="Delete Selected"

//                     >
//                         <FontAwesomeIcon
//                             icon={faTrashAlt}
//                             className="w-5 h-5 text-red-500 hover:text-red-700 transition-colors "
//                         />
//                     </button>
//                 </div>

//                 {/* Add Booking Button */}
//                 <div className="xl:col-span-1 lg:col-span-1 md:col-span-2 col-span-12 flex justify-center">
//                     <button
//                         onClick={() => {
//                             setModalOpen(true)
//                         }}
//                         className="
//         mt-[10px]  mb-[10px]  ml-4
//         px-4 py-2 text-sm font-medium rounded-md flex items-center  bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
//                     >
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             viewBox="0 0 24 24"
//                             width="20px"
//                             height="20px"
//                             fill="none"
//                             stroke="#ffffff"
//                             strokeWidth="2"
//                             className="w-5 h-5"
//                         >
//                             <path
//                                 fill="none"
//                                 stroke="#ffffff"
//                                 strokeWidth="2"
//                                 d="M12 5v14M5 12h14"
//                             />
//                         </svg>
//                         Add Booking
//                     </button>
//                 </div>
//             </div>
//             <div
//                 className="px-4 py-5"
//             >

//                 <Table
//                     rowSelection={{ type: "checkbox", ...rowSelection }}
//                     columns={columns}
//                     dataSource={bookings}
//                     rowKey="_id"
//                     // Configure scrolling behavior
//                     // scroll={{ x: 'max-content', y: 490 }} // x: 'max-content' enables horizontal scrolling if content overflows
//                     // Apply responsive table styling
//                     className="antd-responsive-table"
//                     size="middle" // Can also use 'small' for a more compact table
//                     bordered // Adds borders to cells for clearer structure
//                     pagination={{ // Add pagination for large datasets
//                         pageSize: 10,
//                         showSizeChanger: true,
//                         pageSizeOptions: ['10', '20', '50', '100'],
//                         showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
//                     }}
//                 />
//             </div>

//             {modalOpen && (
//                 <>
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className={`bg-white p-6 rounded-lg w-[45rem]`}>
//                             <h3 className="text-xl font-bold mb-4 text-center">
//                                 {isEdit ? "Edit " : "Add "}Booking
//                             </h3>
//                             <form onSubmit={handleSubmit}>
//                                 <>
//                                     <div className="flex">
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md font-popins font-medium">

//                                                 <b> Pick Point:</b>{" "}
//                                                 <span
//                                                     onClick={() => {
//                                                         setSelectingField('pickup');
//                                                         setGoogleModal(true);
//                                                     }}
//                                                     style={{ float: "inline-end" }}
//                                                 >
//                                                     📍
//                                                 </span>
//                                             </label>
//                                             {/* <input
//                                                 disabled
//                                                 aria-required
//                                                 onChange={(e: any) => {
//                                                     setFormData((prev) => ({ ...prev, "pickup": e.target?.value }))
//                                                 }}
//                                                 type="text"
//                                                 name="pickupPoint"
//                                                 value={formdata.pickup}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Pickup Point"
//                                                 required
//                                             /> */}


//                                             <Select
//                                                 onChange={(e) => {
//                                                     if (e) {

//                                                         let data = JSON.parse(e.value)
//                                                         setPickup({ address: e?.label, lat: data.lat, lng: data.lon })

//                                                         setFormData((prev) => ({ ...prev, "pickup": e?.label }))
//                                                     }
//                                                 }}

//                                                 value={optionsCitys.find((option) => option.label === formdata.pickup) || null}

//                                                 onInputChange={handleInputChange}
//                                                 options={optionsCitys}
//                                                 placeholder="Search"
//                                                 isClearable
//                                                 isSearchable
//                                                 noOptionsMessage={() => "No options available"}
//                                                 className="rounded-md w-full outline-green border border-grayLight hover:border-green"
//                                                 styles={{
//                                                     control: (provided, state) => ({
//                                                         ...provided,
//                                                         border: "none",
//                                                         boxShadow: state.isFocused ? null : null
//                                                     }),
//                                                     option: (provided, state) => ({
//                                                         ...provided,
//                                                         zIndex: "9999",
//                                                         backgroundColor: state.isSelected
//                                                             ? "#00B56C"
//                                                             : state.isFocused
//                                                                 ? "#e1f0e3"
//                                                                 : "transparent",
//                                                         color: state.isSelected
//                                                             ? "white"
//                                                             : state.isFocused
//                                                                 ? "black"
//                                                                 : "black",
//                                                         "&:hover": {
//                                                             backgroundColor: "#e1f0e3",
//                                                             color: "black"
//                                                         }
//                                                     })
//                                                 }}
//                                             />

//                                         </div>
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md font-popins font-medium">

//                                                 <b> Destination:</b>{" "}
//                                                 <span
//                                                     onClick={() => {
//                                                         setSelectingField('destination');
//                                                         setGoogleModal(true);
//                                                     }}
//                                                     style={{ float: "inline-end" }}
//                                                 >
//                                                     📍
//                                                 </span>
//                                             </label>
//                                             {/* <input

//                                                 disabled
//                                                 aria-required
//                                                 onChange={(e: any) => {
//                                                     setFormData((prev) => ({ ...prev, "destination": e.target?.value }))
//                                                 }}
//                                                 type="text"
//                                                 name="destination"
//                                                 value={formdata.destination}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Destination"
//                                                 required
//                                             /> */}
//                                             <Select
//                                                 onChange={(e) => {

//                                                     if (e) {

//                                                         let data = JSON.parse(e.value)
//                                                         setDestination({ address: e?.label, lat: data.lat, lng: data.lon })
//                                                         setFormData((prev) => ({ ...prev, "destination": e?.label }))
//                                                     }
//                                                 }}
//                                                 value={optionsCitys2.find((option) => option.label === formdata.destination) || null}
//                                                 onInputChange={handleInputChange}
//                                                 options={optionsCitys2}
//                                                 placeholder="Search"
//                                                 isClearable
//                                                 isSearchable
//                                                 noOptionsMessage={() => "No options available"}
//                                                 className="rounded-md w-full outline-green border border-grayLight hover:border-green"
//                                                 styles={{
//                                                     control: (provided, state) => ({
//                                                         ...provided,
//                                                         border: "none",
//                                                         boxShadow: state.isFocused ? null : null
//                                                     }),
//                                                     option: (provided, state) => ({
//                                                         ...provided,
//                                                         zIndex: "9999",
//                                                         backgroundColor: state.isSelected
//                                                             ? "#00B56C"
//                                                             : state.isFocused
//                                                                 ? "#e1f0e3"
//                                                                 : "transparent",
//                                                         color: state.isSelected
//                                                             ? "white"
//                                                             : state.isFocused
//                                                                 ? "black"
//                                                                 : "black",
//                                                         "&:hover": {
//                                                             backgroundColor: "#e1f0e3",
//                                                             color: "black"
//                                                         }
//                                                     })
//                                                 }}
//                                             />
//                                         </div>

//                                     </div>
//                                     <div className="flex">

//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md  font-popins font-medium">

//                                                 <b>Date:</b>{" "}
//                                             </label>
//                                             <input
//                                                 aria-required
//                                                 onChange={(e: any) => {

//                                                     setFormData((prev) => ({ ...prev, "date": e.target?.value }))
//                                                 }}
//                                                 type="date"
//                                                 name="Date"
//                                                 value={formdata.date}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Date"
//                                                 required
//                                             />

//                                         </div>
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md  font-popins font-medium">

//                                                 <b>Time:</b>{" "}
//                                             </label>
//                                             <input
//                                                 aria-required
//                                                 onChange={(e: any) => {

//                                                     setFormData((prev) => ({ ...prev, "time": e.target?.value }))
//                                                 }}
//                                                 type="time"
//                                                 name="time"
//                                                 value={formdata.time}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Time"
//                                                 required
//                                             />

//                                         </div>
//                                     </div>
//                                     <div className="flex">
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md w-full font-popins font-medium">

//                                                 <b> Name:</b>{" "}
//                                             </label>
//                                             <input
//                                                 aria-required
//                                                 onChange={(e: any) => {
//                                                     setFormData((prev) => ({ ...prev, "name": e.target?.value }))
//                                                 }}
//                                                 type="text"
//                                                 name="name"
//                                                 value={formdata.name}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Enter Name"
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md w-full font-popins font-medium">

//                                                 <b> Contact No:</b>{" "}
//                                             </label>
//                                             <input
//                                                 aria-required
//                                                 onChange={(e: any) => {
//                                                     setFormData((prev) => ({ ...prev, contact: e.target?.value }))
//                                                 }}
//                                                 type="text"
//                                                 name="contact"
//                                                 value={formdata.contact}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Enter Contact"
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="flex">
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md w-full font-popins font-medium">

//                                                 <b> Email:</b>{" "}
//                                             </label>
//                                             <input
//                                                 aria-required
//                                                 onChange={(e: any) => {
//                                                     setFormData((prev) => ({ ...prev, email: e.target?.value }))
//                                                 }}
//                                                 type="text"
//                                                 name="email"
//                                                 value={formdata.email}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Enter Email"
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md w-full font-popins font-medium">

//                                                 <b>Description:</b>{" "}
//                                             </label>
//                                             <input
//                                                 aria-required
//                                                 onChange={(e: any) => {
//                                                     setFormData((prev) => ({ ...prev, "description": e.target?.value }))
//                                                 }}
//                                                 type="text"
//                                                 name="description"
//                                                 value={formdata.description}
//                                                 className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
//                                                 placeholder="Description"
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="flex">
//                                         <div className="w-[20rem] ml-2">
//                                             <label className="text-black text-md w-full font-popins font-medium">

//                                                 <b> Select Vehicle:</b>{" "}
//                                             </label>
//                                             <Select
//                                                 onChange={handleInputChangeVehicle}
//                                                 options={options}
//                                                 value={
//                                                     vehicleList.find((i) => i._id === formdata.vehicleId)
//                                                         ? {
//                                                             value: formdata.vehicleId,
//                                                             label: vehicleList.find((i) => { return i._id === formdata.vehicleId })?.vehicleReg
//                                                         }
//                                                         : null
//                                                 }
//                                                 placeholder="Pick Vehicle"
//                                                 isClearable
//                                                 isSearchable
//                                                 noOptionsMessage={() => "No options available"}
//                                                 className="   rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
//                                                 styles={{
//                                                     control: (provided, state) => ({
//                                                         ...provided,
//                                                         border: "none",
//                                                         boxShadow: state.isFocused ? null : null,
//                                                     }),
//                                                     option: (provided, state) => ({
//                                                         ...provided,
//                                                         backgroundColor: state.isSelected
//                                                             ? "#00B56C"
//                                                             : state.isFocused
//                                                                 ? "#e1f0e3"
//                                                                 : "transparent",
//                                                         color: state.isSelected
//                                                             ? "white"
//                                                             : state.isFocused
//                                                                 ? "black"
//                                                                 : "black",
//                                                         "&:hover": {
//                                                             backgroundColor: "#e1f0e3",
//                                                             color: "black",
//                                                         },
//                                                     }),
//                                                 }}
//                                             />
//                                         </div>
//                                         <div className="w-[20rem] ml-2 ">
//                                             <label className="text-black text-md w-full font-popins font-medium">

//                                                 <b> Select Driver:</b>{" "}
//                                             </label>
//                                             <Select
//                                                 onChange={handleInputChangeDriver}
//                                                 options={DriverData.map((i) => {
//                                                     return { label: (i.driverfirstName + " " + i.driverMiddleName + " " + i.driverLastName).replaceAll("undefined", ""), value: i._id }
//                                                 })}
//                                                 value={
//                                                     DriverData.find((i) => i._id === formdata.driverId)
//                                                         ? {
//                                                             value: formdata.driverId,
//                                                             label: `${DriverData.find((i) => i._id === formdata.driverId).driverfirstName || ""} ${DriverData.find((i) => i._id === formdata.driverId).driverMiddleName || ""} ${DriverData.find((i) => i._id === formdata.driverId).driverLastName || ""}`.trim()
//                                                         }
//                                                         : null
//                                                 }
//                                                 placeholder="Pick Driver"
//                                                 isClearable
//                                                 isSearchable
//                                                 noOptionsMessage={() => "No options available"}
//                                                 className="   rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
//                                                 styles={{
//                                                     control: (provided, state) => ({
//                                                         ...provided,
//                                                         border: "none",
//                                                         boxShadow: state.isFocused ? null : null,
//                                                     }),
//                                                     option: (provided, state) => ({
//                                                         ...provided,
//                                                         backgroundColor: state.isSelected
//                                                             ? "#00B56C"
//                                                             : state.isFocused
//                                                                 ? "#e1f0e3"
//                                                                 : "transparent",
//                                                         color: state.isSelected
//                                                             ? "white"
//                                                             : state.isFocused
//                                                                 ? "black"
//                                                                 : "black",
//                                                         "&:hover": {
//                                                             backgroundColor: "#e1f0e3",
//                                                             color: "black",
//                                                         },
//                                                     }),
//                                                 }}
//                                             />
//                                         </div>

//                                     </div>

//                                 </>
//                                 <div className="flex justify-end space-x-2 mt-4 ml-4">
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setModalOpen(false); // Close the modal
//                                             setFormData({
//                                                 id: "",
//                                                 pickup: "",
//                                                 destination: "",
//                                                 time: "",
//                                                 name: "",
//                                                 date: "",
//                                                 contact: "",
//                                                 email: "",
//                                                 vehicleId: "",
//                                                 driverId: "",
//                                                 description: "",
//                                                 clientId: session?.clientId,
//                                                 coordinates: []
//                                                 // fair: 0
//                                             })
//                                             // setEditmodalOpen(false)


//                                         }}
//                                         className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button

//                                         type="submit"
//                                         className="bg-[#00B56C] text-white px-4 py-2 rounded-lg"
//                                     >
//                                         {isEdit ? "Update" : "Save"}
//                                     </button>
//                                 </div>

//                             </form>
//                         </div>
//                     </div>
//                 </>
//             )}
//             {deleteModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg w-100">
//                         <h3 className="text-xl font-bold mb-4 text-center">
//                             Delete Booking
//                         </h3>
//                         <p>
//                             Are You sure, You wants to delete a Booking
//                         </p>

//                         <div className="flex justify-center space-x-2 mt-4">
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setDeleteModal(false)
//                                     setId("")

//                                 }}
//                                 className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg"
//                             >
//                                 No
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     setDeleteModal(false)
//                                     setId("")
//                                     deleteBooking({ token: session?.accessToken, id: id }).then((resp) => {
//                                         if (resp.success) {
//                                             toast.success(resp.message)
//                                         }

//                                         getBookings()
//                                     })

//                                 }}
//                                 className="bg-[#00B56C] text-white px-4 py-2 rounded-lg"
//                             >
//                                 Yes
//                             </button>
//                         </div>

//                     </div>
//                 </div>
//             )}
//             {googlemodal && typeof window !== "undefined"
//                 // && isLoaded
//                 && (
//                     <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
//                         <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl p-6">
//                             <div className="flex justify-between mb-4">
//                                 <h2 className="text-xl font-semibold">
//                                     Select {selectingField === 'pickup' ? 'Pickup' : 'Destination'} Locatio
//                                 </h2>
//                                 <button onClick={() => setGoogleModal(false)}>✖️</button>
//                             </div>
//                             <MapContainer
//                                 center={mapcenter}
//                                 zoom={13}
//                                 style={{ height: "400px", width: "100%" }}
//                             >
//                                 <TileLayer
//                                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                                     attribution="&copy; OpenStreetMap contributors"
//                                 />
//                                 <LocationSelector
//                                     selectingField={selectingField}
//                                     setFormData={setFormData}
//                                     setPickup={setPickup}
//                                     setDestination={setDestination}
//                                 />
//                                 {pickupPoint.lat && (
//                                     <Marker position={[pickupPoint.lat, pickupPoint.lng]}
//                                         icon={
//                                             new L.Icon({
//                                                 iconUrl:
//                                                     "https://img.icons8.com/fluent/48/000000/marker-a.png",
//                                                 iconAnchor: [22, 47],
//                                                 popupAnchor: [1, -34],
//                                             })
//                                         }
//                                     />
//                                 )}
//                                 {destinationPoint.lat && (
//                                     <Marker position={[destinationPoint.lat, destinationPoint.lng]}
//                                         icon={
//                                             new L.Icon({
//                                                 iconUrl:
//                                                     "https://img.icons8.com/fluent/48/000000/marker-b.png",
//                                                 iconAnchor: [22, 47],
//                                                 popupAnchor: [1, -34],
//                                             })
//                                         }
//                                     />
//                                 )}
//                                 {routeCoords?.length > 0 && (
//                                     <Polyline
//                                         pathOptions={{ color: "red", weight: 6 }}

//                                         positions={routeCoords}
//                                     />
//                                 )}
//                             </MapContainer>
//                         </div>
//                     </div>
//                 )}

//             <Toaster position="top-center" reverseOrder={false} />

//         </div>
//     )
// }
// export default Bookings

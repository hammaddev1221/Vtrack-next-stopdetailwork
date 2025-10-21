"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaRegFileAlt, FaWrench } from "react-icons/fa"; // Example ico
import {
  handleServiceHistoryRequest,
  vehicleListByClientId,
  handleServicesRequest,
  getVehicleDataByClientId,
  getevents,
} from "@/utils/API_CALLS";
import { DeviceAttach } from "@/types/vehiclelistreports";
import "./assign.css";
import Graph from "@/components/servicehistory/graph"; // Import the time icon
// Assuming there's an API service to get the service data
import { FaCogs } from "react-icons/fa";
import { socket } from "@/utils/socket";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import DocumentTab from '@/components/servicehistory/document'
import MaintenanceTab from '@/components/servicehistory/maintenance'
import ServiceTab from '@/components/servicehistory/services'
const moment = require("moment-timezone");

export default function Work() {
  const router = useRouter();
  const { data: session } = useSession();
  if (!session?.ServiceHistory) {
    router.push("/liveTracking");
  }
  const [isOnline, setIsOnline] = useState(false);
  const [piedata, setpiedata] = useState([]);
  const [bardata, setbardata] = useState([]);
  const [linedata, setlinedata] = useState([]);
  const [socketdata, setsocketdata] = useState<VehicleData[]>([]);
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [selectedvehicle, setselectedvehicle] = useState();
  const [singleVehicleDetail, setsingleVehicleDetail] = useState<any>({});
  const [alldataofservices, setalldataofservices] = useState<any[]>([]);
  const [alldataofmaintenance, setalldataofmaintenance] = useState<any[]>([]);
  const [alldataofdocumentation, setalldataofdocumentation] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  const [activeTab, setActiveTab] = useState("services"); // "card" or "table"
  const [simpleservices, setsimpleServices] = useState<any[]>([]);
  const initialsimpleservicesForm = {
    service: "",
    other: "",
  };
  const [simpleservicesForm, setsimpleservicesForm] = useState(initialsimpleservicesForm);
  const [modalOpenNew, setModalOpenNew] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [documentselected, setdocumentselected] = useState(null);
  const [isFirstTimeFetchedFromGraphQL, setIsFirstTimeFetchedFromGraphQL] = useState(false);
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
          setsocketdata([...uniqueData, ...vehicleList].reduce((acc, curr) => {
            const existing = acc.find(item => item.vehicleReg === curr.vehicleReg);
            if (existing) {
              // Update the existing entry with the maximum values
              existing.service = Math.max(existing.service || 0, curr.service || 0);
              existing.document = Math.max(existing.document || 0, curr.document || 0);
            } else {
              // Add a new entry if it doesn't exist
              acc.push({ ...curr });
            }
            return acc;
          }, []));
          let data = moment().tz(session?.timezone).toString().split(" ")
          if (piedata.length == 0) {
            setpiedata(
              uniqueData
                .filter((i) => {
                  return Number(i.distance?.split(" ")[0]) > 0
                    && i?.lastParked?.split(" ")[0] == data[2]
                    && i?.lastParked?.split(" ")[1] == data[1]

                })
                .map((item) => {
                  return {
                    name: item.vehicleReg,
                    distance: Number(item.distance?.split(" ")[0]) || 0,
                  };
                })
            );
          }
          if (bardata.length == 0) {

            setbardata(
              uniqueData.filter((i) => {
                return i.tripcount != 0 && i.tripcount != null
                  && i?.lastParked?.split(" ")[0] == data[2]
                  && i?.lastParked?.split(" ")[1] == data[1]
              })
                .map((item) => {
                  return {
                    name: item.vehicleReg,
                    tripcount: Number(item?.tripcount) || 0,
                  };
                })
            );
          }
        }
      }
    }
    dataFetchHandler();
  }, [isFirstTimeFetchedFromGraphQL, vehicleList]);
  const fetchTimeoutGraphQL = 60 * 1000; //60 seconds
  useEffect(() => {
    setIsOnline(navigator.onLine);
  }, []);
  useEffect(() => {
    let interval = setInterval(() => {
      setIsFirstTimeFetchedFromGraphQL((prev) => !prev);
    }, fetchTimeoutGraphQL); // Runs every fetchTimeoutGraphQL seconds
    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, [isOnline, session?.clientId]);
  useEffect(() => {
    if (activeTab == null) {

      vehicleListData()
    }
  }, [activeTab])
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
            setsocketdata([...uniqueData, ...vehicleList].reduce((acc, curr) => {
              const existing = acc.find(item => item.vehicleReg === curr.vehicleReg);
              if (existing) {
                // Update the existing entry with the maximum values
                existing.service = Math.max(existing.service || 0, curr.service || 0);
                existing.document = Math.max(existing.document || 0, curr.document || 0);
              } else {
                // Add a new entry if it doesn't exist
                acc.push({ ...curr });
              }
              return acc;
            }, []));
            // setpiedata(
            //   uniqueData
            //     .filter((i) => { return Number(i.distance?.split(" ")[0]) > 0 })
            //     .map((item) => {
            //       return {
            //         name: item.vehicleReg,
            //         distance: Number(item.distance?.split(" ")[0]) || 0,
            //       };
            //     })


            // );
            // setbardata(


            //   uniqueData.filter((i) => { return i.tripcount != 0 && i.tripcount != null })
            //     .map((item) => {
            //       return {
            //         name: item.vehicleReg,
            //         tripcount: Number(item?.tripcount) || 0,
            //       };
            //     })
            // );
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

  async function getEventsdata() {
    let data = (await getevents(session?.clientId, session?.accessToken
    ))?.data;
    if (data?.length != 0) {
      setlinedata(data.filter((i) => {
        return i["Harsh Acceleration"] > 0 || i["Harsh Break"] > 0 || i["Harsh Cornering"] > 0
        // || i["Over Speeding"] > 0
      }));
    }
  }
  useEffect(() => {
    getEventsdata();
  }, []);
  const vehicleListData = async () => {
    if (session) {
      const Data = await vehicleListByClientId({
        token: session?.accessToken,
        clientId: session?.clientId,
      });
      setVehicleList(Data.data);
    }
  };
  useEffect(() => {
    vehicleListData();
  }, []);

  const fetchServicesFromAPI = async () => {
    if (session) {
      try {
        const Data = await handleServiceHistoryRequest({
          token: session?.accessToken,
          method: "GET",
        });

        return Data;
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };

  //get add and delete service/////

  const fetchServices = async () => {
    if (session) {
      try {
        const Data = await handleServicesRequest({
          token: session?.accessToken,
          method: "GET",
        });
        setsimpleServices(Data.data);
        return Data.data;
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };

  const AddfetchServices = async (data) => {
    data.clientId = session?.clientId;
    if (session) {
      try {
        const Data = await handleServicesRequest({
          token: session?.accessToken,
          method: "POST",
          payload: data,
        });
        if (Data.success == true) {
          await fetchServices();
          toast.success(Data.message);
          setModalOpenNew(false);
        }
        return Data;
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };



  const DeleteServices = async (id) => {
    if (session) {
      try {
        const Data = await handleServicesRequest({
          token: session?.accessToken,
          method: "DELETE",
          payload: { id: id },
        });
        if (Data.success == true) {
          await fetchServices();
          toast.success(Data.message);
        }
        return;
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };

  useEffect(() => {
    const loadsimpleServices = async () => {
      try {
        const fetchedServices = await fetchServices();
        if (fetchedServices.length > 0) {
          setsimpleServices(fetchedServices);
        } else {
          setsimpleServices([]); // Empty data set
        }
      } catch (error) {
        toast.error("Failed to load services.");
        setsimpleServices([]); // In case of error, set to empty
      }
    };
    loadsimpleServices();
  }, []);
  const handleSubmitservice = async (e: React.FormEvent) => {
    e.preventDefault();
    setsimpleservicesForm(initialsimpleservicesForm);
    await AddfetchServices(simpleservicesForm);
  };
  ////////



  useEffect(() => {
    const loadServiceHistories = async () => {
      try {
        const fetchedServices = await fetchServicesFromAPI();
        setServices(fetchedServices);
        if (fetchedServices.length > 0) {
          setalldataofdocumentation(fetchedServices?.filter((i) => { return i.dataType === 'Documentation' }))
          setalldataofmaintenance(fetchedServices?.filter((i) => { return i.dataType === 'Maintenance' }))
          setalldataofservices(fetchedServices?.filter((i) => { return i.dataType === 'Service' }))
        }
      } catch (error) {
        toast.error("Failed to load services.");
      }
    };
    loadServiceHistories();
  }, []);


  const handleInputserviceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setsimpleservicesForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    if (documentselected === "document") {
      setActiveTab("documentation");
    } else {
      setActiveTab("services");
    }
  }, [documentselected]);  // This effect runs whenever documentselected changes

  const handleCardClick = (e) => {

    setselectedvehicle(e);
    let { odometer1 } = socketdata.filter((item) => item.vehicleReg == e)[0]
    let { _id, clientId, vehicleReg, vehicleMake, vehicleModel, vehicleType } = vehicleList.filter((item) => item.vehicleReg == e)[0]


    setsingleVehicleDetail(
      {
        odometer1, _id, clientId, vehicleReg, vehicleMake, vehicleModel, vehicleType
      }

    );
     setActiveTab("services");

  };


  const hanldecancelVehicle = () => {
    // setFilteredServices(services);
    setActiveTab(null);
    setselectedvehicle(null);
    setdocumentselected(null);
  };

  // const initialFormData: VehicleData = {
  //   clientId: "",
  //   vehicleId: "",
  //   serviceTitle: "",
  //   reminderDay: 0,
  //   reminderMilage: 0,
  //   expiryDay: 0,
  //   expiryMilage: 0,
  //   lastMilage: 0,
  //   lastDate: "",
  //   expiryDate: "",
  //   dataType: "",
  //   maintenanceType: "",
  //   file: "",
  //   filename: "",
  //   documentType: "",
  //   issueDate: "",
  //   sms: false,
  //   email: false,
  //   pushnotification: false,
  //   status: "",
  //   documents: [],
  // };
  // const [formData, setFormData] = useState<VehicleData>(initialFormData);

  interface VehicleData {
    clientId: string;
    vehicleId: string;
    serviceTitle: string;
    reminderDay: number;
    reminderMilage: number;
    expiryDay: number;
    expiryMilage: number;
    lastMilage: number;
    lastDate: string;
    dataType: string;
    sms: boolean;
    email: boolean;
    pushnotification: boolean;
    isExpiryDateSelected: boolean;
    isExpiryMileageSelected: boolean;
    isReminderDateSelected: boolean;
    isReminderMileageSelected: boolean;
    isLastDateSelected: boolean;
    isLastMileageSelected: boolean;
    documents: Array;
    odometer1: any
  }

  // const initialServiceFormData: VehicleData = {
  //   clientId: "",
  //   vehicleId: "",
  //   serviceTitle: "",
  //   reminderDay: 0,
  //   reminderMilage: 0,
  //   expiryDay: 0,
  //   expiryMilage: 0,
  //   lastMilage: 0,
  //   lastDate: "",
  //   dataType: "",
  //   sms: false,
  //   email: false,
  //   pushnotification: false,
  //   isExpiryDateSelected: false,
  //   isExpiryMileageSelected: false,
  //   isReminderDateSelected: false,
  //   isReminderMileageSelected: false,
  //   isLastDateSelected: false,
  //   isLastMileageSelected: false,
  //   documents: [],
  // };
  // const [serviceFormData, setServiceFormData] = useState<VehicleData>(
  //   initialServiceFormData
  // );


  // const [filteredServices, setFilteredServices] = useState([]);

  return (
    <div>
      <p className="bg-green px-4 border-t-2  text-center text-2xl sm:text-xl text-white font-bold">
        Service History
      </p>
      {selectedvehicle && singleVehicleDetail && (
        <div className="pl-1">
          {/* Back Button and Title */}
          <div className="flex items-center mt-6 pl-8">
            <button
              onClick={() => hanldecancelVehicle()}
              className="flex items-center text-[#00B56C] hover:text-[#008C47]"
            >
              {/* Back Arrow Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.0"
                width="14"
                height="14"
                viewBox="0 0 512 512"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                transform="rotate(180)"
              >
                <g
                  transform="translate(0,512) scale(0.1,-0.1)"
                  fill="green"
                  stroke="none"
                >
                  <path
                    d="M2716 5110 c-83 -26 -131 -135 -95 -214 7 -14 451 -506 988 -1093
        l977 -1068 -2231 -5 c-2092 -5 -2232 -6 -2262 -22 -100 -55 -109 -194 -17
        -264 l37 -29 2238 -5 2238 -5 -976 -1075 c-536 -591 -981 -1087 -989 -1102
        -34 -65 -8 -152 59 -202 38 -28 126 -28 164 0 38 28 2230 2442 2249 2476 18
        34 18 90 0 131 -15 33 -2201 2426 -2246 2459 -31 21 -95 30 -134 18z"
                  />
                </g>
              </svg>
              <span className="text-lg pl-4 ">Vehicle</span>
            </button>
          </div>
          <>
            {/* Vehicle Details Section */}
            <div className="pl-8 pt-4">
              {/* Vehicle Reg - Big Text */}
              <p className="text-5xl font-bold text-black">
                {singleVehicleDetail.vehicleReg}
              </p>

              {/* Make, Model, Year - Small Text */}
              <div className="mb-8 flex space-x-4">
                <span className="text-sm font-medium text-gray">
                  {singleVehicleDetail.vehicleMake}
                </span>
                <span className="text-sm font-medium text-gray">
                  {singleVehicleDetail.vehicleModel}
                </span>
                <span className="text-sm font-medium text-gray">
                  {singleVehicleDetail.vehicleType}
                </span>
              </div>
            </div>
          </>

        </div>
      )}

      {/* Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      <div
        className={`${!selectedvehicle ? "grid grid-cols-12 gap-4 bg-white" : ""
          }`}
      >
        <div className={`px-8  ${!selectedvehicle ? "col-span-9" : ""}`}>
          {/* inner side of cards */}
          {selectedvehicle && (
            <>
              {/* Show icons for Maintenance Log, Services, and Documentation */}
              <div className="flex justify-start items-center border-b border-gray-200 mb-4 ">
                {/* Services Tab */}
                <button
                  onClick={() => setActiveTab("services")}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${activeTab === "services"
                    ? "bg-[#00B56C] text-white"
                    : "bg-transparent hover:bg-[#D1FAE5] "
                    }`}
                >
                  <span className="service-icon">
                    <FaCogs className="w-6 h-6" /> {/* Gears icon */}
                  </span>
                  Services
                </button>

                <button
                  onClick={() => setActiveTab("maintenance")}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${activeTab === "maintenance"
                    ? "bg-[#00B56C] text-white"
                    : "bg-transparent hover:bg-[#D1FAE5]"
                    }`}
                >
                  {/* Icon for maintenance with rotated arrow */}
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className="mr-2 w-6 h-6"
                  >
                    <g
                      transform="translate(0,512) scale(0.1,-0.1)"
                      fill={`${activeTab === "maintenance" ? "white" : "black"
                        }`}
                      stroke="none"
                    >
                      <path
                        d="M3595 5109 c-93 -13 -239 -52 -333 -90 -339 -135 -621 -424 -751
        -769 -112 -298 -117 -585 -16 -926 5 -17 -170 -180 -1128 -1046 -624 -565
        -1159 -1054 -1190 -1088 -64 -72 -116 -164 -149 -270 -19 -63 -23 -95 -22
        -205 0 -148 21 -228 89 -352 50 -90 178 -218 268 -268 123 -68 203 -88 352
        -89 110 -1 142 3 205 22 106 33 198 84 270 149 34 31 523 566 1088 1190 866
        958 1029 1133 1046 1128 213 -63 389 -84 564 -67 341 34 626 171 858 415 182
        191 292 403 351 677 37 177 17 524 -37 630 -32 62 -92 89 -167 75 -33 -6 -77
        -45 -323 -290 l-285 -283 -259 52 c-175 35 -262 56 -267 66 -5 8 -31 128 -58
        265 l-50 250 284 285 c245 246 284 290 290 323 14 74 -13 135 -75 167 -87 44
        -393 71 -555 49z m-42 -492 c-174 -175 -202 -209 -209 -243 -6 -30 9 -123 66
        -409 40 -203 79 -385 88 -403 28 -62 46 -68 444 -147 205 -41 385 -75 401 -75
        51 0 90 30 286 223 l193 192 -6 -70 c-16 -167 -70 -331 -157 -471 -63 -101
        -196 -242 -286 -303 -304 -203 -665 -243 -996 -112 -90 36 -139 39 -184 12
        -17 -11 -520 -559 -1116 -1218 -867 -958 -1095 -1204 -1138 -1230 -226 -135
        -513 -38 -611 207 -17 43 -22 75 -22 150 0 111 23 182 82 256 20 25 568 525
        1217 1112 649 587 1190 1083 1202 1101 31 46 29 94 -7 184 -87 219 -101 448
        -39 676 88 328 333 592 654 707 97 34 223 61 299 63 l40 1 -201 -203z"
                      />
                      <path
                        d="M671 873 c-60 -30 -93 -111 -71 -177 14 -45 69 -93 115 -102 49 -9
      119 19 146 58 46 64 30 165 -33 211 -37 27 -114 32 -157 10z"
                      />
                    </g>
                  </svg>
                  Maintenance Log
                </button>


                <button
                  onClick={() => {
                    setActiveTab("documentation");
                    // setFormData({ ...formData, dataType: "Documentation" });
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${activeTab === "documentation"
                    ? "bg-[#00B56C] text-white"
                    : "bg-transparent hover:bg-[#D1FAE5]"
                    }`}
                >

                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="mr-2 w-6 h-6"
                  >
                    {/* Documentation Icon */}
                    <rect
                      x="5"
                      y="3"
                      width="14"
                      height="18"
                      stroke={
                        activeTab === "documentation" ? "white" : "black"
                      }
                      strokeWidth="2"
                      fill="none"
                    />
                    <line
                      x1="13"
                      y1="3"
                      x2="13"
                      y2="9"
                      stroke={
                        activeTab === "documentation" ? "white" : "black"
                      }
                      strokeWidth="2"
                    />
                    <line
                      x1="13"
                      y1="9"
                      x2="19"
                      y2="9"
                      stroke={
                        activeTab === "documentation" ? "white" : "black"
                      }
                      strokeWidth="2"
                    />
                  </svg>

                  Document
                </button>
              </div>

              {activeTab === "documentation" && (
                <>

                  <DocumentTab documentationdata={alldataofdocumentation} singleVehicleDetail={singleVehicleDetail} />

                </>
              )}
              {activeTab === "maintenance" && (
                <>
                  <MaintenanceTab maintenancedata={alldataofmaintenance} singleVehicleDetail={singleVehicleDetail} />
                </>
              )}

              {activeTab === "services" && (
                <>
                  <ServiceTab servicedata={alldataofservices} singleVehicleDetail={singleVehicleDetail} />
                </>
              )}
            </>
          )}

          {/*  inner side of cards  */}
          {/* Main Action Section */}
          {!selectedvehicle && (
            <div className="flex justify-start items-center border-b border-gray-200 mt-8  rounded-md">
              {/* Services Tab */}

              <button
                onClick={() => setViewMode("card")}
                className={`px-8 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${viewMode === "card"
                  ? "bg-[#00B56C] text-white"
                  : "bg-transparent hover:bg-[#D1FAE5]"
                  }`}
              >
                Vehicles
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`px-8 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${viewMode === "table"
                  ? "bg-[#00B56C] text-white"
                  : "bg-transparent hover:bg-[#D1FAE5] "
                  }`}
              >
                Services
              </button>
            </div>
          )}

          {!selectedvehicle && (
            <div className="  rounded-md shadow px-4 py-[1rem] mt-4">
              {viewMode === "table" && (
                <button
                  onClick={() => setModalOpenNew(true)}
                  className="mr-auto mb-4 px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20px"
                    height="20px"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                  Create service
                </button>
              )}
              <div className=" ">
                {/* Display Vehicles in Card View */}
                {viewMode === "card" && (
                  <div
                    className="overflow-y-auto max-h-[290px] min-h-[300px]"
                    style={{ boxSizing: "border-box" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {socketdata.map((vehicle, index) => (
                        <div
                          key={vehicle.vehicleReg}
                          onClick={() => handleCardClick(vehicle.vehicleReg)}
                          className="relative border-l-8 justify-between bg-white p-[1.1rem] rounded-lg h-auto flex items-start  cursor-pointer"
                          style={{
                            borderLeftColor:
                              vehicle.vehicleStatus === "Parked"
                                ? "#FF0000" // Red for parked
                                : vehicle.vehicleStatus === "Moving"
                                  ? "#00B56C" // Green for moving
                                  : vehicle.vehicleStatus === "Pause"
                                    ? "#eec40f" // Yellow for paused
                                    : "#808080", // Gray for other statuses
                          }}
                        >
                          {/* Left side: Vehicle Reg and SVG */}
                          <div className="flex flex-col items-start ">
                            {/* Vehicle Registration on top */}
                            <h2 className="text-xl mb-4">
                              {vehicle.vehicleReg}
                            </h2>

                            {/* SVG below the vehicle registration */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill={
                                vehicle.vehicleStatus === "Parked"
                                  ? "#FF0000" // Red for parked
                                  : vehicle.vehicleStatus === "Moving"
                                    ? "#00B56C" // Green for moving
                                    : vehicle.vehicleStatus === "Pause"
                                      ? "#eec40f" // Yellow for paused
                                      : "#808080" // Gray for other statuses
                              }
                              viewBox="0 0 15 15"
                              className="w-12 h-12"
                              style={{
                                flexShrink: 0, // Prevent the SVG from shrinking
                              }}
                            >
                              <path d="M12.6,8.7,11.5,6.5a1.05,1.05,0,0,0-.9-.5H4.4a1.05,1.05,0,0,0-.9.5L2.4,8.7,1.16,9.852a.5.5,0,0,0-.16.367V14.5a.5.5,0,0,0,.5.5h2c.2,0,.5-.2.5-.4V14h7v.5c0,.2.2.5.4.5h2.1a.5.5,0,0,0,.5-.5V10.219a.5.5,0,0,0-.16-.367ZM4.5,7h6l1,2h-8ZM5,11.6c0,.2-.3.4-.5.4H2.4c-.2,0-.4-.3-.4-.5V10.4c.1-.3.3-.5.6-.4l2,.4c.2,0,.4.3.4.5Zm8-.1c0,.2-.2.5-.4.5H10.5c-.2,0-.5-.2-.5-.4v-.7c0-.2.2-.5.4-.5l2-.4c.3-.1.5.1.6.4ZM14,2V3a1.009,1.009,0,0,1-1.017,1H5.348A2.549,2.549,0,0,1,1,3.5H3.5v-2H1A2.549,2.549,0,0,1,5.348,1h7.635A1.009,1.009,0,0,1,14,2Z" />
                            </svg>
                          </div>

                          {/* Right side: Buttons stacked vertically */}
                          <div className="flex flex-col justify-between  space-y-2 ">
                            {/* Button 1 - Redirect */}
                            <button
                              onClick={() =>
                                router.push(
                                  `/liveTracking?vehicleReg=${vehicle.vehicleReg}`
                                )
                              }
                              className="flex items-center justify-center p-1 bg-[#f3f4f6] text-black rounded-md hover:bg-[#D1FAE5]"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                style={{
                                  color: "black",
                                }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </button>

                            {/* Button 2 - Wrench */}
                            <button
                              // onClick={() => router.push(`/liveTracking?vehicleReg=${vehicle.vehicleReg}`)}
                              className="flex items-center justify-center p-1 bg-[#f3f4f6] text-black rounded-md gap-2 hover:bg-[#D1FAE5]"
                            >
                              <FaCogs className="text-black text-sm" />
                              {vehicle.service ? vehicle.service : "0"}
                            </button>

                            {/* Button 3 - File */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setdocumentselected("document")
                                handleCardClick(vehicle?.vehicleReg);
                              }}
                              className="flex items-center justify-center p-1 bg-[#f3f4f6] text-black rounded-md gap-2 hover:bg-[#D1FAE5]"
                            >
                              <FaRegFileAlt className="text-black text-sm" />{" "}
                              {vehicle.document ? vehicle.document : "0"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display Vehicles in Table View */}
                {viewMode === "table" && (
                  <div className="relative w-full bg-white overflow-x-auto max-h-[250px] min-h-[250px]">
                    {" "}
                    {/* Set max height for the outer div */}
                    <div className="overflow-y-auto h-full">
                      {" "}
                      {/* This ensures the inner div scrolls while maintaining the height of the parent div */}
                      <table className="min-w-full table-auto">
                        <thead className="bg-[#E2E8F0]">
                          <tr>
                            <th className="px-2 py-1 text-center  w-[50px]">
                              S.No
                            </th>
                            <th className="px-2 py-1 w-[200px] text-left">
                              Service Title
                            </th>
                            <th className="px-2 py-1 text-left">
                              Other Information
                            </th>
                            <th className="px-2 py-1 text-left w-[50px]">
                              Delete
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {simpleservices.length === 0 ? (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-2 py-1 text-center text-gray-500"
                              >
                                No data found
                              </td>
                            </tr>
                          ) : (
                            simpleservices.map((item, index) => (
                              <tr
                                key={item.id} // Ensure you have a unique key, here using item.id
                                className="border-b hover:bg-[#D1FAE5]"
                              >
                                <td className="px-2 py-1 text-center">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-1 text-left break-words ">
                                  {item.service}
                                </td>
                                <td className="px-2 py-1 break-words text-left">
                                  {item.other}
                                </td>
                                <td className="px-2 py-1 pl-[1.5rem] text-center">
                                  <svg
                                    onClick={() => DeleteServices(item._id)}
                                    className="w-6 h-6 text-red-600 cursor-pointer hover:shadow-lg"
                                    xmlns="http://www.w3.org/2000/svg"
                                    version="1.0"
                                    width="512.000000pt"
                                    height="512.000000pt"
                                    viewBox="0 0 512.000000 512.000000"
                                    preserveAspectRatio="xMidYMid meet"
                                  >
                                    <g
                                      transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                      fill="#000000"
                                      stroke="none"
                                    >
                                      <path d="M1801 5104 c-83 -22 -165 -71 -224 -133 -99 -104 -137 -210 -137 -383 l0 -107 -509 -3 c-497 -3 -510 -4 -537 -24 -53 -39 -69 -71 -69 -134 0 -63 16 -95 69 -134 l27 -21 2139 0 2139 0 27 21 c53 39 69 71 69 134 0 63 -16 95 -69 134 -27 20 -40 21 -537 24 l-509 3 0 107 c0 173 -38 279 -137 383 -61 64 -141 111 -228 134 -85 22 -1431 21 -1514 -1z m1485 -330 c60 -44 69 -67 72 -185 l4 -109 -801 0 -801 0 0 94 c0 102 9 137 43 175 48 52 32 51 769 48 676 -2 687 -2 714 -23z" />
                                      <path d="M575 3826 c-41 -18 -83 -69 -90 -109 -7 -36 129 -3120 144 -3270 7 -78 16 -113 44 -170 62 -132 171 -223 306 -259 61 -16 181 -17 1581 -17 1400 0 1520 1 1581 17 135 36 244 127 306 259 28 57 37 92 44 170 16 153 151 3243 144 3275 -9 39 -52 88 -92 104 -48 20 -3923 20 -3968 0z m3735 -353 c-1 -27 -31 -721 -69 -1544 -66 -1466 -68 -1497 -90 -1532 -12 -21 -40 -44 -65 -56 -42 -21 -46 -21 -1526 -21 -1480 0 -1484 0 -1526 21 -59 28 -84 72 -90 156 -6 77 -134 2944 -134 2992 l0 31 1750 0 1750 0 0 -47z" />
                                      <path d="M1590 3033 c-37 -14 -74 -50 -91 -88 -18 -41 -18 -59 21 -953 31 -715 42 -917 54 -939 62 -121 224 -122 283 -3 l22 45 -39 913 c-42 966 -40 941 -92 989 -40 37 -111 53 -158 36z" />
                                      <path d="M2495 3026 c-41 -18 -83 -69 -90 -109 -3 -18 -4 -442 -3 -944 3 -903 3 -912 24 -939 39 -53 71 -69 134 -69 63 0 95 16 134 69 21 27 21 34 21 966 0 932 0 939 -21 966 -11 15 -32 37 -46 47 -33 25 -113 32 -153 13z" />
                                      <path d="M3420 3029 c-33 -13 -68 -47 -86 -81 -11 -21 -23 -237 -54 -939 -38 -895 -39 -914 -21 -954 54 -123 224 -125 287 -4 12 23 22 211 54 941 39 894 39 913 21 953 -10 23 -33 52 -51 65 -37 26 -111 36 -150 19z" />
                                    </g>
                                  </svg>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {modalOpenNew && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                className={`bg-white p-6 rounded-lg ${activeTab == "documentation" ? "w-[45rem]" : "w-96"
                  }`}
              >
                <h3 className="text-xl font-bold mb-4 text-center">
                  Add service 1
                </h3>
                <form onSubmit={handleSubmitservice}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      service Title
                    </label>
                    <input
                      type="text"
                      name="service"
                      value={simpleservicesForm.service}
                      onChange={handleInputserviceChange}
                      className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                      placeholder="Oil Changing / Tuning, etc."
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">Other</label>
                    <input
                      type="text"
                      name="other"
                      value={simpleservicesForm.other}
                      onChange={handleInputserviceChange}
                      className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                      placeholder="Any Information"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpenNew(false);
                        setsimpleservicesForm(initialsimpleservicesForm);

                      }}
                      className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#00B56C] text-white px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* MAin section end */}
        </div>

        {/* vehciles summary  */}
        {!selectedvehicle && (
          <div className="px-4 col-span-3 mt-[42px] ">
            <div className="grid row-span-2 gap-[42px]">
              <div className="p-2 rounded-md bg-white border border-gray p-2 w-[345px] h-[170px]">
                <h2 className="text-lg font-bold text-gray-700 pb-8">
                  Vehicles Service Reminder
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-red">
                      {
                        services?.filter(
                          (item) =>
                            item.dataType === "Service" &&
                            item.status == "due"
                        ).length
                      }
                    </p>
                    <p className="text-sm font-medium">Expired</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow">
                      {
                        services?.filter(
                          (item) =>
                            item.dataType === "Service" &&
                            item.status == "due soon"
                        ).length
                      }
                    </p>
                    <p className="text-sm font-medium">Expire Soon</p>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-md bg-white border border-gray p-2 w-[345px] h-[170px]">
                <h2 className="text-lg font-bold text-gray-700 pb-8">
                  Documents Renewal Reminder
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-red">
                      {
                        services?.filter(
                          (item) =>
                            item.dataType === "Documentation" &&
                            item.status == "due"
                        ).length
                      }
                    </p>
                    <p className="text-sm font-medium">Expired</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow">
                      {
                        services?.filter(
                          (item) =>
                            item.dataType === "Documentation" &&
                            item.status == "due soon"
                        ).length
                      }
                    </p>
                    <p className="text-sm font-medium">Expire Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grapg */}
      {!selectedvehicle && (
        <div className="mx-8">
          <Graph piedata={piedata} linedata={linedata} bardata={bardata} />
        </div>
      )}

    </div>

  );
}

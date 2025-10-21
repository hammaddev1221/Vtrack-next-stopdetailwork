"use client";
import React, { useRef } from "react";
import { Dialog } from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import {

  videoList,
  vehiclebyClientid,
} from "@/utils/API_CALLS";
import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Image from "next/image";
import Select from "react-select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import ProgressBar from "./Progressbar";
import moment from "moment";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
import "./newstyle.css";
import { backFromUnix } from "@/utils/unixTimestamp";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
} from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DateFnsMomentUtils from "@date-io/date-fns";
import EventIcon from "@material-ui/icons/Event";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { Modal, Backdrop, Fade, IconButton } from "@mui/material";
import Request from "./request";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import Box from "@mui/material/Box";
import { io, Socket } from "socket.io-client";
import logo from "../../../public/Images/loadinglogo.png"
import { redirect } from "next/navigation";
export default function DualCam() {
  const { data: session } = useSession();
  if (!session?.cameraProfile) {
    redirect("/liveTracking")
  }
  const [mediarawData, setmediarawData] = useState<
    pictureVideoDataOfVehicleT[]
  >([]);
  const [open, setOpen] = React.useState(false);
  const [toastId, setToastId] = useState<string | null>(null);
  const [singleImage, setSingleImage] = useState<any>();
  const [singleVideo, setSingleVideo] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageVideo, setCurrentPageVideo] = useState(1);
  const [activeTab1, setActiveTab1] = useState("View");
  const [filteredDataIsAvaialable, setfilteredDataIsAvaialable] =
    useState<boolean>(true);
  const [open1, setOpen1] = React.useState(false);
  const [openvideo, setopenvideo] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // const [fetchdata, setfetchdata] = useState<Boolean>(false);
  const [socket, setsocket] = useState([])
  const [socketdata, setSocketdata] = useState({
    camera: 0,
    camera_type: "",
    clientId: "",
    deviceDirectory: "",
    filename: "",
    filetype: "",
    metadata_type: 0,
    progress: 0,
    timestamp: null,
    received_packages: 0,
    total_packages: 0,
    vehicle: "",
  });
  const [progressHundred, setprogressHundred] = useState(false);
  const [mediaType, setMediaType] = useState("images");
  const [selectedVehiclelist, setSelectedVehiclelist] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [inputValue, setInputValue] = useState(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const socketRef = useRef<Socket | null>(null);
  const socketTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // TODO: allow port 7057 from camera and uncommit this code
  // useEffect(() => {
  //   socketRef.current = io("https://camera.vtracksolutions.com:7057", {
  //     autoConnect: false,
  //     query: { clientId: session?.clientId },
  //     transports: ["websocket", "polling", "flashsocket"],
  //     reconnection: true, // Enable automatic reconnections
  //     reconnectionAttempts: Infinity, // Attempt reconnections indefinitely
  //     reconnectionDelay: 1000, // Delay between reconnections (in milliseconds)
  //     reconnectionDelayMax: 5000 // Max delay between reconnections (in milliseconds)
  //   });
  //   socketRef.current.connect();
  //   socketRef.current.on("connect_error", () => {
  //   });
  //   socketRef.current.on("connect", () => {
  //   });
  //   socketRef.current.on("message", async (data) => {
  //     // data.date = (new Date()).getTime()
  //     setsocket((prevSocket: any) => {
  //       prevSocket = prevSocket.filter((i: any) => {
  //         return i.progress != 0
  //       })
  //       const deviceIndex = prevSocket.findIndex(
  //         (device: any) => device.deviceDirectory.split("/")[1] === data.deviceDirectory.split("/")[1]
  //       );
  //       if (deviceIndex !== -1 && data.progress != 0) {
  //         if (Math.floor(data.progress) == 100) {
  //           setprogressHundred(!progressHundred)
  //           prevSocket.splice(deviceIndex, 1)
  //           return prevSocket
  //         } else {

  //           const updatedDevices = [...prevSocket];
  //           updatedDevices[deviceIndex] = data
  //           return updatedDevices;
  //         }
  //       } else {
  //         if (Math.floor(data.progress) == 100) {
  //           setprogressHundred(!progressHundred)
  //           return prevSocket
  //         } else {
  //           return [
  //             ...prevSocket,
  //             data,
  //           ];
  //         }
  //       }
  //     });
  //     setSocketdata(data);
  //     if (data.message) {
  //       toast.dismiss(toastId);
  //       setToastId(null);
  //     }
  //     if (socketTimeoutRef.current) {
  //       clearTimeout(socketTimeoutRef.current);
  //     }
  //   });
  //   return () => {
  //     socketRef?.current?.off("message");
  //     socketRef?.current?.disconnect()
  //   }
  // }, []);

  useEffect(() => {
    let date = (new Date()).getTime() - 30000
    if (socket.length > 0) {
      let sockettimeout = setTimeout(() => {
        setsocket((prev) => {
          return prev.filter((i: any) => {
            return i.date > date
          })
        })
        setprogressHundred(!progressHundred)
      }, 31000)
      return () => clearTimeout(sockettimeout);
    }
  }, [socket])
  useEffect(() => {
    if (
      socketdata.filetype == ".jpeg" &&
      socketdata.progress > 1 &&
      socketdata.progress < 100
    ) {

      if (!toastId) {
        const id: any = toast.loading(`Image Downloading `, {
          position: "top-center",
        });
        setActiveTab1("View");
        setMediaType("images");
        setToastId(id);
      }
    } else if (socketdata.progress == 100 && toastId && socketdata.filetype == ".jpeg") {

      toast.success("Image Downloaded Successfully", {
        position: "top-center",
        autoClose: 5000,
      })
      toast.dismiss(toastId);
      setToastId(null);
      setprogressHundred(!progressHundred)
    }
    else if (socketdata.progress == 100 && toastId && socketdata.filetype == ".mp4") {

      toast.success("Video Downloaded Successfully", {
        position: "top-center",
        autoClose: 5000,
      })
      toast.dismiss(toastId);
      setToastId(null);
      setprogressHundred(!progressHundred)
    }
    else if (socketdata.filetype == ".h265" && socketdata.progress > 1 && socketdata.progress < 100) {

      if (!toastId) {
        const id = toast.loading("Video Downloading", {
          position: "top-center",
        });
        setActiveTab1("View");
        setMediaType("videos");
        setToastId(id);
      }

    }
  }, [socketdata, toastId]);

  const fetchVideoListData = async () => {
    try {
      setLoading(true)
      if (session) {
        const response = await videoList({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setmediarawData(response)
        setFilteredRecords(response);
        setLoading(false)
      }
    } catch (error) {
    }
  };

  const handleOpen1 = (item: any) => {
    setOpen1(true);
    setSingleImage(item.path);
  };
  const handleClose = () => {
    setOpen1(false);
    setIsFullScreen(false);
  };
  const handleClosevideo = () => {
    setopenvideo(false);
    setIsFullScreen(false);
  };

  const handleOpenSecond1 = (item: any) => {
    setopenvideo(true);
    setSingleVideo(item.path);
  };

  const handleFullScreen = () => {
    setIsFullScreen(true);
    setOpen1(false);
  };

  const handleExitFullScreen = () => {
    setIsFullScreen(false);
    setOpen1(true);
  };

  const style11 = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    p: 0,
    zIndex: 1300,
    bgcolor: "black",
  };

  const modalStyles = {
    ...style11,
    width: isFullScreen ? "95%" : "1000px",
    height: isFullScreen ? "95%" : "auto",
    zIndex: 1300,
    position: isFullScreen ? "fixed" : "absolute",
    top: isFullScreen ? "5%" : "50%",
    left: isFullScreen ? "5%" : "50%",
    transform: isFullScreen ? "none" : "translate(-50%, -50%)",
  };

  const handleClick = (tab: string) => {
    if(tab=="View" || activeTab1==tab){
      fetchVideoListData()
    }
    setActiveTab1((prevTab) => (prevTab === tab ? "View" : tab));
  };

  const sortedRecords = filteredRecords.sort(
    (a: any, b: any) =>
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
  const handleVehicleChange = (e: any) => {
    const selectedVehicleId = e;
    setSelectedVehiclelist(selectedVehicleId);
    if (selectedVehicleId === "" || selectedVehicleId === null) {
      if (fromDate && toDate !== null) {
        const fromDateString = (fromDate as any)?.toISOString().split("T")[0];
        const toDateString = (toDate as any)?.toISOString().split("T")[0];
        const filteredWithDate = mediarawData.filter((record) => {
          const recordDate = (record.dateTime as any).split("T")[0];
          return recordDate >= fromDateString && recordDate <= toDateString;
        });
        setCurrentPage(1);
        setCurrentPageVideo(1);
        setFilteredRecords(filteredWithDate);
        setfilteredDataIsAvaialable(true);
      } else {
        setCurrentPage(1);
        setCurrentPageVideo(1);
        setfilteredDataIsAvaialable(true);
        setFilteredRecords(mediarawData);
      }
    } else {
      const filtered = mediarawData.filter(
        (record) => record.Vehicle === selectedVehicleId?.value
      );
      const fromDateString = (fromDate as any)?.toISOString().split("T")[0];
      const toDateString = (toDate as any)?.toISOString().split("T")[0];
      const filteredWithDate = filtered.filter((record) => {
        const recordDate = (record.dateTime as any).split("T")[0];
        return recordDate >= fromDateString && recordDate <= toDateString;
      });
      if (filtered.length !== 0) {
        if (fromDate && toDate !== null) {
          setCurrentPage(1);
          setCurrentPageVideo(1);
          setFilteredRecords(filteredWithDate);
          setfilteredDataIsAvaialable(true);
        } else {
          setCurrentPage(1);
          setCurrentPageVideo(1);
          setfilteredDataIsAvaialable(true);
          setFilteredRecords(filtered);
        }
      } else {
        // toast("no records found");
        setfilteredDataIsAvaialable(false);
        const filtered = sortedRecords.filter(
          (record) => record.Vehicle === selectedVehicleId?.value
        );
        setFilteredRecords(filtered);
        setCurrentPage(1);
        setCurrentPageVideo(1);
      }
    }
  };

  const handleDateChange = (
    type: string,
    date: MaterialUiPickersDate | null
  ) => {
    if (date !== null) {
      const dateValue = moment(date).toDate();
      if (type === "from") {
        setFromDate(dateValue);
      } else if (type === "to") {
        setToDate(dateValue);
      }
    }
  };
  const handleSearch = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!fromDate) {
      toast.error("Please select From Date")
      return
    }

    if (!toDate) {
      toast.error("Please select To Date")
      return
    }

    let filtered: any = mediarawData;
    const fromDateString = (fromDate as any).toISOString().split("T")[0];
    const toDateString = (toDate as any).toISOString().split("T")[0];
    if (selectedVehiclelist?.value) {
      filtered = filtered.filter(
        (record) => {
          const recordDate = (record.dateTime as any).split("T")[0];
          return recordDate >= fromDateString && recordDate <= toDateString && record.Vehicle === selectedVehiclelist?.value
        }
      );
    } else {
      filtered = mediarawData.filter((record) => {
        const recordDate = (record.dateTime as any).split("T")[0];
        return recordDate >= fromDateString && recordDate <= toDateString;
      });
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
    if (filtered.length === 0) {
      setfilteredDataIsAvaialable(false);
    }

  };
  const handleClear = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (selectedVehiclelist === "" || selectedVehiclelist === null) {
      setFilteredRecords(mediarawData);
    } else {
      const filtered = mediarawData.filter(
        (record) => record.Vehicle === selectedVehiclelist?.value
      );
      setFilteredRecords(filtered);
    }
    setFromDate(null);
    setToDate(null);
  };


  const recordsPerPage = 8;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const fileType1Records = filteredRecords.filter(
    (record) => record.fileType === 1
  );

  const records = fileType1Records.slice(firstIndex, lastIndex);
  const totalCount: any = Math.ceil(fileType1Records.length / recordsPerPage);

  // records for video Pagination
  const recordsPerPageVideo = 8;
  const lastIndexVideo = currentPageVideo * recordsPerPageVideo;
  const firstIndexVideo = lastIndexVideo - recordsPerPageVideo;
  const fileType2Records = filteredRecords.filter(
    (record) => record.fileType === 2
  );
  const recordsVideo = fileType2Records.slice(firstIndexVideo, lastIndexVideo);
  const totalCountVideo: any = Math.ceil(
    fileType2Records.length / recordsPerPageVideo
  );

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };


  const currenTDates = new Date();

  const handleChangeVideo = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {

    setCurrentPageVideo(value);
  };


  const handleOpen = (item: any) => {
    setOpen(!open);
    setSingleImage(item.path);
  };

  const handleDownload = (item: any) => {
    window.location.href = item.path;
  };



  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehiclebyClientid({
            token: session?.accessToken,
            clientId: session?.clientId,
          });
          setVehicleList(Data.data);
        }
      } catch (error) {

      }
    };
    vehicleListData();
  }, []);

  useEffect(() => {


    const timer = setTimeout(() => {
      fetchVideoListData();
    }, 2000); // Delay of 2 seconds

    // Cleanup timeout if effect is cleaned up
    return () => clearTimeout(timer);
  }, [progressHundred]);

  // const handleCustom = () => {
  //   setCustomDate(true);
  // };
  // const handleWeekend = () => {
  //   setCustomDate(false);
  // };
  // const handleClickCustom = () => {
  //   setCustomDateField(!CustomDateField);
  // };

  const options2 =
    vehicleList?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];

  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     setLoading(false);
  //   }, 1000);
  //   return () => clearTimeout(timeoutId);
  // }, [recordsVideo, records]);

  const handleMediaType = (event: { target: { value: any } }) => {
    setCurrentPage(1);
    setCurrentPageVideo(1);
    setMediaType(event.target.value);
  };

  // const onlyImage = records.map((item: any) => {
  //   if (item.fileType == 1) {
  //     return item;
  //   }
  // });


  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const getImageStyles = () => {
    if (isFullScreen) {
      return {
        width: '100%',
        height: '90%',
        objectFit: 'contain',
      };
    }

    // Adjust styles based on screen width
    if (typeof window !== 'undefined' && windowWidth < 640) {
      // For small screens
      return {
        width: '100%',
        height: 'auto',
        //  objectFit: 'contain',
      };
    } else if (typeof window !== 'undefined' && windowWidth < 1024) {
      // For medium screens
      return {
        width: '100%',
        height: '490px',
        //  objectFit: 'contain',
      };
    } else {
      // For large screens
      return {
        width: '1100px',
        height: '490px',
        //   objectFit: 'contain',
      };
    }
  };

  return (
    <div>
      <hr className="text-white"></hr>
      <p className="bg-green px-4 py-1 text-white mb-5 font-bold text-center">
        Camera Management
      </p>

      <List
        component="nav"
        className="nav nav-tabs  nav nav-pills bg-nav-pills "
      >
        <ListItem
          button
          onClick={() => handleClick("Request")}
          selected={activeTab1 === "Request"}
          style={{
            color: "white",
            border: "1px solid green",
            background: "#00b56c",
            marginBottom: "1px",
          }}
        >
          <ListItemText
            primary="Request Media"
            style={{ fontWeight: "900" }}
          />
          {activeTab1 === "Request" ? (
            <ExpandLessIcon style={{ width: "24px", height: "24px" }} />
          ) : (
            <ExpandMoreIcon style={{ width: "24px", height: "24px" }} />
          )}
        </ListItem>
        <Collapse style={{ overflow: "hidden" }} in={activeTab1 === "Request"} timeout="auto">
          <div >
            <Request
              socketdata={socketdata}
            // deviceCommandText={deviceCommandText}
            />
          </div>
          <br></br>
        </Collapse>

        <ListItem
          button
          onClick={() => handleClick("View")}
          selected={activeTab1 === "View"}
          style={{
            color: "white",
            border: "1px solid green",
            background: "#00b56c",
          }}
        >
          <ListItemText primary="View Media" style={{ fontWeight: "900" }} />
          {activeTab1 === "View" ? (
            <ExpandLessIcon style={{ width: "24px", height: "24px" }} />
          ) : (
            <ExpandMoreIcon style={{ width: "24px", height: "24px" }} />
          )}
        </ListItem>

        <Collapse in={activeTab1 === "View"} timeout="auto">
          <div className="tab-pane" id="">
            <div>
              <div className="grid lg:grid-cols-3  mt-5  ">
                <div
                  className="col-span-1 gap-2 "
                  style={{ marginRight: "50px", marginLeft: "20px" }}
                >
                  <Select
                    onChange={handleVehicleChange}
                    options={options2}
                    placeholder="Pick Vehicle"
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "No options available"}
                    className="rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
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
        ? "#E1F0E3"
        : "transparent",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: "#E1F0E3",
        color: "black",
      },
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: options2.length > 3 ? "130px" : "auto",
      overflowY: options2.length > 3 ? "scroll" : "visible",
      scrollbarWidth: "thin", 
      scrollbarColor: "#ccc transparent", 
    }),
  }}
  theme={(theme) => ({
    ...theme,
    borderRadius: 4,
    colors: {
      ...theme.colors,
      primary25: "#E1F0E3",
      primary: "#00B56C",
    },
  })}
                  />
                </div>
                <div className="col-span-2">
                  <form>
                    {/* Container for large screens (from 1024px upwards) */}
                    <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 px-4 md:px-6 lg:px-10 items-center">
                      <div className="lg:col-span-3 flex flex-col">
                        <label className="text-green mb-1">From</label>
                        <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                          <DatePicker
                            format="MM/dd/yyyy"
                            value={fromDate}
                            onChange={(date) => handleDateChange("from", date)}
                            variant="inline"
                            maxDate={currenTDates}
                            placeholder="Start Date"
                            autoOk
                            style={{ width: "100%" }}
                            inputProps={{ readOnly: true }}
                            InputProps={{
                              endAdornment: (
                                <EventIcon style={{ width: 20, height: 20 }} />
                              ),
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </div>
                      <div className="lg:col-span-3 flex flex-col">
                        <label className="text-green mb-1">To</label>
                        <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                          <DatePicker
                            format="MM/dd/yyyy"
                            value={toDate}
                            onChange={(date) => handleDateChange("to", date)}
                            variant="inline"
                            placeholder="End Date"
                            maxDate={currenTDates}
                            autoOk
                            inputProps={{ readOnly: true }}
                            InputProps={{
                              endAdornment: (
                                <EventIcon style={{ width: 20, height: 20 }} />
                              ),
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </div>
                      <div className="lg:col-span-2 flex items-center justify-center">
                        <button
                          style={{ background: "none" }}
                          className="text-green text-2xl"
                          onClick={(e) => handleClear(e)}
                        >
                          x
                        </button>
                      </div>
                      <div className="lg:col-span-2 flex items-center justify-center">
                        <button
                          className="bg-green py-2 text-white flex items-center justify-center font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none px-4 rounded-lg"
                          onClick={(e) => handleSearch(e)}
                          style={{ fontWeight: "bold" }}
                        >
                          <svg
                            className="h-5 w-5 text-white mr-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinejoin="round"
                          >
                            <circle cx="10" cy="10" r="7"></circle>
                            <line x1="21" y1="21" x2="15" y2="15"></line>
                          </svg>
                          <span>Search</span>
                        </button>
                      </div>
                    </div>

                    {/* Container for smaller screens (up to 770px) */}
                    <div className="lg:hidden flex flex-col gap-4 px-4 md:px-6 lg:px-10">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col flex-grow mb-2">
                          <label className="text-green mb-1">From</label>
                          <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                            <DatePicker
                              format="MM/dd/yyyy"
                              value={fromDate}
                              onChange={(date) => handleDateChange("from", date)}
                              variant="inline"
                              maxDate={currenTDates}
                              placeholder="Start Date"
                              autoOk
                              style={{ width: "100%" }}
                              inputProps={{ readOnly: true }}
                              InputProps={{
                                endAdornment: (
                                  <EventIcon style={{ width: 20, height: 20 }} />
                                ),
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </div>

                        <div className="flex flex-col flex-grow mb-2">
                          <label className="text-green mb-1">To</label>
                          <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                            <DatePicker
                              format="MM/dd/yyyy"
                              value={toDate}
                              onChange={(date) => handleDateChange("to", date)}
                              variant="inline"
                              placeholder="End Date"
                              maxDate={currenTDates}
                              autoOk
                              inputProps={{ readOnly: true }}
                              InputProps={{
                                endAdornment: (
                                  <EventIcon style={{ width: 20, height: 20 }} />
                                ),
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </div>

                        <div className="flex">
                          <button
                            style={{ background: "none" }}
                            className="text-green text-2xl"
                            onClick={(e) => handleClear(e)}
                          >
                            x
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <button
                          className="bg-green py-2 text-white flex items-center justify-center font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none px-4 rounded-lg"
                          onClick={(e) => handleSearch(e)}
                          style={{ fontWeight: "bold", margin: "auto" }}
                        >
                          <svg
                            className="h-5 w-5 text-white mr-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinejoin="round"
                          >
                            <circle cx="10" cy="10" r="7"></circle>
                            <line x1="21" y1="21" x2="15" y2="15"></line>
                          </svg>
                          <span>Search</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>



              </div>

              <div className=" lg:flex lg:items-center lg:justify-center lg:mt-4 lg:w-full" style={{ margin: "auto", marginTop: "20px" }}>
                <div className="flex items-center justify-center gap-4">
                  <label className="text-sm flex items-center">
                    <input
                      type="radio"
                      className="w-4 h-4 mr-2 form-radio text-green"
                      name="mediaType"
                      value="images"
                      checked={mediaType === "images"}
                      onChange={handleMediaType}
                      style={{ accentColor: "green" }}
                    />
                    Images
                  </label>
                  <label className="text-sm flex items-center">
                    <input
                      type="radio"
                      className="w-4 h-4 mr-2 form-radio text-green"
                      name="mediaType"
                      value="videos"
                      checked={mediaType === "videos"}
                      onChange={handleMediaType}
                      style={{ accentColor: "green" }}
                    />
                    Videos
                  </label>
                </div>
              </div>





              {/*  */}
              <div
                className="grid lg:grid-cols-5  sm:grid-cols-5 md:grid-cols-5 grid-cols-1  mt-5 "
                style={{
                  display: "block",
                  justifyContent: "center",
                }}
              >
                <div className="lg:col-span-4  md:col-span-4  sm:col-span-5 col-span-4  ">
                  {loading ? (
                    <div className="camera_loading">
                      <Image src={logo} alt="" className="loading_all_page" />
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="inline fixed top-20 right-0 bottom-0 left-0 m-auto lg:w-12 lg:h-12 md:w-12 md:h-12 sm:w-12 sm:h-12 w-10 h-10  text-green animate-spin dark:text-green fill-black"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only text-3xl">Loading...</span>
                      </div>
                    </div>

                    // <Loading />
                  ) : (
                    <div className="grid grid-cols-1  gap-5 ">
                      {mediaType === "images" && (
                        <div className="col-span-1 shadow-lg w-full ">
                          <div className="bg-green shadow-lg sticky top-0">
                            <h1
                              className="text-center text-xl text-white font-serif pb-2 pt-2"
                              style={{ fontWeight: "900" }}
                            >
                              Images
                            </h1>
                          </div>

                          <TableContainer component={Paper}>
                            <div>
                              <Table
                                sx={{ minWidth: 650 }}
                                aria-label="simple table"
                              >
                                <TableHead className="sticky top-0   font-bold">
                                  <TableRow className=" text-white font-bold   ">
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      S.No
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Vehicle Reg
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Requested DateTime
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Camera Type
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green text-center font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                {filteredDataIsAvaialable === false ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      <p
                                        className="mt-10 font-bold"
                                        style={{ fontSize: "24px" }}
                                      >
                                        No data found
                                      </p>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  <TableBody>
                                    {
                                      socket.filter((i: any) => {
                                        return i.filetype === ".jpeg" && Math.floor(i.progress) != 0
                                      })
                                        .map((i: any, index: number) => {
                                          return (<
                                            TableRow>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {index + 1}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {i.vehicle}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {backFromUnix(
                                                i.timestamp,
                                                session?.timezone
                                              )}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {i.camera_type ===
                                                "%photof"
                                                ? "Front"
                                                : i.camera_type ===
                                                  "%photor"
                                                  ? "Back"
                                                  : " "}
                                            </TableCell>
                                            <TableCell
                                              colSpan={1}
                                              align="center"
                                            >
                                              <ProgressBar
                                                progress={Math.floor(i.progress)}
                                              />
                                            </TableCell>
                                          </TableRow>)
                                        })
                                    }
                                    {records.map((item, index) => {
                                      if (item.fileType === 1) {
                                        const currentPage1 = currentPage;
                                        const itemIndex = index % 8;
                                        const currentItemNumber =
                                          (currentPage1 - 1) * 8 +
                                          itemIndex +
                                          1 + socket?.length;
                                        const filenametodate = parseInt(
                                          item.fileName.split(".")[0],
                                          10
                                        );

                                        const timingZone = session?.timezone;
                                        const timerequested = backFromUnix(
                                          filenametodate,
                                          timingZone
                                        );

                                        return (
                                          <TableRow
                                            key={index}
                                            className="cursor-pointer hover:bg-[#e2f6f0]"
                                          >
                                            <TableCell
                                              align="center"
                                              className="border-r border-green font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {currentItemNumber}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "2px 4px",
                                              }}
                                            >
                                              {item.Vehicle}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {/* {timerequested} */}
                                              {item.date}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "2px 4px",
                                              }}
                                            >
                                              {item.mediatype}
                                              {/* {(item.cameraType ||
                                                item.cameraType) === "%photof"
                                                ? "Front"
                                                : (item.cameraType ||
                                                  item.cameraType) ===
                                                  "%photor"
                                                  ? "Back"
                                                  : " "} */}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green font-popins text-black font-normal"
                                              style={{ padding: "4px 8px" }}
                                            >
                                              <div
                                                style={{ padding: "0 20px" }}
                                              >
                                                <button
                                                  onClick={() => {
                                                    handleOpen1(item);
                                                  }}
                                                  className="text-white bg-green py-2 px-2"
                                                >
                                                  <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6"
                                                  >
                                                    <circle
                                                      cx="12"
                                                      cy="12"
                                                      r="3.5"
                                                      stroke="#FFFFFF"
                                                    ></circle>
                                                    <path
                                                      d="M20.188 10.9343C20.5762 11.4056 20.7703 11.6412 20.7703 12C20.7703 12.3588 20.5762 12.5944 20.188 13.0657C18.7679 14.7899 15.6357 18 12 18C8.36427 18 5.23206 14.7899 3.81197 13.0657C3.42381 12.5944 3.22973 12.3588 3.22973 12C3.22973 11.6412 3.42381 11.4056 3.81197 10.9343C5.23206 9.21014 8.36427 6 12 6C15.6357 6 18.7679 9.21014 20.188 10.9343Z"
                                                      stroke="#FFFFFF"
                                                    ></path>
                                                  </svg>
                                                </button>{" "}
                                                <button
                                                  onClick={() => {
                                                    handleDownload(item);
                                                  }}
                                                  className="text-white bg-green py-2 px-2"
                                                >
                                                  <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6"
                                                  >
                                                    <path
                                                      d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z"
                                                      fill="#FFFFFF"
                                                    ></path>
                                                    <path
                                                      d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                                                      fill="#FFFFFF"
                                                    ></path>
                                                  </svg>
                                                </button>
                                              </div>
                                              <Modal
                                                open={open1}
                                                onClose={handleClose}
                                                BackdropComponent={Backdrop}
                                                BackdropProps={{
                                                  timeout: 500,
                                                  style: {
                                                    backgroundColor:
                                                      "transparent",
                                                    filter: "blur(19px)",
                                                  },
                                                }}
                                              >
                                                <Fade in={open1}>
                                                  <Box sx={modalStyles}>
                                                    <a
                                                      onClick={handleClose}
                                                      style={{
                                                        position: "absolute",
                                                        top: -10,
                                                        right: -10,
                                                        fontWeight: "bold",
                                                        fontSize: "16px",
                                                        width: "30px",
                                                        height: "30px",
                                                        backgroundColor:
                                                          "red",
                                                        color: "white",
                                                        cursor: "pointer",
                                                        padding: "2px",
                                                        borderRadius: "50%",
                                                        textAlign: "center",
                                                      }}
                                                    >
                                                      X
                                                    </a>
                                                    <div
                                                      onClick={
                                                        handleFullScreen
                                                      }
                                                      style={{
                                                        position: "absolute",
                                                        bottom: 10,
                                                        right: 30,
                                                        color: "green",
                                                        width: "30px",
                                                        height: "30px",
                                                        borderRadius: "50%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                        cursor: "pointer",
                                                        backgroundColor:
                                                          "white",
                                                        transition:
                                                          "color 0.3s, background-color 0.3s",
                                                      }}
                                                      className="fullscreen-button"
                                                    >
                                                      <FullscreenIcon />
                                                    </div>
                                                    <style jsx>{`
                                                        .fullscreen-button:hover {
                                                          color: white !important;
                                                          background-color: black !important;
                                                        }
                                                      `}</style>
                                                    <img
                                                      src={singleImage}
                                                      alt="Modal Content"
                                                      style={getImageStyles()}
                                                    />
                                                  </Box>
                                                </Fade>
                                              </Modal>
                                              {isFullScreen && (
                                                <div
                                                  style={{
                                                    position: "fixed",
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    zIndex: 9999,
                                                    backgroundColor: "black",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                  }}
                                                  onClick={
                                                    handleExitFullScreen
                                                  }
                                                >
                                                  <img
                                                    src={singleImage}
                                                    alt="Modal Content"
                                                    style={{
                                                      height: "100%",
                                                      width: "auto",
                                                    }}
                                                  />
                                                  <IconButton
                                                    style={{
                                                      position: "absolute",
                                                      bottom: 20,
                                                      right: 20,
                                                      color: "white",
                                                    }}
                                                    sx={{
                                                      "&:hover": {
                                                        color: "red",
                                                      },
                                                    }}
                                                    onClick={
                                                      handleExitFullScreen
                                                    }
                                                  >
                                                    <FullscreenExitIcon />
                                                  </IconButton>
                                                </div>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      } else {
                                        return null; // Render nothing or handle other cases
                                      }
                                    })}
                                  </TableBody>
                                )}
                              </Table>
                            </div>
                          </TableContainer>

                          <div
                            className="flex  justify-end mt-8"
                          >
                            <div className="grid lg:grid-cols-4 my-4 ">
                              <div className="col-span-1">
                                <p className="mt-1 text-labelColor text-end text-sm">
                                  Total{" "}
                                  {
                                    filteredRecords.filter(
                                      (record) => record.fileType === 1
                                    ).length
                                  }{" "}
                                  items
                                </p>
                              </div>
                              <div className="col-span-2 ">
                                <Stack spacing={2}>
                                  <Pagination
                                    count={totalCount}
                                    page={currentPage}
                                    onChange={handleChange}
                                    className="text-sm"
                                  />
                                </Stack>
                              </div>
                              <div className="col-lg-1 mt-1">
                                <span className="text-sm">Go To</span>
                                <input
                                  type="text"

                                  className="w-14 border border-grayLight outline-green mx-2 px-2"
                                  onChange={(e) => {
                                    let inputValues: any = e.target.value.match(/\d+/g);
                                    if (inputValues > 0 && inputValue < totalCount) {
                                      setCurrentPage(e.target.value)
                                    }
                                  }}
                                />
                                <span
                                  className="text-labelColor text-sm"

                                >
                                  page &nbsp;&nbsp;
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <Dialog
                        open={open}
                        handler={handleOpen}
                        className="w-3/6 ms-auto mr-auto bg-bgLight"
                        placeholder=""
                      >
                        <Image
                          src={singleImage}
                          width="1000"
                          height="100"
                          style={{
                            height: "100vh",
                            transform: "rotate(180deg)",
                          }}
                          alt="Image"
                        />
                      </Dialog>
                      {mediaType === "videos" && (
                        <div className="col-span-1 shadow-lg w-full">
                          <div className="bg-green shadow-lg sticky top-0">
                            <h1
                              className="text-center text-xl text-white font-serif pb-2 pt-2"
                              style={{ fontWeight: "900" }}
                            >
                              Videos
                            </h1>
                          </div>

                          {/* videowork */}
                          <TableContainer component={Paper}>
                            <div>
                              <Table
                                sx={{ minWidth: 650 }}
                                aria-label="simple table"
                              >
                                <TableHead className="sticky top-0   font-bold">
                                  <TableRow className=" text-white font-bold   ">
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      S.No
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Vehicle Reg
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Requested DateTime
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green  font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Camera Type
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green text-center font-popins font-bold "
                                      style={{ fontSize: "20px" }}
                                    >
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                {filteredDataIsAvaialable === false ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      <p
                                        className="mt-10 font-bold"
                                        style={{ fontSize: "24px" }}
                                      >
                                        No data found
                                      </p>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  <TableBody>
                                    {
                                      socket.filter((i: any) => {
                                        return i.filetype === ".h265" && Math.floor(i.progress) != 0
                                      })
                                        .map((i: any, index: number) => {
                                          return (<
                                            TableRow>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {index + 1}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {i.vehicle}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {backFromUnix(
                                                i.timestamp,
                                                session?.timezone
                                              )}
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              className="border-r border-green  font-popins text-black font-normal"
                                              style={{
                                                fontSize: "16px",
                                                padding: "4px 8px",
                                              }}
                                            >
                                              {i.camera_type ===
                                                "%videof"
                                                ? "Front"
                                                : i.camera_type ===
                                                  "%videor"
                                                  ? "Back"
                                                  : " "}
                                            </TableCell>
                                            <TableCell
                                              colSpan={1}
                                              align="center"
                                            >
                                              <ProgressBar
                                                progress={Math.floor(i.progress)}
                                              />
                                            </TableCell>
                                          </TableRow>)
                                        })
                                    }

                                    {recordsVideo.map(
                                      (
                                        item: pictureVideoDataOfVehicleT,
                                        index
                                      ) => {
                                        if (item.fileType === 2) {
                                          const filenametodate = parseInt(
                                            item.fileName.split(".")[0],
                                            10
                                          );
                                          const timingZone = session?.timezone;
                                          const timerequested = backFromUnix(
                                            filenametodate,
                                            timingZone
                                          );
                                          const currentPage =
                                            currentPageVideo;
                                          const itemIndex = index % 8;
                                          const currentItemNumber =
                                            (currentPage - 1) * 8 +
                                            itemIndex +
                                            1 + socket?.length;
                                          return (
                                            <TableRow
                                              key={index}
                                              className="cursor-pointer hover:bg-[#e2f6f0]"
                                            >
                                              <TableCell
                                                align="center"
                                                className="border-r border-green  font-popins text-black font-normal"
                                                style={{
                                                  fontSize: "16px",
                                                  padding: "4px 8px",
                                                }}
                                              >
                                                {currentItemNumber}
                                              </TableCell>
                                              <TableCell
                                                align="center"
                                                className="border-r border-green  font-popins text-black font-normal"
                                                style={{
                                                  fontSize: "16px",
                                                  padding: "4px 8px",
                                                }}
                                              >
                                                {item.Vehicle}
                                              </TableCell>
                                              <TableCell
                                                align="center"
                                                className="border-r border-green  font-popins text-black font-normal"
                                                style={{
                                                  fontSize: "16px",
                                                  padding: "4px 8px",
                                                }}
                                              >

                                                {/* {timerequested} */}
                                                {item.date}
                                              </TableCell>
                                              <TableCell
                                                align="center"
                                                className="border-r border-green  font-popins text-black font-normal"
                                                style={{
                                                  fontSize: "16px",
                                                  padding: "4px 8px",
                                                }}
                                              >
                                                {item.mediatype}

                                              </TableCell>
                                              <TableCell
                                                align="center" // Set align to center
                                                className="border-r border-green font-popins text-black font-normal"
                                                style={{ padding: "4px 8px" }}
                                              >
                                                <div
                                                  style={{
                                                    padding: "0 20px",
                                                  }}
                                                >
                                                  {/* {item.status === "pending" ?

 <Box mt={2}  >
   <ProgressBar progress={progress} />
 </Box>: */}

                                                  <span>
                                                    <button
                                                      onClick={() =>
                                                        handleOpenSecond1(
                                                          item
                                                        )
                                                      }
                                                      className="text-white bg-green py-2 px-2 "
                                                    >
                                                      <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-6 h-6  "
                                                      >
                                                        <g
                                                          id="SVGRepo_bgCarrier"
                                                          strokeWidth="0"
                                                        ></g>
                                                        <g
                                                          id="SVGRepo_tracerCarrier"
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                        ></g>
                                                        <g id="SVGRepo_iconCarrier">
                                                          <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3.5"
                                                            stroke="#FFFFFF"
                                                          ></circle>
                                                          <path
                                                            d="M20.188 10.9343C20.5762 11.4056 20.7703 11.6412 20.7703 12C20.7703 12.3588 20.5762 12.5944 20.188 13.0657C18.7679 14.7899 15.6357 18 12 18C8.36427 18 5.23206 14.7899 3.81197 13.0657C3.42381 12.5944 3.22973 12.3588 3.22973 12C3.22973 11.6412 3.42381 11.4056 3.81197 10.9343C5.23206 9.21014 8.36427 6 12 6C15.6357 6 18.7679 9.21014 20.188 10.9343Z"
                                                            stroke="#FFFFFF"
                                                          ></path>
                                                        </g>
                                                      </svg>
                                                    </button>{" "}
                                                    <Modal
                                                      open={openvideo}
                                                      onClose={
                                                        handleClosevideo
                                                      }
                                                      BackdropComponent={
                                                        Backdrop
                                                      }
                                                      BackdropProps={{
                                                        timeout: 500,
                                                        style: {
                                                          backgroundColor:
                                                            "transparent",
                                                        },
                                                      }}
                                                    >
                                                      <Fade in={openvideo}>
                                                        <Box sx={modalStyles}>
                                                          <a
                                                            onClick={
                                                              handleClosevideo
                                                            }
                                                            style={{
                                                              position:
                                                                "absolute",
                                                              top: -10,
                                                              right: -10,
                                                              fontWeight:
                                                                "bold",
                                                              fontSize:
                                                                "16px",
                                                              width: "30px",
                                                              height: "30px",
                                                              backgroundColor:
                                                                "red",
                                                              color: "white",
                                                              cursor:
                                                                "pointer",
                                                              padding: "2px",
                                                              borderRadius:
                                                                "50%",
                                                              textAlign:
                                                                "center",
                                                              zIndex: "2000",
                                                            }}
                                                          >
                                                            X
                                                          </a>

                                                          <div
                                                            className={`video-container ${isFullScreen
                                                              ? "fullscreen"
                                                              : ""
                                                              }`}
                                                          >
                                                            <video
                                                              controls
                                                              autoPlay
                                                              style={{
                                                                height:
                                                                  isFullScreen
                                                                    ? "100%"
                                                                    : "400px",
                                                                width:
                                                                  isFullScreen
                                                                    ? "100%"
                                                                    : "100%",
                                                              }}
                                                              className="video-element"
                                                              controlsList="noplaybackrate nodownload "
                                                            // disablePictureInPicture
                                                            >
                                                              <source
                                                                src={
                                                                  singleVideo
                                                                }
                                                                type="video/mp4"
                                                              />
                                                            </video>
                                                          </div>
                                                        </Box>
                                                      </Fade>
                                                    </Modal>
                                                    <button
                                                      onClick={() =>
                                                        handleDownload(item)
                                                      }
                                                      className="text-white bg-green py-2 px-2 "
                                                    >
                                                      <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-6 h-6 "
                                                      >
                                                        <g
                                                          id="SVGRepo_bgCarrier"
                                                          strokeWidth="0"
                                                        ></g>
                                                        <g
                                                          id="SVGRepo_tracerCarrier"
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                        ></g>
                                                        <g id="SVGRepo_iconCarrier">
                                                          <path
                                                            d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z"
                                                            fill="#FFFFFF"
                                                          ></path>
                                                          <path
                                                            d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                                                            fill="#FFFFFF"
                                                          ></path>
                                                        </g>
                                                      </svg>
                                                    </button>
                                                  </span>
                                                  {/* }   */}
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        }
                                      }
                                    )}
                                  </TableBody>
                                )}
                              </Table>
                            </div>
                          </TableContainer>
                          <div className="flex  justify-end mt-8 ">
                            <div className="grid lg:grid-cols-4 my-4">
                              <div className="col-span-1">
                                <p className="mt-1 text-labelColor text-end text-sm">
                                  Total{" "}
                                  {
                                    filteredRecords.filter(
                                      (record) => record.fileType === 2
                                    ).length
                                  }{" "}
                                  items
                                </p>
                              </div>

                              <div className="col-span-2">
                                <Stack spacing={2}>
                                  <Pagination
                                    count={totalCountVideo}

                                    page={currentPageVideo}
                                    onChange={handleChangeVideo}
                                    className="text-sm"
                                  />
                                </Stack>
                              </div>
                              <div className="col-lg-1 mt-1">
                                <span className="text-sm">Go To</span>
                                <input
                                  type="text"

                                  className="w-14 border border-grayLight outline-green mx-2 px-2"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    let inputVideoValue = e.target.value.match(/\d+/g)
                                    if (inputVideoValue > 0 && inputVideoValue < totalCount) {
                                      // setInput(parseInt(e.target.value))
                                      setCurrentPageVideo(parseInt(e.target.value))
                                    }
                                    else {
                                      setInputValue("")
                                    }
                                  }}
                                />
                                <span
                                  className="text-labelColor text-sm"

                                >
                                  page &nbsp;&nbsp;
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Collapse>
      </List>
      <br></br>
      <br></br>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

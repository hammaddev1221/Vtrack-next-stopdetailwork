"use client";
import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  portalGprsCommand,
  vehiclebyClientid,
  getVehicleDataByClientIdByVehicleReg,
  getCamDataByClientIdByVehicleReg,
  getDeviceResponse
  // getGprsCommandLatest,
} from "@/utils/API_CALLS";
// import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Select from "react-select";
import moment from "moment-timezone";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
import "./newstyle.css";
import { dateTimeToTimestamp } from "@/utils/unixTimestamp";
// import { List, ListItem, ListItemText, Collapse, RadioGroup, Radio } from '@material-ui/core';
import { socket } from "@/utils/socket";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { io } from "socket.io-client";
import { VehicleData } from "@/types/vehicle";

export default function Request({ socketdata }: any) {
  const { data: session } = useSession();
  const [disabledcameraButton, setdisabledcameraButton] = useState(true);
  const [disabledrequestButton, setdisabledrequestButton] = useState(true);
  const [disabledtoasterror, setdisabledtoasterror] = useState(false);
  const [disablefront, setdisablefront] = useState(false);
  const [disableback, setdisableback] = useState(false);
  const [disablevideo, setdisablevideo] = useState(false);
  const [disableimage, setdisableimage] = useState(false);
  const [foundVehicle, setFoundVehicle] = useState({})
  const [selectedCameraType, setSelectedCameraType] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [showDurationTab, setshowDurationTab] = useState(false);
  const [toastId, setToastId] = useState<any>(null);
  const [CameraResponseToastId, setCameraResponseToastId] = useState<any>(null);
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeviceAttach | null>(
    null
  );
  const selectedVehicleRef = useRef(selectedVehicle);
  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);
  const cameraOnRef = useRef(CameraResponseToastId);
  useEffect(() => {
    cameraOnRef.current = CameraResponseToastId;
  }, [CameraResponseToastId]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(moment().tz(session.timezone).format('HH:mm:ss'))
  const [cameraHidediv, setcameraHidediv] = useState(true);
  const [selectedduration, setSelectedDuration] = useState("");
  const [deviceresponse, setdeviceresponse] = useState(null);
  const carData = useRef<VehicleData[]>([]);
  const [seconds, setSeconds] = useState<number>(0);
  // const [secondsduration, setSecondsduration] = useState<number>();
  const [isActive, setIsActive] = useState<boolean>(false);
  // const [durationInSecond, setDurationInSeconds] = useState(0);
  // const timeZone = session?.timezone;
  const [isFlipped, setIsFlipped] = useState(false); // State for flip animation
  const [requestSubmitTime, setRequestSubmitTime] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (disabledcameraButton && selectedVehicle && CameraResponseToastId) {
      // Dismiss the loading toast
      toast.dismiss(CameraResponseToastId);
      setCameraResponseToastId(null);
      
      // Show success toast
      toast.success("Camera is on, Now you can make a request", {
        position: "top-center",
      });
    }
    if (!disabledcameraButton && selectedVehicle) {
      toast.error("Camera is Off", {
        position: "top-center",
      });
    }
  }, [disabledcameraButton]);

  // Poll device response every 10 seconds after request is submitted
  useEffect(() => {
    if (requestSubmitTime && selectedVehicle && session?.clientId) {
      // Clear any existing interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      const interval = setInterval(async () => {
        try {
          const response = await getDeviceResponse({
            token: session?.accessToken,
            query: {
              clientId: session?.clientId,
              vehicleReg: selectedVehicle?.vehicleReg
            }
          });

          if (response && response.dateSubmitted) {
            const responseDate = new Date(response.dateSubmitted);
            const submitDate = new Date(requestSubmitTime);

            // Check if response date is greater than request submit time
            if (responseDate.getTime() - submitDate.getTime() >= 3000) {
              // Show toast with the content
              if (response.content.toLowerCase().includes("error")) {
                toast.error(response.content, {
                  position: "top-center",
                  duration: 5000
                });
                toast.dismiss(toastId)
                setToastId(null)
              } else {

                toast.success(response.content, {
                  position: "top-center",
                  duration: 5000
                });
                toast.dismiss(toastId)
                setToastId(null)
              }
              clearInterval(interval);
              setPollingInterval(null);
              setRequestSubmitTime(null);
            }
          }
        } catch (error) {
          console.error("Error fetching device response:", error);
        }
      }, 10000); // Poll every 10 seconds

      setPollingInterval(interval);

      // Cleanup on unmount or when dependencies change
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [requestSubmitTime, selectedVehicle, session?.clientId]);

  // const handlevideodate = (date: MaterialUiPickersDate | null) => {
  //   if (date !== null) {
  //     const dateValue = moment(date).format("YYYY-MM-DD");
  //     setSelectedDate(dateValue);
  //   }
  // };

  /*  const handlevideodate = (date: any | null) => {
    if (date !== null) {
      const dateValue = moment(date).format("YYYY-MM-DD");
      setSelectedDate(dateValue);
    }
  }; */
  const handlevideodate = (e) => {
    const selectedDate = e.target.value;
    const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

    if (selectedDate > currentDate) {
      toast.error("Selected date cannot be in the future");
      return;
    }

    setSelectedDate(selectedDate);

    // Clear time if the selected date is now in the past
    /* if (selectedTime && selectedDate) {
      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const currentDateTime = new Date();
  
      if (selectedDateTime > currentDateTime) {
        setSelectedTime("");
      }
    } */
  };

  // const currenTDates = new Date();

  useEffect(() => {
    const endTime = localStorage.getItem('endTime');
    if (endTime) {
      setcameraHidediv(false);
    } else {
      setcameraHidediv(true);
    }
  }, []);

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
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, []);

  // const sentSmsForCameraApi = async () => {
  //   try {
  //     const Data = await sentSmsForCamera({
  //       token: session?.accessToken,
  //       vehicleId: selectedVehicle?._id,
  //       clientId: session?.clientId,
  //     });
  //     toast.success("Vehicle data successfully fetched!");
  //   } catch (error) {
  //     console.error("Error fetching zone data:", error);
  //   }
  // };
  useEffect(() => {
    if (deviceresponse) {
      if (CameraResponseToastId) {
        toast.dismiss(CameraResponseToastId);
        if (deviceresponse?.toLowerCase()?.includes("error")) {
          toast.error(deviceresponse, {
            id: CameraResponseToastId,
            duration: 5000
          });
        } else {
          toast.success(deviceresponse, {
            id: CameraResponseToastId,
            duration: 5000
          });
        }
        setCameraResponseToastId(null);
      }
      else if (toastId) {
        toast.dismiss(toastId);
        console.log(deviceresponse)
        console.log(deviceresponse?.toLowerCase(), deviceresponse?.toLowerCase()?.includes("error"))
        if (deviceresponse?.toLowerCase()?.includes("error")) {
          toast.error(deviceresponse, {
            id: toastId,
            duration: 60000
          });
        } else {
          toast.loading(deviceresponse, {
            id: toastId,
            duration: 60000
          });
        }
        setToastId(null);
      }
      else {
        console.log(deviceresponse)
        console.log(deviceresponse?.toLowerCase(), deviceresponse?.toLowerCase()?.includes("error"))
        if (deviceresponse?.toLowerCase()?.includes("error")) {
          const id = toast.error(deviceresponse, {
            duration: 5000
          });
          setToastId(id);
        } else {
          const id = toast.loading(deviceresponse, {
            duration: 5000
          });
          setToastId(id);
        }
      }
      setdeviceresponse(null);
      setdisableback(false);
      setdisablefront(false);
      setdisableimage(false);
      setdisablevideo(false);
      setSelectedDuration("");
      setSelectedTime("");
      setSelectedDate("");
    }
  }, [deviceresponse, toastId, CameraResponseToastId]);
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     if (CameraResponseToastId && !deviceresponse) {
  //       toast.dismiss(CameraResponseToastId);
  //       setCameraResponseToastId(null);
  //       toast.error(
  //         "Camera request timed out. Please try again later.",
  //         { duration: 5000 }
  //       );
  //       setdisableback(false);
  //       setdisablefront(false);
  //       setdisableimage(false);
  //       setdisablevideo(false);

  //     }

  //     // Regular request timeout
  //     if (toastId && !deviceresponse) {

  //       toast.dismiss(toastId);
  //       setToastId(null);
  //       toast.error(
  //         "Request timed out. Please try again later.",
  //         { duration: 5000 }
  //       );
  //       setdisableback(false);
  //       setdisablefront(false);
  //       setdisableimage(false);
  //       setdisablevideo(false);
  //       setSelectedDuration("");
  //       setSelectedTime("");
  //       setSelectedDate("");
  //     }
  //   }, 60000); // 60 second timeout

  //   return () => clearTimeout(timeoutId);
  // }, [CameraResponseToastId, toastId, deviceresponse]);

  useEffect(() => {
    // Connect to the server
    const socket = io("https://socketio.vtracksolutions.com:1102", {
      autoConnect: false,
      query: { clientId: session?.clientId }, // This gets updated later on with client code.
      transports: ["websocket", "polling", "flashsocket"],
    });
    socket.connect();
    // Listen for "message" event from the server
    socket.on("device", async (data) => {

      if (data?.commandtext) {
        if (data.commandtext.toLowerCase().includes("error")) {
          setdeviceresponse(data.commandtext);

        } else
          if (data.commandtext.includes("DOUT1:1 Timeout:120s") || data.commandtext.includes("DOUT1:1 Timeout:500s")) {
            setdeviceresponse("Camera On Successfully, Now you can make a request");
          } else {

            if (data.commandtext.includes("Photo request from source")) {
              setdeviceresponse("Image is Downloading");
            } else if (data.commandtext.includes("Video request from source")) {
              setdeviceresponse("Video is Downloading");
            } else {
              setdeviceresponse(data.commandtext);
            }
          }
      }
    });


    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    (async function () {
      if (
        session?.clientId &&
        selectedVehicle?.vehicleReg &&
        selectedCameraType &&
        selectedFileType
      ) {
        if (selectedVehicle?.vehicleReg) {
          let data = (await getVehicleDataByClientIdByVehicleReg(session?.clientId, selectedVehicle?.vehicleReg)).data
          if (data) {
            const foundVehicle = (await getVehicleDataByClientIdByVehicleReg(session?.clientId, selectedVehicle?.vehicleReg))?.data[0]
            setFoundVehicle(foundVehicle)
            if (foundVehicle?.ignition == 1 || foundVehicle?.camStatus?.value == 1) {
              console.log(disabledcameraButton)
              if (!disabledcameraButton) {
                toast.success("Camera is on, Now you can make a request", {
                  position: "top-center",
                })
              }
              setdisableback(false)
              setdisablefront(false)
              setdisableimage(false)
              setdisablevideo(false)
              setdisabledcameraButton(true);
              setdisabledrequestButton(false);
            } else {
              setdisableback(true)
              setdisablefront(true)
              setdisableimage(true)
              setdisablevideo(true)
              setdisabledcameraButton(false);
              setdisabledrequestButton(true);
            }

          }
        }

      }
    })();
  }, [session, selectedVehicle, selectedCameraType, selectedFileType]);

  useEffect(() => {
    if (session?.clientId) {
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

            carData.current = uniqueData;

            if (carData.current) {
              const foundVehicle = carData.current.find(
                (vehicle: { vehicleReg: string }) =>
                  vehicle.vehicleReg === selectedVehicleRef?.current?.vehicleReg
              );
              setFoundVehicle(foundVehicle)
              if (foundVehicle?.ignition == 1 || foundVehicle?.camStatus?.value == 1) {
                console.log(disabledcameraButton)
                if (!disabledcameraButton) {
                  toast.success("Camera is on, Now you can make a request", {
                    position: "top-center",
                  })
                }
                setdisableback(false)
                setdisablefront(false)
                setdisableimage(false)
                setdisablevideo(false)
                setdisabledcameraButton(true);
                setdisabledrequestButton(false);
              } else {
                setdisableback(true)
                setdisablefront(true)
                setdisableimage(true)
                setdisablevideo(true)
                setdisabledcameraButton(false);
                setdisabledrequestButton(true);
              }
              // if (
              //   foundVehicle?.ignition == 0 &&
              //   foundVehicle?.camStatus?.value == 0
              // ) {
              //   setdisableback(true)
              //   setdisablefront(true)
              //   setdisableimage(true)
              //   setdisablevideo(true)
              //   setdisabledcameraButton(false);
              //   setdisabledrequestButton(true);
              //   if (toastId) {
              //     toast.dismiss(toastId);
              //     setToastId(null);
              //   }
              // } else if(
              //   foundVehicle?.camStatus?.value == 1
              // ){
              //   setdisabledcameraButton(true);
              //   setdisabledrequestButton(false);
              // }
              // if (foundVehicle?.frontCamera?.value == 3 || foundVehicle?.backCamera?.value == 3) {
              //   if (foundVehicle?.frontCamera?.value == 3 && selectedCameraType == "Front") {
              //     setdisabledcameraButton(true);
              //     setdisabledrequestButton(false);
              //     setdisablevideo(false)

              //   }
              //   if (foundVehicle?.backCamera?.value == 3 && selectedCameraType == "Back") {
              //     setdisabledcameraButton(true);
              //     setdisablevideo(false)
              //     setdisabledrequestButton(false);
              //   }

              //   if (foundVehicle?.frontCamera?.value == 0 && selectedCameraType == "Front") {
              //     setdisabledcameraButton(true);

              //     setdisabledrequestButton(true);
              //   }
              //   if (foundVehicle?.backCamera?.value == 0 && selectedCameraType == "Back") {
              //     setdisabledcameraButton(true);
              //     setdisabledrequestButton(true);
              //   }
              //   if (foundVehicle?.frontCamera?.value != 0 && foundVehicle?.frontCamera?.value != 3 && selectedCameraType == "Front") {
              //     setdisabledcameraButton(true);
              //     setdisablevideo(true)
              //     setdisabledrequestButton(false);
              //   } else
              //     if (foundVehicle?.backCamera?.value != 0 && foundVehicle?.backCamera?.value != 3 && selectedCameraType == "Back") {
              //       setdisabledcameraButton(true);
              //       setdisablevideo(true)
              //       setdisabledrequestButton(false);
              //     }
              //   if (cameraOnRef.current) {
              //     toast.dismiss(CameraResponseToastId);
              //     setCameraResponseToastId(null);
              //     toast.success("Now, you can make a Request");

              //     if (selectedFileType == "Video") {

              //       startTimer(500);
              //       setcameraHidediv(false)
              //     } else {
              //       startTimer(120);
              //       setcameraHidediv(false)
              //     }
              //   }
              // } else
              //   if (
              //     (foundVehicle?.frontCamera?.value == 1 ||
              //       foundVehicle?.frontCamera?.value == 2 ||
              //       foundVehicle?.frontCamera?.value == 4 ||
              //       foundVehicle?.backCamera?.value == 1 ||
              //       foundVehicle?.backCamera?.value == 2 ||
              //       foundVehicle?.backCamera?.value == 4) && selectedFileType == "video"
              //   ) {
              //     setdisablevideo(true)              
              //     if (disabledtoasterror != true) {
              //       toast.error("Memory card detect failed");
              //       setdisabledtoasterror(true)
              //     }
              //   }
            }
          }
        );
      } catch (err) { }
    }
    return () => {
      socket.disconnect();
    };
  }, [session?.clientId, disabledtoasterror]);

  const handleSelectChange = (e: any) => {
    const selectedVehicleId = e;
    if (selectedVehicleId != null) {
      const selectedVehicle = vehicleList.find(
        (vehicle) => vehicle.vehicleReg === selectedVehicleId?.value
      );
      setSelectedVehicle(selectedVehicle || null);
    } else {
      setSelectedVehicle(null);
      setdisableimage(false)
      setdisablevideo(false)
      setdisablefront(false)
      setdisableback(false)
      setSelectedCameraType(null)
      setSelectedFileType(null)
      setdisabledcameraButton(false)
      setdisabledrequestButton(false)

    }
  };
console.log(moment(new Date()).tz(session.timezone),session.timezone)
  const options =
    vehicleList?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];

  const handleCameraTypeChange = (event: { target: { value: any } }) => {
    setSelectedCameraType(event.target.value);
  };
  const handleFileTypeChange = (event: { target: { value: any } }) => {
    let filetype = event.target.value;
    setSelectedFileType(filetype);
    if (filetype === "Video") {
      setshowDurationTab(true);
    } else {
      setshowDurationTab(false);
    }
  };
  // useEffect(() => {
  //   let timer: string | number | NodeJS.Timeout | undefined;

  //   if (CameraResponseToastId !== null) {
  //     // // Function to be run for 30 seconds
  //     // const runFunctionFor30Sec = () => {

  //     // };

  //     // // Run the function every second for 30 seconds
  //     // timer = setInterval(runFunctionFor30Sec, 1000);

  //     // Stop the function after 30 seconds and reset the state
  //     setTimeout(() => {
  //       toast.dismiss(CameraResponseToastId)
  //       setCameraResponseToastId(null);  // Reset state
  //     }, 5000); // 5 seconds

  //   }

  //   // Cleanup function to clear the timer if the component unmounts
  //   return () => clearInterval(timer);

  // }, [CameraResponseToastId]);



  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;

    if (toastId !== null) {

      setTimeout(() => {
        // clearInterval(timer);

        toast.dismiss(toastId)
        setToastId(null);  // Reset state
      }, 60000); // 30 seconds

    }

    // Cleanup function to clear the timer if the component unmounts
    return () => clearInterval(timer);

  }, [toastId]);

  const handlecameraOn = async () => {
    if (!selectedVehicle
    ) {
      return toast.error("Please select vehicle");
    }
    if (CameraResponseToastId) {
      return toast.error("Please wait");
    }
    let duration;
    if (selectedFileType == "Video") {
      duration = 500;
    } else {
      duration = 120;
    }
    // setSecondsduration(duration)
    let formvalues = {
      commandtext: `setdigout 1 ${duration}`,
      vehicleReg: selectedVehicle?.vehicleReg,
      deviceIMEI: selectedVehicle?.deviceIMEI,
      createdDate: moment(new Date())
        .tz(session?.timezone)
        .format("MM/DD/YYYY hh:mm:ss"),
      status: "Pending",
    };
    if (selectedVehicle == null) {
      return toast.error("Please select vehicle");
    }

    if (session) {

      const response = await toast.promise(
        portalGprsCommand({
          token: session?.accessToken,
          payload: formvalues,
        }),
        {
          loading: "Sending Request...",
          success: "Request sent successfully!",
          error: "Error in sending request. Please try again.",
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

      if (response.success && !CameraResponseToastId) {
        const id = toast.loading("Waiting for Camera Response", {
          position: "top-center",
          duration: Infinity // Keep loading until dismissed
        });
        setCameraResponseToastId(id);
        if (selectedFileType === "Video") {
          setshowDurationTab(true)
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedFileType === "Video") {
      if (!selectedDate || !selectedTime || !selectedduration) {
        return toast.error("Please select the fields");
      }
    }


    if (selectedCameraType == "Front") {

      if (selectedFileType === "Video" && foundVehicle?.frontCamera?.value != 3) {
        toast.error("Memory card detect failed");
        return
      }
    }
    if (selectedCameraType == "Back") {
      if (selectedFileType === "Video" && foundVehicle?.backCamera?.value != 3) {
        toast.error("Memory card detect failed");
        return
      }
    }
    // let progress: any = await getCamDataByClientIdByVehicleReg(selectedVehicle?.vehicleReg)
    // if (progress?.data.uploadedToS3 == false || progress?.data.receivedPackages != progress?.data.totalPackages) {
    //   toast.error("Media downloading is in progress")      
    // }


    const selectedDateTime = moment.tz(`${selectedDate}T${selectedTime}`, session?.timezone);
    const currentDateTime = moment.tz(session?.timezone);

    // Compare dates in the client's timezone
    if (selectedDateTime.isAfter(currentDateTime)) {
      toast.error("Selected date and time cannot be in the future");
      return;
    }

    const timestamp = dateTimeToTimestamp(selectedDate, selectedTime);
    let Duration;
    if (Number(selectedduration) <= 10) {
      Duration = Number(selectedduration) + 1;
    } else {
      return toast.error("Please enter duration between 1-10 seconds");
    }
    let commandText;
    if (selectedFileType === "Photo") {
      if (selectedCameraType === "Front") {
        commandText = "camreq: 1,1";
      } else if (selectedCameraType === "Back") {
        commandText = "camreq: 1,2";
      }
    } else if (selectedFileType === "Video") {
      if (selectedCameraType === "Front") {
        commandText = `camreq: 0,1,${timestamp},${Duration}`;
      } else if (selectedCameraType === "Back") {
        commandText = `camreq: 0,2,${timestamp},${Duration}`;
      }
    }
    let formvalues = {
      commandtext: commandText,
      deviceIMEI: selectedVehicle?.deviceIMEI,
      createdDate: moment(new Date())
        .tz(session?.timezone)
        .format("MM/DD/YYYY hh:mm:ss"),
      status: "Pending",
      vehicleReg: selectedVehicle?.vehicleReg,
    };
    if (!formvalues.commandtext) {
      return toast.error("Please select the fields");
    }
    if (session) {
      const response = await toast.promise(
        portalGprsCommand({
          token: session?.accessToken,
          payload: formvalues,
        }),
        {
          loading: "Sending Request...",
          success: "Request sent successfully!",
          error: "Error in sending request. Please try again.",
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

      // if (socketdata.filetype !== ".h265" || socketdata.filetype !== ".jpeg") {
      //   if (!toastId) {
      //     const id = toast.loading("Waiting for Device Response", {
      //       position: "top-center",
      //     });
      //     setToastId(id);
      //   }
      // }

      if (response.success) {
        // setSelectedVehicle(null);

        if (!toastId) {
          const id = toast.loading("Waiting for Device Response", {
            position: "top-center",
            duration: Infinity // Keep loading until dismissed
          });
          setToastId(id);
        }

        // Set the request submit time to start polling
        setRequestSubmitTime(new Date().toISOString());

        // setdisableallButton(false);
        setdisableback(false)
        setdisablefront(false)
        setdisableimage(false)
        setdisablevideo(false)

        // setSelectedFileType(null);
        // setSelectedCameraType(null);
        setSelectedDuration("");
        setSelectedTime("");
        setSelectedDate("");
      }
    }
    // setToastId(null);
  };
  // if (socketdata) {
  //   toast.dismiss(toastId);
  // }
  useEffect(() => {
    if (socketdata.filetype == ".h265" || socketdata.filetype == ".jpeg") {
      if (socketdata.progress > 1 && socketdata.progress < 100) {
        setToastId(null);
        toast.dismiss(toastId);
      }
    }
  }, [toastId, socketdata]);

  const selectedOption =
    options.find((option) => option.value === selectedVehicle?.vehicleReg) ||
    null;

  // const getDate = new Date();
  // let getHour = getDate.getHours();
  // let getMinute = getDate.getMinutes();
  // let getSecond = getDate.getSeconds();


  const startTimer = async (durationInSeconds) => {
    const currentTime = moment.tz(session?.timeZone);
    const endTime = currentTime.add(durationInSeconds, 'seconds');

    localStorage.setItem('endTime', endTime.toISOString());

    setSeconds(durationInSeconds);
    //  setSecondsduration(0)
    setIsActive(true);
  };

  useEffect(() => {
    const endTimeString = localStorage.getItem('endTime');
    if (endTimeString) {
      const endTime = moment(endTimeString);
      const currentTime = moment.tz(session?.timeZone);
      const duration = endTime.diff(currentTime, 'seconds');
      if (duration > 0) {
        setSeconds(duration);
        setIsActive(true);
      } else {
        localStorage.removeItem('endTime');
      }
    }
    const interval = setInterval(() => {
      if (isActive) {
        setSeconds((prev) => {
          const newSeconds = prev - 1;
          if (newSeconds !== prev) {
            setIsFlipped(true); // Trigger flip animation
            setTimeout(() => setIsFlipped(false), 600); // Reset flip state after animation duration
          }
          if (newSeconds == 0) {
            clearInterval(interval);
            setIsActive(false);
            // toast.error('Camera closed');
            toast.dismiss(toastId)
            setToastId(null)
            setcameraHidediv(true)
            localStorage.removeItem('endTime');
            return 0;
          }
          return newSeconds;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, session?.timeZone]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const containerStyle = {
    borderRadius: '8px',
    border: '2px solid green',
    padding: '16px',
    backgroundColor: 'white',
    textAlign: 'center',
    width: '100%', // Change to 100% for full width responsiveness
    maxWidth: '800px', // Add max width for larger screens
    margin: 'auto',
  };

  const labelStyle = {
    fontFamily: 'Cormorant, serif',
    fontWeight: '600',
    fontSize: '20px',
    color: '#4A5568',
    marginBottom: '8px',
  };

  const timerContainerStyle = {
    display: 'flex',
    alignItems: 'center', // Center items vertically
    justifyContent: 'center',
    gap: '8px', // Adjust gap between elements for better spacing
    /* width: '100%', */ // Ensure it takes full width
  };

  const timerStyle = {
    width: '54px',
  };


  const boxStyle = {
    backgroundColor: '#00B56C',
    padding: '0px 0px',
    borderRadius: '8px',
    overflow: 'hidden',
    perspective: '1000px',
  };

  const flipStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    transition: 'transform 0.6s ease',
    transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
    backfaceVisibility: 'hidden',
  };


  // const percentage =
  //   durationInSecond > 0 ? (seconds / durationInSecond) * 100 : 0;


  return (
    <div className="px-4 py-8 bg-bgLight">
      {/* Container for responsive layout */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-5">
        {/* Vehicle Select */}
        <div className="col-span-1">
          <Select
            value={selectedOption}
            onChange={handleSelectChange}
            options={options}
            placeholder="Pick Vehicle"
            isClearable
            isSearchable
            noOptionsMessage={() => "No options available"}
            className="rounded-md w-full outline-green border border-grayLight hover:border-green"
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
                maxHeight: options.length > 3 ? "130px" : "auto",
                overflowY: options.length > 3 ? "scroll" : "visible",
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

        {/* Camera Type */}
        <div className="col-span-1">
          <div className="border rounded-md border-gray p-2 flex flex-col sm:flex-row items-center">
            <p className="text-sm text-green bg-bgLight px-4 mr-4">Camera Type</p>
            <div className="flex items-center flex-wrap">
              <label className="text-sm flex items-center mr-4">
                <input
                  type="radio"
                  style={{ accentColor: "green" }}
                  className="w-3 h-3 mr-2"
                  name="cameraType"
                  value="Front"
                  // disabled={disablefront}
                  checked={selectedCameraType === "Front"}
                  onChange={handleCameraTypeChange}
                />
                Front
              </label>
              <label className="text-sm flex items-center">
                <input
                  type="radio"
                  style={{ accentColor: "green" }}
                  className="w-3 h-3 mr-2"
                  name="cameraType"
                  value="Back"
                  // disabled={disableback}
                  checked={selectedCameraType === "Back"}
                  onChange={handleCameraTypeChange}
                />
                Rear
              </label>
            </div>
          </div>
        </div>

        {/* File Type */}
        <div className="col-span-1">
          <div className="border rounded-md border-gray p-2 flex flex-col sm:flex-row items-center">
            <p className="text-sm text-green bg-bgLight px-4 mr-4">File Type</p>
            <div className="flex items-center flex-wrap">
              <label className="text-sm flex items-center mr-4">
                <input
                  type="radio"
                  style={{ accentColor: "green" }}
                  className="w-3 h-3 mr-2"
                  name="fileType"
                  value="Photo"
                  // disabled={disableimage}
                  checked={selectedFileType === "Photo"}
                  onChange={handleFileTypeChange}
                />
                Image
              </label>
              <label className="text-sm flex items-center">
                <input
                  type="radio"
                  style={{ accentColor: "green" }}
                  className="w-3 h-3 mr-2"
                  name="fileType"
                  value="Video"
                  // disabled={disablevideo}
                  checked={selectedFileType === "Video"}
                  onChange={handleFileTypeChange}
                />
                Video
              </label>
            </div>
          </div>
        </div>

        {/* Timer Container */}
        {!cameraHidediv && (
          <div className="col-span-1">
            <div className="pb-2 flex items-center justify-between">
              <p className="text-lg text-green bg-bgLight pl-4">Camera On Duration</p>
              <div style={timerContainerStyle}>
                <div style={timerStyle}>
                  <div style={boxStyle}>
                    <h6 style={{ fontFamily: 'Cormorant, serif', fontWeight: '400', fontSize: '22px', color: 'white', textAlign: 'center', padding: "2px" }}>
                      {formatTime(Math.floor(seconds / 60))} m {/* Minutes */}
                    </h6>
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '24px', color: '#00B56' }}>:</h3>
                <div style={timerStyle}>
                  <div style={boxStyle}>
                    <h6 style={{ fontFamily: 'Cormorant, serif', fontWeight: '400', fontSize: '22px', color: 'white', textAlign: 'center', padding: "2px" }}>
                      {formatTime(seconds % 60)} s {/* Seconds */}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>




      {/* Buttons */}
      <div className="flex flex-wrap gap-4 my-6">
        <button
          className={`bg-green h-12 px-4  text-white rounded-lg ${disabledrequestButton ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handleSubmit}
          disabled={disabledrequestButton}
        >
          Request
        </button>
        <button
          className={`bg-green h-12 px-4  text-white rounded-lg ${disabledcameraButton ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={() => handlecameraOn()}
          disabled={disabledcameraButton}
        >
          Camera On
        </button>
        {/*  <div
          className={`timer w-18 bg-green px-4 rounded-lg ${
            seconds === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className=" bg-indigo-600 rounded-lg overflow-hidden ">
            <h3 className="countdown-element seconds font-Cormorant font-semibold text-lg text-white text-center animate-countinsecond">
              {seconds}
            </h3>
          </div>

          <p className="text-lg font-Cormorant font-normal text-white text-center w-full">
            seconds
          </p>
        </div> */}
        {/*   {!cameraHidediv && (       
        <div style={containerStyle}>
      <div style={labelStyle}>Camera On Duration</div>
      <div style={timerContainerStyle}>
        <div style={timerStyle}>
          <div style={boxStyle}>
            <h3 style={{ fontFamily: 'Cormorant, serif', fontWeight: '600', fontSize: '24px', color: 'white', textAlign: 'center' }}>
              {formatTime(Math.floor(seconds / 60))}
            </h3>
          </div>
          <p style={{ fontSize: '16px', textAlign: 'center', marginTop: '8px', color: '#4A5568' }}>
            minutes
          </p>
        </div>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '600', fontSize: '24px', color: '#4A5568' }}>:</h3>
        <div style={timerStyle}>
          <div style={boxStyle}>
            <div style={flipStyle}>
              <h3 style={{ fontFamily: 'Cormorant, serif', fontWeight: '600', fontSize: '24px', color: 'white', textAlign: 'center' }}>
                {formatTime(seconds % 60)} 
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '16px', textAlign: 'center', marginTop: '8px', color: '#4A5568' }}>
            seconds
          </p>
        </div>
      </div>
    </div>
     )} */}

        {/*       <div className={`relative h-16 w-32 ${seconds === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
  <div className="overflow-hidden absolute inset-0 rounded-full bg-green">
    <div
      className="absolute top-0 left-0 h-full bg-[#cccccc]"
      style={{ width: `${100 - percentage}%` }} // Keeps the gray overlay
    />
  </div>
  <div className="flex justify-center items-center absolute inset-0">
    <span className="text-lg font-bold text-black">{seconds} seconds</span> 
  </div>
</div> */}

        {/*      <div class="flex items-start justify-center w-full gap-4 count-down-main">
      
      <div class="timer w-18 bg-[#07bc0c]">
      <div
      class=" bg-indigo-600 py-4 px-2 rounded-lg overflow-hidden ">
      <h3
        class="countdown-element seconds font-Cormorant font-semibold text-2xl text-black text-center animate-countinsecond">15
      </h3>
      </div>
      <p class="text-lg font-Cormorant font-normal text-gray-900 mt-1 text-center w-full">seconds</p>
      </div>
      </div> */}
      </div>

      {/* Date, Time, and Duration Form */}
      {showDurationTab && (
        <div className="my-6 bg-gray-100 p-4 rounded-lg shadow-md">
          <form className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col p-2 bg-white border rounded-md shadow-sm">
              <label htmlFor="date" className="font-bold text-gray-700 mb-1">
                Date:
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(item) => handlevideodate(item)}
                step="1"
                onKeyPress={(e) => e.preventDefault()}
                required
                className="border p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col p-2 bg-white border rounded-md shadow-sm">
              <label htmlFor="time" className="font-bold text-gray-700 mb-1">
                Time:
              </label>
              <input
                type="time"
                id="time"
                value={selectedTime}
                onChange={(e) => {
                  const selectedTimeValue = e.target.value;
                  if (selectedDate) {
                    // Create date string in the client's timezone
                    const timezone = session?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    // Create moment objects in the specified timezone
                    const selectedDateTime = moment.tz(`${selectedDate}T${selectedTimeValue}`, timezone);
                    const currentDateTime = moment.tz(timezone);
                    if (selectedDateTime.isAfter(currentDateTime)) {
                      toast.error("Selected time cannot be in the future for the chosen date");
                      return;
                    }

                    // Additional check if selected date is today in client's timezone
                    const today = currentDateTime.format('YYYY-MM-DD');
                    if (selectedDate === today && selectedDateTime.isAfter(currentDateTime)) {
                      toast.error("Selected time cannot be in the future");
                      return;
                    }
                  }
                  setSelectedTime(selectedTimeValue);
                }}
                step="1"
                onKeyPress={(e) => e.preventDefault()}
                required
                className="border p-2 rounded-md"
              // onClick={(e) => {
              //   const now = moment().tz(session.timezone);
              //   const formattedTime = now.format('HH:mm:ss');
              //   e.currentTarget.value = formattedTime;

              // }}
              />
            </div>
            <div className="flex flex-col p-2 bg-white border rounded-md shadow-sm">
              <label
                htmlFor="duration"
                className="font-bold text-gray-700 mb-1"
              >
                Duration: (in seconds)
              </label>
              <input
                type="number"
                id="duration"
                value={selectedduration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[1-9]$|^10$/.test(value)) {
                    setSelectedDuration(value);
                  }
                }}
                placeholder="Enter duration between 1-10 sec"
                required
                className="border p-2 rounded-md"
              />
            </div>
          </form>
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

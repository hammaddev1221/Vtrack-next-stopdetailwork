"use client";
import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  getVehicleDataByClientId,
  ImmobiliseRequest,
  portalGprsCommand,
  vehiclebyClientidbyimmobilising,
  Verifyimmobiliserequest
} from "@/utils/API_CALLS";
// import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Select from "react-select";
import moment from "moment-timezone";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";

// import "./newstyle.css";
import { Modal, Fade, Box } from "@mui/material";
const modalStyles = {
  bgcolor: "white",
  width: "30%",
  height: "25%",
  zIndex: 1300,
  position: "absolute",
  top: "50%",
  left: "50%",
  textAlign: "center",
  p: 9,
  transform: "translate(-50%, -50%)"
};

export default function Request({setgprsdataget}:any) {
  const { data: session } = useSession();
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeviceAttach | null>(
    ""
  );
  const [open, setopen] = useState(false);
  const [activate, setactivate] = useState(false);
  const [deactivate, setdeactivate] = useState(false);

  // const [status, setStatus] = useState("");
  const [otp, setOtp] = useState("");
  // const [command, setCommand] = useState("");
  const selectedVehicleRef = useRef(selectedVehicle);
  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);

  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehiclebyClientidbyimmobilising({
            token: session?.accessToken,
            clientId: session?.clientId
          });
          setVehicleList(Data.data);

        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, []);

  const handleClose = () => {
    setopen(false);
    setOtp("");
    setSelectedVehicle("");
  };
  const handleSelectChange = async (e: any) => {
    const selectedVehicleId = e;
    setSelectedVehicle(selectedVehicleId)
    if (selectedVehicleId) {
      const data = await  toast.promise(
        getVehicleDataByClientId(          
         `data?user=${session?.clientId}&vehicleReg=${selectedVehicleId?.value}`
        ),
        {
          loading: "Please wait",
          success: () => {
            // No message to show on success, just return an empty string
            return ""; 
          },
          error: () => {
            // No message to show on error, just return an empty string
            return ""; 
          },
        },
      )
      toast.dismiss();
      let d = data.data?.[0]      
      // let parsedData = JSON.parse(data?.data?.Value)?.cacheList;
      // let d = parsedData.filter((i) => {
      //   return i.vehicleReg == selectedVehicleId?.value;
      // })[0];
      const selectedVehicle = {
        camStatus: d?.camStatus?.value,
        immStatus: d?.immStatus?.value,
        ...vehicleList.find(
          (vehicle) => vehicle.vehicleReg === selectedVehicleId?.value
        )
      };
      if (selectedVehicle.dual && selectedVehicle.immobilising) {
        if (selectedVehicle.immStatus == 0) {
          setdeactivate(true);
          setactivate(false);
        } else {
          setdeactivate(false);
          setactivate(true);
        }
      } else if (selectedVehicle.immobilising) {
        if (selectedVehicle.camStatus == 0) {
          setdeactivate(true);
          setactivate(false);
        } else {
          setdeactivate(false);
          setactivate(true);
        }
      }
      setSelectedVehicle(selectedVehicle || null);
    } else {
      setactivate(false);
      setdeactivate(false);
      setSelectedVehicle(null);
    }
  };
  const options =
    vehicleList?.length > 0
      ? vehicleList?.map((item: any) => ({
          value: item?.vehicleReg,
          label: item?.vehicleReg
        }))
      : [];

  const handleStatus = async (statu: any) => {
    if (selectedVehicle == "" || selectedVehicle == null) {
      toast.error("Select vehicle first");
      return;
    }
/*    /*  const response = await ImmobiliseRequest({
      token: session?.accessToken,
      payload: {
        clientId: session?.clientId,
        deviceIMEI: selectedVehicle?.deviceIMEI,
        vehicleReg: selectedVehicle?.vehicleReg
      }
    }); */
    const response = await  toast.promise(
      ImmobiliseRequest({
        token: session?.accessToken,
        payload: {
          clientId: session?.clientId,
          deviceIMEI: selectedVehicle?.deviceIMEI,
          vehicleReg: selectedVehicle?.vehicleReg
        }
      }),
      {
        loading: "Please wait",
        success: () => {
          // No message to show on success, just return an empty string
          return ""; 
        },
        error: () => {
          // No message to show on error, just return an empty string
          return ""; 
        },
      },
    )
    toast.dismiss();
    /* setStatus(statu);
    setopen(true); */
    if (response.success) {
      // setStatus(statu);
      setopen(true);
    } else {
      toast.error(response.message);
    }
  };
  const handleSubmit = async (status:string) => {
    // const response = await Verifyimmobiliserequest({
    //   token: session?.accessToken,
    //   payload: {
    //     clientId: session?.clientId,
    //     deviceIMEI: selectedVehicle?.deviceIMEI,
    //     vehicleReg: selectedVehicle?.vehicleReg,
    //     otp
    //   }
    // });

   // if (response.success) {
      let formvalues;
      if (selectedVehicle?.dualCam) {
        formvalues = {
          commandtext: status == "activate" ? "setdigout 2" : "setdigout 0",
          deviceIMEI: selectedVehicle?.deviceIMEI,
          status: "Pending",
          clientId: session?.clientId,
          createdDate: moment(new Date())
            .tz(session?.timezone)
            .format("MM/DD/YYYY hh:mm:ss"),
          vehicleReg: selectedVehicle?.vehicleReg
        };
      } else {
        formvalues = {
          commandtext: status == "activate" ? "setdigout 1" : "setdigout 0",
          deviceIMEI: selectedVehicle?.deviceIMEI,
          status: "Pending",
          clientId: session?.clientId,
          createdDate: moment(new Date())
            .tz(session?.timezone)
            .format("MM/DD/YYYY hh:mm:ss"),
          vehicleReg: selectedVehicle?.vehicleReg
        };
      }

      if (session) {
        const response = await toast.promise(
          portalGprsCommand({
            token: session?.accessToken,
            payload: formvalues
          }),
          {
            loading: "Sending command...",
            success: "Command Send successfully!",
            error: "Error Sending Command. Please try again."
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
        setgprsdataget(true)
      }
      setOtp("");
      setopen(false);
      setactivate(false)
      setdeactivate(false)
      setSelectedVehicle("")
    // } else {
    //   toast.error(response.message);
    // }
  };

  const selectedOption =
    options.find((option) => option.value === selectedVehicle?.vehicleReg) ||
    null;

   /*  useEffect(() => {
      if (open) {
        document.body.style.filter = 'blur(5px)';
        let a = document.getElementById("aaaa")
        if(a){
          document.body.style.filter = 'none';
        }
      } else {
        document.body.style.filter = 'none';
      }
  
      return () => {
        document.body.style.filter = 'none'; // Clean up on unmount
      };
    }, [open]);
 */
    const blurStyle = !open ? { filter: 'blur(5px)', pointerEvents: 'none' } : {};

  return (
    <div > 
    <div className="p-4 bg-bgLight">
      {/* Container for responsive layout */}
 
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-1 md:grid-cols-7 "  >
        {/* Vehicle Select */}
        <div className="">
          <Select
            value={selectedOption}
            onChange={handleSelectChange}
            options={ vehicleList?.map((item: any) => ({
              value: item?.vehicleReg,
              label: item?.vehicleReg
            }))}
            placeholder="Pick Vehicle"
            isClearable
            isSearchable
            noOptionsMessage={() => "No options available"}
            className="rounded-md outline-green border border-grayLight hover:border-green"
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
                  ? "#E1F0E3"
                  : "transparent",
                color: state.isSelected
                  ? "white"
                  : state.isFocused
                  ? "black"
                  : "black",
                "&:hover": {
                  backgroundColor: "#E1F0E3",
                  color: "black"
                }
              })
            }}
          />
        </div>
      
        <div className="col-span-2 ml-4">
          <button
            className={`bg-green px-4 py-2 text-white rounded-lg ${
              activate ? "opacity-50 cursor-not-allowed" : ""
            } `}
            onClick={() => {
            //  handleStatus("activate");
            handleSubmit("activate")
            }}
            disabled={activate}
          >
            Immobilize
          </button>
          <button
            className={`bg-green px-4 py-2 ml-2 text-white rounded-lg ${
              deactivate ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
            //  handleStatus("deactivate");
              handleSubmit("deactivate")
            }}
            disabled={deactivate}
          >
            Release
          </button>
        </div>
      </div>

     
        {open && (
        <div
        id="aaaa"
          style={{
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 80,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              width: '500px',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
         

            {/* Modal Content */}
            <div style={{ padding: '10px 0' }}>
              <p style={{ color: '#1f2937' }}>
                Enter the OTP received in your email address:
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  border: '1px solid #d1d5db',
                  padding: '8px',
                  width: '100%',
                  borderRadius: '4px',
                  marginTop: '8px',
                }}
              />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '10px',
              }}
            >
              <button
                type="button"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  background: 'red',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setopen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: '#38a169',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
    </div>
  );
}

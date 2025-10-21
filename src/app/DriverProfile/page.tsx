"use client";
import * as React from "react";
import { Table, Tooltip } from "antd";
import toast, { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import Fade from "@mui/material/Fade";
import { useRouter } from "next/navigation";
import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import 'flowbite'; // Import Flowbite for JavaScript interactivity
import "./driver.css";
import {
  postDriverDataByClientId,
  GetDriverDataByClientId,
  GetRfIdByClientId,
  AssignRfidtodriver,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faToggleOff, faToggleOn, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-100%)",
  // width: 680,
  bgcolor: "background.paper",
  boxShadow: 24,
};

interface InputFieldProps {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  textarea?: boolean;
  disabled?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  textarea = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-black font-popins">
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-green transition ${className}`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-green transition ${className}`}
        />
      )}
    </div>
  );
};


export default function DriverProfile() {
  const router = useRouter();
  const { data: session } = useSession();
  if (!session?.driverProfile) {
    router.push("/signin");
    return null;
  }
  const [DriverData, setDriverData] = useState<pictureVideoDataOfVehicleT[]>(
    []
  );
  const [InactiveDriverData, setInactiveDriverData] = useState<pictureVideoDataOfVehicleT[]>(
    []
  );
  const [showCardNumber, setShowCardNumber] = useState(false);
  // const [page, setPage] = React.useState(0);
  const [rowsPerPages, setRowsPerPages] = React.useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  // const [data, setData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [inputs, setInputs] = useState("");
  const [selectedData, setSelectedData] = useState<any>(null);
  const [getRfid, setRfid] = useState([]);
  const [selectedRFID, setSelectedRFID] = useState("");
  const [previousValue, setPreviousValue] = useState("");
  // const [inactiveRFIDs, setInactiveRFIDs] = useState<any>([]);
  const [confirmModalOpen, setconfirmModalOpen] = React.useState(false);
  const [dataUpdate, setdataUpdate] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
    setSelectedRFID("");
    setShowCardNumber(false);
    setFormData({
      id: "",
      clientId: session?.clientId,
      // driverNo: "",
      driverfirstName: "",
      driverMiddleName: "",
      driverLastName: "",
      driverContact: "",
      driverIdNo: "",
      driverAddress1: "",
      driverAddress2: "",
      driverRFIDCardNumber: "",
      isAvailable: true,
      driverUserName: "",
      driverPassword: "",
      driverEmail:""
    });
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setShowCardNumber(false);
  };
  const [formData, setFormData] = useState<any>({
    id: "",
    clientId: session?.clientId,
    // driverNo: "",
    driverfirstName: "",
    driverMiddleName: "",
    driverLastName: "",
    driverContact: "",
    driverIdNo: "",
    driverAddress1: "",
    driverAddress2: "",
    driverRFIDCardNumber: "",
    isAvailable: true,
    driverUserName: "",
    driverPassword: "",
    driverEmail:""
  });
  useEffect(() => {
    vehicleListData();
    RFid();
  }, [dataUpdate])
  const handleEdit = (id: any) => {
    
    if (!id.driverRFIDCardNumber) {
      setShowCardNumber(false);
    } else {
      setShowCardNumber(true);
    }
    if (id.isAvailable == true) {
      setOpenEdit(true);

    } else {
      toast.error("Please Driver Deasign");
    }
    setSelectedData(id);
    vehicleListData();
  };  
  const [singleFormData, setSingleFormData] = useState<any>({
    id: "",
    DriverId: "",
    // driverNo: "",
    driverfirstName: "",
    driverMiddleName: "",
    driverLastName: "",
    driverContact: "",
    driverIdNo: "",
    driverAddress1: "",
    driverAddress2: "",
    driverRFIDCardNumber: "",
    isAvailable: true,
    driverUserName: "",
    driverPassword: "",
    driverEmail:""
  });
  useEffect(() => {
    if (selectedData) {
      setSingleFormData({
        id: selectedData.id,
        DriverId: selectedData?.id,
        // driverNo: selectedData.driverNo,
        driverfirstName: selectedData.driverfirstName,
        driverMiddleName: selectedData.driverMiddleName,
        driverLastName: selectedData.driverLastName,
        driverContact: selectedData.driverContact,
        driverIdNo: selectedData.driverIdNo,
        driverAddress1: selectedData.driverAddress1,
        driverAddress2: selectedData.driverAddress2,
        driverRFIDCardNumber: selectedData.driverRFIDCardNumber,
        isAvailable: selectedData.isAvailable,
        driverUserName: selectedData.driverUserName,
        driverPassword: selectedData.driverPassword,
        driverEmail:selectedData.driverEmail
      });
    }
  }, [selectedData]);

  // Rest of your component code...

  const handleOpen = () => {
    setOpen(true);
    RFid();
  };
  const AddDriverRfid = () => {
    setShowCardNumber(!showCardNumber);
  };


  const filteredData: any = DriverData?.filter((item: any) => {
    if (
      item.driverEmail?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverfirstName?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverLastName?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverContact?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverIdNo?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverAddress1?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverRFIDCardNumber?.toLowerCase().includes(inputs.toLowerCase()) ||
      "assign".includes(inputs.toLowerCase())
    ) {
      return item;
    }
    else
      if (
        "unassign".includes(inputs)
      ) {
        return item.isAvailable === true;
      } else {
        return false;
      }

  });  
  const [columns] = useState([
    {
      title: "ID",
      dataIndex: "driverIdNo",
      key: "driverIdNo",
      width: 80, // Fixed width for better control
      align: "center",
      ellipsis: {
        showTitle: false, // Prevents default title attribute, use custom Tooltip
      }      
    },
    {
      title: "Driver Name",
      dataIndex: "driverfirstName",
      key: "driverfirstName",
      align: "center",
      width: 180, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text, r) => (
        `${r.driverfirstName} ${r.driverMiddleName} ${r.driverLastName}`        
      ),
    },
    {
      title: "Contact",
      dataIndex: "driverContact",
      key: "driverContact",
      align: "center",
      width: 100, // Fixed width for consistency
    },
    {
      title: "RFID",
      dataIndex: "driverRFIDCardNumber",
      key: "driverRFIDCardNumber",
      align: "center",
      width: 100, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text, r) => (
        <Tooltip placement="topLeft" title={text}>
          {text}


        </Tooltip>
      ),
    },
    {
      title: "User Name",
      dataIndex: "driverUserName",
      align: "center",
      key: "driverUserName",
      width: 100, // Fixed width
    },
    {
      title: "Password",
      dataIndex: "driverPassword",
      align: "center",
      key: "driverPassword",
      width: 100, // Fixed width
    },
    {
      title: "Address",
      dataIndex: "driverAddress1",
      key: "driverAddress1",
      align: "center",
      width: 180, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      render: (text, r) => (
        
        `${r.driverAddress1} ${r.driverAddress2}`


        
      ),
    },
    {
      title: "Availability",
      dataIndex: "isAvailable",
      key: "isAvailable",
      width: 180, // Fixed width
      align: "center",
      ellipsis: {
        showTitle: false,
      },
      render: (text, r) => (        
        `${text == true ? "Un Assign" : "Assign"} `
      ),
    },

    {
      title: "Email",
      dataIndex: "driverEmail",
      align: "center",
      key: "driverEmail",
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
      title: "Actions",
      key: "_id",
      dataIndex: "_id",
      width: 90, // Fixed width for action buttons
      align: "center",
      fixed: 'right', // Keep actions column visible when scrolling horizontally
      render: (text, record) => (
        <div className="flex gap-2 justify-center">
          {/* Edit Icon */}
          <FontAwesomeIcon
            icon={faEdit}
            className="w-5 h-5 cursor-pointer text-blue-500 hover:text-blue-700 transition-colors"
            onClick={() => {
              handleEdit(record)              
            }}
          />
          
          {/* Delete Icon */}
          <FontAwesomeIcon
            icon={record.isDeleted ? faToggleOff : faToggleOn}
            className="w-5 h-5 cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            onClick={() => {
              if (record.isDeleted == true) {
                handleActive(record)
              } else {
                handleDelete(record)
              }
              
            }}
          />
        </div>
      ),
    },
  ]);
  // const handleChangePage = (event: unknown, newPage: number) => {
  //   setCurrentPage(newPage);
  // };
  // const handleChangeRowsPerPage = (event: any) => {
  //   setRowsPerPages(event.target.value);
  //   setCurrentPage(0);
  // };
  const handleChangeDriver = (key: any, e: any) => {
    setFormData({ ...formData, [key]: e?.trim() });
    setSelectedRFID(e);
  };
  const handleEditDriver = (key: any, e: any) => {
    setSelectedData({ ...singleFormData, [key]: e });
  };
  // const id: any = selectedData?._id;
  const handleDriverEditedSubmit = async (e: React.FormEvent, value: any) => {
    e.preventDefault();
    const payLoad: any = {
      id: selectedData.id,
      // driverNo: selectedData.driverNo,
      driverfirstName: selectedData.driverfirstName,
      DriverId: selectedData?.id,
      driverMiddleName: selectedData.driverMiddleName,
      driverLastName: selectedData.driverLastName,
      driverContact: selectedData.driverContact,
      driverIdNo: selectedData.driverIdNo,
      driverAddress1: selectedData.driverAddress1,
      driverAddress2: selectedData.driverAddress2,
      isAvailable: selectedData.isAvailable,
      driverUserName: selectedData.driverUserName,
      driverPassword: selectedData.driverPassword,
      driverEmail: selectedData.driverEmail

    };
    if (showCardNumber && !selectedData.driverRFIDCardNumber) {
      toast.error("please Enter RFID Card Number");
    } else {
      try {
        if (session) {
          const newformdata = {
            ...payLoad,
            clientId: session?.clientId,
          };
          await toast.promise(
            postDriverDataByClientId({
              token: session?.accessToken,
              newformdata: newformdata,
            }),
            {
              loading: "Saving data...",
              success: "Driver Updated Successfully!",
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
          // const newShowCardNum = !showCardNumber;

          if (
            selectedData?.driverRFIDCardNumber !== previousValue ||
            showCardNumber
          ) {
            await toast.promise(
              AssignRfidtodriver(session?.accessToken, {
                RFIDid: getRfid?.find((i: any) => {
                  return i.RFIDCardNo === selectedData?.driverRFIDCardNumber;
                })?._id,
                DriverId: selectedData?.id || singleFormData?.id,
              }),
              {
                loading: "Saving data...",
                success: "RFID Card assign successfully!",
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
            setPreviousValue(selectedData?.driverRFIDCardNumber);
            setShowCardNumber(!showCardNumber);
          }
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
      vehicleListData();
      RFid();
      setOpenEdit(false);
    }
  };

  const handleDriverSubmit = async (e: any) => {
    e.preventDefault();
    const existingDriver = DriverData.find(
      (driver: any) => driver.driverContact === formData.driverContact
    );
    if (existingDriver) {
      alert("This Driver Number Is Already Exit");
    } else {
      setOpen(false);
      if (session) {
        const newformdata: any = {
          ...formData,
          clientId: session?.clientId,
        };
        await toast.promise(
          postDriverDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata,
          }),

          {
            loading: "Saving data...",
            success: "Driver Added Successfully!",
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
        vehicleListData();
        RFid();
      }

      setFormData({
        id: "",
        clientId: session?.clientId,
        driverEmail: "",
        driverfirstName: "",
        driverMiddleName: "",
        driverLastName: "",
        driverContact: "",
        driverIdNo: "",
        driverAddress1: "",
        driverAddress2: "",
        driverRFIDCardNumber: "",
        isAvailable: "",
        driverUserName: "",
        driverPassword: ""
      });
    }
  };

  const vehicleListData = async () => {
    try {
      if (session) {
        const response = await GetDriverDataByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setInactiveDriverData(response.filter((item: any) => item.isDeleted === true))
        setDriverData(response);
      }

    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  const RFid = async () => {
    try {
      if (session) {
        const response = await GetRfIdByClientId({
          token: session?.accessToken,
          ClientId: session?.clientId,
        });
        setRfid(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  useEffect(() => {
    vehicleListData();
    RFid();
  }, []);

  const handleSearch = (event: any) => {
    const newSearchTerm = event.target.value;
    setInputs(newSearchTerm);
  };
  const handledeletesubmit = async () => {
    let data = singleFormData
    if (data.isAvailable == true) {
      const payLoad: any = {
        id: data.id,
        driverEmail: data.driverEmail,
        driverfirstName: data.driverfirstName,
        driverMiddleName: data.driverMiddleName,
        driverLastName: data.driverLastName,
        driverContact: data.driverContact,
        driverIdNo: data.driverIdNo,
        driverAddress1: data.driverAddress1,
        driverAddress2: data.driverAddress2,
        driverRFIDCardNumber: data.driverRFIDCardNumber,
        isAvailable: true,
        isDeleted: true,
      };

      const newformdata = {
        ...payLoad,
        clientId: session?.clientId,
      };

      await toast.promise(
        postDriverDataByClientId({
          token: session?.accessToken,
          newformdata: newformdata,
        }),
        {
          loading: "Saving data...",
          success: "Driver Successfully In Active!",
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
      vehicleListData();
      RFid();
    } else {
      toast.error("Please Driver Deasign");
    }
    setconfirmModalOpen(false)
  }
  const handleDeletecancel = async () => {
    setconfirmModalOpen(false)
  }
  const handleDelete = async (data: any) => {
    setconfirmModalOpen(true)
    setSingleFormData((prevData) => ({
      ...prevData,
      ...data,
    }));
  };
  const handleActive = async (data: any) => {
    const { driverRFIDCardNumber } = data;
    delete data.driverRFIDCardNumber;
    const payLoad: any = {
      id: data.id,
      driverEmail: data.driverEmail,
      driverfirstName: data.driverfirstName,
      driverMiddleName: data.driverMiddleName,
      driverLastName: data.driverLastName,
      driverContact: data.driverContact,
      driverIdNo: data.driverIdNo,
      driverAddress1: data.driverAddress1,
      driverAddress2: data.driverAddress2,
      driverRFIDCardNumber: "",
      isAvailable: data.isAvailable,
      isDeleted: false,
    };
    if (session) {
      const newformdata: any = {
        ...payLoad,
        clientId: session?.clientId,
      };
      await AssignRfidtodriver(session?.accessToken, {
        DriverId: data?.data?._id,
        RFIDid: driverRFIDCardNumber,
      });
      await toast.promise(
        postDriverDataByClientId({
          token: session?.accessToken,
          newformdata: newformdata,
        }),

        {
          loading: "Saving data...",
          success: "Driver Activated Successfully!",
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

      vehicleListData();
      RFid();
    }
  };


  const [activeTab, setActiveTab] = useState("activeDriver")
  return (
    <div className="main_driver">
      <p className="bg-green px-4 py-1 border-t-2  text-center text-2xl text-white font-bold font-popins drivers_text">
        Driver Profile
      </p>
      <div className="flex justify-start items-center mt-8 pl-2 border-b border-gray-200  mb-4 ">
        <button
          onClick={() => {
            setActiveTab("activeDriver")
          }}
          className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${activeTab === "activeDriver"
            ? "bg-[#00B56C] text-white"
            : "bg-transparent hover:bg-[#D1FAE5] "
            }`}
        >
          Active Drivers
        </button>

        <button
          onClick={() => {
            setActiveTab("InactiveDriver")
          }}
          className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${activeTab === "InactiveDriver"
            ? "bg-[#00B56C] text-white"
            : "bg-transparent hover:bg-[#D1FAE5]"
            }`}
        >
          InActive Drivers
        </button>        
        {activeTab == "activeDriver" ? (
          <div className="ml-auto justify-end mr-8">
            <div className=" text-center total_driver_text xl:col-span-2 lg:col-span-3 md:col-span-3 sm:col-span-1">
              <h1 className="font-popins font-bold xl:text-xl text-green pt-2 text_total_driver">
                Total Active Drivers: {DriverData.filter((i) => i.isDeleted == false).length}
              </h1>
            </div>
          </div>
        )
          : (
            <div className="ml-auto justify-end mr-8">
              <div className=" text-center total_driver_text xl:col-span-2 lg:col-span-3 md:col-span-3 sm:col-span-1">
                <h1 className="font-popins font-bold xl:text-xl text-green pt-2 text_total_driver">
                  Total InActive Drivers: {InactiveDriverData.length}
                </h1>
              </div>
            </div>
          )}
      </div>

      <div className="m-4 rounded-xl pt-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}>


        <div className="flex justify-end items-center gap-4 mb-4 mr-4">
          {/* Search Bar */}
          <div className="xl:col-span-2 lg:col-span-3 md:col-span-3 sm:col-span-1  border-grayLight text-center lg:mx-5 search_driver" id="hover_bg">
            <div className="max-w-md  ">
              <label for="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div className="relative ">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input type="search" onChange={handleSearch}
                  value={inputs} id="default-search" className="block outline-none p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg " placeholder="Search" required />
              </div>
            </div>
          </div>
          {/* Add New Driver Button */}
          <button
            onClick={handleOpen}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px" fill="none" stroke="#ffffff" strokeWidth="2" className="w-5 h-5 inline-block mr-2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add New Driver
          </button>
        </div>


        
        <>         
          <Table
         
            columns={columns}
            dataSource={activeTab == "activeDriver" ? filteredData
              .filter((row: any) => row.isDeleted === false) : filteredData
                .filter((row: any) => row.isDeleted === true)}
            rowKey="_id"
            // Configure scrolling behavior
            // scroll={{ x: 'max-content', y: 490 }} // x: 'max-content' enables horizontal scrolling if content overflows
            // Apply responsive table styling
            className="antd-responsive-table"
            size="middle" // Can also use 'small' for a more compact table
            bordered // Adds borders to cells for clearer structure
            pagination={{ // Add pagination for large datasets
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </>
      </div>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={open}>
          <Box
            sx={{ ...style, maxWidth: "800px", width: "95%" }}
            className="popup_style rounded-xl shadow-xl overflow-hidden bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-green p-4">
              <h2 className="text-white font-semibold text-lg">Add Driver</h2>
              <button onClick={handleClose} aria-label="Close">
                <svg
                  className="h-5 w-5 text-white"
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

            {/* Form */}
            <form onSubmit={handleDriverSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="First Name" required value={formData.driverfirstName}
                  onChange={(val) => handleChangeDriver("driverfirstName", val.target.value)} />
                <InputField label="Last Name" required value={formData.driverLastName}
                  onChange={(val) => handleChangeDriver("driverLastName", val.target.value)} />
                <InputField label="Username"  value={formData.driverUserName}
                  onChange={(val) => handleChangeDriver("driverUserName", val.target.value)} />
                <InputField label="Password"  value={formData.driverPassword}
                  onChange={(val) => handleChangeDriver("driverPassword", val.target.value)} />

                <InputField label="Email" required value={formData.driverEmail}
                  onChange={(val) => handleChangeDriver("driverEmail", val.target.value)} />
                  
                <InputField label="Driver Contact" required type="text"
                  value={formData.driverContact}
                  onChange={(val) => {
                    const numberOnly = val.target.value.match(/\d+/g)?.join('') || '';
                    handleChangeDriver("driverContact", numberOnly);
                  }} />
                <InputField label="Driver ID" required type="text"
                  value={formData.driverIdNo}
                  onChange={(val) => {
                    const numeric = val.target.value.match(/\d+/g)?.join('') || '';
                    handleChangeDriver("driverIdNo", numeric);
                  }} />

                {/* RFID */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">RFID</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      style={{ accentColor: "green" }}
                      onClick={AddDriverRfid}
                      className="accent-green cursor-pointer"
                    />
                    {showCardNumber && (
                      <Select
                        value={selectedRFID}
                        onChange={(e) =>
                          handleChangeDriver("driverRFIDCardNumber", e.target.value)
                        }
                        displayEmpty
                        fullWidth
                        className="w-full border border-gray-300 rounded-md bg-white text-black"
                      >
                        <MenuItem value="" disabled>
                          Select RFID
                        </MenuItem>
                        {getRfid.map((item) =>
                          !item.DriverId ? (
                            <MenuItem key={item.RFIDCardNo} value={item.RFIDCardNo}>
                              {item.RFIDCardNo}
                            </MenuItem>
                          ) : null
                        )}
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              {/* Address and Submit Button Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end mt-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={formData?.driverAddress1}
                    onChange={(e) => handleChangeDriver("driverAddress1", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-green hover:border-green transition duration-300"
                    rows={3}
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`py-2 px-6 bg-green text-white font-semibold rounded-md shadow hover:bg-green-700 transition duration-300 ${!formData.driverfirstName?.trim() ||
                      !formData.driverLastName?.trim() ||
                      !formData.driverContact?.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                      }`}
                    disabled={
                      !formData.driverfirstName?.trim() ||
                      !formData.driverLastName?.trim() 
                      // !formData.driverContact?.trim() ||
                      // !formData.driverUserName?.trim() ||
                      // !formData.driverPassword?.trim()
                    }
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openEdit}
        onClose={handleCloseEdit}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openEdit}>
          <Box
            sx={{ ...style, maxWidth: "800px", width: "95%" }}
            className="popup_style rounded-xl shadow-xl overflow-hidden bg-white"
          >

            {/* Header */}
            <div className="flex items-center justify-between bg-green p-4">
              <h2 className="text-white font-semibold text-lg">Edit Driver</h2>
              <button onClick={handleCloseEdit} aria-label="Close">
                <svg
                  className="h-5 w-5 text-white"
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
            <form onSubmit={handleDriverEditedSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="First Name" required value={singleFormData.driverfirstName}
                  onChange={(val) => handleEditDriver("driverfirstName", val.target.value)} />
                <InputField label="Last Name" required value={singleFormData.driverLastName}
                  onChange={(val) => handleEditDriver("driverLastName", val.target.value)} />
                <InputField label="Username" required value={singleFormData.driverUserName}
                  onChange={(val) => handleEditDriver("driverUserName", val.target.value)} />
                <InputField label="Password" required value={singleFormData.driverPassword}
                  onChange={(val) => handleEditDriver("driverPassword", val.target.value)} />
                  <InputField label="Email" required value={singleFormData.driverEmail}
                  onChange={(val) => handleEditDriver("driverEmail", val.target.value)} />
                <InputField label="Driver Contact" required type="text"
                  value={singleFormData.driverContact}
                  onChange={(val) => {
                    const numberOnly = val.target.value.match(/\d+/g)?.join('') || '';
                    handleEditDriver("driverContact", numberOnly);
                  }} />
                <InputField label="Driver ID" required type="text"
                  value={singleFormData.driverIdNo}
                  onChange={(val) => {
                    const numeric = val.target.value.match(/\d+/g)?.join('') || '';
                    handleEditDriver("driverIdNo", numeric);
                  }} />
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">RFID</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      style={{ accentColor: "green" }}
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="border border-green  outline-green  cursor-pointer  ms-2 "
                      checked={showCardNumber ? true : false}
                    />
                    {showCardNumber && (
                      <Select
                        value={singleFormData.driverRFIDCardNumber || "none"}
                        onChange={(e) =>
                          handleEditDriver("driverRFIDCardNumber", e.target.value)
                        }
                        displayEmpty
                        fullWidth
                        className="w-full border border-gray-300 rounded-md bg-white text-black"
                      >
                        <MenuItem value={singleFormData.driverRFIDCardNumber || ""} disabled >
                          {singleFormData.driverRFIDCardNumber || "Select RFID"}
                        </MenuItem>
                        {getRfid.map((item) =>
                          item.DriverId === "" ? (
                            <MenuItem key={item.RFIDCardNo} value={item.RFIDCardNo}>
                              {item.RFIDCardNo}
                            </MenuItem>
                          ) : null
                        )}
                      </Select>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end mt-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={singleFormData?.driverAddress1}
                    onChange={(e) => handleEditDriver("driverAddress1", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-green hover:border-green transition duration-300"
                    rows={3}
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`py-2 px-6 bg-green text-white font-semibold rounded-md shadow hover:bg-green-700 transition duration-300 ${!singleFormData.driverfirstName?.trim() ||
                     !singleFormData.driverfirstName?.trim() ||
                      !singleFormData.driverLastName?.trim() ||
                      // !singleFormData.driverContact?.trim() ||
                      !singleFormData.driverUserName?.trim() ||
                      !singleFormData.driverPassword?.trim()
                    }
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                      }`}
                    disabled={
                      !singleFormData.driverfirstName?.trim() ||
                      !singleFormData.driverLastName?.trim() ||
                      // !singleFormData.driverContact?.trim() ||
                      !singleFormData.driverUserName?.trim() ||
                      !singleFormData.driverPassword?.trim()
                    }
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>

      {
        confirmModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg w-full sm:w-1/3 z-10 max-w-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 text-white rounded-full mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                    width="40px"
                    height="40px"
                    viewBox="0 0 1920.00 1920.00"
                    stroke="#ffffff"
                    strokeWidth="5.76"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0">
                      <rect
                        x="0"
                        y="0"
                        width="1920.00"
                        height="1920.00"
                        rx="960"
                        fill="#00B56C"
                      />
                    </g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M960 0c530.193 0 960 429.807 960 960s-429.807 960-960 960S0 1490.193 0 960 429.807 0 960 0Zm0 101.053c-474.384 0-858.947 384.563-858.947 858.947S485.616 1818.947 960 1818.947 1818.947 1434.384 1818.947 960 1434.384 101.053 960 101.053Zm-42.074 626.795c-85.075 39.632-157.432 107.975-229.844 207.898-10.327 14.249-10.744 22.907-.135 30.565 7.458 5.384 11.792 3.662 22.656-7.928 1.453-1.562 1.453-1.562 2.94-3.174 9.391-10.17 16.956-18.8 33.115-37.565 53.392-62.005 79.472-87.526 120.003-110.867 35.075-20.198 65.9 9.485 60.03 47.471-1.647 10.664-4.483 18.534-11.791 35.432-2.907 6.722-4.133 9.646-5.496 13.23-13.173 34.63-24.269 63.518-47.519 123.85l-1.112 2.886c-7.03 18.242-7.03 18.242-14.053 36.48-30.45 79.138-48.927 127.666-67.991 178.988l-1.118 3.008a10180.575 10180.575 0 0 0-10.189 27.469c-21.844 59.238-34.337 97.729-43.838 138.668-1.484 6.37-1.484 6.37-2.988 12.845-5.353 23.158-8.218 38.081-9.82 53.42-2.77 26.522-.543 48.24 7.792 66.493 9.432 20.655 29.697 35.43 52.819 38.786 38.518 5.592 75.683 5.194 107.515-2.048 17.914-4.073 35.638-9.405 53.03-15.942 50.352-18.932 98.861-48.472 145.846-87.52 41.11-34.26 80.008-76 120.788-127.872 3.555-4.492 3.555-4.492 7.098-8.976 12.318-15.707 18.352-25.908 20.605-36.683 2.45-11.698-7.439-23.554-15.343-19.587-3.907 1.96-7.993 6.018-14.22 13.872-4.454 5.715-6.875 8.77-9.298 11.514-9.671 10.95-19.883 22.157-30.947 33.998-18.241 19.513-36.775 38.608-63.656 65.789-13.69 13.844-30.908 25.947-49.42 35.046-29.63 14.559-56.358-3.792-53.148-36.635 2.118-21.681 7.37-44.096 15.224-65.767 17.156-47.367 31.183-85.659 62.216-170.048 13.459-36.6 19.27-52.41 26.528-72.201 21.518-58.652 38.696-105.868 55.04-151.425 20.19-56.275 31.596-98.224 36.877-141.543 3.987-32.673-5.103-63.922-25.834-85.405-22.986-23.816-55.68-34.787-96.399-34.305-45.053.535-97.607 15.256-145.963 37.783Zm308.381-388.422c-80.963-31.5-178.114 22.616-194.382 108.33-11.795 62.124 11.412 115.76 58.78 138.225 93.898 44.531 206.587-26.823 206.592-130.826.005-57.855-24.705-97.718-70.99-115.729Z"
                        fillRule="evenodd"
                      />
                    </g>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-lg font-semibold">
                  Confirm Update
                </h2>
              </div>
              <p>

                Are you sure you want to Inactive this Driver?

              </p>

              {/* Modal Buttons */}
              <div className="mt-4 text-right">
                <button
                  onClick={handleDeletecancel}
                  className="bg-[#d1d5db] px-4 py-2 rounded mr-2 hover:bg-[#e5e7eb]"
                >
                  Cancel
                </button>
                <button
                  onClick={handledeletesubmit}
                  className="bg-[#00B56C] text-white px-4 py-2 rounded hover:bg-[#4ade80]"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )
      }

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

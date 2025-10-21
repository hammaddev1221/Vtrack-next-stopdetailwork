"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import {
  GetDriverDataByClientId,
  GetDriverDataAssignByClientId,
  postDriverDataAssignByClientId,
  GetDriverforvehicel,
  postDriverDeDataAssignByClientId,
} from "@/utils/API_CALLS";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import "./assign.css";
import { InputLabel } from "@mui/material";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 50,
    },
  },
};
interface Data {
  name: string;
  code: string;
  population: number;
  size: number;
  density: number;
}

function createData(
  name: string,
  code: string,
  population: number,
  size: number
): Data {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData("India", "IN", 1324171354, 3287263),
  // createData('China', 'CN', 1403500365, 9596961),
  // createData('Italy', 'IT', 60483973, 301340),
  // createData('United States', 'US', 327167434, 9833520),
  // createData('Canada', 'CA', 37602103, 9984670),
  // createData('Australia', 'AU', 25475400, 7692024),
  // createData('Germany', 'DE', 83019200, 357578),
  // createData('Ireland', 'IE', 4857000, 70273),
  // createData('Mexico', 'MX', 126577691, 1972550),
  // createData('Japan', 'JP', 126317000, 377973),
  // createData('France', 'FR', 67022000, 640679),
  // createData('United Kingdom', 'GB', 67545757, 242495),
  // createData('Russia', 'RU', 146793744, 17098246),
  // createData('Nigeria', 'NG', 200962417, 923768),
  // createData('Brazil', 'BR', 210147125, 8515767),
];

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-100%)",
  // width: 680,
  bgcolor: "background.paper",
  boxShadow: 24,
};

import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { Tooltip, Table } from "antd";
export default function DriverProfile() {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session?.driverProfile) {
    redirect("/liveTracking")
  }
  const [columns] = useState([
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      width: 80, // Fixed width for better control
      align: "center",
      render: (text, record, index) => index + 1,

    },
    {
      title: "Name",
      dataIndex: "driverfirstName",
      key: "driverfirstName",
      width: 180, // Fixed width
      ellipsis: {
        showTitle: false,
      },
      align: "center",
      render: (text, r) => (
        // <Tooltip placement="topLeft" title={text}>
        `${r.DriverDetails.driverfirstName} ${r.DriverDetails.driverMiddleName} ${r.DriverDetails.driverLastName}`


        // </Tooltip>
      ),
    },
    {
      title: "Driver ID",
      dataIndex: "driverIdNo",
      key: "driverIdNo",
      width: 100, // Fixed width for consistency
      align: "center",
      render: (text, r) => (
        // <Tooltip placement="topLeft" title={text}>
        `${r.DriverDetails.driverIdNo}`


        // </Tooltip>
      ),
    },
    {
      title: "Contact",
      dataIndex: "driverContact",
      key: "driverContact",
      width: 100, // Fixed width for consistency
      align: "center",
      render: (text, r) => (
        // <Tooltip placement="topLeft" title={text}>
        `${r.DriverDetails.driverContact || "-"}`


        // </Tooltip>
      ),
    },
    {
      title: "Address",
      dataIndex: "Address",
      key: "Address",
      width: 100, // Fixed width for consistency
      align: "center",
      render: (text, r) => (
        // <Tooltip placement="topLeft" title={text}>
        `${r.DriverDetails.driverAddress1}${" "}${r.DriverDetails.driverAddress2}`


        // </Tooltip>
      ),
    },
    {
      title: "Vehicle Reg",
      dataIndex: "VehicleReg",
      key: "VehicleReg",
      width: 100, // Fixed width for consistency
      align: "center",
      render: (text, r) => (
        // <Tooltip placement="topLeft" title={text}>
        `${r.vehicleDetails.vehicleReg}`


        // </Tooltip>
      ),
    },
    {
      title: "Assign At",
      dataIndex: "dateAssign",
      key: "dateAssign",
      width: 100, // Fixed width for consistency
      align: "center",
      render: (text, r) => (
        // <Tooltip placement="topLeft" title={text}>
        `${r.dateAssign.split("T")[0]}`


        // </Tooltip>
      ),
    },

    {

      title: "Action",
      key: "_id",
      dataIndex: "_id",
      width: 90, // Fixed width for action buttons
      fixed: 'right', // Keep actions column visible when scrolling horizontally
      align: "center",
      render: (text, record) => (
        <div className="flex gap-2 justify-center">
          <Tooltip placement="topLeft" title={"Deassign"}>
            <FontAwesomeIcon
              icon={faToggleOn}
              className="w-5 h-5 cursor-pointer text-red-500 hover:text-red-700 transition-colors"
              onClick={() => {
                handleDeasign(record)
                // setId(text);
                // setDeleteModal(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ]);
  // const [page, setPage] = React.useState(0);
  // const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [open, setOpen] = useState(false);
  const [DriverList, setDriverList] = useState([]);
  const [vehicleNums, setvehicleNum] = useState([]);
  const [getAllAsignData, setgetAllAsignData] = useState<any>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>({});
  const [selectVehicleNum, setSelectVehicleNum] = useState<any>({});
  const vehicleName = async () => {
    try {

      if (session) {
        const response = await GetDriverDataByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });

        setDriverList(
          response.filter(
            (item: any) => item.isAvailable == true && item.isDeleted === false
          )
        );
      }

    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };


  const AllAsignData = async () => {
    try {

      if (session) {
        const response = await GetDriverDataAssignByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });

        setgetAllAsignData(response);
      }

    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };
  useEffect(() => {
    AllAsignData();
  }, []);

  const vehicleNum = async () => {
    try {

      if (session) {
        const response = await GetDriverforvehicel({
          token: session?.accessToken,
          clientId: session?.clientId,
        });

        setvehicleNum(response.data);
      }

    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  useEffect(() => {
    vehicleNum();
    vehicleName();
  }, []);

  // const handleChangePage = (event: unknown, newPage: number) => {
  //   setPage(newPage);
  // };
  if (
    session?.userRole === "Controller" ||
    (session?.userRole == "Admin" && session?.driverProfile === false)
  ) {
    router.push("/signin");
    return null;
  }

  // const handleChangeRowsPerPage = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);




  const handleVehicle = (e: any) => {
    const selectedVehicle: any = vehicleNums?.find(
      (driver: any) => driver.id === e.target.value
    );
    setSelectVehicleNum(selectedVehicle);
    // setSelectVehicleNum(e.target.value);
  };

  const handleSelectDriver = (e: any) => {
    const selectedDriverObject: any = DriverList.find(
      (driver: any) => driver._id === e.target.value
    );
    setSelectedDriver(selectedDriverObject);
  };



  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let payload: any = {
      DriverDetails: {
        id: selectedDriver._id,
        driverfirstName: selectedDriver.driverfirstName,
        driverMiddleName: selectedDriver.driverMiddleName,
        driverLastName: selectedDriver.driverLastName,
        driverContact: selectedDriver.driverContact,
        driverIdNo: selectedDriver.driverIdNo,
        driverAddress1: selectedDriver.driverAddress1,
        driverAddress2: selectedDriver.driverAddress2,
      },
      id: "",
      timezone: "Europe/London",
      vehicleDetails: {
        id: selectVehicleNum?._id,
        vehicleNo: selectVehicleNum?.vehicleNo,
        vehicleMake: selectVehicleNum?.vehicleMake,
        vehicleModel: selectVehicleNum?.vehicleModel,
        vehicleReg: selectVehicleNum?.vehicleReg,
      },
      // dateAssign: item.timestamp,
      // dateDeassign: null,
    };

    if (
      !payload.vehicleDetails.vehicleNo ||
      !payload.DriverDetails.driverfirstName ||
      !payload.DriverDetails.driverLastName
    ) {
      toast.error("Please Fill the field");
    } else {
      try {
        if (session) {
          const newformdata: any = {
            ...payload,
            clientId: session?.clientId,
          };

          const response = await toast.promise(
            postDriverDataAssignByClientId({
              token: session?.accessToken,
              newformdata: newformdata,
            }),
            {
              loading: "Process...",
              success: "Driver successfully assign!",
              error: "Error in assigning driver. Please try again.",
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
          // vehicleListData();
          AllAsignData();
          setSelectedDriver("");
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
      vehicleName();
      vehicleNum();
      vehicleNum();
      setSelectedDriver("");
      setOpen(false);
    }
    setSelectVehicleNum({});
  };

  const handleDeasign = async (item: any) => {

    const payload: any = {
      DriverDetails: {
        // driverfirstName: selectedDriverObject?.DriverDetails?.driverfirstName,
        // driverLastName: selectedDriverObject?.DriverDetails?.driverLastName,
        // driverContact: selectedDriverObject?.DriverDetails?.driverContact,
        // driverIdNo: selectedDriverObject?.DriverDetails?.driverIdNo,
        // driverAddress1: selectedDriverObject?.DriverDetails?.driverAddress1,
        // driverAddress2: selectedDriverObject?.DriverDetails?.driverAddress2,
        id: item?.DriverDetails?.id,
      },
      // clientId: session?.clientId,
      // dateAssign: "2024-01-26T09:11:14",
      // dateDeassign: null,
      id: item.id,
      timezone: session.timezone,
      // tableData: {
      //   id: "0",
      // },
      vehicleDetails: {
        id: item?.vehicleDetails?.id,
        // vehicleNo: selectedDriverObject?.vehicleDetails?.vehicleNo,
        // vehicleMake: selectedDriverObject?.vehicleDetails?.vehicleMake,
        // vehicleModel: selectedDriverObject?.vehicleDetails?.vehicleModel,
        // vehicleReg: selectedDriverObject?.vehicleDetails?.vehicleReg,
      },
    };
    try {
      if (session) {
        const { id }: any = toast.custom((t) => (
          <div className="bg-white p-2 rounded-md">
            <p>Are you sure you want to Deasign This Driver ?</p>
            <button
              onClick={async () => {
                // Check if the user is authenticated
                if (session) {
                  const newformdata: any = {
                    ...payload,
                    clientId: session?.clientId,
                  };
                  const response = await toast.promise(
                    postDriverDeDataAssignByClientId({
                      token: session?.accessToken,
                      newformdata: newformdata,
                    }),
                    {
                      loading: "Process...",
                      success: "Driver Successfully Deassign!",
                      error: "Error in Deassigning. Please try again.",
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
                  AllAsignData();
                }
              }}
              className="text-green pr-5 font-popins font-bold"
            >
              Yes
            </button>
            <button
              onClick={() => {
                // Dismiss the confirmation toast without deleting
                toast.dismiss(id);

                // Optionally, you can show a cancellation message
                toast("Deletion canceled", {
                  duration: 3000,
                  position: "top-center",
                });
              }}
              className="text-red font-popins font-bold"
            >
              No
            </button>
          </div>
        ));


        // const response = await toast.promise(
        //   postDriverDeDataAssignByClientId({
        //     token: session?.accessToken,
        //     newformdata: newformdata,
        //   }),
        //   {
        //     loading: "Saving data...",
        //     success: "Data saved successfully!",
        //     error: "Error saving data. Please try again.",
        //   },
        //   {
        //     style: {
        //       border: "1px solid #00B56C",
        //       padding: "16px",
        //       color: "#1A202C",
        //     },
        //     success: {
        //       duration: 2000,
        //       iconTheme: {
        //         primary: "#00B56C",
        //         secondary: "#FFFAEE",
        //       },
        //     },
        //     error: {
        //       duration: 2000,
        //       iconTheme: {
        //         primary: "#00B56C",
        //         secondary: "#FFFAEE",
        //       },
        //     },
        //   }
        // );
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  return (
    <div className="main_driver">
      <p className="bg-green px-4 py-1   text-center text-2xl text-white font-bold font-popins drivers_text">
        Assign Driver
      </p>
      {/*   <Paper sx={{ width: "100%" }} className="bg-green-50 "> */}
      {/* <Button>Add New Driver</Button> */}
      <div className="flex lg: justify-center items-center sm:justify-start drivers_add_popup">
        <button
          onClick={handleOpen}
          className="bg-[#00B56C] px-4 py-1 m-5 text-white rounded-md"
        >
          {" "}
          Assign To A Vehicle
        </button>
      </div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style} className="popup_style">
            <Typography
              id="transition-modal-title"
              variant="h6"
              component="h2"
              className="text-black"
            >
              <div className="grid grid-cols-12 bg-green">
                <div className="col-span-11">
                  <p className="p-3 text-white w-full font-popins font-bold ">
                    Assign Driver
                  </p>
                </div>
                <div className="col-span-1" onClick={handleClose}>
                  <svg
                    className="h-6 w-6 text-white mt-3 cursor-pointer"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {" "}
                    <path stroke="none" d="M0 0h24v24H0z" />{" "}
                    <line x1="18" y1="6" x2="6" y2="18" />{" "}
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              </div>
            </Typography>

            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 m-6 mt-8 gap-5">
                  <div className="lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-12  ">
                    <label className="text-gray-700 ">
                      <i className=" font-popins font-extrabold mt-5 text-red">
                        *
                      </i>{" "}
                      Drivers:
                    </label>

                    <Select
                      MenuProps={MenuProps}
                      onChange={handleSelectDriver}
                      className="h-8 w-full  border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-outoutline-none color-gray"
                      displayEmpty
                    >
                      {/* <MenuItem value="" disabled selected>
                          Drives
                        </MenuItem> */}
                      <InputLabel disabled hidden className="text-gray">
                        Select Driver{" "}
                      </InputLabel>
                      {DriverList &&
                        DriverList.map((item: any, i: any) => {
                          return (
                            <MenuItem
                              className="assign_driver_hover"
                              key={item._id}
                              value={item._id}
                            >
                              {item.driverfirstName} {item.driverLastName}{" "}
                              {item.driverMiddleName}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </div>

                  <div className="lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-12 lg:mt-0 md:mt-0 sm:mt-0  mt-4 ">
                    <label>
                      {" "}
                      <i className="text-red font-popins font-extrabold  mt-5">
                        *
                      </i>{" "}
                      Vehicles:
                      <Select
                        MenuProps={MenuProps}
                        onChange={handleVehicle}
                        displayEmpty
                        className="h-8  border w-full border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out"
                      >
                        <InputLabel disabled hidden className="text-gray">
                          Select Vehicle{" "}
                        </InputLabel>
                        {vehicleNums &&
                          vehicleNums?.map((item: any) => {
                            return (
                              <MenuItem
                                className="assign_driver_hover"
                                // className="hover:bg-green hover:text-white"
                                key={item._id}
                                value={item._id}
                              >
                                {item.vehicleReg}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </label>
                    <br></br>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-[#00B56C]  px-6 py-2 mt-10  text-end text-white rounded-md "
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </Typography>
          </Box>
        </Fade>
      </Modal>
      <div className="m-4 rounded-xl pt-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}>

        <Table
          // rowSelection={{ type: "checkbox", ...rowSelection }}
          columns={columns}
          dataSource={getAllAsignData.data}
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
        {/* <TableContainer   style={{
    maxHeight: '600px', // Adjust the height as needed
    overflowY: 'auto',  // Enable vertical scrolling
  }}>
          <div className="table_driver_profile">
            <Table stickyHeader aria-label="sticky table">
              <TableHead className="sticky top-0 bg-white ">
                <TableRow>
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    S.No
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    First Name
                  </TableCell>
                 
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    Last Name
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    Driver ID
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    Driver Contact
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    Vehicle Reg
                  </TableCell>
               
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    Driver Address
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    id="table_head"
                    className="font-popins  font-bold text-black"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="bg-bgLight  ">
                {getAllAsignData?.data?.map((row: any, index: any) => (
                  <TableRow className="hover:bg-bgHoverTabel w-full" key ={index}>
                    <TableCell align="center" colSpan={2}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                   
                    <TableCell align="center" colSpan={2}>
                      {" "}
                      {row?.DriverDetails?.driverfirstName}
                    </TableCell>
                    
                    <TableCell align="center" colSpan={2}>
                      {row?.DriverDetails?.driverLastName}
                    </TableCell>
                    <TableCell align="center" colSpan={2}>
                      {row?.DriverDetails?.driverIdNo}
                      
                    </TableCell>

                    <TableCell align="center" colSpan={2}>
                      {row?.DriverDetails?.driverContact}
                    
                    </TableCell>

                    <TableCell align="center" colSpan={2}>
                      {row?.vehicleDetails?.vehicleReg}
                    </TableCell>
                    <TableCell align="center" colSpan={2}>
                      {row?.DriverDetails?.driverAddress1}
                    </TableCell>

                    <TableCell
                      align="center"
                      colSpan={2}
                      onClick={() => handleDeasign(row.id)}
                      className=" font-bold cursor-pointer "
                      style={{ color: "#00B56C" }}
                    >
                      DeAssign                      
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
       
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className="bg-bgLight table_pagination  rounded-xl"
        /> */}
      </div>
      {/*  </Paper> */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

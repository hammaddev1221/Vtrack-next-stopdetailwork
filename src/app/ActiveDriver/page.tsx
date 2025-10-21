// "use client";
// import * as React from "react";
// import Paper from "@mui/material/Paper";
// import Table from "@mui/material/Table";
// import TableBody from "@mui/material/TableBody";
// import TableCell from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TablePagination from "@mui/material/TablePagination";
// import TableRow from "@mui/material/TableRow";
// import { toast, Toaster } from "react-hot-toast";
// import Backdrop from "@mui/material/Backdrop";
// import Box from "@mui/material/Box";
// import Modal from "@mui/material/Modal";
// import Fade from "@mui/material/Fade";
// import Typography from "@mui/material/Typography";
// import MenuItem from "@mui/material/MenuItem";
// import Select from "@mui/material/Select";
// import { pictureVideoDataOfVehicleT } from "@/types/videoType";
// import Image from 'next/image';
// import ActiveIcon from '../../../public/active.svg';
// import {
//   postDriverDataByClientId,
//   GetDriverDataByClientId,
//   GetRfIdByClientId,
// } from "@/utils/API_CALLS";
// import { useSession } from "next-auth/react";
// import { useState, useEffect } from "react";
// import "./inactiveDriver.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit } from "@fortawesome/free-solid-svg-icons";
// const style = {
//   position: "absolute" as "absolute",
//   top: "70%",
//   left: "50%",
//   transform: "translate(-50%,-100%)",
//   width: 680,
//   bgcolor: "background.paper",
//   boxShadow: 24,
// };

// export default function DriverProfile({ setdataUpdate }:any) {
//   const { data: session } = useSession();
//   const [DriverData, setDriverData] = useState<pictureVideoDataOfVehicleT[]>(
//     []
//   );
//   const [showCardNumber, setShowCardNumber] = useState(false);
//   // const [page, setPage] = React.useState(0);
//   const [rowsPerPages, setRowsPerPages] = React.useState(10);
//   const [currentPage, setCurrentPage] = useState(0);
//   // const [data, setData] = useState([]);
//   const [open, setOpen] = React.useState(false);
//   const [inputs, setInputs] = useState("");
//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setOpen(false)
//     setSelectedRFID("")
//   }
//   // const [isColor, setIsColor] = useState<any>(false);
//   const [selectedRFID, setSelectedRFID] = useState("");
//   const [getRfid, setRfid] = useState([]);
//   const [filteredDriverData, setFilteredDriverData] = useState<any[]>([]);
//   const [confirmModalOpen, setconfirmModalOpen] = React.useState(false);

//   const [formData, setFormDate] = useState({
//     id: "",
//     clientId: session?.clientId,
//     driverNo: "",
//     driverfirstName: "",
//     driverMiddleName: "",
//     driverLastName: "",
//     driverContact: "",
//     driverIdNo: "",
//     driverAddress1: "",
//     driverAddress2: "",
//     driverRFIDCardNumber: "",
//     isAvailabl: "",
//   });
//  const [columns] = useState([
//     {
//       title: "ID",
//       dataIndex: "driverIdNo",
//       key: "driverIdNo",
//       width: 180, // Fixed width for better control
//       ellipsis: {
//         showTitle: false, // Prevents default title attribute, use custom Tooltip
//       },
//       // render: (text) => (
//       //     <Tooltip placement="topLeft" title={text}>
//       //         {text}
//       //     </Tooltip>
//       // ),
//     },
//     {
//       title: "Driver Name",
//       dataIndex: "driverfirstName",
//       key: "driverfirstName",
//       width: 180, // Fixed width
//       ellipsis: {
//         showTitle: false,
//       },
//       render: (text, r) => (
//         // <Tooltip placement="topLeft" title={text}>
//         `${r.driverfirstName} ${r.driverMiddleName} ${r.driverLastName}`


//         // </Tooltip>
//       ),
//     },
//     {
//       title: "Contact",
//       dataIndex: "driverNo",
//       key: "driverNo",
//       width: 100, // Fixed width for consistency
//     },
//     {
//       title: "RFID",
//       dataIndex: "driverRFIDCardNumber",
//       key: "driverRFIDCardNumber",
//       width: 100, // Fixed width
//       ellipsis: {
//         showTitle: false,
//       },
//       render: (text, r) => (
//         <Tooltip placement="topLeft" title={text}>
//           {text}


//         </Tooltip>
//       ),
//     },
//     {
//       title: "User Name",
//       dataIndex: "driverUserName",
//       key: "driverUserName",
//       width: 100, // Fixed width
//     },
//     {
//       title: "Password",
//       dataIndex: "driverPassword",
//       key: "driverPassword",
//       width: 100, // Fixed width
//     },
//     {
//       title: "Address",
//       dataIndex: "driverAddress1",
//       key: "driverAddress1",
//       width: 180, // Fixed width
//       ellipsis: {
//         showTitle: false,
//       },
//       render: (text, r) => (
//         // <Tooltip placement="topLeft" title={text}>
//         `${r.driverAddress1} ${r.driverAddress2}`


//         // </Tooltip>
//       ),
//     },
//     {
//       title: "Availability",
//       dataIndex: "isAvailable",
//       key: "isAvailable",
//       width: 180, // Fixed width
//       ellipsis: {
//         showTitle: false,
//       },
//       render: (text, r) => (
//         // <Tooltip placement="topLeft" title={text}>
//         `${text == true ? "UnAssign" : "Assign"} `


//         // </Tooltip>
//       ),
//     },

//     {
//       title: "Email",
//       dataIndex: "driverEmail",
//       key: "driverEmail",
//       width: 150, // Fixed width
//       ellipsis: {
//         showTitle: false,
//       },
//       render: (text) => (
//         <Tooltip placement="topLeft" title={text}>
//           {text}
//         </Tooltip>
//       ),
//     },

//     // {
//     //           title: "Status",
//     //           dataIndex: "isDeleted",
//     //           key: "isDeleted", // Key should match dataIndex for unique identification
//     //           width: 100, // Fixed width
//     //           render: (status) => {
//     //               let color;
//     //               let text = status==true?"Active":"In Active"
//     //               if(status==true){
//     //                 color = 'processing';
//     //               }else{
//     //                  color = 'gold';
//     //               }

//     //               return <Tag color={color}>{text.toUpperCase()}</Tag>;
//     //           },
//     //       },

//     {
//       title: "Actions",
//       key: "_id",
//       dataIndex: "_id",
//       width: 90, // Fixed width for action buttons
//       fixed: 'right', // Keep actions column visible when scrolling horizontally
//       render: (text, record) => (
//         <div className="flex gap-2 justify-center">
//           {/* Edit Icon */}
//           <FontAwesomeIcon
//             icon={faEdit}
//             className="w-5 h-5 cursor-pointer text-blue-500 hover:text-blue-700 transition-colors"
//             onClick={() => {
//               handleEdit(record)              
//             }}
//           />
          
//           {/* Delete Icon */}
//           <FontAwesomeIcon
//             icon={faToggleOff}
//             className="w-5 h-5 cursor-pointer text-red-500 hover:text-red-700 transition-colors"
//             onClick={() => {
//               if (record.isDeleted == true) {
//                 handleActive(record)
//               } else {
//                 handleDelete(record)
//               }
//               // setId(text);
//               // setDeleteModal(true);
//             }}
//           />
//         </div>
//       ),
//     },
//   ]);
//   const handleChangePage = (event: unknown, newPage: number) => {  
//     setCurrentPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event: any) => {
//     setRowsPerPages(event.target.value);
//     setCurrentPage(0);
//   };

//   const handleChangeDriver = (key: any, e: any) => {
//     setFormDate({ ...formData, [key]: e });
//     setSelectedRFID(e);
//   };

//   const RFid = async () => {
//     try {
//       if (session) {
//         const response = await GetRfIdByClientId({
//           token: session?.accessToken,
//           ClientId: session?.clientId,
//         });
//         setRfid(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching zone data:", error);
//     }
//   };

//   useEffect(() => {
//     vehicleListData();
//     RFid();
//   }, []);

//   const handleDriverSubmit = async (e: any) => {
//     e.preventDefault();

//     if (session) {
//       const newformdata: any = {
//         ...formData,
//         clientId: session?.clientId,
//       };

//       const response = await toast.promise(
//         postDriverDataByClientId({
//           token: session?.accessToken,
//           newformdata: newformdata,
//         }),

//         {
//           loading: "Saving data...",
//           success: "Data saved successfully!",
//           error: "Error saving data. Please try again.",
//         },
//         {
//           style: {
//             border: "1px solid #00B56C",
//             padding: "16px",
//             color: "#1A202C",
//           },
//           success: {
//             duration: 2000,
//             iconTheme: {
//               primary: "#00B56C",
//               secondary: "#FFFAEE",
//             },
//           },
//           error: {
//             duration: 2000,
//             iconTheme: {
//               primary: "#00B56C",
//               secondary: "#FFFAEE",
//             },
//           },
//         }
//       );
//       vehicleListData();
//       RFid();
//     }

//     setFormDate({
//       id: "",
//       clientId: session?.clientId,
//       driverNo: "",
//       driverfirstName: "",
//       driverMiddleName: "",
//       driverLastName: "",
//       driverContact: "",
//       driverIdNo: "",
//       driverAddress1: "",
//       driverAddress2: "",
//       driverRFIDCardNumber: "",
//       isAvailabl: "",
//     });

//   };

//   const vehicleListData = async () => {
//     try {

//       if (session) {
//         const response = await GetDriverDataByClientId({
//           token: session?.accessToken,
//           clientId: session?.clientId,
//         });
//         setDriverData(response.filter((item: any) => item.isDeleted === true));
//         setFilteredDriverData(response.filter((item: any) => item.isDeleted === true));
//       }


//     } catch (error) {
//       console.error("Error fetching zone data:", error);
//     }
//   };
//   useEffect(() => {
//     vehicleListData();
//   }, []);

//   useEffect(() => {
//     const filteredData = DriverData.filter((driver:any) => {
//       return (
//         driver?.driverfirstName?.toLowerCase()?.includes(inputs.toLowerCase()) ||
//         driver?.driverLastName?.toLowerCase()?.includes(inputs.toLowerCase()) ||
//         driver?.driverIdNo?.toLowerCase()?.includes(inputs.toLowerCase()) ||
//         driver?.driverContact?.toLowerCase()?.includes(inputs.toLowerCase()) ||
//         driver?.driverRFIDCardNumber?.toLowerCase()?.includes(inputs.toLowerCase()) ||
//         driver?.driverAddress1?.toLowerCase()?.includes(inputs.toLowerCase())
//       );
//     });
//     setFilteredDriverData(filteredData); // Update filtered data based on search term
//   }, [inputs, DriverData]);

  
//   const handledeletesubmit = async () => {
//     let data = formData
//     const payLoad: any = {
//       id: data.id,
//       driverNo: data.driverNo,
//       driverfirstName: data.driverfirstName,
//       driverMiddleName: data.driverMiddleName,
//       driverLastName: data.driverLastName,
//       driverContact: data.driverContact,
//       driverIdNo: data.driverIdNo,
//       driverAddress1: data.driverAddress1,
//       driverAddress2: data.driverAddress2,
//       driverRFIDCardNumber: data.driverRFIDCardNumber,
//       isAvailable: true,
//       isDeleted: false,
//     };

//     const newformdata = {
//       ...payLoad,
//       clientId: session?.clientId,
//     };

//     const response = await toast.promise(
//       postDriverDataByClientId({
//         token: session?.accessToken,
//         newformdata: newformdata,
//       }),
//       {
//         loading: "Saving data...",
//         success: "User successfully Actived!",
//         error: "Error saving data. Please try again.",
//       },
//       {
//         style: {
//           border: "1px solid #00B56C",
//           padding: "16px",
//           color: "#1A202C",
//         },
//         success: {
//           duration: 2000,
//           iconTheme: {
//             primary: "#00B56C",
//             secondary: "#FFFAEE",
//           },
//         },
//         error: {
//           duration: 2000,
//           iconTheme: {
//             primary: "#00B56C",
//             secondary: "#FFFAEE",
//           },
//         },
//       }
//     );


//     // Refresh vehicle list and RFid data after deletion
//     vehicleListData();
//     RFid();
//     setdataUpdate(true)
//     setconfirmModalOpen(false)
//   }

//   const handleDeletecancel = async () => {
//     setconfirmModalOpen(false)

//   }

//   const handleActive = async (data: any) => {
//     setconfirmModalOpen(true)

//     setFormDate((prevData) => ({
//       ...prevData,
//       ...data,
//     }));
//   }


//   const handleSearch = (event: any) => {
//     const newSearchTerm = event.target.value;
//     setInputs(newSearchTerm);
//   };
//   const AddDriverRfid = () => {
//     setShowCardNumber(!showCardNumber);
//   };
//   const startIndexs: any = currentPage * rowsPerPages;
//   const endIndex: any = startIndexs + rowsPerPages;
//   const result = filteredDriverData.slice(startIndexs, endIndex);
//   return (
//     <div>
//       <Paper>


//         <div className="flex justify-end items-center gap-4 mb-4 mr-4">





//           {/* Search Bar */}
//           <div className="xl:col-span-2 lg:col-span-3 md:col-span-3 sm:col-span-1  border-grayLight text-center lg:mx-5 search_driver" id="hover_bg">
           
//             <div className="max-w-md  ">
//               <label for="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
//               <div className="relative ">
//                 <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
//                   <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
//                     <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
//                   </svg>
//                 </div>
//                 <input type="search" onChange={handleSearch}
//                   value={inputs} id="default-search" className="block outline-none p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg " placeholder="Search" required />
//               </div>
//             </div>

//           </div>

//           {/* Add New Driver Button */}
//           <button
//             onClick={handleOpen}
//             className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px" fill="none" stroke="#ffffff" strokeWidth="2" className="w-5 h-5 inline-block mr-2">
//               <path d="M12 5v14M5 12h14" />
//             </svg>
//             Add New Driver
//           </button>
//         </div>


//         <Modal
//           aria-labelledby="transition-modal-title"
//           aria-describedby="transition-modal-description"
//           open={open}
//           onClose={handleClose}
//           closeAfterTransition
//           slots={{ backdrop: Backdrop }}
//           slotProps={{
//             backdrop: {
//               timeout: 500,
//             },
//           }}
//         >
//           <Fade in={open}>
//             <Box sx={style} className="popup_style">
//               <Typography
//                 id="transition-modal-title"
//                 variant="h6"
//                 component="h2"
//                 className="text-black"
//               >
//                 <div className="grid grid-cols-12 bg-green">
//                   <div className="lg:col-span-11 md:col-span-11 sm:col-span-10 col-span-10">
//                     <p className="p-3 text-white w-full font-popins font-bold ">
//                       Add Driver
//                     </p>
//                   </div>
//                   <div className="col-span-1 ms-5" onClick={handleClose}>
//                     <svg
//                       className="h-6 w-6 text-white mt-3 cursor-pointer"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       strokeWidth="2"
//                       stroke="currentColor"
//                       fill="none"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       {" "}
//                       <path stroke="none" d="M0 0h24v24H0z" />{" "}
//                       <line x1="18" y1="6" x2="6" y2="18" />{" "}
//                       <line x1="6" y1="6" x2="18" y2="18" />
//                     </svg>
//                   </div>
//                 </div>
//               </Typography>
//               <form onSubmit={handleDriverSubmit}>
//                 <Typography id="transition-modal-description" sx={{ mt: 2 }}>
//                   <div className="grid grid-cols-12 mx-2 ">
//                     <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
//                       <label className="text-sm text-black font-popins font-medium">
//                         <span className="text-red">*</span> First Name
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.driverfirstName}
//                         className="border border-grayLight w-full outline-green hover:border-green transition duration-700 ease-in-out "
//                         onChange={(e: any) => {
//                           handleChangeDriver("driverfirstName", e.target.value)
//                         }}
//                       />
//                     </div>
//                     <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
//                       <label className="text-sm text-black font-popins font-medium">
//                         <span className="text-red">*</span> Last Name
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.driverLastName}
//                         className="border border-grayLight w-full  outline-green hover:border-green transition duration-700 ease-in-out "
//                         onChange={(e: any) =>
//                           handleChangeDriver("driverLastName", e.target.value)
//                         }
//                       />
//                     </div>
//                     <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
//                       <label className="text-sm text-black font-popins font-medium">
//                         <span className="text-red">*</span> Driver Contact
//                       </label>
//                       <input
//                         value={formData.driverContact}
//                         type="text"
//                         className="border border-grayLight w-full  outline-green hover:border-green transition duration-700 ease-in-out "
//                         onChange={(e: any) => {
//                           const value = e.target.value.match(/\d+/g);
//                           if (value) {
//                             const numberOnly = value.join("");
//                             handleChangeDriver("driverContact", numberOnly);
//                           } else {
//                             handleChangeDriver("driverContact", "");
//                           }
//                         }}
//                       />
//                     </div>
//                     <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
//                       <label className="text-sm text-black font-popins font-medium">
//                         <span className="text-red">*</span> Driver ID
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.driverIdNo}
//                         className="border border-grayLight w-full outline-green hover:border-green transition duration-700 ease-in-out "
//                         onChange={(e: any) => {
//                           const value = e.target.value.match(/\d+/g);
//                           if (value) {
//                             const numericValue = value.join(""); // Join the array into a single string
//                             handleChangeDriver("driverIdNo", numericValue);
//                           } else {
//                             handleChangeDriver("driverIdNo", "");
//                           }
//                         }}

//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-12 m-2  ">
//                     <div className="lg:col-span-6 md:col-span-6 col-span-6   mx-2">
//                       <label className="text-sm text-black font-popins font-medium">
//                         Address
//                       </label>
//                       <br></br>
//                       <textarea
//                         value={formData?.driverAddress1}
//                         className="w-full border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out h-16 "
//                         onChange={(e: any) =>
//                           handleChangeDriver("driverAddress1", e.target.value)
//                         }
//                       ></textarea>
//                     </div>
//                     <div className="lg:col-span-4 md:col-span-4 col-span-6 mx-2 ">
//                       <div
//                         className="grid grid-cols-12  "
//                       // style={{ display: "flex", justifyContent: "start" }}
//                       >
//                         <div className="lg:col-span-3 col-span-1 w-full ">
//                           <label className="text-sm text-black font-popins font-medium "></label>
//                           RFID
//                           <input
//                             type="checkbox"
//                             onClick={AddDriverRfid}
//                             style={{ accentColor: "green" }}
//                             className="border border-green outline-green cursor-pointer ms-2"
//                           />
//                         </div>
//                         {showCardNumber ? (
//                           <div
//                             className="lg:col-span-12 col-span-12 -mt-2"
//                             style={{ width: "100%" }}
//                           >
//                             <label className="text-sm text-black font-popins font-medium">
//                               Card Number
//                             </label>
//                             <br></br>

//                             <Select
//                               onChange={(e: any) =>
//                                 handleChangeDriver(
//                                   "driverRFIDCardNumber",
//                                   e.target.value
//                                 )
//                               }
//                               value={selectedRFID}
//                               style={{ width: "100%" }}
//                               className="h-6 w-full  border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-outoutline-none color-gray"
//                               displayEmpty
//                             >
//                               <MenuItem
//                                 value={
//                                   formData.driverfirstName ||
//                                   formData.driverLastName ||
//                                   formData.driverNo ||
//                                   formData.driverIdNo ||
//                                   formData.driverAddress1 ||
//                                   ""
//                                 }
//                                 selected
//                                 hidden
//                                 disabled
//                               >
//                                 Select RFID
//                               </MenuItem>
//                               {getRfid.map(
//                                 (item: any) =>
//                                   item.DriverId == "" && (
//                                     <MenuItem
//                                       key={item?.RFIDCardNo}
//                                       value={item?.RFIDCardNo}
//                                       className="assign_driver_hover"
//                                     >
//                                       {item?.RFIDCardNo}
//                                     </MenuItem>
//                                   )
//                               )}
//                             </Select>
//                           </div>
//                         ) : (
//                           ""
//                         )}
//                       </div>
//                     </div>
//                     <div className="lg:col-span-2 md:col-span-2 col-span-4  px-3 lg:-mt-0 md:-mt-0 sm:-mt-0  -mt-8">
//                       <button
//                         className="bg-green text-white font-bold font-popins  w-full  py-2  rounded-md shadow-md  hover:shadow-gray transition duration-500"
//                         type="submit"
//                         style={{
//                           float: "right",
//                           marginTop: "40%",
//                           cursor:
//                             formData.driverfirstName.trim() === "" ||
//                               formData.driverLastName.trim() === "" ||
//                               formData.driverContact.trim() === ""
//                               ? "not-allowed"
//                               : "",
//                         }}
//                         disabled={
//                           formData.driverfirstName.trim() === "" ||
//                             formData.driverLastName.trim() === "" ||
//                             formData.driverContact.trim() === ""
//                             ? true
//                             : false
//                         }
//                       >
//                         Submit
//                       </button>
//                     </div>
//                   </div>
//                 </Typography>
//               </form>
//             </Box>
//           </Fade>
//         </Modal>

// <Table
//               // rowSelection={{ type: "checkbox", ...rowSelection }}
//               columns={columns}
//               dataSource={filteredDriverData
//                 }
//               rowKey="_id"              
//               className="antd-responsive-table"
//               size="middle"
//               bordered 
//               pagination={{ 
//                 pageSize: 10,
//                 showSizeChanger: true,
//                 pageSizeOptions: ['10', '20', '50', '100'],
//                 showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
//               }}
//             />
//       </Paper>


//       {confirmModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-lg w-full sm:w-1/3 z-10 max-w-lg">
//             <div className="flex items-center mb-4">
//               <div className="bg-green-500 text-white rounded-full mr-2">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="#ffffff"
//                   width="40px"
//                   height="40px"
//                   viewBox="0 0 1920.00 1920.00"
//                   stroke="#ffffff"
//                   strokeWidth="5.76"
//                 >
//                   <g id="SVGRepo_bgCarrier" strokeWidth="0">
//                     <rect
//                       x="0"
//                       y="0"
//                       width="1920.00"
//                       height="1920.00"
//                       rx="960"
//                       fill="#00B56C"
//                     />
//                   </g>
//                   <g id="SVGRepo_iconCarrier">
//                     <path
//                       d="M960 0c530.193 0 960 429.807 960 960s-429.807 960-960 960S0 1490.193 0 960 429.807 0 960 0Zm0 101.053c-474.384 0-858.947 384.563-858.947 858.947S485.616 1818.947 960 1818.947 1818.947 1434.384 1818.947 960 1434.384 101.053 960 101.053Zm-42.074 626.795c-85.075 39.632-157.432 107.975-229.844 207.898-10.327 14.249-10.744 22.907-.135 30.565 7.458 5.384 11.792 3.662 22.656-7.928 1.453-1.562 1.453-1.562 2.94-3.174 9.391-10.17 16.956-18.8 33.115-37.565 53.392-62.005 79.472-87.526 120.003-110.867 35.075-20.198 65.9 9.485 60.03 47.471-1.647 10.664-4.483 18.534-11.791 35.432-2.907 6.722-4.133 9.646-5.496 13.23-13.173 34.63-24.269 63.518-47.519 123.85l-1.112 2.886c-7.03 18.242-7.03 18.242-14.053 36.48-30.45 79.138-48.927 127.666-67.991 178.988l-1.118 3.008a10180.575 10180.575 0 0 0-10.189 27.469c-21.844 59.238-34.337 97.729-43.838 138.668-1.484 6.37-1.484 6.37-2.988 12.845-5.353 23.158-8.218 38.081-9.82 53.42-2.77 26.522-.543 48.24 7.792 66.493 9.432 20.655 29.697 35.43 52.819 38.786 38.518 5.592 75.683 5.194 107.515-2.048 17.914-4.073 35.638-9.405 53.03-15.942 50.352-18.932 98.861-48.472 145.846-87.52 41.11-34.26 80.008-76 120.788-127.872 3.555-4.492 3.555-4.492 7.098-8.976 12.318-15.707 18.352-25.908 20.605-36.683 2.45-11.698-7.439-23.554-15.343-19.587-3.907 1.96-7.993 6.018-14.22 13.872-4.454 5.715-6.875 8.77-9.298 11.514-9.671 10.95-19.883 22.157-30.947 33.998-18.241 19.513-36.775 38.608-63.656 65.789-13.69 13.844-30.908 25.947-49.42 35.046-29.63 14.559-56.358-3.792-53.148-36.635 2.118-21.681 7.37-44.096 15.224-65.767 17.156-47.367 31.183-85.659 62.216-170.048 13.459-36.6 19.27-52.41 26.528-72.201 21.518-58.652 38.696-105.868 55.04-151.425 20.19-56.275 31.596-98.224 36.877-141.543 3.987-32.673-5.103-63.922-25.834-85.405-22.986-23.816-55.68-34.787-96.399-34.305-45.053.535-97.607 15.256-145.963 37.783Zm308.381-388.422c-80.963-31.5-178.114 22.616-194.382 108.33-11.795 62.124 11.412 115.76 58.78 138.225 93.898 44.531 206.587-26.823 206.592-130.826.005-57.855-24.705-97.718-70.99-115.729Z"
//                       fillRule="evenodd"
//                     />
//                   </g>
//                 </svg>
//               </div>
//               <h2 className="text-xl sm:text-lg font-semibold">
//                 Confirm Update
//               </h2>
//             </div>
//             <p>

//               Are you sure you want to Activate this Driver?

//             </p>

//             {/* Modal Buttons */}
//             <div className="mt-4 text-right">
//               <button
//                 onClick={handleDeletecancel}
//                 className="bg-[#d1d5db] px-4 py-2 rounded mr-2 hover:bg-[#e5e7eb]"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handledeletesubmit}
//                 className="bg-[#00B56C] text-white px-4 py-2 rounded hover:bg-[#4ade80]"
//               >
//                 Yes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}


//       <Toaster position="top-center" reverseOrder={false} />
//     </div>
//   );
// }

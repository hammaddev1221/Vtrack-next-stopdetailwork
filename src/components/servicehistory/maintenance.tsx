"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
// import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
/* import Select from "react-select";
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns"; // Correcting to DateFnsUtils
import EventIcon from "@material-ui/icons/Event"; // Event icon for calendar */
import { handleServiceHistoryRequest } from "@/utils/API_CALLS";
/* import { format } from 'date-fns'; // Import format from date-fns */
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

export default function Maintenance({ maintenancedata, singleVehicleDetail }: any) {
  const { data: session } = useSession();

  const [modalOpen, setModalOpen] = useState(false);
  // const [updateData, setupdateData] = useState(false);
  const [fetchedMaintencebyVehicle, setfetchedMaintencebyVehicle] = useState([]);
  const initialFormData = {
    id: "",
    clientId: singleVehicleDetail?.clientId,
    vehicleId: singleVehicleDetail?._id,
    serviceTitle: "",
    dataType: "",
    maintenanceType: "",
    cost: 0,
  }

  const [formData, setFormData] = useState(initialFormData);


  useEffect(() => {
    const d = maintenancedata.filter((item) => item.vehicleId === singleVehicleDetail?._id);
    setfetchedMaintencebyVehicle(d);
    setFormData((prevData) => ({
      ...prevData,
      clientId: singleVehicleDetail?.clientId,
      vehicleId: singleVehicleDetail?._id,
      dataType: "Maintenance"
    }));

  }, [maintenancedata]);

  // Effect to fetch services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServicesFromAPI();
        if (fetchedServices.length > 0) {
          const filteredServices = fetchedServices?.filter(
            (service: any) => service.dataType === 'Maintenance' && service.vehicleId === singleVehicleDetail?._id
          );
          setfetchedMaintencebyVehicle(filteredServices);

        } else {
          setfetchedMaintencebyVehicle([]);
        }
      } catch (error) {
        toast.error("Failed to load services.");
      } finally {

      }
    };
    loadServices();
  }, []);


  const fetchServicesFromAPI = async () => {
    if (session) {
      try {
        const Data = await handleServiceHistoryRequest({
          token: session?.accessToken,
          method: "GET",
        });

        return Data;
        // setupdateData(!updateData)
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };

  const loadServices = async () => {
    try {
      const fetchedServices = await fetchServicesFromAPI();
      if (fetchedServices.length > 0) {
        const filteredServices = fetchedServices?.filter(
          (service: any) => service.dataType === 'Maintenance' && service.vehicleId === singleVehicleDetail?._id
        );
        setfetchedMaintencebyVehicle(filteredServices);
      } else {
        setfetchedMaintencebyVehicle([]);
      }
    } catch (error) {
      toast.error("Failed to load services.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id == "") {
      const Data = await handleServiceHistoryRequest({
        token: session?.accessToken,
        method: "POST",
        body: formData,
      });

      if (Data.success == true) {
        toast.success(Data.message);
        setModalOpen(false);
        setCost(null)
        setFormData((prev) => ({
          ...prev,
          id: "",
          cost: 0,
          maintenanceType: "",
          serviceTitle: ""
        }));
        await loadServices()
      }
    }
    else {
      const Data = await handleServiceHistoryRequest({
        token: session?.accessToken,
        method: "PUT",
        body: formData,
      });

      if (Data.success == true) {
        toast.success(Data.message);
        setModalOpen(false);
        setCost(null)
        setFormData((prev) => ({
          ...prev,
          id: "",
          cost: 0,
          maintenanceType: "",
          serviceTitle: ""
        }));
        await loadServices()
      }
    }


  }

  // const openUpdateModal = (service: any) => {


  //   //  setFormData(service);
  //   if (service.dataType === "Maintenance") {
  //     let payload = {
  //       id: service._id,
  //       clientId: service.clientId,
  //       vehicleId: service.vehicleId,
  //       dataType: "Maintenance",
  //       serviceTitle: service.serviceTitle,
  //       maintenanceType: service.maintenanceType
  //     }

  //     setFormData(payload);
  //     setModalOpen(true);
  //   }
  // }

  const handledelete = async (id) => {

    const Data = await handleServiceHistoryRequest({
      token: session?.accessToken,
      method: "DELETE",
      body: id,
    });

    if (Data.success == true) {
      toast.success(Data.message);
      setFormData((prev) => ({
        ...prev,
        id: "",
        maintenanceType: "",
        serviceTitle: ""
      }));
      await loadServices()
    }
  }


  const [selectedColumns, setSelectedColumns] = useState([
    "Service Task",
    "Vehicle Reg",
    "Maintenance Type",
    "Created Date",
    "Cost"

  ]);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const columnDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) &&
        (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target))
      ) {
        setColumnDropdownOpen(false);
        setExportDropdownOpen(false);
      }
    };

    // Add event listener on mount
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const columns = [
    { key: "serviceTitle", label: "Service Task" },
    { key: "vehicleReg", label: "Vehicle Reg" },
    { key: "maintenanceType", label: "Maintenance Type" },

    { key: "createdAt", label: "Created Date" },
    { key: "cost", label: "Cost" },

  ];

  const handleColumnSelection = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleDownloadCSV = () => {
    // Conditionally include "Created Date" in the header based on the existence of service.file
    const includeCreatedDate = fetchedMaintencebyVehicle.some((service) => service.file);

    const columnsWithCreatedDate = includeCreatedDate
      ? ["Work Order", ...selectedColumns, "Created Date"]
      : ["Work Order", ...selectedColumns]; // Add "Created Date" if file exists in any service

    // Generate CSV data
    const data = fetchedMaintencebyVehicle.map((row, index) =>
      columnsWithCreatedDate.reduce((acc, col) => {
        const columnKey = columns.find((c) => c.label === col)?.key || col;

        if (col === "Work Order") {
          acc[col] = index + 1; // Work Order column
        } else if (col === "Created Date") {
          // If "Created Date", check if service.file exists and include the date or an empty value
          acc[col] = row.file ? new Date(row.createdAt).toISOString().split('T')[0] : "";
        } else {
          // Otherwise, map to the respective column value
          acc[col] = row[columnKey] || "";
        }

        return acc;
      }, {})
    );

    // Create CSV content with the modified columns
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [columnsWithCreatedDate.join(","), ...data.map((row) => columnsWithCreatedDate.map((col) => row[col]).join(","))].join("\n");

    // Create a download link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const handleDownloadPDF = () => {

    const doc = new jsPDF();

    const logoBase64 = "data:image/png;base64,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"

    const vehicleReg = singleVehicleDetail.vehicleReg || "N/A";
    // Header Background
    doc.setFillColor("#00B56C");
    doc.rect(0, 15, 210, 17, "F"); // Green background
    // Add logo
    doc.addImage(logoBase64, "PNG", 15, 15, 40, 15); // Adjust position and size
    // Metadata
    doc.setFontSize(12);
    doc.setTextColor("#000000");
    doc.text("Report Type:", 15, 40);
    doc.text("Maintenance", 43, 40);

    doc.text("Vehicle:", 120, 40);
    doc.text(vehicleReg, 139, 40);

    /*  const tableData = fetchedMaintencebyVehicle.map((row, index) => [
       index + 1, // Work Order
       ...columns
         .filter((col) => selectedColumns.includes(col.label))
         .map((col) => row[col.key] || ""),
     ]); */

    /*  const tableColumns = [
       "Work Order",
       ...columns.filter((col) => selectedColumns.includes(col.label)).map((col) => col.label),
     ]; */
    // Filter columns based on selectedColumns
    const filteredColumns = columns.filter((col) => selectedColumns.includes(col.label));

    // Check if the service has a file and modify selectedColumns accordingly
    const tableColumns = [
      "Work Order",
      ...filteredColumns.map((col) => col.label),
    ];

    const tableData = fetchedMaintencebyVehicle.map((service, index) => [
      index + 1, // Work Order
      ...filteredColumns.map((col) => {
        // For "Created Date", we check if service.file exists to conditionally render the date
        if (col.key === "createdAt") {
          return service.file ? new Date(service.createdAt).toISOString().split('T')[0] : ""; // If file exists, show date
        }
        return service[col.key] || ""; // Default case: render other column data
      }),
    ]);

    autoTable(doc,{
      head: [tableColumns],
      body: tableData,
      startY: 50, // Adjust starting position
      theme: "grid",
      headStyles: {
        fillColor: "#00A651", // Green background for headers
        textColor: "#ffffff",
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: "#000000",
        cellPadding: 3, // Increase padding inside cells (adjust as needed)
      },
      // columnStyles: columnWidths, // Apply custom column widths here
      alternateRowStyles: {
        fillColor: "#F5F5F5",
      },
    });

    doc.save("report.pdf");

  };


  const [cost, setCost] = useState(null);



  const handleCostChange = (value) => {

    setCost(value);

    setFormData((prevData) => ({
      ...prevData,
      cost: value
    }));

  };


  return (
    <>
      {/* <button
        onClick={() => setModalOpen(true)}
        className="ml-auto mb-4 px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
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
        Add Maintenance
      </button> */}

      <div className="flex justify-end items-center gap-4 mb-4">
        {/* Attach Service Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20px"
            height="20px"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            className="w-5 h-5 inline-block mr-2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Maintenance
        </button>

        {/* Select Columns Button */}
        <div className="relative" ref={columnDropdownRef}>
          <button
            onClick={() => {
              setColumnDropdownOpen(!columnDropdownOpen)
              setExportDropdownOpen(false)

            }}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white transition-all"
          >
            Select Columns
          </button>
          {columnDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <ul>
                {columns.map((col) => (
                  <li key={col.key} className="flex items-center px-4 py-2 hover:bg-[#E5E7EB] cursor-pointer " onClick={() => handleColumnSelection(col.label)}>
                    <input
                      type="checkbox"
                      style={{ accentColor: "green" }}
                      checked={selectedColumns.includes(col.label)}
                      onChange={() => handleColumnSelection(col.label)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{col.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="relative" ref={exportDropdownRef}>
          <button
            onClick={() => {
              setColumnDropdownOpen(false)
              setExportDropdownOpen(!exportDropdownOpen)

            }}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white  transition-all"
          >
            Export
          </button>
          {exportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <ul>
                <li
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-[#e5e7eb] cursor-pointer"
                >
                  Export to CSV
                </li>
                <li
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-[#e5e7eb] cursor-pointer"
                >
                  Export to PDF
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="min-w-full table-auto  w-full">
              <thead className="bg-[#E2E8F0]">
                <tr>
                  <th className="px-2 py-1  text-center">Work Order</th>
                  {columns
                    .filter((col) => selectedColumns.includes(col.label))
                    .map((col) => (
                     
                       <th key={col.key} className="px-2 py-1 text-center">
                       {col.key === 'cost'
                         ? `${col.label} (${session?.currency})`
                         : col.label}
                     </th>

                    ))}
                  <th className="px-2 py-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetchedMaintencebyVehicle.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-2 text-center text-gray-500">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  fetchedMaintencebyVehicle.map((service, index) => (
                    <tr key={service._id}>
                      {/* Work Order */}
                      <td className="px-2 py-1 text-center border-b">{index + 1}</td>

                      {/* Dynamic Columns */}
                      {columns
                        .filter((col) => selectedColumns.includes(col.label))
                        .map((col) => (
                          <td key={col.key} className={`px-2 py-1 border-b text-center break-words ${col.key === "serviceTitle" ? "justify-start" : "text-center"} `}>
                            {
                              // Apply your condition for specific columns here
                              col.key === "maintenanceType" ? (
                                service.file ? ("-") : (service.maintenanceType)  // If 'file' exists, show "-" else show 'maintenanceType'
                              ) : col.key === "createdAt" ? (
                                service.file ? (new Date(service.createdAt).toISOString().split('T')[0]) : ("-")  // If 'file' exists, show date
                              )
                              : col.key === "cost" ? (
                                service.cost ? service?.cost : ("-")  // If 'file' exists, show date
                              )
                              : (
                                service[col.key]  // Default case: just render the column data
                              )
                            }
                          </td>
                        ))
                      }

                      {/* Action */}
                      <td className="w-[180px] border-b">
                        <div className="flex justify-end mr-[100px]  gap-2 items-center">

                          {service.file && service.file != "null" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              viewBox="0 0 32 32"
                              xmlSpace="preserve"
                              width="20"
                              height="20"
                              onClick={() => window.open(service.file, "_blank")}
                              className="cursor-pointer "
                            >
                              <style type="text/css">
                                {`
              .st0 {
                fill: none;
                stroke: #000000;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-miterlimit: 10;
              }
            `}
                              </style>
                              <path className="st0" d="M29,16c0,0-5.8,8-13,8S3,16,3,16s5.8-8,13-8S29,16,29,16z" />
                              <circle className="st0" cx="16" cy="16" r="4" />
                            </svg>
                          )}
                          <svg
                            className="w-5 h-5  cursor-pointer"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.0"
                            width="512.000000pt"
                            height="512.000000pt"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
                            onClick={() => handledelete(service._id)}
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

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/*  <div className="relative">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
           


            <table className="min-w-full table-auto">
              <thead className="bg-[#E2E8F0]">
                <tr>
                  <th className="px-2 py-1 text-center w-[130px]">Work Order</th>
                  <th className="px-2 py-1 text-left">Service Task</th>
                  <th className="px-2 py-1 text-left">Vehicle Reg	</th>
                  <th className="px-2 py-1 text-left">Maintenance Type</th>
                  <th className="px-2 py-1 text-left ">Created Date</th>
                  <th className="px-2 py-1 text-center w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(fetchedMaintencebyVehicle.length === 0) ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  fetchedMaintencebyVehicle.map((service, index) => (
                    <tr key={service._id}>
                      <td className="px-2 py-1 text-center">{index + 1}</td>
                      <td className="px-2 py-1">{service.serviceTitle}</td>
                      <td className="px-2 py-1">{service.vehicleReg}</td>
                      <td className="px-2 py-1">{service.file ? ("-") : (service.maintenanceType)} </td>
                      <td className="px-2 py-1">{service.file ? (new Date(service.createdAt).toISOString().split('T')[0]) : ("")}  </td> 


                      <td className="w-[180px]">
                        <div className="flex justify-end mr-14  gap-2 items-center">

                          {service.file && service.file != "null" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              viewBox="0 0 32 32"
                              xmlSpace="preserve"
                              width="23"
                              height="23"
                              onClick={() => window.open(service.file, "_blank")}
                              className="cursor-pointer hover:shadow-lg"
                            >
                              <style type="text/css">
                                {`
              .st0 {
                fill: none;
                stroke: #000000;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-miterlimit: 10;
              }
            `}
                              </style>
                              <path className="st0" d="M29,16c0,0-5.8,8-13,8S3,16,3,16s5.8-8,13-8S29,16,29,16z" />
                              <circle className="st0" cx="16" cy="16" r="4" />
                            </svg>
                          )}
                          <svg
                            className="w-4 h-4 text-red-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.0"
                            width="512.000000pt"
                            height="512.000000pt"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
                            onClick={() => handledelete(service._id)}
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

                        </div>
                      </td>





                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>

        </div>
      </div> */}

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white p-6 rounded-lg w-[30rem]`}>
              <h3 className="text-xl font-bold mb-4 text-center">
                Add Maintenance
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Maintenance Task
                  </label>
                  <input
                    type="text"
                    name="serviceTitle"
                    value={formData.serviceTitle}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-[#CBD5E0] rounded-lg "
                    placeholder="Oil Changing / Tuning, etc."

                  />
                </div>

                <label className="block text-sm font-medium mb-2 ml-2 mr-[30px]">Cost</label>

                <div className="flex items-center mb-4 pl-2">
                  <div className="flex items-center border border-[#e4e4e7] rounded-lg w-[150px]">

                    <input

                      value={cost || ""}
                      onChange={(e) => handleCostChange(Number(e.target.value))}
                      placeholder="Cost"
                      className="p-2 w-full border-none focus:outline-none"
                      style={{
                        appearance: 'none',        // Hides arrows in most browsers
                        MozAppearance: 'textfield', // Firefox-specific
                        WebkitAppearance: 'none',   // Chrome/Safari-specific
                        margin: 0                  // Ensures there's no margin from the arrows
                      }}
                    />
                    {/* <input id="phone" value={cost || ""}
onChange={(e) => handleCostChange(Number(e.target.value))}
className="p-2 w-full border-none" placeholder="Cost" required />
*/}

                    <div className="flex items-center justify-center  text-black w-12 h-10 rounded-md px-2">
                      {/* Display the currency symbol in a circle */}
                      <span className="text-xl">{session?.currency}</span>
                    </div>
                  </div>
                </div>






                <div>
                  <label className="block text-sm font-medium">
                    Maintenance Type

                  </label>

                  <div className="mb-4 ml-2 flex items-center">
                    <input
                      type="radio"
                      style={{ accentColor: "green" }}

                      name="maintenance"
                      checked={formData.maintenance === "" ? false : formData.maintenanceType === "Preventative"}

                      onChange={() =>
                        setFormData({
                          ...formData,
                          maintenanceType: "Preventative"
                        })
                      }
                      className="mr-2"
                    />
                    <label>Preventive maintenance</label>
                  </div>
                  <div className="mb-4 ml-2 flex items-center">
                    <input
                      type="radio"
                      style={{ accentColor: "green" }}

                      name="maintenance"
                      checked={formData.maintenance === "" ? false : formData.maintenanceType === "Corrective"}

                      onChange={() =>
                        setFormData({
                          ...formData,
                          maintenanceType: "Corrective"
                        })
                      }
                      className="mr-2"
                    />
                    <label>Corrective maintenance</label>
                  </div>

                </div>






                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false); // Close the modal
                      setFormData((prevData) => ({
                        ...prevData,
                        serviceTitle: "",
                        cost: 0,
                        maintenanceType: ""
                      }));
                      setCost(null)
                      /*   seteditModal(false);
                        setTimeValue(null)
                        setFile(null)
                        setFormData(initialFormData); // Reset form data to initial state
                        setselectedserviceDocuments([]) */
                      /*    setFormData(initialFormData)
                         setSelectedDocumentsForAttach([]) */
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
        </>
      )}
    </>
  )
}


/* 





*/
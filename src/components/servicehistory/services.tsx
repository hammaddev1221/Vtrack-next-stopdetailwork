"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Select from "react-select";
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns"; // Correcting to DateFnsUtils
import EventIcon from "@material-ui/icons/Event"; // Event icon for calendar
import { handleServiceHistoryRequest, handleServicesRequest, handleServiceStatus } from "@/utils/API_CALLS";
/* import { format } from 'date-fns'; // Import format from date-fns */
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

export default function Service({ servicedata, singleVehicleDetail }: any) {
  const { data: session } = useSession();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setconfirmModalOpen] = useState(false);
  const [serviceDataforupdate, setserviceDataforupdate] = useState();
  const [EditmodalOpen, setEditmodalOpen] = useState(false);
  // const [updateData, setupdateData] = useState(false);

  const [fetchedservicebyVehicle, setfetchedservicebyVehicle] = useState([]);
  const initialServiceFormData = {
    id: "",
    clientId: '',
    vehicleId: '',
    serviceTitle: [],
    reminderDate: 0,
    reminderMilage: 0,
    expiryDate: 0,
    expiryMilage: 0,
    lastMilage: 0,
    lastDate: 0,
    cost: 0,
    dataType: '',
    sms: false,
    email: false,
    pushnotification: false,
    isExpiryDateSelected: false,
    isExpiryMileageSelected: false,
    isReminderDateSelected: false,
    isReminderMileageSelected: false,
    isLastDateSelected: false,
    isLastMileageSelected: false,

  };
  const [serviceFormData, setServiceFormData] = useState(initialServiceFormData);

  const [selectedDocumentsForService, setselectedDocumentsForService] = useState([]);
  const [selectedDocumentsForserviceAttach, setselectedDocumentsForserviceAttach] = useState(
    []
  );


  useEffect(() => {
    const d = servicedata.filter((item) => item.vehicleId === singleVehicleDetail?._id);
    setfetchedservicebyVehicle(d);
    setServiceFormData((prevData) => ({
      ...prevData,
      clientId: singleVehicleDetail?.clientId,
      vehicleId: singleVehicleDetail?._id,
      dataType: "Service"
    }));

  }, [servicedata]);

  // Effect to fetch services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServicesFromAPI();
        if (fetchedServices.length > 0) {
          const filteredServices = fetchedServices?.filter(
            (service: any) => service.dataType === 'Service' && service.vehicleId === singleVehicleDetail?._id
          );
          setfetchedservicebyVehicle(filteredServices);

        } else {
          setfetchedservicebyVehicle([]);
        }
      } catch (error) {
        toast.error("Failed to load services.");
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const fetchedDocuments = await fetchserviceDocumentsFromAPI();

        if (fetchedDocuments.length > 0) {
          setselectedDocumentsForService(fetchedDocuments);

        } else {
          setselectedDocumentsForService([]); // Empty data set

        }
      } catch (error) {
        toast.error("Failed to load documents.");
        setselectedDocumentsForService([]); // In case of error, set to empty
      }
    };
    loadDocuments();
  }, []);



  const fetchserviceDocumentsFromAPI = async () => {
    if (session) {
      try {
        const Data = await handleServicesRequest({
          token: session?.accessToken,
          method: "GET",
        });

        return Data.data;
        //   setupdateData(!updateData)
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };




  const handleDocumentsChangeForDocumenttab = (selectedOption) => {
    if (selectedOption) {
      // Add selected document if not already selected
      if (!selectedDocumentsForserviceAttach.some((doc) => doc._id === selectedOption._id)) {
        setselectedDocumentsForserviceAttach([...selectedDocumentsForserviceAttach, selectedOption]);
      }
    }
  };


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
          (service: any) => service.dataType === 'Service' && service.vehicleId === singleVehicleDetail?._id
        );
        setfetchedservicebyVehicle(filteredServices);
      } else {
        setfetchedservicebyVehicle([]);
      }
    } catch (error) {
      toast.error("Failed to load services.");
    }
  };

  const handleRemoveDocumentForDocumenttab = (documentId) => {
    setselectedDocumentsForserviceAttach((prev) =>
      prev.filter((doc) => doc._id !== documentId)
    );
  };

  const validateForm = () => {
    // Check if any checkbox is selected and the corresponding field is empty
    if (
      (serviceFormData.isReminderDateSelected && !serviceFormData.reminderDate) ||
      (serviceFormData.isReminderMileageSelected && !serviceFormData.reminderMilage) ||
      (serviceFormData.isExpiryDateSelected && !serviceFormData.expiryDate) ||
      (serviceFormData.isExpiryMileageSelected && !serviceFormData.expiryMilage) ||
      (serviceFormData.isLastDateSelected && !serviceFormData.lastDate) ||
      (serviceFormData.isLastMileageSelected && !serviceFormData.lastMilage)
    ) {
      toast.error("Please fill all the required fields based on your selections.");
      return false;
    }
    if (serviceFormData.isExpiryMileageSelected && Number(singleVehicleDetail.odometer1?.split(" ")[0]) >= serviceFormData.expiryMilage) {
      toast.error(`Expiry Milage must be greater than ${Number(singleVehicleDetail.odometer1?.split(" ")[0])}`);
      return false;
    }

    if (serviceFormData.isReminderMileageSelected && Number(singleVehicleDetail.odometer1?.split(" ")[0]) >= serviceFormData.reminderMilage) {
      toast.error(`Reminder Milage must be greater than ${Number(singleVehicleDetail.odometer1?.split(" ")[0])}`);
      return false;
    }

    // If all required fields are filled
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Proceed with form submission or any other logic



      if (serviceFormData.id == "") {
        const documentData = selectedDocumentsForserviceAttach.map(item => String(item.service));
        const payload = {

          clientId: serviceFormData.clientId,
          vehicleId: serviceFormData.vehicleId,
          pushnotification: serviceFormData.pushnotification,
          sms: serviceFormData.sms,
          email: serviceFormData.email,
          serviceTitle: documentData,
          reminderDate: serviceFormData.isReminderDateSelected ? serviceFormData.reminderDate : "",
          reminderMilage: serviceFormData.isReminderMileageSelected ? serviceFormData.reminderMilage : "",
          expiryDate: serviceFormData.isExpiryDateSelected ? serviceFormData.expiryDate : "",
          expiryMilage: serviceFormData.isExpiryMileageSelected ? serviceFormData.expiryMilage : "",
          lastDate: serviceFormData.isLastDateSelected ? serviceFormData.lastDate : "",
          lastMilage: serviceFormData.isLastMileageSelected ? serviceFormData.lastMilage : "",
          dataType: "Service",
          cost: serviceFormData.cost

        }

        const Data = await handleServiceHistoryRequest({
          token: session?.accessToken,
          method: "POST",
          body: payload,
        });

        if (Data.success == true) {
          toast.success(Data.message);
          setModalOpen(false);
          // setCost(null)
          setEditmodalOpen(false)
          setselectedDocumentsForserviceAttach([])
          setServiceFormData((prev) => ({
            ...prev, // Correctly spreading the previous state
            id: "",
            serviceTitle: [], // Setting `serviceTitle` to an empty array
            reminderDate: 0,
            reminderMilage: 0,
            expiryDate: 0,
            expiryMilage: 0,
            lastMilage: 0,
            lastDate: 0,
            dataType: '',
            sms: false,
            email: false,
            pushnotification: false,
            isExpiryDateSelected: false,
            isExpiryMileageSelected: false,
            isReminderDateSelected: false,
            isReminderMileageSelected: false,
            isLastDateSelected: false,
            isLastMileageSelected: false,
            cost: 0,
          }));
          await loadServices()
        }
        else {
          toast.error(Data.message);
        }
      }
      else {

        const payload = {
          id: serviceFormData.id,
          clientId: serviceFormData.clientId,
          vehicleId: serviceFormData.vehicleId,
          pushnotification: serviceFormData.pushnotification,
          sms: serviceFormData.sms,
          email: serviceFormData.email,
          serviceTitle: serviceFormData.serviceTitle,
          reminderDate: serviceFormData.isReminderDateSelected ? serviceFormData.reminderDate : "",
          reminderMilage: serviceFormData.isReminderMileageSelected ? serviceFormData.reminderMilage : "",
          expiryDate: serviceFormData.isExpiryDateSelected ? serviceFormData.expiryDate : "",
          expiryMilage: serviceFormData.isExpiryMileageSelected ? serviceFormData.expiryMilage : "",
          lastDate: serviceFormData.isLastDateSelected ? serviceFormData.lastDate : "",
          lastMilage: serviceFormData.isLastMileageSelected ? serviceFormData.lastMilage : "",
          dataType: "Service",
          cost: serviceFormData.cost
        }


        const Data = await handleServiceHistoryRequest({
          token: session?.accessToken,
          method: "PUT",
          body: payload,
        });

        if (Data.success == true) {
          toast.success(Data.message);
          setModalOpen(false);
          // setCost(null)
          setEditmodalOpen(false)
          setServiceFormData((prev) => ({
            ...prev, // Correctly spreading the previous state
            id: "",
            serviceTitle: [], // Setting `serviceTitle` to an empty array
            reminderDate: 0,
            reminderMilage: 0,
            expiryDate: 0,
            expiryMilage: 0,
            lastMilage: 0,
            lastDate: 0,
            dataType: '',
            sms: false,
            email: false,
            pushnotification: false,
            isExpiryDateSelected: false,
            isExpiryMileageSelected: false,
            isReminderDateSelected: false,
            isReminderMileageSelected: false,
            isLastDateSelected: false,
            isLastMileageSelected: false,
            cost: 0,
          }));
          await loadServices()
        }
        else {
          toast.error(Data.message);
        }
      }
    }

  }

  const openUpdateModal = (service: any) => {
    setEditmodalOpen(true)
    //  setFormData(service);
    if (service.dataType === "Service") {
      let payload = {
        id: service._id,
        clientId: service.clientId,
        vehicleId: service.vehicleId,
        serviceTitle: service.serviceTitle,
        reminderDate: service.reminderDate,
        reminderMilage: service.reminderMilage,
        expiryDate: service.expiryDate,
        expiryMilage: service.expiryMilage,
        lastMilage: service.lastMilage,
        lastDate: service.lastDate,
        dataType: service.dataType,
        sms: service.sms,
        cost: service.cost,
        email: service.email,
        pushnotification: service.pushnotification,
        isExpiryDateSelected: service.expiryDate ? true : false,
        isExpiryMileageSelected: service.expiryMilage > 0 ? true : false,
        isReminderDateSelected: service.reminderDate ? true : false,
        isReminderMileageSelected: service.reminderMilage > 0 ? true : false,
        isLastDateSelected: service.lastDate ? true : false,
        isLastMileageSelected: service.lastMilage > 0 ? true : false,
      }
      // setCost(service.cost)
      setServiceFormData(payload);
      setModalOpen(true);
    }
  }

  const handledelete = async (id) => {

    const Data = await handleServiceHistoryRequest({
      token: session?.accessToken,
      method: "DELETE",
      body: id,
    });

    if (Data.success == true) {
      toast.success(Data.message);
      setServiceFormData((prev) => ({
        ...prev, // Correctly spreading the previous state
        id: "",
        serviceTitle: [], // Setting `serviceTitle` to an empty array
        reminderDate: 0,
        reminderMilage: 0,
        expiryDate: 0,
        expiryMilage: 0,
        lastMilage: 0,
        lastDate: 0,
        dataType: '',
        sms: false,
        email: false,
        pushnotification: false,
        isExpiryDateSelected: false,
        isExpiryMileageSelected: false,
        isReminderDateSelected: false,
        isReminderMileageSelected: false,
        isLastDateSelected: false,
        isLastMileageSelected: false,
      }));
      await loadServices()
    }
  }


  const handleserviceChange = (field: 'expiryMilage' | 'reminderMilage' | 'lastMilage', mileage: number) => {
    setServiceFormData((prevState) => ({
      ...prevState,
      [field]: mileage,
    }));
  };

  const handleserviceDateChange = (field: 'expiryDate' | 'reminderDate' | 'lastDate', date: Date | null) => {

    // const formattedDate = date ? date.toISOString().split("T")[0] : null;
    // const formattedDate = format(date, 'dd-MM-yyyy');
    const formattedDate = date ? date.toISOString().split("T")[0] : null;

    // const formattedDate = format(new Date(date), 'MM-dd-yyyy');
    setServiceFormData((prevState) => ({
      ...prevState,
      [field]: formattedDate,
    }));
  };

  const handleserviceCheckboxChange = (
    field: 'isExpiryDateSelected' | 'isExpiryMileageSelected' | 'isReminderDateSelected' | 'isReminderMileageSelected' | 'isLastDateSelected' | 'isLastMileageSelected',
    checked: boolean
  ) => {
    setServiceFormData((prevState) => ({
      ...prevState,
      [field]: checked,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setServiceFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


  };

  const closeConfirmationModal = () => {
    setconfirmModalOpen(false);
    // setSelectedServiceId(null);
  };

  const handleConfirmUpdate = async () => {

    const payload = {
      id: serviceDataforupdate?._id,
      status: "complete"
    }

    if (session) {
      const Data = await handleServiceStatus({
        token: session?.accessToken,
        method: "PUT",
        body: payload,
      });
      if (Data?.success == true) {
        closeConfirmationModal();
        toast.success(Data?.message);
        await loadServices()

      } else {
        toast.error(Data?.message);
      }

      return Data;
    }

  };



  const [selectedColumns, setSelectedColumns] = useState([
    "Service Title",
    "Vehicle Reg",
    "Expiry Date",
    "Expiry Mileage",
    "Reminder Date",
    "Reminder Mileage",
    "Cost",
    "Status",
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
    { key: "serviceTitle", label: "Service Title" },
    { key: "vehicleReg", label: "Vehicle Reg" },
    { key: "expiryDate", label: "Expiry Date" },
    { key: "expiryMilage", label: "Expiry Mileage" },
    { key: "reminderDate", label: "Reminder Date" },
    { key: "reminderMilage", label: "Reminder Mileage" },
    { key: "cost", label: "Cost" },
    { key: "status", label: "Status" },
  ];

  const handleColumnSelection = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleDownloadCSV = () => {
    const data = fetchedservicebyVehicle.map((row, index) =>
      ["Work Order", ...selectedColumns].reduce((acc, col) => {
        const columnKey = columns.find((c) => c.label === col)?.key || col;
        acc[col] = columnKey === "Work Order" ? index + 1 : row[columnKey] || "";
        return acc;
      }, {})
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [["Work Order", ...selectedColumns].join(","), ...data.map((row) => ["Work Order", ...selectedColumns].map((col) => row[col]).join(","))].join("\n");

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
    doc.text("Services", 43, 40);

    doc.text("Vehicle:", 120, 40);
    doc.text(vehicleReg, 139, 40);

    const tableData = fetchedservicebyVehicle.map((row, index) => [
      index + 1, // Work Order
      ...columns
        .filter((col) => selectedColumns.includes(col.label))
        .map((col) => row[col.key] || ""),
    ]);

    const tableColumns = [
      "Work Order",
      ...columns.filter((col) => selectedColumns.includes(col.label)).map((col) => col.label),
    ];

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

  // const [cost, setCost] = useState(null);



  // const handleCostChange = (value) => {

  //   setCost(value);
  //   setServiceFormData((prevData) => ({
  //     ...prevData,
  //     cost: value
  //   }));
  // };
  return (
    <>
      <div className="flex justify-end items-center gap-4 mb-4 ">
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
          Attach Service
        </button>

        {/* Select Columns Button */}
        <div className="relative" ref={columnDropdownRef}>
          <button

            onClick={() => {
              setColumnDropdownOpen(!columnDropdownOpen)
              setExportDropdownOpen(false)

            }}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white  transition-all"
          >
            Select Columns
          </button>
          {columnDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <ul>
                {columns.map((col) => (
                  <li key={col.key} className="flex items-center px-4 py-2 hover:bg-[#e5e7eb] cursor-pointer" onClick={() => handleColumnSelection(col.label)}>
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
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white transition-all"
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

      {/* Data Table */}
      <div className="relative">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="table-container" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="min-w-full table-auto w-full">

              <thead className="bg-[#E2E8F0]">
                <tr>
                  <th className="px-2 py-1 text-center">Work Order</th>
                  {columns
                    .filter((col) => selectedColumns.includes(col.label))
                    .map((col) => (
                      <th key={col.key} className="px-2 py-1 text-center">
                        {col.key === 'expiryMilage' || col.key === 'reminderMilage'
                          ? `${col.label} (KM)`
                          : col.key === 'cost'
                            ? `${col.label} (${session?.currency})`
                            : col.label}
                      </th>
                    ))
                  }
                  <th className="px-2 py-1 text-center">Action</th>
                </tr>
              </thead>



              <tbody>
                {fetchedservicebyVehicle.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-2 text-center text-gray-500">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  fetchedservicebyVehicle.map((service, index) => (
                    <tr key={service._id} className="border-b ">
                      {/* Work Order */}
                      <td className="px-2 py-1 text-center ">{index + 1}</td>

                      {/* Dynamic Columns */} {/*  */}
                      {columns
                        .filter((col) => selectedColumns.includes(col.label))
                        .map((col) => (
                          <td
                            key={col.key}
                            className={`px-2 py-1 break-words ${col.key === "serviceTitle" ? "justify-start" : "text-center"} ${col.key === "status" ?
                              service.status === "pending" ? "text-green" :
                                service.status === "due soon" ? "text-[#FFA500]" :
                                  service.status === "due" ? "text-red" :
                                    service.status === "complete" ? "text-[#007BFF]" : ""
                              : ""}`}
                            style={{
                              cursor: (col.key === "status" && service.status === "complete")
                                ? 'not-allowed' // For "status" column and "complete" status
                                : (col.key !== "status" ? 'text' : 'pointer'), // For non-"status" columns, use text cursor, otherwise pointer
                            }}
                            onClick={() => {
                              if (col.key === "status" && service.status !== "complete") {
                                setserviceDataforupdate(service);
                                setconfirmModalOpen(true);
                              }
                            }}
                          >
                            {
                              // Apply specific conditions for certain columns
                              col.key === "status" ? (
                                service.status === "pending" ? "Valid" :
                                  service.status === "due soon" ? "Expire Soon" :
                                    service.status === "due" ? "Expired" :
                                      service.status === "complete" ? "Complete" : "-"
                              ) : col.key === "maintenanceType" ? (
                                service.file ? "-" : (service.maintenanceType || "-") // Show "-" if 'file' exists, otherwise show 'maintenanceType', or "-" if it's falsy
                              ) : col.key === "createdAt" ? (
                                service.file ? (new Date(service.createdAt).toISOString().split('T')[0]) : "-"
                              ) : (
                                service[col.key] || "-" // Default case: if the value is falsy, show "-"
                              )
                            }
                          </td>
                        ))
                      }


                      {/* Action */}
                      <td className="px-2 py-1 text-center">
                        <div className="flex gap-2 mr-1 justify-center">

                          <svg
                            className="w-5 h-6 cursor-pointer " /* hover:shadow-lg */
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
                            onClick={() => openUpdateModal(service)}
                          >
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                              <path d="M4253 5080 c-78 -20 -114 -37 -183 -83 -44 -29 -2323 -2296 -2361 -2349 -21 -29 -329 -1122 -329 -1168 0 -56 65 -120 122 -120 44 0 1138 309 1166 329 15 11 543 536 1174 1168 837 838 1157 1165 1187 1212 74 116 105 270 82 407 -7 39 -30 105 -53 154 -36 76 -55 99 -182 226 -127 127 -150 145 -226 182 -135 65 -260 78 -397 42z m290 -272 c55 -27 258 -231 288 -288 20 -38 24 -60 24 -140 0 -121 -18 -160 -132 -279 l-82 -86 -303 303 -303 303 88 84 c49 46 108 93 132 105 87 42 203 41 288 -2z m-383 -673 l295 -295 -933 -932 -932 -933 -295 295 c-162 162 -295 299 -295 305 0 13 1842 1855 1855 1855 6 0 143 -133 305 -295z m-1822 -2284 c-37 -12 -643 -179 -645 -178 -1 1 30 115 68 252 38 138 79 285 91 329 l21 78 238 -238 c132 -132 233 -241 227 -243z" />
                            </g>
                          </svg>


                          <svg
                            className="w-5 h-5 cursor-pointer "
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.0"
                            width="512.000000pt"
                            height="512.000000pt"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"

                            onClick={() => handledelete(service._id)}
                          >
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
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
                  <th className="px-2 py-1 text-center">Work Order</th>
                  <th className="px-2 py-1 text-left">Service Task</th>
                  <th className="px-2 py-1 text-left">Vehicle Reg	</th>

                  <th className="px-2 py-1 text-left">Alert Date</th>
                  <th className="px-2 py-1 text-left">Mileage Alert</th>

                  <th className="px-2 py-1 text-left">Due Date</th>
                  <th className="px-2 py-1 text-left">Mileage Limit</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(fetchedservicebyVehicle.length === 0) ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  fetchedservicebyVehicle.map((service, index) => (
                    <tr key={service._id}>
                      <td className="px-2 py-1 text-center">{index + 1}</td>
                      <td className="px-2 py-1">{service.serviceTitle}</td>
                      <td className="px-2 py-1">{service.vehicleReg}</td>

                      <td className="px-2 py-1">{service.reminderDate}</td>
                      <td className="px-2 py-1">{service.reminderMilage}</td>

                      <td className="px-2 py-1">{service.expiryDate}</td>
                      <td className="px-2 py-1">{service.expiryMilage}</td>

                      <td
                        className={`px-2 py-1 ${service.status === "pending" ? "text-green" :
                          service.status === "due soon" ? "text-[#FFA500]" :
                            service.status === "due" ? "text-red" :
                              service.status === "complete" ? "text-[#007BFF]" : ""}`}
                        style={{ cursor: service.status === "complete" ? 'not-allowed' : 'pointer' }}
                        onClick={() => {
                          if (service.status !== "complete") {
                            setserviceDataforupdate(service);
                            setconfirmModalOpen(true);
                          }
                        }}
                      >
                        {service.status === "pending" ? "Valid" :
                          service.status === "due soon" ? "Due Soon" :
                            service.status === "due" ? "Due" :
                              service.status === "complete" ? "Complete" : ""}
                      </td>

                      <td className="px-2 py-1 text-left">
                        <div className="flex gap-4 justify-start">
                          
                          <svg
                            className="w-6 h-6 text-green-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
                            onClick={() => openUpdateModal(service)}
                          >
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                              <path d="M4253 5080 c-78 -20 -114 -37 -183 -83 -44 -29 -2323 -2296 -2361 -2349 -21 -29 -329 -1122 -329 -1168 0 -56 65 -120 122 -120 44 0 1138 309 1166 329 15 11 543 536 1174 1168 837 838 1157 1165 1187 1212 74 116 105 270 82 407 -7 39 -30 105 -53 154 -36 76 -55 99 -182 226 -127 127 -150 145 -226 182 -135 65 -260 78 -397 42z m290 -272 c55 -27 258 -231 288 -288 20 -38 24 -60 24 -140 0 -121 -18 -160 -132 -279 l-82 -86 -303 303 -303 303 88 84 c49 46 108 93 132 105 87 42 203 41 288 -2z m-383 -673 l295 -295 -933 -932 -932 -933 -295 295 c-162 162 -295 299 -295 305 0 13 1842 1855 1855 1855 6 0 143 -133 305 -295z m-1822 -2284 c-37 -12 -643 -179 -645 -178 -1 1 30 115 68 252 38 138 79 285 91 329 l21 78 238 -238 c132 -132 233 -241 227 -243z" />
                            </g>
                          </svg>

                          
                          <svg
                            className="w-6 h-6 text-red-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.0"
                            width="512.000000pt"
                            height="512.000000pt"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"

                            onClick={() => handledelete(service._id)}
                          >
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
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
                Attach Service
              </h3>
              <form onSubmit={handleSubmit}>
                {!EditmodalOpen && (
                  <>
                    <div className="selected-documents flex flex-wrap mb-4 gap-4">
                      {selectedDocumentsForserviceAttach.map((document) => (
                        <div
                          key={document._id}
                          className="selected-item flex items-center justify-between w-[30%] mb-2 px-3 py-2 bg-[#dcfce7] text-green-700 rounded-lg text-sm"
                        >
                          <span className="truncate w-[180px]">{document?.service}</span>

                          <button
                            className="text-red text-lg"
                            onClick={() => handleRemoveDocumentForDocumenttab(document._id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>


                    <Select
                      value={null}
                      onChange={handleDocumentsChangeForDocumenttab}
                      options={selectedDocumentsForService.filter(
                        (option) => !selectedDocumentsForserviceAttach.some((doc) => doc._id === option._id)
                      ).map((doc) => ({
                        label: doc.service, // Use the title for display
                        value: doc._id,  // Use _id as the value
                        ...doc, // Keep other properties for later use
                      }))}
                      placeholder="Select Service"
                      isClearable
                      isSearchable
                      noOptionsMessage={() => 'No options available'}
                      className="rounded-md w-full outline-green border border-grayLight hover:border-green break-words"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          border: 'none',
                          boxShadow: state.isFocused ? null : null,
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? '#00B56C'
                            : state.isFocused
                              ? '#e1f0e3'
                              : 'transparent',
                          color: state.isSelected
                            ? 'white'
                            : state.isFocused
                              ? 'black'
                              : 'black',
                          '&:hover': {
                            backgroundColor: '#e1f0e3',
                            color: 'black',
                          },
                        }),
                      }}
                    />
                  </>
                )}
                {EditmodalOpen && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Service Task
                    </label>
                    <input
                      type="text"
                      name="serviceTitle"
                      value={serviceFormData.serviceTitle}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                      placeholder="Oil Changing / Tuning, etc."

                    />
                  </div>
                )}

                <div>
                  {/* Expiry Settings */}
                  <div className="flex checkboxes mt-4">
                    <label className="block text-sm font-medium mb-2 ml-2 mr-[90px]">Expiry </label>

                    {/* Date checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          style={{ accentColor: "green" }}
                          checked={serviceFormData.isExpiryDateSelected}
                          onChange={(e) => handleserviceCheckboxChange('isExpiryDateSelected', e.target.checked)}
                          id="expiry-date-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="expiry-date-checkbox" className="text-sm">
                          Date
                        </label>
                      </div>
                    </div>
                    {/* Mileage checkbox */}
                    <div className="flex items-center mb-4 ">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          disabled={
                            Number(singleVehicleDetail?.odometer1?.split(" ")[0]) == 0 ||
                            !singleVehicleDetail?.odometer1
                          }
                          style={{ accentColor: "green" }}
                          checked={serviceFormData.isExpiryMileageSelected}
                          onChange={(e) => handleserviceCheckboxChange('isExpiryMileageSelected', e.target.checked)}
                          id="expiry-mileage-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="expiry-mileage-checkbox" className="text-sm">
                          Mileage
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date Picker */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isExpiryDateSelected && (
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                          value={serviceFormData.expiryDate ? new Date(serviceFormData.expiryDate) : null}
                          onChange={(date) => handleserviceDateChange('expiryDate', date)}
                          format="dd-MM-yyyy"
                          variant="dialog"
                          minDate={new Date()}
                          disabled={!serviceFormData.isExpiryDateSelected}
                          placeholder="Expiry Date"
                          autoOk
                          inputProps={{ readOnly: true }}
                          style={{
                            width: '435px',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                          }}
                          InputProps={{
                            endAdornment: <EventIcon style={{ width: '20px', height: '20px' }} className="text-gray" />,
                          }}
                          DialogProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: '#f4f6f8',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              },
                            },
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}
                  </div>

                  {/* Expiry Mileage Input */}
                  <div className="flex items-center mb-4 ">
                    {serviceFormData.isExpiryMileageSelected && (
                      <input
                        type="number"
                        value={serviceFormData.expiryMilage || null}
                        onChange={(e) => handleserviceChange('expiryMilage', Number(e.target.value))}
                        placeholder="Expiry mileage"
                        className="p-2 border border-[#e4e4e7] rounded-lg w-[435px]"
                      />
                    )}
                  </div>

                  {/* Reminder Settings */}
                  <div className="flex checkboxes mt-4">
                    <label className="block text-sm font-medium mb-2 ml-2 mr-[70px]">Reminder </label>

                    {/* Date checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          style={{ accentColor: "green" }}
                          checked={serviceFormData.isReminderDateSelected}
                          onChange={(e) => handleserviceCheckboxChange('isReminderDateSelected', e.target.checked)}
                          id="reminder-date-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="reminder-date-checkbox" className="text-sm">
                          Date
                        </label>
                      </div>
                    </div>

                    {/* Mileage checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          style={{ accentColor: "green" }}
                          disabled={
                            Number(singleVehicleDetail?.odometer1?.split(" ")[0]) == 0 ||
                            !singleVehicleDetail.odometer1
                          }
                          checked={serviceFormData.isReminderMileageSelected}
                          onChange={(e) => handleserviceCheckboxChange('isReminderMileageSelected', e.target.checked)}
                          id="reminder-mileage-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="reminder-mileage-checkbox" className="text-sm">
                          Mileage
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Reminder Date Picker */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isReminderDateSelected && (
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                          value={serviceFormData.reminderDate ? new Date(serviceFormData.reminderDate) : null}
                          onChange={(date) => handleserviceDateChange('reminderDate', date)}
                          format="dd-MM-yyyy"
                          variant="dialog"
                          minDate={new Date()}
                          disabled={!serviceFormData.isReminderDateSelected}
                          placeholder="Reminder Date"
                          autoOk
                          inputProps={{ readOnly: true }}
                          style={{
                            width: '435px',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                          }}
                          InputProps={{
                            endAdornment: <EventIcon style={{ width: '20px', height: '20px' }} className="text-gray" />,
                          }}
                          DialogProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: '#f4f6f8',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              },
                            },
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}
                  </div>

                  {/* Reminder Mileage Input */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isReminderMileageSelected && (
                      <input
                        type="number"
                        value={serviceFormData.reminderMilage || null}
                        onChange={(e) => handleserviceChange('reminderMilage', Number(e.target.value))}
                        placeholder="Reminder mileage"
                        className="p-2 border border-[#e4e4e7] rounded-lg w-[435px]"
                      />
                    )}
                  </div>

                  {/* Last Settings */}
                  <div className="flex checkboxes mt-4">
                    <label className="block text-sm font-medium mb-2 ml-2 mr-[30px]">Last Carried Out</label>

                    {/* Date checkbox */}

                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          style={{ accentColor: "green" }}
                          checked={serviceFormData.isLastDateSelected}
                          onChange={(e) => handleserviceCheckboxChange('isLastDateSelected', e.target.checked)}
                          id="last-date-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="last-date-checkbox" className="text-sm">
                          Date
                        </label>
                      </div>
                    </div>

                    {/* Mileage checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          style={{ accentColor: "green" }}
                          disabled={
                            Number(singleVehicleDetail?.odometer1?.split(" ")[0]) == 0 ||
                            !singleVehicleDetail.odometer1
                          }
                          checked={serviceFormData.isLastMileageSelected}
                          onChange={(e) => handleserviceCheckboxChange('isLastMileageSelected', e.target.checked)}
                          id="last-mileage-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="last-mileage-checkbox" className="text-sm">
                          Mileage
                        </label>
                      </div>
                    </div>


                  </div>

                  {/* Last Date Picker */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isLastDateSelected && (
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                          value={serviceFormData.lastDate ? new Date(serviceFormData.lastDate) : null}
                          onChange={(date) => handleserviceDateChange('lastDate', date)}
                          format="dd-MM-yyyy"
                          variant="dialog"
                          maxDate={new Date()}
                          disabled={!serviceFormData.isLastDateSelected}
                          placeholder="Last Date"
                          autoOk
                          inputProps={{ readOnly: true }}
                          style={{
                            width: '435px',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                          }}
                          InputProps={{
                            endAdornment: <EventIcon style={{ width: '20px', height: '20px' }} className="text-gray" />,
                          }}
                          DialogProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: '#f4f6f8',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              },
                            },
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}
                  </div>

                  {/* Last Mileage Input */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isLastMileageSelected && (
                      <input
                        type="number"
                        value={serviceFormData.lastMilage || null}
                        onChange={(e) => handleserviceChange('lastMilage', Number(e.target.value))}
                        placeholder="Last mileage"
                        className="p-2 border border-[#e4e4e7] rounded-lg w-[435px]"
                      />
                    )}
                  </div>
                </div>
                <>
                  <label className="block text-sm font-medium mb-2 ml-2">
                    Alert types
                  </label>
                  <div className="mb-2 ml-2 flex items-center">
                    <input
                      type="checkbox"
                      style={{ accentColor: "green" }}
                      checked={serviceFormData.sms}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, sms: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <label>SMS</label>
                  </div>
                  <div className="mb-2 ml-2 flex items-center">
                    <input
                      type="checkbox"
                      style={{ accentColor: "green" }}
                      checked={serviceFormData.email}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, email: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <label>Email</label>
                  </div>
                  <div className="mb-4 ml-2 flex items-center">
                    <input
                      type="checkbox"
                      style={{ accentColor: "green" }}
                      checked={serviceFormData.pushnotification}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          pushnotification: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label>Push Notifications</label>
                  </div>
                </>






                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false); // Close the modal
                      // setCost(null)
                      setselectedDocumentsForserviceAttach([])
                      setEditmodalOpen(false)
                      setServiceFormData((prev) => ({
                        ...prev, // Correctly spreading the previous state
                        id: "",
                        serviceTitle: [], // Setting `serviceTitle` to an empty array
                        reminderDate: 0,
                        reminderMilage: 0,
                        expiryDate: 0,
                        expiryMilage: 0,
                        lastMilage: 0,
                        lastDate: 0,
                        dataType: '',
                        sms: false,
                        email: false,
                        pushnotification: false,
                        isExpiryDateSelected: false,
                        isExpiryMileageSelected: false,
                        isReminderDateSelected: false,
                        isReminderMileageSelected: false,
                        isLastDateSelected: false,
                        isLastMileageSelected: false,
                      }));


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
      {confirmModalOpen && (
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

              Are you sure you want to Update this service status to Complete

            </p>

            {/* Modal Buttons */}
            <div className="mt-4 text-right">
              <button
                onClick={closeConfirmationModal}
                className="bg-[#d1d5db] px-4 py-2 rounded mr-2 hover:bg-[#e5e7eb]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                className="bg-[#00B56C] text-white px-4 py-2 rounded hover:bg-[#4ade80]"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}


/* 





*/
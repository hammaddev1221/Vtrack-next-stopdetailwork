"use client";
import { FuelReport, getReportOptionsByClientId, tripByZone, vehicleListByClientId, ZoneToZone } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { DeviceAttach } from "@/types/vehiclelistreports";
import TripsByBucket from "@/types/TripsByBucket";
import { IgnitionReport } from "@/types/IgnitionReport";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import EventIcon from "@material-ui/icons/Event";
import { Toaster, toast } from "react-hot-toast";
import * as XLSX from 'xlsx';
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
import DateFnsMomemtUtils from "@date-io/moment";
import TablePagination from "@mui/material/TablePagination";
import Select from "react-select";
import { useSelector } from "react-redux";
import "./report.css";
import {
  MuiPickersUtilsProvider,
  DatePicker,
} from "@material-ui/pickers";

import {
  IgnitionReportByTrip,
  IgnitionReportByDailyactivity,
  IgnitionReportByIgnition,
  IgnitionReportByEvents,
  IgnitionReportByDetailReport,
  IgnitionReportByIdlingActivity,
  IgnitionReportByco2emission,
  getAllVehicleByUserId,
} from "@/utils/API_CALLS";
import FuelChart from "./fuelChart";
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

const DefaultOptions: any = [{ value: "Trip", label: "Trip" },
{ value: "DailyActivity", label: "Daily Activity" },
{ value: "Ignition", label: "Ignition" },
{ value: "Events", label: "Events" },
{ value: "DetailReportByStreet", label: "Detail Report By Street" },
{ value: "IdlingActivity", label: "Idling Activity" },
// { value: "fuelreport", label: "Fuel Report" },
// { value: "TripByZone", label: "Trip By Zone" },
    /*   { value: "co2emission", label: "CO2 Emission" }, */]

export default function Reports() {
  const { data: session } = useSession();
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [showWeekDays, setShowWeekDays] = useState(true);
  // const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  // const [customDate, setcustomDate] = useState(true);
  const [trisdata, setTrisdata] = useState<TripsByBucket[]>([]);

  const [tableShow, setTableShow] = useState(true);
  const [columnHeaders, setColumnHeaders] = useState<
    (
      | "duration"
      | "0"
      | "DriverName"
      | "1"
      | "2"
      | "3"
      | "4"
      | "5"
      | "6"
      | "7" | "8"
      | "End Time"
      | "streetCount"
      | "Final Location"
      | "Total Time"
      | "Start Date"
      | "Idling Point"
      | "Time Duration"
      | "StartDateTime"
      | "Starting Location"
      | "TripStart"
      | "AvgSpeed"
      | "Millage"
      | "Max Speed"
      | "MaxSpeed"
      | "InitialLocation"
      | "Duration"
      | "EndingDateTime"
      | "event"
      | "date"
      | "Address"
      | "Start Time"
      | "StartingPoint"
      | "TripEnd"
      | "Final Location "
      | "TripDuration"
      | "Mileage"
      | "TotalDistance"
      | "Avg Speed"
      | "AverageSpeed"
      | "MaxSpeed"
      | "IMEI"
      | "Status"
      | "Type"
      | "Emission"
      | "emission"
      | "Fuel"
      | "DateTime"
    )[]
  >([]);
  const [customHeaderTitles, setcustomHeaderTitles] = useState<
    (
      | "duration"
      | "DriverName"
      | "0"
      | "1"
      | "2"
      | "3"
      | "4"
      | "5"
      | "End Time"
      | "streetCount"
      | "Total Time"
      | "Final Location"
      | "6"
      | "7"
      | "Start Date"
      | "Idling Point"
      | "Time Duration"
      | "Starting Location"
      | "StartDateTime"
      | "TripStart"
      | "AvgSpeed"
      | "Max Speed"
      | "Millage"
      | "MaxSpeed"
      | "InitialLocation"
      | "Duration"
      | "EndingDateTime"
      | "event"
      | "date"
      | "Address"
      | "Start Time"
      | "StartingPoint"
      | "TripEnd"
      | "Final Location "
      | "TripDuration"
      | "Mileage"
      | "TotalDistance"
      | "Avg Speed"
      | "AverageSpeed"
      | "MaxSpeed"
      | "IMEI"
      | "Status"
      | "Type"
      | "CO2 Emission"
      | "Fuel"
      | "DateTime" | "Enter Zone" | "Exit Zone" | "Fuel(in per%)" |
      "S.no" |
      "Enter Zone" |
      "Exit Zone"
    )[]
  >([]);
  const allData = useSelector((state) => state?.zone);


  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString()); // Create a mutable copy
  const [eventfetch, seteventfetch] = useState()

  const vehicleReg = params.get("vehicleReg");
  const event = params.get("event");
  const dateTime = params.get("dateTime");
  const Time = params.get("Time");

  const [dataReady, setDataReady] = useState(false);
  const [Highligthdate, setHighligthdate] = useState();
  const [pdfData, setpdfData] = useState();
  const [Ignitionreport, setIgnitionreport] = useState<IgnitionReport>({
    TimeZone: session?.timezone || "",
    VehicleReg: "",
    clientId: session?.clientId || "",
    fromDateTime: "",
    period: "",
    reportType: 0,
    toDateTime: "",
    unit: session?.unit || "",
  });

  useEffect(() => {

    if (vehicleReg && event && dateTime) {
      seteventfetch(event)


      let a = `${dateTime}T${Time}.000Z`

      setHighligthdate(a)
      // Get today's date in ISO format (without time part)
      const today = new Date().toISOString().split('T')[0];
      let period
      // Check if the result date is today
      if (dateTime === today) {
        period = "today"
      } else {

        period = "custom"
      }
      setIgnitionreport((prevReport: any) => ({
        ...prevReport,
        VehicleReg: vehicleReg,
        fromDateTime: dateTime,
        toDateTime: dateTime,
        period: period,
        // reportType: event == "" ? "Events",
        reportType: ["ignitionOn", "ignitionOff"].includes(event) ? "Ignition" : "Events",
        TimeZone: session?.timezone || "",

        clientId: session?.clientId || "",


        unit: session?.unit || "",

      }));
      setDataReady(true); // Set this flag to true when data is available
      // Remove the parameters from the URL
      params.delete("vehicleReg");
      params.delete("event");
      params.delete("dateTime");
      params.delete("Time");
      // Update the URL (without these parameters)
      window.history.replaceState({}, "", "?" + params.toString());
      handleSubmitCustom()
    }
  }, [session, vehicleReg, event, dateTime])

  useEffect(() => {
    if (dataReady) {
      handleSubmitCustom(); // Call handleSubmit only when data is ready
    }
  }, [dataReady]); // Trigger handleSubmit when the dataReady flag changes

  // const firstIndex = currentPage * rowsPerPages;
  // const lastIndex = Math.min(firstIndex + rowsPerPages, trisdata.length); // Ensure lastIndex does not exceed trisdata.length
  // const filterData = trisdata?.slice(firstIndex, lastIndex);
  const handleSubmitCustom = async () => {
    const { reportType, VehicleReg, period } = Ignitionreport;
    if (reportType && VehicleReg && period) {
      let newdata: any = { ...Ignitionreport };

      const apiFunctions: Record<
        string,
        (data: {
          token: string;
          clientId: string;
          payload: any;
        }) => Promise<any>
      > = {
        Trip: IgnitionReportByTrip,
        DailyActivity: IgnitionReportByDailyactivity,
        Ignition: IgnitionReportByIgnition,
        Events: IgnitionReportByEvents,
        DetailReportByStreet: IgnitionReportByDetailReport,
        IdlingActivity: IgnitionReportByIdlingActivity,
        fuelreport: FuelReport,
        TripByZone: tripByZone,
        ZoneToZone: ZoneToZone
      };

      if (apiFunctions[newdata.reportType]) {
        let apiFunction = apiFunctions[newdata.reportType]
        if (isCustomPeriod) {
          newdata = {
            ...newdata,
            fromDateTime: `${Ignitionreport.fromDateTime}T00:00:00Z`,
            toDateTime: `${Ignitionreport.toDateTime}T23:59:59Z`,
          };
        } else {
          newdata = {
            // ...newdata,
            unit: session?.unit,
            reportType: 0,
            period: period,
            VehicleReg: VehicleReg,
            TimeZone: session?.timezone,
            clientId: session?.clientId,
            fromDateTime: `${Ignitionreport.fromDateTime}T00:00:00Z`,
            toDateTime: `${Ignitionreport.toDateTime}T23:59:59Z`,
            // fromDateTime: "2024-02-01T00:00:00Z",
            // toDateTime: "2024-02-01T23:59:59Z",
          };
        }

        try {
          const response = await toast.promise(
            apiFunction({
              token: session?.accessToken,
              clientId: session?.clientId,
              payload: newdata,
            }),

            {
              loading: "Loading...",
              success: "",
              error: "",
            },
            {
              style: {
                border: "1px solid #00B56C",
                padding: "16px",
                color: "#1A202C",
              },
              success: {
                duration: 10,
                iconTheme: {
                  primary: "#00B56C",
                  secondary: "#FFFAEE",
                },
              },
              error: {
                duration: 10,
                iconTheme: {
                  primary: "#00B56C",
                  secondary: "#FFFAEE",
                },
              },
            }
          );

          if (response.success === true) {
            setTableShow(true);
            setpdfData(response.data.pdfData)
            //  setIsFormSubmitted(true);
            setTrisdata(response.data.tableData);

            let newColumnHeaders: (
              | "StartDateTime"
              | "DriverName"
              | "0"
              | "1"
              | "2"
              | "3"
              | "4"
              | "5"
              | "6"
              | "7"
              | "Start Date"
              | "streetCount"
              | "End Time"
              | "Mileage"
              | "Total Time"
              | "Max Speed"
              | "Idling Point"
              | "Time Duration"
              | "duration"
              | "AvgSpeed"
              | "Millage"
              | "MaxSpeed"
              | "TripStart"
              | "Starting Location"
              | "InitialLocation"
              | "EndingDateTime"
              | "Duration"
              | "event"
              | "date"
              | "Address"
              | "Start Time"
              | "StartingPoint"
              | "TripEnd"
              | "Final Location"
              | "TripDuration"
              | "TotalDistance"
              | "Avg Speed"
              | "AverageSpeed"
              | "MaxSpeed"
              | "IMEI"
              | "Status"
              | "Type"
            )[] = [];
            let custom1HeaderTitles: (
              | "StartDateTime"
              | "0"
              | "1"
              | "2"
              | "3"
              | "4"
              | "5"
              | "6"
              | "7"
              | "Start Date"
              | "streetCount"
              | "End Time"
              | "Mileage"
              | "Total Time"
              | "Max Speed"
              | "Idling Point"
              | "Time Duration"
              | "duration"
              | "AvgSpeed"
              | "Millage"
              | "MaxSpeed"
              | "TripStart"
              | "InitialLocation"
              | "Starting Location"
              | "EndingDateTime"
              | "Duration"
              | "event"
              | "date"
              | "Address"
              | "Start Time"
              | "StartingPoint"
              | "TripEnd"
              | "Final Location"
              | "TripDuration"
              | "TotalDistance"
              | "AverageSpeed"
              | "Avg Speed"
              | "MaxSpeed"
              | "IMEI"
              | "Status"
              | "Type"
            )[] = [];
            if (Ignitionreport.reportType.toString() === "Trip") {
              if (response.data.clientModelProfile) {
                newColumnHeaders = [
                  "AverageSpeed",
                  "IMEI",
                  "Status",
                  "TripDuration",
                  "TotalDistance",
                  "DriverName",
                ];
              } else {
                newColumnHeaders = [
                  "AverageSpeed",
                  "IMEI",
                  "Status",
                  "TripDuration",
                  "TotalDistance",
                ];
              }

              setcustomHeaderTitles(newColumnHeaders);
            } else if (
              Ignitionreport.reportType.toString() === "DailyActivity"
            ) {
              newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7"];
              custom1HeaderTitles = [
                "Start Time",
                "Starting Location",
                "End Time",
                "Final Location",
                "Total Time",
                "Mileage",
                "Avg Speed",
                "Max Speed",
              ];

              setcustomHeaderTitles(custom1HeaderTitles);
            } else if (
              Ignitionreport.reportType.toString() === "Ignition"
            ) {
              newColumnHeaders = ["0", "1", "2", "3", "4", "5"];
              custom1HeaderTitles = [
                "event",
                "date",
                "Address",
                "event",
                "date",
                "Address",
              ];
              setcustomHeaderTitles(custom1HeaderTitles);
            } else if (Ignitionreport.reportType.toString() === "Events") {
              const filteredData = response.data.tableData.filter(
                (eventitem: { event: string }) =>
                  eventitem
              );

              setTrisdata(filteredData);
              setpdfData(response.data.pdfData)

              newColumnHeaders = ["event", "date", "Address"];
              setcustomHeaderTitles(newColumnHeaders);
            } else if (
              Ignitionreport.reportType.toString() === "IdlingActivity"
            ) {


              // Constructing new column headers based on the data format
              newColumnHeaders = ["0", "1", "2"];
              custom1HeaderTitles = ["date", "Address", "duration"];
              setcustomHeaderTitles(custom1HeaderTitles);
            } else if (
              Ignitionreport.reportType.toString() ===
              "DetailReportByStreet"
            ) {
              newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7"];
              custom1HeaderTitles = [
                "StartDateTime",
                "AvgSpeed",
                "streetCount",
                "Millage",
                "MaxSpeed",
                "InitialLocation",
                "EndingDateTime",
                "Duration",
              ];
              setcustomHeaderTitles(custom1HeaderTitles);
            } else if (
              Ignitionreport.reportType.toString() ===
              "fuelreport"
            ) {
              newColumnHeaders = ["0", "1", "2",];
              custom1HeaderTitles = [
                "Address",
                "Fuel(in per%)",
                "DateTime"
              ];
              setcustomHeaderTitles(custom1HeaderTitles);
            } else if (
              Ignitionreport.reportType.toString() ===
              "TripByZone"
            ) {
              newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7", "8"                // ,"9"
              ];
              custom1HeaderTitles = [
                "S.no",
                "Start Time",
                "Enter Zone",
                "End Time",
                "Exit Zone",
                "Total Time",
                "Mileage",
                "Avg Speed",
                "Max Speed",
                // "Status"
              ];
              setcustomHeaderTitles(custom1HeaderTitles);
            }
            else if (
              Ignitionreport.reportType.toString() ===
              "ZoneToZone"
            ) {
              newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7", "8"                // ,"9"
              ];
              custom1HeaderTitles = [
                "S.no",
                "Start Time",
                "Exit Zone",
                "End Time",
                "Enter Zone",
                "Total Time",
                "Mileage",
                "Avg Speed",
                "Max Speed",
                // "Status"
              ];
              setcustomHeaderTitles(custom1HeaderTitles);
            }



            setColumnHeaders(newColumnHeaders);
          } else if (response.success === false) {

            setTableShow(false);
            setTrisdata([])
            toast.error("No Data Found", {
              style: {
                border: "1px solid red",
                padding: "16px",
                color: "red",
              },
              iconTheme: {
                primary: "red",
                secondary: "white",
              },
            });
          }
        } catch (error) {
          console.error(
            `Error calling API for ${newdata.reportType}:`,
            error
          );
        }
      } else {
        console.error(`API function not found for ${newdata.reportType}`);
      }
    } else {

    }
  }



  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "SuperAmin") {
          if (allData?.vehicle.length <= 0) {
            const Data = await vehicleListByClientId({
              token: session?.accessToken,
              clientId: session?.clientId,
            });
            setVehicleList(Data);
          }
          setVehicleList(allData?.vehicle);
        } else {
          if (session) {
            const data = await getAllVehicleByUserId({
              token: session?.accessToken,
              userId: session?.userId,
            });
            setVehicleList(data);
          }
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
    const fetchReportOption = async () => {
      const Data = await getReportOptionsByClientId({


        token: session?.accessToken,
        query: { clientId: session?.clientId },

      })
      if (Data?.data?.options?.length > 0) {
        setOptionTrips(
          Data.data.options.filter((i) => { return i.allow })
        )
      } else {
        setOptionTrips(DefaultOptions)
      }

    }
    fetchReportOption()
  }, [session]);

  let currentTime = new Date().toLocaleString("en-US", {
    timeZone: session?.timezone,
  });

  let timeOnly = currentTime.split(",")[1].trim();
  timeOnly = timeOnly.replace(/\s+[APap][Mm]\s*$/, "");

  // const [hours, minutes, seconds] = timeOnly
  //   .split(":")
  //   .map((part) => part.trim());

  // const formattedHours = hours.padStart(2, "0");
  // const formattedMinutes = minutes.padStart(2, "0");
  // const formattedSeconds = seconds.padStart(2, "0");
  // const currentDate = new Date().toISOString().split("T")[0];
  // const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  // const parsedDateTime = new Date(currentTime);
  const currenTDates = new Date();
  var moment = require("moment-timezone");

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [name]: value,
    }));

    if (name === "period" && value === "custom") {
      setIsCustomPeriod(!isCustomPeriod);
      setShowWeekDays(false);
    } else if (name === "period" && value != "custom") {
      setIsCustomPeriod(false);
    }
  };


  const handleCustomDateChange = (fieldName: string, e: any) => {

    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [fieldName]: e?.toISOString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHighligthdate(null)
    seteventfetch(null)
    if (
      Ignitionreport.reportType &&
      Ignitionreport.VehicleReg &&
      (Ignitionreport.period === "today" ||
        Ignitionreport.period === "yesterday" ||
        Ignitionreport.period === "week" ||
        (Ignitionreport.toDateTime && Ignitionreport.fromDateTime))
    ) {
      let startDateTime;
      let endDateTime;

      if (session) {
        const { reportType, VehicleReg, period } = Ignitionreport;
        if (period === "today") {
          const today = moment().tz(session?.timezone);
          startDateTime = today.clone().startOf("day").format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = today.clone().endOf("day").format("YYYY-MM-DDT23:59:59") + "Z";
        }
        if (period === "yesterday") {
          const yesterday = moment().subtract(1, "day").tz(session?.timezone);
          startDateTime = yesterday.clone().startOf("day").format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = yesterday.clone().endOf("day").format("YYYY-MM-DDT23:59:59") + "Z";
        }
        if (period === "week") {
          const startOfWeek = moment().subtract(7, "days").tz(session?.timezone).startOf("day");
          const endOfWeek = moment().subtract(1, "day").tz(session?.timezone).endOf("day");
          startDateTime = startOfWeek.format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = endOfWeek.format("YYYY-MM-DDT23:59:59") + "Z";
        }
        if (period === "custom") {
          startDateTime = moment(Ignitionreport.fromDateTime).startOf("day").format("YYYY-MM-DDT00:00:00") + "Z";
          endDateTime = moment(Ignitionreport.toDateTime).endOf("day").format("YYYY-MM-DDT23:59:59") + "Z";
        }
        if (reportType && VehicleReg && period) {
          let newdata = { ...Ignitionreport };

          const apiFunctions: Record<
            string,
            (data: {
              token: string;
              clientId: string;
              payload: any;
            }) => Promise<any>
          > = {
            Trip: IgnitionReportByTrip,
            DailyActivity: IgnitionReportByDailyactivity,
            Ignition: IgnitionReportByIgnition,
            Events: IgnitionReportByEvents,
            DetailReportByStreet: IgnitionReportByDetailReport,
            IdlingActivity: IgnitionReportByIdlingActivity,
            co2emission: IgnitionReportByco2emission,
            fuelreport: FuelReport,
            TripByZone: tripByZone,
            ZoneToZone: ZoneToZone

          };
          if (apiFunctions[newdata.reportType]) {
            const apiFunction = apiFunctions[newdata.reportType];
            newdata = {
              unit: session?.unit,
              reportType: 0,
              period: period,
              VehicleReg: VehicleReg,
              TimeZone: session?.timezone,
              clientId: session?.clientId,
              fromDateTime: startDateTime,
              toDateTime: endDateTime,
            };
            try {
              const response = await toast.promise(
                apiFunction({
                  token: session?.accessToken,
                  clientId: session?.clientId,
                  payload: newdata,
                }),
                {
                  loading: "Loading...",
                  success: "",
                  error: "",
                },
                {
                  style: {
                    border: "1px solid #00B56C",
                    padding: "16px",
                    color: "#1A202C",
                  },
                  success: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE",
                    },
                  },
                  error: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE",
                    },
                  },
                }
              );

              if (response.success === true) {
                setTableShow(true);
                setpdfData(response.data.pdfData)
                //  setIsFormSubmitted(true);
                setTrisdata(response.data.tableData);

                let newColumnHeaders: (
                  | "StartDateTime"
                  | "DriverName"
                  | "0"
                  | "1"
                  | "2"
                  | "3"
                  | "4"
                  | "5"
                  | "6"
                  | "7"
                  | "Start Date"
                  | "streetCount"
                  | "End Time"
                  | "Mileage"
                  | "Total Time"
                  | "Max Speed"
                  | "Idling Point"
                  | "Time Duration"
                  | "duration"
                  | "AvgSpeed"
                  | "Millage"
                  | "MaxSpeed"
                  | "TripStart"
                  | "Starting Location"
                  | "InitialLocation"
                  | "EndingDateTime"
                  | "Duration"
                  | "event"
                  | "date"
                  | "Address"
                  | "Start Time"
                  | "StartingPoint"
                  | "TripEnd"
                  | "Final Location"
                  | "TripDuration"
                  | "TotalDistance"
                  | "Avg Speed"
                  | "AverageSpeed"
                  | "MaxSpeed"
                  | "IMEI"
                  | "Status"
                  | "Type"
                  | "Emission"
                )[] = [];
                let custom1HeaderTitles: (
                  | "StartDateTime"
                  | "0"
                  | "1"
                  | "2"
                  | "3"
                  | "4"
                  | "5"
                  | "6"
                  | "7"
                  | "Start Date"
                  | "streetCount"
                  | "End Time"
                  | "Mileage"
                  | "Total Time"
                  | "Max Speed"
                  | "Idling Point"
                  | "Time Duration"
                  | "duration"
                  | "AvgSpeed"
                  | "Millage"
                  | "MaxSpeed"
                  | "TripStart"
                  | "InitialLocation"
                  | "Starting Location"
                  | "EndingDateTime"
                  | "Duration"
                  | "event"
                  | "date"
                  | "Address"
                  | "Start Time"
                  | "StartingPoint"
                  | "TripEnd"
                  | "Final Location"
                  | "TripDuration"
                  | "TotalDistance"
                  | "AverageSpeed"
                  | "Avg Speed"
                  | "MaxSpeed"
                  | "IMEI"
                  | "Status"
                  | "Type"
                  | "CO2 Emission"
                )[] = [];
                if (Ignitionreport.reportType.toString() === "Trip") {
                  if (response.data.clientModelProfile) {
                    newColumnHeaders = [
                      "AverageSpeed",
                      "IMEI",
                      "Status",
                      "TripDuration",
                      "TotalDistance",
                      "DriverName",
                    ];
                  } else {
                    newColumnHeaders = [
                      "AverageSpeed",
                      "IMEI",
                      "Status",
                      "TripDuration",
                      "TotalDistance",
                    ];
                  }

                  setcustomHeaderTitles(newColumnHeaders);
                } else if (
                  Ignitionreport.reportType.toString() === "DailyActivity"
                ) {
                  newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7"];
                  custom1HeaderTitles = [
                    "Start Time",
                    "Starting Location",
                    "End Time",
                    "Final Location",
                    "Total Time",
                    "Mileage",
                    "Avg Speed",
                    "Max Speed",
                  ];

                  setcustomHeaderTitles(custom1HeaderTitles);
                } else if (
                  Ignitionreport.reportType.toString() === "Ignition"
                ) {
                  newColumnHeaders = ["0", "1", "2", "3", "4", "5"];
                  custom1HeaderTitles = [
                    "event",
                    "date",
                    "Address",
                    "event",
                    "date",
                    "Address",
                  ];
                  setcustomHeaderTitles(custom1HeaderTitles);
                } else if (Ignitionreport.reportType.toString() === "Events") {
                  const filteredData = response.data.tableData.filter(
                    (eventitem: { event: string }) =>
                      eventitem.event !== "ignitionOn" &&
                      eventitem.event !== "ignitionOff" &&
                      eventitem.event !== "ignition On" &&
                      eventitem.event !== "ignition Off"
                  );
                  setTrisdata(filteredData);
                  newColumnHeaders = ["event", "date", "Address"];
                  setcustomHeaderTitles(newColumnHeaders);
                } else if (
                  Ignitionreport.reportType.toString() === "IdlingActivity"
                ) {


                  // Constructing new column headers based on the data format
                  newColumnHeaders = ["0", "1", "2"];
                  custom1HeaderTitles = ["date", "Address", "duration"];
                  setcustomHeaderTitles(custom1HeaderTitles);
                }
                else if (
                  Ignitionreport.reportType.toString() ===
                  "co2emission"
                ) {
                  newColumnHeaders = [
                    "IMEI",
                    "TripDuration",
                    "TotalDistance",
                    "emission",
                  ];
                  custom1HeaderTitles = [
                    "IMEI",
                    "TripDuration",
                    "TotalDistance",
                    "CO2 Emission",
                  ];
                  setcustomHeaderTitles(custom1HeaderTitles);
                }
                else if (
                  Ignitionreport.reportType.toString() ===
                  "DetailReportByStreet"
                ) {
                  newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7"];
                  custom1HeaderTitles = [
                    "StartDateTime",
                    "AvgSpeed",
                    "streetCount",
                    "Millage",
                    "MaxSpeed",
                    "InitialLocation",
                    "EndingDateTime",
                    "Duration",
                  ];
                  setcustomHeaderTitles(custom1HeaderTitles);
                } else if (
                  Ignitionreport.reportType.toString() ===
                  "fuelreport"
                ) {
                  newColumnHeaders = ["0", "1", "2",];
                  custom1HeaderTitles = [
                    "Address",
                    "Fuel(in per%)",
                    "DateTime"
                  ];
                  setcustomHeaderTitles(custom1HeaderTitles);
                } else if (
                  Ignitionreport.reportType.toString() ===
                  "TripByZone"
                ) {
                  newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7", "8"                // ,"9"
                  ];
                  custom1HeaderTitles = [
                    "S.no",
                    "Start Time",
                    "Enter Zone",
                    "End Time",
                    "Exit Zone",
                    "Total Time",
                    "Mileage",
                    "Avg Speed",
                    "Max Speed",
                    // "Status"
                  ];
                  setcustomHeaderTitles(custom1HeaderTitles);
                } else if (
                  Ignitionreport.reportType.toString() ===
                  "ZoneToZone"
                ) {
                  newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7", "8"                // ,"9"
                  ];
                  custom1HeaderTitles = [
                    "S.no",
                    "Start Time",
                    "Exit Zone",
                    "End Time",
                    "Enter Zone",
                    "Total Time",
                    "Mileage",
                    "Avg Speed",
                    "Max Speed",
                    // "Status"
                  ];
                  setcustomHeaderTitles(custom1HeaderTitles);
                }

                setColumnHeaders(newColumnHeaders);
              } else if (response.success === false) {
                setTableShow(false);
                setTrisdata([])
                toast.error("No Data Found", {
                  style: {
                    border: "1px solid red",
                    padding: "16px",
                    color: "red",
                  },
                  iconTheme: {
                    primary: "red",
                    secondary: "white",
                  },
                });
              }
            } catch (error) {
              console.error(
                `Error calling API for ${newdata.reportType}:`,
                error
              );
            }
          } else {
            console.error(`API function not found for ${newdata.reportType}`);
          }
        } else {
          console.error(
            "Please fill in all three fields: reportType, VehicleReg, and period"
          );

          toast.error(
            "Please fill in all three fields: reportType, VehicleReg, and period",
            {
              style: {
                border: "1px solid #00B56C",
                padding: "16px",
                color: "#1A202C",
              },
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE",
              },
            }
          );
        }
      }
    } else {
      return null; // or simply omit this else block as it defaults to undefined
    }
  };

  const handleInputChangeSelect = (e: any) => {
    if (!e) {
      return setIgnitionreport((prevReport: any) => ({
        ...prevReport,
        VehicleReg: "",
        period: "",
        // ["label"]: label,
      }));
    }
    setIgnitionreport((preData) => ({
      ...preData,
      VehicleReg: e?.value,
    }));
  };

  const handleInputChangeTrip = (e: any) => {
    if (!e) {
      return setIgnitionreport((prevReport: any) => ({
        ...prevReport,
        reportType: 0,
        period: "",
        // ["label"]: label,
      }));
    }

    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      reportType: e?.value,
    }));
  };
  const [optionsTrip, setOptionTrips] = useState<any>([

  ]);
  const options: { value: string; label: string; data: any }[] =
    vehicleList?.data?.map((item: VehicleData) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];

  const generateTripJson = (trisdata: any[], eventfetch?: string, timezone?: any, Highligthdate?: string, headers?: string[]) => {
    return trisdata?.map((trip) => {
      let formattedDate;
      let showformattedDate;

      // Date formatting logic (same as your table)
      if (trip.date === undefined && eventfetch) {
        let inputDate = (eventfetch === "ignitionOff" ? trip[4] : trip[1]);
        inputDate = inputDate?.replace(/\s+/g, ' ').trim();
        let momentDate = moment.tz(inputDate, timezone);
        formattedDate = momentDate.toISOString();
        showformattedDate = formattedDate;
      } else {
        const date = new Date(trip.date);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = date.getUTCFullYear();
        const month = months[date.getUTCMonth()];
        const day = date.getUTCDate();
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const formattedDate2 = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
        let momentDate = moment.tz(trip.date, timezone);
        formattedDate = momentDate.toISOString();
        showformattedDate = formattedDate2;
      }

      // Create base object with formatted values
      const formattedValues: any = {
        // Handle special formatting for TripDuration
        TripDuration: trip.TripDurationHr !== undefined && trip.TripDurationMins !== undefined
          ? `${trip.TripDurationHr} hrs ${trip.TripDurationMins} mins`
          : trip.TripDuration,

        // Handle DriverName special case
        DriverName: trip.DriverName && trip.DriverName.toString()
          ? trip.DriverName.toString()
          : "Driver Not Assigned",

        // Handle Address with OsmElement
        Address: trip.OsmElement
          ? `${trip.OsmElement.display_name.split(",").slice(0, 3).join(", ")}`
          : trip.Address || "",

        // Handle date fields
        TripStart: showformattedDate,
        TripEnd: showformattedDate,
        date: showformattedDate,
        StartDateTime: showformattedDate,
        EndingDateTime: showformattedDate
      };

      // Create the final object with only allowed headers
      const tripObject: any = {};

      if (headers && headers.length > 0) {
        // Only include keys that are in the headers array
        headers.forEach(header => {
          const cleanHeader = header.replace(/\s+/g, "");
          // Use formatted value if available, otherwise use original trip value
          if (formattedValues[cleanHeader] !== undefined) {
            tripObject[header] = formattedValues[cleanHeader];
          } else if (trip[cleanHeader] !== undefined) {
            tripObject[header] = trip[cleanHeader]?.toString() ?? "";
          } else {
            tripObject[header] = "";
          }
        });
      } else {
        // If no headers provided, include all formatted values and original trip data
        Object.assign(tripObject, {
          ...trip,
          ...formattedValues,
          formattedDate: showformattedDate,
          isHighlighted: formattedDate !== undefined && Highligthdate !== undefined && formattedDate === Highligthdate
        });

        // Clean up duration fields
        if (tripObject.TripDurationHr !== undefined) delete tripObject.TripDurationHr;
        if (tripObject.TripDurationMins !== undefined) delete tripObject.TripDurationMins;
      }

      return tripObject;
    });
  };
  function splitArray(arr: Array<string[]>, size: number) {
    let result: any = [];
    arr.forEach(subArr => {
      for (let i = 0; i < subArr.length; i += size) {
        result.push(subArr.slice(i, i + size));
      }
    });
    return result;
  }

  const handleExportExcel = () => {

    const workbook = XLSX.utils.book_new();


    let consolidatedData = [];
    if (Ignitionreport.reportType == "Trip" && calculateTotalDurationAndDistance(trisdata) &&
      calculateTotalDurationAndDistance(trisdata).duration !==
      "NaN hrs NaN mins") {
      consolidatedData = generateTripJson(trisdata, eventfetch, session?.timezone, Highligthdate, customHeaderTitles)
      consolidatedData = [...consolidatedData,
      {
        AverageSpeed: "Total",
        IMEI
          :
          "",
        Status
          :
          "",
        TotalDistance
          :
          `${calculateTotalDurationAndDistance(trisdata).distance}${" "} ${session?.unit}`,
        TripDuration
          :
          calculateTotalDurationAndDistance(trisdata).duration
      }
      ]
    } else if (Ignitionreport.reportType == "DailyActivity" || Ignitionreport.reportType == "DetailReportByStreet" || Ignitionreport.reportType == "IdlingActivity" || Ignitionreport.reportType == "TripByZone" || Ignitionreport.reportType == "ZoneToZone") {

      consolidatedData = trisdata.map((i) => {
        let obj = {}
        customHeaderTitles.map((j, index) => {
          obj[j] = i[index]
        })
        return obj
      })



    }
    else if (Ignitionreport.reportType == "Ignition") {
      consolidatedData = splitArray(trisdata, 3).map((i) => {
        let obj = {}
        customHeaderTitles.slice(3).map((j, index) => {
          obj[j] = i[index]
        })
        return obj
      })
    }
    else if (Ignitionreport.reportType == "Events") {
      consolidatedData = trisdata.map((i) => {
        const { date, event } = i
        return {
          event,
          date,
          Address: i?.OsmElement?.display_name?.split(",")?.slice(0, 3).join(",")

        }
      })
    }
    else
      if (Ignitionreport.reportType == "fuelreport") {
        consolidatedData = trisdata.map((i) => {
          const { fuel, address, DateTimeDevice } = i

          return {
            "Address": address,
            "Fuel(in per%)": fuel,
            "DateTime": DateTimeDevice

          }
        })

      } else {
        toast.error("Invalid report Type", {
          style: {
            border: "1px solid red",
            padding: "16px",
            color: "red",
          },
          iconTheme: {
            primary: "red",
            secondary: "white",
          },
        });
      }


    XLSX.utils.book_append_sheet(workbook,
      XLSX.utils.json_to_sheet(consolidatedData),
      'data');


    XLSX.writeFile(workbook, `${Ignitionreport.VehicleReg}_${Ignitionreport.reportType}.xlsx`);
    setExportDropdownOpen(!exportDropdownOpen)
  };

  const handleExportPdf = async (data: any) => {
    const buffer = Buffer.from(data, "base64");
    setExportDropdownOpen(!exportDropdownOpen)
    window.open(
      URL.createObjectURL(
        new Blob([buffer], { type: "application/pdf" })
      )
    );

  };

  function calculateEmission(data) {

    let totalEmission = data.reduce((sum, obj) => {

      return sum + Number(obj.emission);
    }, 0);
    return parseFloat(totalEmission.toFixed(2));
  }



  function calculateTotalDurationAndDistance(data: TripsByBucket[]): {
    duration: string;
    distance: number;
  } {
    let totalHours = 0;
    let totalMinutes = 0;
    let totalDistance = 0;

    data.forEach((trip) => {
      totalHours += trip.TripDurationHr;
      totalMinutes += trip.TripDurationMins;

      if (trip.TotalDistance && typeof trip.TotalDistance === "string") {
        const distanceMatch = trip.TotalDistance.match(/([\d.]+)/);
        if (distanceMatch) {
          const distanceValue = parseFloat(distanceMatch[0]);
          if (!isNaN(distanceValue)) {
            totalDistance += distanceValue;
          }
        }
      }
    });
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;

    // Format total duration
    const duration = `${totalHours} hrs ${totalMinutes} mins`;
    const distance = parseFloat(totalDistance.toFixed(2));
    return { duration, distance };
  }

  const hanldeCloseDateTap = () => {
    setIsCustomPeriod(!isCustomPeriod);
    setShowWeekDays(true);
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      period: "today",
    }));

  };

  const hanldeCustomClick = () => {
    setIsCustomPeriod(!isCustomPeriod);
    setShowWeekDays(false);
  };

  return (
    <div>
      <p className="bg-green px-4 py-1 border-t-2  text-center text-2xl text-white font-bold zone_heading">
        Reports Filter
      </p>
      <form
        className="bg-bgLight  height_report_form"
      >
        <div className="bg-green-50 mt-5">
          <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 mt-5 mb-1 grid-cols-2  px-10 gap-2 ">
            <div className="xl:col-span-3 lg:col-span-6 md:col-span-6 sm:col-span-5 col-span-2 ">
              <div className="grid grid-cols-12 roport_vehicle">
                <div className="xl:col-span-3 lg:col-span-4 md:col-span-12  sm:col-span-10  col-span-12 mt-2 ">
                  <label className="text-labelColor ">
                    <b>Report Type:</b> &nbsp;&nbsp;
                  </label>
                </div>
                <div className="lg:col-span-8 md:col-span-8 col-span-12">

                  <Select
                    value={optionsTrip.find(option => option?.value === Ignitionreport?.reportType)}
                    onChange={handleInputChangeTrip}
                    options={optionsTrip}
                    placeholder="Select Report Type"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No options available"}
                    className="rounded-md w-full  outline-green border border-grayLight  hover:border-green  z-50"
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
                            ? "#e1f0e3"
                            : "transparent",
                        color: state.isSelected
                          ? "white"
                          : state.isFocused
                            ? "black"
                            : "black",
                        "&:hover": {
                          backgroundColor: "#e1f0e3",
                          color: "black",
                        },
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="xl:col-span-3 lg:col-span-6 md:col-span-6 sm:col-span-5 col-span-2 ">
              <div className="grid grid-cols-12 roport_vehicle">
                <div className="xl:col-span-3 lg:col-span-4 md:col-span-12  sm:col-span-10  col-span-12 mt-2">
                  <label className="text-labelColor">
                    <b>Vehicle:</b> &nbsp;&nbsp;
                  </label>
                </div>

                <div className="lg:col-span-8 md:col-span-8 col-span-12">
                  <Select

                    value={options.find(option => option?.value === Ignitionreport?.VehicleReg)}
                    onChange={handleInputChangeSelect}
                    options={options}
                    placeholder="Select Vehicle"
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "No options available"}
                    className="   rounded-md w-full outline-green border border-grayLight  hover:border-green z-50"
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
                            ? "#e1f0e3"
                            : "transparent",
                        color: state.isSelected
                          ? "white"
                          : state.isFocused
                            ? "black"
                            : "black",
                        "&:hover": {
                          backgroundColor: "#e1f0e3",
                          color: "black",
                        },
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
            {showWeekDays && (
              <>
                {/* Radio buttons - Reduced column span */}
                <div className="xl:col-span-1 lg:col-span-1 md:col-span-1 sm:col-span-2 flex justify-center mt-2">
                  <label className="flex ">
                    <input
                      type="radio"
                      className="w-5 h-4 form-radio"
                      style={{ accentColor: "green" }}
                      name="period"
                      value="today"
                      checked={Ignitionreport.period === "today"}
                      onChange={handleInputChange}
                    />
                    &nbsp;<b>Today</b>
                  </label>
                </div>
                <div className="xl:col-span-1 lg:col-span-1 md:col-span-1 sm:col-span-2  flex justify-center mt-2">
                  <label className="flex ">
                    <input
                      type="radio"
                      className="w-5 h-4"
                      name="period"
                      value="yesterday"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport.period === "yesterday"}
                      onChange={handleInputChange}
                    />
                    &nbsp;<b>Yesterday</b>
                  </label>
                </div>
                <div className="xl:col-span-1 lg:col-span-1 md:col-span-1 sm:col-span-2  flex justify-center mt-2">
                  <label className="flex ">
                    <input
                      type="radio"
                      className="w-5 h-4"
                      name="period"
                      value="week"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport.period === "week"}
                      onChange={handleInputChange}
                    />
                    &nbsp;<b>Week</b>
                  </label>
                </div>
                <div className="xl:col-span-1 lg:col-span-1 md:col-span-1 sm:col-span-2  flex justify-center mt-2">
                  <label className="flex ">
                    <input
                      type="radio"
                      className="w-5 h-4"
                      name="period"
                      value="custom"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport.period === "custom"}
                      onChange={handleInputChange}
                      onClick={hanldeCustomClick}
                    />
                    &nbsp;<b>Custom</b>
                  </label>
                </div>
              </>
            )}

            {isCustomPeriod && (
              <>
                {/* Date pickers - Reduced column span */}
                <div className="xl:col-span-2 lg:col-span-2 md:col-span-2 sm:col-span-4 col-span-4 lg:mt-0 md:mt-0 sm:mt-0 ">
                  <label className="text-labelColor flex flex-col">
                    <span className="text-green text-sm mb-1">From Date:</span>
                    <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                      <DatePicker
                        format="MM/DD/yyyy"
                        value={Ignitionreport.fromDateTime || null}
                        onChange={(e) => handleCustomDateChange("fromDateTime", e)}
                        variant="inline"
                        maxDate={currenTDates}
                        autoOk
                        inputProps={{ readOnly: true }}
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "16", height: "16" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        placeholder="Start Date"
                      />
                    </MuiPickersUtilsProvider>
                  </label>
                </div>
                <div className="flex xl:col-span-2 lg:col-span-2 md:col-span-2 sm:col-span-4 col-span-4 lg:mt-0 md:mt-0 sm:mt-0 mt-4">
                  <label className="text-labelColor flex flex-col">
                    <span className="text-green text-sm mb-1">To Date:</span>
                    <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                      <DatePicker
                        format="MM/DD/yyyy"
                        value={Ignitionreport.toDateTime || null}
                        onChange={(newDate: any) => handleCustomDateChange("toDateTime", newDate)}
                        variant="inline"
                        minDate={Ignitionreport.fromDateTime}
                        maxDate={currenTDates}
                        autoOk
                        inputProps={{ readOnly: true }}
                        placeholder="End Date"
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "16", height: "16" }}
                              className="text-gray"
                            />
                          ),
                        }}
                      />
                    </MuiPickersUtilsProvider>
                  </label>

                  <button
                    className="ml-6 text-green mt-5 -mb-5 text-xl font-bold"
                    onClick={hanldeCloseDateTap}
                  >
                    ×
                  </button>
                </div>

              </>
            )}

            {/* BUTTONS ROW - Now has space to fit in one line */}
            <div className="xl:col-span-2 lg:col-span-4 md:col-span-4 sm:col-span-6 col-span-2  ">
              <div className="relative" >
                <button
                  className={`bg-green py-2 px-3 sm:px-4 rounded-md shadow-md hover:shadow-gray transition duration-500 text-white min-w-[80px] sm:min-w-[100px] text-sm sm:text-base
              ${Ignitionreport.reportType &&
                      Ignitionreport.VehicleReg &&
                      (Ignitionreport.period === "today" ||
                        Ignitionreport.period === "yesterday" ||
                        Ignitionreport.period === "week" ||
                        (Ignitionreport.toDateTime && Ignitionreport.fromDateTime))
                      ? ""
                      : "opacity-50 cursor-not-allowed"
                    }`}
                  type="submit"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (
                      Ignitionreport.reportType &&
                      Ignitionreport.VehicleReg &&
                      (Ignitionreport.period === "today" ||
                        Ignitionreport.period === "yesterday" ||
                        Ignitionreport.period === "week" ||
                        (Ignitionreport.toDateTime && Ignitionreport.fromDateTime)) && trisdata.length > 0
                    ) {

                      setExportDropdownOpen(!exportDropdownOpen)
                    }
                  }}
                  className={`bg-green py-2 px-3 ml-2 sm:px-4 rounded-md shadow-md hover:shadow-gray transition duration-500 text-white min-w-[80px] sm:min-w-[100px] text-sm sm:text-base
              ${Ignitionreport.reportType &&
                      Ignitionreport.VehicleReg &&
                      (Ignitionreport.period === "today" ||
                        Ignitionreport.period === "yesterday" ||
                        Ignitionreport.period === "week" ||
                        (Ignitionreport.toDateTime && Ignitionreport.fromDateTime)) && trisdata.length > 0
                      ? ""
                      : "opacity-50 cursor-not-allowed"
                    }`}
                  type="submit"
                >
                  Export
                </button>
                {exportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <ul>
                      <li
                        onClick={handleExportExcel}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-[#e5e7eb] cursor-pointer"
                      >
                        Export to XLS
                      </li>
                      <li
                        onClick={() => handleExportPdf(pdfData)}

                        className="px-4 py-2 text-sm text-gray-700 hover:bg-[#e5e7eb] cursor-pointer"
                      >
                        Export to PDF
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Render your table below the form */}

      {trisdata && trisdata.length > 0 && tableShow && (
        <div>
          <div className="mt-8 mx-auto height_table">
            <div style={{ width: "100%", borderRadius: "2px" }}>
              {
                Ignitionreport.reportType == "fuelreport" ? (
                  <>
                    <FuelChart data={
                      trisdata.map((i) => {
                        return {
                          dateTime: i.DateTimeDevice,
                          fuel: i.fuel,
                          address: i.address,
                          isFuelinLtr: i.isFuelinLtr

                        }
                      })
                    } />
                  </>
                ) : (
                  <table className="w-full border-collapse border border-gray-300">
                    <thead
                      style={{ position: "sticky", top: -1 }}
                      className="bg-green"
                    >
                      <tr>
                        {customHeaderTitles.map((header, index) => (
                          <th
                            key={index}
                            className="border border-gray-300 px-4 py-2"
                          >
                            <p className="text-white text-start font-popins font-medium">
                              {header}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trisdata?.map((trip, tripIndex) => {
                        let formattedDate;
                        let showformattedDate;
                        if (trip.date === undefined && eventfetch) {
                          let inputDate = (eventfetch == "ignitionOff" ? trip[4] : trip[1]);
                          inputDate = inputDate?.replace(/\s+/g, ' ').trim(); // Remove extra spaces                      
                          let momentDate = moment.tz(inputDate, session?.timezone);
                          formattedDate = momentDate.toISOString();
                          showformattedDate = formattedDate
                        }
                        else {
                          const date = new Date(trip.date); // Convert to Date object                      
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const year = date.getUTCFullYear();
                          const month = months[date.getUTCMonth()];
                          const day = date.getUTCDate();
                          const hours = String(date.getUTCHours()).padStart(2, '0');
                          const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                          const seconds = String(date.getUTCSeconds()).padStart(2, '0');
                          const formattedDate2 = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
                          let momentDate = moment.tz(trip.date, session?.timezone);
                          formattedDate = momentDate.toISOString();
                          showformattedDate = formattedDate2

                        }
                        return (
                          <tr key={tripIndex}
                            style={{
                              backgroundColor: formattedDate !== undefined && Highligthdate !== undefined && formattedDate === Highligthdate ? "#D1FAE5" : "white", // Highlight row if the date matches
                            }}

                          >
                            {columnHeaders.map((header, headerIndex) => {
                              const dataKey = header.replace(
                                /\s+/g,
                                ""
                              ) as keyof TripsByBucket;
                              return (
                                <td
                                  key={headerIndex}
                                  className="border border-gray-300 px-4 py-2"
                                >
                                  {(header === "TripStart" ||
                                    header === "TripEnd" ||
                                    header === "date" ||
                                    header === "StartDateTime" ||
                                    header === "EndingDateTime") ? (
                                    <>
                                      {showformattedDate}

                                    </>
                                  ) : header === "TripDuration" ? (
                                    `${trip.TripDurationHr} hrs ${trip.TripDurationMins} mins`
                                  ) : header === "DriverName" && !trip[dataKey] ? (
                                    "Driver Not Assigned"
                                  ) : (
                                    trip[dataKey]?.toString() ?? ""
                                  )}
                                  {header === "Address" && trip.OsmElement
                                    ? `${trip.OsmElement.display_name.split(",").slice(0, 3)
                                    } `
                                    : ""}
                                  { }
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {Ignitionreport.reportType == "co2emission" ? (

                        <>
                          <tr
                            style={{ position: "sticky", bottom: 0, zIndex: 2 }}
                            className="bg-green"
                          >
                            {calculateTotalDurationAndDistance(trisdata) &&
                              calculateTotalDurationAndDistance(trisdata).duration !==
                              "NaN hrs NaN mins" && (
                                <td colSpan={1}>
                                  <span style={{ color: "white" }}>&nbsp; Total:</span>
                                </td>
                              )}
                            {calculateTotalDurationAndDistance(trisdata) &&
                              calculateTotalDurationAndDistance(trisdata).duration !==
                              "NaN hrs NaN mins" && (
                                <td
                                  colSpan={1}
                                  className="border border-gray-300 px-4 py-2"
                                >
                                  <span style={{ color: "white" }}>
                                    {
                                      calculateTotalDurationAndDistance(trisdata)
                                        .duration
                                    }
                                  </span>
                                </td>
                              )}

                            {calculateTotalDurationAndDistance(trisdata) &&
                              calculateTotalDurationAndDistance(trisdata).duration !==
                              "NaN hrs NaN mins" && (

                                <td
                                  colSpan={1}
                                  className="border border-gray-300 px-4 py-2"
                                >
                                  <span style={{ color: "white" }}>
                                    {
                                      calculateTotalDurationAndDistance(trisdata)
                                        .distance
                                    }{" "}
                                    {session?.unit}
                                  </span>
                                </td>

                              )}



                            {/*  //emission */}
                            <td
                              colSpan={columnHeaders.length}
                              className="border border-gray-300 px-4 py-2"
                            >
                              {
                                trisdata.emission !== null && (
                                  <span style={{ color: "white" }}>
                                    {/*  {
            calculateEmission(trisdata.emission)
              
          }{" "} */}
                                    {calculateEmission(trisdata)}{" "}
                                    kg
                                  </span>
                                )}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr
                            style={{ position: "sticky", bottom: 0, zIndex: 2 }}
                            className="bg-green"
                          >
                            {calculateTotalDurationAndDistance(trisdata) &&
                              calculateTotalDurationAndDistance(trisdata).duration !==
                              "NaN hrs NaN mins" && (
                                <td colSpan={3}>
                                  <span style={{ color: "white" }}>&nbsp; Total:</span>
                                </td>
                              )}
                            {calculateTotalDurationAndDistance(trisdata) &&
                              calculateTotalDurationAndDistance(trisdata).duration !==
                              "NaN hrs NaN mins" && (
                                <td
                                  colSpan={1}
                                  className="border border-gray-300 px-4 py-2"
                                >
                                  <span style={{ color: "white" }}>
                                    {
                                      calculateTotalDurationAndDistance(trisdata)
                                        .duration
                                    }
                                  </span>
                                </td>
                              )}
                            <td
                              colSpan={columnHeaders.length}
                              className="border border-gray-300 px-4 py-2"
                            >
                              {calculateTotalDurationAndDistance(trisdata) &&
                                calculateTotalDurationAndDistance(trisdata).duration !==
                                "NaN hrs NaN mins" && (
                                  <span style={{ color: "white" }}>
                                    {
                                      calculateTotalDurationAndDistance(trisdata)
                                        .distance
                                    }{" "}
                                    {session?.unit}
                                  </span>
                                )}
                            </td>
                          </tr>
                        </>
                      )}

                    </tbody>
                  </table>

                )
              }
            </div>
          </div>
          {/*  <div
            className="pagination-wrapper"
            style={{ width: "100%" }} // Set the width to 100% using inline style
          >
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={trisdata.length}
              rowsPerPage={rowsPerPages}
              page={currentPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              className="report_paginations_one"
            />
          </div> */}
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

"use client";
import { getallNotifications, getAllVehicleByUserId, vehicleListByClientId } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table } from "antd";
const moment = require("moment-timezone");
import {
  MuiPickersUtilsProvider, DatePicker
} from "@material-ui/pickers";
import DateFnsMomemtUtils from "@date-io/moment";
import { DeviceAttach } from "@/types/vehiclelistreports";
import EventIcon from "@material-ui/icons/Event";
import { Toaster } from "react-hot-toast";
import "./index.css"
import { ColumnType } from "antd/es/table";
import { useRouter } from "next/navigation";
export default function NotificationTab() {
  const { data: session } = useSession();
  const router = useRouter()
  const [notifications, setnotifications] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [vehicleReg, setVehicleReg] = useState(null)
  const [period, setPeriod] = useState(null)
  const [fromDate, setfromDate] = useState(null)
  const [toDate, settoDate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const [getShowRadioButton, setShowRadioButton] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  const allData = useSelector((state) => state?.zone);

  const fetchNotifications = async (payload) => {
    setLoading(true); // Set loading to true before the fetch starts
    try {
      if (session && session?.userRole === "Admin") {
        const NotificationsData = await getallNotifications({
          token: session?.accessToken,
          body: JSON.stringify({ ...payload, "timezone": session?.timezone, "clientId": `${session?.clientId}` })
        });
        setFilteredNotifications(NotificationsData.data)
        setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
      }
      else {
        const NotificationsData = await getallNotifications({
          token: session?.accessToken,
          body:
            JSON.stringify({ ...payload, "timezone": session?.timezone, "userId": `${session?.userId}` })
        });
        setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false); // Set loading to false after the fetch is complete
    }
  };
  useEffect(() => {

    fetchNotifications({});
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "SuperAdmin") {
          if (session) {
            if (allData?.vehicle.length <= 0) {
              const Data = await vehicleListByClientId({
                token: session?.accessToken,
                clientId: session?.clientId,
              });
              setVehicleList(Data);
            }
            setVehicleList(allData?.vehicle);
          }
        } else {
          if (session) {
            const data = await getAllVehicleByUserId({
              token: session?.accessToken,
              userId: session?.userId,
            });
            setVehicleList(data);
          }
        }
      } catch (error) { }
    };
    vehicleListData();
  }, [])
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter((notification: any) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.event.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, notifications]);
  const handleCloseDateTime = () => {
    setShowRadioButton(false);
    setfromDate(null)
    settoDate(null)
  };
  const handleSubmit = async (e: React.FormEvent) => {
    fetchNotifications({ vehicleReg });

  }
  const options =
    vehicleList?.data?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];
  const handleInputChangeSelect = (e: any) => {
    if (!e) { setVehicleReg(null) } else { setVehicleReg(e.value) }

  }
  const handleInputChange = (e: any) => {
    let startDateTime, endDateTime;
    if (e.target.value == "today") {
      const today = moment().tz(session?.timezone);
      // const time = today.format("HH:mm:ss");
      startDateTime =
        today.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
      endDateTime =today.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
    } else if (e.target.value == "yesterday") {
        const yesterday = moment().subtract(1, "day").tz(session?.timezone);
        startDateTime = yesterday.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        endDateTime = yesterday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
      } else if (e.target.value == "week") {
          const startOfWeek = moment()
            .subtract(7, "days")
            .startOf("day")
            .tz(session?.timezone);
          const oneday = moment().subtract(1, "day").endOf("day")
            .tz(session?.timezone);
          startDateTime = startOfWeek.format("YYYY-MM-DDTHH:mm:ss") + "Z";
          endDateTime =
            oneday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        } else {
          setPeriod(e.target.value)
          setFilteredNotifications(notifications)
          return
        }
    const start = moment(startDateTime);
    const end = moment(endDateTime);
    setFilteredNotifications(
      notifications.filter((e: any) => e.createdAt != null)
        .filter((i: any) => {
          let createdAt = moment(i.date);
          return createdAt.isBetween(start, end, null, "[]");
        })
    )
    setPeriod(e.target.value)
  }


  useEffect(() => {
    if (fromDate != null && toDate != null) {
      const start = moment(fromDate);
      const end = moment(toDate);
      setFilteredNotifications(
        notifications.filter((i: any) => {
          let createdAt = moment(i.date);
          return createdAt.isBetween(start, end, null, "[]");
        })
      )
    }
  }, [fromDate, toDate])
  const handleClick = () => {
    setShowRadioButton(!getShowRadioButton);
  };
  const getBorderColor = () => {
    if (searchQuery === '') {
      return '#3B82F6'; // Blue (Default color)
    }
    return filteredNotifications.length > 0 ? '#34D399' : '#FF0000';
  };
  const handleDateChange = (fieldName: string, newDate: any) => {

    // setCurrentDateDefaul(true);
    if (fieldName == "fromDateTime") {
      setfromDate(newDate?.toISOString())
    }
    if (fieldName == "toDateTime") {
      settoDate(newDate?.toISOString())
    }

  };
  const togglePicker = () => {
    setIsPickerOpen(!isPickerOpen);
  };
  const [columns]: ColumnType = useState([
    {
      title: "Event Type",
      dataIndex: "title",
      key: "title",
      // render: (text, r) => <a style={{ fontWeight: "bold" }}>{text.replace(" Alert","")}</a>      
    },
    {
      title: "Date",
      dataIndex: "dateTime",
      key: "dateTime"
    },
    {
      title: "Vehicle Reg",
      dataIndex: "description",
      key: "description",
      render: (text, r) => <p>{text?.split("has")[0].replace("Your Vehicle ", "")}</p>
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, r) => (
        <div className="relative group inline-block">  {/* Make the parent relative to the icon */}
          {/* SVG icon with hover effect */}
          <div
            onClick={() => handleNavigateToReports(r)}
            className="cursor-pointer p-2 rounded-full bg-gray-200 hover:bg-gray-300 border-2 transition-all duration-300 ease-in-out hover:translate-y-[-5px]"
          >
            <svg
              version="1.0"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 535 567"
              className="w-6 h-6"
            >
              <g>
                <g>
                  <path d="M38,460.2c1.2,0,2.3,0,3.4,0c48.8,0,97.6,0,146.4-0.1c2.3,0,3.2,0.7,4.1,2.8c3.6,8.4,7.4,16.7,11.2,25
			c0.3,0.6,0.5,1.1,0.9,1.9c-65.4,0-130.6,0-195.9,0c0-138.7,0-277.4,0-416.2c31.7,0,63.4,0,95.4,0c0,0.9,0.1,1.8,0.1,2.7
			c0,9.2,0,18.5,0,27.7c0,1.4-0.4,2.9-0.9,4.1c-4.7,10.7-1.7,22.8,7.7,30c9,6.9,21.4,6.8,30.6-0.5c8.8-6.9,11.7-19.2,7.1-29.6
			c-0.6-1.3-0.9-2.7-0.9-4.1c-0.1-9.1,0-18.3,0-27.4c0-0.9,0-1.9,0-3c51.1,0,101.9,0,153.1,0c0,0.8,0,1.5,0,2.3c0,9.6,0,19.1,0,28.7
			c0,1.1-0.3,2.2-0.7,3.2c-4.2,9.4-2.6,20.1,4.1,27.4c6.9,7.5,17.5,10.1,26.9,6.6c9.6-3.5,16.1-12.3,16.2-22.6
			c0-3.7-1.4-7.5-2.2-11.2c-0.3-1.3-0.8-2.6-0.8-3.9c-0.1-9.2,0-18.5,0-27.7c0-0.9,0-1.7,0-2.8c32,0,63.7,0,95.6,0
			c0,51.8,0,103.5,0,155.6c-0.8-0.3-1.5-0.5-2.2-0.7c-8.4-2.8-16.8-5.7-25.3-8.4c-1.6-0.5-2.3-1.1-2.3-2.9c0.1-8.8,0-17.7,0.1-26.5
			c0-2.4-0.7-2.9-3-2.9c-52.1,0.1-104.2,0-156.3,0c-69.7,0-139.3,0-209,0c-1.1,0-2.2,0-3.5,0C38,278.7,38,369.3,38,460.2z"/>
                  <path d="M365.1,238.6c-87.2,0.4-158.8,70.6-160,158.5c-1.3,90.3,71.4,163.1,160.6,163.2c90.3,0.1,161.8-73.6,161.2-162
			C526.3,310.7,454.8,238.2,365.1,238.6z M483.3,455.5c-4.2,8.9-9.4,17.1-15.5,24.8c-6.1,7.7-13,14.6-20.7,20.7
			c-7.7,6.1-15.9,11.3-24.8,15.6c-8.9,4.3-18.2,7.5-27.9,9.7c-9.6,2.2-19.3,3.2-29.1,3.2c-71.3-0.1-129.4-58.8-129.3-130.6
			c0.2-71.4,58.6-129.5,130.2-129.4c68.3,0,129,54.2,129.7,129.5c0.1,9.6-0.5,19.1-2.9,28.6C490.5,437.2,487.6,446.6,483.3,455.5z"
                  />
                  <path d="M338.9,71.4c0,14.9,0,29.8,0,44.8c0,9.6-7.2,17.1-16.5,17.1c-9.7,0.1-17.1-7.2-17.2-16.9c-0.1-30-0.1-60,0-90
			c0-9.4,7.7-16.8,17-16.7c9.4,0.1,16.7,7.5,16.7,17C338.9,41.6,338.9,56.5,338.9,71.4z"/>
                  <path d="M108.7,71.4c0-14.9-0.1-29.8,0-44.8c0.1-11.8,10.9-19.7,22-16.2c6.7,2.1,11.5,8.4,11.5,15.6c0.1,30.2,0.1,60.5,0,90.7
			c0,9.4-7.5,16.5-16.8,16.5c-9.3,0-16.6-7.2-16.7-16.6C108.6,101.6,108.7,86.5,108.7,71.4z"/>
                  <path d="M127.6,277.9c0.1,0.9,0.2,1.5,0.2,2.1c0,11.9,0,23.8,0,35.6c0,1.5-0.1,2.4-2,2.4c-12.1-0.1-24.2,0-36.4,0
			c-0.5,0-1.1-0.2-1.7-0.2c0-0.8-0.1-1.5-0.1-2.2c0-11.7,0-23.4,0-35.2c0-1.9,0.4-2.6,2.5-2.6c11.8,0.1,23.6,0,35.4,0
			C126.1,277.8,126.8,277.9,127.6,277.9z"/>
                  <path d="M87.8,265.4c0-13.3,0-26.5,0-39.8c0.8-0.1,1.5-0.2,2.2-0.2c11.8,0,23.6,0,35.4-0.1c2,0,2.6,0.6,2.6,2.6
			c-0.1,11.8,0,23.6,0,35.4c0,1.2,0.2,2.4-1.8,2.4c-12.3-0.1-24.7,0-37-0.1C88.7,265.6,88.3,265.4,87.8,265.4z"/>
                  <path d="M205,265.5c-13.3,0-26.4,0-39.7,0c0-13.3,0-26.5,0-39.9c13.2,0,26.3,0,39.7,0C205,238.8,205,252,205,265.5z" />
                  <path d="M127.7,330.4c0,0.8,0.1,1.6,0.1,2.4c0,11.7,0,23.4,0,35.1c0,1.5-0.1,2.5-2.1,2.5c-12.1-0.1-24.2,0-36.3-0.1
			c-0.5,0-0.9-0.1-1.6-0.2c0-13.2,0-26.4,0-39.8C101.1,330.4,114.3,330.4,127.7,330.4z"/>
                  <path d="M87.8,382.8c13.3,0,26.5,0,39.8,0c0.1,0.7,0.2,1.3,0.2,1.9c0,12,0,23.9,0,35.9c0,1.5-0.3,2.3-2.1,2.3
			c-12.2-0.1-24.4,0-36.6,0c-0.4,0-0.8-0.1-1.4-0.2C87.8,409.4,87.8,396.2,87.8,382.8z"/>
                  <path d="M165.1,278c13.4,0,26.6,0,40,0c0,1,0,1.9,0,2.7c0,7.9,0.1,15.9-0.1,23.8c0,1.8-0.8,3.7-1.4,5.4c-0.3,1-1.2,1.8-1.4,2.8
			c-1.3,4.6-4.4,5.7-9,5.4c-8.4-0.4-16.8-0.1-25.2-0.1c-0.9,0-1.9,0-2.9,0C165.1,304.5,165.1,291.4,165.1,278z"/>
                  <path d="M165.2,370.4c0-13.5,0-26.7,0-40c9.6,0,19,0,28.7,0c-0.8,2.3-1.6,4.4-2.4,6.6c-3.7,10.2-6.4,20.7-8.2,31.4
			c-0.3,1.6-0.9,2.1-2.5,2.1C175.7,370.3,170.5,370.4,165.2,370.4z"/>
                  <path d="M242.6,260.9c0-11.7,0-23.4,0-35.3c13.3,0,26.5,0,40,0c0,2.6,0.1,5-0.1,7.5c0,0.5-0.6,1.3-1.2,1.6
			c-13.9,7.2-26.6,16-38.4,26.3C242.9,260.9,242.8,260.9,242.6,260.9z"/>
                  <path d="M165.2,382.8c5.5,0,10.7,0,16.1,0c0,13.3,0,26.5,0,39.8c-5,0-10.5,0-16.1,0C165.2,409.4,165.2,396.2,165.2,382.8z" />
                  <path d="M454.2,380.3v0.9C454.2,380.9,454.1,380.6,454.2,380.3L454.2,380.3z" />
                </g>
                <path d="M417.8,404.7c0.1,0.1,0.2,0.1,0.2,0.2C418,404.8,418,404.8,417.8,404.7z M437.3,379.8L437.3,379.8
		C437.3,379.8,437.4,379.8,437.3,379.8C437.3,379.8,437.3,379.8,437.3,379.8z M437.3,379.8L437.3,379.8
		C437.3,379.8,437.4,379.8,437.3,379.8C437.3,379.8,437.3,379.8,437.3,379.8z"/>
                <path d="M456.6,429.6c0-1.9-0.1-4.1-2.2-5.3c-0.3-0.2-0.3-0.9-0.3-1.3c0-3.4,0.2-6.9,0.2-10.3c0-3.5,0-7,0-10.5c0-0.1,0-0.1,0-0.2
		c0.1-3.5,0.3-14.7-0.2-20.6c0-0.3,0-0.6-0.1-0.9c-0.1-1.3-0.3-2.3-0.5-2.6c-1.2-3.3-3.3-6.1-6.1-8.1c-2.9-2.1-6.1-3.9-8.9-5.8
		c3.7-0.4,7.6-0.5,11.3-1.3c2.1-0.4,4.1-1.8,5.7-3.3c2.1-2,1.7-4-0.9-5.4c-4.4-2.4-9.2-3.2-14.2-3.2c-1.6,0-2.4,0.8-2.3,2.4
		c0.1,1.3,0.3,2.6,0.3,3.8c0,0.5-0.3,1.2-0.7,1.3c-0.4,0.2-1.2-0.1-1.5-0.4c-0.5-0.5-0.8-1.2-1-1.8c-1.3-3.3-2.3-6.7-3.8-9.9
		c-3.6-7.4-7.2-14.8-11.1-22.1c-1.9-3.5-5.1-5.2-9.1-5.2c-1.3,0-2.5-0.3-3.8-0.4c-27.6-2.4-55.1-2.2-82.7-0.2
		c-7.6,0.6-12.8,3.4-15.8,10.2c-0.1,0.1-0.2,0.3-0.2,0.4c-3.7,8.4-7.4,16.9-11.1,25.3c-0.5,1.1-0.8,2.3-1.4,3.3
		c-0.3,0.5-1.2,0.6-1.8,0.8c-0.2-0.6-0.6-1.1-0.7-1.6c0-1,0.2-1.9,0.3-2.9c0.2-2.3-0.6-3.5-2.7-3.1c-4.4,0.7-8.9,1.4-13.1,2.9
		c-3.6,1.2-3.9,4.7-0.6,6.7c2.3,1.4,5.1,2.2,7.8,2.7c2.8,0.5,5.8,0.4,8.8,0.6c-3.3,2-6.4,3.8-9.3,5.9c-4.9,3.7-7.4,8.5-7.2,14.9
		c0.3,12.6,0.2,25.2,0.3,37.8c0,0.8-0.2,1.7-0.5,2.5c-0.6,1.5-1.7,3-1.8,4.5c-0.3,4.1-0.3,8.2-0.1,12.2c0,1.4,0.8,2.7,1.3,4.1
		c0.3,0.9,0.8,1.7,0.8,2.6c0,5.5,0,10.9,0,16.4c0,4.2,1.2,5.4,5.2,5.4c5.9,0,11.9,0,17.8,0c3.4,0,5.3-1.9,5.4-5.4
		c0.1-3.8,0-7.5,0-11.3c0-0.7,0.1-1.4,0.2-2h119.9c0.1,0.5,0.2,0.9,0.2,1.3c0,3.9,0,7.9,0,11.8c0,3.7,1.9,5.6,5.6,5.6
		c5.6,0,11.2,0,16.9,0c5,0,5.8-1.2,6-6.1c0.3-7.1-1.1-14.3,1.7-21.4C457.7,438.5,456.7,433.8,456.6,429.6z M305.9,356
		c2.2-6.1,4.6-12.2,6.9-18.2c0.9-2.2,1.9-4.4,2.8-6.6c1.8-4.3,5-6.6,9.6-6.8c11.3-0.5,22.6-1,33.9-1.4c1.5-0.1,3,0,4.5,0l0,0.4
		c-1.6,0.2-3.1,0.3-4.7,0.5c-1.8,0.3-2.9,1.4-2.6,3.4c0.3,1.9,1.5,2.2,3.1,2.2c4.3,0,8.7,0,13,0c1.6,0,2.9-0.3,3-2.3
		c0.2-1.8-0.6-2.9-2.4-3.3c-1.6-0.3-3.1-0.4-4.7-1c1.3,0,2.7,0,4,0c11.5,0.5,22.9,0.9,34.4,1.5c4.5,0.2,7.8,2.4,9.5,6.6
		c3.4,8.6,6.8,17.3,10.1,26c1,2.7,0.1,3.6-3.1,3.6c-17.8,0-35.6-0.1-53.5-0.1c-19.7,0-39.5,0-59.2,0.1h-1.4
		C305.2,360.6,304.5,359.7,305.9,356z M350.7,414.5c-0.1-1.2-0.2-2.2-0.2-3.3C350.6,412.4,350.7,414,350.7,414.5
		c0,0,35-0.4,49.8-0.4c3.7,0,4.5,3.5,4.6,4c-0.8,0.1-67.2,0.7-77.8,0.7h-2.4c1.5-4,2.1-4.5,5.9-4.5
		C336.5,414.4,349.8,414.5,350.7,414.5z M331.5,409.3c1.1-3.1,3-4.4,6-4.4c14.4,0,41.6,0.1,56,0.1c3,0,3.2-0.2,5.9,4.3
		c0.3,0.4-47.8-0.6-49.1,0H331.5z M297.4,423.5c-3.8-0.1-7-3.4-7-7.2c0-3.8,3.3-7,7-7.1c3.9,0,7.2,3.2,7.2,7.2
		C304.6,420.3,301.3,423.6,297.4,423.5z M308.8,404.8l-0.1,0.6c-6.9-1.5-13.8-2.9-20.6-4.4c-3-0.7-4.4-2.7-4.3-5.7
		c0.1-3.2,0.1-6.4,0.4-9.6c0.4-3.6,2.8-6.1,5.8-7.8c0.8-0.4,2.7-0.2,3.1,0.4c3.4,4.7,8.5,5.9,13.7,7.4c4.1,1.2,8.1,2.9,12.1,4.5
		c2.1,0.9,2.8,2.7,2.3,5C320.2,399.6,313.4,404.9,308.8,404.8z M407,427.9c-19.2,0.1-38.3,0.1-57.5,0.2c-8.2,0-16.4,0.1-24.5,0.2
		c-0.8,0-4.4,0-4.4,0c-0.1-1.8,1.6-4.4,2.7-4.4c14.1,0,28.2,0,42.3,0c0,0.1,27.9,0.4,41.9,0.5c2,0.4,2.9,3.2,2.9,3.5
		C410.4,427.8,408.9,427.9,407,427.9z M417.8,404.7c0.2,0.1,0.2,0.1,0.2,0.2C418,404.8,417.9,404.8,417.8,404.7z M440.9,419.1
		c-1.7,3.4-5.2,5-8.6,3.8c-3.3-1.1-5.6-4.9-4.7-8.5c0.3-1.2,2.9-5,7.5-4.7C441.8,410.3,441.2,418.5,440.9,419.1z M444.3,400.7
		c-5.8,1.3-11.5,2.8-17.4,3.5c-8.6,1-13-2.5-16.2-10.8c-0.2-0.4-0.3-0.8-0.4-1.2c0,0,0,0,0-0.1c0.3,0.1,0.4-0.6,2-1.1
		c15.9-4.5,23.7-10.3,24.9-11.3c0,0,0.1,0,0.1-0.1c0.1,0,0.1-0.1,0.1-0.1c2.8-2.7,4.8-2.9,7.4,0.1c1.2,1.4,2.4,3.3,2.6,5
		c0.5,3.7,0.4,7.5,0.5,11.2C448.1,398.6,446.7,400.2,444.3,400.7z"/>
                <path d="M418,404.9c-0.1-0.1-0.2-0.1-0.2-0.2C418,404.8,418,404.8,418,404.9z" />
              </g>
            </svg>
          </div>

          {/* Popup that appears on hover over the SVG */}
          {/* <div
            className="absolute left-[110px]  transform -translate-x-1/2  px-2 py-1 bg-white text-black rounded-md opacity-0 group-hover:opacity-100 group-hover:visible visibility-hidden transition-all duration-300 z-10"
          >
            Navigate to Reports
          </div>
        </div> */}
          {/* <div
        className="absolute w-[150px]  left-[110px] top-0  transform -translate-x-1/2  px-2 py-1 bg-white text-black rounded-md opacity-0 group-hover:opacity-100  visibility-hidden transition-all duration-300 z-10"
      >
        Navigate to Reports
      </div> */}
        </div>
      ),
    }


    ////////////

    // {
    //   title: "Title",
    //   dataIndex: "title",
    //   key: "title",
    //   render: (text, r) => <a style={{ fontWeight: "bold" }}>{text.replace(" Alert", "")}</a>
    // },    
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",    
    // },



  ]);



  const handleNavigateToReports = (record: any) => {

    /*    const dateObj = new Date(record.dateTime);
   
   // Format the date as YYYY-MM-DD
   const formattedDate = dateObj.toISOString().slice(0, 10);; */

    let dateTime = record.dateTime;
    let dateParts = dateTime.split(' ');

    // Create a mapping for month names to month numbers
    let monthMapping = {
      "Jan": "01", "January": "01",
      "Feb": "02", "February": "02",
      "Mar": "03", "March": "03",
      "Apr": "04", "April": "04",
      "May": "05",
      "Jun": "06", "June": "06",
      "Jul": "07", "July": "07",
      "Aug": "08", "August": "08",
      "Sep": "09", "September": "09",
      "Oct": "10", "October": "10",
      "Nov": "11", "November": "11",
      "Dec": "12", "December": "12"
    };

    // Extract day, month, and year
    let day = dateParts[0];
    let month = monthMapping[dateParts[1]];
    let year = dateParts[2];

    // Format date as YYYY-MM-DD
    let formattedDate = `${year}-${month}-${day}`;

    const formattedDate2 = dateTime.slice(12);

    router.push(`/Reports?vehicleReg=${record.vehicleReg}&event=${record.event}&dateTime=${formattedDate}&Time=${formattedDate2}`); // Navigate to Notifications page

  };


  return (
    <>
      <div className="main_journey">
        <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
          Notifications
        </p>
        <div
          className="grid xl:grid-cols-10 lg:grid-cols-10 md:grid-cols-12  gap-2
         lg:px-4 text-start  bg-bgLight select_box_journey"
        >
          <div
            className="xl:col-span-1 lg:col-span-2 md:col-span-3 col-span-12 select_box_column">
            <input
              type="text"
              placeholder="Search Notifications..."
              className="text-sm p-[0.4rem] rounded-md w-full notification-search"
              style={{
                borderColor: getBorderColor(),
              }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12 days_select">
            {getShowRadioButton ? (
              <div className="grid lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12  -mt-2  grid-cols-12  xl:px-10 lg:px-10 xl:gap-5 lg:gap-5 gap-2 flex justify-center ">
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 lg:mt-0 md:mt-0 sm:mt-0  "
                // onClick={togglePickerFromDate}
                >
                  <label className="text-green">From</label>
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <DatePicker
                      // open={isPickerOpenFromDate}
                      format="MM/DD/yyyy"
                      value={fromDate || null}
                      onChange={(newDate: any) =>
                        handleDateChange("fromDateTime", newDate)
                      }
                      style={{ marginTop: "-3%" }}
                      variant="inline"
                      placeholder="Start Date"
                      maxDate={new Date()}
                      autoOk
                      inputProps={{ readOnly: true }}
                      InputProps={{
                        endAdornment: (
                          <EventIcon
                            style={{ width: "20", height: "20" }}
                            className="text-gray"
                          />
                        ),
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 "
                  onClick={togglePicker}
                >
                  <label className="text-green">To</label>
                  <div>
                    {/* <h1>test</h1> */}
                    <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                      <DatePicker
                        style={{ marginTop: "-3%" }}
                        className="text-red"
                        format="MM/DD/yyyy"
                        value={toDate || null}
                        onChange={(newDate: any) =>
                          handleDateChange("toDateTime", newDate)
                        }
                        variant="inline"
                        minDate={fromDate || new Date()}
                        placeholder="End Date"
                        inputProps={{ readOnly: true }}
                        maxDate={new Date()}
                        // shouldDisableDate={(date) => !isCurrentDate(date)}
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "20", height: "20" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        autoOk
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                </div>
                <div className="lg:col-span-1 col-span-1   ">
                  <button
                    className="text-green ms-5  text-2xl font-bold"
                    onClick={handleCloseDateTime}
                  >
                    x
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="grid xl:grid-cols-11 lg:grid-cols-12  md:grid-cols-12 grid-cols-12 -mt-2 "
              // style={{ display: "flex", justifyContent: "start" }}
              >
                <div
                  className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2 col-span-4 period_select"
                  id="today_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4 form-radio"
                      style={{ accentColor: "green" }}
                      name="period"
                      disabled={loading}
                      value="today"
                      checked={period === "today"}
                      onChange={handleInputChange}
                    />
                    &nbsp;Today
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2  lg:-ms-4 col-span-4 period_select">
                  <label className="text-sm  text-black font-bold font-popins  w-full pt-3 ">
                    <input
                      type="radio"
                      className="lg:w-5 w-4  md:w-4 h-4 md:-ms-3 -ms-0 lg:-ms-0 xl:-ms-0   form-radio text-green"
                      name="period"
                      id="yesterday_radio_button"
                      disabled={loading}
                      value="yesterday"
                      style={{ accentColor: "green" }}
                      checked={period === "yesterday"}
                      onChange={handleInputChange}
                    />
                    <span className="lg:ms-1 md:ms-1 sm:ms-1 ms-2">
                      Yesterday
                    </span>
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3 md:col-span-3  lg:-ms-1 col-span-4 period_select">
                  <label className="text-sm text-black font-bold font-popins  ">
                    <input
                      type="radio"
                      className="w-5 h-4 lg:w-4  "
                      name="period"
                      disabled={loading}
                      value="week"
                      style={{ accentColor: "green" }}
                      checked={period === "week"}
                      onChange={handleInputChange}
                    />
                    &nbsp;&nbsp;Week
                  </label>
                </div>

                <div
                  className="xl:col-span-2 lg:col-span-3 md:col-span-3 lg:-ms-4
                md:-ms-4 sm:-ms-4 -ms-0 col-span-3 period_select_custom"
                  id="custom_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4  lg:w-4 "
                      disabled={loading}
                      name="period"
                      value="custom"
                      style={{ accentColor: "green" }}
                      checked={period === "custom"}
                      onChange={handleInputChange}
                      onClick={handleClick}
                    />
                    &nbsp;&nbsp;Custom
                  </label>
                </div>
              </div>

            )}
          </div>



        </div>

        {
          loading ? (
            <div
              className="py-2 mt-2 text-center text-gray-500 animate-pulse"
              style={{
                backgroundColor: '#F0F0F0',
                borderColor: '#D1D5DB',
              }}
            >
              <p className="text-xl">Loading...</p>
            </div>
          ) :
            (

              <Table
                className="font-popins"
                columns={columns}
                dataSource={filteredNotifications}
                rowKey="DeviceId"
                scroll={{ y: 490 }}
              />
            )
        }


        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  )
}
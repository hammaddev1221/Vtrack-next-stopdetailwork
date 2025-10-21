"use client";
// import { Inter } from "next/font/google";
import logo from "@/../public/Images/logo.png";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Loading from "@/app/loading";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import TimeCounter from "@/app/context/timer";
import { usePathname, useSearchParams } from "next/navigation";
import { getNotificationsData, logout } from "@/utils/API_CALLS";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { FaBell } from "react-icons/fa"; // Using React Icons for the bell icon

import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import "./layout.css";
import BlinkingTime from "../General/BlinkingTime";
import NotificationDropdown from "./notifications";
import { socket } from "@/utils/socket";
// const inter = Inter({ subsets: ["latin"] });
// Example import statement
const drawerWidth = 58;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState(false);
  // const [selectedColor, setSelectedColor] = useState(null);
  const [zoneList, setZoneList] = useState([]);
  const [filterId, setFilterId] = useState("");
  const searchParams = useSearchParams();

  const pathName = searchParams.get("id");

  /*   const obj = [
    { herf: " /liveTracking", label: "Live-Tracing" },
    { herf: "/journeyReplay", label: "journer-Replay" },
    { herf: " /Zone", label: "Zone" },
  ]; */

  const handleOpenPopUp = () => {
    setOpenPopover(!openPopover);
  };

  const triggers = {
    onClick: handleOpenPopUp,
  };
  type MySessionData = {
    // Define the properties you expect in your session object
  };

  const { data: session } = useSession();
  const [loginTime, setLoginTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const fullparams = searchParams?.get("screen");
  // const dispatch = useDispatch();
  const allZones = useSelector((state) => state.zone);
  useEffect(() => {
    setZoneList(allZones?.zone);
  }, [allZones]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - loginTime.getTime();
      setElapsedTime(timeDifference);
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Run effect when loginTime changes

  // useEffect(() => {
  //   const fetchZoneList = async () => {
  //     if (session) {
  //       try {
  //         await dispatch(
  //           fetchZone({
  //             token: session?.accessToken,
  //             clientId: session?.clientId,
  //           })
  //         );
  //       } catch (error) {

  //       }
  //     }
  //   };

  // const allzoneList = zoneList?.map((item) => {
  //   return item?.id;
  // });

  const formatTime = (milliseconds: any) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  useEffect(() => {
    if (!session && fullparams != "full") {
      router.push("/signin");
    }
  }, [session, router]);

  // const handleClick = (item: any) => {
  //   setSelectedColor(item);
  // };
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const pathname = usePathname();
  useEffect(() => {
    const filterZoneIds = async () => {
      if (zoneList) {
        try {
          const filteredIds = zoneList?.find(
            (item: any) => item?.id == pathName
          );

          setFilterId(filteredIds?.id);
          // Use filteredIds as needed
        } catch (error) {}
      }
    };

    filterZoneIds();
  }, [zoneList]);
  const [loading, setLoading] = useState(false); // Loading state

  const BellButton = ({ toggleNotifications }) => {
    const [hovered, setHovered] = useState(false); // Track hover state

    return (
      <div className="relative">
        <button
          onClick={toggleNotifications}
          style={{
            padding: "0.5rem",
            backgroundColor: "transparent",
            color: "white",
            borderRadius: "9999px",
            outline: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transition: "transform 0.3s ease-in-out", // Smooth transition for animation
            animation: hovered ? "ringing 0.6s ease-in-out" : "none", // Apply animation on hover only
          }}
          onMouseEnter={() => setHovered(true)} // Trigger hover state
          onMouseLeave={() => setHovered(false)} // Reset hover state
        >
          <FaBell size={24} />
        </button>{" "}
        {notificationCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: "translate(50%, -50%)",
            }}
          >
            {notificationCount}
          </span>
        )}
        <style>
          {`
            @keyframes ringing {
              0%, 100% {
                transform: translateX(0);
              }
              25% {
                transform: translateX(-5px);
              }
              50% {
                transform: translateX(5px);
              }
              75% {
                transform: translateX(-5px);
              }
            }
          `}
        </style>
      </div>
    );
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationRef = useRef(null);
  const [notifications, setnotifications] = useState([]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mouseclick", handleClickOutside);
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle the visibility of the notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setNotificationCount(0);
  };

  useEffect(() => {
    if (showNotifications) {
      const fetchNotifications = async () => {
        setLoading(true); // Set loading to true before the fetch starts
        try {
          if (session && session?.userRole === "Admin") {
            const payload = {
              clientId: session?.clientId,
            };

            const NotificationsData = await getNotificationsData({
              token: session?.accessToken,
              payload,
            });

            setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
          } else {
            const payload = {
              userId: session?.userId,
            };
            const NotificationsData = await getNotificationsData({
              token: session?.accessToken,
              payload,
            });

            setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false); // Set loading to false after the fetch is complete
        }
      };

      fetchNotifications();
    }
  }, [showNotifications]);

  const toastId = useRef(null);
  useEffect(() => {
    try {
      if (session?.PortalNotification) {
        socket.io.opts.query = { clientId: session?.clientId };
        socket.connect();

        socket.on("notification", async (data) => {
          if (data === null || data === undefined) {
            return;
          }

          if (toastId.current) {
            toast.dismiss(toastId.current);
          }

          toastId.current = toast(data.description, { position: "top-center" });

          setNotificationCount((prevCount) => prevCount + 1);
        });
      }
    } catch (err) {}

    return () => {
      socket.off("notification");
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <div>
        <div className="flex flex-row">
          <div
            className={
              fullparams == "full"
                ? "hidden"
                : "basis-20 py-6 bg-[#29303b] h-screen lg:block md:hidden sm:hidden hidden sticky top-0"
            }
          >
            <Link href="/liveTracking" style={{ zIndex: "999" }}>
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                placement="right"
                content="Live Map"
              >
                <svg
                  className={`w-20 h-14 py-3 mt-12   text-white text-white-10 dark:text-white ${
                    pathname === "/liveTracking"
                      ? "border-r-2 border-#29303b"
                      : "border-y-2"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    color: pathname == "/liveTracking" ? "green" : "white",
                    backgroundColor: pathname == "/liveTracking" ? "white" : "",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Tooltip>
            </Link>
            <Link href="/journeyReplay" style={{ zIndex: "999" }}>
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                placement="right"
                content="Journey Replay"
              >
                <svg
                  className={`w-20 h-14 py-3  -my-1   text-white-10  dark:text-white ${
                    session?.userRole === "Controller"
                      ? "border-b-2 border-white"
                      : ""
                  } ${
                    pathname === "/journeyReplay"
                      ? "border-r-2 border-#29303b"
                      : "border-b-2"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: pathname == "/journeyReplay" ? "green" : "white",
                    backgroundColor:
                      pathname == "/journeyReplay" ? "white" : "",
                  }}
                >
                  {" "}
                  <circle cx="12" cy="12" r="10" />{" "}
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
              </Tooltip>
            </Link>

            {session?.userRole === "Controller" ? null : (
              <Link href="/Zone" style={{ zIndex: "999" }}>
                <Tooltip
                  className="bg-[#00B56C] text-white rounded shadow-lg !z-[9999]"
                  placement="right"
                  content="Zones"
                >
                  <svg
                    className={`w-20 h-14 py-3    text-[white]  text-white-10  dark:text-white  ${
                      pathname == "/Zone" ||
                      pathname == "/AddZone" ||
                      `EditZone?id=${filterId}` == `EditZone?id=${pathName}`
                        ? "border-r-2 #29303b"
                        : "border-b-2"
                    }`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color:
                        pathname == "/Zone" ||
                        pathname == "/AddZone" ||
                        `EditZone?id=${filterId}` == `EditZone?id=${pathName}`
                          ? "green"
                          : "white",
                      backgroundColor:
                        pathname == "/Zone" ||
                        pathname == "/AddZone" ||
                        `EditZone?id=${filterId}` == `EditZone?id=${pathName}`
                          ? "white"
                          : "",
                    }}
                  >
                    {" "}
                    <path stroke="none" d="M0 0h24v24H0z" />{" "}
                    <circle cx="12" cy="12" r=".5" fill="currentColor" />{" "}
                    <circle cx="12" cy="12" r="7" />{" "}
                    <line x1="12" y1="3" x2="12" y2="5" />{" "}
                    <line x1="3" y1="12" x2="5" y2="12" />{" "}
                    <line x1="12" y1="19" x2="12" y2="21" />{" "}
                    <line x1="19" y1="12" x2="21" y2="12" />
                  </svg>
                </Tooltip>
              </Link>
            )}

            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.cameraProfile && (
                  <Link href="/DualCam" style={{ zIndex: "999" }}>
                    <Tooltip
                      className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                      placement="right"
                      content="Camera"
                    >
                      <svg
                        className={`w-20 h-14 py-3  text-white-10  dark:text-white 
                
                          ${
                            pathname === "/DualCam"
                              ? "border-r-2 border-#29303b -my-1"
                              : "border-y-1 border-b-2"
                          }`}
                        width="28"
                        height="28"
                        // viewBox="0 0 24 24"
                        // x="0px" y="0px"
                        viewBox="50 100 620 620"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          color: pathname == "/DualCam" ? "green" : "white",
                          backgroundColor:
                            pathname == "/DualCam" ? "white" : "",
                        }}
                      >
                        <g
                          style={{
                            fill: pathname == "/DualCam" ? "green" : "white",
                            backgroundColor:
                              pathname == "/DualCam" ? "white" : "",
                          }}
                        >
                          <path
                            d="M687.2,219.1c0,119.4,0,238.9,0,358.3c-1.6,4.6-2.8,9.3-4.9,13.6c-9.6,19.1-25.6,27.2-46.6,27.2
		c-157.2-0.1-314.3,0-471.5,0c-26.5,0-53.1,0-79.6,0c-13.8,0-25.9-4.1-35.9-13.7c-7.8-7.5-11.4-17.1-14.3-27.1
		c0-119.4,0-238.9,0-358.3c0.7-2,1.4-3.9,2-5.9c5.3-17.2,16.6-28.4,34-32.9c6.2-1.6,12.9-1.7,19.9-2.5c0-3.9-0.1-7.7,0-11.5
		c0.3-11.5,7.6-19.4,19.1-19.6c23.2-0.3,46.3-0.3,69.5,0c11.3,0.2,18.5,7.8,19,19.1c0.2,4,0,8,0,12.4c2.8,0.1,4.9,0.3,6.9,0.3
		c14.7,0,29.3-0.1,44,0.1c4.3,0.1,6.8-1.1,9.1-5c9.7-16.9,20.1-33.5,29.8-50.4c5-8.6,11.8-12.6,21.8-12.5c34.2,0.3,68.4,0.3,102.6,0
		c10-0.1,16.8,4,21.8,12.6c9.4,16.4,19.4,32.4,28.8,48.8c2.7,4.8,5.7,6.7,11.4,6.6c53.8-0.3,107.5-0.1,161.3-0.2
		c14.1,0,26.8,3.6,37.3,13.6C680.6,199.5,684.2,209.1,687.2,219.1z M360.5,262.9c-75.4,0.6-135.8,61.7-135,136.3
		c0.8,74.7,61.5,135,135.6,134.6c75-0.4,135.8-61.8,135-136.4C495.3,322.7,434.5,262.3,360.5,262.9z M580.4,276.5
		c9.8,0,19.5,0.1,29.3,0c10.9-0.2,18.8-7.9,19-18.2c0.3-10.5-7-19-17.9-19.2c-20.4-0.5-40.8-0.5-61.2,0
		c-10.7,0.3-18.3,9.2-17.9,19.3c0.4,10.3,8.4,17.9,19.3,18.1C560.8,276.7,570.6,276.5,580.4,276.5z"
                          />
                          <path
                            d="M361.8,303.8c54.6,1.5,95,44.3,93.4,99.2c-1.4,49.9-46,91.7-96.2,90c-53.5-1.7-94-44.8-92.5-98.3
		C267.9,344.1,311.6,302.4,361.8,303.8z"
                          />
                        </g>
                      </svg>
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}

            <Link href="/Reports" style={{ zIndex: "999" }}>
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                placement="right"
                content="Reports"
              >
                <svg
                  className={`w-20 h-14 py-3 
                  text-white-10  dark:text-white 
        
                  ${
                    pathname === "/Reports"
                      ? "border-r-2 border-#29303b -my-1"
                      : "border-y-1 border-b-2"
                  }`}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: pathname == "/Reports" ? "green" : "white",
                    backgroundColor: pathname == "/Reports" ? "white" : "",
                  }}
                >
                  <path d="M9 7V2.13a2.98 2.98 0 0 0-1.293.749L4.879 5.707A2.98 2.98 0 0 0 4.13 7H9Z" />
                  <path d="M18.066 2H11v5a2 2 0 0 1-2 2H4v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 20 20V4a1.97 1.97 0 0 0-1.934-2ZM10 18a1 1 0 1 1-2 0v-2a1 1 0 1 1 2 0v2Zm3 0a1 1 0 0 1-2 0v-6a1 1 0 1 1 2 0v6Zm3 0a1 1 0 0 1-2 0v-4a1 1 0 1 1 2 0v4Z" />
                </svg>
              </Tooltip>
            </Link>            
            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
            <Popover placement="right-start">                    
                    <Tooltip
                      className={`bg-[#00B56C]  z-50 text-white shadow-lg rounded border-none`}
                      placement="right"
                      content="Booking"
                    >
                      <PopoverHandler>
                        <svg
                        version="1.0"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-20 h-14 py-3 text-white text-white-10 dark:text-white ${
                          pathname === "/Bookings"
                            ? "border-r-2 border-#29303b"
                            : "border-y-2"
                        }`}
                        style={{
                          color: pathname == "/Bookings" ? "green" : "white",
                          backgroundColor:
                            pathname == "/Bookings" ? "white" : "",
                        }}
                        //  stroke="currentColor"
                        width="512.000000pt"
                        height="512.000000pt"
                        viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <g
                          transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                          style={{
                            fill: pathname == "/Bookings" ? "green" : "white",
                            backgroundColor:
                              pathname == "/Bookings" ? "white" : "",
                          }}
                        >
                          <path
                            d="M1055 5106 c-72 -32 -95 -85 -95 -218 l0 -88 -227 0 c-257 0 -321 -9
       -429 -62 -92 -44 -197 -149 -241 -239 -67 -136 -63 1 -63 -2100 0 -1869 0
       -1907 20 -1983 25 -101 69 -176 144 -252 76 -75 151 -119 252 -144 76 -20 115
       -20 2144 -20 2026 0 2068 0 2144 20 105 26 168 63 247 140 80 79 123 153 149
       256 20 76 20 114 20 1983 0 2101 4 1964 -63 2100 -43 89 -149 195 -240 239
       -107 52 -172 62 -428 62 l-227 0 -4 109 c-3 91 -7 115 -24 137 -70 94 -190 96
       -251 5 -20 -30 -23 -46 -23 -142 l0 -109 -335 0 -335 0 0 100 c0 117 -13 156
       -61 191 -45 32 -125 33 -165 3 -60 -44 -69 -67 -72 -185 l-4 -109 -328 0 -328
       0 -4 109 c-3 118 -12 141 -72 185 -40 30 -120 29 -165 -3 -48 -35 -61 -74 -61
       -191 l0 -100 -335 0 -335 0 0 109 c0 96 -3 112 -23 142 -40 61 -117 84 -182
       55z m-93 -713 c4 -124 18 -158 78 -192 72 -40 158 -18 200 51 17 28 20 51 20
       141 l0 107 335 0 335 0 0 -107 c0 -90 3 -113 20 -141 61 -100 204 -95 258 8
       18 37 22 60 22 142 l0 98 330 0 330 0 0 -98 c0 -82 4 -105 23 -142 53 -103
       196 -108 257 -8 17 28 20 51 20 141 l0 107 335 0 335 0 0 -107 c0 -122 13
       -156 72 -194 41 -25 122 -22 160 7 50 37 62 71 66 187 l4 108 237 -3 236 -3
       53 -30 c56 -30 100 -83 120 -144 8 -22 12 -116 12 -262 l0 -229 -2260 0 -2260
       0 0 229 c0 148 4 240 12 262 17 51 54 101 93 128 68 46 97 50 331 51 l222 0 4
       -107z m3858 -2371 c0 -1695 6 -1564 -76 -1646 -82 -83 113 -76 -2184 -76
       -2297 0 -2102 -7 -2184 76 -82 82 -76 -49 -76 1646 l0 1508 2260 0 2260 0 0
       -1508z"
                          />
                          <path
                            d="M800 3008 c-18 -13 -43 -36 -54 -51 -20 -28 -21 -39 -21 -397 0 -358
       1 -369 21 -397 11 -15 36 -38 54 -50 33 -23 36 -23 395 -23 359 0 362 0 395
       23 18 12 43 35 54 50 20 28 21 39 21 397 0 358 -1 369 -21 397 -11 15 -36 38
       -54 51 -33 22 -36 22 -395 22 -359 0 -362 0 -395 -22z m570 -448 l0 -170 -175
       0 -175 0 0 170 0 170 175 0 175 0 0 -170z"
                          />
                          <path
                            d="M3530 3008 c-18 -13 -43 -36 -54 -51 -20 -28 -21 -39 -21 -397 0
       -358 1 -369 21 -397 11 -15 36 -38 54 -50 33 -23 36 -23 395 -23 359 0 362 0
       395 23 18 12 43 35 54 50 20 28 21 39 21 397 0 358 -1 369 -21 397 -11 15 -36
       38 -54 51 -33 22 -36 22 -395 22 -359 0 -362 0 -395 -22z m570 -448 l0 -170
       -175 0 -175 0 0 170 0 170 175 0 175 0 0 -170z"
                          />
                          <path
                            d="M2855 2930 c-18 -6 -102 -82 -217 -197 l-188 -188 -67 67 c-38 36
       -82 73 -100 82 -118 59 -250 -65 -202 -191 5 -15 69 -87 142 -160 151 -153
       188 -175 260 -154 35 11 84 54 291 259 136 136 254 261 262 279 50 115 -62
       240 -181 203z"
                          />
                          <path
                            d="M827 1736 c-50 -18 -67 -34 -88 -81 -17 -36 -19 -73 -19 -380 0 -334
       0 -342 23 -385 16 -33 34 -51 67 -67 43 -23 52 -23 385 -23 334 0 342 0 385
       23 26 13 53 36 65 57 19 33 20 52 20 395 0 344 -1 362 -20 395 -12 19 -36 43
       -55 55 -33 19 -53 20 -380 22 -271 2 -353 0 -383 -11z m538 -461 l0 -170 -170
       0 -170 0 -3 160 c-1 87 0 165 3 172 3 11 41 13 172 11 l168 -3 0 -170z"
                          />
                          <path
                            d="M2196 1740 c-16 -5 -40 -19 -53 -32 -53 -49 -53 -51 -53 -436 0 -356
       0 -359 23 -392 12 -18 35 -43 50 -54 28 -20 39 -21 397 -21 358 0 369 1 397
       21 15 11 38 36 51 54 22 33 22 36 22 395 0 359 0 362 -22 395 -13 18 -36 43
       -51 54 -27 20 -40 21 -380 23 -194 1 -365 -2 -381 -7z m534 -465 l0 -175 -170
       0 -170 0 0 175 0 175 170 0 170 0 0 -175z"
                          />
                          <path
                            d="M3555 1735 c-49 -18 -81 -53 -95 -106 -7 -26 -10 -157 -8 -377 3
       -385 4 -387 88 -429 43 -23 51 -23 385 -23 333 0 342 0 385 23 33 16 51 34 68
       67 22 43 22 52 22 385 0 503 33 469 -460 472 -280 2 -353 0 -385 -12z m540
       -460 l0 -170 -170 0 -170 0 -3 160 c-1 87 0 165 3 172 3 11 41 13 172 11 l168
       -3 0 -170z"
                          />
                        </g>
                      </svg>
                      </PopoverHandler>
                    </Tooltip>
                    <PopoverContent className="border-none cursor-pointer bg-green z-50">
                     
                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/Bookings"
                        style={{
                          color:
                            pathname == "/Bookings" ? "black" : "white",
                          backgroundColor:
                            pathname == "/Bookings" ? "white" : "",
                        }}
                      >
                        Bookings
                      </Link>
                      <br></br>
                      <br></br>

                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/Schedule"
                        style={{
                          color:
                            pathname == "/Schedule" ? "black" : "white",
                          backgroundColor:
                            pathname == "/Schedule" ? "white" : "",
                        }}
                      >
                        Schedule
                      </Link>

                      <br></br>
                    </PopoverContent>

                    {/* </Link> */}
                  </Popover>
            )}
            <Link href="/Notifications" style={{ zIndex: "999" }}>
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                placement="right"
                content="Events and Notifications"
              >
                <svg
                  className={`w-20 h-14 py-3  text-white-10 dark:text-white ${
                    pathname === "/Notifications"
                      ? "border-r-2 border-#29303b -my-1"
                      : "border-y-1 border-b-2"
                  }`}
                  viewBox="0 0 720 720"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: pathname === "/Notifications" ? "green" : "white",
                    backgroundColor:
                      pathname === "/Notifications" ? "white" : "",
                  }}
                >
                  <path
                    d="M70.3,205.7c-7.5,0-13.8,0-21.1,0c0,2.7,0,5.2,0,7.6c0,115.5,0.4,230.9-0.3,346.4c-0.2,26.8,17.5,44.6,44.5,44.4
		c97.3-0.7,194.6-0.3,291.9-0.3c3,0,6.1-0.1,9.1,0.1c7.2,0.4,12.1,5.2,12.2,11.8c0.1,6.6-4.7,11.9-11.8,12.3
		c-6.5,0.4-13.1,0.1-19.7,0.1c-94.5,0-189,0.1-283.6,0c-40.6-0.1-66.5-26.3-66.5-66.8c0-138.4-0.1-276.8,0-415.2
		c0-33.1,18.9-58,49.2-64.6c5.8-1.3,12-1.2,18-1.4c6.5-0.2,13-0.1,20.4-0.1c0-6-0.1-11.2,0-16.4c0.4-22.4,17.2-39.9,38.7-40.4
		c25.1-0.6,42.9,15,44.1,38.8c0.3,5.5,0,11,0,17.2c98,0,195.4,0,294,0c0-4.2,0-8.6,0-13c0.1-24.3,18-42.8,41.5-43
		c23.3-0.2,41.5,18.6,41.6,42.8c0,4.3,0,8.5,0,14c7.6,0,14.8,0,22,0c39.2,0.2,65.5,26.2,65.5,65.5c0.1,107.9,0.1,215.8,0,323.7
		c0,4.7,0.8,8.2,4.7,11.8c4.1,3.8,6.7,9.3,9.6,14.3c6.3,10.6,12.6,21.3,18.5,32.1c7.2,12.9,3.9,24.6-8.8,32.3
		c-4.1,2.5-8.4,4.5-12.4,7.2c-4.7,3.3-4.7,6.9,0.3,10c4.3,2.6,8.8,5,13,7.6c11.5,7.1,14.9,18.8,8.4,30.6
		c-7.9,14.3-16.1,28.5-24.5,42.6c-6.7,11.2-18.5,14.3-30.1,8.1c-4.7-2.5-9.1-5.5-13.8-7.8c-5.1-2.5-8.3-0.7-8.6,5.1
		c-0.3,5.3,0,10.6-0.2,15.9c-0.5,12.9-9.3,21.7-22.2,21.9c-16.4,0.2-32.8,0.2-49.2,0c-13-0.2-21.7-9-22.2-21.9
		c-0.2-5,0.1-10.1-0.1-15.1c-0.3-6.7-3.5-8.6-9.3-5.5c-4.5,2.3-8.7,5.1-13.1,7.5c-11.5,6.1-23.4,3.1-30.1-8
		c-8.4-14-16.6-28.2-24.6-42.5c-6.5-11.7-3.2-23.6,8.3-30.7c4.1-2.5,8.4-4.7,12.4-7.2c5.9-3.7,5.8-7.5-0.2-11.3
		c-4.1-2.5-8.3-4.7-12.4-7.3c-11.1-6.9-14.5-18.7-8.2-30c8.1-14.5,16.3-29,24.9-43.2c6.5-10.8,18.3-13.8,29.6-8
		c4.7,2.4,9.1,5.5,13.8,7.8c5.6,2.8,8.7,1,9-5.2c0.3-5.3,0-10.6,0.2-15.9c0.4-12.1,8.8-21.3,20.9-21.6c17.1-0.5,34.3-0.5,51.4,0
		c12.1,0.3,20.6,9.3,21.2,21.4c0.3,5.5,0,11.1,0.1,16.6c0.1,5.7,3.4,6.9,8.2,5.1c9.9-3.6,11.5-6,11.5-16.4c0-85,0-169.9,0-254.9
		c0-2.7,0-5.4,0-8.5c-180.8,0-360.6,0-541,0c0,83.5,0,166.8,0,251c3.5,0,6.7,0,9.9,0c22.2,0,44.4,0,66.5,0c11.4,0,15.3,4,15.3,15.6
		c0,25.2,0,50.4,0,76.8c3.1,0,5.8,0,8.4,0c64.5,0,129.1,0,193.6,0c2.8,0,5.6-0.1,8.3,0.1c7.2,0.5,12.1,5.4,12.1,12
		c0,6.5-5,11.8-12.1,12c-11.8,0.3-23.7,0.2-35.5,0.2c-60.5,0-121-0.1-181.5,0.1c-7.4,0-12.8-2.3-18-7.5
		c-28.3-28.7-56.8-57.2-85.5-85.6c-4.9-4.9-6.4-10.3-6.4-17c0.1-82.7,0.1-165.4,0.1-248.1C70.3,212.4,70.3,209.5,70.3,205.7z
		 M49.5,180.5c195.9,0,391.1,0,586.6,0c0-11.8,0-22.9,0-33.9c0-2.3,0-4.5-0.1-6.8c-1.2-15.8-11.1-30-26.2-33.4
		c-11.7-2.7-24.2-2.2-37.1-3.1c0,6.5,0.1,11,0,15.5c-0.4,23.7-18.6,42-41.8,41.8c-22.7-0.1-40.8-18.4-41.2-41.6
		c-0.1-4.7,0-9.4,0-14.6c-98.3,0-195.7,0-294,0c0,5.4,0.1,10.4,0,15.4c-0.7,24.8-17.8,41.1-42.9,40.9c-22.9-0.2-39.7-17.6-40.1-41.3
		c-0.1-4.9,0-9.8,0-14.9c-10.8,0-20.4-0.7-29.9,0.1c-17.7,1.5-32.1,16-33.1,33.8C48.8,152.2,49.5,166,49.5,180.5z M649.3,499.9
		c-13.7,7.5-26.6,16.2-42.6,7.1c-16-9.1-14.4-25-14.8-39.9c-15.3,0-29.8,0-44.3,0c3.8,42-27.3,55.3-57.8,32.8
		c-7.4,12.8-14.7,25.6-22.4,38.8c14.2,7.4,27.2,15,27.3,32.8c0.1,18.2-13.5,25.6-27.2,33.1c7.7,13.3,15,25.9,22.5,39
		c13.3-8.6,26.5-16.3,42.3-7.2c15.7,9.1,15,24.7,14.9,40.1c8.2,0,15.5,0,22.8,0c7.2,0,14.4,0,21.7,0c-4.6-40.7,26-56.5,57.7-33.4
		c7.3-12.8,14.7-25.5,22.1-38.5c-13.7-8-27.4-14.9-27.4-33c0-18.4,14.2-25.2,27.4-33.2C664,525.4,656.7,512.8,649.3,499.9z
		 M513.8,91.5c0,4.5,0,9,0,13.6c0,4.8-0.1,9.6,0,14.3c0.3,11,6.7,17,17.7,17.1c10,0.1,16.7-6.6,16.8-17.2c0.2-18.3,0.2-36.7,0-55.1
		c-0.1-10.5-7-17.2-17-17.1c-11,0.1-17.4,6.2-17.6,17.2C513.7,73.4,513.8,82.5,513.8,91.5z M136.9,91.6c0,9.5-0.2,19.1,0,28.6
		c0.2,9.6,6.8,16.1,16.1,16.3c10.4,0.2,17.9-5.4,18.2-15c0.5-19.6,0.5-39.2,0-58.8c-0.2-9.9-7.8-15.9-17.7-15.5
		c-10.4,0.4-16.5,6.3-16.7,16.4C136.7,73,136.9,82.3,136.9,91.6z M116.2,481.5c15.3,15.3,31.3,31.2,46,46c0-13.8,0-29.8,0-46
		C145.8,481.5,129.9,481.5,116.2,481.5z"
                  />
                  <path
                    d="M351.4,411.7c25.8,0.1,45.3,19.6,45.4,45.5c0.2,26.5-19.8,46.7-46,46.6c-24.4-0.2-44.9-20.9-45-45.6
		C305.6,432.6,326.2,411.7,351.4,411.7z M372.7,457.3c-0.2-11.8-10.1-21.5-21.9-21.3c-11.8,0.2-21.4,10.3-21.1,22.1
		c0.3,11.9,10.3,21.6,21.9,21.4C363.3,479.3,372.9,469.1,372.7,457.3z"
                  />
                  <path
                    d="M521.8,333.3c-24.8,0.1-45.7-20.9-45.5-46c0.1-25.1,20.8-46,45.6-46.1c24.5-0.1,45.1,20.6,45.5,45.4
		C567.8,312.2,547.2,333.2,521.8,333.3z M543.4,287.5c0.1-11.8-9.8-21.9-21.4-21.9c-11.7,0-21.6,10-21.6,21.7
		c0,12,9.6,21.7,21.5,21.8C533.6,309.2,543.3,299.4,543.4,287.5z"
                  />
                  <path
                    d="M226.5,287.7c-0.2,25-21,45.3-46.2,45.3c-24.9,0-46.1-21.3-45.8-45.8c0.4-25.4,21.4-45.5,47.1-45.1
		C206.5,242.3,226.8,263,226.5,287.7z M180.4,265.9c-12,0.1-21.8,10-21.6,21.7c0.2,11.8,10.1,21.3,22,21.3
		c11.9,0,21.5-9.8,21.4-21.7C202.2,275.3,192.4,265.8,180.4,265.9z"
                  />
                  <path
                    d="M350.1,333.3c-24.4-0.4-44.7-21.6-44.3-46.3c0.4-25.3,21-45.9,45.9-45.7c24.7,0.2,45.6,21.6,45.2,46.5
		C396.4,313.4,375.5,333.7,350.1,333.3z M372.8,287.2c-0.1-11.8-10-21.8-21.7-21.7c-11.8,0.1-21.5,10.1-21.4,21.9
		c0.1,12,9.8,21.6,21.7,21.6C363.2,309.1,372.9,299.2,372.8,287.2z"
                  />
                  <path
                    d="M569.6,520.5c27.9,0,50.6,22.8,50.7,51.1c0.2,27.9-23.1,51.3-50.8,51.2c-27.9-0.1-50.8-23.2-50.8-51.2
		C518.7,543.5,541.6,520.5,569.6,520.5z M569.7,598.5c14.7-0.1,26.8-12.6,26.5-27.3c-0.3-14.9-12.5-26.8-27.3-26.5
		c-14.4,0.3-26.2,12.4-26.2,26.9C542.7,586.4,555.1,598.7,569.7,598.5z"
                  />
                </svg>
              </Tooltip>
            </Link>
            {session?.featureAttendance && (
                      <Link href="/Attendance" style={{ zIndex: "999" }}>
                      <Tooltip
                        className="bg-white text-[#00B56C] shadow-lg rounded !z-[9999]"
                        placement="right"
                        content="Attendance"
                      >
                        <svg
                          className={`w-20 h-14 py-3 text-white-10 dark:text-white ${
                            pathname === "/Attendance"
                              ? "border-r-2 border-[#29303b] -my-1"
                              : "border-y-1 border-b-2"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            color: pathname === "/Attendance" ? "green" : "white",
                            backgroundColor: pathname === "/Attendance" ? "white" : "",
                          }}
                        >
                          {/* Simple ID Card Icon */}
                          <rect x="2" y="4" width="20" height="16" rx="2" fill="none"/>
                          <circle cx="9" cy="10" r="2" fill="none"/>
                          <path d="M7 14c0-1 1-2 2-2s2 1 2 2" fill="none" strokeLinecap="round"/>
                          <path d="M14 9h4M14 12h4M14 15h3" fill="none" strokeLinecap="round"/>
                        </svg>
                      </Tooltip>
                    </Link>
)}
            {session?.PortalNotification && (
              <Link href="/NotificationTab" style={{ zIndex: "999" }}>
                <Tooltip
                  className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                  placement="right"
                  content="Notifications"
                >
                  <svg
                    className={`w-20 h-14 py-3 text-white-10 dark:text-white ${
                      pathname === "/NotificationTab"
                        ? "border-r-2 border-#29303b -my-1"
                        : "border-y-1 border-b-2"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color:
                        pathname === "/NotificationTab" ? "green" : "white",
                      backgroundColor:
                        pathname === "/NotificationTab" ? "white" : "",
                    }}
                  >
                    <path d="M12 22C13.1046 22 14 21.1046 14 20C14 19.4477 13.5523 19 13 19H11C10.4477 19 10 19.4477 10 20C10 21.1046 10.8954 22 12 22ZM18 16V11C18 7.13401 15.866 4 12 4C8.13401 4 6 7.13401 6 11V16L4 18V19H20V18L18 16Z" />

                    {/* <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none" /> */}
                    {/* <path
        d="M17 4V3M17 10V11M14.5 7.5L13.7 6.7M19.5 7.5L20.3 6.7M14.5 9.5L13.7 10.3M19.5 9.5L20.3 10.3M15 3H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      /> */}
                  </svg>
                </Tooltip>
              </Link>
            )}
            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.driverProfile && (
                  <Popover placement="right-start">
                    {/* <Link href="/DriverProfile"> */}
                    {/* <Link href={pathname ? "/DriverProfile" : "/DriverAssign"}> */}
                    <Tooltip
                      className={`bg-[#00B56C]  z-50 text-white shadow-lg rounded border-none`}
                      placement="right"
                      content="Driver"
                    >
                      <PopoverHandler>
                        <svg
                          className={`w-20 h-14 py-3  text-[white] text-white-10  dark:text-white
                          ${
                            pathname == "/DriverAssign" ||
                            pathname == "/DriverProfile" ||
                            pathname == "/ActiveDriver"
                              ? "border-r-2 border-#29303b -mt-1"
                              : "border-b-2"
                          }`}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            color:
                              pathname == "/DriverAssign" ||
                              pathname == "/DriverProfile" ||
                              pathname == "/ActiveDriver"
                                ? "green"
                                : "white",
                            backgroundColor:
                              pathname == "/DriverAssign" ||
                              pathname == "/DriverProfile" ||
                              pathname == "/ActiveDriver"
                                ? "white"
                                : "",
                          }}
                        >
                          {" "}
                          <path stroke="none" d="M0 0h24v24H0z" />{" "}
                          <circle cx="7" cy="17" r="2" />{" "}
                          <circle cx="17" cy="17" r="2" />{" "}
                          <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                        </svg>
                      </PopoverHandler>
                    </Tooltip>
                    <PopoverContent className="border-none cursor-pointer bg-green z-50">
                      {/* <Link className="w-full text-white" href="/DriverProfile">
                  Driver Profile
                </Link> */}
                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/DriverProfile"
                        style={{
                          color:
                            pathname == "/DriverProfile" ? "black" : "white",
                          backgroundColor:
                            pathname == "/DriverProfile" ? "white" : "",
                        }}
                      >
                        Driver Profile
                      </Link>
                      <br></br>
                      <br></br>

                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/DriverAssign"
                        style={{
                          color:
                            pathname == "/DriverAssign" ? "black" : "white",
                          backgroundColor:
                            pathname == "/DriverAssign" ? "white" : "",
                        }}
                      >
                        Assign Driver
                      </Link>

                      <br></br>
                    </PopoverContent>

                    {/* </Link> */}
                  </Popover>
                )}
              </div>
            )}

            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.immobilising && (
                  <Link href="/Immobilize" style={{ zIndex: "999" }}>
                    <Tooltip
                      className="bg-[#00B56C] text-white rounded shadow-lg !z-[9999]"
                      placement="right"
                      content="Immobilize"
                    >
                      <svg
                        id="Layer_1"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-20 h-14 py-3   text-[white]  text-white-10  dark:text-white  ${
                          pathname == "/Immobilize"
                            ? "border-r-2 #29303b"
                            : "border-b-2"
                        }`}
                        // width="140px"
                        // height="140px"
                        // viewBox="0 0 121.92 73.9"
                        viewBox="0 0 115 80"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          color: pathname == "/Immobilize" ? "green" : "white",
                          backgroundColor:
                            pathname == "/Immobilize" ? "white" : "",
                        }}
                      >
                        <g>
                          <path
                            d="M67.9,0H28.3L14,15.7l-0.4,0.5h-7c0,0-2.1,0-2.5,2.7c-0.3,1.5,0.3,3,1.5,3.8c1.1,0,2.1,0.1,3.1,0.3
		c1.6,0.3,1.2,1.6,1.2,1.6c-6.2,3.9-9.7,11.3-9.7,11.3L0,65l2.1,2.5h13.4l2.6-6.2h56.5V37c-0.2-1.8,1.2-3.4,3-3.6c0.1,0,0.3,0,0.4,0
		V17l1.3-2.8L67.9,0z M11.3,40C7.2,40,4,38.2,4,36.1s3.3-3.8,7.3-3.8s7.3,1.7,7.3,3.8S15.3,40,11.3,40z M74.3,54.7
		c0,1.7-1.4,3.2-3.1,3.2c0,0,0,0-0.1,0H23.5c-1.7,0-3.1-1.4-3.1-3.2l0,0v-0.6c0-1.7,1.4-3.2,3.1-3.2c0,0,0,0,0,0h47.6
		c1.7,0,3.2,1.4,3.2,3.1c0,0,0,0,0,0L74.3,54.7z M77,19.2H18.6v-2.8l9.6-12.6h39.5L77,16V19.2z"
                          />
                          <path
                            d="M118.4,34.7V19.2c0,0-3-13.8-19.6-14c0,0-14.2-0.4-18.7,14l0.2,15.3c0,0-3,1-3.3,3.5v32.7
		c0.1,1.8,1.5,3.1,3.3,3.2c3.1,0.2,38.2,0,38.2,0s3.6-0.8,3.5-4.3V37.3C121.9,37.3,121,34.5,118.4,34.7z M102,61h-5.4l0.8-7.5
		c-1.2-0.6-2-1.8-2.1-3.2c0.3-2.2,2.4-3.7,4.6-3.3c1.7,0.3,3.1,1.6,3.3,3.3c0,1.4-0.8,2.6-2.1,3.2L102,61z M113.1,34.5H84.6V19.2
		c0,0,2.4-9.8,14.8-10.2c0,0,11.6,0.8,13.8,9.3L113.1,34.5z"
                          />
                        </g>
                      </svg>
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}

            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.ServiceHistory && (
                  <Link href="/ServiceHistory" style={{ zIndex: "999" }}>
                    <Tooltip
                      className="bg-[#00B56C] text-white rounded shadow-lg !z-[9999]"
                      placement="right"
                      content="Service History"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`py-2 text-white-10 dark:text-white ${
                          pathname == "/ServiceHistory"
                            ? "border-b-2 mr-[1.5px] border-green-500"
                            : "border-b-2  border-white"
                        }`}
                        width="80px"
                        height="50px"
                        viewBox="0 0 512 512"
                        style={{
                          backgroundColor:
                            pathname == "/ServiceHistory" ? "white" : "", // White bg when active, black when not
                          borderRadius: "0", // Ensure no rounding, so it stays as a square
                        }}
                      >
                        <g transform="translate(1 1)">
                          <g>
                            <g>
                              <path
                                d="M379.16,289.987c-32.427,0-63.147,12.8-83.627,36.693c-3.413,3.413-2.56,8.533,0.853,11.947
                c3.413,3.413,8.533,2.56,11.947-0.853C325.4,317.293,351,306.2,378.307,306.2c52.053,0,93.867,41.813,93.867,93.867
                c0,52.053-41.813,93.867-93.867,93.867c-42.463,0-79.831-28.994-91.449-68.267h40.249V408.6h-50.179
                c-0.916-0.161-1.84-0.178-2.728,0h-15.36v68.267h17.067v-30.611C293.778,484.327,333.771,511,378.307,511
                c61.44,0,111.787-48.64,111.787-110.08S440.6,289.987,379.16,289.987z"
                                fill={
                                  pathname == "/ServiceHistory"
                                    ? "green"
                                    : "white"
                                }
                              />
                              <path
                                d="M71.107,50.2c-9.387,0-17.067,7.68-17.067,17.067V459.8c0,9.387,7.68,17.067,17.067,17.067H233.24
                c5.12,0,8.533-3.413,8.533-8.533s-3.413-8.533-8.533-8.533H71.107V67.267h85.333c0,9.387,7.68,17.067,17.067,17.067h119.467
                c9.387,0,17.067-7.68,17.067-17.067h85.333v196.267c0,5.12,3.413,8.533,8.533,8.533c5.12,0,8.533-3.413,8.533-8.533V67.267
                c0-9.387-7.68-17.067-17.067-17.067H310.04V33.133h110.933c5.12,0,8.533,3.413,8.533,8.533v221.867
                c0,5.12,3.413,8.533,8.533,8.533s8.533-3.413,8.533-8.533V41.667c0-14.507-11.093-25.6-25.6-25.6H310.04
                C310.04,6.68,302.36-1,292.973-1H173.507c-9.387,0-17.067,7.68-17.067,17.067H45.507c-14.507,0-25.6,11.093-25.6,25.6V485.4
                c0,14.507,11.093,25.6,25.6,25.6H233.24c5.12,0,8.533-3.413,8.533-8.533s-3.413-8.533-8.533-8.533H45.507
                c-5.12,0-8.533-3.413-8.533-8.533V41.667c0-5.12,3.413-8.533,8.533-8.533H156.44V50.2H71.107z M173.507,16.067h119.467V24.6
                v34.133v8.533H173.507v-8.533V24.6V16.067z"
                                fill={
                                  pathname == "/ServiceHistory"
                                    ? "green"
                                    : "white"
                                }
                              />
                              <path
                                d="M330.264,177.347l-33.024-46.08c-5.12-7.68-13.653-11.947-23.04-11.947h-36.925c-1.169-0.55-2.525-0.853-4.035-0.853
                s-2.865,0.304-4.035,0.853H192.28c-9.387,0-17.92,4.267-23.04,11.947l-33.024,46.08h-17.323c-12.8,0-22.187,10.24-22.187,22.187
                v33.28c0,12.8,9.387,22.187,22.187,22.187h13.034c3.814,14.679,17.216,25.6,33.046,25.6c15.829,0,29.232-10.921,33.046-25.6
                h70.442c3.814,14.679,17.216,25.6,33.046,25.6c15.829,0,29.232-10.921,33.046-25.6h13.034c12.8,0,22.187-9.387,23.04-22.187
                v-33.28c0-12.8-10.24-22.187-22.187-22.187H330.264z M282.733,139.8l26.7,37.547h-67.66v-41.813h31.573
                C277.613,135.533,281.027,137.24,282.733,139.8z M182.04,139.8c2.56-2.56,5.973-4.267,9.387-4.267h33.28v41.813h-68.532
                L182.04,139.8z"
                                fill={
                                  pathname == "/ServiceHistory"
                                    ? "green"
                                    : "white"
                                }
                              />
                              <path
                                d="M233.24,323.267h-128c-5.12,0-8.533,3.413-8.533,8.533c0,5.12,3.413,8.533,8.533,8.533h128
                c5.12,0,8.533-3.413,8.533-8.533C241.773,326.68,238.36,323.267,233.24,323.267z"
                                fill={
                                  pathname == "/ServiceHistory"
                                    ? "green"
                                    : "white"
                                }
                              />
                              <path
                                d="M233.24,365.933h-128c-5.12,0-8.533,3.413-8.533,8.533S100.12,383,105.24,383h128c5.12,0,8.533-3.413,8.533-8.533
                S238.36,365.933,233.24,365.933z"
                                fill={
                                  pathname == "/ServiceHistory"
                                    ? "green"
                                    : "white"
                                }
                              />
                              <path
                                d="M233.24,408.6h-128c-5.12,0-8.533,3.413-8.533,8.533s3.413,8.533,8.533,8.533h128c5.12,0,8.533-3.413,8.533-8.533
                S238.36,408.6,233.24,408.6z"
                                fill={
                                  pathname == "/ServiceHistory"
                                    ? "green"
                                    : "white"
                                }
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}

            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.ServiceHistory && (
                  <Link href="/Documents" style={{ zIndex: "999" }}>
                    <Tooltip
                      className="bg-[#00B56C] text-white rounded shadow-lg !z-[9999]"
                      placement="right"
                      content="Manage Documents"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`py-2 text-white-10 dark:text-white ${
                          pathname == "/Documents"
                            ? "border-b-2 mr-[1.5px] border-green-500"
                            : "border-b-2 border-white"
                        }`}
                        width="80px"
                        height="50px"
                        viewBox="0 0 482.14 482.14"
                        style={{
                          backgroundColor:
                            pathname == "/Documents" ? "white" : "", // White bg when active, black when not
                          borderRadius: "0", // Ensure no rounding, so it stays as a square
                        }}
                      >
                        <g>
                          <path
                            d="M302.599,0H108.966C80.66,0,57.652,23.025,57.652,51.315v379.509c0,28.289,23.008,51.315,51.314,51.315h264.205
              c28.275,0,51.316-23.026,51.316-51.315V121.449L302.599,0z M373.171,450.698H108.966c-10.969,0-19.89-8.905-19.89-19.874V51.315
              c0-10.953,8.921-19.858,19.89-19.858l181.875-0.189v67.218c0,19.653,15.949,35.603,35.588,35.603l65.877-0.189l0.725,296.925
              C393.03,441.793,384.142,450.698,373.171,450.698z"
                            fill={pathname == "/Documents" ? "green" : "white"}
                          />
                          <path
                            d="M241.054,150.96c-49.756,0-90.102,40.347-90.102,90.109c0,49.764,40.346,90.11,90.102,90.11
              c49.771,0,90.117-40.347,90.117-90.11C331.171,191.307,290.825,150.96,241.054,150.96z M273.915,253.087h-20.838v20.835
              c0,6.636-5.373,12.017-12.023,12.017c-6.619,0-12.01-5.382-12.01-12.017v-20.835H208.21c-6.637,0-12.012-5.383-12.012-12.018
              c0-6.634,5.375-12.017,12.012-12.017h20.834v-20.835c0-6.636,5.391-12.018,12.01-12.018c6.65,0,12.023,5.382,12.023,12.018v20.835
              h20.838c6.635,0,12.008,5.383,12.008,12.017C285.923,247.704,280.55,253.087,273.915,253.087z"
                            fill={pathname == "/Documents" ? "green" : "white"}
                          />
                        </g>
                      </svg>
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}
            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.featureReportApp && (
                  <Link href="/Reporting" style={{ zIndex: "999" }}>
                    <Tooltip
                      className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                      placement="right"
                      content="Reporting"
                    >
                      <svg
                        version="1.0"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-20 h-14 py-3 text-white text-white-10 dark:text-white ${
                          pathname === "/Reporting"
                            ? "border-r-2 border-#29303b"
                            : "border-y-2"
                        }`}
                        style={{
                          color: pathname == "/Reporting" ? "green" : "white",
                          backgroundColor:
                            pathname == "/Reporting" ? "white" : "",
                        }}
                        width="512.000000pt"
                        height="512.000000pt"
                        viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <g
                          transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                          style={{
                            fill: pathname == "/Reporting" ? "green" : "white",
                            backgroundColor:
                              pathname == "/Reporting" ? "white" : "",
                          }}
                        >
                          <path
                            d="M880 5105 c-102 -33 -150 -117 -150 -261 l0 -94 -225 0 c-252 0 -318
-10 -425 -62 -92 -44 -197 -149 -241 -239 -67 -136 -63 1 -63 -2100 0 -1869 0
-1907 20 -1983 25 -101 69 -176 144 -252 76 -75 151 -119 252 -144 76 -20 115
-20 2144 -20 2026 0 2068 0 2144 20 105 26 168 63 247 140 80 79 123 153 149
256 20 76 20 114 20 1983 0 2101 4 1964 -63 2100 -43 89 -149 195 -240 239
-107 52 -172 62 -428 62 l-227 0 -4 109 c-3 91 -7 115 -24 137 -70 94 -190 96
-251 5 -20 -30 -23 -46 -23 -142 l0 -109 -335 0 -335 0 0 100 c0 117 -13 156
-61 191 -45 32 -125 33 -165 3 -60 -44 -69 -67 -72 -185 l-4 -109 -328 0 -328
0 -4 109 c-3 118 -12 141 -72 185 -40 30 -120 29 -165 -3 -48 -35 -61 -74 -61
-191 l0 -100 -335 0 -335 0 0 109 c0 96 -3 112 -23 142 -40 61 -117 84 -182
55z m-70 -705 c0 -90 3 -113 20 -141 61 -100 204 -95 258 8 18 37 22 60 22
142 l0 98 330 0 330 0 0 -98 c0 -82 4 -105 23 -142 53 -103 196 -108 257 -8
17 28 20 51 20 141 l0 107 335 0 335 0 0 -107 c0 -122 13 -156 72 -194 41 -25
122 -22 160 7 50 37 62 71 66 187 l4 108 237 -3 236 -3 53 -30 c56 -30 100
-83 120 -144 8 -22 12 -116 12 -262 l0 -229 -2260 0 -2260 0 0 229 c0 148 4
240 12 262 17 51 54 101 93 128 68 46 97 50 331 51 l222 0 0 -107z m3850
-2371 c0 -1695 6 -1564 -76 -1646 -82 -83 113 -76 -2184 -76 -2297 0 -2102 -7
-2184 76 -82 82 -76 -49 -76 1646 l0 1508 2260 0 2260 0 0 -1508z"
                          />
                          {/* <path d="M1320 4030 l0 -170 170 0 170 0 0 170 0 170 -170 0 -170 0 0 -170z"/> */}
                          {/* <path d="M1320 3230 l0 -170 170 0 170 0 0 170 0 170 -170 0 -170 0 0 -170z"/> */}
                          {/* <path d="M1320 2430 l0 -170 170 0 170 0 0 170 0 170 -170 0 -170 0 0 -170z"/> */}
                          {/* <path d="M2000 4030 l0 -170 1700 0 1700 0 0 170 0 170 -1700 0 -1700 0 0 -170z"/> */}
                          {/* <path d="M2000 3230 l0 -170 1700 0 1700 0 0 170 0 170 -1700 0 -1700 0 0 -170z"/> */}
                          {/* <path d="M2000 2430 l0 -170 1700 0 1700 0 0 170 0 170 -1700 0 -1700 0 0 -170z"/> */}
                        </g>
                      </svg>
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}
            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
  <div>
                {session?.featureVehicleTab && (
                  <Popover placement="right-start">                    
                    <Tooltip
                      className={`bg-[#00B56C] z-50 text-white shadow-lg rounded border-none`}
                      placement="right"
                      content="Tagging and Access Management"
                    >
                      <PopoverHandler>
                        <svg
                          className={`w-20 h-14 py-3  text-[white] text-white-10  dark:text-white
                          ${
                            pathname == "/vehicles" ||
                            pathname == "/user" ||
                            pathname == "/vehicles"
                              ? "border-r-2 border-#29303b -mt-1"
                              : "border-b-2"
                          }`}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            color:
                              pathname == "/vehicles" ||
                              pathname == "/user" ||
                              pathname == "/user"
                                ? "green"
                                : "white",
                            backgroundColor:
                              pathname == "/vehicles" ||
                              pathname == "/user" ||
                              pathname == "/user"
                                ? "white"
                                : "",
                          }}
                        >
                          {" "}
                          <path stroke="none" d="M0 0h24v24H0z" />{" "}
                          <circle cx="7" cy="17" r="2" />{" "}
                          <circle cx="17" cy="17" r="2" />{" "}
                          <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                        </svg>
                      </PopoverHandler>
                    </Tooltip>
                    <PopoverContent className="border-none cursor-pointer bg-green z-50">
                      {/* <Link className="w-full text-white" href="/DriverProfile">
                  Driver Profile
                </Link> */}
                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/vehicles"
                        style={{
                          color:
                            pathname == "/vehicles" ? "black" : "white",
                          backgroundColor:
                            pathname == "/vehicles" ? "white" : "",
                        }}
                      >
                        Tagging
                      </Link>
                      <br></br>
                      <br></br>

                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/user"
                        style={{
                          color:
                            pathname == "/user" ? "black" : "white",
                          backgroundColor:
                            pathname == "/user" ? "white" : "",
                        }}
                      >
                        Access
                      </Link>

                      <br></br>
                    </PopoverContent>

                    {/* </Link> */}
                  </Popover>
                )}
              </div>

    //           <div>
    //             {session?.featureVehicleTab && (
    //               <Link href="/vehicles" style={{ zIndex: "999" }}>
    //                 <Tooltip
    //                   className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
    //                   placement="right"
    //                   content="Vehicles"
    //                 >
    //                   <svg
    //                     xmlns="http://www.w3.org/2000/svg"
    //                     width="24"
    //                     height="24"
    //                     className={`w-20 h-14 py-3 text-[white] dark:text-white
    // ${
    //   pathname == "/vehicles"
    //     ? "border-r-2 border-[#29303b] -mt-1"
    //     : "border-b-2"
    // }`}
    //                     viewBox="0 0 24 24"
    //                     fill="none"
    //                     stroke="currentColor"
    //                     stroke-width="2"
    //                     stroke-linecap="round"
    //                     stroke-linejoin="round"
    //                     style={{
    //                       color: pathname == "/vehicles" ? "green" : "white",
    //                       backgroundColor:
    //                         pathname == "/vehicles" ? "white" : "",
    //                     }}
    //                   >
    //                     <circle cx="7" cy="17" r="2" />
    //                     <circle cx="17" cy="17" r="2" />
    //                     <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6-6h15m-6 0v-5" />

    //                     <circle cx="19" cy="5" r="2" />
    //                     <path d="M19 2v1M19 8v1M22 5h-1M16 5h-1M21 3.5l-.7.7M17.7 6.3l-.7.7M17 3.5l.7.7M20.3 6.3l.7.7" />
    //                   </svg>
    //                 </Tooltip>
    //               </Link>
    //             )}
    //           </div>
            )}
          </div>

          <hr></hr>
          <div className="basis-1/1 w-screen  ">
            <nav
              className={`${
                fullparams == "full"
                  ? "hidden"
                  : "flex items-center justify-between  lg:mt-0 md:mt-14 sm:mt-14   flex-wrap bg-green px-5 py-2 sticky top-0 z-10 w-full"
              }`}
              // style={{ height: "7vh" }}
              style={{ WebkitOverflowScrolling: "touch" }}
              id="nav_height"
            >
              <div className="flex items-center flex-shrink-0 text-white logo_none">
                <Image
                  src={logo}
                  className="xl:h-12 lg:h-14 lg:w-44 sm:w-24    w-20 h-6   lg:block md:block  "
                  alt=""
                />
              </div>
              <div className="basis-20 py-6  lg:hidden  sticky top-0">
                <Box>
                  <CssBaseline />
                  <AppBar position="fixed" open={open}>
                    <Toolbar>
                      <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        className="-ms-4"
                      >
                        <MenuIcon />
                      </IconButton>

                      <div className="grid grid-cols-12 h-10 w-full hidden_top_popup">
                        <div className="lg:col-span-10 md:col-span-5 sm:col-span-8 col-span-2 mt-1 logo_top_header">
                          <Image
                            src={logo}
                            className="xl:h-12 lg:h-10 w-32 md:h-12 sm:h-10 h-10 lg:float-left
                    md:float-left sm:float-left
                    lg:mt-0 md:-mt-2 sm:-mt-1 lg:mx-0 md:mx-0 sm:mx-0 mx-auto block  sm:text-center"
                            alt=""
                          />
                        </div>
                        <div className="md:col-span-3 sm:col-span-12 col-span-6 flex items-center md:justify-end sm:justify-end client_name_popup">
                          {session?.clientName}
                        </div>
                        <div className="md:col-span-3 sm:col-span-4 col-span-3 flex items-center text-end md:justify-end sm:justify-center client_name_popup">
                          <BlinkingTime
                            timezone={session?.timezone}
                            dateFormat={session?.dateFormat || "DD MM YYYY"}
                            timeFormat={session?.timeFormat || "hh:mm:ss A"}
                          />
                        </div>

                        <div className="lg:col-span-2 md:col-span-1 sm:col-span-1 flex justify-end user_icon_top_header">
                          <Popover>
                            <PopoverHandler {...triggers}>
                              {session?.image !== "" &&
                              session?.image !== "null" ? (
                                <img
                                  className="cursor-pointer user_avator_image"
                                  src={session?.image}
                                  alt="Rounded avatar"
                                />
                              ) : (
                                <img
                                  className="cursor-pointer user_avator_image"
                                  src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                                  alt="Rounded avatar"
                                />
                              )}
                            </PopoverHandler>

                            <PopoverContent
                              {...triggers}
                              className="z-50 lg:w-auto md:w-auto w-full"
                            >
                              <div
                                className="grid grid-cols-12 w-full"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <div className="col-span-9 ms-2 text-lg font-popins text-center text-black">
                                  <p className="text-2xl ">
                                    {session?.FullName}
                                  </p>
                                  {session?.Email}
                                </div>
                              </div>
                              <hr></hr>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                                className="py-2 font-popins font-semibold"
                              >
                                {/* <TimeCounter /> */}
                              </div>
                              <Typography
                                variant="small"
                                color="gray"
                                className="font-normal "
                              >
                                <div className="flex justify-center">
                                  <button
                                    className="bg-green shadow-md hover:shadow-gray transition duration-500 cursor px-5 py-2 rounded-lg text-white "
                                    onClick={async () => {
                                      await logout({
                                        token: session?.accessToken,
                                        fcmtoken:
                                          localStorage.getItem("fcmToken"),
                                      });
                                      signOut();
                                    }}
                                  >
                                    <PowerSettingsNewIcon /> Log Out
                                  </button>
                                </div>
                              </Typography>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </Toolbar>
                  </AppBar>
                  <Drawer
                    sx={{
                      flexShrink: 0,
                      "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                      },
                    }}
                    anchor="left"
                    open={open}
                  >
                    <DrawerHeader>
                      <IconButton onClick={handleDrawerClose}>
                        {theme.direction === "ltr" ? (
                          <ChevronLeftIcon />
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List className="bg-[#29303b] h-screen">
                      <Link href="/liveTracking" style={{ zIndex: "999" }}>
                        <Tooltip
                          className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                          placement="right"
                          content="Live Map"
                        >
                          <svg
                            className="w-20 h-14 py-3 border-y-2 -ms-3 mt-12  text-white text-white-10 dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{
                              color:
                                pathname == "/liveTracking" ? "green" : "white",
                              backgroundColor:
                                pathname == "/liveTracking" ? "white" : "",
                              border: pathname == "/liveTracking" ? "none" : "",
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </Tooltip>
                      </Link>
                      <Link href="/journeyReplay" style={{ zIndex: "999" }}>
                        <Tooltip
                          className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                          placement="right"
                          content="Journey Replay"
                        >
                          <svg
                            className={`w-20 h-14 py-3  -my-1  -ms-3  text-white-10  dark:text-white ${
                              session?.userRole === "Controller"
                                ? "border-b-2 border-white"
                                : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color:
                                pathname == "/journeyReplay"
                                  ? "green"
                                  : "white",
                              backgroundColor:
                                pathname == "/journeyReplay" ? "white" : "",
                            }}
                          >
                            {" "}
                            <circle cx="12" cy="12" r="10" />{" "}
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                        </Tooltip>
                      </Link>
                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.featureVehicleTab && (
                            <Link href="/vehicles" style={{ zIndex: "999" }}>
                              <Tooltip
                                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                                placement="right"
                                content="Vehicles"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  className={`w-20 h-14 py-3  -my-1  -ms-3  text-white-10  dark:text-white${
                                    pathname === "/vehicles"
                                      ? "border-b-2 border-white"
                                      : ""
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  style={{
                                    color:
                                      pathname == "/vehicles"
                                        ? "green"
                                        : "white",
                                    backgroundColor:
                                      pathname == "/vehicles" ? "white" : "",
                                    border:
                                      pathname == "/vehicles" ? "none" : "",
                                  }}
                                >
                                  <circle cx="7" cy="17" r="2" />
                                  <circle cx="17" cy="17" r="2" />
                                  <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6-6h15m-6 0v-5" />

                                  <circle cx="19" cy="5" r="2" />
                                  <path d="M19 2v1M19 8v1M22 5h-1M16 5h-1M21 3.5l-.7.7M17.7 6.3l-.7.7M17 3.5l.7.7M20.3 6.3l.7.7" />
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}
                      {session?.userRole === "Controller" ? null : (
                        <Link href="/Zone" style={{ zIndex: "999" }}>
                          <Tooltip
                            className="bg-[#00B56C] text-white rounded shadow-lg !z-[9999]"
                            placement="right"
                            content="Zones"
                          >
                            <svg
                              className="w-20 h-14 py-3  border-y-2  -ms-3 text-[white]  text-white-10  dark:text-white"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                color:
                                  pathname == "/Zone" ||
                                  pathname == "/AddZone" ||
                                  `EditZone?id=${filterId}` ==
                                    `EditZone?id=${pathName}`
                                    ? "green"
                                    : "white",
                                backgroundColor:
                                  pathname == "/Zone" ||
                                  pathname == "/AddZone" ||
                                  `EditZone?id=${filterId}` ==
                                    `EditZone?id=${pathName}`
                                    ? "white"
                                    : "",
                                border:
                                  pathname == "/Zone" ||
                                  pathname == "/AddZone" ||
                                  `EditZone?id=${filterId}` ==
                                    `EditZone?id=${pathName}`
                                    ? "none"
                                    : "",
                              }}
                            >
                              {" "}
                              <path stroke="none" d="M0 0h24v24H0z" />{" "}
                              <circle
                                cx="12"
                                cy="12"
                                r=".5"
                                fill="currentColor"
                              />{" "}
                              <circle cx="12" cy="12" r="7" />{" "}
                              <line x1="12" y1="3" x2="12" y2="5" />{" "}
                              <line x1="3" y1="12" x2="5" y2="12" />{" "}
                              <line x1="12" y1="19" x2="12" y2="21" />{" "}
                              <line x1="19" y1="12" x2="21" y2="12" />
                            </svg>
                          </Tooltip>
                        </Link>
                      )}

                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.cameraProfile && (
                            <Link href="/DualCam" style={{ zIndex: "999" }}>
                              <Tooltip
                                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                                placement="right"
                                content="Camera"
                              >
                                <svg
                                  className={`w-20 h-14 py-3  text-white-10  dark:text-white 
                
                          ${
                            pathname === "/DualCam"
                              ? "border-r-2 border-#29303b -my-1"
                              : "border-y-1 border-b-2"
                          }`}
                                  width="24"
                                  height="24"
                                  viewBox="250 0 680 680"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    color:
                                      pathname == "/DualCam"
                                        ? "green"
                                        : "white",
                                    backgroundColor:
                                      pathname == "/DualCam" ? "white" : "",
                                  }}
                                >
                                  <g
                                    style={{
                                      fill:
                                        pathname == "/DualCam"
                                          ? "green"
                                          : "white",
                                      backgroundColor:
                                        pathname == "/DualCam" ? "white" : "",
                                    }}
                                  >
                                    <path
                                      d="M687.2,219.1c0,119.4,0,238.9,0,358.3c-1.6,4.6-2.8,9.3-4.9,13.6c-9.6,19.1-25.6,27.2-46.6,27.2
		c-157.2-0.1-314.3,0-471.5,0c-26.5,0-53.1,0-79.6,0c-13.8,0-25.9-4.1-35.9-13.7c-7.8-7.5-11.4-17.1-14.3-27.1
		c0-119.4,0-238.9,0-358.3c0.7-2,1.4-3.9,2-5.9c5.3-17.2,16.6-28.4,34-32.9c6.2-1.6,12.9-1.7,19.9-2.5c0-3.9-0.1-7.7,0-11.5
		c0.3-11.5,7.6-19.4,19.1-19.6c23.2-0.3,46.3-0.3,69.5,0c11.3,0.2,18.5,7.8,19,19.1c0.2,4,0,8,0,12.4c2.8,0.1,4.9,0.3,6.9,0.3
		c14.7,0,29.3-0.1,44,0.1c4.3,0.1,6.8-1.1,9.1-5c9.7-16.9,20.1-33.5,29.8-50.4c5-8.6,11.8-12.6,21.8-12.5c34.2,0.3,68.4,0.3,102.6,0
		c10-0.1,16.8,4,21.8,12.6c9.4,16.4,19.4,32.4,28.8,48.8c2.7,4.8,5.7,6.7,11.4,6.6c53.8-0.3,107.5-0.1,161.3-0.2
		c14.1,0,26.8,3.6,37.3,13.6C680.6,199.5,684.2,209.1,687.2,219.1z M360.5,262.9c-75.4,0.6-135.8,61.7-135,136.3
		c0.8,74.7,61.5,135,135.6,134.6c75-0.4,135.8-61.8,135-136.4C495.3,322.7,434.5,262.3,360.5,262.9z M580.4,276.5
		c9.8,0,19.5,0.1,29.3,0c10.9-0.2,18.8-7.9,19-18.2c0.3-10.5-7-19-17.9-19.2c-20.4-0.5-40.8-0.5-61.2,0
		c-10.7,0.3-18.3,9.2-17.9,19.3c0.4,10.3,8.4,17.9,19.3,18.1C560.8,276.7,570.6,276.5,580.4,276.5z"
                                    />
                                    <path
                                      d="M361.8,303.8c54.6,1.5,95,44.3,93.4,99.2c-1.4,49.9-46,91.7-96.2,90c-53.5-1.7-94-44.8-92.5-98.3
		C267.9,344.1,311.6,302.4,361.8,303.8z"
                                    />
                                  </g>
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}

                      <Link href="/Reports" style={{ zIndex: "999" }}>
                        <Tooltip
                          className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                          placement="right"
                          content="Reports"
                        >
                          <svg
                            className={`w-20 h-14 py-3 border-b-2 -ms-3
                  text-white-10  dark:text-white ${
                    session?.cameraProfile ? "border-y-2" : "border-b-2"
                  }`}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color: pathname == "/Reports" ? "green" : "white",
                              backgroundColor:
                                pathname == "/Reports" ? "white" : "",
                              border: pathname == "/Reports" ? "none" : "",
                            }}
                          >
                            <path d="M9 7V2.13a2.98 2.98 0 0 0-1.293.749L4.879 5.707A2.98 2.98 0 0 0 4.13 7H9Z" />
                            <path d="M18.066 2H11v5a2 2 0 0 1-2 2H4v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 20 20V4a1.97 1.97 0 0 0-1.934-2ZM10 18a1 1 0 1 1-2 0v-2a1 1 0 1 1 2 0v2Zm3 0a1 1 0 0 1-2 0v-6a1 1 0 1 1 2 0v6Zm3 0a1 1 0 0 1-2 0v-4a1 1 0 1 1 2 0v4Z" />
                          </svg>
                        </Tooltip>
                      </Link>
                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.featureBookingApp && (
                            <Link href="/Bookings" style={{ zIndex: "999" }}>
                              <Tooltip
                                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                                placement="right"
                                content="Bookings"
                              >
                                <svg
                                  version="1.0"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`w-20 h-14 py-3 text-white text-white-10 dark:text-white ${
                                    pathname === "/Bookings"
                                      ? "border-r-2 border-#29303b"
                                      : "border-y-2"
                                  }`}
                                  width="60px"
                                  height="50px"
                                  viewBox="10 30 750 500"
                                  style={{
                                    color:
                                      pathname == "/Bookings"
                                        ? "green"
                                        : "white",
                                    backgroundColor:
                                      pathname == "/Bookings" ? "white" : "",
                                  }}
                                  //  stroke="currentColor"
                                  // width="512.000000pt" height="512.000000pt"
                                  // viewBox="0 0 512.000000 512.000000"
                                  preserveAspectRatio="xMidYMid meet"
                                >
                                  <g
                                    transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    style={{
                                      fill:
                                        pathname == "/Bookings"
                                          ? "green"
                                          : "white",
                                      backgroundColor:
                                        pathname == "/Bookings" ? "white" : "",
                                    }}
                                  >
                                    <path
                                      d="M1055 5106 c-72 -32 -95 -85 -95 -218 l0 -88 -227 0 c-257 0 -321 -9
-429 -62 -92 -44 -197 -149 -241 -239 -67 -136 -63 1 -63 -2100 0 -1869 0
-1907 20 -1983 25 -101 69 -176 144 -252 76 -75 151 -119 252 -144 76 -20 115
-20 2144 -20 2026 0 2068 0 2144 20 105 26 168 63 247 140 80 79 123 153 149
256 20 76 20 114 20 1983 0 2101 4 1964 -63 2100 -43 89 -149 195 -240 239
-107 52 -172 62 -428 62 l-227 0 -4 109 c-3 91 -7 115 -24 137 -70 94 -190 96
-251 5 -20 -30 -23 -46 -23 -142 l0 -109 -335 0 -335 0 0 100 c0 117 -13 156
-61 191 -45 32 -125 33 -165 3 -60 -44 -69 -67 -72 -185 l-4 -109 -328 0 -328
0 -4 109 c-3 118 -12 141 -72 185 -40 30 -120 29 -165 -3 -48 -35 -61 -74 -61
-191 l0 -100 -335 0 -335 0 0 109 c0 96 -3 112 -23 142 -40 61 -117 84 -182
55z m-93 -713 c4 -124 18 -158 78 -192 72 -40 158 -18 200 51 17 28 20 51 20
141 l0 107 335 0 335 0 0 -107 c0 -90 3 -113 20 -141 61 -100 204 -95 258 8
18 37 22 60 22 142 l0 98 330 0 330 0 0 -98 c0 -82 4 -105 23 -142 53 -103
196 -108 257 -8 17 28 20 51 20 141 l0 107 335 0 335 0 0 -107 c0 -122 13
-156 72 -194 41 -25 122 -22 160 7 50 37 62 71 66 187 l4 108 237 -3 236 -3
53 -30 c56 -30 100 -83 120 -144 8 -22 12 -116 12 -262 l0 -229 -2260 0 -2260
0 0 229 c0 148 4 240 12 262 17 51 54 101 93 128 68 46 97 50 331 51 l222 0 4
-107z m3858 -2371 c0 -1695 6 -1564 -76 -1646 -82 -83 113 -76 -2184 -76
-2297 0 -2102 -7 -2184 76 -82 82 -76 -49 -76 1646 l0 1508 2260 0 2260 0 0
-1508z"
                                    />
                                    <path
                                      d="M800 3008 c-18 -13 -43 -36 -54 -51 -20 -28 -21 -39 -21 -397 0 -358
1 -369 21 -397 11 -15 36 -38 54 -50 33 -23 36 -23 395 -23 359 0 362 0 395
23 18 12 43 35 54 50 20 28 21 39 21 397 0 358 -1 369 -21 397 -11 15 -36 38
-54 51 -33 22 -36 22 -395 22 -359 0 -362 0 -395 -22z m570 -448 l0 -170 -175
0 -175 0 0 170 0 170 175 0 175 0 0 -170z"
                                    />
                                    <path
                                      d="M3530 3008 c-18 -13 -43 -36 -54 -51 -20 -28 -21 -39 -21 -397 0
-358 1 -369 21 -397 11 -15 36 -38 54 -50 33 -23 36 -23 395 -23 359 0 362 0
395 23 18 12 43 35 54 50 20 28 21 39 21 397 0 358 -1 369 -21 397 -11 15 -36
38 -54 51 -33 22 -36 22 -395 22 -359 0 -362 0 -395 -22z m570 -448 l0 -170
-175 0 -175 0 0 170 0 170 175 0 175 0 0 -170z"
                                    />
                                    <path
                                      d="M2855 2930 c-18 -6 -102 -82 -217 -197 l-188 -188 -67 67 c-38 36
-82 73 -100 82 -118 59 -250 -65 -202 -191 5 -15 69 -87 142 -160 151 -153
188 -175 260 -154 35 11 84 54 291 259 136 136 254 261 262 279 50 115 -62
240 -181 203z"
                                    />
                                    <path
                                      d="M827 1736 c-50 -18 -67 -34 -88 -81 -17 -36 -19 -73 -19 -380 0 -334
0 -342 23 -385 16 -33 34 -51 67 -67 43 -23 52 -23 385 -23 334 0 342 0 385
23 26 13 53 36 65 57 19 33 20 52 20 395 0 344 -1 362 -20 395 -12 19 -36 43
-55 55 -33 19 -53 20 -380 22 -271 2 -353 0 -383 -11z m538 -461 l0 -170 -170
0 -170 0 -3 160 c-1 87 0 165 3 172 3 11 41 13 172 11 l168 -3 0 -170z"
                                    />
                                    <path
                                      d="M2196 1740 c-16 -5 -40 -19 -53 -32 -53 -49 -53 -51 -53 -436 0 -356
0 -359 23 -392 12 -18 35 -43 50 -54 28 -20 39 -21 397 -21 358 0 369 1 397
21 15 11 38 36 51 54 22 33 22 36 22 395 0 359 0 362 -22 395 -13 18 -36 43
-51 54 -27 20 -40 21 -380 23 -194 1 -365 -2 -381 -7z m534 -465 l0 -175 -170
0 -170 0 0 175 0 175 170 0 170 0 0 -175z"
                                    />
                                    <path
                                      d="M3555 1735 c-49 -18 -81 -53 -95 -106 -7 -26 -10 -157 -8 -377 3
-385 4 -387 88 -429 43 -23 51 -23 385 -23 333 0 342 0 385 23 33 16 51 34 68
67 22 43 22 52 22 385 0 503 33 469 -460 472 -280 2 -353 0 -385 -12z m540
-460 l0 -170 -170 0 -170 0 -3 160 c-1 87 0 165 3 172 3 11 41 13 172 11 l168
-3 0 -170z"
                                    />
                                  </g>
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}
                      <Link href="/Notifications" style={{ zIndex: "999" }}>
                        <Tooltip
                          className="bg-white text-[#00B56C] shadow-lg rounded  !z-[9999]"
                          placement="right"
                          content="Events and Notifications"
                        >
                          <svg
                            className={`w-14 h-14 py-3  text-white-10 dark:text-white ${
                              pathname === "/Notifications"
                                ? "border-r-2 border-#29303b -my-1"
                                : "border-y-1 border-b-2"
                            }`}
                            viewBox="0 0 710 720"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color:
                                pathname === "/Notifications"
                                  ? "green"
                                  : "white",
                              backgroundColor:
                                pathname === "/Notifications" ? "white" : "",
                            }}
                          >
                            <path
                              d="M70.3,205.7c-7.5,0-13.8,0-21.1,0c0,2.7,0,5.2,0,7.6c0,115.5,0.4,230.9-0.3,346.4c-0.2,26.8,17.5,44.6,44.5,44.4
		c97.3-0.7,194.6-0.3,291.9-0.3c3,0,6.1-0.1,9.1,0.1c7.2,0.4,12.1,5.2,12.2,11.8c0.1,6.6-4.7,11.9-11.8,12.3
		c-6.5,0.4-13.1,0.1-19.7,0.1c-94.5,0-189,0.1-283.6,0c-40.6-0.1-66.5-26.3-66.5-66.8c0-138.4-0.1-276.8,0-415.2
		c0-33.1,18.9-58,49.2-64.6c5.8-1.3,12-1.2,18-1.4c6.5-0.2,13-0.1,20.4-0.1c0-6-0.1-11.2,0-16.4c0.4-22.4,17.2-39.9,38.7-40.4
		c25.1-0.6,42.9,15,44.1,38.8c0.3,5.5,0,11,0,17.2c98,0,195.4,0,294,0c0-4.2,0-8.6,0-13c0.1-24.3,18-42.8,41.5-43
		c23.3-0.2,41.5,18.6,41.6,42.8c0,4.3,0,8.5,0,14c7.6,0,14.8,0,22,0c39.2,0.2,65.5,26.2,65.5,65.5c0.1,107.9,0.1,215.8,0,323.7
		c0,4.7,0.8,8.2,4.7,11.8c4.1,3.8,6.7,9.3,9.6,14.3c6.3,10.6,12.6,21.3,18.5,32.1c7.2,12.9,3.9,24.6-8.8,32.3
		c-4.1,2.5-8.4,4.5-12.4,7.2c-4.7,3.3-4.7,6.9,0.3,10c4.3,2.6,8.8,5,13,7.6c11.5,7.1,14.9,18.8,8.4,30.6
		c-7.9,14.3-16.1,28.5-24.5,42.6c-6.7,11.2-18.5,14.3-30.1,8.1c-4.7-2.5-9.1-5.5-13.8-7.8c-5.1-2.5-8.3-0.7-8.6,5.1
		c-0.3,5.3,0,10.6-0.2,15.9c-0.5,12.9-9.3,21.7-22.2,21.9c-16.4,0.2-32.8,0.2-49.2,0c-13-0.2-21.7-9-22.2-21.9
		c-0.2-5,0.1-10.1-0.1-15.1c-0.3-6.7-3.5-8.6-9.3-5.5c-4.5,2.3-8.7,5.1-13.1,7.5c-11.5,6.1-23.4,3.1-30.1-8
		c-8.4-14-16.6-28.2-24.6-42.5c-6.5-11.7-3.2-23.6,8.3-30.7c4.1-2.5,8.4-4.7,12.4-7.2c5.9-3.7,5.8-7.5-0.2-11.3
		c-4.1-2.5-8.3-4.7-12.4-7.3c-11.1-6.9-14.5-18.7-8.2-30c8.1-14.5,16.3-29,24.9-43.2c6.5-10.8,18.3-13.8,29.6-8
		c4.7,2.4,9.1,5.5,13.8,7.8c5.6,2.8,8.7,1,9-5.2c0.3-5.3,0-10.6,0.2-15.9c0.4-12.1,8.8-21.3,20.9-21.6c17.1-0.5,34.3-0.5,51.4,0
		c12.1,0.3,20.6,9.3,21.2,21.4c0.3,5.5,0,11.1,0.1,16.6c0.1,5.7,3.4,6.9,8.2,5.1c9.9-3.6,11.5-6,11.5-16.4c0-85,0-169.9,0-254.9
		c0-2.7,0-5.4,0-8.5c-180.8,0-360.6,0-541,0c0,83.5,0,166.8,0,251c3.5,0,6.7,0,9.9,0c22.2,0,44.4,0,66.5,0c11.4,0,15.3,4,15.3,15.6
		c0,25.2,0,50.4,0,76.8c3.1,0,5.8,0,8.4,0c64.5,0,129.1,0,193.6,0c2.8,0,5.6-0.1,8.3,0.1c7.2,0.5,12.1,5.4,12.1,12
		c0,6.5-5,11.8-12.1,12c-11.8,0.3-23.7,0.2-35.5,0.2c-60.5,0-121-0.1-181.5,0.1c-7.4,0-12.8-2.3-18-7.5
		c-28.3-28.7-56.8-57.2-85.5-85.6c-4.9-4.9-6.4-10.3-6.4-17c0.1-82.7,0.1-165.4,0.1-248.1C70.3,212.4,70.3,209.5,70.3,205.7z
		 M49.5,180.5c195.9,0,391.1,0,586.6,0c0-11.8,0-22.9,0-33.9c0-2.3,0-4.5-0.1-6.8c-1.2-15.8-11.1-30-26.2-33.4
		c-11.7-2.7-24.2-2.2-37.1-3.1c0,6.5,0.1,11,0,15.5c-0.4,23.7-18.6,42-41.8,41.8c-22.7-0.1-40.8-18.4-41.2-41.6
		c-0.1-4.7,0-9.4,0-14.6c-98.3,0-195.7,0-294,0c0,5.4,0.1,10.4,0,15.4c-0.7,24.8-17.8,41.1-42.9,40.9c-22.9-0.2-39.7-17.6-40.1-41.3
		c-0.1-4.9,0-9.8,0-14.9c-10.8,0-20.4-0.7-29.9,0.1c-17.7,1.5-32.1,16-33.1,33.8C48.8,152.2,49.5,166,49.5,180.5z M649.3,499.9
		c-13.7,7.5-26.6,16.2-42.6,7.1c-16-9.1-14.4-25-14.8-39.9c-15.3,0-29.8,0-44.3,0c3.8,42-27.3,55.3-57.8,32.8
		c-7.4,12.8-14.7,25.6-22.4,38.8c14.2,7.4,27.2,15,27.3,32.8c0.1,18.2-13.5,25.6-27.2,33.1c7.7,13.3,15,25.9,22.5,39
		c13.3-8.6,26.5-16.3,42.3-7.2c15.7,9.1,15,24.7,14.9,40.1c8.2,0,15.5,0,22.8,0c7.2,0,14.4,0,21.7,0c-4.6-40.7,26-56.5,57.7-33.4
		c7.3-12.8,14.7-25.5,22.1-38.5c-13.7-8-27.4-14.9-27.4-33c0-18.4,14.2-25.2,27.4-33.2C664,525.4,656.7,512.8,649.3,499.9z
		 M513.8,91.5c0,4.5,0,9,0,13.6c0,4.8-0.1,9.6,0,14.3c0.3,11,6.7,17,17.7,17.1c10,0.1,16.7-6.6,16.8-17.2c0.2-18.3,0.2-36.7,0-55.1
		c-0.1-10.5-7-17.2-17-17.1c-11,0.1-17.4,6.2-17.6,17.2C513.7,73.4,513.8,82.5,513.8,91.5z M136.9,91.6c0,9.5-0.2,19.1,0,28.6
		c0.2,9.6,6.8,16.1,16.1,16.3c10.4,0.2,17.9-5.4,18.2-15c0.5-19.6,0.5-39.2,0-58.8c-0.2-9.9-7.8-15.9-17.7-15.5
		c-10.4,0.4-16.5,6.3-16.7,16.4C136.7,73,136.9,82.3,136.9,91.6z M116.2,481.5c15.3,15.3,31.3,31.2,46,46c0-13.8,0-29.8,0-46
		C145.8,481.5,129.9,481.5,116.2,481.5z"
                            />
                            <path
                              d="M351.4,411.7c25.8,0.1,45.3,19.6,45.4,45.5c0.2,26.5-19.8,46.7-46,46.6c-24.4-0.2-44.9-20.9-45-45.6
		C305.6,432.6,326.2,411.7,351.4,411.7z M372.7,457.3c-0.2-11.8-10.1-21.5-21.9-21.3c-11.8,0.2-21.4,10.3-21.1,22.1
		c0.3,11.9,10.3,21.6,21.9,21.4C363.3,479.3,372.9,469.1,372.7,457.3z"
                            />
                            <path
                              d="M521.8,333.3c-24.8,0.1-45.7-20.9-45.5-46c0.1-25.1,20.8-46,45.6-46.1c24.5-0.1,45.1,20.6,45.5,45.4
		C567.8,312.2,547.2,333.2,521.8,333.3z M543.4,287.5c0.1-11.8-9.8-21.9-21.4-21.9c-11.7,0-21.6,10-21.6,21.7
		c0,12,9.6,21.7,21.5,21.8C533.6,309.2,543.3,299.4,543.4,287.5z"
                            />
                            <path
                              d="M226.5,287.7c-0.2,25-21,45.3-46.2,45.3c-24.9,0-46.1-21.3-45.8-45.8c0.4-25.4,21.4-45.5,47.1-45.1
		C206.5,242.3,226.8,263,226.5,287.7z M180.4,265.9c-12,0.1-21.8,10-21.6,21.7c0.2,11.8,10.1,21.3,22,21.3
		c11.9,0,21.5-9.8,21.4-21.7C202.2,275.3,192.4,265.8,180.4,265.9z"
                            />
                            <path
                              d="M350.1,333.3c-24.4-0.4-44.7-21.6-44.3-46.3c0.4-25.3,21-45.9,45.9-45.7c24.7,0.2,45.6,21.6,45.2,46.5
		C396.4,313.4,375.5,333.7,350.1,333.3z M372.8,287.2c-0.1-11.8-10-21.8-21.7-21.7c-11.8,0.1-21.5,10.1-21.4,21.9
		c0.1,12,9.8,21.6,21.7,21.6C363.2,309.1,372.9,299.2,372.8,287.2z"
                            />
                            <path
                              d="M569.6,520.5c27.9,0,50.6,22.8,50.7,51.1c0.2,27.9-23.1,51.3-50.8,51.2c-27.9-0.1-50.8-23.2-50.8-51.2
		C518.7,543.5,541.6,520.5,569.6,520.5z M569.7,598.5c14.7-0.1,26.8-12.6,26.5-27.3c-0.3-14.9-12.5-26.8-27.3-26.5
		c-14.4,0.3-26.2,12.4-26.2,26.9C542.7,586.4,555.1,598.7,569.7,598.5z"
                            />
                          </svg>
                        </Tooltip>
                      </Link>

                      {session?.featureAttendance && (
                      <Link href="/Attendance" style={{ zIndex: "999" }}>
                      <Tooltip
                        className="bg-white text-[#00B56C] shadow-lg rounded !z-[9999]"
                        placement="right"
                        content="Attendance"
                      >
                        <svg
                          className={`w-14 h-14 py-3 text-white-10 dark:text-white ${
                            pathname === "/Attendance"
                              ? "border-r-2 border-[#29303b] -my-1"
                              : "border-y-1 border-b-2"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            color: pathname === "/Attendance" ? "green" : "white",
                            backgroundColor: pathname === "/Attendance" ? "white" : "",
                          }}
                        >
                          {/* Simple ID Card Icon */}
                          <rect x="2" y="4" width="20" height="16" rx="2" fill="none"/>
                          <circle cx="9" cy="10" r="2" fill="none"/>
                          <path d="M7 14c0-1 1-2 2-2s2 1 2 2" fill="none" strokeLinecap="round"/>
                          <path d="M14 9h4M14 12h4M14 15h3" fill="none" strokeLinecap="round"/>
                        </svg>
                      </Tooltip>
                    </Link>
)}
                      {session?.PortalNotification && (
                        <Link href="/NotificationTab" style={{ zIndex: "999" }}>
                          <Tooltip
                            className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                            placement="right"
                            content="Notifications"
                          >
                            <svg
                              className={`w-14 h-14 py-3 text-white-10 dark:text-white ${
                                pathname === "/NotificationTab"
                                  ? "border-r-2 border-#29303b -my-1"
                                  : "border-y-1 border-b-2"
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                color:
                                  pathname === "/NotificationTab"
                                    ? "green"
                                    : "white",
                                backgroundColor:
                                  pathname === "/NotificationTab"
                                    ? "white"
                                    : "",
                              }}
                            >
                              <path d="M12 22C13.1046 22 14 21.1046 14 20C14 19.4477 13.5523 19 13 19H11C10.4477 19 10 19.4477 10 20C10 21.1046 10.8954 22 12 22ZM18 16V11C18 7.13401 15.866 4 12 4C8.13401 4 6 7.13401 6 11V16L4 18V19H20V18L18 16Z" />
                            </svg>
                          </Tooltip>
                        </Link>
                      )}
                       {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.driverProfile && (

                      <Popover placement="right-start">
                        <Tooltip
                          className="bg-white text-green shadow-lg rounded border-none"
                          placement="right"
                          content="Driver"
                        >
                          <PopoverHandler>
                            <svg
                              className="w-14 h-14 py-3 border-b-2 text-[white] text-white-10  dark:text-white"
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
                              <circle cx="7" cy="17" r="2" />{" "}
                              <circle cx="17" cy="17" r="2" />{" "}
                              <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                            </svg>
                          </PopoverHandler>
                        </Tooltip>
                        <PopoverContent className="border-none  cursor-pointer bg-green">
                          <span
                            className=" w-full text-white"
                            onClick={() => router.push("/DriverProfile")}
                          >
                            Driver Profile
                          </span>
                          <br></br>
                          <br></br>
                          <span
                            className=" w-full text-white"
                            onClick={() => router.push("/DriverAssign")}
                          >
                            Assign Driver
                          </span>
                          <br></br>
                        </PopoverContent>
                      </Popover>
                )}</div>)}
                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.immobilising && (
                            <Link href="/Immobilize" style={{ zIndex: "999" }}>
                              <Tooltip
                                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                                placement="right"
                                content="Immobilize"
                              >
                                <svg
                                  id="Layer_1"
                                  data-name="Layer 1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`w-14 h-14 py-3   text-[white]  text-white-10  dark:text-white  ${
                                    pathname == "/Immobilize"
                                      ? "border-r-2 #29303b"
                                      : "border-b-2"
                                  }`}
                                  // width="140px"
                                  // height="140px"
                                  // viewBox="0 0 121.92 73.9"
                                  viewBox="0 0 115 80"
                                  strokeWidth="5"
                                  stroke="currentColor"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    color:
                                      pathname == "/Immobilize"
                                        ? "green"
                                        : "white",
                                    backgroundColor:
                                      pathname == "/Immobilize" ? "white" : "",
                                  }}
                                >
                                  <g>
                                    <path
                                      class="st0"
                                      d="M67.9,0H28.3L14,15.7l-0.4,0.5h-7c0,0-2.1,0-2.5,2.7c-0.3,1.5,0.3,3,1.5,3.8c1.1,0,2.1,0.1,3.1,0.3
		c1.6,0.3,1.2,1.6,1.2,1.6c-6.2,3.9-9.7,11.3-9.7,11.3L0,65l2.1,2.5h13.4l2.6-6.2h56.5V37c-0.2-1.8,1.2-3.4,3-3.6c0.1,0,0.3,0,0.4,0
		V17l1.3-2.8L67.9,0z M11.3,40C7.2,40,4,38.2,4,36.1s3.3-3.8,7.3-3.8s7.3,1.7,7.3,3.8S15.3,40,11.3,40z M74.3,54.7
		c0,1.7-1.4,3.2-3.1,3.2c0,0,0,0-0.1,0H23.5c-1.7,0-3.1-1.4-3.1-3.2l0,0v-0.6c0-1.7,1.4-3.2,3.1-3.2c0,0,0,0,0,0h47.6
		c1.7,0,3.2,1.4,3.2,3.1c0,0,0,0,0,0L74.3,54.7z M77,19.2H18.6v-2.8l9.6-12.6h39.5L77,16V19.2z"
                                    />
                                    <path
                                      class="st0"
                                      d="M118.4,34.7V19.2c0,0-3-13.8-19.6-14c0,0-14.2-0.4-18.7,14l0.2,15.3c0,0-3,1-3.3,3.5v32.7
		c0.1,1.8,1.5,3.1,3.3,3.2c3.1,0.2,38.2,0,38.2,0s3.6-0.8,3.5-4.3V37.3C121.9,37.3,121,34.5,118.4,34.7z M102,61h-5.4l0.8-7.5
		c-1.2-0.6-2-1.8-2.1-3.2c0.3-2.2,2.4-3.7,4.6-3.3c1.7,0.3,3.1,1.6,3.3,3.3c0,1.4-0.8,2.6-2.1,3.2L102,61z M113.1,34.5H84.6V19.2
		c0,0,2.4-9.8,14.8-10.2c0,0,11.6,0.8,13.8,9.3L113.1,34.5z"
                                    />
                                  </g>
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}

                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.ServiceHistory && (
                            <Link
                              href="/ServiceHistory"
                              style={{ zIndex: "999" }}
                            >
                              <Tooltip
                                className="bg-[#00B56C] text-white rounded shadow-lg !z-[9999]"
                                placement="right"
                                content="Service History"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`py-2 text-white-10 dark:text-white ${
                                    pathname == "/ServiceHistory"
                                      ? "border-b-2 mr-[1.5px] border-green-500"
                                      : "border-b-2  border-white"
                                  }`}
                                  width="60px"
                                  height="50px"
                                  viewBox="0 0 512 512"
                                  style={{
                                    backgroundColor:
                                      pathname == "/ServiceHistory"
                                        ? "white"
                                        : "", // White bg when active, black when not
                                    borderRadius: "0", // Ensure no rounding, so it stays as a square
                                  }}
                                >
                                  <g transform="translate(1 1)">
                                    <g>
                                      <g>
                                        <path
                                          d="M379.16,289.987c-32.427,0-63.147,12.8-83.627,36.693c-3.413,3.413-2.56,8.533,0.853,11.947
                c3.413,3.413,8.533,2.56,11.947-0.853C325.4,317.293,351,306.2,378.307,306.2c52.053,0,93.867,41.813,93.867,93.867
                c0,52.053-41.813,93.867-93.867,93.867c-42.463,0-79.831-28.994-91.449-68.267h40.249V408.6h-50.179
                c-0.916-0.161-1.84-0.178-2.728,0h-15.36v68.267h17.067v-30.611C293.778,484.327,333.771,511,378.307,511
                c61.44,0,111.787-48.64,111.787-110.08S440.6,289.987,379.16,289.987z"
                                          fill={
                                            pathname == "/ServiceHistory"
                                              ? "green"
                                              : "white"
                                          }
                                        />
                                        <path
                                          d="M71.107,50.2c-9.387,0-17.067,7.68-17.067,17.067V459.8c0,9.387,7.68,17.067,17.067,17.067H233.24
                c5.12,0,8.533-3.413,8.533-8.533s-3.413-8.533-8.533-8.533H71.107V67.267h85.333c0,9.387,7.68,17.067,17.067,17.067h119.467
                c9.387,0,17.067-7.68,17.067-17.067h85.333v196.267c0,5.12,3.413,8.533,8.533,8.533c5.12,0,8.533-3.413,8.533-8.533V67.267
                c0-9.387-7.68-17.067-17.067-17.067H310.04V33.133h110.933c5.12,0,8.533,3.413,8.533,8.533v221.867
                c0,5.12,3.413,8.533,8.533,8.533s8.533-3.413,8.533-8.533V41.667c0-14.507-11.093-25.6-25.6-25.6H310.04
                C310.04,6.68,302.36-1,292.973-1H173.507c-9.387,0-17.067,7.68-17.067,17.067H45.507c-14.507,0-25.6,11.093-25.6,25.6V485.4
                c0,14.507,11.093,25.6,25.6,25.6H233.24c5.12,0,8.533-3.413,8.533-8.533s-3.413-8.533-8.533-8.533H45.507
                c-5.12,0-8.533-3.413-8.533-8.533V41.667c0-5.12,3.413-8.533,8.533-8.533H156.44V50.2H71.107z M173.507,16.067h119.467V24.6
                v34.133v8.533H173.507v-8.533V24.6V16.067z"
                                          fill={
                                            pathname == "/ServiceHistory"
                                              ? "green"
                                              : "white"
                                          }
                                        />
                                        <path
                                          d="M330.264,177.347l-33.024-46.08c-5.12-7.68-13.653-11.947-23.04-11.947h-36.925c-1.169-0.55-2.525-0.853-4.035-0.853
                s-2.865,0.304-4.035,0.853H192.28c-9.387,0-17.92,4.267-23.04,11.947l-33.024,46.08h-17.323c-12.8,0-22.187,10.24-22.187,22.187
                v33.28c0,12.8,9.387,22.187,22.187,22.187h13.034c3.814,14.679,17.216,25.6,33.046,25.6c15.829,0,29.232-10.921,33.046-25.6
                h70.442c3.814,14.679,17.216,25.6,33.046,25.6c15.829,0,29.232-10.921,33.046-25.6h13.034c12.8,0,22.187-9.387,23.04-22.187
                v-33.28c0-12.8-10.24-22.187-22.187-22.187H330.264z M282.733,139.8l26.7,37.547h-67.66v-41.813h31.573
                C277.613,135.533,281.027,137.24,282.733,139.8z M182.04,139.8c2.56-2.56,5.973-4.267,9.387-4.267h33.28v41.813h-68.532
                L182.04,139.8z"
                                          fill={
                                            pathname == "/ServiceHistory"
                                              ? "green"
                                              : "white"
                                          }
                                        />
                                        <path
                                          d="M233.24,323.267h-128c-5.12,0-8.533,3.413-8.533,8.533c0,5.12,3.413,8.533,8.533,8.533h128
                c5.12,0,8.533-3.413,8.533-8.533C241.773,326.68,238.36,323.267,233.24,323.267z"
                                          fill={
                                            pathname == "/ServiceHistory"
                                              ? "green"
                                              : "white"
                                          }
                                        />
                                        <path
                                          d="M233.24,365.933h-128c-5.12,0-8.533,3.413-8.533,8.533S100.12,383,105.24,383h128c5.12,0,8.533-3.413,8.533-8.533
                S238.36,365.933,233.24,365.933z"
                                          fill={
                                            pathname == "/ServiceHistory"
                                              ? "green"
                                              : "white"
                                          }
                                        />
                                        <path
                                          d="M233.24,408.6h-128c-5.12,0-8.533,3.413-8.533,8.533s3.413,8.533,8.533,8.533h128c5.12,0,8.533-3.413,8.533-8.533
                S238.36,408.6,233.24,408.6z"
                                          fill={
                                            pathname == "/ServiceHistory"
                                              ? "green"
                                              : "white"
                                          }
                                        />
                                      </g>
                                    </g>
                                  </g>
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}
                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.ServiceHistory && (
                            <Link href="/Documents" style={{ zIndex: "999" }}>
                              <Tooltip
                                className="bg-[#00B56C] text-white rounded shadow-lg !z-[9999]"
                                placement="right"
                                content="Manage Documents"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`py-2 text-white-10 dark:text-white ${
                                    pathname == "/Documents"
                                      ? "border-b-2 mr-[1.5px] border-green-500"
                                      : "border-b-2 border-white"
                                  }`}
                                  width="60px"
                                  height="50px"
                                  viewBox="0 0 482.14 482.14"
                                  style={{
                                    backgroundColor:
                                      pathname == "/Documents" ? "white" : "", // White bg when active, black when not
                                    borderRadius: "0", // Ensure no rounding, so it stays as a square
                                  }}
                                >
                                  <g>
                                    <path
                                      d="M302.599,0H108.966C80.66,0,57.652,23.025,57.652,51.315v379.509c0,28.289,23.008,51.315,51.314,51.315h264.205
              c28.275,0,51.316-23.026,51.316-51.315V121.449L302.599,0z M373.171,450.698H108.966c-10.969,0-19.89-8.905-19.89-19.874V51.315
              c0-10.953,8.921-19.858,19.89-19.858l181.875-0.189v67.218c0,19.653,15.949,35.603,35.588,35.603l65.877-0.189l0.725,296.925
              C393.03,441.793,384.142,450.698,373.171,450.698z"
                                      fill={
                                        pathname == "/Documents"
                                          ? "green"
                                          : "white"
                                      }
                                    />
                                    <path
                                      d="M241.054,150.96c-49.756,0-90.102,40.347-90.102,90.109c0,49.764,40.346,90.11,90.102,90.11
              c49.771,0,90.117-40.347,90.117-90.11C331.171,191.307,290.825,150.96,241.054,150.96z M273.915,253.087h-20.838v20.835
              c0,6.636-5.373,12.017-12.023,12.017c-6.619,0-12.01-5.382-12.01-12.017v-20.835H208.21c-6.637,0-12.012-5.383-12.012-12.018
              c0-6.634,5.375-12.017,12.012-12.017h20.834v-20.835c0-6.636,5.391-12.018,12.01-12.018c6.65,0,12.023,5.382,12.023,12.018v20.835
              h20.838c6.635,0,12.008,5.383,12.008,12.017C285.923,247.704,280.55,253.087,273.915,253.087z"
                                      fill={
                                        pathname == "/Documents"
                                          ? "green"
                                          : "white"
                                      }
                                    />
                                  </g>
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}
                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.featureReportApp && (
                            <Link href="/Reporting" style={{ zIndex: "999" }}>
                              <Tooltip
                                className="bg-[#00B56C] text-white shadow-lg rounded  !z-[9999]"
                                placement="right"
                                content="Reporting"
                              >
                                <svg
                                  version="1.0"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`w-20 h-14 py-3 text-white text-white-10 dark:text-white ${
                                    pathname === "/Reporting"
                                      ? "border-r-2 border-#29303b"
                                      : "border-y-2"
                                  }`}
                                  style={{
                                    color:
                                      pathname == "/Reporting"
                                        ? "green"
                                        : "white",
                                    backgroundColor:
                                      pathname == "/Reporting" ? "white" : "",
                                  }}
                                  width="512.000000pt"
                                  height="512.000000pt"
                                  viewBox="0 0 512.000000 512.000000"
                                  preserveAspectRatio="xMidYMid meet"
                                >
                                  <g
                                    transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    style={{
                                      fill:
                                        pathname == "/Reporting"
                                          ? "green"
                                          : "white",
                                      backgroundColor:
                                        pathname == "/Reporting" ? "white" : "",
                                    }}
                                  >
                                    <path
                                      d="M880 5105 c-102 -33 -150 -117 -150 -261 l0 -94 -225 0 c-252 0 -318
-10 -425 -62 -92 -44 -197 -149 -241 -239 -67 -136 -63 1 -63 -2100 0 -1869 0
-1907 20 -1983 25 -101 69 -176 144 -252 76 -75 151 -119 252 -144 76 -20 115
-20 2144 -20 2026 0 2068 0 2144 20 105 26 168 63 247 140 80 79 123 153 149
256 20 76 20 114 20 1983 0 2101 4 1964 -63 2100 -43 89 -149 195 -240 239
-107 52 -172 62 -428 62 l-227 0 -4 109 c-3 91 -7 115 -24 137 -70 94 -190 96
-251 5 -20 -30 -23 -46 -23 -142 l0 -109 -335 0 -335 0 0 100 c0 117 -13 156
-61 191 -45 32 -125 33 -165 3 -60 -44 -69 -67 -72 -185 l-4 -109 -328 0 -328
0 -4 109 c-3 118 -12 141 -72 185 -40 30 -120 29 -165 -3 -48 -35 -61 -74 -61
-191 l0 -100 -335 0 -335 0 0 109 c0 96 -3 112 -23 142 -40 61 -117 84 -182
55z m-70 -705 c0 -90 3 -113 20 -141 61 -100 204 -95 258 8 18 37 22 60 22
142 l0 98 330 0 330 0 0 -98 c0 -82 4 -105 23 -142 53 -103 196 -108 257 -8
17 28 20 51 20 141 l0 107 335 0 335 0 0 -107 c0 -122 13 -156 72 -194 41 -25
122 -22 160 7 50 37 62 71 66 187 l4 108 237 -3 236 -3 53 -30 c56 -30 100
-83 120 -144 8 -22 12 -116 12 -262 l0 -229 -2260 0 -2260 0 0 229 c0 148 4
240 12 262 17 51 54 101 93 128 68 46 97 50 331 51 l222 0 0 -107z m3850
-2371 c0 -1695 6 -1564 -76 -1646 -82 -83 113 -76 -2184 -76 -2297 0 -2102 -7
-2184 76 -82 82 -76 -49 -76 1646 l0 1508 2260 0 2260 0 0 -1508z"
                                    />
                                    {/* <path d="M1320 4030 l0 -170 170 0 170 0 0 170 0 170 -170 0 -170 0 0 -170z"/>
            <path d="M1320 3230 l0 -170 170 0 170 0 0 170 0 170 -170 0 -170 0 0 -170z"/>
            <path d="M1320 2430 l0 -170 170 0 170 0 0 170 0 170 -170 0 -170 0 0 -170z"/>
            <path d="M2000 4030 l0 -170 1700 0 1700 0 0 170 0 170 -1700 0 -1700 0 0 -170z"/>
            <path d="M2000 3230 l0 -170 1700 0 1700 0 0 170 0 170 -1700 0 -1700 0 0 -170z"/>
            <path d="M2000 2430 l0 -170 1700 0 1700 0 0 170 0 170 -1700 0 -1700 0 0 -170z"/> */}
                                  </g>
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}
                    </List>
                    <Divider />
                  </Drawer>
                </Box>
              </div>
              <div className="grid lg:grid-cols-12 grid-cols-12 lg:gap-5 px-4 header_client_name">
                {/* Client Name */}
                <div className="lg:col-span-2 col-span-12">
                  <p className="text-white lg:text-start md:text-start text-center font-popins lg:text-2xl md:text-xl sm:text-md">
                    {session?.clientName}
                  </p>
                </div>

                {/* Time */}
                <div className="lg:col-span-4 md:col-span-4 sm:col-span-10 col-span-12 lg:mx-0 md:mx-4 sm:mx-4 mx-4 lg:mt-2 flex items-center">
                  <a className="text-white text-center font-popins text-xl sm:text-md">
                    <BlinkingTime
                      timezone={session?.timezone}
                      dateFormat={session?.dateFormat || "DD MM YYYY"}
                      timeFormat={session?.timeFormat || "hh:mm:ss A"}
                    />
                  </a>
                </div>
                {session?.PortalNotification && (
                  <div className="relative" ref={notificationRef}>
                    <BellButton toggleNotifications={toggleNotifications} />

                    {showNotifications && (
                      <NotificationDropdown
                        notifications={notifications}
                        loading={loading}
                        toggleNotifications={toggleNotifications}
                      />
                    )}
                  </div>
                )}
                <div className="lg:col-span-2  md:col-span-1 sm:col-span-1 col-span-1  popup_mob_screen">
                  <Popover>
                    {/* <PopoverHandler {...triggers}>
                      <img
                        className=" cursor-pointer lg:mt-0 md:mt-3 sm:mt-3 mt-6 w-14 lg:ms-0  lg:w-10 md:w-10 sm:w-10  h-12 rounded-full"
                        src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                        alt="Rounded avatar"
                      />
                    </PopoverHandler> */}
                    <PopoverHandler {...triggers}>
                      {session?.image !== "" && session?.image !== "null" ? (
                        <img
                          className="cursor-pointer lg:mt-0 md:mt-3 sm:mt-3 mt-6 w-14 lg:ms-0 lg:w-10 md:w-10 sm:w-10 h-12 rounded-full"
                          src={session?.image}
                          alt="Rounded avatar"
                        />
                      ) : (
                        <img
                          className="cursor-pointer lg:mt-0 md:mt-3 sm:mt-3 mt-6 w-14 lg:ms-0 lg:w-10 md:w-10 sm:w-10 h-12 rounded-full"
                          src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                          alt="Rounded avatar"
                        />
                      )}
                    </PopoverHandler>

                    <PopoverContent {...triggers} className="!z-[9999]  w-auto">
                      {/* <div className="mb-2 flex items-center gap-3 px-20">
                        <Typography
                          as="a"
                          href="#"
                          variant="h6"
                          color="blue-gray"
                          className="font-medium transition-colors hover:text-gray-900 w-full"
                        >
                          <img
                            className="ms-auto mr-auto mt-5 mb-5 w-10 h-10 rounded-full"
                            src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                            alt="Rounded avatar"
                          />
                        </Typography>
                      </div> */}
                      <div className="grid grid-cols-12">
                        {/* <div className="col-span-2">
                          <img
                            className="mb-5 w-10 lg:h-10 h-10 rounded-full"
                            src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                            alt="Rounded avatar"
                          />
                        </div> */}
                        <div className="col-span-12 ms-2 text-lg font-popins text-start text-black">
                          <p className="text-2xl text-center">
                            {session?.FullName}
                          </p>
                          {session?.Email}
                        </div>
                      </div>
                      <Typography
                        variant="small"
                        color="gray"
                        className="font-normal "
                      >
                        {/* <p className=" mb-3 text-center">{session?.FullName}</p> */}
                        <hr className="text-green w-full"></hr>
                        <p className="text-center pt-2 text-md font-popins font-bold ms-5">
                          {/* login Time: {formatTime(elapsedTime)} */}
                        </p>
                        <div className="flex justify-center">
                          <button
                            className="bg-green shadow-md  hover:shadow-gray transition duration-500 cursor px-5 py-2 rounded-lg text-white mt-5"
                            onClick={async () => {
                              await logout({
                                token: session?.accessToken,
                                fcmtoken: localStorage.getItem("fcmToken"),
                              });
                              signOut();
                            }}
                          >
                            <PowerSettingsNewIcon /> Log Out
                          </button>
                        </div>
                      </Typography>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </nav>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

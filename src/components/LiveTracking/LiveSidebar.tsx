import { VehicleData } from "@/types/vehicle";
import React, { useEffect, useState } from "react";
import { ActiveStatus } from "../General/ActiveStatus";
import { useSession } from "next-auth/react";
import { zonelistType } from "../../types/zoneType";
import {
  getallattributes,
  getalluserview,
  Gettag,
} from "../../utils/API_CALLS";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Select from "react-select";
import "./index.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShareIcon from "@mui/icons-material/Share";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
// import FuelGauge from "./FuelGuage";
import VehicleTooltip from "./VehicleTooltip";
import { createEncodedString } from "@/utils/decodeShareTokens";
// import { decodeShareToken } from "@/utils/decodeShareTokens";
const CountryFlag = ({ country }: any) => {
  const flagMap: any = {
    France: "https://flagpedia.net/data/flags/h80/fr.png",
    Switzerland: "https://flagpedia.net/data/flags/h80/ch.png",
    Pakistan: "https://flagpedia.net/data/flags/h80/pk.png",
    "United Arab Emirates": "https://flagpedia.net/data/flags/h80/ae.png",
    "United Kingdom": "https://flagpedia.net/data/flags/h80/gb.png",
    Canada: "https://flagpedia.net/data/flags/h80/ca.png",
    Australia: "https://flagpedia.net/data/flags/h80/au.png",
  };

  const flagUrl = flagMap[country] || "";

  return (
    <>
      {flagUrl && (
        <img
          src={flagUrl}
          alt="Flag"
          className="h-5 w-8 object-cover" // Adjust size as necessary
        />
      )}
    </>
  );
};
const toSentenceCase = (s: string) => {
  if (!s) return s;
  const lower = s.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const LiveSidebar = ({
  carData,
  countMoving,
  countPause,
  countParked,
  setSelectedVehicle,
  activeColor,
  setIsActiveColor,
  setshowAllVehicles,
  setunselectVehicles,
  setZoom,
  setShowZones,
}: {
  carData: VehicleData[];
  countPause: number;
  countParked: number;
  countMoving: number;
  setSelectedVehicle: (vehicle: VehicleData | null) => void;
  activeColor: string | number;
  setIsActiveColor: (color: any) => void;
  setshowAllVehicles: (show: boolean) => void;
  setunselectVehicles: (unselect: boolean) => void;
  setZoom: (zoom: number) => void;
  setShowZones: (show: boolean) => void;
}) => {
  let { data: session } = useSession();
  const searchParams = useSearchParams();
  const fullparams = searchParams.get("screen");
  // const qparams = searchParams.get("q");
  // const [query, setQuery] = useState(null)
  // useEffect(() => {
  //   setQuery(decodeShareToken(qparams))
  // }, [qparams])
  const allZones = useSelector((state) => state.zone);
  const [searchData, setSearchData] = useState({
    search: "",
  });
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [filteredData, setFilteredData] = useState<any>([]);
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [allattributes, setallattributes] = useState([]);
  const [allfields, setAllfields] = useState([]);
  const [defaultFields, setdefaultFields] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0); // Tracks the active button
  const [activeLabel, setactiveLabel] = useState("All"); // Tracks the active button
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState(1); // default 5 hours
  const [copyMsg, setCopyMsg] = useState("");
  const [shareData, setShareData] = useState();
  const data = [
    {
      label: "All",
      color: "#94a3b8",
      count: countParked + countMoving + countPause,
    },
    { label: "Parked", color: "red", count: countParked },
    { label: "Moving", color: "green", count: countMoving },
    { label: "Pause", color: "#eec40f", count: countPause },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };

  useEffect(() => {
    if (session) {
      setZoneList(allZones?.zone);
    }
  }, [allZones]);
  const getTags = async () => {
    if (!session) return;
    const tagres: any = await Gettag({ token: session!.accessToken as string });
    setBulkTags(tagres.data.map((i: any) => i.tag));
  };
  useEffect(() => {
    (async function () {
      if (session?.defaultView == false) {
        const data = await getalluserview(
          session?.userId,
          session?.accessToken
        );
        setallattributes(data.data);
      }
      const data = await getallattributes(session?.accessToken);

      setAllfields(data.data);
      setdefaultFields(data.data);
    })();
    if (session?.featureVehicleTab) {
      getTags();
    }
  }, []);

  const openShareModal = (e: React.MouseEvent, item: VehicleData) => {
    e.stopPropagation(); // prevent parent click
    setSelectedExpiry(1);
    setCopyMsg("");
    setShareModalOpen(true);
    setShareData(item);
    // you could also store item in state if needed; we will use the item from closure when generating link
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setCopyMsg("");
  };

  // Get trip functionality
  const handleGetTrip = (e: React.MouseEvent, item: VehicleData) => {
    e.stopPropagation(); // prevent parent click
    if (item?.lastignitionOn && item?.timestampNotParsed) {
      const url = `/TrackVehicle?vehicleReg=${item.vehicleReg
        }&q=${createEncodedString(item)}`;
      window.open(
        url,
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );
    } else {
      // Show error message or handle case where trip data is not available
      console.log("Trip data not available for this vehicle");
    }
  };

  // const createEncodedString = (vehicleReg: string, clientId: string, expirationHours: number, clientSetting: any, timezone: string, clientName: string) => {
  //   const payload = {
  //     vehicleReg,
  //     clientId,
  //     expirationHours,
  //     createdAt: new Date(),
  //     clientSetting, timezone, clientName
  //   };

  //   // Create UTF-8 safe base64:
  //   const json = JSON.stringify(payload);
  //   const base64 = btoa(unescape(encodeURIComponent(json))); // safe for unicode
  //   // Optionally make base64 URL-safe (replace +, /, =)
  //   const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  //   // URL-encode the string to be extra safe in query param:
  //   return encodeURIComponent(base64url);
  // };

  const generateShareLink = async () => {
    const vehicleReg = shareData?.vehicleReg ?? "";
    // try to grab clientId from item or session; fallback to 'unknownClient'

    const clientId = shareData?.clientId;

    const encoded = createEncodedString({
      vehicleReg,
      clientId,
      expirationHours: selectedExpiry,
      clientSetting: session?.clientSetting,
      timezone: session?.timezone,
      clientName: session?.clientName,
      createdAt: new Date(),
    });
    let url = `https://vtracksolutions.com/SharePage?q=${encoded}&vehicleReg=${vehicleReg}`;
    // let url = `http://localhost:3010/SharePage?q=${encoded}&vehicleReg=${vehicleReg}`;
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`);
    if (!res.ok) {
      return `https://vtracksolutions.com/SharePage?q=${encoded}&vehicleReg=${vehicleReg}`;
      // return `http://localhost:3010/SharePage?q=${encoded}&vehicleReg=${vehicleReg}`;
    }
    return await res.text(); // returns short URL as plain text
  };

  const copyLinkToClipboard = async () => {
    try {
      const link = await generateShareLink();
      await navigator.clipboard.writeText(link);
      setCopyMsg("Link copied!");
      setTimeout(() => setCopyMsg(""), 2500);
    } catch (err) {
      setCopyMsg("Failed to copy");
      setTimeout(() => setCopyMsg(""), 2500);
    }
  };

  const handleOpenLink = async () => {
    const link = await generateShareLink();
    window.open(link, "_blank", "noopener,noreferrer");
  };

  // if (allZones?.zone?.length <= 0) {
  //   const func = async () => {
  //     const Data = await getZoneListByClientId({
  //       token: session?.accessToken,
  //       clientId: session?.clientId,
  //     });
  //     setZoneList(Data);
  //   };
  //   func();
  // }
  // useEffect(() => {
  //   // (async function () {
  //   //   if (session) {
  //   //     // const allzoneList = await getZoneListByClientId({
  //   //     //   token: session?.accessToken,
  //   //     //   clientId: session?.clientId,
  //   //     // });
  //   //     // setZoneList(allzoneList);
  //   //     await dispatch(
  //   //       fetchZone({
  //   //         token: session?.accessToken,
  //   //         clientId: session?.clientId,
  //   //       })
  //   //     );
  //   //   }
  //   // })();
  // }, [session]);
  function isPointInPolygon(point: any, polygon: any) {
    let intersections = 0;
    for (let i = 0; i < polygon.length; i++) {
      const edge = [polygon[i], polygon[(i + 1) % polygon.length]];
      if (rayIntersectsSegment(point, edge)) {
        intersections++;
      }
    }
    return intersections % 2 === 1;
  }
  function rayIntersectsSegment(point: any, segment: any) {
    const [p1, p2] = segment;
    const p = point;
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const t = ((p[0] - p1[0]) * dy - (p[1] - p1[1]) * dx) / (dx * dy);
    return t >= 0 && t <= 1;
  }
  const toggleLiveCars = () => {

    if (fullparams == null) {
      router.push(`/liveTracking`);
    } else {
      router.push(
        `/liveTracking?screen=${fullparams}`
      );
    }
    setSelectedVehicle(null);
    setshowAllVehicles(true);
    setunselectVehicles(false);
    setIsActiveColor(0);
    setZoom(10);
  };
  function timeAgo(timestamp: any) {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: session?.timezone })
    ).getTime();
    const past = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - past) / 1000); // Difference in seconds

    if (diffInSeconds < 60) {
      // 60 sec
      return "few seconds ago";
    } else if (diffInSeconds < 1800) {
      //1800s = 30 min
      const minutes = Math.floor(diffInSeconds / 60);
      return minutes === 1 ? "a minute ago" : `few minutes ago`;
    } else if (diffInSeconds < 3600) {
      // 3600 sec 1 hour (lies in this block between 30 min to 1 hour)
      return "half an hour ago";
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1 ? "an hour ago" : `few hours ago`;
    } else if (diffInSeconds < 172800) {
      //48 hours ago
      return "yesterday";
    } else if (diffInSeconds < 604800) {
      //7 days ago
      return "a week ago";
    } else if (diffInSeconds < 2592000) {
      //30 days ago
      return "a month ago";
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return months === 1 ? "a month ago" : `few months ago`;
    }
  }
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setDiffernceTimes(moment.tz(session?.timezone));
  //   }, 1000); // Update every second

  //   return () => {
  //     clearInterval(interval); // Clean up interval on component unmount
  //   };
  // }, []);

  // const formattedTimes = filteredData?.map((item: any) => {
  //   const timestampMoment = moment.tz(
  //     item?.lastignitionoff,
  //     "MMMM DD YYYY hh:mm:ss A",
  //     session?.timezone
  //   );
  //   const formattedTime = timestampMoment.format("MMMM DD YYYY hh:mm:ss A");

  //   // Calculate the duration in milliseconds
  //   const durationMiliSecond = differnceTimes.diff(timestampMoment);
  //   const duration = moment.duration(durationMiliSecond);

  //   // Extract duration in days, hours, minutes, and seconds
  //   const days = duration.days();
  //   const hours = duration.hours();
  //   const minutes = duration.minutes();
  //   const seconds = duration.seconds();

  //   return {
  //     formattedTime,
  //     duration: `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`,
  //   };
  // });

  useEffect(() => {
    const zoneLatlog = zoneList?.map((item: any) => {
      if (item.zoneType == "Polygon") {
        return [...JSON.parse(item.latlngCordinates)]?.map((item2: any) => {
          return [item2.lat, item2.lng];
        });
      } else {
        return undefined;
      }
    });
    let filtered = carData;
    if (searchData.search) {
      filtered = filtered
        ?.filter(
          (data) =>
            data.vehicleReg
              .toLowerCase()
              .includes(searchData.search.toLowerCase()) ||
            data?.lastParked
              ?.toLowerCase()
              .includes(searchData.search.toLowerCase()) ||
            data?.driverName
              ?.toLowerCase()
              .includes(searchData.search.toLowerCase())
        )
        .sort((a: any, b: any) => {
          const aReg = a.vehicleReg;
          const bReg = b.vehicleReg;

          // Check if both are numbers
          const aIsNumeric = !isNaN(parseInt(aReg));
          const bIsNumeric = !isNaN(parseInt(bReg));

          if (aIsNumeric && bIsNumeric) {
            return parseInt(aReg) - parseInt(bReg);
          } else {
            return aReg.localeCompare(bReg);
          }
        })
        .map((item: any) => {
          const i = zoneLatlog?.findIndex((zone: any) => {
            if (zone != undefined) {
              return isPointInPolygon(
                [item.gps.latitude, item.gps.longitude],
                zone
              );
            }
          });
          if (i && i != -1) {
            item.zone = zoneList[i]?.zoneName;
          }
          return item;
        });

      setFilteredData(filtered);
    }
    if (selectedTags.length > 0) {
      filtered = filtered?.filter((data) =>
        (data?.tags || [])?.some((i) => selectedTags?.includes(i))
      );
    }
    if (activeLabel == "All") {
      setFilteredData(filtered);
    } else {
      filtered = filtered?.filter(
        (data) => data?.vehicleStatus === activeLabel
      );

      setFilteredData(filtered);
    }
  }, [searchData.search, carData, activeLabel, selectedTags]);
  let router = useRouter();

  const handleClickVehicle = (item: any) => {
    //const filterData = carData.filter(
    //   (items) => items.vehicleId === item.vehicleId
    // );
    if (fullparams == null) {
      router.push(`/liveTracking?vehicleReg=${item.vehicleReg}`);
    } else {
      router.push(
        `/liveTracking?vehicleReg=${item.vehicleReg}&screen=${fullparams}`
      );
    }

    setSelectedVehicle(item);
    setshowAllVehicles(false);
    setIsActiveColor(item.vehicleId);
    setShowZones(false);
  };

  // useEffect(() => {
  //   const setTime = setInterval(() => {
  //     const today = moment().tz(session?.timezone);
  //     setDiffernceTimes(today);
  //   }, 1000);

  //   // // Clear the interval when the component unmounts
  //   return () => clearInterval(setTime);
  // }, []);

  // const duration = moment.duration(filterTime.diff(differnceTime));

  // // Format the duration to show the difference in time
  // const formattedDuration = `${Math.abs(duration.hours())} hours, ${Math.abs(
  //   duration.minutes()
  // )} minutes, ${Math.abs(duration.seconds())} seconds`;

  // const handleodometer = (item: any, e: any) => {

  //   const rect = e.currentTarget.getBoundingClientRect();
  //   if (selectedOdoVehicle?.vehicleReg == item.vehicleReg) {
  //     setPosition({ top: 0, left: 0 });
  //     setSelectedOdoVehicle(null)
  //   }
  //   else {
  //     setSelectedOdoVehicle(item)

  //     // setPosition({ top: e.clientY , left: e.clientX  });
  //     setPosition({ top: rect.top, left: rect.left });

  //   }

  // }
  useEffect(() => { }, [allfields]);
  const [tooltipData, setTooltipData] = useState<{
    // vehicleData: VehicleData | null,
    position: { top: number; left: number };
  }>({
    //  vehicleData: null,
    position: {
      top: window.scrollY,
      left: window.scrollX,
    },
  });
  // const toggleExpand = (index: number, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (expandedIndex !== index) {
  //     let vehicleattributes: any = allattributes?.find((i: any) => {
  //       return i.vehicleId == filteredData[index].vehicleId
  //     })?.attributes;
  //     if (vehicleattributes && vehicleattributes.length > 0) {
  //       setAllfields(vehicleattributes.filter((i) => i.allow))
  //     } else {
  //       setAllfields(defaultFields)
  //     }
  //     const iconRect = e.currentTarget.getBoundingClientRect();
  //     setTooltipData({
  //       position: {
  //         top: iconRect.top + window.scrollY,
  //         left: iconRect.left*1.36
  //       }
  //     });
  //   } else {
  //     setTooltipData({
  //       position: null
  //     });
  //     setAllfields(defaultFields)
  //   }
  //   setExpandedIndex(expandedIndex === index ? null : index);
  // };

  const toggleExpand = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // Calculate viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sidebarWidth = 300; // Adjust based on your sidebar width

    if (expandedIndex !== index) {
      // Get attributes for the vehicle
      const vehicleattributes = allattributes?.find(
        (i: any) => i.vehicleId === filteredData[index].vehicleId
      )?.attributes;

      setAllfields(vehicleattributes?.filter((i) => i.allow) || defaultFields);

      const iconRect = e.currentTarget.getBoundingClientRect();

      let leftPosition = iconRect.right + 10;
      let topPosition = iconRect.top + window.scrollY;

      // Default right placement
      if (leftPosition + 300 > viewportWidth) {
        leftPosition = iconRect.left - 310;
      }

      // Temporary placement (we'll adjust after measuring)
      setTooltipData({
        position: {
          top: topPosition,
          left: Math.max(sidebarWidth + 10, leftPosition),
        },
      });

      // Delay so tooltip DOM exists, then measure height
      requestAnimationFrame(() => {
        const tooltipEl = document.querySelector(
          "#vehicle-tooltip"
        ) as HTMLDivElement;
        if (tooltipEl) {
          const tooltipHeight = tooltipEl.getBoundingClientRect().height;
          if (topPosition + tooltipHeight > viewportHeight + window.scrollY) {
            topPosition = viewportHeight + window.scrollY - tooltipHeight - 10;
          }
          setTooltipData({
            position: {
              top: Math.max(0, topPosition),
              left: Math.max(sidebarWidth + 10, leftPosition),
            },
          });
        }
      });
    } else {
      setTooltipData({ position: null });
      setAllfields(defaultFields);
    }

    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleButtonClick = (index) => {
    setActiveIndex(index);
    const selectedData = data[index];
    setactiveLabel(selectedData.label);
  };

  return (
    <>
      {fullparams == "full" ? (
        <>
          <div className="2xl:col-span-2 xl:col-span-2 lg:col-span-2 md:col-span-2 sm:col-span-2 col-span-5 main_sider_bar2">
            <div className="grid grid-cols-12 bg-white lg:gap-0 gap-3 search_live_tracking2">
              <div className="lg:col-span-7 xl:col-span-6 w-full md:col-span-6 sm:col-span-5 col-span-6 sticky top-0 ">
                <div className="grid grid-cols-12 mt-2 vehicle_search_left">
                  <div className="lg:col-span-1 xl:col-span-1 md:col-span-1 sm:col-span-1">
                    <svg
                      className="h-5 w-5 ms-1 mt-1 text-green"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="lg:col-span-11 md:col-span-11 sm:col-span-10 col-span-11 ms-2 md:ml-4">
                    <input
                      type="text"
                      name="search"
                      className="text-lg bg-transparent text-green w-full px-1 placeholder-green border-b border-black outline-none"
                      placeholder="Search"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="grid text-center  lg:col-span-5 md:col-span-5 sm:col-span-7 col-span-6 w-full show_vehicle_left2">
                <button
                  className="text-center mx-auto text-base md:text-sm w-full font-medium text-green mt-1"
                  onClick={toggleLiveCars}
                >
                  Show ({carData?.length}) Vehicles
                </button>
              </div>
            </div>

            <div className=" border-y-2 border-green py-1  text-white ">
              <div className="grid grid-cols-4 text-center px-2">
                {data.map(({ label, color, count }, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => handleButtonClick(index)} // Set active index on click
                  >
                    <span className="text-black font-bold text-xl group-hover:text-black">
                      {count}
                    </span>
                    <span
                      className="font-medium text-sm"
                      style={{
                        color: color, // Dynamic color
                      }}
                    >
                      {label}
                    </span>

                    <div className="w-full">
                      <div
                        className="w-full group-hover:bg-black"
                        style={{
                          backgroundColor:
                            activeIndex === index ? color : "transparent", // Active color
                          height: activeIndex === index ? "4px" : "2px", // Thicker line for active
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="overflow-y-scroll bg-zoneTabelBg"
              id="scroll_side_bar_cp"
            >
              {filteredData?.map((item: VehicleData, index: any) => {
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor:
                        activeColor == item.vehicleId ? "#e1f0e3" : "",
                      transform: isExpanded ? "translateY(-4px)" : "none",
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                      opacity: expandedIndex !== null && !isExpanded ? 0.7 : 1,
                      //zIndex: isExpanded ? 1 : 0,
                    }}
                    className={`hover:bg-[#e1f0e3] cursor-pointer pt-2 relative ${isExpanded ? "shadow-md" : ""
                      }`}
                  >
                    <div onClick={() => handleClickVehicle(item)}>
                      <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 md:space-x-4 text-center">
                        <div className="xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-6 ">
                          <div className="font-popins font-semibold text-start lg:text-xl text-1xl">
                            <p className="text-black">{item?.vehicleReg}</p>

                            <div className="">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`inline-block px-1 py-1 rounded-md text-sm shadow ${item?.vehicleStatus === "Moving"
                                      ? "bg-green text-white"
                                      : item?.vehicleStatus === "Parked"
                                        ? "bg-red text-white"
                                        : "bg-[#eec40f] text-white"
                                    }`}
                                >
                                  <span>{item?.vehicleStatus || "Unknown"}
                                  </span>
                                </div>

                                {item?.flag ? (
                                  <img
                                    src={item.flag}
                                    alt="Flag"
                                    className="h-5 w-8 object-cover"
                                  />
                                ) : (
                                  <CountryFlag
                                    country={item.OsmElement?.address?.country}
                                  />
                                )}
                                {item?.vehicleStatus !== "Parked" && (
                                  <div className="lg:col-span-3 md:col-span-3 col-span-2 text-sm w-max">
                                    <p className="w-max">
                                      {item.gps.speedWithUnitDesc}
                                    </p>
                                  </div>
                                )}
                                {session?.timezone !== undefined ? (
                                  <ActiveStatus
                                    currentTime={new Date().toLocaleString(
                                      "en-US",
                                      { timeZone: session?.timezone }
                                    )}
                                    targetTime={item.timestampNotParsed}
                                    reg={item.vehicleReg}
                                  />
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                          {/* <div className="font-popins flex items-center space-x-2 text-sm w-max">
                            <p style={{ fontSize: "15px" }}>
                              <strong>Last Data Received:</strong>{" "}
                              {item?.timestamp}
                            </p>
                          </div> */}
                          {item?.vehicleStatus === "Parked" &&
                            item?.lastParked && (
                              <div className="font-popins flex items-center space-x-2 text-sm w-max">
                                <p style={{ fontSize: "15px" }}>
                                  <strong>Last Parked:</strong>{" "}
                                  {item?.lastParked}
                                </p>
                              </div>
                            )}
                        </div>

                        <div className="xl:col-span-6 text-[13px] lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-6 sm:pl-4 lg:pl-8">
                          <div className="flex justify-end  mr-[2px]">
                            {/* {
                              item.dualCam == true && (

                                <div className="pt-1">
                                  <CameraAltIcon
                                  // onClick={() => {
                                  //   handleLastMedia(item.vehicleReg)
                                  // }}
                                  />
                                </div>
                              )
                            } */}
                            <div className="border border-gray p-1 rounded-md  ml-[6px]">
                              {timeAgo(
                                item.timestampNotParsed?.includes("-")
                                  ? item?.timestamp
                                  : item?.timestampNotParsed
                              )}
                            </div>
                          </div>
                          {/* {item.defaultView === false && (
                            <div
                              className="flex justify-end mr-[2px]"
                              onClick={(e) => {

                                toggleExpand(index, e);
                              }}
                            >
                              {isExpanded ? (
                                <ExpandLessIcon
                                  className="cursor-pointer text-[#00B56C] hover:scale-110 transition-transform"
                                  style={{ fontSize: "32px" }}
                                />
                              ) : (
                                <ExpandMoreIcon
                                  className="cursor-pointer text-[#00B56C] hover:scale-110 transition-transform"
                                  style={{ fontSize: "32px" }}
                                />
                              )}
                            </div>
                          )} */}
                        </div>
                      </div>

                      {/* <div className="flex justify-between items-center mt-1 text-labelColor"></div>
                      {item.DriverName && (item?.vehicleStatus === "Moving" || item?.vehicleStatus === "Pause") && (
                        // <p className="text-start">Driver Name: {item.DriverName.replace("undefine", "")}</p>

                        <p style={{ fontSize: "15px" }}>
                        <strong>Driver Name:</strong> {item.DriverName.replace("undefine", "")}
                      </p>
                      )}
                      */}
                    </div>

                    {/* {isExpanded && item.defaultView === false && allfields?.length > 0 && (
                      <VehicleTooltip vehicleData={item}
                        allfields={allfields}
                        position={tooltipData.position}
                        onClose={() => {
                          setExpandedIndex(null);
                          setTooltipData({
                            // vehicleData: null, 
                            position: null
                          });
                        }} />

                    )} */}
                    <div className="border-b-2 border-green w-full text-end py-2"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-2 col-span-5 main_sider_bar">
            <div className="grid grid-cols-12 bg-white lg:gap-0 gap-3 search_live_tracking">
              <div className="lg:col-span-7 w-full md:col-span-5 sm:col-span-5 col-span-6 sticky top-0 search_vehicle_live_tracking">
                <div className="grid grid-cols-12 vehicle_search_left">
                  <div className="lg:col-span-1 md:col-span-1 sm:col-span-1">
                    <svg
                      className="h-5 w-5 ms-1 mt-1 text-green"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="lg:col-span-11 md:col-span-11 sm:col-span-10 col-span-11 ms-2">
                    <input
                      type="text"
                      name="search"
                      className="text-lg bg-transparent text-green w-full px-1 placeholder-green border-b border-black outline-none"
                      placeholder="Search"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex text-center lg:col-span-5 md:col-span-6 sm:col-span-7 col-span-6 w-full show_vehicle_left">
                <button
                  className="text-center mx-auto text-md w-full font-medium text-green mt-1"
                  onClick={toggleLiveCars}
                >
                  Show ({carData?.length}) Vehicles
                </button>
              </div>
            </div>

            <div className="bg-zoneTabelBg border-y-2 border-green text-white vehicle_summary">
              <div className="grid grid-cols-4 text-center px-2">
                {data.map(({ label, color, count }, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => handleButtonClick(index)} // Set active index on click
                  >
                    <span className="text-black font-bold text-2xl transition-transform group-hover:text-black">
                      {count}
                    </span>
                    <span
                      className="font-medium text-sm"
                      style={{
                        color: color, // Dynamic color
                      }}
                    >
                      {label}
                    </span>

                    <div className="w-full">
                      <div
                        className="w-full transition-all group-hover:bg-black"
                        style={{
                          backgroundColor:
                            activeIndex === index ? color : "transparent", // Active color
                          height: activeIndex === index ? "4px" : "2px", // Thicker line for active
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="overflow-y-scroll bg-zoneTabelBg"
              id="scroll_side_bar"
            >
              {session?.featureVehicleTab && (
                <>
                  <Select
                    isMulti
                    value={(selectedTags || []).map((t) => ({
                      value: t,
                      label: toSentenceCase(String(t)),
                    }))}
                    onChange={(opts) => {
                      setSelectedTags(opts.map((o: any) => o.value));
                    }}
                    options={Array.from(new Set(bulkTags)).map((t) => ({
                      value: t.toLowerCase(),
                      label: toSentenceCase(t),
                    }))}
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        border: "#00B56C 2px solid",
                        boxShadow: state.isFocused ? null : null,
                        "&:hover": {
                          border: "#00B56C 2px solid",
                        },
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
                  <div className="border-b-2 border-green w-full text-end py-1"></div>
                </>
              )}

              {filteredData?.map((item: VehicleData, index: any) => {
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor:
                        activeColor == item.vehicleId ? "#e1f0e3" : "",
                      transform: isExpanded ? "translateY(-4px)" : "none",
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                      opacity: expandedIndex !== null && !isExpanded ? 0.7 : 1,
                      //zIndex: isExpanded ? 1 : 0,
                    }}
                    className={`hover:bg-[#e1f0e3] cursor-pointer pt-2 relative ${
                      isExpanded ? "shadow-md" : ""
                    }`}
                  >
                    <div onClick={() => handleClickVehicle(item)}>
                      <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 md:space-x-4 text-center">
                        <div className="xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-6 ">
                          <div className="font-popins font-semibold text-start lg:text-xl text-1xl">
                            {session?.featureVehicleTab?
                            <p className="text-black">{item?.Label1}</p>:
                            <p className="text-black">{item?.vehicleReg}</p>
                            }

                            <div className="">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`inline-block px-1 py-1 rounded-md text-sm shadow ${
                                    item?.vehicleStatus === "Moving"
                                      ? "bg-green text-white"
                                      : item?.vehicleStatus === "Parked"
                                      ? "bg-red text-white"
                                      : "bg-[#eec40f] text-white"
                                  }`}
                                >
                                  <span>
                                    {item?.vehicleStatus || "Unknown"}
                                  </span>
                                </div>

                                {item?.flag ? (
                                  <img
                                    src={item.flag}
                                    alt="Flag"
                                    className="h-5 w-8 object-cover"
                                  />
                                ) : (
                                  <CountryFlag
                                    country={item.OsmElement?.address?.country}
                                  />
                                )}
                                {item?.vehicleStatus !== "Parked" && (
                                  <div className="lg:col-span-3 md:col-span-3 col-span-2 text-sm w-max">
                                    <p className="w-max">
                                      {item.gps.speedWithUnitDesc}
                                    </p>
                                  </div>
                                )}
                                {session?.timezone !== undefined ? (
                                  <ActiveStatus
                                    currentTime={new Date().toLocaleString(
                                      "en-US",
                                      { timeZone: session?.timezone }
                                    )}
                                    targetTime={item.timestampNotParsed}
                                    reg={item.vehicleReg}
                                  />
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                          {item?.vehicleStatus === "Parked" &&
                            item?.lastParked && (
                              <div className="font-popins flex items-center space-x-2 text-sm w-max mt-1">
                                <p style={{ fontSize: "15px" }}>
                                  <strong>Last Parked:</strong>{" "}
                                  {item?.lastParked}
                                </p>
                              </div>
                            )}

                            {item?.vehicleStatus !== "Parked" &&
                            item?.DriverName && (
                              <div className="font-popins flex items-center space-x-2 text-sm w-max mt-1">
                                <p style={{ fontSize: "15px" }}>
                                  <strong>Driver Name:</strong>{" "}
                                  {item?.DriverName}
                                </p>
                              </div>
                            )}
                        </div>

                        <div
                          className={
                            item.dualCam == true
                              ? "xl:col-span-6 text-[13px] lg:col-span-4 md:col-span-4 sm:col-span-6 col-span-4 "
                              : "xl:col-span-6 text-[13px] lg:col-span-4 md:col-span-4 sm:col-span-6 col-span-4 pl-8"
                          }
                        >
                          <div className="flex justify-end items-center w-full">
                            {item.dualCam == true && (
                              <CameraAltIcon
                                cursor="arrow"
                                // className="mr-[-6]"
                              />
                            )}

                            <div className="border border-gray p-1 rounded-md ml-2 w-max whitespace-nowrap">
                              {timeAgo(
                                item.timestampNotParsed?.includes("-")
                                  ? item?.timestamp
                                  : item?.timestampNotParsed
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            {item?.lastignitionOn &&
                              item?.timestampNotParsed &&
                              item.vehicleStatus != "Parked" &&
                              session?.getTrip && (
                                <div className="flex justify-end mr-[2px]">
                                  <button
                                    onClick={(e) => handleGetTrip(e, item)}
                                    className="rounded-md hover:bg-gray-100"
                                    title="Get Trip"
                                    aria-label="Get trip for vehicle"
                                  >
                                    <DirectionsCarIcon className="text-black" />
                                  </button>
                                </div>
                              )}

                            {/* Share Icon */}
                            {session?.featureShareVehicle && (
                              <div className="flex justify-end mr-[2px]">
                                <button
                                  onClick={(e) => openShareModal(e, item)}
                                  className="rounded-md hover:bg-gray-100"
                                  title="Share"
                                  aria-label="Share vehicle"
                                >
                                  <ShareIcon className="text-[#00B56C]" />
                                </button>
                              </div>
                            )}

                            {item.defaultView === false && (
                              <div
                                className="flex justify-end mr-[2px]"
                                onClick={(e) => {
                                  toggleExpand(index, e);
                                }}
                              >
                                {isExpanded ? (
                                  <ExpandLessIcon
                                    className="cursor-pointer text-[#00B56C] hover:scale-110 transition-transform"
                                    style={{ fontSize: "32px" }}
                                  />
                                ) : (
                                  <ExpandMoreIcon
                                    className="cursor-pointer text-[#00B56C] hover:scale-110 transition-transform"
                                    style={{ fontSize: "32px" }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --- SHARE MODAL --- */}
                    {shareModalOpen && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40"
                        onClick={closeShareModal}
                      >
                        <div
                          className="bg-white rounded-lg p-4 w-full max-w-md mx-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h3 className="text-lg font-semibold mb-3">
                            Share Vehicle {shareData?.vehicleReg}
                          </h3>

                          <label className="block text-sm mb-1">
                            Expiration
                          </label>
                          <select
                            value={selectedExpiry}
                            onChange={(e) =>
                              setSelectedExpiry(Number(e.target.value))
                            }
                            className="w-full border rounded px-2 py-2 mb-3"
                          >
                            <option value={1}>1 hour</option>
                            <option value={2}>2 hours</option>
                            <option value={3}>3 hours</option>
                            <option value={4}>4 hours</option>
                            <option value={5}>5 hours</option>
                            <option value={6}>6 hours</option>
                            <option value={8}>8 hours</option>
                            <option value={12}>12 hours</option>
                            <option value={24}>1 day</option>
                          </select>
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              onClick={() => copyLinkToClipboard()}
                              className="px-3 py-2 rounded bg-[#00B56C] text-white"
                            >
                              Copy Link
                            </button>
                            <a
                              onClick={handleOpenLink}
                              // target="_blank"
                              // rel="noopener noreferrer"
                              className="px-3 py-2 rounded border"
                            >
                              Open Link
                            </a>
                            <button
                              onClick={closeShareModal}
                              className="px-3 py-2 rounded border"
                            >
                              Close
                            </button>
                          </div>

                          {copyMsg && (
                            <div className="text-sm text-green-600">
                              {copyMsg}
                            </div>
                          )}

                          {/* <div className="text-xs text-gray-500 mt-2">
                            Link format: <code>https://vtracksoltutions.com/liveTracking?q=&lt;encoded&gt;&amp;screen=full</code>
                          </div> */}
                        </div>
                      </div>
                    )}

                    {isExpanded &&
                      item.defaultView === false &&
                      allfields?.length > 0 && (
                        <VehicleTooltip
                          vehicleData={item}
                          allfields={allfields}
                          position={tooltipData.position}
                          onClose={() => {
                            setExpandedIndex(null);
                            setTooltipData({
                              // vehicleData: null,
                              position: null,
                            });
                          }}
                        />
                      )}
                    <div className="border-b-2 border-green w-full text-end py-1"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default LiveSidebar;
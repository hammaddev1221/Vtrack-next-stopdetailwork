"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import Link from "next/link";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Toaster, toast } from "react-hot-toast";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { Button } from "@mui/material";
import { fetchZone } from "@/lib/slices/zoneSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  getZoneListByClientId,
  zoneDelete,
  zonenamesearch,
} from "@/utils/API_CALLS";
import { zonelistType } from "@/types/zoneType";
import MenuItem from "@mui/material/MenuItem";
import Select from "react-select";
import HexagonIcon from "@mui/icons-material/Hexagon";
import "./zone.css";

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

export default function Zone() {
  
  const { data: session } = useSession();
  const router = useRouter();
  const allZones = useSelector((state) => state.zone);

  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [selectedZoneTypeCircle, setselectedZoneTypeCircle] =
    useState<any>(false);
  const [selectedZoneTypPolyGone, setselectedZoneTypePolyGone] =
    useState<any>(false);
  const [input, setInput] = useState<any>("");
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [filteredZones, setFilteredZones] = useState<zonelistType[]>([]);
  const [selectedZones, setSelectedZones] = useState<zonelistType[]>([]);
  const [liveSearchZoneName, setLiveSearchZoneName] = useState<
    string[] | undefined
  >([]);
  const [searchCriteria, setSearchCriteria] = useState<any>({
    zoneName: "",
    zoneShortName: "",
    GeoFenceType: "",
    zoneType: "",
  });
  const [rowsPerPage, setRowsPerPage] = useState<any>(10);
  const totalPages = Math.ceil(zoneList?.length / rowsPerPage);
  const [filterZonepage, setFilterZonePage] = useState(1);
  const [filterZonePerPage, setfilterZonePerPage] = useState(10);
  const [checkBox, setcheckBox] = useState(false);
  const [filteredDataIsNotAvaialable, setFilteredDataIsNotAvaialable] =
    useState<boolean>(true);
  const [noDataFound, setNoDataFound] = useState(false);
  const [inputPagination, setInputPagination] = useState(false);
  const lastIndexFilter = filterZonePerPage * filterZonepage;
  const firstIndexFilter = lastIndexFilter - filterZonePerPage;
  const handleClickPagination = () => {
    setCurrentPage(input);
    setInputPagination(true);
  };
 
  useEffect(() => {
    setZoneList(allZones?.zone);
  }, [allZones])
 
  const dispatch=useDispatch()
 
  const allZone = async () => {
    if (session && zoneList?.length==0) {
      if (allZones?.zone?.length <= 0 ) {
        const Data = await getZoneListByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setZoneList(Data);
      }
      setZoneList(allZones?.zone);
    }
  };

  useEffect(() => {
    allZone();
  }, [session]);

if (session?.userRole === "Controller") {
    router.push("/signin");
    return null;
  }
 
  // pagination work
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  let displayedData: any;
  displayedData = zoneList?.slice(startIndex, endIndex);
 
  function handleSearchClick(e: any) {
    e.preventDefault();

    const { zoneName, zoneShortName, GeoFenceType, zoneType } = searchCriteria;

    if (zoneName || zoneShortName || GeoFenceType || zoneType) {
      const filteredZone = zoneList.filter((zone) => {
        return (
          (zoneName === "" ||
            (typeof zone.zoneName === "string" &&
              zone.zoneName
                .toLowerCase()
                .includes(zoneName?.value?.toLowerCase()))) &&
          (zoneShortName === "" ||
            (zone?.zoneShortName &&
              zone?.zoneShortName
                ?.toLowerCase()
                .includes(zoneShortName?.value?.toLowerCase()))) &&
          (GeoFenceType === "" ||
            (zone.GeoFenceType !== undefined &&
              zone.GeoFenceType.toLowerCase() ===
                GeoFenceType?.value?.toLowerCase())) &&
          (zoneType === "" ||
            (zone.zoneType !== undefined &&
              zone.zoneType?.toLowerCase() === zoneType.toLowerCase()))
        );
      });
      setFilteredZones(filteredZone);

      if (filteredZone.length >= 0) {
        setFilteredDataIsNotAvaialable(true);
        setFilteredZones(filteredZone);
      } else {
        displayedData = [];
        setFilteredDataIsNotAvaialable(false);
        setFilteredZones([]);
      }

    }
    
    if (filteredZones.length >= 0) {
      setNoDataFound(true);
    }

  }

  const handlePageChangeFiter = (event: any, newPage: any) => {
    setFilterZonePage(newPage);
    setCurrentPage(newPage);
  };

  const handleClickPaginationFilter = (event: any) => {
    setFilterZonePage(input);
  };

  const handleChangeRowsPerPageFilter = (event: any) => {
    setfilterZonePerPage(event.target.value);
    setCurrentPage(event.target.value);
    setFilterZonePage(event.target.value);
  };

  const handlePageChange = (event: any, newPage: any) => {
    setCurrentPage(newPage);
    setFilterZonePage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleClick = () => {
    router.push("/AddZone");
  };

  const handleClickZoneType = (zoneTypecheck: string) => {
    if (zoneTypecheck === "Circle") {
      setselectedZoneTypeCircle(true);
      setselectedZoneTypePolyGone(false);
      setSearchCriteria({
        ...searchCriteria,
        zoneType: "Circle",
      });
    } else if (zoneTypecheck === "Polygon") {
      setselectedZoneTypeCircle(false);
      setselectedZoneTypePolyGone(true);
      setSearchCriteria({
        ...searchCriteria,
        zoneType: "Polygon",
      });
    }
  };

  let optionZoneName: any =
    zoneList?.map((item: any) => ({
      value: item.zoneName,
      label: item.zoneName,
    })) || [];

  const optionZoneSortName =
    zoneList?.map((item: any) => ({
      value: item.zoneShortName,
      label: item.zoneShortName,
    })) || [];

  let GeofenceOption = [
    { value: "On-Site", label: "On-Site" },
    { value: "Off-Site", label: "Off-Site" },
    { value: "City-Area", label: "City-Area" },
    { value: "Restricted-Area", label: "Restricted-Area" },
  ];

  let GeofenceOptionDisable = [
    { value: "On-Site", label: "On-Site" },
    { value: "Off-Site", label: "Off-Site" },
  ];

  const handleClear = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSearchCriteria({
      zoneName: "",
      zoneShortName: "",
      GeoFenceType: "",
      zoneType: "",
    });
    setFilteredDataIsNotAvaialable(true);
    setselectedZoneTypeCircle(false);
    setselectedZoneTypePolyGone(false);
    setSelectedZones([]);
    setInput("");
    setRowsPerPage(10);
    setFilteredZones([]);
    setCurrentPage(1);
    setNoDataFound(false);
  };

  function handleCheckboxChange(zone: zonelistType) {
    const isChecked = selectedZones.some(
      (selectedZone) => selectedZone.id === zone.id
    );

    if (isChecked) {
      setSelectedZones((prevSelectedZones) =>
        prevSelectedZones.filter((selectedZone) => selectedZone.id !== zone.id)
      );
    } else {
      setSelectedZones((prevSelectedZones) => [...prevSelectedZones, zone]);
    }
 
  }

  async function handleLiveSearchChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setSearchCriteria({
      ...searchCriteria,
      zoneName: e.target.value,
    });
    let searchTerm = e.target.value;
    let query = searchTerm.toUpperCase();
    let filter = { zoneName: { $regex: query } };

    if (session) {
      try {
        let filterByZoneName = await zonenamesearch({
          token: session?.accessToken,
          clientId: session?.clientId,
          filter: filter,
        });

        if (Array.isArray(filterByZoneName)) {
          const zoneNames = filterByZoneName.map(
            (zone: { zoneName: string }) => zone.zoneName
          );
          setLiveSearchZoneName(zoneNames);
        } else {
          setLiveSearchZoneName([]);
        }

      } catch (error) {
        console.error("Error fetching live search results:", error);
        setLiveSearchZoneName([]);
      }

    }
  }

  async function deleteSelectedZones(zoneId: any) {
    try {
      // Show a custom confirmation toast with "OK" and "Cancel" buttons
      const { id } = await toast.custom((t) => (
        <div className="bg-white p-2 rounded-md">
          <p>Are you sure you want to delete this zone?</p>
          <button
            onClick={async () => {
              zoneDelete({
                token: session?.accessToken,
                id: zoneId,
              });

              // Dismiss the confirmation toast
              toast.dismiss(id);

              // Show a success toast
              toast.success("Zone deleted successfully!", {
                position: "top-center",
              })
              dispatch(
                fetchZone({
                  clientId: session?.clientId,
                  token: session?.accessToken,
                })
              );
              await allZone();
            }}
            className="text-green pr-5 font-popins font-bold"
          >
            OK
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
            Cancel
          </button>
        </div>
      ));
    } catch (error) {
      // Show an error toast
      toast.error("Failed to delete zone", {
        duration: 3000,
        position: "top-center",
      });

    }
  }

  const handleCheck = () => {
    setcheckBox(!checkBox);
  };

  const handleZoneName = (e: any) => {
    if (!e) {
      return setSearchCriteria((preData: any) => ({
        ...preData,
        zoneName: "",
      }));
    }
    setSearchCriteria({
      ...searchCriteria,
      zoneName: e,
    });
  };

  const handleZoneSortName = (e: any) => {
    if (!e) {
      return setSearchCriteria((PreData: any) => ({
        ...PreData,
        zoneShortName: "",
      }));
    }
    setSearchCriteria({
      ...searchCriteria,
      zoneShortName: e,
    });
  };

  const handleGeoFence = (e: any) => {
    if (!e) {
      return setSearchCriteria((preData: any) => ({
        ...preData,
        GeoFenceType: "",
      }));
    }
    setSearchCriteria({
      ...searchCriteria,
      GeoFenceType: e,
    });
  };

  return (
    <div className=" bg-bgLight border-t border-bgLight " id="zone_main">
      <p className="bg-green px-4 py-1  text-center text-2xl text-white font-bold zone_heading">
        Zones
      </p>
      <form className=" lg:w-full w-screen bg-bgLight lg:-ms-0 -ms-1 zone_form">
        <div className="grid lg:grid-cols-2 md:grid-cols-2  gap-6 pt-5 px-5  ">
          <div className="lg:col-span-1">
            <label className="text-md font-popins text-black font-semibold">
              Zone Name
            </label>
            <Select
              value={searchCriteria.zoneName}
              onChange={handleZoneName}
              options={optionZoneName}
              placeholder="Zone Name"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="   rounded-md w-full  outline-green border border-grayLight  hover:border-green"
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
          <div className="lg:col-span-1 md:col-span-1 col-span-1">
            <label className="text-md font-popins text-black font-semibold">
              Zone Short Name
            </label>
            <Select
              onChange={handleZoneSortName}
              value={searchCriteria.zoneShortName}
              options={optionZoneSortName}
              placeholder="Zone Sort Name"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="   rounded-md w-full  outline-green border border-grayLight  hover:border-green"
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
        <div className="grid lg:grid-cols-2 md:grid-cols-2 mb-3   gap-6 pt-5 px-5 bg-green-50 ">
          <div className="lg:col-span-1">
            <label className="text-md font-popins text-black font-semibold">
              Geofence
            </label>
            <Select
              value={searchCriteria.GeoFenceType}
              onChange={handleGeoFence}
              options={
                session?.clickToCall === true
                  ? GeofenceOption
                  : GeofenceOptionDisable
              }
              placeholder="GeoFence"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="rounded-md w-full  outline-green border border-grayLight  hover:border-green"
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

          <div
            id="zoneType"
            className="lg:col-span-1 md:col-span-1 col-span-1  text-black "
          >
            <label className="text-md font-popins text-black font-semibold">
              Zone Type
            </label>
            <br></br>
            <span
              id="Circle"
              className={`inline-flex items-center mt-2 border rounded-md border-grayLight px-2 h-8 text-md font-popins text-black  cursor-pointer shadow-md hover:shadow-gray transition duration-500 font-semibold  ${
                selectedZoneTypeCircle && "bg-green text-white "
              } transition duration-300`}
              onClick={() => handleClickZoneType("Circle")}
              // title="Click to select Circle"
            >
              <RadioButtonUncheckedIcon
                className="mr-2"
                // style={{ color: "black !important" }}
              />{" "}
              Circle
            </span>

            <span
              id="Polygon"
              className={`inline-flex items-center mt-2 border rounded-md border-grayLight px-2 h-8 text-md font-popins text-black font-semibold cursor-pointer shadow-md hover:shadow-gray transition duration-500  mx-5  ${
                selectedZoneTypPolyGone && "bg-green text-white"
              } transition duration-300`}
              onClick={() => handleClickZoneType("Polygon")}
              // title="Click to select Polygon"
            >
              <HexagonIcon className="mr-2" /> Polygon
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2  md:grid-cols-2  sm:grid-cols-2 grid-cols-2 px-5 lg:mt-0 mt-5 search_zone_btn_grid_main  ">
          <div className="lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-2 search_zone_btn">
            <div className="grid xl:grid-cols-7 lg:gap-2 md:gap-2 sm:gap-2 -mt-2 lg:grid-cols-4 gap-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-2  search_zone_btn_grid">
              <Button
                className=" text-white font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none "
                variant="outlined"
                style={{
                  fontSize: "16px",
                  backgroundColor: "#00b56c",
                  color: "white",
                  border: "none",
                }}
                startIcon={
                  <span style={{ fontWeight: "600" }}>
                    <SearchIcon />
                  </span>
                }
                onClick={(e: any) =>
                  (searchCriteria.zoneName ||
                    searchCriteria.zoneType ||
                    searchCriteria.zoneShortName ||
                    searchCriteria.GeoFenceType) &&
                  handleSearchClick(e)
                }
              >
                <b> s</b>{" "}
                <span style={{ textTransform: "lowercase" }}>
                  <b>earch</b>
                </span>
              </Button>
              <Button
                className=" bg-white text-black font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-white border-none hover:border-none lg:w-auto md:w-auto sm:w-auto w-auto"
                variant="outlined"
                onClick={handleClear}
                style={{
                  fontSize: "16px",
                  backgroundColor: "white",
                  color: "black",
                  border: "none",
                }}
                startIcon={
                  <span style={{ fontWeight: "600" }}>
                    <HighlightOffIcon />
                  </span>
                }
              >
                <b> C</b>{" "}
                <span style={{ textTransform: "lowercase" }}>
                  <b>lear</b>
                </span>
              </Button>
            </div>
          </div>

          <div className="flex lg:justify-end md:justify-end sm:justify-end">
            <Link href="/AddZone">
              <div className="lg:rounded-md md:rounded-md sm:rounded-md rounded-sm  grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-3 grid-cols-4 bg-green mb-8 lg:-mt-2 md:-mt-1 sm:-mt-1 mt-1 w-full  shadow-md  hover:shadow-gray transition duration-500 ">
                <div className="lg:col-span-1 -ms-1  md:col-span-1 sm:col-span-1 col-span-2 add_zone_buttons">
                  <svg
                    className="h-11 py-3 w-full text-white"
                    width="24"
                    viewBox="0 0 24 24"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                    <line x1="12" y1="9" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="lg:col-span-2 md:col-span-2 sm:col-span-2 col-span-2   pt-1 flex lg:justify-center md:justify-center sm:justify-center justify-start -ms-1 lg:pe-0 md:pe-0 sm:pe-0 pe-1 add_zone_button_text">
                  <button
                    className="text-white  font-popins font-bold lg:-ms-2 md:-ms-2 h-10 bg-[#00B56C] px-2 text-md  sm:-ms-2 -ms-2  "
                  >
                    Add zone
                  </button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </form>

      <TableContainer component={Paper} className="table_scroll">
        <div className="table_zone">
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead className="sticky top-0 bg-green text-white font-medium">
              <TableRow className="bg-green text-white font-medium   ">
                <TableCell
                  align="left"
                  className="border-r border-green font-popins font-medium "
                  style={{ fontSize: "20px", color: "white" }}
                >
                  Zone Name
                </TableCell>
                <TableCell
                  align="left"
                  className="border-r border-green  font-popins font-medium "
                  style={{ fontSize: "20px", color: "white" }}
                >
                  Zone Sort Name
                </TableCell>
                <TableCell
                  align="left"
                  className="border-r border-green  font-popins font-medium "
                  style={{ fontSize: "20px", color: "white" }}
                >
                  Zone Type
                </TableCell>
                <TableCell
                  align="left"
                  className="border-r border-green font-popins font-medium "
                  style={{
                    fontSize: "20px",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredZones.length > 0 ? (
                <>
                  {" "}
                  {filteredZones.map((item: zonelistType, index) => (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-[#e2f6f0]"
                    >
                      
                      <TableCell
                        align="left"
                        className="border-r   font-popins text-black font-normal"
                        style={{
                          fontSize: "16px",
                          border: "1px solid #00b56c",
                        }}
                      >
                        {item.zoneName}
                      </TableCell>
                      <TableCell
                        align="left"
                        className="border-r   font-popins text-black font-normal"
                        style={{
                          fontSize: "16px",
                          border: "1px solid #00b56c",
                        }}
                      >
                        {item.zoneShortName}
                      </TableCell>
                      <TableCell
                        align="left"
                        className="border-r   font-popins text-black font-normal"
                        style={{
                          fontSize: "16px",
                          border: "1px solid #00b56c",
                        }}
                      >
                        {item.zoneType}
                      </TableCell>
                      <TableCell
                        align="center" 
                        className="border-r 
                         font-popins text-black font-normal"
                        style={{
                          border: "1px solid #00b56c",
                        }}
                      >
                        <Link href={`/EditZone?id=${item.id}`}>
                          <BorderColorIcon
                            style={{ marginTop: "-2%" }}
                            className="text-white bg-green  p-1 h-7 w-8  rounded-md shadow-md hover:shadow-gray transition duration-500 "
                          />
                        </Link>
                        <button
                          className="icon_delete_edit"
                          onClick={() => deleteSelectedZones(item.id)}
                        >
                          <DeleteIcon
                            className="text-white bg-red p-1 h-7 w-8 rounded-md shadow-md hover:shadow-gray transition duration-500 "
                            style={{ marginTop: "-18%", marginLeft: "20%" }}
                          />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filteredDataIsNotAvaialable === false ||
                noDataFound == true ? (
                <>
                  <h2
                    style={{
                      height: "45vh",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                    className="font-popins text-3xl"
                  >
                    No Data Found
                  </h2>
                </>
              ) : (
                <>
                  {displayedData? .length > 0 ? (
                    <>
                      {" "}
                      {displayedData.map((item: any, index) => (
                        <TableRow
                          key={index}
                          className="cursor-pointer hover:bg-[#e2f6f0]"
                        >
                          <TableCell
                            align="left"
                            className="border-r   font-popins text-black font-normal"
                            style={{
                              fontSize: "16px",
                              border: "1px solid #00b56c",
                            }}
                          >
                            {item.zoneName}
                          </TableCell>
                          <TableCell
                            align="left"
                            className="border-r  font-popins text-black font-normal"
                            style={{
                              fontSize: "16px",
                              border: "1px solid #00b56c",
                            }}
                          >
                            {item.zoneShortName}
                          </TableCell>
                          <TableCell
                            align="left"
                            className="border-r   font-popins text-black font-normal"
                            style={{
                              fontSize: "16px",
                              border: "1px solid #00b56c",
                            }}
                          >
                            {item.zoneType}
                          </TableCell>
                          <TableCell
                            align="center" // Set align to center
                            className="border-r font-popins text-black font-normal"
                            style={{
                              border: "1px solid #00b56c",
                            }}
                          >
                            <Link href={`/EditZone?id=${item.id}`}>
                              <BorderColorIcon
                                style={{ marginTop: "-2%" }}
                                className="text-white bg-green  p-1 h-7 w-8  rounded-md shadow-md hover:shadow-gray transition duration-500 "
                              />
                            </Link>
                            <button
                              // style={{ marginLeft: "73%" }}
                              className="icon_delete_edit"
                              onClick={() => deleteSelectedZones(item.id)}
                            >
                              <DeleteIcon className="text-white bg-red p-1 h-7 w-8 rounded-md shadow-md hover:shadow-gray transition duration-500 delete_zone_button" />
                            </button>

                            {/* <BorderColorIcon
                    onClick={deleteSelectedZones}
                
                  /> */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <h2
                      style={{
                        height: "40vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                      className="font-popins text-3xl"
                    >
                      No Data Found
                    </h2>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </TableContainer>

      <div className="table_pagination">
        {filteredZones?.length > 0 ? (
          <div className="flex  justify-end lg:w-full w-screen bg-bgLight">
            <div className="grid lg:grid-cols-4 grid-cols-4   ">
              <div className="lg:col-span-1 col-span-1">
                <p className="mt-1 text-black font-medium font-popins text-end">
                  Total {filteredZones?.length} items
                </p>
              </div>

              <div className="lg:col-span-2 md:col-span-2 m:col-span-2 col-span-12 table_pagination">
                <Stack spacing={2}>
                  <Pagination
                    // count={totalPagesFilter}
                    page={filterZonepage}
                    onChange={handlePageChangeFiter}
                    sx={{ color: "green" }}
                  />
                </Stack>
              </div>
              <div className="lg:col-lg-1 col-lg-1  mt-1 lg:inline-block md:inline-block hidden">
                <span className="lg:inline-block md:inline-block hidden">
                  Go To
                </span>
                <input
                  type="text"
                  className="lg:w-10 w-5  border border-grayLight outline-green mx-2 px-2"
                  value={input}
                  onChange={(e: any) => setInput(e.target.value)}
                />
                <span
                  className="text-labelColor cursor-pointer "
                  onClick={handleClickPaginationFilter}
                >
                  page &nbsp;&nbsp;
                </span>
              </div>
            </div>
            <div className="-mt-3">
              <TablePagination
                component="div"
                rowsPerPageOptions={[10, 20, 30, 40, 50, 100]}
                count={filteredZones?.length} // or zoneList.length depending on the context
                rowsPerPage={filterZonePerPage} // or rowsPerPage depending on the context
                page={filterZonepage} // or currentPage depending on the context
                onRowsPerPageChange={handleChangeRowsPerPageFilter} // or handleChangeRowsPerPage depending on the context
                onPageChange={handlePageChangeFiter} // or handlePageChange depending on the context
              />
            </div>
          </div>
        ) : (
          <div className="flex  justify-end lg:w-full w-screen bg-bgLight -mt-1">
            <div className="grid lg:grid-cols-4 grid-cols-4   ">
              <div className="lg:col-span-1 col-span-1">
                <p className=" text-labelColor text-end">
                  Total {zoneList?.length} items
                </p>
              </div>

              <div className="lg:col-span-2 col-span-2 ">
                <Pagination
                  count={totalPages}
                  // page={
                  //   inputPagination ? parseInt(input) : parseInt(currentPage)
                  // }
                  onChange={handlePageChange}
                />
              </div>
              <div className="lg:col-lg-1 col-lg-1   ">
                <span className="lg:inline-block hidden">Go To</span>
                <input
                  type="text"
                  value={input}
                  className="lg:w-10 w-5  border border-grayLight outline-green mx-2 px-2"
                  onChange={(e: any) => {
                    const value = e.target.value.match(/\d+/g);
                    if (value > 0 && value <= totalPages) {
                      setInput(e.target.value);
                    } else {
                      setInputPagination(false);
                      setInput("");
                    }
                  }}
                />
                <span
                  className="text-labelColor cursor-pointer "
                  onClick={input && handleClickPagination}
                >
                  page &nbsp;&nbsp;
                </span>
              </div>
            </div>
            <div className="-mt-3">
              <TablePagination
                component="div"
                rowsPerPageOptions={[10, 20, 30, 40, 50, 100]}
                count={zoneList?.length}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
        )}
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

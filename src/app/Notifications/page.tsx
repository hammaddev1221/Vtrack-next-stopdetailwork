"use client";
import Loading from "../loading";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import {
  updateEventPermissionByClientId,
  getEventPermissionByClientId,
  clientbyClientid,
  clientsave,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { button } from "@material-tailwind/react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import "./newstyle.css";
import { Toaster, toast } from "react-hot-toast";
import { fabClasses } from "@mui/material";
export default function Notifications() {
  const { data: session } = useSession();
  const [eventsp, setEventsp] = useState({
    ignitionOn: false,
    ignitionOff: true,
    targetEnteredZone: false,
    targetLeftZone: false,
    overSpeeding: false,
    towing: false,
    harshCornering: false,
    harshBreak: false,
    harshAcceleration: false,
  });

  const [notifications, setNotifications] = useState({
    IgnitionOnPushNotification: false,
    IgnitionOnSMS: false,
    IgnitionOnEmail: false,
    IgnitionOnPortal: false,
    IgnitionOffPushNotification: false,
    IgnitionOffSMS: false,
    IgnitionOffEmail: false,
    IgnitionOffPortal: false,
    HarshBreakPushNotification: false,
    HarshBreakSMS: false,
    HarshBreakEmail: false,
    HarshBreakPortal: false,
    HarshCorneringPushNotification: false,
    HarshCorneringSMS: false,
    HarshCorneringEmail: false,
    HarshCorneringPortal: false,
    HarshAccelerationPushNotification: false,
    HarshAccelerationSMS: false,
    HarshAccelerationmail: false,
    HarshAccelerationPortal: false,
    GeofenceNotification: false,
    GeofenceSMS: false,
    GeofenceEmail: false,
    GeofencePortal: false,    
    OverSpeedNotification: false,
    OverSpeedSMS: false,
    OverSpeedEmail: false,
    OverSpeedPortal: false
  });

  useEffect(() => {
    const eventsbyclientId = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const data = await getEventPermissionByClientId({
            token: session?.accessToken,
            clientId: session?.clientId,
          });

          setEventsp(data);
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    eventsbyclientId();
  }, []);

  useEffect(() => {
    const eventsbyclientId = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const response = await clientbyClientid({
            token: session?.accessToken,
            clientId: session?.clientId,
          });
          const {
            IgnitionOnPushNotification,
            IgnitionOnSMS,
            IgnitionOnEmail,
            IgnitionOnPortal,
            IgnitionOffPushNotification,
            IgnitionOffSMS,
            IgnitionOffEmail,
            IgnitionOffPortal,
            HarshBreakPushNotification,
            HarshBreakSMS,
            HarshBreakEmail,
            HarshBreakPortal,
            HarshCorneringPushNotification,
            HarshCorneringSMS,
            HarshCorneringEmail,
            HarshCorneringPortal,
            HarshAccelerationPushNotification,
            HarshAccelerationSMS,
            HarshAccelerationmail,
            HarshAccelerationPortal,
            GeofenceNotification,
            GeofenceSMS,
            GeofenceEmail,
            GeofencePortal,
            OverSpeedNotification,
            OverSpeedSMS,
            OverSpeedEmail,
            OverSpeedPortal,
          } = response;

          const notifications = {
            IgnitionOnPushNotification,
            IgnitionOnSMS,
            IgnitionOnEmail,
            IgnitionOnPortal,
            IgnitionOffPushNotification,
            IgnitionOffSMS,
            IgnitionOffEmail,
            IgnitionOffPortal,
            HarshBreakPushNotification,
            HarshBreakSMS,
            HarshBreakEmail,
            HarshBreakPortal,
            HarshCorneringPushNotification,
            HarshCorneringSMS,
            HarshCorneringEmail,
            HarshCorneringPortal,
            HarshAccelerationPushNotification,
            HarshAccelerationSMS,
            HarshAccelerationmail,
            HarshAccelerationPortal,
            GeofenceNotification,
            GeofenceSMS,
            GeofenceEmail,
            GeofencePortal,
            OverSpeedNotification,
            OverSpeedSMS,
            OverSpeedEmail,
            OverSpeedPortal,
          };

          setNotifications(notifications);
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    eventsbyclientId();
  }, [session]);

  const handleUpdatePermissions = async (e: any) => {
    e.preventDefault();
    try {
      if (session) {
        // Call updateEventsPermission function
        const response1 = await updateEventPermissionByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
          payload: eventsp,
        });

        // Call updateNotifications function
        const response2 = await clientsave({
          token: session?.accessToken,
          clientId: session?.clientId,
          payload: notifications,
        });
        toast("save Data Successfully");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };
  const handleEventsPermissionChange = async (e: any) => {
    const { name, checked } = e.target;

    if (name === "geofence") {
      setEventsp((prevState) => ({
        ...prevState,
        [name]: checked,
        targetEnteredZone: checked,
        targetLeftZone: checked,
      }));
    } else {
      setEventsp((prevState) => ({
        ...prevState,
        [name]: checked,
      }));
    }

    setNotifications((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  return (
    <div>
      <p className="bg-green px-4 py-1 border-t-2  text-center text-2xl text-white font-bold zone_heading">
        Events And Notification
      </p>
      <TableContainer component={Paper} className="mt-2 cursor-pointer">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow className="bg-green text-white ">
              <TableCell align="center">
                <p
                  className="text-lg text-white my-3 font-popins font-bold"
                  style={{ fontSize: "22px" }}
                >
                  {" "}
                  Event Pemission
                </p>
              </TableCell>
              <TableCell align="center">
                <p className="text-lg text-white"></p>
              </TableCell>
              <TableCell align="center">
                <p
                  className="text-lg text-white font-popins font-bold"
                  style={{ fontSize: "22px" }}
                  id="custom_width_notification_permission"
                >
                  {" "}
                  Notification Pemission
                </p>
              </TableCell>
            {
              session?.PortalNotification&&
              (<TableCell align="center">
                <p className="text-lg text-white"> </p>
              </TableCell>)
            }
              <TableCell align="center">
                <p className="text-lg text-white"> </p>
              </TableCell>

              {/* <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
            </TableRow>
          </TableHead>
          <TableHead>
            <TableRow className="bg-white text-green ">
              <TableCell id="border_all"></TableCell>
              <TableCell align="center" id="border_bottom">
                <p
                  className="text-lg text-green my-4 font-popins font-bold"
                  id="custom_width"
                >
                  {" "}
                  Push Notification
                </p>
              </TableCell>
              <TableCell align="center" id="border_bottom">
                <p className="text-lg text-green font-popins font-bold">SMS</p>
              </TableCell>
              <TableCell align="right" id="border_bottom">
                <p className="text-lg text-green mr-12 font-popins font-bold">
                  Email
                </p>
              </TableCell>
              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                <p className="text-lg text-green mr-12 font-popins font-bold">
                  Portal
                </p>
              </TableCell>
                )
              }
              {/* <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* first */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-[#e2f6f0]"
            >
              <TableCell component="th" scope="row" id="border_all">
                <b
                  className="flex items-center mx-6  text-lg"
                  id="custom_width"
                >
                  {" "}
                  <input
                    type="checkbox"
                    name="ignitionOn"
                    checked={eventsp.ignitionOn}
                    onChange={handleEventsPermissionChange}
                    style={{ accentColor: "green" }}
                    className="w-4 h-5 text-green-600 bg-gray-100 border-gray-300 rounded dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 my-5 "
                  />
                  &nbsp; Ignition On
                </b>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="IgnitionOnPushNotification"
                  checked={notifications.IgnitionOnPushNotification}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.ignitionOn}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="IgnitionOnSMS"
                  checked={notifications.IgnitionOnSMS}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.ignitionOn}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />{" "}
              </TableCell>

              <TableCell align="right" id="border_bottom">
                <input
                  type="checkbox"
                  name="IgnitionOnEmail"
                  checked={notifications.IgnitionOnEmail}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.ignitionOn}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                />{" "}
              </TableCell>
              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                  <input
                    type="checkbox"
                    name="IgnitionOnPortal"
                    checked={notifications.IgnitionOnPortal}
                    onChange={handleEventsPermissionChange}
                    disabled={!eventsp.ignitionOn}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                  />{" "}
                </TableCell>
                )}

            </TableRow>

            {/* second */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-[#e2f6f0]"
            >
              <TableCell component="th" scope="row" id="border_all">
                <b className="flex items-center mx-6 text-lg" id="custom_width">
                  {" "}
                  <input
                    type="checkbox"
                    name="ignitionOff"
                    checked={eventsp.ignitionOff}
                    onChange={handleEventsPermissionChange}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 my-5"
                  />
                  &nbsp; Ignition Off
                </b>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="IgnitionOffPushNotification"
                  checked={notifications.IgnitionOffPushNotification}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.ignitionOff}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="IgnitionOffSMS"
                  checked={notifications.IgnitionOffSMS}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.ignitionOff}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4 "
                />
              </TableCell>

              <TableCell align="right" id="border_bottom">
                <input
                  type="checkbox"
                  name="IgnitionOffEmail"
                  checked={notifications.IgnitionOffEmail}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.ignitionOff}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                />
              </TableCell>
              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                  <input
                    type="checkbox"
                    name="IgnitionOffPortal"
                    checked={notifications.IgnitionOffPortal}
                    onChange={handleEventsPermissionChange}
                    disabled={!eventsp.ignitionOff}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                  />{" "}
                </TableCell>
                )}
            </TableRow>

            {/* Thired */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-[#e2f6f0]"
            >
              <TableCell component="th" scope="row" id="border_all">
                <b className="flex items-center mx-6 text-lg" id="custom_width">
                  {" "}
                  <input
                    type="checkbox"
                    name="geofence"
                    checked={
                      eventsp.targetEnteredZone && eventsp.targetLeftZone
                    }
                    onChange={handleEventsPermissionChange}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 my-5"
                  />
                  &nbsp; Geofence
                </b>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="GeofenceNotification"
                  checked={notifications.GeofenceNotification}
                  onChange={handleEventsPermissionChange}
                  style={{ accentColor: "green" }}
                  disabled={
                    !eventsp.targetEnteredZone && !eventsp.targetLeftZone
                  }
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="GeofenceSMS"
                  checked={notifications.GeofenceSMS}
                  style={{ accentColor: "green" }}
                  onChange={handleEventsPermissionChange}
                  disabled={
                    !eventsp.targetEnteredZone && !eventsp.targetLeftZone
                  }
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>

              <TableCell align="right" id="border_bottom">
                <input
                  type="checkbox"
                  name="GeofenceEmail"
                  checked={notifications.GeofenceEmail}
                  onChange={handleEventsPermissionChange}
                  style={{ accentColor: "green" }}
                  disabled={
                    !eventsp.targetEnteredZone && !eventsp.targetLeftZone
                  }
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                />
              </TableCell>

              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                  <input
                    type="checkbox"
                    name="GeofencePortal"
                    checked={notifications.GeofencePortal}
                    onChange={handleEventsPermissionChange}
                    disabled={  !eventsp.targetEnteredZone && !eventsp.targetLeftZone}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                  />{" "}
                </TableCell>
                )}
            </TableRow>

            {/* Fourth */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-[#e2f6f0]"
            >
              <TableCell component="th" scope="row" id="border_all">
                <b className="flex items-center mx-6 text-lg" id="custom_width">
                  {" "}
                  <input
                    type="checkbox"
                    name="overSpeeding"
                    checked={eventsp.overSpeeding}
                    onChange={handleEventsPermissionChange}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 my-5"
                  />
                  &nbsp; Over Speed
                </b>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="OverSpeedNotification"
                  checked={notifications.OverSpeedNotification}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.overSpeeding}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="OverSpeedSMS"
                  checked={notifications.OverSpeedSMS}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.overSpeeding}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />{" "}
              </TableCell>

              <TableCell align="right" id="border_bottom">
                <input
                  type="checkbox"
                  name="OverSpeedEmail"
                  checked={notifications.OverSpeedEmail}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.overSpeeding}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                />
              </TableCell>
              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                  <input
                    type="checkbox"
                    name="OverSpeedPortal"
                    checked={notifications.OverSpeedPortal}
                    onChange={handleEventsPermissionChange}
                    disabled={!eventsp.overSpeeding}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                  />{" "}
                </TableCell>
                )}
            </TableRow>

            {/* Five */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-[#e2f6f0]"
            >
              <TableCell component="th" scope="row" id="border_all">
                <b className="flex items-center mx-6 text-lg" id="custom_width">
                  {" "}
                  <input
                    type="checkbox"
                    name="harshBreak"
                    checked={eventsp.harshBreak}
                    onChange={handleEventsPermissionChange}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 my-5"
                  />
                  &nbsp; Hasrh Break
                </b>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="HarshBreakPushNotification"
                  checked={notifications.HarshBreakPushNotification}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshBreak}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="HarshBreakSMS"
                  checked={notifications.HarshBreakSMS}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshBreak}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4 "
                />{" "}
              </TableCell>

              <TableCell align="right" id="border_bottom">
                <input
                  type="checkbox"
                  name="HarshBreakEmail"
                  checked={notifications.HarshBreakEmail}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshBreak}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                />{" "}
              </TableCell>
              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                  <input
                    type="checkbox"
                    name="HarshBreakPortal"
                    checked={notifications.HarshBreakPortal}
                    onChange={handleEventsPermissionChange}
                    disabled={!eventsp.harshBreak}

                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                  />{" "}
                </TableCell>
                )}
            </TableRow>

            {/* six */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-[#e2f6f0]"
            >
              <TableCell component="th" scope="row" id="border_all">
                <b className="flex items-center mx-6 text-lg" id="custom_width">
                  {" "}
                  <input
                    type="checkbox"
                    name="harshCornering"
                    checked={eventsp.harshCornering}
                    onChange={handleEventsPermissionChange}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 my-5"
                  />
                  &nbsp; Hasrh Cornering
                </b>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="HarshCorneringPushNotification"
                  checked={notifications.HarshCorneringPushNotification}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshCornering}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="HarshCorneringSMS"
                  checked={notifications.HarshCorneringSMS}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshCornering}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />{" "}
              </TableCell>

              <TableCell align="right" id="border_bottom">
                <input
                  type="checkbox"
                  name="HarshCorneringEmail"
                  checked={notifications.HarshCorneringEmail}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshCornering}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                />{" "}
              </TableCell>
              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                  <input
                    type="checkbox"
                    name="HarshCorneringPortal"
                    checked={notifications.HarshCorneringPortal}
                    onChange={handleEventsPermissionChange}
                    disabled={!eventsp.harshCornering}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                  />{" "}
                </TableCell>
                )}
            </TableRow>

            {/* Seven */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-[#e2f6f0]"
            >
              <TableCell component="th" scope="row" id="border_all">
                <b className="flex items-center mx-6 text-lg" id="custom_width">
                  {" "}
                  <input
                    type="checkbox"
                    name="harshAcceleration"
                    checked={eventsp.harshAcceleration}
                    onChange={handleEventsPermissionChange}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 my-5"
                  />
                  &nbsp; Hasrh Acceleration
                </b>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="HarshAccelerationPushNotification"
                  checked={notifications.HarshAccelerationPushNotification}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshAcceleration}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                id="border_bottom"
              >
                <input
                  type="checkbox"
                  name="HarshAccelerationSMS"
                  checked={notifications.HarshAccelerationSMS}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshAcceleration}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
                />
              </TableCell>

              <TableCell align="right" id="border_bottom">
                <input
                  type="checkbox"
                  name="HarshAccelerationmail"
                  checked={notifications.HarshAccelerationmail}
                  onChange={handleEventsPermissionChange}
                  disabled={!eventsp.harshAcceleration}
                  style={{ accentColor: "green" }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600  mr-16"
                />
              </TableCell>

              {
                session?.PortalNotification&&(
                  <TableCell align="right" id="border_bottom">
                  <input
                    type="checkbox"
                    name="HarshAccelerationPortal"
                    checked={notifications.HarshAccelerationPortal}
                    onChange={handleEventsPermissionChange}
                    disabled={!eventsp.harshAcceleration}
                    style={{ accentColor: "green" }}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 mr-16"
                  />{" "}
                </TableCell>
                )}
            </TableRow>
          </TableBody>
        </Table>
        <div className="flex justify-end my-3 mx-2">
          <button
            style={{
              color: "white",
              display: "flex",
              alignItems: "center",
              font: "bold",
              fontSize: "16px",
              backgroundColor: "#00B56C",
              border: "none",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            className={`  text-white font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none px-4 `}
            onClick={handleUpdatePermissions}
          >
            <svg
              className="h-10 py-3 w-full text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span className="pl-2"> Save</span>
          </button>
        </div>
      </TableContainer>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

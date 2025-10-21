"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useMap, useMapEvents } from "react-leaflet"; // Moved to dynamic import
import { VehicleData } from "@/types/vehicle";
import L, { LatLng } from "leaflet"; // Moved to dynamic import
import { ClientSettings } from "@/types/clientSettings";
import stopbike from "../../../public/Stop_Bike.svg"
import movebike from "../../../public/Move_Bike.svg"
import pausebike from "../../../public/Pause_Bike.svg"
import stopcar from "../../../public/Stop_Car.svg"
import movecar from "../../../public/Move_Car.svg"
import pauscar from "../../../public/Pause_Car.svg"
import stopboat from "../../../public/Stop_Boat.svg"
import pauseboat from "../../../public/Pause_Boat.svg"
import movingboat from "../../../public/Move_Boat.svg"
// import idlebike from "../../../public/bike_icon_grey.svg"
import { FuelPumpDieselFill } from "react-bootstrap-icons";
import ReactDOMServer from 'react-dom/server';
const moment = require("moment-timezone");

// Dynamic imports for Leaflet components to fix SSR issues
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });
// const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), { ssr: false });
// const useMapEvents = dynamic(() => import("react-leaflet").then((mod) => mod.useMapEvents), { ssr: false });
const LiveCars = ({
  carData,
  clientSettings,
  selectedVehicle,
  // mapCoordinates,
  setSelectedVehicle,
  showAllVehicles,
  setunselectVehicles,
  unselectVehicles
}: {
  carData: VehicleData[];
  clientSettings: ClientSettings[];
  selectedVehicle: VehicleData | null;
  // mapCoordinates: any;
  setSelectedVehicle: any;
  showAllVehicles: any;
  setunselectVehicles: any;
  unselectVehicles: any;
  // center: any;
  // zoom: any;
}) => {
  const map = useMap();
  const selectedVehicleCurrentData = useRef<VehicleData | null>(null); // Initialize with null
  const [bikestop, setbikestop] = useState("")
  const [bikemove, setbikemove] = useState("")
  const [bikepause, setbikepause] = useState("")
  const [boatstop, setboatstop] = useState("")
  const [boatpause, setboatpause] = useState("")
  const [boatmove, setboatmove] = useState("")

  const [carstop, setcarstop] = useState("")
  const [carpause, setcarpause] = useState("")
  const [carmove, setcarmove] = useState("")


  const [clickPosition, setClickPosition] = useState<VehicleData | null>(null);
  // const [polylinePosition, setPolylinePosition] = useState<ClickPosition | null>(null);

  // const [trackvehicle, setTrackVehicle] = useState<VehicleData | null>(null);

  // const [bikeidle, setbikeidle] = useState("")
  const clientMapSettings = clientSettings.find(
    (el) => el?.PropertDesc === "Map"
  )?.PropertyValue;

  const clientZoomSettings = clientSettings.find(
    (el) => el?.PropertDesc === "Zoom"
  )?.PropertyValue;
  async function loadSVG(filepath: string) {
    const response = await fetch(filepath);
    return await response.text();
  }

  useEffect(() => {
    async function setdata() {
      setbikestop(await loadSVG(stopbike.src))
      setbikemove(await loadSVG(movebike.src))
      setbikepause(await loadSVG(pausebike.src))
      setboatstop(await loadSVG(stopboat.src))
      setboatpause(await loadSVG(pauseboat.src))
      setboatmove(await loadSVG(movingboat.src))
      setcarstop(await loadSVG(stopcar.src))
      setcarpause(await loadSVG(pauscar.src))
      setcarmove(await loadSVG(movecar.src))

      // setbikeidle(await loadSVG(idlebike.src))
    }
    setdata()


  }, [])
  useEffect(() => {

    if (!map) return;

    if (selectedVehicle) {
      selectedVehicleCurrentData.current =
        carData?.find((el) =>
          (el.DriverName != "" && el?.DriverName?.replaceAll(" ", "") === selectedVehicle?.DriverName?.replaceAll(" ", "")) ||
          (el.IMEI != undefined && el.IMEI === selectedVehicle?.IMEI) ||
          (el.vehicleReg != "" && el?.vehicleReg?.replaceAll(" ", "") === selectedVehicle?.DriverName?.replaceAll(" ", "")) ||
          el.vehicleReg === selectedVehicle?.vehicleReg
        ) || null; // Assign null if selectedVehicle is not found       
      if (selectedVehicleCurrentData.current) {
        map.flyTo(
          [
            selectedVehicleCurrentData.current.gps.latitude,
            selectedVehicleCurrentData.current.gps.longitude,
          ],
          18
        );
      }
    } else if (selectedVehicle == null && showAllVehicles === true) {
      if (!carData || carData?.length === 0) return;
      else if (carData?.length === 1) {
        const regex = /lat:([^,]+),lng:([^}]+)/;
        if (clientMapSettings) {
          const match = clientMapSettings.match(regex);

          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            map.flyTo([lat, lng], Number(clientZoomSettings));
          }
        }
      } else {
        const positions: LatLng[] = carData?.map((data) =>
          L.latLng(data.gps.latitude, data.gps.longitude)
        );

        const bounds = L.latLngBounds(positions);
        var zoom;
        var center: LatLng | undefined;
        if (bounds.isValid()) {
          center = bounds.getCenter();

          const lats = carData?.map((data) => data.gps.latitude);
          const lngs = carData?.map((data) => data.gps.longitude);

          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);

          const latDistance = maxLat - minLat;
          const lngDistance = maxLng - minLng;

          const latZoom = Math.floor(Math.log2(360 / (0.5 * latDistance)));
          const lngZoom = Math.floor(Math.log2(360 / (0.5 * lngDistance)));

          zoom = Math.min(latZoom, lngZoom);
        } else {
          center = L.latLng(0, 0);
          zoom = 11;
        }

        setSelectedVehicle(false);
        map.flyTo(center, zoom);
      }
    }

    if (clickPosition) {
      const data = carData?.find((el) => el.IMEI === clickPosition?.IMEI || el.vehicleReg === clickPosition?.vehicleReg) || null;
      if (data && (data.gps.latitude !== clickPosition.gps.latitude || data.gps.longitude !== clickPosition.gps.longitude)) {
        setClickPosition(data);
      }
    }    
  }, [carData, selectedVehicle, map]);

  const icon = (
    speed: number,
    ignition: number,
    angle: number,
    vehicleType: string,
    fuelLevel: boolean,
    // divColor: string
  ) => {
    let imageSrc = "", iconSize: [number, number] = [30, 50];
    if (vehicleType === 'Bike1') {
      iconSize = [40, 60]
      if (speed === 0 && ignition === 0) {
        // imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Stop_Bike.png"
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikestop)}`
      } else if (speed == 0 && ignition === 1) {
        // imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Pause_Bike.png"
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikepause)}`
      } else if (speed > 0) {
        // imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Move_bike.png"
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikemove)}`
      }
    }
    else
      if (vehicleType === 'Boat') {
        if (speed === 0 && ignition === 0) {
          imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Stop_Boat.png"

          // imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(boatstop)}`
        } else if (speed == 0 && ignition === 1) {
          imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Pause_Boat.png"

          // imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(boatpause)}`
        } else if (speed > 0) {
          imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Move_Boat.png"
          // imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(boatmove)}`
        }
      } else {
        if (speed === 0 && ignition === 0) {
          imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carstop)}`
          // imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Stop_Car.png"
          // imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0Q2RUUyNjg4OEJFMTFFQzhBN0FGRTBGRTk5QUVBOTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0Q2RUUyNjY4OEJFMTFFQzhBN0FGRTBGRTk5QUVBOTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDRDZFRTI2Njg4QkUxMUVDOEE3QUZFMEZFOTlBRUE5MSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDRDZFRTI2Nzg4QkUxMUVDOEE3QUZFMEZFOTlBRUE5MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PheOhwkAAAZ8SURBVHjalFZJjB1H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";
        }
        else if (speed == 0 && ignition === 1) {
          imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carpause)}`
          // imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Pause_Car.png"
          // imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkVBOTQ4QTM4OEJFMTFFQzgyRUZGNzQzODhBMzI1QkEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkVBOTQ4QTQ4OEJFMTFFQzgyRUZGNzQzODhBMzI1QkEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRUE5NDhBMTg4QkUxMUVDOEIyRUZGNzQzODhBMzI1QkEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QkVBOTQ4QTQ4OEJFMTFFQzgyRUZGNzQzODhBMzI1QkEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5eOhwkAAAZ8SURBVHjalFbbi11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";
        } else if (speed > 0) {
          imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carmove)}`
          // imageSrc = "https://dev.vtracksolutions.com/ImgSrc/Move_Car.png"
          // imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODI5QjMwQjE4OEJDMTFFQ0ExN0FGNjIyNUJDRTkyOTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODI5QjMwQjI4OEJDMTFFQ0ExN0FGNjIyNUJDRTkyOTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MjlCMzBBRjg4QkMxMUVDQTE3QUY2MjI1QkNFOTI5MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4MjlCMzBCMDg4QkMxMUVDQTE3QUY2MjI1QkNFOTI5MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhMMRDwAAAaQSURBVHjalFbbi11XHf7WZV/OPufMnJnM1UnHBjIWG4S0ldZADaEFoTZCWxFEiL4UobQPPvrko6++Kv4BItFCsVDBy4sWA4n2EhuLlySTGadzn3Pb973W6m+tvWeY1FIni1lzmNm//a3f5fu+dRg+ZYWQ8J9YXJ5+7cK3wunOC6ZQF8Ag6FHJPP7n0f749cHPrl/VNza3kiq77132SbDLzz535vEXL736q+C9i3mPPyK5CGHgNbGGfpeV1mk0xK2Xho/+4Y+/fPPnf7r29r3D98VxsO99+8qzL/3o5atvdG49vy+SJQkeNDHsWAKCMxYWER4aL8mL33/hyuVogBvv37q5fh/g4mNnv/z1H3739Z+uvXV6Pd9FwDx81uKGYSPdx7sH/zn11QtPP/ePd27+drzT36kBPY7uN7/4k5vB5pMl4YS+D1MpMM7rnI7vZplSwfd8pFWOv2592M3SVCcfbL4l7UN/prMYLE+d5wQgQkIsNVDR9iSMok9tjgpmwh7C6udSQ9LhTBL4w71n+IQfOkD4YoELsSAC6YKNUjCmfg95BZPro+xYx6eDmB2PO4z5nDotIaPgNCU07wC9z010KLADSR2wSJQR84R7CRTMPHOseTUYJVFnSfgssKBeRLsn6xjW5h7VIm0pNjUK8OkR/c1b0r2PI0xTA4E37dB27jaOy4VOJJuoAJITDnMns7aEGucoP0pg0hImq8DoIGaftTxwKltOt8B7rXp4NgdP2A57h4DM9kFTqcnfN5D/bRNsbQwvMeCjkpouKC/jukG5oGhzZFMEujKN4PwC2PJE3QKKcYCm0oltbvK728CbdzHbasPz2y5jM6GhqDSlFYSk8qnEeDBGvt7H6Npd4KrE9CtPwTt3SlO2iZS90As+31sWHwwwhQitxUV62VCbKtcj2yJNNXGvZkCW5sjLAqWpkKkCRT9G971tRFHE5VT0kFy6fP5Vf7a7wtdjRUQWikhuksJRxjSzsJlajmZZhjy3u3DARVk6UYRtkvvqUHdOzzwlRu+vX0uG8V776YevUL88HlOTR5QdtwwyjkZWMRW9TGpwoO4zT91z0Qkwf2EFxZQY/fcX11+WlgDVME1JSrmudMt0PGpsbUl2SHa6JZWYjmOkFsiBpkRVXat2pgNPeEhRxZRt0kyZpUabRPXTXkGEHg8HSENSS893NNGKQ2UhcTNCRH31DlKUOzGyrT7C+S5ERgwI1ZjaNJYNVxNid6zjAgdnQujn5xF+YYa4FpEKSCkU6Tja8JoVNKwh8fTDXbIrItK2gkrykU6KosnQJNpDovcShF87jfDROeikdCZx2McjgyBRG6ug2Qj+8hnI22NgdRuFX+3qpFIOkCWqoF7llmsYFdAZqYNM4dOXqX8o1hCdWFy5Qz1PplJIO0uga4Kgh1aopKm1+SCrtMRXmJucnu11JgIHWKqqyk1VWsOUEMeM4LOX46o1CEIZZkkeZ6lygCNZFf2wKloRDcGYk+I1zq1RQmNYxGl6CChCwWUoar8vNE6cIsVbnlppWpU5K3T/NtYSOWfWnQvVWPWJ8MDobqmTqC88eXgQ0YKZx2fA5luNgZ5g2ezmWuSC5KX9Pe5k39g655ni5btbKAZJfdudpH8UxlONaDWnTOletSbi7Lok763kVLk2Qnn3gJI/YckEILYzmI0Yk+3u7ESnO1EPRVPSmvnMMkabB+OhlSShSOkFUgjpADNf9TNZHlDlkC3/AaZcW5wQAv3BYHMwHvXdUDRDpZgpSTrkR76T7kmnbL9BGLIy0obVh+bHae/5dKNVJ5cea4idkulS6aqZkwNThnNlvY+Ri5y4Yiv9WR8lJzvjpjgCVKO8rHbjks1H4Cu9xvT+/zCsT+qzkzBToSV3eqQUPcxKtR8X5sk5sh5y6QF5oZ1XKJpNJmu3veTbvrtHGFGr2ophutT3J2aswobHlMKUDuWgOjcJeWeM4I01qIUQap52W5AgXEmo0gLVIEOxN0b2rx3kawdY+MFFtB9bgn7nzqYtrLkCSEJZ8W8qHOFGBrmaAOsxVJEjS2KM4xgx7bTM/qe9o9t78FdmkK/27933DbaI83uLk61Ls3E1Fwd024zG2NvZxV5/H8MxKUh/wsF7AabPzuFLpyYx/Ghwffsvd39s4nLAlpaWGuM1WJZi8plo4htLs5Nf+f2lxXN3et4c/+c+K4eZb6hkXSpjWqL0z86U37kx2FhYT+6tD4Zv/7oc/Wa7UgeChvSxAAMAmAtONzleBFsAAAAASUVORK5CYII=";
        }
      }
    const baseIcon = new L.DivIcon({
      className: "custom-icon",
      iconSize,
      // iconAnchor: [24, 48],   // point in icon which maps to marker's latlng (bottom-center)
      // popupAnchor: [0, -30],  // where popup appears relative to iconAnchor
      html: `
      <div class="custom-icon" style="transform: rotate(${angle || 0}deg);">
        <img src="${imageSrc}" alt="Car Marker">
      </div>
    `,
    });
    const warningIcon = L.divIcon({
      html: `      
           <div class="custom-icon" style="transform: rotate(${angle || 0}deg);">           
        <img src="${imageSrc}" alt="Car Marker"/>
         
              ${ReactDOMServer.renderToString(<FuelPumpDieselFill className="fuel-indicator" />)}    
                <div class="fuel-warning-tooltip">LOW FUEL!</div>          
      </div>`,
      className: "custom-icon warning-icon",
      iconSize
    });
    return fuelLevel ? warningIcon : baseIcon;
  };

  // const pos: string[] = carData?.map((datas) => datas?.vehicleReg);

  if (!clientMapSettings) {
    return <>Map Loading...</>;
  }

  const positions: [number, number][] = carData?.map((data) => [
    data.gps.latitude,
    data.gps.longitude,
  ]);

  const handleMoveEnd = (event: any) => {
    if (unselectVehicles === true) {
      setSelectedVehicle(null);
    }
  };

  const handleClick = (event: any) => {
    if (selectedVehicle && setunselectVehicles != null) {
      setunselectVehicles(true);
    }
    if (unselectVehicles === true) {
      setSelectedVehicle(null);
    }
  };
  const handleZoomEnd = (event: any) => {
    if (unselectVehicles === true) {
      setSelectedVehicle(null);
    }
  };

  function MapEventsHandler() {
    useMapEvents({
      moveend: handleMoveEnd,
      zoomend: handleZoomEnd,
      click: handleClick,
    });
    return null;
  }

  return (
    <>
      <MapEventsHandler />
      {positions.map((position, index) => (
        <Marker
          key={carData[index]?.IMEI}
          position={position}
          icon={icon(
            carData[index]?.gps.speed || 0,
            carData[index]?.ignition || 0,
            carData[index]?.gps.Angle || 0,
            carData[index]?.vehicleType || "",
            carData[index].fuel < carData[index].fuelLowLevel,

          )}
          eventHandlers={{
            click: () => {
              // let clickedPoint = carData?.find((i) =>
              //   // i.gps?.latitude == position[0] &&
              //   // i.gps?.longitude == position[1]
              //   i.IMEI==carData[index]?.IMEI
              // );

              setClickPosition(carData[index]);
              // if (clickedPoint) {
              // }

            }
          }}
        >

          <Tooltip direction="bottom" offset={carData[index]?.vehicleType == "Car" ? [10, 20] : [0, 40]} opacity={1} permanent>
            <div className="font-bold flex">
              {carData[index].vehicleReg}
            </div>
          </Tooltip>

          {clickPosition?.IMEI === carData[index]?.IMEI && (
            <Popup
              // position={[clickPosition?.gps?.latitude, clickPosition?.gps?.longitude]}
              eventHandlers={{ remove: () => setClickPosition(null) }}>
              <div>
                <strong>Status:</strong> {clickPosition?.vehicleStatus}<br />
                <strong>Speed:</strong> {clickPosition?.gps?.speedWithUnitDesc}<br />
                {clickPosition?.fuel && (
                  <>
                    <strong>Fuel Level:</strong> {clickPosition?.fuel} %
                    <br />
                  </>

                )}
                <strong>Coordinates:</strong> {clickPosition?.gps?.latitude?.toFixed(6)}, {clickPosition?.gps?.longitude?.toFixed(6)}<br />

                {
                  clickPosition?.DriverName && (
                    <>
                      <strong>Driver Name:</strong> {clickPosition?.DriverName}<br />
                    </>
                  )
                }
              </div>
            </Popup>
          )}

        </Marker >
      ))}


    </>
  );
};

export default LiveCars;

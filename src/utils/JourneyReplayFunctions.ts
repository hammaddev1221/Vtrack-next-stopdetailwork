import { TravelHistoryData } from "@/types/TripsByBucket";
// import { useSession } from "next-auth/react";
// import { TripAddress } from "./API_CALLS";
// import { useMap } from "react-leaflet";
import L from "leaflet";

/* const { data: session } = useSession(); */

// export const Tripaddressresponse = async (
//   lat: number,
//   lng: number,
//   session: string
// ) => {
//   try {
//     if (session) {
//       const Dataresponse = await TripAddress({
//         token: session,
//         lat: lat,
//         lng: lng,
//       });
//       return Dataresponse.data;
//       //  setTripAddressData(Dataresponse.data);
//     }
//   } catch (error) {
//     console.error("Error fetching zone data:", error);
//   }
// };

export function calculateZoomCenter(data: TravelHistoryData[]) {
  const formattedCoordinates = data.map((coord) => ({
    lat: coord.lat,
    lng: coord.lng,
  }));

  const lats = formattedCoordinates.map((coord) => coord.lat);
  const lngs = formattedCoordinates.map((coord) => coord.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
 


  const latZoom = Math.floor(Math.log2(180 / (maxLat - minLat)));
  const lngZoom = Math.floor(Math.log2(360 / (maxLng - minLng)));
  let zoomlevel = Math.min(latZoom, lngZoom) + 1;
  
  if (zoomlevel > 18) {
    zoomlevel = 18;
  } 
  else if (zoomlevel >= 7 && zoomlevel <= 17) {
    zoomlevel = zoomlevel + 1;
  }
    /* else if (zoomlevel == 15) {
      zoomlevel = 16;
    } 
    else if (zoomlevel == 14) {
      zoomlevel = 15;
    } 
    else if (zoomlevel == 13) {
      zoomlevel = 14;
    } 
    else if (zoomlevel == 10 && ad > 51.2) {
      zoomlevel = 11;
    } 
    else if (zoomlevel == 9) {
      zoomlevel = 10.5;
    }
    else if (zoomlevel == 8) {
      zoomlevel = 9.5;
    } */
  else {
    zoomlevel
  }
 
  return { zoomlevel, centerLat, centerLng };
}


  

export function createMarkerIcon(angle: number | null, img: string, iconSize:[number,number]): L.DivIcon {
  // if (img == "") {
  //   imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODI5QjMwQjE4OEJDMTFFQ0ExN0FGNjIyNUJDRTkyOTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODI5QjMwQjI4OEJDMTFFQ0ExN0FGNjIyNUJDRTkyOTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MjlCMzBBRjg4QkMxMUVDQTE3QUY2MjI1QkNFOTI5MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4MjlCMzBCMDg4QkMxMUVDQTE3QUY2MjI1QkNFOTI5MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhMMRDwAAAaQSURBVHjalFbbi11X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"
  // } else {
  // }
  const imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(img)}`
  const iconHtml = `
    <div class="custom-icon" style="transform: rotate(${angle || 0}deg);">
       <img src="${imageSrc}" alt="Car Marker">      
    </div>
  `;
  return new L.DivIcon({
    className: "custom-icon",
    iconSize,// Adjust the size if needed
    html: iconHtml,
  });
}
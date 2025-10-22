import { IgnitionReport, replayreport } from "@/types/IgnitionReport";
import { Events, Notifications } from "@/types/events";
import { commandrequest } from "@/types/commandrequest";
import { zonelistType } from "@/types/zoneType";
import axios from "axios";
import { immobiliserequest } from "@/types/immobiliserequest";
// import uniqueDataByIMEIAndLatestTimestamp from "./uniqueDataByIMEIAndLatestTimestamp";
  //var URL = "http://localhost:3001"
var URL ="https://backend.vtracksolutions.com";
export async function getVehicleDataByClientId(clientId: string) {
  try {
    const response = await fetch(
      `https://socketio.vtracksolutions.com:1102/${clientId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {

    return [];
  }
}
export async function getVehicleDataByClientIdByVehicleReg(clientId: string, vehicleReg: string) {
  try {
    const response = await fetch(
      `https://socketio.vtracksolutions.com:1102/data?user=${clientId}&vehicleReg=${vehicleReg}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function getCamDataByClientIdByVehicleReg(vehicleReg: string) {
  try {
    const response = await fetch(
      `https://camera.vtracksolutions.com:7057/camera/${vehicleReg}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
// export async function getVehicleDataByClientIdForOdometer(clientId: string) {
//   try {
//     const response = await fetch(
//       `https://socketio.vtracksolutions.com:1102/${clientId}`,
//       {
//         method: "GET",
//       }
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     //  data?.data?.Value
//     let parsedData = JSON.parse(
//       data?.data?.Value
//     )?.cacheList;
//     // call a filter function here to filter by IMEI and latest time stamp
//     let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);
//     return uniqueData;
//   } catch (error) {

//     return [];
//   }
// }

export async function getalluserview(userId: string, token: string) {
  try {
    const response = await fetch(
      `${URL}/userview?userId=${userId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        method: "GET", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function getallattributes(token: string) {
  try {
    const response = await fetch(
      `${URL}/attributes`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        method: "GET", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// export async function getClientSettingByClinetIdAndToken({
//   token,
//   clientId,
// }: {
//   token: string;
//   clientId: string;
// }) {
//   try {
//     const response = await fetch(`${URL}/SettingByClientId`, {
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: `{\"ClientId\":\"${clientId}\"}`,
//       method: "POST",
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }
export async function getNotificationsData({
  token,
  payload,
}: {
  token: string;
  payload: any;
}) {
  try {
    const response = await fetch(`${URL}/notifications`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

// export async function getNotificationsDataByUserId({
//   token,
//   payload,
// }: {
//   token: string;
//   payload: any;
// }) {
//   try {

//     const response = await fetch(`${URL}/notifications`, {
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(payload),
//       method: "POST",
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestParams {
  token: string;
  method: ApiMethod;
  body?: Record<string, any>; // Optional for methods like GET
}
export async function handleServiceStatus({ token,
  method,
  body }: ApiRequestParams) {
  try {
    // Set up the request headers
    const headers = {
      accept: "application/json, text/plain, */*",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };
    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: JSON.stringify(body)
    };
    const response = await fetch(`${URL}/servicestatus`, fetchOptions);
    // Handle non-2xx status codes
    if (!response.ok) {
      throw new Error(`Failed to fetch data from the API. Status: ${response.status}`);
    }
    // Parse JSON response body
    const data = await response.json();
    // For GET requests, we return the data (example: 'data' field is the key you want to extract)
    if (method === 'GET') {
      return data.data;
    }
    // For POST, PUT, DELETE, return the response data
    return data;
  } catch (error) {
    console.error('Error occurred while fetching service history:', error);
    return null; // Or you can return an empty array if preferred
  }
}

export async function addServiceHistory(payload: any, token: string) {
  try {

    const response = await fetch(
      `${URL}/servicehistory`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: payload,
        method: "POST", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function renewServiceHistory(payload: any, token: string) {
  try {

    const response = await fetch(
      `${URL}/servicehistory`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: payload,
        method: "PUT", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function handleServiceHistoryRequest({
  token,
  method,
  body,
}: ApiRequestParams) {
  try {
    // Set up the request headers

    const headers = {
      accept: "application/json, text/plain, */*",
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };
    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };
    // Add body only for methods that need it (POST, PUT, DELETE)
    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }
    if (method === 'DELETE') {
      fetchOptions.body = JSON.stringify({ id: body });
    }
    // Handle GET method separately, no body is required
    if (method === 'GET') {
      // For GET requests, we just send the token as part of the headers.
      delete fetchOptions.body;
    }
    // Perform the request
    const response = await fetch(`${URL}/serviceHistory`, fetchOptions);
    // Handle non-2xx status codes
    if (!response.ok) {
      throw new Error(`Failed to fetch data from the API. Status: ${response.status}`);
    }
    // Parse JSON response body
    const data = await response.json();
    // For GET requests, we return the data (example: 'data' field is the key you want to extract)
    if (method === 'GET') {
      return data.data;
    }
    // For POST, PUT, DELETE, return the response data
    return data;
  } catch (error) {
    console.error('Error occurred while fetching service history:', error);
    return null; // Or you can return an empty array if preferred
  }
}


export async function handleServicesRequest({
  token,
  method,
  payload,
}: {
  token: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  payload?: any; // Payload is optional for methods like GET and DELETE
}) {
  try {
    const headers = {
      accept: "application/json, text/plain, */*",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };

    // If the method is GET or DELETE, we don't need a body
    const options: RequestInit = {
      method,
      headers,
    };

    // Include body only if there's a payload (POST or PUT)
    if (payload && (method === "POST" || method === "PUT" || method === "DELETE")) {
      options.body = JSON.stringify(payload);
    }
    const response = await fetch(`${URL}/service`, options);


    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    // If the method is GET, we expect a response body
    if (method === "GET") {
      const data = await response.json();
      return data;
    }

    // For POST, PUT, DELETE, we might not get a response body
    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    return null; // Return null or handle error accordingly
  }
}

export async function addDocument(payload: any, token: string) {
  try {

    const response = await fetch(
      `${URL}/document`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: payload,
        method: "POST", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}
export async function getDocuments(token: string) {
  try {
    const response = await fetch(
      `${URL}/document`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        method: "GET", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}
export async function editDocuments(payload: any, token: string) {
  try {
    const response = await fetch(
      `${URL}/document`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        method: "PUT", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
} export async function deleteDocuments(id: string, token: string) {
  try {
    const response = await fetch(
      `${URL}/document`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
        method: "DELETE", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}
////////////////////
export async function getevents(clientId: string, token: string) {
  try {
    const response = await fetch(
      `${URL}/geteventsbyclientId?clientId=${clientId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        method: "GET", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}
export async function Addtag(  token: string,
  payload: any){
 try {
    const response = await fetch(`${URL}/tag`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }

}



export async function Gettag({ token,
  }: {
  token: string
  
}){
 try {
    const response = await fetch(`${URL}/tag`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },      
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }

}
export async function updatevehicle({token,payload}: {
  token: string;
  payload: any;
}){
   try {
    const response = await fetch(`${URL}/vehicle`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function vehicleListByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/vehicleListByClientId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
export async function getallNotifications({
  token,
  body
}: {
  token: string;
  body: any;
}) {
  try {
    const response = await fetch(`${URL}/getallnotifications`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body,
      //  `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}
export function expireForgotLink(payload: any) {
  const ressult = axios
    .post(`${URL}/forgotpassword/UpdateLink`, payload)
    .then((response: any) => response?.data)
    .catch((error) => {

    });
  return ressult;
}

// here
export async function portalGprsCommand({
  token,
  payload,
}: {
  token: string;
  payload: commandrequest;
}) {
  try {
    const response = await fetch(`${URL}/portal/GprsCommand`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function ImmobiliseRequest({
  token,
  payload,
}: {
  token: string;
  payload: immobiliserequest;
}) {
  try {
    const response = await fetch(`${URL}/immobiliserequest`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}


export async function Verifyimmobiliserequest({
  token,
  payload,
}: {
  token: string;
  payload: immobiliserequest;
}) {
  try {
    const response = await fetch(`${URL}/verifyimmobiliserequest`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}


export async function getAllVehicleByUserId({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  try {
    const response = await fetch(`${URL}/getAllVehicleByUserId`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"userId\":\"${userId}\"}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// here events permission
export async function updateEventPermissionByClientId({
  token,
  clientId,
  payload,
}: {
  token: string;
  clientId: string;
  payload: Events;
}) {
  try {
    const payloadWithClientId = { clientId, ...payload }; // Construct payload object
    const response = await fetch(`${URL}/updateEventPermissionByClientId`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payloadWithClientId), // Stringify payload with clientId
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// here get client
export async function clientbyClientid({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/GetClientById`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {

    return [];
  }
}

// here save client
export async function clientsave({
  token,
  clientId,
  payload,
}: {
  token: string;
  clientId: string;
  payload: Notifications;
}) {
  try {
    const payloadWithClientId = { id: clientId, ...payload }; // Construct payload object
    const response = await fetch(`${URL}/clients`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      // add here client id in this form]
      body: JSON.stringify(payloadWithClientId), // Stringify payload with clientId
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function getEventPermissionByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(
      `${URL}/getEventPermissionByClientId?clientId=${clientId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        method: "GET", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function vehiclebyClientid({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/getDualCamVehicleByclientId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {

    return [];
  }
}
export async function vehiclebyClientidbyimmobilising({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/getimmobilisingVehicleByclientId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {

    return [];
  }
}
export async function alleventsForNotification({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(
      `${URL}/Report/allevents`,
      {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}


export async function IgnitionReportByTrip({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(
      `${URL}/Report/IgnitionReport`,
      {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function IgnitionReportByDailyactivity({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/IgnitionReportAddressWise`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
export async function IgnitionReportByIgnition({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/IgnitionNewReport`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
export async function IgnitionReportByEvents({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/ReportByEvents`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
export async function IgnitionReportByDetailReport({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/ReportByStreet`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}


export async function IgnitionReportByco2emission({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/co2emission`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {

    return [];
  }
}
export async function FuelReport({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/fuel`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    
    return data;
  } catch (error) {

    return [];
  }
}
export async function tripByZone({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/ReportByZone`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    
    return data;
  } catch (error) {

    return [];
  }
}

export async function ZoneToZone({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/ReportZoneToZone`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    
    return data;
  } catch (error) {

    return [];
  }
}

export async function IgnitionReportByIdlingActivity({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/MTSDailyIdling`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
export async function GprsCommandbyCliendId({
  token, clientId
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/GprsCommandbyCliendId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }

}
export async function videoList({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/videolist`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
export async function lastmediaurl({
  token,
  clientId,
  vehicleReg
}: {
  token: string;
  clientId: string;
  vehicleReg: string;
}) {
  try {
    const response = await fetch(`${URL}/lastmediaurl`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ clientId, vehicleReg }),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function getZoneListByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/zonelist`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function forgetEmailByClientId({
  token,
  newformdata,
}: {
  token: any;
  newformdata: any;
}) {
  try {
    const response = await fetch(`${URL}/forgotpassword/forgotpassword`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function forgetPasswordClientId({
  token,
  newformdata,
}: {
  token: any;
  newformdata: any;
}) {
  try {
    const response = await fetch(`${URL}/forgotpassword/Passwordreset`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

// export async function forgetPasswordByClientId({
//   token,
//   newformdata,
// }: {
//   token: any;
//   newformdata: zonelistType;
//   link: any;
// }) {
//   try {
//     const response = await fetch(`${URL}/forgotpassword/GetByLink`, {
//       method: "POST",
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(newformdata),
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }

// export async function forgetPasswordUpdateLinkClientId({
//   token,
//   newformdata,
// }: {
//   token: any;
//   newformdata: any;
//   link: any;
// }) {
//   try {
//     const response = await fetch(`${URL}/forgotpassword/UpdateLink`, {
//       method: "POST",
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(newformdata),
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }
export async function postDriverDataByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: any;
}) {
  try {
    const { driverRFIDCardNumber } = newformdata;
    delete newformdata.driverRFIDCardNumbers;
    const response = await fetch(`${URL}/v2/Driver`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to add data from the API");
    }
    const data = await response.json();
    // await AssignRfidtodriver(token, {
    //   DriverId: data.data._id,
    //   RFIDid: driverRFIDCardNumber,
    // });

    return data;
  } catch (error) {

    return [];
  }
}
export async function AssignRfidtodriver(token: any, payload: any) {
  try {
    const response = await fetch(`${URL}/AssignRfidToDriver`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to Assign rfid to driver");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}
export async function postDriverDataAssignByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: any;
}) {
  try {
    const response = await fetch(`${URL}/v2/DriverAssign`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {

    return [];
  }
}

export async function postDriverDeDataAssignByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: any;
}) {

  try {
    const response = await fetch(`${URL}/v2/DriverDeAssign`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {

    return [];
  }
}
export async function logout({
  token,fcmtoken
}:{
  token:string,fcmtoken:string
}){
   try {
    const response = await fetch(`${URL}/API/logout`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"token\":\"${fcmtoken}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}
export async function GetDriverDataByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/v2/AllDrivers`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function GetRfIdByClientId({
  token,
  ClientId,
}: {
  token: string;
  ClientId: string;
}) {
  try {
    const response = await fetch(`${URL}/getrfidbyclientid`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ ClientId }),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

// export async function onAssignRfid({
//   token,
//   ClientId,
// }: {
//   token: string;
//   ClientId: string;
// }) {
//   try {
//     const response = await fetch(`${URL}/AssignRfidToDriver`, {
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({ ClientId }),
//       method: "POST",
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }

export async function GetDriverDataAssignByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/v2/driverAssignList`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function GetDriverforvehicel({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/v2/GetAvailableVehiclesForDriver`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function ZoneFindById({
  token,
  id,
}: {
  token: string;
  id: string;
}) {
  try {
    const response = await fetch(`${URL}/findById`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${id}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

// export async function alertSettingCountZone({
//   token,
//   clientId,
//   zoneId,
// }: {
//   token: string;
//   clientId: string;
//   zoneId: string;
// }) {
//   try {
//     const response = await fetch(`${URL}/alertSettingCountZone`, {
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: `{\"clientId\":\"${clientId}\", \"zoneId\":\"${zoneId}\"}`,
//       method: "POST",
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }

// export async function zoneRuleDeleteByZoneId({
//   token,
//   id,
// }: {
//   token: string;
//   id: string;
// }) {
//   try {
//     const response = await fetch(`${URL}/zoneRuleDeleteByZoneId`, {
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: `{\"id\":\"${id}\"}`,
//       method: "POST",
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }

// export async function zonevehicleByZoneId({
//   token,
//   zoneId,
// }: {
//   token: string;
//   zoneId: string;
// }) {
//   try {
//     const response = await fetch(
//       `${URL}/NotificationCenter/zonevehicleByZoneId`,
//       {
//         headers: {
//           accept: "application/json, text/plain, */*",
//           authorization: `Bearer ${token}`,
//           "content-type": "application/json",
//         },
//         body: `{\"zoneId\":\"${zoneId}\"}`,
//         method: "POST",
//       }
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }

// export async function modifyCollectionStatus({
//   token,
//   collectionName,
// }: {
//   token: string;
//   collectionName: string;
// }) {
//   try {
//     const response = await fetch(`${URL}/modifyCollectionStatus`, {
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: `{\"collectionName\":\"${collectionName}\"}`,
//       method: "POST",
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {

//     return [];
//   }
// }
export async function getSearchAddress({
  query,
  country,
}: {
  query: string;
  country: string;
}) {
  try {

    const response = await fetch(
      // `${URL}/zoneaddresssearch?q=${query},${country}`,
      `https://photon.komoot.io/api/?q=${query} ${country}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
          "Content-Security-Policy": "default-src 'self' https: http:",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();
    let osmdata = data.features.map((item) => {
      return {
        lat: item.geometry.coordinates[1],
        lon: item.geometry.coordinates[0],
        display_name:
          (item.properties.name + " " +
            item.properties.street + " " +
            item.properties.district + " " +
            item.properties.city).replaceAll("undefined", "")
      }
    })
    return osmdata;
  } catch (error) {

    return [];
  }
}
export async function postZoneDataByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: zonelistType;
}) {
  try {
    const response = await fetch(`${URL}/zone`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function zoneDelete({ token, id }: { token: any; id: string }) {
  try {

    const response = await fetch(`${URL}/zoneDelete`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${id}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function zonenamesearch({
  token,
  filter,
  clientId,
}: {
  token: string;
  filter: object;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/zonenamesearch`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ clientId: clientId, Filters: [filter] }),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {

    return [];
  }
}

export async function TripsByBucketAndVehicle({
  token,
  payload,
  version
}: {
  token: string;
  payload: replayreport;
  version:string
}) {
  try {
    const response = await fetch(`${URL}/${version}/TripsByBucketAndVehicleV2`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function TravelHistoryByBucketV2({
  token,
  payload,
version
}: {
  token: string;
  payload: replayreport;
  version: string;
}) {
  try {
    const response = await fetch(`${URL}/${version}/TravelHistoryByBucketV2`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// export async function TripAddress({
//   lat,
//   lng,
//   token,
// }: {
//   lat: number;
//   lng: number;
//   token: string;
// }) {
//   try {
//     const response = await fetch(`${URL}/NotificationCenter/tripAddress`, {
//       method: "POST",
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({ latitude: lat, longitude: lng }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }

//     const data = await response.json();

//     return data;
//   } catch (error) {
//     console.error("Error fetching data", error);
//     return [];
//   }
// }

export async function getCurrentAddress({
  lat,
  lon,
  token,
}: {
  lat: number;
  lon: number;
  token: string;
}) {
  try {
    const response = await fetch(
      `http://osm.vtracksolutions.com/nominatim/reverse.php?lat=${lat}&lon=${lon}&zoom=19&format=jsonv2`,
      {
        method: "GET",
        // headers: {
          // accept: "application/json, text/plain, */*",
          // authorization: `Bearer ${token}`,
          // "content-type": "application/json",
        // },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// export async function fetchRoute({ pickupPoint, destinationPoint }: { pickupPoint: any, destinationPoint: any }) {
//   try {
//     const apiKey = "5b3ce3597851110001cf62489587736f58f4430887e51e4ee73060ee"; 
//     const response = await axios.post(
//       "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
//       {
//         coordinates:          
//           [
//             [pickupPoint.lng, pickupPoint.lat],
//             [destinationPoint.lng, destinationPoint.lat],
//           ],
//         radiuses: 1000000
//       },
//       {
//         headers: {
//           Authorization: apiKey,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     const coords = response.data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
//     return coords
//   } catch (err) {

//     return []
//   }
// }

export async function GetLicenseById({
  // token,
  id,
}: {
  // token: string
  id: string;
}) {
  try {
    const response = await fetch(`${URL}/GetLicenseById`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        // authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${id}\"}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function GetUsersByClientId({
  // token,
  clientId,
}: {
  // token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/GetUsersByClientId`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        // authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// export async function sentSmsForCamera({
//   token,
//   vehicleId,
//   clientId,
// }: {
//   token: string;
//   vehicleId: string;
//   clientId: string;
// }) {
//   try {
//     let payload = {
//       vehicleId,
//       clientId,

//     }

//     const response = await fetch(`${URL}/commandSenddAdd`, {
//       method: "POST",
//       headers: {
//         accept: "application/json, text/plain, */*",
//         authorization: `Bearer ${token}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }

//     const data = await response.json();

//     return data;
//   } catch (error) {
//     console.error("Error fetching data", error);
//     return [];
//   }
// }


///bookoing
export async function createBooking({
  token,
  payload,
}: {
  token: string;
  payload: any;
}) {
  try {
    const response = await fetch(`${URL}/booking`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {

    return null;
  }
}
export async function createUser({
  token,
  payload,
}: {
  token: string;
  payload: any;
}) {
  try {
    const response = await fetch(`${URL}/users`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error creating user", error);
    return null;
  }
}

export async function updateUser({
  token,
  payload,
}: {
  token: string;
  payload: any;
}) {
  try {
    const response = await fetch(`${URL}/users`, {
      method: "PATCH",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error updating user", error);
    return null;
  }
}

export async function deleteUser({
  token,
  payload,
}: {
  token: string;
  payload: any;
}) {
  try {
    const response = await fetch(`${URL}/deleteuser`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
       body: JSON.stringify(payload),
    });
    

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error deleting user", error);
    return null;
  }
}

export async function assignVehiclesToUser({
  token,
  payload,
}: {
  token: string;
  payload: any;
}) {
  try {
    const response = await fetch(`${URL}/vehicleAssignToUser`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to assign vehicles");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error assigning vehicles", error);
    return null;
  }
}

export async function getUserVehicles({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  try {
    const response = await fetch(`${URL}/user/${userId}/vehicles`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user vehicles");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching user vehicles", error);
    return [];
  }
}

export async function getBooking({
  token,
  query,
}: {
  token: string | undefined;
  query: any;
}) {
  try {

    const response = await fetch(`${URL}/booking?${Object.keys(query).map((i: any) => {
      return `${i}=${query[i]}&&`
    }).join("")}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      // body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {

    return null;
  }
}
export async function updateBooking({
  token,
  payload,
}: {
  token: string;
  payload: any;
}) {
  try {
    const response = await fetch(`${URL}/booking/${payload.id || payload._id}`, {
      method: "PUT",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {

    return null;
  }
}
export async function deleteBooking({
  token,
  id,
}: {
  token: string;
  id: string;
}) {
  try {
    const response = await fetch(`${URL}/booking/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      // body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {

    return null;
  }
}

export async function getReportOptionsByClientId({
  token,
  query,
}: {
  token: string | undefined;
  query: any;
}) {
  try {

    const response = await fetch(`${URL}/reports?${Object.keys(query).map((i: any) => {
      return `${i}=${query[i]}&&`
    }).join("")}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      // body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {

    return null;
  }
}
export async function getDeviceResponse({
  token,
  query,
}: {
  token: string | undefined;
  query: any;
}) {
  try {
    const response = await fetch(`${URL}/commandresponse?${Object.keys(query).map((i: any) => {
      return `${i}=${query[i]}&&`
    }).join("")}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      // body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {

    return null;
  }
}
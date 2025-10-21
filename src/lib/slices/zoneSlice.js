import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import _ from "lodash";

const fetchZoneApi = async ({ token, clientId }) => {
  try {
    const response = await fetch(
      "https://backend.vtracksolutions.com/zonelist",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ clientId }),
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    
    throw error;
  }
};

const debouncedFetchZone = _.debounce(fetchZoneApi, 300, {
  leading: true,
  trailing: false,
});

export const fetchZone = createAsyncThunk(
  "zones/fetchZone",
  async (args, thunkAPI) => {
    try {
      const data = await debouncedFetchZone(args);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const fetchvehicleApi = async ({ token, clientId }) => {
  try {
    const response = await fetch(
      "https://backend.vtracksolutions.com/vehicleListByClientId",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ clientId }),
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    
    throw error;
  }
};

const debouncedFetchVehicle = _.debounce(fetchvehicleApi, 300, {
  leading: true,
  trailing: false,
});

export const vehicleClientById = createAsyncThunk(
  "vehicleClientById",
  async (args, thunkAPI) => {
    try {
      const data = await debouncedFetchVehicle(args);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const zoneSlice = createSlice({
  name: "zones",
  initialState: {
    zone: [],
    vehicle: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchZone.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchZone.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.zone = action.payload.length === 0 ? null : action.payload;
    });
    builder.addCase(fetchZone.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    });
    builder.addCase(vehicleClientById.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(vehicleClientById.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.vehicle = action.payload;
    });
    builder.addCase(vehicleClientById.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    });
  },
});

export default zoneSlice.reducer;

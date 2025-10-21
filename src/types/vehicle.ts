export type GPSData = {
  longitude: number;
  latitude: number;
  Altitude: number;
  Angle: number;
  satellites: number;
  speed: number;
  speedUnit: string;
  speedWithUnit: null;
  speedWithUnitDesc: string;
};
export type camStatusData = {
  dimension: String;
  id: Number;
  label: String;
  value: Number;
  valueHuman: String;
};
export type OSMData = {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: number;
  lon: number;
  place_rank: number;
  category: string;
  type: string;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    office: null;
    postcode: null;
    building: null;
    road: string;
    neighbourhood: string;
    suburb: string;
    town: null;
    city: string;
    county: string;
    state: string;
    country: string;
    country_code: string;
  };
  boundingbox: [number, number, number, number];
};

export type VehicleData = {
  odometer: Number;
  IMEI: string;
  gps: GPSData;
  OSM: OSMData;
  timestamp: string;
  utctimestamp: string;
  ignition: number;
  vehicleStatusCode: string;
  dualCam: boolean;
  rearCameraDualCamVerify: boolean;
  frontCameraDualCamVerify: boolean;
  rearCameraString: string;
  frontCameraString: string;
  verifyDateTime: string;
  vehicleColor: string;
  vehicleTextColor: string;
  OsmElement: {},
  clientId: string;
  camStatus: camStatusData;
  backCamera: camStatusData;
  frontCamera: camStatusData;
  vehicleId: string;
  vehicleNo: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleReg: string;
  Label1: string;
  driverName: string;
  vehicleEventList: any[]; // You can replace this with a more specific type if needed
  zoneName: String;
  zone: String;
  dualcam: boolean,
  timestampNotParsed: string;
  color: string;
  vehicleStatus: string;
  DriverName: string;
  defaultView: Boolean,
  lastParked: string,
  fuelTankCapacity: number,
  fuelLowLevel: number,
  fuel: number,
  vehicleImgUrl: string,
  lastignitionOn: string,
};

export type CarMapList = {
  carData: VehicleData[];
};

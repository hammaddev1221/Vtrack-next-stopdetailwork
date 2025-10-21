type Location = {
  building: string | null;
  city: string;
  country: string;
  country_code: string;
  county: string;
  neighbourhood: string;
  office: string | null;
  postcode: string | null;
  road: string;
  state: string;
  suburb: string;
  town: string | null;
};

type AverageSpeed = string;
type EndingPoint = string;
type StartingPoint = string;
type TripDurationHr = number;
type TripDurationMins = number;
type TripEnd = string;
type TripEndDateLabel = string;
type TripEndTimeLabel = string;
type TripStart = string;
type TripStartDateLabel = string;
type TripStartTimeLabel = string;

type TripsByBucket = {
  AverageSpeed: AverageSpeed;
  EndingPoint: EndingPoint;
  EndingPointComplete: Location;
  IMEI: string;
  StartingPoint: StartingPoint;
  StartingPointComplete: Location;
  Status: string;
  DriverName: string;

  TotalDistance: string;
  TripDurationHr: TripDurationHr;
  TripDurationMins: TripDurationMins;
  TripEnd: TripEnd;
  TripEndDateLabel: TripEndDateLabel;
  TripEndTimeLabel: TripEndTimeLabel;
  TripStart: TripStart;
  TripStartDateLabel: TripStartDateLabel;
  TripStartTimeLabel: TripStartTimeLabel;
  emission: string;
  childRecords: any[]; // You can specify the type of childRecords as needed
  id: string;
  period: string;
  fromDateTime: string;
  toDateTime: string;
  startFuel: number,
  endFuel: number,
  fuelComsumed: number,
  consumedpercentage: number,
  mpl: string,
};

export default TripsByBucket;

export type TravelHistoryData = {
  angle: number;
  distanceCovered: string;
  lat: number;
  lng: number;
  speed: any;
  vehicle: string;
  vehicleEvents: any[]; // You can specify the type of vehicleEvents as needed
  _id: string;
  address: string;
  display_name: string;
};

export type IgnitionReport = {
  TimeZone: string;
  VehicleReg: string;
  clientId: string;
  fromDateTime: any;
  period: string;
  reportType: number;
  toDateTime: any;
  unit: string;
};

export type replayreport = {
  TimeZone: string;
  VehicleReg: string;
  clientId:string;
  period: string;
  fromDateTime: any;
  toDateTime: any;
  unit: string;
  fuelTankCapacity:number
};

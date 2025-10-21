import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    userId: string;
    clientId: string;
    FullName: string;
    Email: string;
    clientLanguage: string;
    MapType: string;
    clientName: string;
    unit: string;
    userLanguage: string;
    timezone: string;
    country: string;
    iat: number;
    exp: number;
    jti: string;
    userRole: string;
    clickToCall: Boolean;
    cameraProfile: Boolean;
    driverProfile: Boolean;
    ClientSettingsMap: String;
    ClientSettingsZoom: String;
    smsForCamera:Boolean;
    immobilising:Boolean;
    PortalNotification:Boolean;
    ServiceHistory:Boolean;
    defaultView:Boolean;
    dateFormat:String,
    timeFormat:String,
    livemapType: String,
    journeymapType: String,
    featureBookingApp: Boolean,
    featureReportApp:Boolean,
    featureVehicleTab:Boolean,
    featureShareVehicle:Boolean,
    getTrip:Boolean,
    featureAttendance:Boolean,
    V2:Boolean,
  }
}

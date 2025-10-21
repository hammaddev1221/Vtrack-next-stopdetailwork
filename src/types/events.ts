export type Events = {
  ignitionOn: boolean;
  ignitionOff: boolean;
  targetEnteredZone: boolean;
  targetLeftZone: boolean;
  overSpeeding: boolean;
  towing: boolean;
  harshCornering: boolean;
  harshBreak: boolean;
  harshAcceleration: boolean;
};

export type Notifications = {
  IgnitionOnPushNotification: boolean;
  IgnitionOnSMS: boolean;
  IgnitionOnEmail: boolean;
  IgnitionOffPushNotification: boolean;
  IgnitionOffSMS: boolean;
  IgnitionOffEmail: boolean;
  HarshBreakPushNotification: boolean;
  HarshBreakSMS: boolean;
  HarshBreakEmail: boolean;
  HarshCorneringPushNotification: boolean;
  HarshCorneringSMS: boolean;
  HarshCorneringEmail: boolean;
  HarshAccelerationPushNotification: boolean;
  HarshAccelerationSMS: boolean;
  HarshAccelerationmail: boolean;
  GeofenceNotification: boolean;
  GeofenceSMS: boolean;
  GeofenceEmail: boolean;
  OverSpeedNotification: boolean;
  OverSpeedSMS: boolean;
  OverSpeedEmail: boolean;
};

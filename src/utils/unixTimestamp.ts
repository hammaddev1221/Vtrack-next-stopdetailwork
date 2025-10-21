import moment from "moment";
import 'moment-timezone';
export function dateTimeToTimestamp(dateString: string, timeString: string | null) {
  const combinedDateTimeString = dateString + 'T' + timeString;
  const timestamp = new Date(combinedDateTimeString).getTime() / 1000;
  return timestamp;
}

export function backFromUnix(unixTimestamp: number, timezone: string) {
  unixTimestamp = Number(unixTimestamp)
  const utcDateTime  = moment.utc(unixTimestamp); // No need to multiply by 1000
  const convertedDateTime = utcDateTime.tz(timezone); // Convert to specified timezone
  return convertedDateTime.format('DD MMM YYYY HH:mm:ss');
}
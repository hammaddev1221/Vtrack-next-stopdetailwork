import { VehicleData } from '@/types/vehicle'

export default function uniqueDataByIMEIAndLatestTimestamp(
  data: VehicleData[],
) {
  const uniqueData: {
    [key: string]: { entry: VehicleData; timestamp: Date }
  } = {}

  data.forEach((entry) => {
    const IMEI = entry.IMEI
    const timestamp = new Date(entry.timestamp)

    if (!uniqueData[IMEI] || timestamp > uniqueData[IMEI].timestamp) {
      uniqueData[IMEI] = {
        entry,
        timestamp,
      }
    }
  })

  const uniqueEntries = Object.values(uniqueData).map((item) => item.entry)
  uniqueEntries.sort((a, b) => {
    const regA = Number(a.vehicleReg);
    const regB = Number(b.vehicleReg);
 
    // Compare the vehicle registration values
    if (regA < regB) return -1;
    if (regA > regB) return 1;
    return 0;
  });
  
  // Create an array to store the sorted objects
  const uniqueEntrieswithsortedArray = [...uniqueEntries.sort((a, b) => a.vehicleReg.localeCompare(b.vehicleReg, undefined, { numeric: true }))];
  return uniqueEntrieswithsortedArray
}

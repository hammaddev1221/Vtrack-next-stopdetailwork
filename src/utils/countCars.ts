import { VehicleData } from "@/types/vehicle";

export default function countCars(carData: VehicleData[]) {
  // const speeds = carData?.map((car) => car.gps.speed);
  // const ignitions = carData?.map((car) => car.ignition);
  // const countParked = speeds.filter(
  //   (speed, index) => 
  //     speed === 0 && (ignitions[index] === 0||ignitions[index] === null)
  // ).length;
  // const countMoving = speeds.filter(
  //   (speed, index) => speed > 0 && ignitions[index] === 1
  // ).length;
  const countParked = carData.filter(
    (item: any) => item?.vehicleStatus === "Parked"
  ).length;
  const countMoving = carData.filter(
    (item: any) => item?.vehicleStatus === "Moving"
  ).length;
  const countPause = carData.filter(
    (item: any) => item?.vehicleStatus === "Pause"
  ).length;
  return { countParked, countMoving, countPause };
}

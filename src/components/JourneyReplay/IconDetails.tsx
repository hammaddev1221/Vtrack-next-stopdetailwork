// import { TravelHistoryData } from "@/types/TripsByBucket"
// import Image from "next/image";
// import HarshAccelerationIcon from "../../../public/Images/HarshAccelerationIcon.png";
// import HarshCornerningIcon from "../../../public/harshcornering.png";
// import markerA from "../../../public/Images/marker-a.png";
// import markerB from "../../../public/Images/marker-b.png";
// import harshAcceleration from "../../../public/Images/brake-discs.png";
// interface IconProps {
//     isChecked: boolean, setIsChecked: any, TravelHistoryresponse: TravelHistoryData[]
// }
// const IconDetails = ({
//     isChecked, setIsChecked, TravelHistoryresponse
// }: IconProps) => {
//     return (

//         <div
//             className="grid grid-cols-1 absolute lg:top-10 xl:top-10 md:top-10 top-5 right-10 bg-bgLight py-2 px-2 cursor-pointer"
//             onClick={() => setIsChecked(!isChecked)}
//             style={{
//                 borderRadius: '10px',
//                 borderColor: 'green',
//                 borderWidth: '3px',
//                 borderStyle: 'solid',
//                 width: '160px', // Adjust width to make the div smaller
//                 backgroundColor: 'white',

//             }}
//         >

//             <div className="col-span-1" style={{ color: 'green' }}>
//                 <button
//                     className="text-labelColor font-popins text-xs font-bold ml-4" // Reduced font size and margin
//                     style={{
//                         width: '80%', // Make the button fill the container width
//                         backgroundColor: 'white',
//                     }}
//                 >
//                     Show Icon Details
//                 </button>
//             </div>


//             {isChecked && TravelHistoryresponse?.length > 0 && (
//                 <div className="mt-2 ml-1">
//                     {/* Location Start and End */}
//                     <div className="grid grid-cols-12 gap-2 mb-3">
//                         <div className="col-span-2 flex flex-col items-center mt-1">
//                             <Image src={markerA} alt="startIcon" className="h-4 w-4 mb-1" /> {/* Smaller icon size */}
//                             <Image src={markerB} alt="endIcon" className="h-4 w-4 mt-1" /> {/* Smaller icon size */}
//                         </div>
//                         <div className="col-span-10 text-xs font-semibold mt-1"> {/* Reduced font size */}
//                             <p>Location start</p>
//                             <p className="mt-2">Location End</p>
//                         </div>
//                     </div>


//                     <div className="space-y-2"> {/* Reduced spacing */}
//                         {TravelHistoryresponse?.filter((item) =>
//                             item.vehicleEvents.some(
//                                 (event) => event.Event === 'HarshAcceleration'
//                             )
//                         ).length > 0 && (
//                                 <div className="flex items-center gap-2">
//                                     <Image src={HarshAccelerationIcon} alt="harshAccelerationIcon" className="h-4 w-4" /> {/* Smaller icon size */}
//                                     <div
//                                         className="text-xs font-semibold"
//                                         style={{
//                                             maxWidth: 'calc(100% - 24px)', // Adjust width to account for icon size
//                                             display: '-webkit-box',
//                                             WebkitLineClamp: 2,
//                                             WebkitBoxOrient: 'vertical',
//                                             overflow: 'hidden',
//                                             textOverflow: 'ellipsis',
//                                         }}
//                                     >
//                                         Harsh Acceleration (x
//                                         {TravelHistoryresponse.reduce((count, item) =>
//                                             count +
//                                             item.vehicleEvents.filter(
//                                                 (event) => event.Event === 'HarshAcceleration'
//                                             ).length
//                                             , 0)}
//                                         )
//                                     </div>
//                                 </div>
//                             )}

//                         {TravelHistoryresponse?.filter((item) =>
//                             item.vehicleEvents.some(
//                                 (event) => event.Event === 'HarshCornering'
//                             )
//                         ).length > 0 && (
//                                 <div className="flex items-center gap-2">
//                                     <Image src={HarshCornerningIcon} alt="harshCorneringIcon" className="h-4 w-4" /> {/* Smaller icon size */}
//                                     <div
//                                         className="text-xs font-semibold"
//                                         style={{
//                                             maxWidth: 'calc(100% - 24px)', // Adjust width to account for icon size
//                                             display: '-webkit-box',
//                                             WebkitLineClamp: 2,
//                                             WebkitBoxOrient: 'vertical',
//                                             overflow: 'hidden',
//                                             textOverflow: 'ellipsis',
//                                         }}
//                                     >
//                                         Harsh Cornering (x
//                                         {TravelHistoryresponse.reduce((count, item) =>
//                                             count +
//                                             item.vehicleEvents.filter(
//                                                 (event) => event.Event === 'HarshCornering'
//                                             ).length
//                                             , 0)}
//                                         )
//                                     </div>
//                                 </div>
//                             )}

//                         {TravelHistoryresponse?.filter((item) =>
//                             item.vehicleEvents.some(
//                                 (event) => event.Event === 'HarshBreak'
//                             )
//                         ).length > 0 && (
//                                 <div className="flex items-center gap-2">
//                                     <Image src={harshAcceleration} alt="harshBrakingIcon" className="h-4 w-4" /> {/* Smaller icon size */}
//                                     <div
//                                         className="text-xs font-semibold"
//                                         style={{
//                                             maxWidth: 'calc(100% - 24px)', // Adjust width to account for icon size
//                                             display: '-webkit-box',
//                                             WebkitLineClamp: 2,
//                                             WebkitBoxOrient: 'vertical',
//                                             overflow: 'hidden',
//                                             textOverflow: 'ellipsis',
//                                         }}
//                                     >
//                                         Harsh Break (x
//                                         {TravelHistoryresponse.reduce((count, item) =>
//                                             count +
//                                             item.vehicleEvents.filter(
//                                                 (event) => event.Event === 'HarshBreak'
//                                             ).length
//                                             , 0)}
//                                         )
//                                     </div>
//                                 </div>
//                             )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }
// export default IconDetails
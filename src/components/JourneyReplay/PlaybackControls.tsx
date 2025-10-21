// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import Slider from "@mui/material/Slider";
// import { Tooltip } from "@material-tailwind/react";
// import { Select } from "antd";

// const PlaybackControls =(
//     {
//               currentPositionIndex,
//               polylinedata,
//               isPlaying,
//               isPaused,
//               isDynamicTime,
//               pausebtn,
//               playbtn,
//               stopbtn,
//               isPauseColor,
//               pauseTick,
//               tick,
//               stopTick,
//               handleChangeValueSlider,
//               speedFactor,
//               stopVehicle,
//               setSpeedFactor,
//               SpeedOption,
//     }:any
// )=>{
//     return(
//          <div className="absolute xl:left-56  xl:bottom-8 lg:bottom-8 md:bottom-8 sm:bottom-8 bottom-2 left-10  rounded-md  ml-0  2xl:ml-48">
//                 <div className="grid lg:grid-cols-5 grid-cols-5 gap-1 lg:py-5 py-2 pt-4 lg:pt-4 rounded-md mx-2 px-5 bg-white space-x-4">
//                   <div className="lg:col-span-4 md:col-span-4 col-span-4">
//                     <Slider
//                       value={currentPositionIndex}
//                       onChange={handleChangeValueSlider}
//                       color="secondary"
//                       style={{
//                         color: "#00B56C",
//                         cursor: isPlaying ? "pointer" : "not-allowed",
//                       }}
//                       max={polylinedata.length}
//                       disabled={!isPlaying}
//                     />
//                     <div className="flex justify-center">
//                       <div className="grid grid-cols-6">
//                         <div className="col-span-2">
//                           {isDynamicTime.TripStartTimeLabel}
//                         </div>
//                         <div className="col-span-3 flex items-center justify-center space-x-2">
//                           <Tooltip content="Pause" className="bg-black">
//                             <button
//                               onClick={() => pausebtn && pauseTick()}
//                               className={`h-5 w-5 ${pausebtn ? "cursor-pointer" : "cursor-not-allowed"}`}
//                             >
//                               <svg
//                                 className="h-5 w-5"
//                                 style={{ color: isPauseColor ? "green" : "black" }}
//                                 fill={isPauseColor ? "none" : "none"}
//                                 width="24"
//                                 height="24"
//                                 viewBox="0 0 24 24"
//                                 strokeWidth="2"
//                                 stroke="currentColor"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               >
//                                 <path stroke="none" d="M0 0h24v24H0z" />
//                                 <line x1="4" y1="4" x2="4" y2="20" />
//                                 <line x1="20" y1="4" x2="20" y2="20" />
//                                 <rect x="9" y="6" width="6" height="12" rx="2" />
//                               </svg>
//                             </button>
//                           </Tooltip>
//                           <Tooltip content="Play" className="bg-black">
//                             <button
//                               onClick={() => playbtn && tick()}
//                               className={`h-5 w-5 ${playbtn ? "cursor-pointer" : "cursor-not-allowed"}`}
//                             >
//                               <svg
//                                 className="h-5 w-5"
//                                 viewBox="0 0 24 24"
//                                 style={{ color: isPlaying ? "green" : "black" }}
//                                 fill={isPlaying ? "green" : "black"}
//                                 stroke="currentColor"
//                                 strokeWidth="2"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               >
//                                 <polygon points="5 3 19 12 5 21 5 3" />
//                               </svg>
//                             </button>
//                           </Tooltip>
//                           <Tooltip content="Stop" className="bg-black">
//                             <button
//                               onClick={() => stopbtn && stopTick()}
//                               className={`h-4 w-4 ${stopbtn ? "cursor-pointer" : "cursor-not-allowed"}`}
//                             >
//                               <svg
//                                 className="h-4 w-4"
//                                 width="24"
//                                 style={{ color: stopVehicle ? "green" : "black" }}
//                                 fill={stopVehicle ? "green" : "black"}
//                                 height="24"
//                                 viewBox="0 0 24 24"
//                                 strokeWidth="2"
//                                 stroke="currentColor"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               >
//                                 <path stroke="none" d="M0 0h24v24H0z" />
//                                 <rect x="4" y="4" width="16" height="16" rx="2" />
//                               </svg>
//                             </button>
//                           </Tooltip>
//                         </div>
//                         <div className="col-span-1">
//                           {isDynamicTime.TripEndTimeLabel}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="lg:col-span-1 md:col-span-1 col-span-1 mt-2">
//                     {(isPlaying || isPaused) && (
//                       <Select
//                         onChange={(e: any) => setSpeedFactor(Number(e.value))}
//                         options={SpeedOption}
//                         placeholder="4X"
//                         isSearchable={false}
//                         className="rounded-md h-10 w-full outline-green border border-gray-300"
//                         defaultValue={SpeedOption[2]}
//                         styles={{
//                           control: (provided, state) => ({
//                             ...provided,
//                             border: "none",
//                             boxShadow: state.isFocused ? null : null,
//                           }),
//                           menu: (provided, state) => ({
//                             ...provided,
//                             zIndex: 9999,
//                             position: "absolute",
//                             top: "auto",
//                             bottom: "100%",
//                           }),
//                           option: (provided, state) => ({
//                             ...provided,
//                             backgroundColor: state.isSelected
//                               ? "#00B56C"
//                               : state.isFocused
//                                 ? "white"
//                                 : "transparent",
//                             color: state.isSelected
//                               ? "white"
//                               : state.isFocused
//                                 ? "black"
//                                 : "black",
//                             "&:hover": {
//                               backgroundColor: "#00B56C",
//                               color: "white",
//                             },
//                           }),
//                         }}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </div>
//     )
// }

// export default PlaybackControls

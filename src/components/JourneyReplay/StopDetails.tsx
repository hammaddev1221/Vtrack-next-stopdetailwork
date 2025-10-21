


// interface StopDetailsProps {
//     stopDetailsOpen: boolean;
//     loadingMap: any;
//     stopWithSecond: any[];
//     getShowICon: boolean;
//     handleShowDetails: any,
//     getShowdetails: boolean,
//     selectedItemId: string | null,
//     handleItemClick: any

// }

// const StopDetails = (
//     { stopDetailsOpen,
//         loadingMap,
//         stopWithSecond,
//         getShowICon,
//         handleShowDetails,
//         getShowdetails,
//         selectedItemId,
//         handleItemClick }: StopDetailsProps
// ) => {
//     return (
//        <div className="xl:col-span-2 lg:col-span-4 md:col-span-5 sm:col-span-3 col-span-6 stop_journey max-w-xs lg:max-w-sm">
//                     <div
//                         className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 bg-green py-2 shadow-lg rounded-md cursor-pointer"
//                         onClick={() => stopDetailsOpen && handleShowDetails()}
//                     >
//                         <div className="lg:col-span-11 md:col-span-10 sm:col-span-10 col-span-11 stop_details_responsive">
//                             <p className="text-white lg:px-2 ps-1 text-lg text_responsive mr-24">
//                                 Stop Details ({loadingMap ? stopWithSecond.length : ""})
//                             </p>
//                         </div>
//                         <div className="col-span-1 mt-1 lg:-ms-2 md:-ms-1 -ms-2">
//                             {getShowICon ? (
//                                 <svg
//                                     className="h-5 w-5 text-white"
//                                     width="24"
//                                     height="24"
//                                     viewBox="0 0 24 24"
//                                     strokeWidth="2"
//                                     stroke="currentColor"
//                                     fill="none"
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                 >
//                                     <path stroke="none" d="M0 0h24v24H0z" />
//                                     <line x1="5" y1="12" x2="19" y2="12" />
//                                 </svg>
//                             ) : (
//                                 <svg
//                                     className="h-5 w-5 text-white"
//                                     width="24"
//                                     height="24"
//                                     viewBox="0 0 24 24"
//                                     strokeWidth="2"
//                                     stroke="currentColor"
//                                     fill="none"
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                 >
//                                     <path stroke="none" d="M0 0h24v24H0z" />
//                                     <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
//                                     <path d="M4 16v2a2 2 0 0 0 2 2h2" />
//                                     <path d="M16 4h2a2 2 0 0 1 2 2v2" />
//                                     <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
//                                     <circle cx="12" cy="12" r="3" />
//                                 </svg>
//                             )}
//                         </div>
//                     </div>
//                     {getShowdetails && (
//                         <div className={`bg-white overflow-y-scroll resposive_stop_details ${stopWithSecond.length > 1 ? "lg:h-60 md:h-60 sm:h-60 h-24" : ""}`}>
//                             {stopWithSecond?.map((item: any) => {
//                                 let isActive = item.date === selectedItemId;
//                                 return loadingMap ? (
//                                     <div
//                                         key={item.date}
//                                         onClick={() => handleItemClick(item)}
//                                         className={`cursor-pointer ${isActive ? 'bg-[#e1f0e3]' : ''}`}
//                                     >
//                                         <p className="text-black font-popins px-2 py-2 text-sm">
//                                             <b>{item?.address?.display_name}</b>
//                                         </p>
//                                         <div className="grid grid-cols-12">
//                                             <div className="lg:col-span-1 md:col-span-2 sm:col-span-6 col-span-2"></div>
//                                             <div className="lg:col-span-8 md:col-span-8 sm:col-span-8 col-span-9 mx-2 text-center text-red text-bold px-1 w-full text-sm border-2 border-red stop_details_time">
//                                                 {item?.date?.slice(11, 19)}, {item?.time}
//                                             </div>
//                                         </div>
//                                         <br />
//                                         <hr className="text-gray" />
//                                     </div>
//                                 ) : null;
//                             })}
//                         </div>
//                     )}
//                 </div>



//     )
// }

// export default StopDetails

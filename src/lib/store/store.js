// import { configureStore } from "@reduxjs/toolkit";
// import loginReducer from "../slices/loginSlice";
// import ZoneSlice from "../slices/zoneSlice";
// export const makeStore = () => {
//   return configureStore({
//     reducer: {
//       login: loginReducer,
//       zone:ZoneSlice
//     },
//   });
// };

import { configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import zoneReducer from "../slices/zoneSlice";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, zoneReducer);

export const makeStore = () => {
  return configureStore({
    reducer: {
      zone: persistedReducer,
    },
  });
};

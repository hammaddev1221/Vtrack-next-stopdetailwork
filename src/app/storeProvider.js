"use client";
import React from "react";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store/store";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/es/integration/react";
const StoreProvider = ({ children }) => {
  //   const storeRef = useRef();
  //   if (!storeRef.current) {
  //     storeRef.current = makeStore();
  //   }
  const store = makeStore();
  // Persist the store
  const persistor = persistStore(store);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider;

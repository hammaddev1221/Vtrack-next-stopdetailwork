// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCJiH9B0KthXW63NKIF6Aoj-HT12SuL6hA",
    authDomain: "vtrack-de155.firebaseapp.com",
    projectId: "vtrack-de155",
    storageBucket: "vtrack-de155.firebasestorage.app",
    messagingSenderId: "911229433453",
    appId: "1:911229433453:web:56e5dbc5f20c4423feb164",
    measurementId: "G-BN3NKXT45Y"
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage(function (payload) {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);
    const notificationTitle = payload.notification?.title || "Background Msg Title";
    const notificationOptions = {
        body: payload.notification?.body || "Background Msg body.",
        icon: "/firebase-logo.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

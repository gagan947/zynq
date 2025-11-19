importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
      apiKey: "AIzaSyB1Ko8WHeXDxdYAOjisHn8qVZOIkGrxudE",
      authDomain: "zynq-53745.firebaseapp.com",
      projectId: "zynq-53745",
      storageBucket: "zynq-53745.firebasestorage.app",
      messagingSenderId: "30895314430",
      appId: "1:30895314430:web:d3e6fa8d56ae9d8d615caf",
      measurementId: "G-18FTE8J8TQ",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
      self.registration.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/assets/img/logo.svg'
      });
});

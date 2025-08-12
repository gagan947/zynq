importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
      apiKey: "AIzaSyDve8qhgMDHLSU5EexRltguFzyX9UVNmek",
      authDomain: "ebookink-57739.firebaseapp.com",
      projectId: "ebookink-57739",
      storageBucket: "ebookink-57739.firebasestorage.app",
      messagingSenderId: "429289989858",
      appId: "1:429289989858:web:aad201238091a5e8c2a0bb",
      measurementId: "G-NFNPYP07L2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
      self.registration.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/assets/img/logo.svg'
      });
});

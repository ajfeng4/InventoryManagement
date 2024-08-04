// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAws9Y3evwXswakTFbwR30i5Q_YrmuP974",
    authDomain: "inventory-management-fc8ae.firebaseapp.com",
    projectId: "inventory-management-fc8ae",
    storageBucket: "inventory-management-fc8ae.appspot.com",
    messagingSenderId: "643914223813",
    appId: "1:643914223813:web:ab7e91a4eb5575d6a560ac",
    measurementId: "G-TMTGPLKLVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
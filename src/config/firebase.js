import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBtpZZaQElw7ieRgXaD3wJ_7EyNwEB9RVo",
    authDomain: "nevoasystem.firebaseapp.com",
    projectId: "nevoasystem",
    storageBucket: "nevoasystem.firebasestorage.app",
    messagingSenderId: "887482895210",
    appId: "1:887482895210:web:1177bbc7fe859d1db37313",
    measurementId: "G-545J0LDVTY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

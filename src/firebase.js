import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyDWIrmgvFec8nIX5Ir7-hpT5OANKiwmLgY",

  authDomain: "raterscores.firebaseapp.com",

  projectId: "raterscores",

  storageBucket: "raterscores.appspot.app",

  messagingSenderId: "72763874219",

  appId: "1:72763874219:web:3ef93bf4d64379e46450ee"

};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import firebase from "firebase/app";
import "firebase/database";

const config = {
	// apiKey: "AIzaSyDhJqeeX8EpXljo1v5vo-Ia29aIdjTPdKs",
	// authDomain: "firevuechat-3ac27.firebaseapp.com",
	// projectId: "firevuechat-3ac27",
	// storageBucket: "firevuechat-3ac27.appspot.com",
	// messagingSenderId: "425190580286",
	// appId: "1:425190580286:web:f7eec6ed3d44b171b4f16f"
	apiKey: "AIzaSyCPqcSLbyE3Q8uQSUVh--YrxCOkoV1mV-Y",
	authDomain: "real-time-app-d1a10.firebaseapp.com",
	databaseURL: "https://real-time-app-d1a10-default-rtdb.firebaseio.com",
	projectId: "real-time-app-d1a10",
	storageBucket: "real-time-app-d1a10.appspot.com",
	messagingSenderId: "496601226211",
	appId: "1:496601226211:web:e1e3aea4ce21b873a11ed6",
	measurementId: "G-XQ7Z6ZPYQH"
}

const db = firebase.initializeApp(config);
export default db;
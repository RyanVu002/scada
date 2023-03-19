import firebase from "firebase/app";
import "firebase/database";

const config = {
	// apiKey: "AIzaSyDhJqeeX8EpXljo1v5vo-Ia29aIdjTPdKs",
	// authDomain: "firevuechat-3ac27.firebaseapp.com",
	// projectId: "firevuechat-3ac27",
	// storageBucket: "firevuechat-3ac27.appspot.com",
	// messagingSenderId: "425190580286",
	// appId: "1:425190580286:web:f7eec6ed3d44b171b4f16f"
	apiKey: "AIzaSyDv7faloqI4OOySssl8d1QsTs8KEuaEv1Y",
	authDomain: "realtimedata-e0a74.firebaseapp.com",
	databaseURL: "https://realtimedata-e0a74-default-rtdb.firebaseio.com",
	projectId: "realtimedata-e0a74",
	storageBucket: "realtimedata-e0a74.appspot.com",
	messagingSenderId: "337524203340",
	appId: "1:337524203340:web:69982698226e158c24b9e9"
}

const db = firebase.initializeApp(config);
export default db;
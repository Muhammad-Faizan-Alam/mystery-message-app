import mongoose from "mongoose";


type connectObject = {
    isConnected?: number;
}

const connection: connectObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Using existing connection");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {}); // here can be more options like user, password, dbName, etc.
        
        connection.isConnected = db.connections[0].readyState;
        // console.log(db);
        // console.log(db.connections);
        console.log("Database connected");
    } catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1);
    }
}

export default dbConnect;
import mongoose from "mongoose";
import config from "./env.js";

const connectDb = async()=>{

    try{

        const conn = await mongoose.connect(config.mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    }
    catch(error)
    {

    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
    }

}


mongoose.connection.on('disconnected',()=>{
     console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error',()=>{

    console.error(`❌ MongoDB error: ${err}`);
});


export default connectDb;



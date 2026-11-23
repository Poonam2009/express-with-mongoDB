import mongoose from "mongoose";

export const connectMongoDB = async (connectionURL) => {
   return mongoose.connect(connectionURL);
}
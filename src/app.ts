import express from "express";
import bodyParser from "body-parser";
import deliveryRoutes from "./delivery/routes";
import packageRoutes from "./package/routes";
import cors from "cors";
import * as mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



app.use("/api/delivery", deliveryRoutes);
app.use("/api/package", packageRoutes);

app.use((error: any, req: any, res: any, next: any) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An error occurred! Please try again" });
});

mongoose.connect(process.env.DB_LOCAL || "").then(result=>{
  console.log("connected")
  app.listen(process.env.port || 5000)
}).catch(err=>{
  console.log(err);
})

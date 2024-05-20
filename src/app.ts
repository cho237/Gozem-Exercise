import express from "express";
import bodyParser from "body-parser";
import deliveryRoutes from "./delivery/routes";
import packageRoutes from "./package/routes";
import cors from "cors";
import * as mongoose from "mongoose";
import dotenv from "dotenv";
import { getIo, initSocket } from "./utils/socket";
import { Delivery, IDelivery } from "./delivery/models";
import { Ilatlng, socketConnection } from "./utils/model";
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
 const server =  app.listen(process.env.port || 5000, ()=> {
  console.log("server is running on port 5000");
 })
 initSocket(server).on('connection',(socket)=>{

  socket.on(socketConnection.changedLocation, async(deliveryId:string, location:Ilatlng)=>{
    const delivery = await Delivery.findOne({
      delivery_id: deliveryId
    }).populate('package_id')
    if(delivery){
      if(delivery.location.lat !== location.lat || delivery.location.lng !== location.lng){
       delivery.location.lat = location.lat;
       delivery.location.lng = location.lng;
       await delivery.save();
       socket.broadcast.emit(socketConnection.updatedDelivery, delivery)
      }
    }    
  })

  socket.on(socketConnection.statusChanged, async(deliveryId:string, status:Number)=>{
    const delivery = await Delivery.findOne({delivery_id:deliveryId}).populate("package_id")
    socket.broadcast.emit(socketConnection.updatedDelivery, delivery)
  })

 })
}).catch(err=>{
  console.log(err);
})

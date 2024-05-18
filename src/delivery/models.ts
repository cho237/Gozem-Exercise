import mongoose, { Schema, model } from "mongoose";
import {Ilatlng} from "../utils/model";


export interface IDelivery {
    delivery_id: string,
    package_id: any,
    pickup_time :Date,
    start_time: Date,
    end_time: Date,
    location: Ilatlng,
    status: EDeliveryStatus,
}

export enum EDeliveryStatus {
    opened, picked, transit,  delivered, failed
}

const deliverySchema = new Schema<IDelivery>({
    delivery_id: { type: String, required: true },
    package_id: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    pickup_time: { type: Date },
    start_time: { type: Date },
    end_time: { type: Date },
    location: {
        lat: {type: String},
        lng: {type: String},
    },
    status: { type: Number, required: true, default: 0 },
},{ timestamps: true })
export const Delivery = model<IDelivery>("Delivery", deliverySchema)
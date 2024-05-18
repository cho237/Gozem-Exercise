import mongoose, {Schema, model, Types, ObjectId} from "mongoose";
import {Ilatlng} from "../utils/model";
import {IDelivery} from "../delivery/models";


export interface IPackage {
    _id?:string,
    package_id:string,
    description:string,
    active_delivery_id: any,
    weight: number,
    width: number,
    height: number,
    depth: number,
    from_name: string,
    from_address: string,
    from_location: Ilatlng,
    to_name: string,
    to_address: string,
    to_location: Ilatlng,
}

const packageSchema = new Schema<IPackage>({
    active_delivery_id: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
    package_id: { type: String, required: true },
    description: { type: String, required: true },
    weight: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    depth: { type: Number, required: true },
    from_name: { type: String, required: true },
    from_address: { type: String, required: true },
    from_location: {
        lat: {type: String, required: true},
        lng: {type: String, required: true},
    },
    to_name: { type: String, required: true },
    to_address: { type: String, required: true },
    to_location: {
        lat: {type: String, required: true},
        lng: {type: String, required: true},
    },
}, { timestamps: true })

export const Package = model<IPackage>(
    "Package", packageSchema
)

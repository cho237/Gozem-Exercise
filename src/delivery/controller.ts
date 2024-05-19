import {IAuthReq, ICustomReq, IRes, LoggerObject, ResMessage} from "../utils/model";
import {NextFunction} from "express";
import HttpError from "../utils/errorHandler";
import HttpStatusCodes from "../utils/HttpStatusCodes";
import {Delivery, EDeliveryStatus, IDelivery} from "./models";
import {validationResult} from "express-validator";
import {Package} from "../package/models";
import {v4 as uuid_v4} from "uuid";
import logger from "../utils/logger";
import mongoose from "mongoose";





export async function allDeliveries(
    req: IAuthReq,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "POST",
        action: "Delivery/",
        // id:req.user
    };
    try {

        const deliveries = await Delivery.find()
            .select({}).populate('package_id')

        res.status(HttpStatusCodes.OK).json(deliveries);

    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

export async function createDelivery(
    req: IAuthReq<IDelivery>,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "POST",
        action: "Delivery/"+req.params.packageId,
        // id:req.user
    };

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error:any = new Error("Validation failed!");
            error.statusCode = HttpStatusCodes.BAD_REQUEST;
            error.data = errors.array();
            throw error;
        }

        const package_ = await Package.findOne({package_id: req.params.packageId})
        if(!package_) return next(
            new HttpError(
                "not_found",
                HttpStatusCodes.NOT_FOUND,
                loggerObject
            )
        );
        if(package_.active_delivery_id)return next(
            new HttpError(
                "Package already has an ongoing delivery",
                HttpStatusCodes.CONFLICT,
                loggerObject
            )
        );

        const newDelivery = new Delivery({
            delivery_id: uuid_v4(),
            package_id: package_._id,   
        })
        if(req.body.status) newDelivery.status = req.body.status
        await newDelivery.save()
        package_.active_delivery_id = newDelivery._id
        await package_.save();
        loggerObject.code = HttpStatusCodes.CREATED;
        logger.info("delivery_created", loggerObject);
        const delivery = await Delivery.findOne({delivery_id:newDelivery.delivery_id}).populate('package_id')

        res.status(HttpStatusCodes.CREATED).json(delivery)

    } catch (err: any) {
        console.log(err)
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}
export async function updateDelivery(
    req: IAuthReq<IDelivery>,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "PUT",
        action: "Delivery/"+req.params.Id,
        // id:req.user
    };

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error:any = new Error("Validation failed!");
            error.statusCode = HttpStatusCodes.BAD_REQUEST;
            error.data = errors.array();
            throw error;
        }
        const delivery = await Delivery.findOne({delivery_id:req.params.Id})
        if(!delivery) return next(
            new HttpError(
                "not_found",
                HttpStatusCodes.NOT_FOUND,
                loggerObject
            )
        );

        if(req.body.status === EDeliveryStatus.picked){
            delivery.pickup_time = new Date();
        }
        if(req.body.status === EDeliveryStatus.transit){
            delivery.start_time = new Date();
        }
    
        if(req.body.status === EDeliveryStatus.delivered || req.body.status === EDeliveryStatus.failed){
            delivery.end_time = new Date();
        }
      
        delivery.status = req.body.status;
        //delivery.location = {lng: req.body.location.lng, lat: req.body.location.lat};

        await delivery.save()
        res.status(HttpStatusCodes.OK).json(delivery)


    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

export async function deleteDelivery(
    req: IAuthReq,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
   
    const loggerObject: LoggerObject = {
        method: "DELETE",
        action: "Delivery/"+req.params.Id,
        // id:req.user
    };
    try {
        const delivery = await Delivery.findOne({delivery_id: req.params.Id})
        const package_ = await Package.findOne({_id: delivery?.package_id})
        await Delivery.deleteOne({delivery_id: req.params.Id})
        if(package_){
            package_.active_delivery_id = null;
            await package_.save();
        }
        res.status(HttpStatusCodes.OK).json(new ResMessage("Deleted"))

    } catch (err: any) {
        console.log(err)
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

export async function detailsDelivery(
    req: IAuthReq,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "GET",
        action: "Delivery/"+req.params.Id,
        // id:req.user
    };
    try {
        const delivery = await Delivery.findOne({delivery_id:req.params.Id}).populate('package_id')
        if(!delivery) return next(
            new HttpError(
                "not_found",
                HttpStatusCodes.NOT_FOUND,
                loggerObject
            )
        );
        res.status(HttpStatusCodes.OK).json(delivery);

    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

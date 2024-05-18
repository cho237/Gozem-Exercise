import {v4 as uuid_v4} from "uuid";
import {IAuthReq, ICustomReq, IRes, LoggerObject, ResMessage} from "../utils/model";
import {NextFunction} from "express";
import {IPackage, Package} from "./models";
import HttpStatusCodes from "../utils/HttpStatusCodes";
import HttpError from "../utils/errorHandler";
import logger from "../utils/logger";
import {validationResult} from "express-validator";
import {Delivery} from "../delivery/models";

export async function allPackages(
    req: IAuthReq,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "GET",
        action: "Package/",
        // id:req.user
    };
    try {
        const packages = await Package.find({})
        res.status(HttpStatusCodes.OK).json(packages);

    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

export async function createPackage(
    req: IAuthReq<IPackage>,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "POST",
        action: "Package/",
        // id:req.user
    };
    try {
        console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error:any = new Error("Validation failed!");
            error.statusCode = HttpStatusCodes.BAD_REQUEST;
            error.data = errors.array();
            throw error;
        }

        const newPackage = new Package({
            package_id: uuid_v4(),
            weight: req.body.weight,
            width: req.body.width,
            description : req.body.description,
            height: req.body.height,
            depth: req.body.depth,
            from_name: req.body.from_name,
            from_address: req.body.from_address,
            from_location: {lng: req.body.from_location.lng, lat: req.body.from_location.lat},
            to_name: req.body.to_name,
            to_address: req.body.to_address,
            to_location: {lng: req.body.to_location.lng, lat: req.body.to_location.lat}
        })
        await newPackage.save()
        loggerObject.code = HttpStatusCodes.CREATED;
        logger.info("package_created", loggerObject);
        res.status(HttpStatusCodes.CREATED).json(newPackage)

    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

export async function updatePackage(
    req: IAuthReq<IPackage>,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "PUT",
        action: "Package/"+req.params.id,
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

        const package_ = await Package.findOne({package_id: req.params.id})
        if(!package_) return next(
            new HttpError(
                "not_found",
                HttpStatusCodes.NOT_FOUND,
                loggerObject
            )
        );

            package_.weight = req.body.weight;
            package_.width = req.body.width;
            package_.height = req.body.height;
            package_.depth = req.body.depth;
            package_.description = req.body.description;
            package_.from_name = req.body.from_name;
            package_.from_address = req.body.from_address;
            package_.from_location = {lng: req.body.from_location.lng, lat: req.body.from_location.lat};
            package_.to_name =req.body.to_name,
            package_.to_address = req.body.to_address,
            package_.to_location =  {lng: req.body.to_location.lng, lat: req.body.to_location.lat}

        await package_.save()
        res.status(HttpStatusCodes.OK).json(package_)

    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

export async function detailsPackage(
    req: IAuthReq,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "GET",
        action: "Package/"+req.params.id,
        // id:req.user
    };
    try {

        const package_ = await Package.findOne({package_id: req.params.id}).populate('active_delivery_id')
        if(!package_) return next(
            new HttpError(
                "not_found",
                HttpStatusCodes.NOT_FOUND,
                loggerObject
            )
        );
        setTimeout(()=>{
            res.status(HttpStatusCodes.OK).json(package_);
        },2000)
        

    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}

export async function deletePackage(
    req: IAuthReq,
    res: IRes,
    next: NextFunction
): Promise<void | IRes> {
    const loggerObject: LoggerObject = {
        method: "DELETE",
        action: "Package/"+req.params.id,
        // id:req.user
    };
    try {
        const package_ = await Package.findOne({package_id: req.params.id})
        await Package.deleteOne({package_id: req.params.id})
        await Delivery.deleteOne({package_id:package_?._id})
        res.status(HttpStatusCodes.OK).json(new ResMessage("Deleted"))

    } catch (err: any) {
        return next(
            new HttpError(err, HttpStatusCodes.INTERNAL_SERVER_ERROR, loggerObject)
        );
    }
}



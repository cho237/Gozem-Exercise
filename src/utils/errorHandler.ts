import logger from "./logger";
import {LoggerObject} from "./model";

export default class HttpError extends Error {
    private code: number;

    constructor(message:any, errorCode: number, loggerObject: LoggerObject){
        loggerObject.code = errorCode
        logger.error(message, loggerObject)
        super(message);
        this.code = errorCode;
    }
}
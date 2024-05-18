import * as jwt from "jsonwebtoken";
import HttpError from "../utils/errorHandler";
import {LoggerObject} from "../utils/model";
import httpStatusCodes from "../utils/HttpStatusCodes";

export default (req: any, res: any, next: any) => {
  const loggerObject: LoggerObject = {
    method: "Auth",
    action: 'AuthMiddleware',
  }
  const authHeader: string | undefined = req.get("Authorization");
  if (!authHeader) {
    return next(new HttpError("Not Authenticated!", httpStatusCodes.BAD_REQUEST, loggerObject));
  }
  const token: string = authHeader.split(" ")[1];
  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, "secret123");
  } catch (err: any) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    return next(new HttpError("Not Authenticated!", httpStatusCodes.UNAUTHORIZED, loggerObject));
  }
  req.userId = decodedToken.userId;
  next();
};

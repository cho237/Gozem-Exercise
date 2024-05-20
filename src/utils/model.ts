import * as e from 'express';


// import { ISessionUser } from '@src/models/user';

// **** Express **** //

export interface IReq<T = void> extends e.Request {
    body: T;
}

export interface IAuthReq<T = void> extends e.Request {
    body: T;
}

export interface IRes extends e.Response {
    // locals: {
    //   sessionUser?: ISessionUser;
    // };
}

export class ResMessage {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
}

export  interface LoggerObject {
    method: string,
    id?: string,
    action: string,
    code?: number
}

export interface Ilatlng
{
    lat: string,
    lng: string
}

export interface ICustomReq {
    skip: number,
    limit: number,
    search:string
}
export enum socketConnection  {
    changedLocation='location_changed',
    updatedDelivery = 'delivery_updated',
    statusChanged = 'status_changed'
  }
  
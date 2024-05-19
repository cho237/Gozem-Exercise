import {Ilatlng} from "../utils/models";


export interface IDelivery {
  delivery_id?: string,
  package_id: any,
  pickup_time? :Date,
  start_time?: Date,
  end_time?: Date,
  location?: Ilatlng,
  status?: EDeliveryStatus,
}

export enum EDeliveryStatus {
  opened, picked, transit, delivered, failed
}

export enum socketConnection  {
  changedLocation='location_changed',
  updatedDelivery = 'delivery_updated',
  statusChanged = 'status_changed'
}

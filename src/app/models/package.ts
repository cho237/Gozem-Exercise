import {Ilatlng} from "../utils/models";
import {IDelivery} from "./delivery";

export interface IPackage {
  _id?:string,
  package_id:string,
  description:string,
  active_delivery_id?: IDelivery,
  weight: number | null,
  width: number | null,
  height: number | null,
  depth: number | null,
  from_name: string,
  from_address: string,
  from_location: Ilatlng,
  to_name: string,
  to_address: string,
  to_location: Ilatlng,
}

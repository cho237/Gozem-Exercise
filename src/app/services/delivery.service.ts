import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IDelivery} from "../models/delivery";


@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private base = `http://localhost:5000/api/delivery/`

  constructor(private http: HttpClient) {
  }

  createDelivery(model: IDelivery, packageId:string): Observable<any> {
    const url = `${this.base}${packageId}`;
    return this.http.post<IDelivery>(url, model);
  }

  updateDelivery(model: IDelivery, id: string): Observable<any> {
    const url = `${this.base}${id}`;
    return this.http.put<IDelivery>(url, model);
  }

  getDeliveries(): Observable<any> {
    const url = `${this.base}`;
    return this.http.get<IDelivery[]>(url);
  }

  detailsDelivery(id: string): Observable<any> {
    const url = `${this.base}${id}`;
    return this.http.get<IDelivery>(url);
  }

  deleteDelivery(id: string): Observable<any> {
    const url = `${this.base}${id}`;
    return this.http.delete<any>(url);
  }


}

import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {IPackage} from "../models/package";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private base = `http://localhost:5000/api/package/`

  constructor(private http: HttpClient) {
  }

  createPackage(model: IPackage): Observable<any> {
    const url = `${this.base}`;
    return this.http.post<IPackage>(url, model);
  }

  updatePackage(model: IPackage, id: string): Observable<any> {
    const url = `${this.base}${id}`;
    return this.http.put<IPackage>(url, model);
  }

  getPackages(): Observable<any> {
    const url = `${this.base}`;
    return this.http.get<IPackage[]>(url);
  }

  detailsPackage(id: string): Observable<any> {
    const url = `${this.base}${id}`;
    return this.http.get<IPackage>(url);
  }

  deletePackage(id: string): Observable<any> {
    const url = `${this.base}${id}`;
    return this.http.delete<any>(url);
  }


}

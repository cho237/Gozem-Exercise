import {Component, OnDestroy} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {DatePipe, NgIf} from "@angular/common";
import {IPackage} from "../../models/package";
import {Subscription} from "rxjs";
import {PackageService} from "../../services/package.service";
import {NotificationService} from "../../services/notification.service";
import {FormsModule} from "@angular/forms";
import {DeliveryService} from "../../services/delivery.service";
import io from 'socket.io-client';
import { EDeliveryStatus, socketConnection} from "../../models/delivery";
import { Ilatlng } from '../../utils/models';
const socket = io('http://localhost:5000');
@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [
    MatProgressSpinner,
    NgIf,
    FormsModule,
    DatePipe
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.css'
})
export class DriverComponent implements OnDestroy {
  interval?:any;
  loading = false;
  package?: IPackage;
  subs = new Subscription();
  message = "Enter package id"
  constructor(
    private packageService: PackageService,
    private notificationService: NotificationService,
    private deliveryService:DeliveryService,
  ) {

  }
  packageId = ""

  changeStatus(status:number){
    if(status === 3 || status === 4){
      if(this.interval){
        clearInterval(this.interval)
      }
    }
    if(this.package && this.package.active_delivery_id ) {
      let oldStatus = this.package.active_delivery_id.status
      this.package.active_delivery_id.status = status

      this.subs.add(
        this.deliveryService.updateDelivery(this.package.active_delivery_id,this.package.active_delivery_id.delivery_id || "" ).subscribe({
          next:(delivery)=>{
            if(this.package)
            {
              this.package.active_delivery_id = delivery
              socket.emit(socketConnection.statusChanged, this.package.active_delivery_id?.delivery_id,this.package.active_delivery_id?.status)
              this.notificationService.info("success")
            }
          },
          error:(e)=> {
            if(this.package  && this.package.active_delivery_id) this.package.active_delivery_id.status = oldStatus
            this.notificationService.error("failed")
          }
        })
      )

    }

  }

  onSeach() {
    if(this.interval){
      clearInterval(this.interval)
    }
    if (this.packageId === "") {
      return this.notificationService.info("Enter package Id")
    }
    this.loading = true
    this.subs.add(
      this.packageService.detailsPackage(this.packageId).subscribe(
        {
          next: (package_) => {
            if(package_.active_delivery_id){
              console.log(package_.active_delivery_id.status)
              if(package_.active_delivery_id.status === EDeliveryStatus.opened || package_.active_delivery_id.status === EDeliveryStatus.picked ||  package_.active_delivery_id.status === EDeliveryStatus.transit)
              if (typeof navigator!== 'undefined' && navigator.geolocation) {
                this.interval = setInterval(()=>{
                  navigator.geolocation.getCurrentPosition((position) => {
                    let location:Ilatlng = {
                      lat: position.coords.latitude.toString(),
                      lng:position.coords.longitude.toString(),
                    }
                    socket.emit(socketConnection.changedLocation, this.package?.active_delivery_id?.delivery_id, location)
                    console.log(position.coords.longitude, position.coords.latitude, location);
                  });
                }, 20000)
              }
            }
            this.package = package_
            this.loading = false
          },
          error: (e) => {
            this.message = "Package not found"
            this.loading = false
          }

        }
      )
    )

  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if(this.interval){
      clearInterval(this.interval)
    }
  }
}

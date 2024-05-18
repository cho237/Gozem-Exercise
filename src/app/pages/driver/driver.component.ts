import {Component, OnDestroy} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {DatePipe, NgIf} from "@angular/common";
import {IPackage} from "../../models/package";
import {Subscription} from "rxjs";
import {PackageService} from "../../services/package.service";
import {NotificationService} from "../../services/notification.service";
import {FormsModule} from "@angular/forms";
import {DeliveryService} from "../../services/delivery.service";

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

    if(this.package && this.package.active_delivery_id ) {
      let oldStatus = this.package.active_delivery_id.status
      this.package.active_delivery_id.status = status
      this.subs.add(
        this.deliveryService.updateDelivery(this.package.active_delivery_id,this.package.active_delivery_id.delivery_id || "" ).subscribe({
          next:(delivery)=>{
            if(this.package) this.package.active_delivery_id = delivery
            this.notificationService.info("success")
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
    if (this.packageId === "") {
      return this.notificationService.info("Enter package Id")
    }
    this.loading = true
    this.subs.add(
      this.packageService.detailsPackage(this.packageId).subscribe(
        {
          next: (package_) => {
            console.log(package_)
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
  }
}

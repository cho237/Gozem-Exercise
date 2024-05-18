import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {DatePipe, NgIf} from "@angular/common";
import {IPackage} from "../../models/package";
import {Subscription} from "rxjs";
import {PackageService} from "../../services/package.service";
import {FormsModule} from "@angular/forms";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatProgressSpinner,
    NgIf,
    FormsModule,
    DatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  loading = false;
  package?: IPackage;
  subs = new Subscription();
  message = "Enter package id to track location"

  constructor(private packageService: PackageService, private notificationService: NotificationService) {
  }

  packageId = ""

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

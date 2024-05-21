import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DatePipe, NgIf } from '@angular/common';
import { IPackage } from '../../models/package';
import { Subscription } from 'rxjs';
import { PackageService } from '../../services/package.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { GoogleMapsModule } from '@angular/google-maps';
import io from 'socket.io-client';
import { IDelivery, socketConnection } from '../../models/delivery';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatProgressSpinner, NgIf, FormsModule, DatePipe, GoogleMapsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnDestroy {

  loading = false;
  package?: IPackage;
  subs = new Subscription();
  message = 'Enter package id to track location';
  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    center: { lat: 3.8600704, lng: 11.5212288 },
    zoom: 2,
  };
  markers: any[] = [];
  packageId = '';

  constructor(
    private packageService: PackageService,
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {}

  socketConnection(){
    const socket = io('http://localhost:5000');
    socket.on(socketConnection.updatedDelivery, (delivery: IDelivery) => {
      this.ngZone.run(() => {
        if (this.package?.active_delivery_id) {
          this.package.active_delivery_id = delivery;
        }
      });

      if (delivery.location && delivery.location.lat && delivery.location.lng) {
        if (
          !this.markers[2] ||
          this.markers[2].lat !== +delivery.location.lat ||
          this.markers[2].lng !== +delivery.location.lng
        ) {
          let cords = {
            lat: +delivery.location.lat,
            lng: +delivery.location.lng,
          };

          this.ngZone.run(() => {
            this.markers.splice(2, 1);
            this.markers.push(cords);
          });
        }
      }
    });
  }


  

  onSeach() {
    if (this.packageId === '') {
      return this.notificationService.info('Enter package Id');
    }
    this.loading = true;
    this.subs.add(
      this.packageService.detailsPackage(this.packageId).subscribe({
        next: (package_) => {
          this.package = package_;
          this.loading = false;

          if(package_.active_delivery_id) this.socketConnection()
          
          const home = '../../../assets/home.png';
          const beachFlag =
            'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
          let imgTag1 = document.createElement('img');
          let imgTag2 = document.createElement('img');
          imgTag1.src = home;
          imgTag2.src = beachFlag;

          let markers = [
            {
              lat: +package_.from_location.lat,
              lng: +package_.from_location.lng,
              content: imgTag1,
            },
            {
              lat: +package_.to_location.lat,
              lng: +package_.to_location.lng,
              content: imgTag2,
            },
          ];
          this.markers = [...markers];
          if (package_.active_delivery_id && package_.active_delivery_id.location) {
            this.markers.push({
              lat: +package_.active_delivery_id.location.lat,
              lng: +package_.active_delivery_id.location.lng,
            });
          }
        },
        error: (e) => {
          this.message = 'Package not found';
          this.loading = false;
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DatePipe, NgIf } from '@angular/common';
import { IPackage } from '../../models/package';
import { Subscription } from 'rxjs';
import { PackageService } from '../../services/package.service';
import { NotificationService } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import io from 'socket.io-client';
import { EDeliveryStatus, socketConnection } from '../../models/delivery';
import { Ilatlng } from '../../utils/models';
import { GoogleMapsModule } from '@angular/google-maps';

const socket = io('http://localhost:5000');

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [MatProgressSpinner, NgIf, FormsModule, DatePipe, GoogleMapsModule],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.css',
})
export class DriverComponent implements OnDestroy, OnInit {

  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    center: { lat: 3.8600704, lng: 11.5212288 },
    zoom: 2,
  };

  markers: any[] = [];
  interval?: any;
  loading = false;
  package?: IPackage;
  subs = new Subscription();
  message = 'Enter package id';
  packageId = '';

  constructor(
    private packageService: PackageService,
    private notificationService: NotificationService,
    private deliveryService: DeliveryService
  ) {}
  ngOnInit(): void {}

  changeStatus(status: number) {
    if (status === 3 || status === 4) {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
    if (this.package && this.package.active_delivery_id) {
      let oldStatus = this.package.active_delivery_id.status;
      this.package.active_delivery_id.status = status;

      this.subs.add(
        this.deliveryService
          .updateDelivery(
            this.package.active_delivery_id,
            this.package.active_delivery_id.delivery_id || ''
          )
          .subscribe({
            next: (delivery) => {
              if (this.package) {
                this.package.active_delivery_id = delivery;
                socket.emit(
                  socketConnection.statusChanged,
                  this.package.active_delivery_id?.delivery_id,
                  this.package.active_delivery_id?.status
                );
                this.notificationService.info('success');
              }
            },
            error: (e) => {
              if (this.package && this.package.active_delivery_id)
                this.package.active_delivery_id.status = oldStatus;
              this.notificationService.error('failed');
            },
          })
      );
    }
  }

  onSeach() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.packageId === '') {
      return this.notificationService.info('Enter package Id');
    }
    this.loading = true;
    this.subs.add(
      this.packageService.detailsPackage(this.packageId).subscribe({
        next: (package_) => {
          if (package_.active_delivery_id) {
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
            if (package_.active_delivery_id.location) {
              this.markers.push({
                lat: +package_.active_delivery_id.location.lat,
                lng: +package_.active_delivery_id.location.lng,
              });
            }
            if (
              package_.active_delivery_id.status === EDeliveryStatus.opened ||
              package_.active_delivery_id.status === EDeliveryStatus.picked ||
              package_.active_delivery_id.status === EDeliveryStatus.transit
            )
              if (typeof navigator !== 'undefined' && navigator.geolocation) {
                this.interval = setInterval(() => {
                  navigator.geolocation.getCurrentPosition((position) => {
                    if (
                      !this.markers[2] ||
                      this.markers[2].lat !== position.coords.latitude ||
                      this.markers[2].lng !== position.coords.longitude
                    ) {
                      this.markers.splice(2, 1);
                      this.markers.push({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                      });

                      let location: Ilatlng = {
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString(),
                      };

                      socket.emit(
                        socketConnection.changedLocation,
                        this.package?.active_delivery_id?.delivery_id,
                        location
                      );
                    }
                  });
                }, 20000);
              }
          }
          this.package = package_;
          this.loading = false;
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
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

import {
  ApplicationRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { IPackage } from '../../models/package';
import { PackageService } from '../../services/package.service';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { IDelivery, socketConnection } from '../../models/delivery';
import { DeliveryService } from '../../services/delivery.service';
import { DatePipe } from '@angular/common';
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatInput,
    MatLabel,
    MatFormField,
    FormsModule,
    MatIcon,
    MatProgressSpinner,
    DatePipe,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit, OnDestroy {
  subs = new Subscription();
  loading = false;
  savingPackage = false;
  savingDelivery = false;
  editMode = false;
  @ViewChild('addPackageModal') addPackageModal: any;
  @ViewChild('addDeliveryModal') addDeliveryModal: any;
  addDeliveryRef?: MatDialogRef<any, any>;
  addPackageRef?: MatDialogRef<any, any>;
  packages: IPackage[] = [];
  deliveries: IDelivery[] = [];
  delivery: IDelivery = {
    package_id: '',
  };
  package: IPackage = {
    package_id: '',
    description: '',
    weight: null,
    width: null,
    height: null,
    depth: null,
    from_name: '',
    from_address: '',
    from_location: {
      lat: '',
      lng: '',
    },
    to_name: '',
    to_address: '',
    to_location: {
      lat: '',
      lng: '',
    },
  };

  constructor(
    public dialog: MatDialog,
    private packageService: PackageService,
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    socket.on(socketConnection.updatedDelivery, (delivery: IDelivery) => {
      console.log(delivery)
      const index = this.deliveries.findIndex(
        (d) => d.delivery_id === delivery.delivery_id
      );
      this.ngZone.run(() => {
        this.deliveries[index] = delivery;
      });
    });

    this.loading = true;
    this.subs.add(
      this.packageService.getPackages().subscribe({
        next: (packages) => {
          this.packages = packages;
          this.loading = false;
        },
        error: (e) => (this.loading = false),
      })
    );
    this.subs.add(
      this.deliveryService.getDeliveries().subscribe({
        next: (delevries) => {
          this.deliveries = delevries;
          this.loading = false;
        },
        error: (e) => (this.loading = false),
      })
    );
    this.loading = false;
  }

  openAddDeliveryDialog() {
    this.addDeliveryRef = this.dialog.open(this.addDeliveryModal, {
      // height: '90vh',
      width: '500px',
      maxWidth: '90vw',
      autoFocus: false,
      disableClose: true,
    });
  }

  deliveryStatus(index: any) {
    let status = ['opened', 'picked', 'transit', 'delivered', 'failed'];
    return status[index];
  }

  onSavePackage() {
    this.savingPackage = true;
    let sub = this.packageService.createPackage(this.package);
    if (this.editMode) {
      sub = this.packageService.updatePackage(
        this.package,
        this.package.package_id
      );
    }
    this.subs.add(
      sub.subscribe({
        next: (item) => {
          const existingIndex = this.packages.findIndex(
            (p) => p.package_id === this.package.package_id
          );
          if (existingIndex !== -1) {
            this.packages[existingIndex] = item;
          } else {
            this.packages = [item, ...this.packages];
          }
          this.savingPackage = false;
          this.notificationService.info('Success');
          this.closeaddPackageDialog();
        },
        error: (e) => {
          this.savingPackage = false;
          this.notificationService.error('An Error Occured');
        },
      })
    );
  }

  onDeletePackage(id: string) {
    this.subs.add(
      this.packageService.deletePackage(id).subscribe({
        next: (res) => {
          const updatedPackages = this.packages.filter(
            (p) => p.package_id !== id
          );
          this.packages = [...updatedPackages];
          this.notificationService.info('success');
        },
        error: (e) => this.notificationService.error('failed'),
      })
    );
  }

  onDeleteDelivery(id: string) {
    this.subs.add(
      this.deliveryService.deleteDelivery(id).subscribe({
        next: (res) => {
          console.log(res);
          const updatedDeliveries = this.deliveries.filter(
            (d) => d.delivery_id !== id
          );
          this.deliveries = [...updatedDeliveries];
          this.notificationService.info('success');
        },
        error: (e) => this.notificationService.error('failed'),
      })
    );
  }

  openAddPackageDialog(mode: boolean, package_?: IPackage) {
    this.editMode = mode;
    if (this.editMode && package_) {
      this.package = package_;
    } else {
      this.package = {
        package_id: '',
        description: '',
        weight: null,
        width: null,
        height: null,
        depth: null,
        from_name: '',
        from_address: '',
        from_location: {
          lat: '',
          lng: '',
        },
        to_name: '',
        to_address: '',
        to_location: {
          lat: '',
          lng: '',
        },
      };
    }
    this.addPackageRef = this.dialog.open(this.addPackageModal, {
      // height: '90vh',
      width: '500px',
      maxWidth: '90vw',
      autoFocus: false,
      disableClose: true,
    });
  }

  onSaveDelivery() {
    this.savingDelivery = true;
    this.subs.add(
      this.deliveryService
        .createDelivery(this.delivery, this.delivery.package_id)
        .subscribe({
          next: (delivery) => {
            this.deliveries.push(delivery);
            this.savingDelivery = false;
            this.notificationService.info('success');
            this.closeaddDeliveryDialog();
          },
          error: (e) => {
            this.notificationService.error(e.error.message || 'failed');
            this.savingDelivery = false;
          },
        })
    );
  }

  closeaddDeliveryDialog() {
    this.addDeliveryRef?.close();
  }

  closeaddPackageDialog() {
    this.addPackageRef?.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
   
    
  }
}

import {Injectable} from "@angular/core";
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {
  }

  error(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 5000,
      panelClass: 'text-red-500',
      verticalPosition: 'top',
    });
  }

  info(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 3000,
      panelClass: 'text-primary',
      verticalPosition: 'top',
    });
  }
}

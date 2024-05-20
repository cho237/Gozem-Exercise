import { Routes } from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {DriverComponent} from "./pages/driver/driver.component";
import {AdminComponent} from "./pages/admin/admin.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'driver', component: DriverComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo:'/' },
];

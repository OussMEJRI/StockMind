import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EquipmentListComponent } from './features/equipment/equipment-list/equipment-list.component';
import { EquipmentFormComponent } from './features/equipment/equipment-form/equipment-form.component';
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './features/employees/employee-form/employee-form.component';
import { LocationListComponent } from './features/locations/location-list/location-list.component';
import { LocationFormComponent } from './features/locations/location-form/location-form.component';
import { ChatbotComponent } from './features/chatbot/chatbot.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  
  // Equipment routes
  { path: 'equipment', component: EquipmentListComponent, canActivate: [AuthGuard] },
  { path: 'equipment/new', component: EquipmentFormComponent, canActivate: [AuthGuard] },
  { path: 'equipment/edit/:id', component: EquipmentFormComponent, canActivate: [AuthGuard] },
  
  // Employee routes
  { path: 'employees', component: EmployeeListComponent, canActivate: [AuthGuard] },
  { path: 'employees/new', component: EmployeeFormComponent, canActivate: [AuthGuard] },
  { path: 'employees/edit/:id', component: EmployeeFormComponent, canActivate: [AuthGuard] },
  
  // Location routes
  { path: 'locations', component: LocationListComponent, canActivate: [AuthGuard] },
  { path: 'locations/new', component: LocationFormComponent, canActivate: [AuthGuard] },
  { path: 'locations/edit/:id', component: LocationFormComponent, canActivate: [AuthGuard] },
  
  // Chatbot route
  { path: 'chatbot', component: ChatbotComponent, canActivate: [AuthGuard] },
  
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

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
import { ChatbotComponent } from './features/chatbot/chatbot.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'equipment', component: EquipmentListComponent },
      { path: 'equipment/new', component: EquipmentFormComponent },
      { path: 'equipment/edit/:id', component: EquipmentFormComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/new', component: EmployeeFormComponent },
      { path: 'employees/edit/:id', component: EmployeeFormComponent },
      { path: 'locations', component: LocationListComponent },
      { path: 'chatbot', component: ChatbotComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

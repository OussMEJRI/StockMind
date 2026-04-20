import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }  from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

import { LoginComponent }           from './features/auth/login/login.component';
import { DashboardComponent }       from './features/dashboard/dashboard.component';
import { EquipmentListComponent }   from './features/equipment/equipment-list/equipment-list.component';
import { EquipmentFormComponent }   from './features/equipment/equipment-form/equipment-form.component';
import { EmployeeListComponent }    from './features/employees/employee-list/employee-list.component';
import { EmployeeFormComponent }    from './features/employees/employee-form/employee-form.component';
import { EmplacementListComponent } from './features/emplacements/emplacement-list.component';
import { EmplacementFormComponent } from './features/emplacements/emplacement-form.component';
import { ChatbotComponent }         from './features/chatbot/chatbot.component';
import { CarbonFootprintComponent } from './features/carbon-footprint/carbon-footprint.component';
import { UsersComponent }           from './features/users/users.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard',              component: DashboardComponent },
      { path: 'equipment',              component: EquipmentListComponent },
      { path: 'equipment/new',          component: EquipmentFormComponent },
      { path: 'equipment/edit/:id',     component: EquipmentFormComponent },
      { path: 'employees',              component: EmployeeListComponent },
      { path: 'employees/new',          component: EmployeeFormComponent },
      { path: 'employees/edit/:id',     component: EmployeeFormComponent },
      { path: 'emplacements',           component: EmplacementListComponent },
      { path: 'emplacements/new',       component: EmplacementFormComponent },
      { path: 'emplacements/edit/:id',  component: EmplacementFormComponent },
      { path: 'locations',              component: EmplacementListComponent },
      { path: 'locations/new',          component: EmplacementFormComponent },
      { path: 'locations/edit/:id',     component: EmplacementFormComponent },
      { path: 'chatbot',                component: ChatbotComponent },
      { path: 'carbon',                 component: CarbonFootprintComponent },
      // ✅ Page utilisateurs — ADMIN uniquement
      { path: 'users', component: UsersComponent, canActivate: [AdminGuard] },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

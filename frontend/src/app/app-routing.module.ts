import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { CarbonFootprintComponent } from './features/carbon-footprint/carbon-footprint.component';

// Auth
import { LoginComponent } from './features/auth/login/login.component';

// Dashboard
import { DashboardComponent } from './features/dashboard/dashboard.component';

// Equipment (standalone)
import { EquipmentListComponent } from './features/equipment/equipment-list/equipment-list.component';
import { EquipmentFormComponent } from './features/equipment/equipment-form/equipment-form.component';

// Employees (standalone)
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './features/employees/employee-form/employee-form.component';

// Emplacements
import { EmplacementListComponent } from './features/emplacements/emplacement-list.component';
import { EmplacementFormComponent } from './features/emplacements/emplacement-form.component';

// Chatbot
import { ChatbotComponent } from './features/chatbot/chatbot.component';

const routes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Login (public)
  { path: 'login', component: LoginComponent },

  // Routes protégées
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      { path: 'dashboard', component: DashboardComponent },

      // Équipements
      { path: 'equipment', component: EquipmentListComponent },
      { path: 'equipment/new', component: EquipmentFormComponent },
      { path: 'equipment/edit/:id', component: EquipmentFormComponent },

      // Employés
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/new', component: EmployeeFormComponent },
      { path: 'employees/edit/:id', component: EmployeeFormComponent },

      // Emplacements
      { path: 'locations', component: EmplacementListComponent },
      { path: 'locations/new', component: EmplacementFormComponent },
      { path: 'locations/edit/:id', component: EmplacementFormComponent },

      // Chatbot
      { path: 'chatbot', component: ChatbotComponent },

      // 🌱 Empreinte Carbone
      { path: 'carbon', component: CarbonFootprintComponent },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

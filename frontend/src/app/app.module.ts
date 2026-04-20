import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// ✅ Angular Material
import { MatTableModule }           from '@angular/material/table';
import { MatPaginatorModule }       from '@angular/material/paginator';
import { MatIconModule }            from '@angular/material/icon';
import { MatButtonModule }          from '@angular/material/button';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatSelectModule }          from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './app.component';

// Interceptors
import { AuthInterceptor }  from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Composants NON standalone
import { LoginComponent }           from './features/auth/login/login.component';
import { DashboardComponent }       from './features/dashboard/dashboard.component';
import { EmplacementListComponent } from './features/emplacements/emplacement-list.component';
import { EmplacementFormComponent } from './features/emplacements/emplacement-form.component';
import { ChatbotComponent }         from './features/chatbot/chatbot.component';
import { CarbonFootprintComponent } from './features/carbon-footprint/carbon-footprint.component';
import { NavbarComponent }          from './shared/components/navbar/navbar.component';

// Composants standalone
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './features/employees/employee-form/employee-form.component';
import { EquipmentListComponent } from './features/equipment/equipment-list/equipment-list.component';
import { EquipmentFormComponent } from './features/equipment/equipment-form/equipment-form.component';
import { UsersComponent }        from './features/users/users.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    EmplacementListComponent,
    EmplacementFormComponent,
    ChatbotComponent,
    CarbonFootprintComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    // Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // ✅ Composants standalone
    EmployeeListComponent,
    EmployeeFormComponent,
    EquipmentListComponent,
    EquipmentFormComponent,
    UsersComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

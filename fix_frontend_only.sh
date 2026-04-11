#!/bin/bash

echo "🎨 Correction du frontend uniquement"
echo "===================================="
echo ""

# 1. Corriger le Dashboard Component
echo "1️⃣ Correction du Dashboard..."
cat > frontend/src/app/features/dashboard/dashboard.component.ts << 'DASHBOARD'
import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../core/services/equipment.service';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalEquipment = 0;
  totalEmployees = 0;
  equipmentInStock = 0;
  equipmentAssigned = 0;
  recentEquipment: any[] = [];
  recentEmployees: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.equipmentService.getEquipment(0, 100).subscribe({
      next: (response) => {
        const items = response.items || response || [];
        this.totalEquipment = response.total || items.length;
        this.recentEquipment = items.slice(0, 5);
        this.equipmentInStock = items.filter((e: any) => e.status === 'in_stock').length;
        this.equipmentAssigned = items.filter((e: any) => e.status === 'assigned').length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Erreur lors du chargement des équipements';
        this.loading = false;
      }
    });

    this.employeeService.getEmployees(0, 100).subscribe({
      next: (response) => {
        const items = response.items || response || [];
        this.totalEmployees = response.total || items.length;
        this.recentEmployees = items.slice(0, 5);
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
DASHBOARD

# 2. Build
echo ""
echo "2️⃣ Build du frontend..."
docker compose build --no-cache frontend

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
    
    # 3. Redémarrer
    echo ""
    echo "3️⃣ Redémarrage du frontend..."
    docker compose up -d frontend
    
    sleep 10
    
    echo ""
    echo "✅ Frontend prêt !"
    echo "   Accès: http://localhost:4200"
else
    echo "❌ Erreur de build"
    exit 1
fi

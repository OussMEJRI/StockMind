import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, AppUser } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>👥 Gestion des Utilisateurs</h1>
          <p class="subtitle">Gérez les accès à l'interface StockMind</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">➕ Nouvel utilisateur</button>
      </div>

      <div class="alert alert-danger"  *ngIf="error">⚠️ {{ error }}</div>
      <div class="alert alert-success" *ngIf="success">✅ {{ success }}</div>

      <!-- Résumé des rôles -->
      <div class="role-summary">
        <div class="role-card admin-card">
          <span class="role-icon">👑</span>
          <div>
            <strong>Administrateur</strong>
            <p>Accès complet — peut tout faire y compris supprimer</p>
          </div>
          <span class="role-count">{{ countByRole('admin') }}</span>
        </div>
        <div class="role-card gestionnaire-card">
          <span class="role-icon">🔧</span>
          <div>
            <strong>Gestionnaire</strong>
            <p>Peut créer, modifier — ne peut pas supprimer</p>
          </div>
          <span class="role-count">{{ countByRole('gestionnaire') }}</span>
        </div>
      </div>

      <div class="card">
        <div *ngIf="loading" class="loading">
          <div class="spinner"></div> Chargement...
        </div>

        <table class="table" *ngIf="!loading">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>
                <div class="user-info">
                  <div class="avatar" [style.background]="getAvatarColor(user.role)">
                    {{ getInitials(user) }}
                  </div>
                  <div>
                    <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                    <div class="user-id">#{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" [ngClass]="getRoleBadge(user.role)">
                  {{ getRoleIcon(user.role) }} {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span class="badge" [ngClass]="user.is_active ? 'badge-success' : 'badge-inactive'">
                  {{ user.is_active ? '✅ Actif' : '❌ Inactif' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-edit" (click)="openModal(user)">✏️ Modifier</button>
                  <button class="btn btn-sm btn-danger"
                          (click)="deleteUser(user)"
                          [disabled]="user.id === currentUserId"
                          [title]="user.id === currentUserId ? 'Impossible de supprimer votre propre compte' : ''">
                    🗑️ Supprimer
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="5" class="no-data">Aucun utilisateur trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== MODAL ===== -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingUser ? '✏️ Modifier' : '➕ Créer' }} un utilisateur</h3>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <div class="alert alert-danger" *ngIf="modalError">{{ modalError }}</div>

          <div class="form-row">
            <div class="form-group">
              <label>Prénom <span class="required">*</span></label>
              <input type="text" [(ngModel)]="formData.first_name" placeholder="Prénom">
            </div>
            <div class="form-group">
              <label>Nom <span class="required">*</span></label>
              <input type="text" [(ngModel)]="formData.last_name" placeholder="Nom">
            </div>
          </div>

          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input type="email" [(ngModel)]="formData.email" placeholder="email@example.com">
          </div>

          <div class="form-group">
            <label>
              Mot de passe
              <span class="required" *ngIf="!editingUser">*</span>
              <span class="optional" *ngIf="editingUser">(laisser vide = inchangé)</span>
            </label>
            <div class="password-wrap">
              <input [type]="showPassword ? 'text' : 'password'"
                     [(ngModel)]="formData.password"
                     placeholder="Mot de passe">
              <button type="button" class="toggle-pwd" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Rôle <span class="required">*</span></label>
              <select [(ngModel)]="formData.role">
                <option value="gestionnaire">🔧 Gestionnaire</option>
                <option value="admin">👑 Administrateur</option>
              </select>
              <div class="hint gestionnaire-hint" *ngIf="formData.role === 'gestionnaire'">
                ℹ️ Peut créer et modifier — ne peut pas supprimer
              </div>
              <div class="hint admin-hint" *ngIf="formData.role === 'admin'">
                ⚠️ Accès complet à toutes les fonctionnalités
              </div>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="formData.is_active">
                <option [ngValue]="true">✅ Actif</option>
                <option [ngValue]="false">❌ Inactif</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-primary" (click)="saveUser()" [disabled]="saving">
            {{ saving ? 'Enregistrement...' : (editingUser ? 'Modifier' : 'Créer') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1.5rem;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .subtitle { margin: 4px 0 0; color: #718096; font-size: 0.9rem; }

    /* Résumé rôles */
    .role-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .role-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.2rem; border-radius: 10px; border: 1px solid transparent;
    }
    .admin-card       { background: #fffbeb; border-color: #fcd34d; }
    .gestionnaire-card{ background: #eff6ff; border-color: #93c5fd; }
    .role-icon { font-size: 1.8rem; }
    .role-card strong { display: block; font-size: 0.95rem; color: #2d3748; }
    .role-card p { margin: 2px 0 0; font-size: 0.78rem; color: #718096; }
    .role-count {
      margin-left: auto; font-size: 1.8rem; font-weight: 700;
      color: #4a5568; min-width: 40px; text-align: right;
    }

    /* Table */
    .card { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; }
    .table th {
      background: #f8fafc; padding: 12px 16px; text-align: left;
      font-size: 0.82rem; color: #718096; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
    }
    .table td { padding: 14px 16px; border-bottom: 1px solid #f0f4f8; font-size: 0.9rem; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: #f8fafc; }

    .user-info { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
    }
    .user-name { font-weight: 500; color: #2d3748; }
    .user-id   { font-size: 0.75rem; color: #a0aec0; }

    .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; }
    .badge-admin        { background: #fef3c7; color: #92400e; }
    .badge-gestionnaire { background: #dbeafe; color: #1e40af; }
    .badge-success      { background: #d1fae5; color: #065f46; }
    .badge-inactive     { background: #fee2e2; color: #991b1b; }

    .action-buttons { display: flex; gap: 8px; }
    .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; }
    .btn-primary   { background: #667eea; color: white; }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-edit      { background: #3b82f6; color: white; padding: 5px 10px; font-size: 0.82rem; }
    .btn-edit:hover { background: #2563eb; }
    .btn-danger    { background: #ef4444; color: white; padding: 5px 10px; font-size: 0.82rem; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
    .btn:disabled  { opacity: 0.4; cursor: not-allowed; }

    .loading { display: flex; align-items: center; gap: 12px; padding: 2rem; color: #718096; }
    .spinner {
      width: 20px; height: 20px; border: 2px solid #e2e8f0;
      border-top-color: #667eea; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .no-data { text-align: center; color: #a0aec0; padding: 2rem; }

    .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 1rem; }
    .alert-danger  { background: #fee2e2; color: #991b1b; }
    .alert-success { background: #d1fae5; color: #065f46; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .modal-container {
      background: white; border-radius: 12px; width: 560px; max-width: 95vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.2s ease;
    }
    .modal-header {
      padding: 20px 24px 16px; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; color: #2d3748; }
    .modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #718096; padding: 4px 8px; border-radius: 4px; }
    .modal-close:hover { background: #f7fafc; }
    .modal-body { padding: 20px 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-weight: 500; color: #555; font-size: 0.9rem; }
    input, select { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; }
    input:focus, select:focus { outline: none; border-color: #667eea; }

    .password-wrap { position: relative; }
    .password-wrap input { width: 100%; box-sizing: border-box; padding-right: 42px; }
    .toggle-pwd { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; }

    .required { color: #dc3545; }
    .optional  { font-size: 0.75rem; color: #718096; font-weight: normal; margin-left: 4px; }

    .hint { font-size: 0.78rem; padding: 6px 10px; border-radius: 6px; margin-top: 4px; }
    .gestionnaire-hint { color: #1e40af; background: #eff6ff; }
    .admin-hint        { color: #92400e; background: #fffbeb; }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes spin    { to { transform: rotate(360deg); } }
  `]
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  loading = false;
  error = '';
  success = '';

  showModal  = false;
  editingUser: AppUser | null = null;
  saving     = false;
  modalError = '';
  showPassword = false;

  formData: Partial<AppUser> = {
    first_name: '', last_name: '', email: '',
    role: 'gestionnaire', is_active: true, password: ''
  };

  get currentUserId(): number | undefined {
    return this.authService.currentUser?.id;
  }

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => { this.users = data; this.loading = false; },
      error: () => { this.error = 'Erreur lors du chargement'; this.loading = false; }
    });
  }

  openModal(user?: AppUser): void {
    this.editingUser  = user || null;
    this.modalError   = '';
    this.showPassword = false;
    this.formData = user
      ? { first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, is_active: user.is_active, password: '' }
      : { first_name: '', last_name: '', email: '', role: 'gestionnaire', is_active: true, password: '' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingUser = null; }

  saveUser(): void {
    if (!this.formData.first_name || !this.formData.last_name || !this.formData.email) {
      this.modalError = 'Prénom, nom et email sont requis'; return;
    }
    if (!this.editingUser && !this.formData.password) {
      this.modalError = 'Le mot de passe est requis'; return;
    }
    this.saving = true;
    this.modalError = '';
    const payload: any = { ...this.formData };
    if (!payload.password) delete payload.password;

    const req = this.editingUser
      ? this.userService.updateUser(this.editingUser.id!, payload)
      : this.userService.createUser(payload as AppUser);

    req.subscribe({
      next: () => {
        this.success = this.editingUser ? 'Utilisateur modifié ✅' : 'Utilisateur créé ✅';
        this.closeModal(); this.loadUsers(); this.saving = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.modalError = err?.error?.detail || "Erreur lors de l'enregistrement";
        this.saving = false;
      }
    });
  }

  deleteUser(user: AppUser): void {
    if (!confirm(`Supprimer ${user.first_name} ${user.last_name} ?`)) return;
    this.userService.deleteUser(user.id!).subscribe({
      next: () => {
        this.success = 'Utilisateur supprimé';
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Erreur lors de la suppression';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  countByRole(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  getInitials(u: AppUser): string {
    return `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase();
  }
  getAvatarColor(role: string): string {
    return role === 'admin' ? '#f59e0b' : '#3b82f6';
  }
  getRoleLabel(role: string): string {
    return role === 'admin' ? 'Administrateur' : 'Gestionnaire';
  }
  getRoleIcon(role: string): string {
    return role === 'admin' ? '👑' : '🔧';
  }
  getRoleBadge(role: string): string {
    return role === 'admin' ? 'badge-admin' : 'badge-gestionnaire';
  }
}

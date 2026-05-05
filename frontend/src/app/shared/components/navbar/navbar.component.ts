import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';
import { ThemeService } from '../../../core/services/theme.service';
@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #161b22;
      border-bottom: 1px solid #21262d;
      box-shadow: 0 1px 8px rgba(0,0,0,0.4);
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.2rem;
      display: flex;
      align-items: center;
      height: 60px;
      gap: 1rem;
    }

    .navbar-brand {
      font-size: 1.1rem;
      font-weight: 700;
      color: #39d353;
      text-decoration: none;
      margin-right: 1.5rem;
      white-space: nowrap;
    }

    .navbar-brand:hover {
      color: #56d364;
    }

    .navbar-menu {
      display: flex;
      gap: 0.2rem;
      flex: 1;
    }

    .navbar-menu a {
      padding: 0.4rem 0.85rem;
      color: #8b949e;
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.2s;
      font-size: 0.85rem;
      white-space: nowrap;
      border: 1px solid transparent;
    }

    .navbar-menu a:hover {
      background: #21262d;
      color: #e6edf3;
      border-color: #30363d;
    }

    .navbar-menu a.active {
      background: rgba(57,211,83,0.12);
      color: #39d353;
      border-color: rgba(57,211,83,0.3);
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-left: auto;
    }

    .role-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .role-admin {
      background: rgba(245,158,11,0.15);
      color: #f59e0b;
      border: 1px solid rgba(245,158,11,0.3);
    }

    .role-gestionnaire {
      background: rgba(59,130,246,0.15);
      color: #60a5fa;
      border: 1px solid rgba(59,130,246,0.3);
    }

    .user-name {
      color: #8b949e;
      font-size: 0.82rem;
      white-space: nowrap;
    }

    .btn-logout {
      background: rgba(248,81,73,0.1);
      border: 1px solid rgba(248,81,73,0.3);
      color: #f85149;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-logout:hover {
      background: rgba(248,81,73,0.2);
      border-color: rgba(248,81,73,0.5);
    }

    .notification-wrapper {
      position: relative;
    }

    .notification-btn {
      position: relative;
      background: rgba(56,139,253,0.15);
      border: 1px solid rgba(56,139,253,0.35);
      color: #58a6ff;
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .notification-btn:hover {
      background: rgba(56,139,253,0.25);
    }

    .notification-count {
      position: absolute;
      top: -7px;
      right: -7px;
      background: #f85149;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-dropdown {
      position: absolute;
      top: 45px;
      right: 0;
      width: 380px;
      max-height: 480px;
      overflow-y: auto;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 10px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.45);
      z-index: 3000;
    }

    .notification-header {
      padding: 0.8rem 1rem;
      font-weight: 700;
      border-bottom: 1px solid #30363d;
      color: #e6edf3;
    }

    .notification-empty {
      padding: 1rem;
      color: #8b949e;
      text-align: center;
    }

    .notification-item {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid #30363d;
      cursor: pointer;
    }

    .notification-item:hover {
      background: #1c2128;
    }

    .notification-item.unread {
      background: rgba(56,139,253,0.08);
    }

    .notification-title {
      color: #e6edf3;
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 0.35rem;
    }

    .notification-message {
      color: #c9d1d9;
      font-size: 0.78rem;
      line-height: 1.4;
    }

    .notification-status {
      margin-top: 0.4rem;
      color: #8b949e;
      font-size: 0.72rem;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.7rem;
    }

    .notif-approve {
      background: rgba(57,211,83,0.15);
      border: 1px solid rgba(57,211,83,0.35);
      color: #39d353;
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .notif-reject {
      background: rgba(248,81,73,0.15);
      border: 1px solid rgba(248,81,73,0.35);
      color: #f85149;
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
    }
          .theme-toggle {
      background: rgba(188,140,255,0.12);
      border: 1px solid rgba(188,140,255,0.35);
      color: #bc8cff;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .theme-toggle:hover {
      background: rgba(188,140,255,0.22);
      border-color: rgba(188,140,255,0.55);
    }

    @media (max-width: 992px) {
      .navbar-menu {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  showNotifications = false;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();

    setInterval(() => {
      if (this.authService.isAuthenticated()) {
        this.loadNotifications();
      }
    }, 10000);
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.is_read).length;
      },
      error: (err) => console.error('Erreur notifications:', err)
    });
  }
  toggleTheme(): void {
  this.themeService.toggleTheme();
}

  get isDarkTheme(): boolean {
  return this.themeService.isDarkTheme();
  }
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  approve(notification: AppNotification): void {
    if (!confirm("Valider cette demande et supprimer l’équipement ?")) return;

    this.notificationService.approveDeleteRequest(notification.id).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => alert(err?.error?.detail || "Erreur lors de la validation")
    });
  }

  reject(notification: AppNotification): void {
    if (!confirm("Refuser cette demande ?")) return;

    this.notificationService.rejectDeleteRequest(notification.id).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => alert(err?.error?.detail || "Erreur lors du refus")
    });
  }

  markAsRead(notification: AppNotification): void {
    if (notification.is_read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => this.loadNotifications()
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
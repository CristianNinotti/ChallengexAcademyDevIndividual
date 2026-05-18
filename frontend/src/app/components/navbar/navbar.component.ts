import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/players" class="navbar-brand">
          <span class="brand-icon">⚽</span>
          <span class="brand-text">FIFA <span class="brand-accent">CRM</span></span>
        </a>

        <div class="navbar-links">
          <a routerLink="/players" routerLinkActive="active" id="nav-players">Players</a>
          <a routerLink="/players/create" routerLinkActive="active" id="nav-create">+ Create</a>
        </div>

        <div class="navbar-user" *ngIf="user$ | async as user">
          <div class="user-pill">
            <div class="user-avatar">{{ user.name[0].toUpperCase() }}</div>
            <span class="user-name hide-mobile">{{ user.name }}</span>
          </div>
          <button class="btn btn-ghost btn-sm" (click)="logout()" id="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(22, 27, 34, 0.95);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(8px);
      height: var(--navbar-h);
    }
    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 16px;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      .brand-icon { font-size: 20px; }
      .brand-text {
        font-family: 'Inter Tight', sans-serif;
        font-weight: 700;
        font-size: 18px;
        color: var(--text-primary);
      }
      .brand-accent { color: var(--accent); }
    }
    .navbar-links {
      display: flex;
      gap: 4px;
      flex: 1;
      a {
        padding: 6px 14px;
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        transition: all var(--transition);
        &:hover { color: var(--text-primary); background: var(--bg-input); }
        &.active { color: var(--text-primary); background: var(--bg-input); }
      }
    }
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
    }
    .user-name {
      font-size: 13px;
      color: var(--text-secondary);
    }
  `],
})
export class NavbarComponent {
  private auth = inject(AuthService);
  user$ = this.auth.user$;
  logout() { this.auth.logout(); }
}

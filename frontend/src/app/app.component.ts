import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, AsyncPipe, NavbarComponent],
  template: `
    <app-navbar *ngIf="auth.isLoggedIn"></app-navbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
}

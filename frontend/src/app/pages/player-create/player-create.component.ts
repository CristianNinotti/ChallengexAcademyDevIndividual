import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-create',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="page-container">
      <div class="mb-16">
        <a routerLink="/players" class="btn btn-ghost btn-sm" id="btn-back">← Back to Players</a>
      </div>

      <div class="card" style="max-width: 720px; margin: 0 auto;">
        <h1 class="form-page-title">Create Player</h1>
        <p class="text-muted mb-24">Add yourself or any player to the database</p>

        <div class="alert alert-danger" *ngIf="error">{{ error }}</div>
        <div class="alert alert-success" *ngIf="success">
          Player created! Redirecting…
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="create-form">
          <h3 class="subsection">Basic Info</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="long_name">Full Name *</label>
              <input id="long_name" class="form-control" formControlName="long_name" placeholder="Your name" />
              <span class="form-error" *ngIf="f['long_name'].touched && f['long_name'].invalid">Required</span>
            </div>
            <div class="form-group">
              <label for="player_positions">Positions *</label>
              <input id="player_positions" class="form-control" formControlName="player_positions" placeholder="ST, CF, CAM…" />
              <span class="form-error" *ngIf="f['player_positions'].touched && f['player_positions'].invalid">Required</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="club_name">Club</label>
              <input id="club_name" class="form-control" formControlName="club_name" placeholder="Your club" />
            </div>
            <div class="form-group">
              <label for="nationality_name">Nationality</label>
              <input id="nationality_name" class="form-control" formControlName="nationality_name" placeholder="Argentina" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="overall">Overall *</label>
              <input id="overall" type="number" class="form-control" formControlName="overall" min="0" max="99" placeholder="85" />
              <span class="form-error" *ngIf="f['overall'].touched && f['overall'].invalid">0-99</span>
            </div>
            <div class="form-group">
              <label for="potential">Potential</label>
              <input id="potential" type="number" class="form-control" formControlName="potential" min="0" max="99" />
            </div>
            <div class="form-group">
              <label for="age">Age</label>
              <input id="age" type="number" class="form-control" formControlName="age" min="15" max="50" placeholder="25" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="gender">Gender</label>
              <select id="gender" class="form-control" formControlName="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div class="form-group">
              <label for="preferred_foot">Preferred Foot</label>
              <select id="preferred_foot" class="form-control" formControlName="preferred_foot">
                <option value="">—</option>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
              </select>
            </div>
          </div>

          <h3 class="subsection">Skills (0–99)</h3>
          <div class="form-row">
            <div class="form-group" *ngFor="let s of skillFields">
              <label [for]="s.key">{{ s.label }}</label>
              <input [id]="s.key" type="number" class="form-control"
                [formControlName]="s.key" min="0" max="99" [placeholder]="s.default" />
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/players" class="btn btn-ghost" id="btn-cancel">Cancel</a>
            <button type="submit" class="btn btn-accent" [disabled]="saving" id="btn-create">
              {{ saving ? 'Creating…' : '⚽ Create Player' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page-title {
      font-family: 'Inter Tight', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 4px;
    }
    .subsection {
      font-size: 12px; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.06em;
      margin: 20px 0 12px; border-bottom: 1px solid var(--border); padding-bottom: 6px;
    }
    .form-row {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px; margin-bottom: 12px;
    }
    .create-form { display: flex; flex-direction: column; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  `],
})
export class PlayerCreateComponent {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private ps     = inject(PlayerService);

  saving  = false;
  error   = '';
  success = false;

  skillFields = [
    { key: 'pace',      label: 'Pace',      default: '70' },
    { key: 'shooting',  label: 'Shooting',  default: '70' },
    { key: 'passing',   label: 'Passing',   default: '70' },
    { key: 'dribbling', label: 'Dribbling', default: '70' },
    { key: 'defending', label: 'Defending', default: '50' },
    { key: 'physic',    label: 'Physical',  default: '65' },
  ];

  form = this.fb.group({
    long_name:        ['', Validators.required],
    player_positions: ['', Validators.required],
    club_name:        [''],
    nationality_name: [''],
    overall:          [null as number | null, [Validators.required, Validators.min(0), Validators.max(99)]],
    potential:        [null as number | null],
    age:              [null as number | null],
    gender:           ['male'],
    preferred_foot:   [''],
    pace:             [null as number | null],
    shooting:         [null as number | null],
    passing:          [null as number | null],
    dribbling:        [null as number | null],
    defending:        [null as number | null],
    physic:           [null as number | null],
  });

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error  = '';
    const raw = this.form.value;
    const payload: any = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (v !== null && v !== '') payload[k] = v;
    });
    this.ps.createPlayer(payload).subscribe({
      next: (p) => {
        this.saving  = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/players', p.id]), 1200);
      },
      error: err => {
        this.saving = false;
        this.error  = err?.error?.message ?? 'Create failed';
      },
    });
  }
}

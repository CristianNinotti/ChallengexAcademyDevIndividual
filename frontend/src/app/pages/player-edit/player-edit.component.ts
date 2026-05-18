import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { PlayerService, Player } from '../../services/player.service';

@Component({
  selector: 'app-player-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="page-container">
      <div class="mb-16">
        <a [routerLink]="['/players', playerId]" class="btn btn-ghost btn-sm" id="btn-back">← Back</a>
      </div>

      <div class="card" style="max-width: 720px; margin: 0 auto;">
        <h1 class="form-page-title">Edit Player</h1>
        <p class="text-muted mb-24" *ngIf="player">{{ player.long_name }}</p>

        <div class="loading-overlay" *ngIf="loadingPlayer">
          <div class="spinner"></div>
        </div>

        <div class="alert alert-danger" *ngIf="error">{{ error }}</div>
        <div class="alert alert-success" *ngIf="success">Player updated successfully!</div>

        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!loadingPlayer" class="edit-form">
          <!-- Basic Info -->
          <h3 class="subsection">Basic Info</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="long_name">Full Name *</label>
              <input id="long_name" class="form-control" formControlName="long_name" />
              <span class="form-error" *ngIf="f['long_name'].touched && f['long_name'].invalid">Required</span>
            </div>
            <div class="form-group">
              <label for="player_positions">Positions *</label>
              <input id="player_positions" class="form-control" formControlName="player_positions" placeholder="ST, CF" />
              <span class="form-error" *ngIf="f['player_positions'].touched && f['player_positions'].invalid">Required</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="club_name">Club</label>
              <input id="club_name" class="form-control" formControlName="club_name" />
            </div>
            <div class="form-group">
              <label for="nationality_name">Nationality</label>
              <input id="nationality_name" class="form-control" formControlName="nationality_name" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="overall">Overall (0-99)</label>
              <input id="overall" type="number" class="form-control" formControlName="overall" min="0" max="99" />
            </div>
            <div class="form-group">
              <label for="potential">Potential (0-99)</label>
              <input id="potential" type="number" class="form-control" formControlName="potential" min="0" max="99" />
            </div>
            <div class="form-group">
              <label for="age">Age</label>
              <input id="age" type="number" class="form-control" formControlName="age" min="15" max="50" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="preferred_foot">Preferred Foot</label>
              <select id="preferred_foot" class="form-control" formControlName="preferred_foot">
                <option value="">—</option>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
              </select>
            </div>
            <div class="form-group">
              <label for="gender">Gender</label>
              <select id="gender" class="form-control" formControlName="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <!-- Skills -->
          <h3 class="subsection">Core Skills</h3>
          <div class="form-row">
            <div class="form-group" *ngFor="let s of skillFields">
              <label [for]="s.key">{{ s.label }}</label>
              <input [id]="s.key" type="number" class="form-control"
                [formControlName]="s.key" min="0" max="99" />
            </div>
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <a [routerLink]="['/players', playerId]" class="btn btn-ghost" id="btn-cancel">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="saving" id="btn-save">
              {{ saving ? 'Saving…' : 'Save Changes' }}
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
    .edit-form { display: flex; flex-direction: column; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  `],
})
export class PlayerEditComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private ps     = inject(PlayerService);

  playerId    = 0;
  player: Player | null = null;
  loadingPlayer = true;
  saving  = false;
  error   = '';
  success = false;

  skillFields = [
    { key: 'pace',      label: 'Pace'      },
    { key: 'shooting',  label: 'Shooting'  },
    { key: 'passing',   label: 'Passing'   },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'defending', label: 'Defending' },
    { key: 'physic',    label: 'Physical'  },
  ];

  form = this.fb.group({
    long_name:         ['', Validators.required],
    player_positions:  ['', Validators.required],
    club_name:         [''],
    nationality_name:  [''],
    overall:           [null as number | null],
    potential:         [null as number | null],
    age:               [null as number | null],
    preferred_foot:    [''],
    gender:            ['male'],
    pace:              [null as number | null],
    shooting:          [null as number | null],
    passing:           [null as number | null],
    dribbling:         [null as number | null],
    defending:         [null as number | null],
    physic:            [null as number | null],
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.playerId = +this.route.snapshot.paramMap.get('id')!;
    this.ps.getPlayer(this.playerId).subscribe({
      next: p => {
        this.player = p;
        this.form.patchValue({
          long_name:        p.long_name,
          player_positions: p.player_positions,
          club_name:        p.club_name,
          nationality_name: p.nationality_name,
          overall:          p.overall,
          potential:        p.potential,
          age:              p.age,
          preferred_foot:   p.preferred_foot ?? '',
          gender:           p.gender,
          pace:             p.pace,
          shooting:         p.shooting,
          passing:          p.passing,
          dribbling:        p.dribbling,
          defending:        p.defending,
          physic:           p.physic,
        });
        this.loadingPlayer = false;
      },
      error: () => { this.loadingPlayer = false; this.error = 'Player not found'; },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error  = '';
    this.success = false;
    // Filter null/empty values
    const raw = this.form.value;
    const payload: any = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (v !== null && v !== '') payload[k] = v;
    });
    this.ps.updatePlayer(this.playerId, payload).subscribe({
      next: () => {
        this.saving  = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/players', this.playerId]), 1200);
      },
      error: err => {
        this.saving = false;
        this.error  = err?.error?.message ?? 'Update failed';
      },
    });
  }
}

import { Component, inject, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { PlayerService, Player } from '../../services/player.service';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DecimalPipe],
  template: `
    <div class="page-container" *ngIf="!loading && player">
      <!-- Back -->
      <div class="mb-16">
        <a routerLink="/players" class="btn btn-ghost btn-sm" id="btn-back">← Back to Players</a>
      </div>

      <!-- Hero card -->
      <div class="card hero-card mb-16">
        <div class="hero-left">
          <div class="player-photo-wrap">
            <img *ngIf="player.player_face_url"
              [src]="player.player_face_url"
              class="player-photo"
              (error)="onImgError($event)"
              alt="{{ player.long_name }}"
            />
            <div class="player-photo-placeholder" *ngIf="!player.player_face_url">
              {{ player.long_name[0] }}
            </div>
          </div>
          <div class="hero-info">
            <h1 class="player-name">{{ player.long_name }}</h1>
            <div class="hero-meta">
              <span class="pos-tag">{{ player.player_positions }}</span>
              <span class="badge" [class]="'badge-' + player.gender">{{ player.gender }}</span>
              <span class="text-muted">FIFA {{ player.fifa_version }}</span>
            </div>
            <div class="hero-details">
              <span *ngIf="player.club_name">🏟 {{ player.club_name }}</span>
              <span *ngIf="player.nationality_name">🌍 {{ player.nationality_name }}</span>
              <span *ngIf="player.age">🎂 {{ player.age }} years</span>
              <span *ngIf="player.preferred_foot">🦶 {{ player.preferred_foot }}</span>
            </div>
          </div>
        </div>
        <div class="hero-ratings">
          <div class="big-rating" [class]="ratingClass(player.overall)">
            <span class="rating-num">{{ player.overall }}</span>
            <span class="rating-lbl">OVR</span>
          </div>
          <div class="big-rating silver">
            <span class="rating-num">{{ player.potential }}</span>
            <span class="rating-lbl">POT</span>
          </div>
        </div>
        <div class="hero-actions">
          <a [routerLink]="['/players', player.id, 'edit']" class="btn btn-primary btn-sm" id="btn-edit-player">
            ✏ Edit
          </a>
          <a [routerLink]="['/players', player.id, 'timeline']" class="btn btn-ghost btn-sm" id="btn-timeline">
            📈 Timeline
          </a>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Stats grid -->
        <div class="card">
          <h2 class="section-title">Core Stats</h2>
          <div class="core-stats">
            <div class="stat-bar" *ngFor="let s of coreStats">
              <span class="stat-name">{{ s.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="s.value" [class]="barClass(s.value)"></div>
              </div>
              <span class="stat-val">{{ s.value }}</span>
            </div>
          </div>
        </div>

        <!-- Radar chart -->
        <div class="card chart-card">
          <h2 class="section-title">Skills Radar</h2>
          <div class="chart-wrap">
            <canvas #radarCanvas id="radar-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Full details -->
      <div class="card mt-16">
        <h2 class="section-title">Full Details</h2>
        <div class="details-grid">
          <div class="detail-item" *ngFor="let d of allDetails">
            <span class="detail-key">{{ d.label }}</span>
            <span class="detail-val">{{ d.value ?? '—' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-overlay" *ngIf="loading">
      <div class="spinner"></div>
      <p>Loading player…</p>
    </div>
  `,
  styles: [`
    .hero-card {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      flex-wrap: wrap;
    }
    .hero-left {
      display: flex;
      gap: 20px;
      flex: 1;
      min-width: 260px;
    }
    .player-photo-wrap { flex-shrink: 0; }
    .player-photo {
      width: 90px; height: 90px;
      border-radius: var(--radius-md);
      object-fit: cover;
    }
    .player-photo-placeholder {
      width: 90px; height: 90px;
      border-radius: var(--radius-md);
      background: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 700;
    }
    .hero-info { display: flex; flex-direction: column; gap: 8px; }
    .player-name {
      font-family: 'Inter Tight', sans-serif;
      font-size: 22px; font-weight: 700;
    }
    .hero-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .hero-details {
      display: flex; gap: 12px; flex-wrap: wrap;
      font-size: 13px; color: var(--text-secondary);
    }
    .hero-ratings { display: flex; gap: 12px; align-items: center; }
    .big-rating {
      display: flex; flex-direction: column; align-items: center;
      width: 64px; height: 64px; border-radius: var(--radius-md);
      justify-content: center; background: var(--bg-input);
      .rating-num { font-size: 22px; font-weight: 700; line-height: 1; }
      .rating-lbl { font-size: 10px; color: var(--text-secondary); font-weight: 600; }
      &.gold   { background: rgba(212,168,0,0.25); color: #f4c430; }
      &.silver { background: rgba(139,148,158,0.25); color: #c0c9d6; }
    }
    .hero-actions { display: flex; flex-direction: column; gap: 8px; }
    .pos-tag {
      font-size: 11px; font-weight: 600; color: var(--info);
      background: rgba(88,166,255,0.1); padding: 2px 6px; border-radius: 4px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
    .section-title {
      font-size: 14px; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;
    }
    .core-stats { display: flex; flex-direction: column; gap: 10px; }
    .stat-bar {
      display: grid; grid-template-columns: 80px 1fr 36px; align-items: center; gap: 10px;
    }
    .stat-name { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
    .bar-track {
      height: 8px; background: var(--bg-input); border-radius: 4px; overflow: hidden;
    }
    .bar-fill {
      height: 100%; border-radius: 4px; transition: width 0.6s ease;
      background: var(--info);
      &.good { background: var(--success); }
      &.medium { background: var(--warning); }
      &.low { background: var(--danger); }
    }
    .stat-val { font-size: 13px; font-weight: 600; text-align: right; }
    .chart-card { display: flex; flex-direction: column; }
    .chart-wrap { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 280px; }
    .details-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;
    }
    .detail-item {
      display: flex; flex-direction: column; gap: 2px;
      .detail-key { font-size: 11px; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
      .detail-val { font-size: 13px; font-weight: 500; }
    }
    .mt-16 { margin-top: 16px; }
  `],
})
export class PlayerDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;
  private route  = inject(ActivatedRoute);
  private playerService = inject(PlayerService);

  player: Player | null = null;
  loading = true;
  private chart: Chart | null = null;
  private chartReady = false;
  private playerReady = false;

  get coreStats() {
    if (!this.player) return [];
    return [
      { label: 'Pace',      value: this.player.pace      ?? 0 },
      { label: 'Shooting',  value: this.player.shooting  ?? 0 },
      { label: 'Passing',   value: this.player.passing   ?? 0 },
      { label: 'Dribbling', value: this.player.dribbling ?? 0 },
      { label: 'Defending', value: this.player.defending ?? 0 },
      { label: 'Physical',  value: this.player.physic    ?? 0 },
    ];
  }

  get allDetails() {
    if (!this.player) return [];
    return [
      { label: 'Value (EUR)',         value: this.player.value_eur ? `€${this.player.value_eur.toLocaleString()}` : null },
      { label: 'Wage (EUR)',          value: this.player.wage_eur  ? `€${this.player.wage_eur.toLocaleString()}`  : null },
      { label: 'Height (cm)',         value: this.player.height_cm },
      { label: 'Weight (kg)',         value: this.player.weight_kg },
      { label: 'Weak Foot',          value: this.player.weak_foot },
      { label: 'Skill Moves',        value: this.player.skill_moves },
      { label: 'Int. Reputation',    value: this.player.international_reputation },
      { label: 'Work Rate',          value: this.player.work_rate },
      { label: 'Body Type',          value: this.player.body_type },
      { label: 'Att. Crossing',      value: this.player.attacking_crossing },
      { label: 'Att. Finishing',     value: this.player.attacking_finishing },
      { label: 'Att. Heading',       value: this.player.attacking_heading_accuracy },
      { label: 'Att. Short Pass',    value: this.player.attacking_short_passing },
      { label: 'Skill Dribbling',    value: this.player.skill_dribbling },
      { label: 'Skill Ball Ctrl',    value: this.player.skill_ball_control },
      { label: 'Mov. Acceleration',  value: this.player.movement_acceleration },
      { label: 'Mov. Sprint Speed',  value: this.player.movement_sprint_speed },
      { label: 'Mov. Agility',       value: this.player.movement_agility },
      { label: 'Mov. Reactions',     value: this.player.movement_reactions },
      { label: 'Pow. Shot Power',    value: this.player.power_shot_power },
      { label: 'Pow. Stamina',       value: this.player.power_stamina },
      { label: 'Pow. Strength',      value: this.player.power_strength },
      { label: 'Men. Vision',        value: this.player.mentality_vision },
      { label: 'Men. Composure',     value: this.player.mentality_composure },
      { label: 'Def. Standing',      value: this.player.defending_standing_tackle },
      { label: 'Def. Sliding',       value: this.player.defending_sliding_tackle },
      { label: 'GK Diving',          value: this.player.goalkeeping_diving },
      { label: 'GK Handling',        value: this.player.goalkeeping_handling },
      { label: 'GK Reflexes',        value: this.player.goalkeeping_reflexes },
    ];
  }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.playerService.getPlayer(id).subscribe({
      next: p => {
        this.player  = p;
        this.loading = false;
        this.playerReady = true;
        this.tryBuildChart();
      },
      error: () => { this.loading = false; },
    });
  }

  ngAfterViewInit(): void {
    this.chartReady = true;
    this.tryBuildChart();
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  private tryBuildChart(): void {
    if (!this.playerReady || !this.chartReady || !this.player) return;
    setTimeout(() => this.buildRadar(), 0);
  }

  private buildRadar(): void {
    if (!this.radarCanvas) return;
    const p = this.player!;
    this.chart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'],
        datasets: [{
          label: p.long_name,
          data: [p.pace ?? 0, p.shooting ?? 0, p.passing ?? 0, p.dribbling ?? 0, p.defending ?? 0, p.physic ?? 0],
          backgroundColor: 'rgba(26,115,232,0.2)',
          borderColor: '#1a73e8',
          pointBackgroundColor: '#1a73e8',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1a73e8',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { display: false, stepSize: 20 },
            grid:  { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#8b949e', font: { size: 12 } },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
      },
    });
  }

  ratingClass(ovr: number): string {
    if (ovr >= 85) return 'gold';
    if (ovr >= 75) return 'silver';
    return '';
  }

  barClass(val: number): string {
    if (val >= 80) return 'good';
    if (val >= 60) return 'medium';
    return 'low';
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }
}

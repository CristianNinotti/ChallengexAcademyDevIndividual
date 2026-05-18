import { Component, inject, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService, TimelineResponse, AiAnalysis } from '../../services/player.service';
import {
  Chart, LineController, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const SKILL_OPTIONS = [
  { key: 'overall',       label: 'Overall'        },
  { key: 'potential',     label: 'Potential'       },
  { key: 'pace',          label: 'Pace'            },
  { key: 'shooting',      label: 'Shooting'        },
  { key: 'passing',       label: 'Passing'         },
  { key: 'dribbling',     label: 'Dribbling'       },
  { key: 'defending',     label: 'Defending'       },
  { key: 'physic',        label: 'Physical'        },
  { key: 'movement_acceleration', label: 'Acceleration' },
  { key: 'movement_sprint_speed', label: 'Sprint Speed' },
  { key: 'power_stamina', label: 'Stamina'         },
  { key: 'power_strength',label: 'Strength'        },
  { key: 'mentality_vision', label: 'Vision'       },
  { key: 'mentality_composure', label: 'Composure' },
  { key: 'skill_dribbling', label: 'Skill Drib.'  },
  { key: 'skill_ball_control', label: 'Ball Ctrl' },
];

@Component({
  selector: 'app-player-timeline',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, FormsModule],
  template: `
    <div class="page-container">
      <!-- Back -->
      <div class="mb-16">
        <a [routerLink]="['/players', playerId]" class="btn btn-ghost btn-sm" id="btn-back">← Back to Player</a>
      </div>

      <div class="loading-overlay" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading timeline…</p>
      </div>

      <ng-container *ngIf="!loading && timeline">
        <!-- Header -->
        <div class="page-header mb-24">
          <div>
            <h1 class="page-title">📈 Timeline</h1>
            <p class="text-muted">{{ timeline.player }}</p>
          </div>
          <span class="badge" [class]="'badge-' + timeline.gender">{{ timeline.gender }}</span>
        </div>

        <!-- Skill selector -->
        <div class="card mb-16">
          <div class="selector-row">
            <div class="form-group" style="flex:1; max-width: 280px;">
              <label for="skill-select">Skill to visualize</label>
              <select id="skill-select" class="form-control" [(ngModel)]="selectedSkill"
                (ngModelChange)="updateChart()">
                <option *ngFor="let s of skillOptions" [value]="s.key">{{ s.label }}</option>
              </select>
            </div>
            <div class="versions-info text-muted">
              {{ timeline.timeline.length }} FIFA edition(s) tracked
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="card mb-16 chart-card">
          <h2 class="section-title">{{ selectedSkillLabel }} over time</h2>
          <div class="chart-wrap">
            <canvas #lineCanvas id="timeline-chart"></canvas>
          </div>
        </div>

        <!-- AI Analysis -->
        <div class="card ai-card">
          <div class="ai-header">
            <span class="ai-badge">🤖 AI Analysis</span>
            <button class="btn btn-ghost btn-sm" (click)="loadAi()"
              [disabled]="aiLoading" id="btn-ai-analyze">
              {{ aiLoading ? 'Analyzing…' : aiAnalysis ? 'Re-analyze' : 'Generate Analysis' }}
            </button>
          </div>

          <div class="loading-overlay" *ngIf="aiLoading" style="padding: 30px;">
            <div class="spinner"></div>
            <p>Generating narrative…</p>
          </div>

          <div class="ai-narrative" *ngIf="aiAnalysis && !aiLoading">
            <p>{{ aiAnalysis.narrative }}</p>
            <span class="ai-source text-muted">Source: {{ aiAnalysis.source }}</span>
          </div>

          <div class="ai-placeholder" *ngIf="!aiAnalysis && !aiLoading">
            <p class="text-muted">Click "Generate Analysis" to get an AI-powered career narrative.</p>
          </div>
        </div>

        <!-- Timeline table -->
        <div class="card mt-16">
          <h2 class="section-title">Year by Year</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>FIFA</th>
                  <th>Age</th>
                  <th>Club</th>
                  <th>OVR</th>
                  <th>POT</th>
                  <th>Pace</th>
                  <th>Shoot</th>
                  <th>Pass</th>
                  <th>Drib</th>
                  <th>Def</th>
                  <th>Phy</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of timeline.timeline">
                  <td class="fw-600">{{ r['fifa_version'] }}</td>
                  <td class="text-muted">{{ r['age'] }}</td>
                  <td class="text-muted">{{ r['club_name'] || '—' }}</td>
                  <td><span class="rating-chip" [class]="ratingClass(r['overall'])">{{ r['overall'] }}</span></td>
                  <td class="text-muted">{{ r['potential'] }}</td>
                  <td>{{ r['pace'] }}</td>
                  <td>{{ r['shooting'] }}</td>
                  <td>{{ r['passing'] }}</td>
                  <td>{{ r['dribbling'] }}</td>
                  <td>{{ r['defending'] }}</td>
                  <td>{{ r['physic'] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;
    }
    .page-title { font-family: 'Inter Tight', sans-serif; font-size: 24px; font-weight: 700; }
    .section-title {
      font-size: 13px; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;
    }
    .selector-row { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
    .versions-info { font-size: 13px; padding-bottom: 4px; }
    .chart-card { min-height: 320px; }
    .chart-wrap { height: 300px; display: flex; align-items: center; justify-content: center; }
    .ai-card { }
    .ai-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .ai-badge {
      font-size: 13px; font-weight: 600; color: var(--accent);
      background: rgba(244,196,48,0.1); padding: 4px 12px; border-radius: 20px;
    }
    .ai-narrative {
      background: var(--bg-input); border-radius: var(--radius-sm); padding: 16px;
      p { line-height: 1.8; font-size: 14px; }
    }
    .ai-source { font-size: 11px; margin-top: 8px; display: block; }
    .ai-placeholder { padding: 20px 0; }
    .table-wrap { overflow-x: auto; }
    .mt-16 { margin-top: 16px; }
  `],
})
export class PlayerTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  private route = inject(ActivatedRoute);
  private ps    = inject(PlayerService);

  playerId   = 0;
  loading    = true;
  aiLoading  = false;
  timeline: TimelineResponse | null = null;
  aiAnalysis: AiAnalysis | null     = null;
  selectedSkill = 'overall';
  skillOptions  = SKILL_OPTIONS;
  private chart: Chart | null = null;
  private chartReady   = false;
  private timelineReady = false;

  get selectedSkillLabel(): string {
    return this.skillOptions.find(s => s.key === this.selectedSkill)?.label ?? this.selectedSkill;
  }

  ngOnInit(): void {
    this.playerId = +this.route.snapshot.paramMap.get('id')!;
    this.ps.getTimeline(this.playerId).subscribe({
      next: t => {
        this.timeline = t;
        this.loading  = false;
        this.timelineReady = true;
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
    if (!this.timelineReady || !this.chartReady || !this.timeline) return;
    setTimeout(() => this.buildChart(), 0);
  }

  private buildChart(): void {
    if (!this.lineCanvas) return;
    this.chart?.destroy();
    const t = this.timeline!;
    const labels = t.timeline.map(r => `FIFA ${r['fifa_version']}`);
    const data   = t.timeline.map(r => r[this.selectedSkill] ?? null);

    this.chart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: this.selectedSkillLabel,
          data,
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26,115,232,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1a73e8',
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#8b949e' },
          },
          y: {
            min: 0, max: 100,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#8b949e' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
      },
    });
  }

  updateChart(): void { this.buildChart(); }

  loadAi(): void {
    this.aiLoading = true;
    this.ps.getAiAnalysis(this.playerId).subscribe({
      next: a => { this.aiAnalysis = a; this.aiLoading = false; },
      error: () => { this.aiLoading = false; },
    });
  }

  ratingClass(ovr: number): string {
    if (ovr >= 85) return 'gold';
    if (ovr >= 75) return 'silver';
    return 'bronze';
  }
}

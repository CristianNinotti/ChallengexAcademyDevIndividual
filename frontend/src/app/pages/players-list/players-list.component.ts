import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { PlayerService, Player, PlayerQuery, PlayersResponse } from '../../services/player.service';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, FormsModule, DecimalPipe],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header mb-24">
        <div>
          <h1 class="page-title">Players</h1>
          <p class="text-muted" *ngIf="response">
            {{ response.total | number }} players found
          </p>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" (click)="exportFile('csv')" id="btn-export-csv" title="Export CSV">
            ⬇ CSV
          </button>
          <button class="btn btn-ghost btn-sm" (click)="exportFile('xlsx')" id="btn-export-xlsx" title="Export XLSX">
            ⬇ XLSX
          </button>
          <a routerLink="/players/create" class="btn btn-accent btn-sm" id="btn-create-player">
            + New Player
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-16">
        <div class="filters-grid">
          <div class="form-group">
            <label>Name</label>
            <input class="form-control" [(ngModel)]="filters.name"
              (ngModelChange)="onFilterChange()" placeholder="Search by name…" id="filter-name"/>
          </div>
          <div class="form-group">
            <label>Club</label>
            <input class="form-control" [(ngModel)]="filters.club"
              (ngModelChange)="onFilterChange()" placeholder="Club name…" id="filter-club"/>
          </div>
          <div class="form-group">
            <label>Position</label>
            <input class="form-control" [(ngModel)]="filters.position"
              (ngModelChange)="onFilterChange()" placeholder="ST, CM, GK…" id="filter-position"/>
          </div>
          <div class="form-group">
            <label>Nationality</label>
            <input class="form-control" [(ngModel)]="filters.nationality"
              (ngModelChange)="onFilterChange()" placeholder="Country…" id="filter-nationality"/>
          </div>
          <div class="form-group">
            <label>Gender</label>
            <select class="form-control" [(ngModel)]="filters.gender"
              (ngModelChange)="onFilterChange()" id="filter-gender">
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div class="form-group">
            <label>FIFA Version</label>
            <select class="form-control" [(ngModel)]="filters.fifa_version"
              (ngModelChange)="onFilterChange()" id="filter-version">
              <option value="">All</option>
              <option *ngFor="let v of fifaVersions" [value]="v">FIFA {{ v }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Min Overall</label>
            <input class="form-control" type="number" [(ngModel)]="filters.minOverall"
              (ngModelChange)="onFilterChange()" placeholder="0" min="0" max="99" id="filter-min-overall"/>
          </div>
          <div class="form-group">
            <label>Max Overall</label>
            <input class="form-control" type="number" [(ngModel)]="filters.maxOverall"
              (ngModelChange)="onFilterChange()" placeholder="99" min="0" max="99" id="filter-max-overall"/>
          </div>
        </div>
        <div class="filter-actions mt-auto">
          <button class="btn btn-ghost btn-sm" (click)="clearFilters()" id="btn-clear-filters">Clear filters</button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-overlay" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading players…</p>
      </div>

      <!-- Table -->
      <div class="card" *ngIf="!loading && response">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Positions</th>
                <th class="hide-mobile">Club</th>
                <th class="hide-mobile">Nationality</th>
                <th>OVR</th>
                <th class="hide-mobile">POT</th>
                <th class="hide-mobile">Age</th>
                <th class="hide-mobile">FIFA</th>
                <th>Gender</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of response.data"
                [routerLink]="['/players', p.id]"
                id="player-row-{{ p.id }}">
                <td>
                  <div class="player-cell">
                    <img *ngIf="p.player_face_url"
                      [src]="p.player_face_url"
                      class="player-avatar"
                      (error)="onImgError($event)"
                      alt="{{ p.long_name }}"
                    />
                    <div class="player-avatar-placeholder" *ngIf="!p.player_face_url">
                      {{ p.long_name[0] }}
                    </div>
                    <span class="fw-600">{{ p.long_name }}</span>
                  </div>
                </td>
                <td><span class="pos-tag">{{ p.player_positions }}</span></td>
                <td class="hide-mobile text-muted">{{ p.club_name || '—' }}</td>
                <td class="hide-mobile text-muted">{{ p.nationality_name || '—' }}</td>
                <td>
                  <span class="rating-chip" [class]="ratingClass(p.overall)">{{ p.overall }}</span>
                </td>
                <td class="hide-mobile text-muted">{{ p.potential }}</td>
                <td class="hide-mobile text-muted">{{ p.age }}</td>
                <td class="hide-mobile text-muted">{{ p.fifa_version }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + p.gender">{{ p.gender }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty -->
        <div class="empty-state" *ngIf="response.data.length === 0">
          <span class="empty-icon">🔍</span>
          <p>No players found with these filters</p>
          <button class="btn btn-ghost btn-sm" (click)="clearFilters()">Clear filters</button>
        </div>

        <!-- Pagination -->
        <div class="table-footer" *ngIf="response.totalPages > 1">
          <span class="text-muted">
            Page {{ response.page }} of {{ response.totalPages }}
          </span>
          <div class="pagination">
            <button (click)="goToPage(1)" [disabled]="response.page === 1" id="btn-first-page">«</button>
            <button (click)="goToPage(response.page - 1)" [disabled]="response.page === 1" id="btn-prev-page">‹</button>
            <button
              *ngFor="let pg of getPages()"
              (click)="goToPage(pg)"
              [class.active]="pg === response.page"
              [id]="'btn-page-' + pg"
            >{{ pg }}</button>
            <button (click)="goToPage(response.page + 1)" [disabled]="response.page === response.totalPages" id="btn-next-page">›</button>
            <button (click)="goToPage(response.totalPages)" [disabled]="response.page === response.totalPages" id="btn-last-page">»</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-title {
      font-family: 'Inter Tight', sans-serif;
      font-size: 24px;
      font-weight: 700;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }
    .filter-actions { display: flex; justify-content: flex-end; }
    .table-wrap { overflow-x: auto; }
    .player-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .player-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--bg-input);
    }
    .player-avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }
    .pos-tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--info);
      background: rgba(88,166,255,0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0 0;
      flex-wrap: wrap;
      gap: 8px;
    }
  `],
})
export class PlayersListComponent implements OnInit, OnDestroy {
  private playerService = inject(PlayerService);
  private destroy$ = new Subject<void>();
  private filterChange$ = new Subject<void>();

  response: PlayersResponse | null = null;
  loading = false;
  filters: PlayerQuery = { page: 1, limit: 20 };
  fifaVersions = ['15','16','17','18','19','20','21','22','23'];

  ngOnInit(): void {
    this.filterChange$.pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => { this.filters.page = 1; this.load(); });
    this.load();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;
    this.playerService.getPlayers(this.filters).subscribe({
      next: r => { this.response = r; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onFilterChange(): void { this.filterChange$.next(); }

  clearFilters(): void {
    this.filters = { page: 1, limit: 20 };
    this.load();
  }

  goToPage(p: number): void {
    if (!this.response) return;
    if (p < 1 || p > this.response.totalPages) return;
    this.filters.page = p;
    this.load();
  }

  getPages(): number[] {
    if (!this.response) return [];
    const cur = this.response.page;
    const total = this.response.totalPages;
    const pages: number[] = [];
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  exportFile(format: 'csv' | 'xlsx'): void {
    const url = this.playerService.exportUrl(format, this.filters);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fifa_players.${format}`;
    a.click();
  }

  ratingClass(ovr: number): string {
    if (ovr >= 85) return 'gold';
    if (ovr >= 75) return 'silver';
    return 'bronze';
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }
}

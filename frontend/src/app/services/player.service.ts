import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Player {
  id: number;
  long_name: string;
  player_positions: string;
  club_name: string;
  nationality_name: string;
  overall: number;
  potential: number;
  age: number;
  fifa_version: string;
  player_face_url: string;
  gender: 'male' | 'female';
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  preferred_foot?: string;
  value_eur?: number;
  wage_eur?: number;
  height_cm?: number;
  weight_kg?: number;
  weak_foot?: number;
  skill_moves?: number;
  international_reputation?: number;
  work_rate?: string;
  body_type?: string;
  attacking_crossing?: number;
  attacking_finishing?: number;
  attacking_heading_accuracy?: number;
  attacking_short_passing?: number;
  attacking_volleys?: number;
  skill_dribbling?: number;
  skill_curve?: number;
  skill_fk_accuracy?: number;
  skill_long_passing?: number;
  skill_ball_control?: number;
  movement_acceleration?: number;
  movement_sprint_speed?: number;
  movement_agility?: number;
  movement_reactions?: number;
  movement_balance?: number;
  power_shot_power?: number;
  power_jumping?: number;
  power_stamina?: number;
  power_strength?: number;
  power_long_shots?: number;
  mentality_aggression?: number;
  mentality_interceptions?: number;
  mentality_positioning?: number;
  mentality_vision?: number;
  mentality_penalties?: number;
  mentality_composure?: number;
  defending_marking?: number;
  defending_standing_tackle?: number;
  defending_sliding_tackle?: number;
  goalkeeping_diving?: number;
  goalkeeping_handling?: number;
  goalkeeping_kicking?: number;
  goalkeeping_positioning?: number;
  goalkeeping_reflexes?: number;
}

export interface PlayersResponse {
  data: Player[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimelineRecord {
  id: number;
  fifa_version: string;
  overall: number;
  potential: number;
  age: number;
  club_name: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  [key: string]: any;
}

export interface TimelineResponse {
  player: string;
  gender: string;
  timeline: TimelineRecord[];
}

export interface AiAnalysis {
  narrative: string;
  source: string;
}

export interface PlayerQuery {
  name?: string;
  club?: string;
  position?: string;
  nationality?: string;
  gender?: string;
  fifa_version?: string;
  minOverall?: number;
  maxOverall?: number;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/players`;

  getPlayers(query: PlayerQuery = {}): Observable<PlayersResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<PlayersResponse>(this.base, { params });
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.base}/${id}`);
  }

  getTimeline(id: number): Observable<TimelineResponse> {
    return this.http.get<TimelineResponse>(`${this.base}/${id}/timeline`);
  }

  getAiAnalysis(id: number): Observable<AiAnalysis> {
    return this.http.get<AiAnalysis>(`${this.base}/${id}/ai-analysis`);
  }

  createPlayer(data: Partial<Player>): Observable<Player> {
    return this.http.post<Player>(this.base, data);
  }

  updatePlayer(id: number, data: Partial<Player>): Observable<Player> {
    return this.http.patch<Player>(`${this.base}/${id}`, data);
  }

  exportUrl(format: 'csv' | 'xlsx', query: PlayerQuery = {}): string {
    const params = new HttpParams({ fromObject: this.cleanQuery(query) });
    const token = localStorage.getItem('fifa_token') ?? '';
    return `${this.base}/export/${format}?${params.toString()}&token=${token}`;
  }

  private cleanQuery(q: PlayerQuery): Record<string, string> {
    const out: Record<string, string> = {};
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') out[k] = String(v);
    });
    return out;
  }
}

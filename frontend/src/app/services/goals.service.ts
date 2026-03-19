import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SavingsGoal {
  id: string;
  childId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalDto {
  name: string;
  targetAmount: number;
  emoji?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface UpdateSavingsGoalDto {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  emoji?: string;
  priority?: 'high' | 'medium' | 'low';
  isCompleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private apiUrl = `${environment.apiUrl}/savings-goals`;

  constructor(private http: HttpClient) {}

  getGoals(childId: string): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(`${this.apiUrl}/${childId}`);
  }

  createGoal(childId: string, dto: CreateSavingsGoalDto): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${this.apiUrl}/${childId}`, dto);
  }

  updateGoal(id: string, dto: UpdateSavingsGoalDto): Observable<SavingsGoal> {
    return this.http.patch<SavingsGoal>(`${this.apiUrl}/${id}`, dto);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addToGoal(id: string, amount: number): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${this.apiUrl}/${id}/add`, { amount });
  }
}

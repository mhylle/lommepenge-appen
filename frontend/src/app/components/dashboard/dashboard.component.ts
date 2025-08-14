import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { HelloWorld } from '../../hello-world/hello-world';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    HelloWorld
  ],
  template: `
    <div class="dashboard-container">
      <!-- Hello World Component -->
      <app-hello-world></app-hello-world>
      
      <h1>Task Dashboard</h1>
      
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon>assignment</mat-icon>
            <mat-card-title>Total Tasks</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-number">{{ totalTasks }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon>check_circle</mat-icon>
            <mat-card-title>Completed</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-number">{{ completedTasks }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon>schedule</mat-icon>
            <mat-card-title>In Progress</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-number">{{ inProgressTasks }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon>priority_high</mat-icon>
            <mat-card-title>High Priority</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-number">{{ highPriorityTasks }}</span>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="actions-section">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/tasks/new">
            <mat-icon>add</mat-icon>
            New Task
          </button>
          <button mat-raised-button color="accent" routerLink="/tasks">
            <mat-icon>list</mat-icon>
            View All Tasks
          </button>
        </div>
      </div>

      <div class="recent-tasks">
        <h2>Recent Tasks</h2>
        <mat-card *ngFor="let task of recentTasks" class="task-card">
          <mat-card-header>
            <mat-card-title>{{ task.title }}</mat-card-title>
            <mat-card-subtitle>{{ task.priority }} Priority</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ task.description }}</p>
            <mat-chip-listbox>
              <mat-chip [color]="getStatusColor(task.status)" selected>
                {{ task.status }}
              </mat-chip>
            </mat-chip-listbox>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalTasks = 0;
  completedTasks = 0;
  inProgressTasks = 0;
  highPriorityTasks = 0;
  
  recentTasks = [
    {
      id: 1,
      title: 'Setup Development Environment',
      description: 'Configure Docker and development tools',
      status: 'In Progress',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Design Database Schema',
      description: 'Create tables for task management',
      status: 'Completed',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'Implement Authentication',
      description: 'Add user login and registration',
      status: 'Pending',
      priority: 'High'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.calculateStats();
  }

  private calculateStats(): void {
    this.totalTasks = this.recentTasks.length;
    this.completedTasks = this.recentTasks.filter(task => task.status === 'Completed').length;
    this.inProgressTasks = this.recentTasks.filter(task => task.status === 'In Progress').length;
    this.highPriorityTasks = this.recentTasks.filter(task => task.priority === 'High').length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'primary';
      case 'In Progress': return 'accent';
      case 'Pending': return 'warn';
      default: return '';
    }
  }
}

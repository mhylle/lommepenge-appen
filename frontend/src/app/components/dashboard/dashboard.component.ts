import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HelloWorld } from '../../hello-world/hello-world';
import { MessageService } from '../../services/message.service';
import { Message, CreateMessage } from '../../models/message';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    HelloWorld
  ],
  template: `
    <div class="dashboard-container">
      <!-- Hello World Component -->
      <app-hello-world></app-hello-world>
      
      <h1>Task Dashboard</h1>

      <!-- Database Connectivity Test Section -->
      <mat-card class="database-test-section">
        <mat-card-header>
          <mat-icon>storage</mat-icon>
          <mat-card-title>🔗 Database Connectivity Test</mat-card-title>
          <mat-card-subtitle>Verify "hole through" to PostgreSQL database</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <!-- Message Form -->
          <div class="message-form">
            <h4>📝 Test Data Entry</h4>
            <form (ngSubmit)="onSubmit()" #messageForm="ngForm">
              <mat-form-field appearance="outline" style="width: 200px; margin-right: 10px;">
                <mat-label>Your Name</mat-label>
                <input matInput [(ngModel)]="newMessage.author" name="author" placeholder="Optional">
              </mat-form-field>
              
              <mat-form-field appearance="outline" style="width: 300px; margin-right: 10px;">
                <mat-label>Test Message</mat-label>
                <textarea matInput [(ngModel)]="newMessage.content" name="content" required rows="2" placeholder="Enter a test message..."></textarea>
              </mat-form-field>
              
              <div style="margin-top: 10px;">
                <button mat-raised-button color="primary" type="submit" [disabled]="loading || !newMessage.content.trim()">
                  <mat-icon>save</mat-icon>
                  {{ loading ? 'Saving...' : 'Save to Database' }}
                </button>
                <button mat-stroked-button type="button" (click)="loadMessages()" [disabled]="loading" style="margin-left: 10px;">
                  <mat-icon>refresh</mat-icon>
                  Refresh
                </button>
              </div>
            </form>
            
            <div *ngIf="error" class="error-message" style="color: red; margin-top: 10px;">
              ❌ {{ error }}
            </div>
          </div>

          <!-- Messages Display -->
          <div class="messages-display" style="margin-top: 20px;">
            <h4>📋 Saved Messages from Database</h4>
            
            <div *ngIf="loading" style="text-align: center; padding: 20px;">
              Loading messages...
            </div>
            
            <div *ngIf="!loading && messages.length === 0" style="text-align: center; padding: 20px; color: #666;">
              No messages yet. Add the first one to test database connectivity!
            </div>
            
            <div *ngIf="!loading && messages.length > 0" class="messages-list">
              <mat-card *ngFor="let message of messages" style="margin-bottom: 10px;">
                <mat-card-content>
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <strong>{{ message.author || 'Anonymous' }}</strong>
                      <small style="color: #666; margin-left: 10px;">{{ message.createdAt | date:'medium' }}</small>
                      <p style="margin: 5px 0;">{{ message.content }}</p>
                    </div>
                    <button mat-icon-button color="warn" (click)="deleteMessage(message.id)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            
            <div *ngIf="messages.length > 0" style="margin-top: 15px; padding: 10px; background-color: #e8f5e8; border-radius: 4px;">
              ✅ <strong>Database connectivity confirmed!</strong> Successfully retrieving {{ messages.length }} message(s) from PostgreSQL.
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
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

  // Message functionality
  messages: Message[] = [];
  newMessage: CreateMessage = { content: '', author: '' };
  loading = false;
  error = '';
  
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

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.calculateStats();
    this.loadMessages();
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

  // Message management methods
  loadMessages() {
    this.loading = true;
    this.error = '';
    
    this.messageService.getAllMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.error = 'Error loading messages. Please check if the backend is running.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (!this.newMessage.content?.trim()) {
      this.error = 'Please enter a message';
      return;
    }

    this.loading = true;
    this.error = '';

    const messageToSend = {
      content: this.newMessage.content.trim(),
      author: this.newMessage.author?.trim() || 'Anonymous'
    };

    this.messageService.createMessage(messageToSend).subscribe({
      next: (savedMessage) => {
        this.messages.unshift(savedMessage);
        this.newMessage = { content: '', author: '' };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving message:', error);
        this.error = 'Error saving message. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteMessage(id: number) {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== id);
      },
      error: (error) => {
        console.error('Error deleting message:', error);
        this.error = 'Error deleting message. Please try again.';
      }
    });
  }
}

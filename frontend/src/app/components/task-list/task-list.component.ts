import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="task-list-container">
      <h1>Task List</h1>
      <p>Task list functionality would be implemented here.</p>
      <button mat-raised-button color="primary" routerLink="/tasks/new">
        <mat-icon>add</mat-icon>
        Add New Task
      </button>
    </div>
  `,
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {}

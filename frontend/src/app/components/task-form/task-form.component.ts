import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatButtonModule, 
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="task-form-container">
      <h1>Task Form</h1>
      <p>Task form functionality would be implemented here.</p>
      <button mat-raised-button color="primary" routerLink="/tasks">
        <mat-icon>arrow_back</mat-icon>
        Back to Tasks
      </button>
    </div>
  `,
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {}

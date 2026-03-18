import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ChildCredentialsData {
  childName: string;
  username: string;
  pin: string;
  isReset?: boolean;
}

@Component({
  selector: 'app-child-credentials-modal',
  standalone: false,
  templateUrl: './child-credentials-modal.component.html',
  styleUrls: ['./child-credentials-modal.component.scss']
})
export class ChildCredentialsModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ChildCredentialsData,
    private dialogRef: MatDialogRef<ChildCredentialsModalComponent>,
    private snackBar: MatSnackBar
  ) {}

  getTitle(): string {
    return this.data.isReset
      ? `Ny PIN-kode for ${this.data.childName}`
      : `Login-oplysninger for ${this.data.childName}`;
  }

  copyUsername(): void {
    navigator.clipboard.writeText(this.data.username).then(() => {
      this.snackBar.open('Brugernavn kopieret!', 'Luk', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    });
  }

  copyPin(): void {
    navigator.clipboard.writeText(this.data.pin).then(() => {
      this.snackBar.open('PIN-kode kopieret!', 'Luk', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

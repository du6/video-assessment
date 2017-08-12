import { Component, Inject, Optional } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: 'confirmation-dialog.component.html',
  styleUrls: ['confirmation-dialog.component.scss'],
})
export class ConfirmationDialog {
  constructor(
    @Optional() private _dialogRef: MdDialogRef<ConfirmationDialog>,
    @Inject(MD_DIALOG_DATA) public content: string) { 
  }

  cancel(event: any) {
    this._dialogRef.close(false);
  }

  confirm(event: any) {
    this._dialogRef.close(true);
  }
}
import { Component, destroyPlatform, Optional } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MdDialogRef } from '@angular/material';

@Component({
  templateUrl: 'add-comment-dialog.component.html',
  styleUrls: ['add-comment-dialog.component.scss'],
})
export class AddCommentDialog {
  nodeForm: FormGroup;
  name: FormControl;
  description: FormControl;

  constructor(
    @Optional() private _dialogRef: MdDialogRef<AddCommentDialog>,
    private _fb: FormBuilder,) { 
    this.name = new FormControl('', Validators.maxLength(100));
    this.description = new FormControl('', Validators.maxLength(500));

    this.nodeForm = _fb.group({
      name: this.name,
      description: this.description,
    });
  }

  cancel(event: any) {
    this._dialogRef.close();
  }

  confirm(event: any) {
    // Prevent page reloading
    event.preventDefault();
    this._dialogRef.close({
      name: this.name.value,
      description: this.description.value,
    });
  }
}
import { ToPromiseSignature } from 'rxjs/operator/toPromise';
import { Component, Optional } from '@angular/core';
import { GapiService } from '../services/gapi.service';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';

import { AddCommentDialog } from './add-comment-dialog.component';


@Component({
  selector: 'video-assessment-comments',
  templateUrl: 'comments.component.html',
  styleUrls: ['comments.component.scss'],
})
export class CommentsComponent {
  constructor(private gapi_: GapiService, private _dialog: MdDialog, private _snackbar: MdSnackBar) {
  }
}
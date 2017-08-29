import { Component } from '@angular/core';
import { MdSnackBar } from '@angular/material';

import { GapiService } from '../services/gapi.service';

@Component({
  templateUrl: 'feedback.component.html',
  styleUrls: ['feedback.component.scss'],
})
export class FeedbackComponent {
  feedback: string = "";
  sending: boolean = false;

  constructor(
    private gapi_: GapiService,
    private snackBar_: MdSnackBar) { 
  }

  send() {
    this.sending = true;
    this.gapi_.sendFeedback(this.feedback)
        .then(() => {
          this.feedback = "";
          this.sending = false;
        })
        .catch(error => {
          this.sending = false;
          this.snackBar_.open('Error sending feedback!', 'Dismiss', {duration: 2000})
        });
  }
}
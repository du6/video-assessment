import { Component, Optional, Input, ChangeDetectorRef } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Video } from '../common/video';

@Component({
  templateUrl: 'update-supporters-dialog.component.html',
  styleUrls: ['update-supporters-dialog.component.scss'],
})
export class UpdateSupportersDialog {
  videoKey: string;
  loading: boolean = false;
  submitting: boolean = false;
  supporters: List<string> = List<string>();

  constructor(
    @Optional() private _dialogRef: MdDialogRef<UpdateSupportersDialog>,
    private gapi_: GapiService,
    private changeDetectorRef_: ChangeDetectorRef) { 
  }

  ngOnInit() {
    this.loadSupporters();
  }

  private loadSupporters() {
    this.loading = true;
    this.gapi_.getVideoByKey(this.videoKey)
        .then((video: Video) => {
          this.supporters = List(video.supporters); 
        }, () => this.loading = false)
        .then(() => this.loading = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  cancel(event: any) {
    this._dialogRef.close();
  }

  confirm(event: any) {
    this.submitting = true;
    // Prevent page reloading
    event.preventDefault();
    this.gapi_.updateSupporters(this.videoKey, this.supporters.toArray())
        .then(() => this._dialogRef.close());
  }

  addSupporter(supporter: string) {
    if (supporter.length == 0) {
      return;
    }
    this.supporters = this.supporters.unshift(supporter.toLowerCase());
    this.changeDetectorRef_.detectChanges();
  }

  deleteSupporter(index: number) {
    this.supporters = this.supporters.delete(index);
    this.changeDetectorRef_.detectChanges();
  }
}
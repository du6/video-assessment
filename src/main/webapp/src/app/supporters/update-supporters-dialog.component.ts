import { Component, Optional, Input, ChangeDetectorRef } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Video } from '../common/video';
import { Invitation } from '../common/invitation';

@Component({
  templateUrl: 'update-supporters-dialog.component.html',
  styleUrls: ['update-supporters-dialog.component.scss'],
})
export class UpdateSupportersDialog {
  supporterEmail: string;
  videoKey: string;
  loading: boolean = false;
  adding: boolean = false;
  deleting: boolean = false;
  invitations: List<Invitation> = List<Invitation>();

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
    this.gapi_.loadInvitations(this.videoKey)
        .then((invitations: Invitation[]) => {
          this.invitations = List(invitations); 
        }, () => this.loading = false)
        .then(() => this.loading = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  close(event: any) {
    this._dialogRef.close();
  }

  addSupporter() {
    if (this.supporterEmail.length == 0) {
      return;
    }
    this.adding = true;
    this.gapi_.inviteSupporter(this.videoKey, this.supporterEmail)
        .then((invitation: Invitation) => {
          this.supporterEmail = "";
          this.adding = false;
          this.invitations = this.invitations.unshift(invitation);
        }, () => this.adding = false)
        .then(() => this.adding = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  deleteSupporter(index: number) {
    this.deleting = true;
    this.gapi_.deleteSupporter(this.invitations.get(index).id)
        .then(() => {
          this.deleting = false;
          this.invitations = this.invitations.delete(index);
        }, () => this.deleting = false)
        .then(() => this.deleting = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }
}
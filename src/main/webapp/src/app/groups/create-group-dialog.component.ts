import { Component, Optional, Input, ChangeDetectorRef } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Group } from '../common/group';

@Component({
  templateUrl: 'create-group-dialog.component.html',
  styleUrls: ['create-group-dialog.component.scss'],
})
export class CreateGroupDialog {
  name: string;
  memberEmail: string;
  submitting: boolean = false;
  members: List<string> = List<string>();

  constructor(
    @Optional() private _dialogRef: MdDialogRef<CreateGroupDialog>,
    private gapi_: GapiService,
    private changeDetectorRef_: ChangeDetectorRef) { 
  }

  cancel(event: any) {
    this._dialogRef.close();
  }

  confirm(event: any) {
    this.submitting = true;
    // Prevent page reloading
    event.preventDefault();
    this.gapi_.createGroupWithMembers(this.name, this.members.toArray())
        .then((group: Group) => this._dialogRef.close(group));
  }

  addMember(member: string) {
    if (member.length == 0) {
      return;
    }
    this.members = this.members.unshift(member.toLowerCase());
    this.memberEmail = '';
    this.changeDetectorRef_.detectChanges();
  }

  deleteMember(index: number) {
    this.members = this.members.delete(index);
    this.changeDetectorRef_.detectChanges();
  }
}
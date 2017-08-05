import { Component, ChangeDetectorRef } from '@angular/core';
import { List } from 'immutable';
import { MdDialog, MdDialogRef } from '@angular/material';

import { GapiService } from '../services/gapi.service';
import { Group } from '../common/group';
import { CreateGroupDialog } from '../groups/create-group-dialog.component';

@Component({
  selector: 'video-assessment-groups',
  templateUrl: 'groups.component.html',
  styleUrls: ['groups.component.scss'],
})
export class GroupsComponent {
  loadingOwnedGroups: boolean;
  loadingJoinedGroups: boolean;
  myOwnedGroups: List<Group> = List<Group>();
  myJoinedGroups: List<Group> = List<Group>();
  
  private dialogRef_: MdDialogRef<CreateGroupDialog> | null;

  constructor(private changeDetectorRef_: ChangeDetectorRef, 
    private gapi_: GapiService, 
    private _dialog: MdDialog) {
  }

  ngOnInit() {
    this.loadMyOwnedGroups();
    this.loadMyJoinedGroups();
  }

  private loadMyOwnedGroups() {
    this.loadingOwnedGroups = true;
    this.gapi_.loadMyOwnedGroups()
        .then((items) => this.myOwnedGroups = List<Group>(items), () => this.loadingOwnedGroups = false)
        .then(() => this.loadingOwnedGroups = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  private loadMyJoinedGroups() {
    this.loadingJoinedGroups = true;
    this.gapi_.loadMyJoinedGroups()
        .then((items) => this.myJoinedGroups = List<Group>(items), () => this.loadingJoinedGroups = false)
        .then(() => this.loadingJoinedGroups = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  onGroupAdded(group: Group) {
    this.addGroup_(group);
  }

  onOwnedGroupDeleted(groupId: number) {
    this.deleteOwnedGroup_(groupId);
  }

  onJoinedGroupDeleted(groupId: number) {
    this.deleteJoinedGroup_(groupId);
  }

  private addGroup_(group: Group) {
    this.myOwnedGroups = this.myOwnedGroups.unshift(group);
    //TODO(du6): update view automatically
    this.changeDetectorRef_.detectChanges();
  }

  private deleteOwnedGroup_(groupId: number) {
    const index = this.myOwnedGroups.findIndex((group) => group.id === groupId);
    if (index >= 0) {
      this.myOwnedGroups = this.myOwnedGroups.delete(index);
      this.changeDetectorRef_.detectChanges();
    }
  }

  private deleteJoinedGroup_(groupId: number) {
    const index = this.myJoinedGroups.findIndex((group) => group.id === groupId);
    if (index >= 0) {
      this.myJoinedGroups = this.myJoinedGroups.delete(index);
      this.changeDetectorRef_.detectChanges();
    }
  }

  openCreateGroupDialog(event: any) {
    event.stopPropagation();
    this.dialogRef_ = this._dialog.open(CreateGroupDialog);
    this.dialogRef_.afterClosed().subscribe((group: Group) => {
      if (group != null) {
        this.addGroup_(group);
      }});
  }
}

import {
  Input,
  Output,
  Component, 
  EventEmitter, 
  ViewContainerRef
} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

import { Group } from '../common/group';
import { GapiService } from '../services/gapi.service';
import { UpdateSupportersDialog } from '../supporters/update-supporters-dialog.component';

@Component({
  selector: 'video-assessment-group-item',
  templateUrl: 'group-item.component.html',
  styleUrls: ['group-item.component.scss'],
})
export class GroupItemComponent {
  @Input() group: Group;
  @Input() canManageGroup: boolean;
  @Output() groupDeleted: EventEmitter<Group> = new EventEmitter<Group>();
  private _dialogRef: MdDialogRef<any>;

  constructor(private gapi_: GapiService, private _dialog: MdDialog){}

  deleteGroup(event: any) {
    event.stopPropagation();
    if (this.canManageGroup) {
      this.gapi_.deleteGroup(this.group.id)
        .then(() => {
          this.groupDeleted.emit(this.group);
        });
    } else {
      this.gapi_.deleteMember(this.group.id)
        .then(() => {
          this.groupDeleted.emit(this.group);
        });
    }
  }
}
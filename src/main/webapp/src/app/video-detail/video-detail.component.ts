import {
  Input,
  Output,
  Component, 
  EventEmitter, 
  ViewContainerRef
} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

import { Video } from '../common/video';
import { GapiService } from '../services/gapi.service';
import { UpdateSupportersDialog } from '../supporters/update-supporters-dialog.component';

@Component({
  selector: 'video-assessment-video-detail',
  templateUrl: 'video-detail.component.html',
  styleUrls: ['video-detail.component.scss'],
})
export class VideoDetailComponent {
  @Input() video: Video;
  @Output() videoDeleted: EventEmitter<Video> = new EventEmitter<Video>();
  private _dialogRef: MdDialogRef<any>;

  constructor(private gapi_: GapiService, private _dialog: MdDialog){}

  deleteVideo(event: any) {
    event.stopPropagation();
    this.gapi_.deleteVideoByKey(this.video.id)
        .then(() => {
          this.videoDeleted.emit(this.video);
        });
  }

  openUpdateSupportersDialog(event: any) {
    event.stopPropagation();
    this._dialogRef = this._dialog.open(UpdateSupportersDialog);
    this._dialogRef.componentInstance.videoKey = this.video.id;
  }
}
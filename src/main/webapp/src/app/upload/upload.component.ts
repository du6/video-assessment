import { Component, Input, Output, EventEmitter, Optional, ChangeDetectorRef } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

import { AuthService } from '../services/auth.service';
import { UploadService } from '../services/upload.service';
import { GapiService } from '../services/gapi.service';
import { ConfirmationDialog } from '../confirmation/confirmation-dialog.component';
import { Video } from '../common/video';

@Component({
  selector: 'video-assessment-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss'],
})
export class UploadComponent {
  @Input() groupId: number;
  @Input() topicId: number;
  @Input() member: string;
  @Input() shouldDisableUpload: boolean;
  @Input() confirmation: string;
  @Output() videoUploaded: EventEmitter<Video> = new EventEmitter<Video>();

  isFileValid: boolean = false;
  isLargeFile: boolean = false;
  title: string;
  file: File;
  uploading: boolean = false;
  progress: number = 0;
  private _uploadUrl: string;

  constructor(private gapi_: GapiService, 
    private _upload: UploadService, 
    private _auth: AuthService,
    private changeDetectorRef_: ChangeDetectorRef,
    private _dialog: MdDialog,
    @Optional() private dialogRef_: MdDialogRef<ConfirmationDialog>) {
  }

  ngAfterViewInit() {
    this.gapi_.getUploadUrl().then(url => this._uploadUrl = url);
  }

  onFileChange(event: EventTarget) {
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      this.file = files[0];
      if (this.file && this.file.size <= 50000000) {
        this.isFileValid = true;
        this.isLargeFile = false;
      } else if (this.file && this.file.size > 50000000) {
        this.isLargeFile = true;
      }
  }

  submit(event: any) {
    // Prevent page reloading
    event.preventDefault();
    if (!!this.confirmation) {
      this.dialogRef_ = this._dialog.open(ConfirmationDialog, {data: this.confirmation});
      this.dialogRef_.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.uploadVideo_();
        }});
    } else {
      this.uploadVideo_();
    }
  }

  private uploadVideo_() {
    this.uploading = true;
    if (!this.title) {
      this.title = this.file.name;
    }
    let uploadFormData = new FormData();
    uploadFormData.append('file', this.file, this.file.name);
    uploadFormData.append('title', this.title);
    uploadFormData.append('email', !!this.member ? this.member : this._auth.getUserEmail());
    if (!!this.groupId) {
      uploadFormData.append('groupId', this.groupId.toString());
    }
    if (!!this.topicId) {
      uploadFormData.append('topicId', this.topicId.toString());
    }
    this._upload.uploadVideo(this._uploadUrl, uploadFormData).then(
      (blobKey) => {
        this.uploading = false;
        let video = new Video();
        video.title = this.title;
        video.id = blobKey;
        this.videoUploaded.emit(video);
        this.title = '';
      }
    );

    this._upload.progressObservable.subscribe(progress => {
      this.progress = progress;
      this.changeDetectorRef_.detectChanges();
    });

    this.changeDetectorRef_.detectChanges();    
  }
}

import { Component, Output, EventEmitter } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { UploadService } from '../services/upload.service';
import { GapiService } from '../services/gapi.service';
import { Video } from '../common/video';

@Component({
  selector: 'video-assessment-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss'],
})
export class UploadComponent {
  @Output() videoUploaded: EventEmitter<Video> = new EventEmitter<Video>();

  title: string;
  file: File;
  disable: boolean = false;
  progress: number = 0;
  private _uploadUrl: string;

  constructor(private gapi_: GapiService, private _upload: UploadService, private _auth: AuthService) {
  }

  ngAfterViewInit() {
    this.gapi_.getUploadUrl().then(url => this._uploadUrl = url);
  }

  onFileChange(event: EventTarget) {
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      this.file = files[0];
  }

  submit(event: any) {
    // Prevent page reloading
    event.preventDefault();
    this.disable = true;
    if (!this.title) {
      this.title = this.file.name;
    }
    let uploadFormData = new FormData();
    uploadFormData.append('file', this.file, this.file.name);
    uploadFormData.append('title', this.title);
    uploadFormData.append('email', this._auth.getUserEmail());
    this._upload.uploadVideo(this._uploadUrl, uploadFormData).then(
      (blobKey) => {
        this.disable = false;
        let video = new Video();
        video.title = this.title;
        video.id = blobKey;
        this.videoUploaded.emit(video);
        this.title = '';
      }
    );

    this._upload.progressObservable.subscribe(progress => {
      this.progress = progress;
    });
  }
}

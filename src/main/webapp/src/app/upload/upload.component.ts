import { Component, Input, Output, EventEmitter, Optional, SimpleChange, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { List } from 'immutable';
import * as FileSaver from 'file-saver';

import { AuthService } from '../services/auth.service';
import { UploadService } from '../services/upload.service';
import { GapiService } from '../services/gapi.service';
import { ConfirmationDialog } from '../confirmation/confirmation-dialog.component';
import { Video } from '../common/video';
import { Template } from '../common/template';

@Component({
  selector: 'video-assessment-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss'],
})
export class UploadComponent {
  @Input() groupId: number;
  @Input() topicId: number;
  @Input() template: Template;
  @Input() member: string;
  @Input() shouldDisableUpload: boolean;
  @Input() isMcginnis: boolean;
  @Input() confirmation: string;
  @Output() videoUploaded: EventEmitter<Video> = new EventEmitter<Video>();

  templates: List<Template> = List<Template>();
  selectedTemplate: Template;
  isFileValid: boolean = false;
  isLargeFile: boolean = false;
  title: string;
  file: File;
  uploading: boolean = false;
  loadingTemplates: boolean = true;
  progress: number = 0;
  private _uploadUrl: string;

  public camReady = false;
  public isLive = true;
  public isRecording = false;
  public webcam;
  public options = {
    audio: true,
    video: true,
    width: 640,
    height: 480,
    fallbackSrc: 'jscam_canvas_only.swf',
  };
  private chunks: any = [];
  private mediaRecorder: any;

  constructor(private gapi_: GapiService, 
    private _upload: UploadService, 
    private _auth: AuthService,
    private changeDetectorRef_: ChangeDetectorRef,
    private _dialog: MdDialog,
    private snackBar_: MdSnackBar,
    @Optional() private dialogRef_: MdDialogRef<ConfirmationDialog>) {
  }

  ngOnInit() {
    if (!this.template) {
      this.loadingTemplates = true;
      this.gapi_.loadTemplates().then(templates => {
        this.templates = List<Template>(templates);
        this.selectedTemplate = templates[0];
        this.loadingTemplates = false;
      });
    } else {
      this.selectedTemplate = this.template;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.template && changes.template.currentValue) {
      const templateChange: SimpleChange = changes.template;
      this.selectedTemplate = templateChange.currentValue;
    }
  }

  getUploadUrl() {
    return this.gapi_.getUploadUrl().then(url => this._uploadUrl = url);
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
    uploadFormData.append('templateId', this.selectedTemplate.id.toString());
    this.getUploadUrl()
        .then(() => this._upload.uploadVideo(this._uploadUrl, uploadFormData)
            .then(
              (blobKey) => {
                this.uploading = false;
                let video = new Video();
                video.title = this.title;
                video.id = blobKey;
                this.videoUploaded.emit(video);
                this.title = '';
              }
            )
            .catch(error => {
              this.uploading = false;
              this.snackBar_.open('Error uploading video!', 'Dismiss', {duration: 2000})
            }));

    this._upload.progressObservable.subscribe(progress => {
      this.progress = progress;
      this.changeDetectorRef_.detectChanges();
    });

    this.changeDetectorRef_.detectChanges();    
  }

  onCamError(err){}
  
  onCamSuccess(stream: any){    
    this.mediaRecorder = new MediaRecorder(stream);
    
    this.mediaRecorder.onstop = e => {
      const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
      this.file = new File([blob], this.title || "video.ogg");
      this.title = this.file.name;
      this.chunks.length = 0;      
      this.isRecording = false;
      this.isFileValid = true;
      this.changeDetectorRef_.detectChanges();
    };

    this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);

    setTimeout(() => {
      //TODO: investigate why cam is not ready immediately.
      this.camReady = true;
      this.changeDetectorRef_.detectChanges();    
    }, 20000);
  }

  startRecord() {
    this.isRecording = true;
    this.mediaRecorder.start();
    this.isFileValid = false;
  }

  stopRecord() {
    this.mediaRecorder.stop();
  }

  readyToUpload() {
    return !this.uploading && !this.isRecording && this.isFileValid && !this.shouldDisableUpload;
  }
}

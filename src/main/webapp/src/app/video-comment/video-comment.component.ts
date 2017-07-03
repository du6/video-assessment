import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Template } from '../common/template';

@Component({
  selector: 'video-assessment-video-comment',
  templateUrl: 'video-comment.component.html',
  styleUrls: ['video-comment.component.scss'],
})
export class VideoCommentComponent implements OnInit, OnDestroy {
  blobkey: string;
  sub: any
  templateId: number;
  questions: List<string> = List<string>();
  comments: string[] = [];
  scores: number[] = [];
  loading: boolean = false;
  submitting: boolean = false;

  constructor(
      private _route: ActivatedRoute, 
      private gapi_: GapiService, 
      private changeDetectorRef_: ChangeDetectorRef,) {}

  ngOnInit() {
    this.sub = this._route.params.subscribe(params => {
       this.blobkey = params['blobkey'];
    });
    this.loadTemplate();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private loadTemplate() {
    this.loading = true;
    this.gapi_.loadTemplate()
        .then((template: Template) => {
          this.templateId = template.id; 
          this.questions = List(template.questions);
          this.comments = new Array(this.questions.size);
          this.scores = new Array(this.questions.size);
          this.clearResponse();
        }, () => this.loading = false)
        .then(() => this.loading = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  private clearResponse() {
    this.comments.fill('');
    this.scores.fill(0);    
  }

  submit() {
    this.submitting = true;
    this.gapi_.submitResponses(this.blobkey, this.templateId, this.comments, this.scores)
        .then(() => {
          this.clearResponse();
          this.submitting = false;
        }, () => this.submitting = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }
}

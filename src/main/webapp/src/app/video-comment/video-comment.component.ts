import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Template } from '../common/template';
import { Assessment } from '../common/assessment';

@Component({
  selector: 'video-assessment-video-comment',
  templateUrl: 'video-comment.component.html',
  styleUrls: ['video-comment.component.scss'],
})
export class VideoCommentComponent implements OnInit, OnDestroy {
  blobkey: string;
  sub: any;
  templateId: number;
  questions: List<string> = List<string>();
  assessments: Map<number, List<Assessment>> = new Map();
  comments: string[] = [];
  scores: number[] = [];
  loadingTemplate: boolean = false;
  loadingAssessments: boolean = false;
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
    this.loadAssessments();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private loadTemplate() {
    this.loadingTemplate = true;
    this.gapi_.loadTemplate()
        .then((template: Template) => {
          this.templateId = template.id; 
          this.questions = List(template.questions);
          this.comments = new Array(this.questions.size);
          this.scores = new Array(this.questions.size);
          this.clearResponse();
        }, () => this.loadingTemplate = false)
        .then(() => this.loadingTemplate = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  private loadAssessments() {
    this.assessments.clear();
    this.loadingAssessments = true;
    this.gapi_.loadAssessments(this.blobkey)
        .then((assessments: Assessment[]) => {
          assessments = assessments || [];
          assessments.forEach((assessment: Assessment) => {
            const questionId = assessment.questionId;
            if (this.assessments && this.assessments.has(questionId)) {
              this.assessments.set(questionId, this.assessments.get(questionId).push(assessment));
            } else {
              this.assessments.set(questionId, List([assessment]));
            }
          })
          this.loadingAssessments = false;
        }, () => this.loadingAssessments = false)
        .then(() => this.loadingAssessments = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  private clearResponse() {
    this.comments.fill('');
    this.scores.fill(10);    
  }

  submit() {
    this.submitting = true;
    this.gapi_.submitResponses(this.blobkey, this.templateId, this.comments, this.scores)
        .then(() => {
          this.loadAssessments();
          this.clearResponse();
          this.submitting = false;
        }, () => this.submitting = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  getPositive(critique: string) {
    return critique.split('<->')[0];
  }

  getNegative(critique: string) {
    return critique.split('<->')[1];
  }
}

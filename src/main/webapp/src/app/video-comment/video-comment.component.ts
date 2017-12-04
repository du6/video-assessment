import { 
    Component, 
    Optional, 
    Input, 
    Output, 
    EventEmitter, 
    OnInit, 
    OnDestroy, 
    OnChanges, 
    SimpleChange, 
    SimpleChanges, 
    ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Template } from '../common/template';
import { Assessment } from '../common/assessment';
import { ConfirmationDialog } from '../confirmation/confirmation-dialog.component';

@Component({
  selector: 'video-assessment-video-comment',
  templateUrl: 'video-comment.component.html',
  styleUrls: ['video-comment.component.scss'],
})
export class VideoCommentComponent implements OnInit, OnDestroy, OnChanges {
  @Input() groupId: number;
  @Input() topicId: number;
  @Input() template: Template;
  @Input() member: string;
  @Input() confirmation: string;
  @Input() disableSubmit: boolean = false;
  @Output() responsesSubmitted: EventEmitter<string> = new EventEmitter<string>();

  templateId: number;
  blobkey: string;
  sub: any;
  questions: List<string> = List<string>();
  assessments: Map<number, List<Assessment>> = new Map();
  comments: string[] = [];
  scores: number[] = [];
  loadingTemplate: boolean = true;
  loadingAssessments: boolean = true;
  submitting: boolean = false;
  sections: Map<string, List<string>> = new Map();

  constructor(
      private _route: ActivatedRoute, 
      private gapi_: GapiService, 
      private changeDetectorRef_: ChangeDetectorRef,
      private _dialog: MdDialog,
      @Optional() private dialogRef_: MdDialogRef<ConfirmationDialog>) {
        this.sections.set("1000", List([
          'Presents an audience-centered argument', 
          'Delivers with passion', 
          'Has a commanding presence', 
          'Engages the Audience']));
        this.sections.set("1001", List([
          'Create a dynamic stage presence', 
          'Emphasize enthusiasm and sincerity', 
          'Help the recruiters remember you', 
          'Further influence the recruiters']));
        this.sections.set("1002", List([
            'Create a dynamic stage presence',
            'Emphasize enthusiasm and sincerity',
            'Help the investors remember you',
            'Further influence the investors']));
      }

  ngOnInit() {
    this.sub = this._route.params.subscribe(params => {
       this.blobkey = params['blobkey'];
    });
    if (!!this.blobkey) {
      this.loadAssessments();
      this.gapi_.getVideoByKey(this.blobkey)
          .then(video => {
            this.templateId = video.templateId;
            this.loadTemplate();
          });      
    } else {
      this.templateId = this.template.id;
      this.questions = List(this.template.questions);
      this.comments = new Array(this.questions.size);
      this.scores = new Array(this.questions.size);
      this.clearResponse();
      this.loadingTemplate = false;
      this.loadingAssessments = false;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.template && changes.template.currentValue) {
      const templateChange: SimpleChange = changes.template;
      const newTemplate: Template = templateChange.currentValue;
      this.templateId = newTemplate.id;
      this.questions = List(newTemplate.questions);
      this.comments = new Array(this.questions.size);
      this.scores = new Array(this.questions.size);
      this.clearResponse();
    }
  }

  private loadTemplate() {
    this.loadingTemplate = true;
    this.gapi_.loadTemplate(this.templateId)
        .then((template: Template) => {
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
    this.scores.fill(0);    
  }

  submit() {
    if (!!this.confirmation) {
      this.dialogRef_ = this._dialog.open(ConfirmationDialog, {data: this.confirmation});
      this.dialogRef_.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.submitResponses_();
        }});
    } else {
      this.submitResponses_();
    }
  }

  submitResponses_() {
    this.submitting = true;
    let submitResponsesPromise;
    if (!!this.blobkey) {
      submitResponsesPromise = 
          this.gapi_.submitResponses(this.blobkey, this.templateId, this.comments, this.scores);
    } else {
      submitResponsesPromise = this.gapi_.submitTempResponses(
          this.groupId, this.topicId, this.member, this.templateId, this.comments, this.scores);
    }
    submitResponsesPromise
        .then(() => {
          if (!!this.blobkey) {
            this.loadAssessments();
          }
          this.clearResponse();
          this.submitting = false;
          this.responsesSubmitted.emit("OK");
        }, () => this.submitting = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  drawAssessments() {
    this.assessments.forEach((assessmentList, questionId) => {
      const container = document.getElementById('assessments-drawer-' + questionId);
      let scoreCount = new Map();
      assessmentList.forEach(assessment => {
        const score = assessment.score;
        scoreCount.set(score, scoreCount.has(score) ? scoreCount.get(score) + 1 : 1);
      });
      const items = [];
      scoreCount.forEach((value, key) => items.push({x: key, y: value}));
      const dataset = new vis.DataSet(items);
      const options = {
        width:  '100%',
        height: '200px',
        style: 'bar',
        zoomable: false,
        showCurrentTime: false,
        start: 0,
        end: 11,
        min: 0,
        max: 11,
        showMajorLabels: false,
        dataAxis: {
          left: {
            format: function(value){
                // don't show non-integer values on data axis
                return Math.round(value) === value ? value : "";
            }
          }
        }
      };
      const graph2d = new vis.Graph2d(container, dataset, options);
    });
  }

  getPositive(critique: string) {
    return critique.split('<->')[0];
  }

  getNegative(critique: string) {
    return critique.split('<->')[1];
  }

  getSectionTitle(section : number) {
    return section + 1 + ". " + this.sections.get(this.templateId.toString()).get(section);
  }
}

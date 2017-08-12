import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectorRef,  
  ViewEncapsulation,
  ChangeDetectionStrategy, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { List } from 'immutable';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { MdSnackBar } from '@angular/material';

import { GapiService } from '../services/gapi.service';
import { Group } from '../common/group';
import { Topic } from '../common/topic';
import { Video } from '../common/video';

@Component({
  selector: 'video-assessment-group-detail',
  templateUrl: 'group-detail.component.html',
  styleUrls: ['group-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      state('in', style({
        height: '100%',
        opacity: 1,
      })),
      transition('void => *', [
        style({
          height: 0,
          opacity: 0
        }),
        animate(250, style({
          height: '100%',
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          height: '100%',
          opacity: 1
        }),
        animate(250, style({
          height: 0,
          opacity: 0
        }))
      ])
    ])
  ]
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  sub: any;
  isValidGroup: boolean = true;
  loadGroupError: string;
  isOwner: boolean = false;
  group: Group;
  groupId: number;
  members: List<string> = List<string>();
  topics: List<Topic> = List<Topic>();
  loadingMembers: boolean = false;
  loadingTopics: boolean = false;
  checkingOwnership: boolean = false;
  selectedTopic: Topic;
  selectedMember: string;

  constructor(
      private _route: ActivatedRoute, 
      private gapi_: GapiService, 
      private changeDetectorRef_: ChangeDetectorRef,
      private snackBar_: MdSnackBar) {}

  ngOnInit() {
    this.sub = this._route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.gapi_.loadGroup(this.groupId).then((group: Group) => {
        this.group = group;
        this.checkingOwnership = true;
        this.loadTopics(this.groupId);
        this.loadMembers(this.groupId);
        this.gapi_.checkGroupOwnership(this.groupId).then((isOwner: boolean) => {
          this.checkingOwnership = false;
          this.isOwner = isOwner;
        }, () => this.checkingOwnership = false)
        .then(() => this.checkingOwnership = false)
        .then(() => this.changeDetectorRef_.detectChanges());
      }).catch((error) => {
        this.isValidGroup = false;
        this.loadGroupError = error;
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  createTopic(name: string) {
    name = name ? name.trim() : '';
    if (name.length == 0) {
      return;
    }
    this.gapi_.createTopic(this.groupId, name)
        .then((topic: Topic) => {
          this.topics = this.topics.unshift(topic);
          this.changeDetectorRef_.detectChanges();
        })
  }

  addMember(member: string) {
    member = member ? member.trim() : '';
    if (member.length == 0) {
      return;
    }
    this.gapi_.addMember(this.groupId, member)
        .then(() => {
          this.members = this.members.unshift(member);
          this.changeDetectorRef_.detectChanges();
        })
  }

  deleteTopic(id: number) {
    this.gapi_.deleteTopic(id)
        .then(() => {
          const index = this.topics.findIndex((topic) => topic.id === id);
          if (index >= 0) {
            this.topics = this.topics.delete(index);
            this.changeDetectorRef_.detectChanges();
          }
        });
  }

  deleteMember(member: string) {
    this.gapi_.deleteMember(this.groupId, member)
        .then(() => {
          const index = this.members.findIndex((existingMember) => existingMember === member);
          if (index >= 0) {
            this.members = this.members.delete(index);
            this.changeDetectorRef_.detectChanges();
          }
        });
  }

  private loadTopics(groupId: number) {
    this.loadingTopics = true;
    this.gapi_.loadTopics(groupId)
        .then((topics: Topic[]) => {
          this.topics = List<Topic>(topics);
        }, () => this.loadingTopics = false)
        .then(() => this.loadingTopics = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  private loadMembers(groupId: number) {
    this.loadingMembers = true;
    this.gapi_.loadMembers(groupId)
        .then((members: string[]) => {
          this.members = List<string>(members);
        }, () => this.loadingMembers = false)
        .then(() => this.loadingMembers = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  selectTopic(topic: Topic) {
    this.selectedTopic = topic;
  }

  selectMember(member: string) {
    this.selectedMember = member;
  }

  onVideoUploaded(video: Video) {
    this.snackBar_.open(video.title + ' has been uploaded!', 'Dismiss', {duration: 2000});
  }

  getConfirmation() : string {
    return 'Please confirm to upload video for:' 
        + '<br><ul><li>Topic: <b>' + (this.selectedTopic ? this.selectedTopic.topic : '') 
        + '</b></li><li>Member: <b>' + this.selectedMember + '</b></li></ul>';
  }
}

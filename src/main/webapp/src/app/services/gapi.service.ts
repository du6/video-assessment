import { Observable } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { Injectable } from '@angular/core';

import { Membership } from '../common/membership';
import { Group } from '../common/group';
import { Video } from '../common/video';
import { Topic } from '../common/topic';
import { Template } from '../common/template';
import { Assessment } from '../common/assessment';
import { Invitation } from '../common/invitation';

// Google's login API namespace
declare var gapi: { client: { videoAssessmentApi: any } };

@Injectable()
export class GapiService {
  private gapi_: { client: { videoAssessmentApi: any } };
  static QUERY_LIMIT: number = 10000;

  constructor() {
    this.gapi_ = gapi;
  }

  createUser(): Promise<string> {
    return new Promise((resolve, reject) => 
        this.gapi_.client.videoAssessmentApi.createUser()
            .execute((resp) => {
              if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<string> resp.result.email);
              }
            }));
  }

  getUserEmail(): Promise<string> {
    return new Promise((resolve, reject) => 
        this.gapi_.client.videoAssessmentApi.getUser()
            .execute((resp) => {
              if (resp.error) {
                reject(resp.error);
              } else if (resp.result && resp.result.email) {
                resolve(<string> resp.result.email);
              } else {
                reject('user does not exist');
              }
            }));
  }

  getUploadUrl(): Promise<string> {
    return new Promise((resolve, reject) => 
        this.gapi_.client.videoAssessmentApi.getUploadUrl()
            .execute((resp) => {
              if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<string> resp.result.url);
              }
            }));
  }

  loadMyVideos(limit: number = 1000): Promise<Video[]> {
    return new Promise((resolve,reject) => 
        this.gapi_.client.videoAssessmentApi.getMyVideos(limit)
            .execute((resp) => {
              if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Video[]> resp.result.items);
              }
            }));
  }

  loadMySupportedVideos(limit: number = 1000): Promise<Video[]> {
    return new Promise((resolve,reject) => 
        this.gapi_.client.videoAssessmentApi.getMySupportedVideos(limit)
            .execute((resp) => {
              if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Video[]> resp.result.items);
              }
            }));
  }

  loadTemplate(): Promise<Template> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.getTemplate()
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Template> resp.result);
              }
          });
    });
  }

  submitResponses(
      videoKey: string,
      templateId: number, 
      comments: string[], 
      scores: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.createBulkResponse({
          videoId: videoKey,
          templateId: templateId, 
          comments: comments,
          scores: scores
      }).execute((resp) => {
        if (resp.error) {
            reject(resp.error);
          } else {
            resolve("OK");
          }
      });
    });
  }

  submitTempResponses(
      groupId: number,
      topicId: number,
      templateId: number, 
      comments: string[], 
      scores: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.createBulkResponse({
          groupId: groupId,
          topicId: topicId,
          templateId: templateId, 
          comments: comments,
          scores: scores
      }).execute((resp) => {
        if (resp.error) {
            reject(resp.error);
          } else {
            resolve("OK");
          }
      });
    });
  }

  loadAssessments(videoKey: string): Promise<Assessment[]> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.getResponses({
          video: videoKey
      }).execute((resp) => {
        if (resp.error) {
            reject(resp.error);
          } else {
            resolve(<Assessment[]> resp.result.items);
          }
      });
    });
  }

  deleteVideoByKey(videoKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.deleteVideo({video: videoKey})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else {
                resolve("OK");
              }
          });
    });
  }

  getVideoByKey(videoKey: string): Promise<Video> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.getVideoByKey({video: videoKey})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Video> resp.result);
              }
          });
    });
  }

  loadInvitations(videoKey: string): Promise<Invitation[]> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.getInvitationsForVideo({
          video: videoKey
      }).execute((resp) => {
        if (resp.error) {
            reject(resp.error);
          } else {
            resolve(<Invitation[]> resp.result.items);
          }
      });
    });
  }

  inviteSupporter(videoKey: string, supporter: string): Promise<Invitation> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.inviteSupporter(
          {video: videoKey, supporter: supporter})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Invitation> resp.result);
              }
          });
    });
  }

  deleteSupporter(invitationId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.deleteSupporter({id: invitationId})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else {
                resolve("OK");
              }
          });
    });
  }

  loadMyOwnedGroups(limit: number = 1000): Promise<Group[]> {
    return new Promise((resolve,reject) => 
        this.gapi_.client.videoAssessmentApi.getMyOwnedGroups(limit)
            .execute((resp) => {
              if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Group[]> resp.result.items);
              }
            }));
  }

  loadMyJoinedGroups(limit: number = 1000): Promise<Group[]> {
    return new Promise((resolve,reject) => 
        this.gapi_.client.videoAssessmentApi.getMyJoinedGroups(limit)
            .execute((resp) => {
              if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Group[]> resp.result.items);
              }
            }));
  }

  deleteGroup(groupId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.deleteGroup({id: groupId})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else {
                resolve("OK");
              }
          });
    });
  }

  deleteMember(groupId: number, member: string = null): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.deleteMember({groupId: groupId, member: member})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else {
                resolve("OK");
              }
          });
    });
  }

  createGroupWithMembers(name: string, members: string[]): Promise<Group> {
    if (members == null || members.length == 0) {
      return this.createGroup(name);
    }
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.createGroupWithMembers(
          {name: name, members: members})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Group> resp.result);
              }
          });
    });
  }

  createGroup(name: string): Promise<Group> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.createGroup({name: name})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Group> resp.result);
              }
          });
    });
  }

  loadGroup(id: number): Promise<Group> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.getGroupById({id: id})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Group> resp.result);
              }
          });
    });
  }

  checkGroupOwnership(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.checkOwnership({id: id})
          .execute((resp) => {
            if (resp.error) {
                resolve(false);
              } else {
                resolve(true);
              }
          });
    });
  }

  loadTopics(groupId: number, limit: number = 1000): Promise<Topic[]> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.getTopicsForGroup({
          id: groupId,
          limit: limit
      }).execute((resp) => {
        if (resp.error) {
            reject(resp.error);
          } else {
            resolve(<Topic[]> resp.result.items);
          }
      });
    });
  }

  loadMembers(groupId: number, limit: number = 1000): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.getMembershipsForGroup({
          id: groupId,
          limit: limit
      }).execute((resp) => {
        if (resp.error) {
            reject(resp.error);
          } else {
            const memberships : Membership[] = <Membership[]> resp.result.items;
            resolve((memberships || []).map(membership => membership.user));
          }
      });
    });
  }

  createTopic(groupId: number, name: string): Promise<Topic> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.createTopic({id: groupId, topic: name})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Topic> resp.result);
              }
          });
    });
  }

  addMember(groupId: number, member: string): Promise<Membership> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.addMember({id: groupId, member: member})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else if (resp.result) {
                resolve(<Membership> resp.result);
              }
          });
    });
  }

  deleteTopic(id: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gapi_.client.videoAssessmentApi.deleteTopic({id: id})
          .execute((resp) => {
            if (resp.error) {
                reject(resp.error);
              } else {
                resolve("OK");
              }
          });
    });
  }
}

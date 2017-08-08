package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;

@Entity
@Cache
public class Video extends VideoAssessmentEntity {
  @Id
  private String id;

  @Index
  private String createdBy;

  @Index
  private DateTime uploadedOn;

  @Index
  private boolean isDeleted = false;

  @Index
  private Long groupId;

  @Index
  private Long topicId;

  private String title;

  public Video(String id, String createdBy, String title, Long groupId, Long topicId) {
    this.id = id;
    this.createdBy = createdBy;
    this.title = title;
    this.groupId = groupId;
    this.topicId = topicId;
    this.uploadedOn = DateTime.now();
  }

  public void delete() {
    this.isDeleted = true;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public String getId() {
    return id;
  }

  public Long getGroupId() {
    return groupId;
  }

  public Long getTopicId() {
    return topicId;
  }

  public String getUploadedOn() {
    return uploadedOn.toString(ISODateTimeFormat.dateTime());
  }

  public String getTitle() {
    return title;
  }

  private Video() {}

  public boolean isDeleted() {
    return isDeleted;
  }
}

package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

import org.joda.time.DateTime;

/**
 * The topic entity
 */
@Entity
@Cache
public class Topic extends VideoAssessmentEntity {
  @Id
  private Long id;

  @Index
  private Long groupId;

  @Index
  private String topic;

  @Index
  private DateTime createdOn;

  public Topic (long id, long groupId, String topic) {
    this.id = id;
    this.groupId = groupId;
    this.topic = topic;
    this.createdOn = DateTime.now();
  }

  public Long getId() {
    return id;
  }

  public Long getGroupId() {
    return groupId;
  }

  public String getTopic() {
    return topic;
  }

  public DateTime getCreatedOn() {
    return createdOn;
  }

  private Topic() {}
}

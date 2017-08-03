package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

/**
 * The membership entity.
 */
@Entity
@Cache
public class Membership extends VideoAssessmentEntity {
  @Id
  private Long id;

  @Index
  private Long groupId;

  @Index
  private String user;

  public Membership(long id, long groupId, String user) {
    this.id = id;
    this.groupId = groupId;
    this.user = user;
  }

  public Long getId() {
    return id;
  }

  public Long getGroupId() {
    return groupId;
  }

  public String getUser() {
    return user;
  }

  private Membership() {}
}

package main.java.videoassessment.domain;

import com.google.appengine.api.users.User;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

@Entity
public class AppEngineUser extends VideoAssessmentEntity {
  @Id
  private String email;

  @Index
  private String name;

  private User user;

  public AppEngineUser(User user) {
    this.user = user;
    this.email = user.getEmail().toLowerCase();
    this.name = this.email;
  }

  public AppEngineUser setName(String name) {
    this.name = name;
    return this;
  }

  public User getUser() {
    return user;
  }

  public String getEmail() {
    return email;
  }

  public String getName() {
    return name;
  }

  private AppEngineUser() {}
}
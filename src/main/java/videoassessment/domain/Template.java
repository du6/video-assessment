package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

import java.util.ArrayList;
import java.util.List;

/**
 * The survey template entity entity
 */
@Entity
@Cache
public class Template extends VideoAssessmentEntity {
  @Id
  private long id;

  private List<String> questions = new ArrayList();

  public Template(long id, List<String> questions) {
    this.id = id;
    this.questions = new ArrayList<>(questions);
  }

  public long getId() {
    return id;
  }

  public List<String> getQuestions() {
    return questions;
  }

  private Template() {}
}

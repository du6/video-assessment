package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

/**
 * The score entity
 */
@Entity
public class Score extends VideoAssessmentEntity {
  @Id
  private long id;

  @Index
  private int score;


  public Score(int score) {
    this.id = 10000L;
    this.score = score;
  }

  public long getId() {
    return id;
  }

  public int getScore() {
    return score;
  }

  private Score() {}
}

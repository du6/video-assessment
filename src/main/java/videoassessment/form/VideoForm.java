package main.java.videoassessment.form;

import java.util.ArrayList;
import java.util.List;

/**
 * Client side Video.
 */
public class VideoForm {
  private String title;
  private String blobKey;
  private List<String> supporters = new ArrayList();;

  public List<String> getSupporters() {
    return supporters;
  }

  public String getTitle() {
    return title;
  }

  public String getBlobKey() {
    return blobKey;
  }
}

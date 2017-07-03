package main.java.videoassessment.servlet;

import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.VoidWork;

import javax.servlet.http.HttpServlet;

import main.java.videoassessment.domain.Template;
import main.java.videoassessment.spi.ApiUtils;

import static main.java.videoassessment.spi.ApiUtils.QUESTIONS;
import static main.java.videoassessment.spi.ApiUtils.TEMPLATE_ID;

/**
 * Warmup Task to create load a template to datastore.
 */
public class LoadTemplateServlet extends HttpServlet {
  @Override
  public void init() {
    ObjectifyService.run(new VoidWork() {
      public void vrun() {
        try {
          Template template = new Template(TEMPLATE_ID, QUESTIONS);
          ApiUtils.createEntity(template, Template.class);
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      }
    });
  }
}

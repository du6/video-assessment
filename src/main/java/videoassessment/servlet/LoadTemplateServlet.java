package main.java.videoassessment.servlet;

import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.VoidWork;

import javax.servlet.http.HttpServlet;

import main.java.videoassessment.domain.Template;
import main.java.videoassessment.spi.ApiUtils;

import static main.java.videoassessment.spi.ApiUtils.JOB_INTERVIEW_ASSESSMENTS;
import static main.java.videoassessment.spi.ApiUtils.JOB_INTERVIEW_TEMPLATE_ID;
import static main.java.videoassessment.spi.ApiUtils.PRESENTATION_ASSESSMENTS;
import static main.java.videoassessment.spi.ApiUtils.PRESENTATION_TEMPLATE_ID;
import static main.java.videoassessment.spi.ApiUtils.INVESTOR_ASSESSMENTS;
import static main.java.videoassessment.spi.ApiUtils.INVESTOR_TEMPLATE_ID;

/**
 * Warmup Task to create load a template to datastore.
 */
public class LoadTemplateServlet extends HttpServlet {
  @Override
  public void init() {
    ObjectifyService.run(new VoidWork() {
      public void vrun() {
        try {
          Template template =
              new Template(PRESENTATION_TEMPLATE_ID, "Presentation", PRESENTATION_ASSESSMENTS);
          ApiUtils.createEntity(template, Template.class);
          template =
              new Template(JOB_INTERVIEW_TEMPLATE_ID, "Job Interview", JOB_INTERVIEW_ASSESSMENTS);
          ApiUtils.createEntity(template, Template.class);
          template =
              new Template(INVESTOR_TEMPLATE_ID, "Pitch", INVESTOR_ASSESSMENTS);
          ApiUtils.createEntity(template, Template.class);
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      }
    });
  }
}

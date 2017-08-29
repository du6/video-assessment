package main.java.videoassessment.servlet;

import com.google.appengine.api.utils.SystemProperty;

import java.io.IOException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A servlet for sending a notification e-mail.
 */
public class SendFeedback extends HttpServlet {
  private static final String LEON = "yuelindu.pku@gmail.com";
  private static final String JJ = "jiaojiax@tepper.cmu.edu";

  private static final Logger LOG = Logger.getLogger(
      SendFeedback.class.getName());

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String from = request.getParameter("from");
    String feedback = request.getParameter("feedback");
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);
    String body = feedback;
    try {
      Message message = new MimeMessage(session);
      InternetAddress appAddress = new InternetAddress(
          String.format("feedbacks@%s.appspotmail.com",
              SystemProperty.applicationId.get()), "Talk Me Up");
      message.setFrom(appAddress);
      message.addRecipient(Message.RecipientType.TO, new InternetAddress(LEON, ""));
      message.addRecipient(Message.RecipientType.TO, new InternetAddress(JJ, ""));
      message.setSubject("Feedback from " + from);
      message.setText(body);
      Transport.send(message);
    } catch (MessagingException e) {
      LOG.log(Level.WARNING, String.format("Failed to send feedback from %s", from), e);
      throw new RuntimeException(e);
    }
  }
}

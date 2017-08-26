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
public class SendEmail extends HttpServlet {

  private static final Logger LOG = Logger.getLogger(
      SendEmail.class.getName());

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String me = request.getParameter("me");
    String email = request.getParameter("email");
    String videoLink = request.getParameter("videoLink");
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);
    String body = "Hi, " + me + " invited you to review a recent upload:\n\n" + videoLink;
    try {
      Message message = new MimeMessage(session);
      InternetAddress from = new InternetAddress(
          String.format("noreply@%s.appspotmail.com",
              SystemProperty.applicationId.get()), "Talk Me Up");
      message.setFrom(from);
      message.addRecipient(Message.RecipientType.TO, new InternetAddress(email, ""));
      message.setSubject("You Are Invited to Review a Video!");
      message.setText(body);
      Transport.send(message);
    } catch (MessagingException e) {
      LOG.log(Level.WARNING, String.format("Failed to send an mail to %s", email), e);
      throw new RuntimeException(e);
    }
  }
}

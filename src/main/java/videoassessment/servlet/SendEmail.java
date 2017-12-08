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

  String makeLink(String link, String text) {
    return "<a href=\"" + link + "\" target=\"_blank\">" + text + "</a>";
  }
  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String me = request.getParameter("me");
    String email = request.getParameter("email");
    String videoLink = request.getParameter("videoLink");
    String type = request.getParameter("type");
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);
    String body = (type.equals("request") ? ("Hi,\n" + me + " invited you to review a recent upload: " +
        makeLink(videoLink, "click to open")) :
        ("You’ve got feedback on your " + makeLink(videoLink, "video"))) + "\n\n";
    try {
      Message message = new MimeMessage(session);
      InternetAddress from = new InternetAddress(
          String.format("noreply@%s.appspotmail.com",
              SystemProperty.applicationId.get()), "Talk Me Up");
      message.setFrom(from);
      message.addRecipient(Message.RecipientType.TO, new InternetAddress(email, ""));
      message.setSubject(type.equals("request") ? "You Are Invited to Review a Video!" : "You Got Feedback!");
      message.setContent(body, "text/html; charset=utf-8");
      Transport.send(message);
    } catch (MessagingException e) {
      LOG.log(Level.WARNING, String.format("Failed to send an mail to %s", email), e);
      throw new RuntimeException(e);
    }
  }
}

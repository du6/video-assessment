package main.java.videoassessment.servlet;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

public class Mcginnis implements Filter {
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain)
      throws IOException, ServletException {
    HttpServletResponse httpResponse =(HttpServletResponse) response;
    httpResponse.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
    httpResponse.sendRedirect("https://talkmeup.net/dist/#/mcginnis");
  }

  @Override
  public void init(FilterConfig filterConfig) {
  }

  public void destroy() {}
}

package com.prerok.sender.response;

import com.fasterxml.jackson.databind.ObjectMapper;

public class SenderInitRespHeader {
  public boolean status;
  public String sid;

  public SenderInitRespHeader(boolean status, String sid) {
    this.status = status;
    this.sid = sid;
  }

  public String as_json() {
    String json = "";
    try {
      json = new ObjectMapper().writeValueAsString(this);
    } catch (Exception e) {
      System.out.println("Unable to serialize SenderWelcomeHeader");
      e.printStackTrace();
    }
    return json;
  }
}

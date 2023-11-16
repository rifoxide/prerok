package com.prerok.receiver.response;

import java.util.ArrayList;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prerok.FileInfo;

public class ReciverInitRespHeader {
  public boolean status;
  public String sid;
  public ArrayList<FileInfo> file_list;

  public ReciverInitRespHeader(boolean status, String sid, ArrayList<FileInfo> file_list) {
    this.status = status;
    this.sid = sid;
    this.file_list = file_list;
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

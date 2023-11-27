package com.prerok.receiver.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prerok.FileInfo;
import java.util.ArrayList;

public class ReceiverInitRespHeader {
  public boolean status;
  public String sid;
  public ArrayList<FileInfo> file_list;

  public ReceiverInitRespHeader(boolean status, String sid, ArrayList<FileInfo> file_list) {
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

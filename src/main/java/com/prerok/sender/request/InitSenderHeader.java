package com.prerok.sender.request;

import com.prerok.FileInfo;
import java.util.ArrayList;

public class InitSenderHeader {
  public ArrayList<FileInfo> file_list;

  public ArrayList<FileInfo> get_file_list() {
    return file_list;
  }
}

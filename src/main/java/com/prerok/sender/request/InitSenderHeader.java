package com.prerok.sender.request;

import java.util.ArrayList;

import com.prerok.FileInfo;

public class InitSenderHeader {
  public ArrayList<FileInfo> file_list;

  public ArrayList<FileInfo> get_file_list() {
    return file_list;
  }
}

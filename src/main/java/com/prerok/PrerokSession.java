package com.prerok;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Random;

import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.WebSocketSession;

import com.prerok.receiver.response.ReceiverInitRespHeader;

import com.prerok.sender.response.SenderInitRespHeader;

public class PrerokSession {
  String sid;
  WebSocketSession sender;

  WebSocketSession receiver;

  ArrayList<FileInfo> file_list;

  public void pass_away(WebSocketSession conn, byte[] data) {
    if (conn == sender) {
      try {
        receiver.sendMessage(new BinaryMessage(data));
      } catch (Exception e) {
        e.printStackTrace();
      }
    } else if (conn == receiver) {
      try {
        sender.sendMessage(new BinaryMessage(data));
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }

  public PrerokSession(WebSocketSession sender, ArrayList<FileInfo> file_list) {
    this.sender = sender;
    this.file_list = file_list;
    sid = getSaltString();
    System.out.println(String.format("new session: %s created with sender: %s", sid, sender.getId()));

    sender_init_notify();
  }

  public void sender_init_notify() {
    String sender_init_resp_header = new SenderInitRespHeader(true, sid).as_json();
    reply_sender(MessageTypes.INIT_SENDER_RESP, sender_init_resp_header.getBytes(), new byte[0]);
  }

  public void receiver_init_notify() {
    String receiver_init_resp_header = new ReceiverInitRespHeader(true, sid, file_list).as_json();
    reply_receiver(MessageTypes.INIT_RECEIVER_RESP, receiver_init_resp_header.getBytes(), new byte[0]);

  }

  void reply_sender(byte code, byte[] header, byte[] data) {
    byte[] reply = new byte[1 + 4 + header.length + data.length];
    ByteBuffer buffer = ByteBuffer.wrap(reply);
    buffer.put(code);
    buffer.put(gen_fixed_len(header.length).getBytes());
    buffer.put(header);
    buffer.put(data);
    try {
      sender.sendMessage(new BinaryMessage(buffer.array()));
    } catch (Exception e) {
      System.out.println("Could not repy to sender");
      e.printStackTrace();
    }
  }

  void reply_receiver(byte code, byte[] header, byte[] data) {

    byte[] reply = new byte[1 + 4 + header.length + data.length];
    ByteBuffer buffer = ByteBuffer.wrap(reply);
    buffer.put(code);
    buffer.put(gen_fixed_len(header.length).getBytes());
    buffer.put(header);
    buffer.put(data);
    try {

      receiver.sendMessage(new BinaryMessage(buffer.array()));

    } catch (Exception e) {
      System.out.println("Could not repy to receiver");

      e.printStackTrace();
    }
  }

  String gen_fixed_len(int len) {
    String s = "000" + Integer.toString(len);
    return s.substring(s.length() - 4);
  }

  public void handle_msg(byte type, byte[] data, WebSocketSession connection) {
    if (sender == connection) {

    } else if (receiver == connection) {

    }
  }

  public void disconnect_handler(WebSocketSession connection) {
    if (sender == connection)
      sender = null;

    else if (receiver == connection)
      receiver = null;
  }

  boolean should_be_removed() {
    return sender == null && receiver == null;
  }

  public void set_receiver(WebSocketSession receiver) {
    this.receiver = receiver;
    receiver_init_notify();

  }

  public void set_sender(WebSocketSession sender) {
    this.sender = sender;
  }

  public WebSocketSession get_receiver() {
    return receiver;

  }

  public WebSocketSession get_sender() {
    return sender;
  }

  public String get_id() {
    return sid;
  }

  protected String getSaltString() {
    String SALTCHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    StringBuilder salt = new StringBuilder();
    Random rnd = new Random();
    while (salt.length() < 5) { // length of the random string.
      int index = (int) (rnd.nextFloat() * SALTCHARS.length());
      salt.append(SALTCHARS.charAt(index));
    }
    String saltStr = salt.toString();
    return saltStr;

  }
}

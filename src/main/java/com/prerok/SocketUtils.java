package com.prerok;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

public class SocketUtils {
    public static void sendStatusMsg(WebSocketSession connection, String str, Boolean isSender) {
        try {
            connection.sendMessage(new TextMessage(str));
        } catch (Exception e) {
            System.err.println(String.format("failed to send message to the %s.", (isSender) ? "sender" : "receiver"));
        }
    }
}

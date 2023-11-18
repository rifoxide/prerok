package com.prerok;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prerok.receiver.request.ReceiverRequestHeader;
import com.prerok.sender.request.InitSenderHeader;
import java.util.Arrays;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

@Component
public class SocketHandler extends BinaryWebSocketHandler {
  final Logger logger = LoggerFactory.getLogger(SocketHandler.class);
  String receiverId = "";

  private final HashMap<String, PrerokSession> sid_to_prerok_session = new HashMap<>();
  private final HashMap<String, String> conn_id_to_session_id = new HashMap<>();

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    logger.info("New connection: " + session.getId());
    super.afterConnectionEstablished(session);
  }

  @Override
  public void handleBinaryMessage(WebSocketSession connection, BinaryMessage data) {
    logger.debug(
        "New Message From: "
            + connection.getId()
            + ", size: "
            + data.getPayloadLength()
            + " bytes");

    byte[] payload = data.getPayload().array();

    byte msg_type = payload[0];
    int header_len = Integer.parseInt(new String(Arrays.copyOfRange(payload, 1, 5)));
    byte[] header = Arrays.copyOfRange(payload, 5, 5 + header_len);
    byte[] innerdata = Arrays.copyOfRange(payload, 5 + header_len, payload.length);

    logger.debug(String.format("msgtype: %s header (%s):%s", msg_type, header_len, header));
    logger.debug(String.format("data: %s ", innerdata));

    switch (msg_type) {
      case MessageTypes.INIT_SENDER_REQ:
        { // init sender
          if (conn_id_to_session_id.get(connection.getId()) != null) {
            logger.info(String.format("sender %s: already in a session", connection.getId()));
            SocketUtils.sendStatusMsg(connection, "ALREADY_IN_A_SESSION", true);
            return;
          }

          InitSenderHeader init_sender_header;
          try {
            init_sender_header =
                new ObjectMapper().readValue(new String(header), InitSenderHeader.class);
          } catch (Exception e) {
            logger.error(
                String.format(
                    "sender %s: could not deserialize InitSenderHeader. Error: %s",
                    connection.getId(), e));
            SocketUtils.sendStatusMsg(connection, "SERVER_ERROR", true);
            return;
          }
          PrerokSession new_session =
              new PrerokSession(connection, init_sender_header.get_file_list());
          conn_id_to_session_id.put(connection.getId(), new_session.get_id());
          sid_to_prerok_session.put(new_session.get_id(), new_session);
          break;
        }

      case MessageTypes.INIT_RECEIVER_REQ:
        {
          ReceiverRequestHeader receiver_request_header;
          try {
            receiver_request_header =
                new ObjectMapper().readValue(new String(header), ReceiverRequestHeader.class);
          } catch (Exception e) {
            logger.error(
                String.format(
                    "receiver %s: could not deserialize InitReceiver. error: %s",
                    connection.getId(), e));
            SocketUtils.sendStatusMsg(connection, "SERVER_ERROR", false);
            return;
          }

          PrerokSession session = sid_to_prerok_session.get(receiver_request_header.get_sid());
          if (session != null && session.get_receiver() == null) {
            session.set_receiver(connection);
            conn_id_to_session_id.put(connection.getId(), session.get_id());
            receiverId = session.receiver.getId();
            logger.info(
                String.format(
                    "sender %s: got a receiver %s",
                    connection.getId(), session.receiver.getId(), session.sender.getId()));
          } else {
            logger.info(
                String.format(
                    "receiver %s: can't find sender with the transfer code: '%s'",
                    connection.getId(), receiver_request_header.get_sid()));
            SocketUtils.sendStatusMsg(connection, "INVALID_TRANSFER_CODE", false);
          }
          break;
        }

      case MessageTypes.PASS_AWAY:
        {
          String sid = conn_id_to_session_id.get(connection.getId());
          PrerokSession session = sid_to_prerok_session.get(sid);

          if (session.receiver == null) {
            logger.info(
                String.format(
                    "sender %s: receiver %s got disconnected.",
                    session.sender.getId(), receiverId));
            SocketUtils.sendStatusMsg(connection, "RECEIVER_DISCONNECTED", true);
          } else {
            session.pass_away(connection, payload);
          }
          break;
        }

      default:
        {
          SocketUtils.sendStatusMsg(connection, "INVALID_MESSAGE_TYPE", true);
          break;
        }
    }
  }

  @Override
  public void afterConnectionClosed(WebSocketSession connection, CloseStatus status)
      throws Exception {
    logger.info("Disconnected: " + connection.getId() + ", StatusCode: " + status.getCode());

    String sid = conn_id_to_session_id.get(connection.getId());
    if (sid != null) {
      conn_id_to_session_id.remove(connection.getId());
      PrerokSession session = sid_to_prerok_session.get(sid);
      session.disconnect_handler(connection);
      if (session.should_be_removed()) {
        sid_to_prerok_session.remove(sid);
        logger.info(String.format("transfer code '%s' is removed.", sid));
      }
    }
    super.afterConnectionClosed(connection, status);
  }
}

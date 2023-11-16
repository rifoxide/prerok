package com.prerok;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prerok.receiver.request.ReceiverRequestHeader;
import com.prerok.receiver.response.ReceiverInitRespHeader;
import com.prerok.sender.request.InitSenderHeader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class SocketHandler extends BinaryWebSocketHandler {
	final Logger logger = LoggerFactory.getLogger(SocketHandler.class);

	private final HashMap<String, PrerokSession> sid_to_prerok_session = new HashMap<>();
	private final HashMap<String, String> conn_id_to_session_id = new HashMap<>();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		logger.info("New connection: " + session.getId());
		// idToActiveSession.put(session.getId(), session);
		super.afterConnectionEstablished(session);
		// session.sendMessage(
		// new BinaryMessage(String.format("Hello, your seeeion id is: %s",
		// session.getId()).getBytes()));
	}

	@Override
	public void handleBinaryMessage(WebSocketSession connection, BinaryMessage data) {

		logger.info("New Message From: " + connection.getId() + ", size: " + data.getPayloadLength() + " bytes");

		byte[] payload = data.getPayload().array();

		byte msg_type = payload[0];
		int header_len = Integer.parseInt(new String(Arrays.copyOfRange(payload, 1, 5)));
		byte[] header = Arrays.copyOfRange(payload, 5, 5 + header_len);
		byte[] innerdata = Arrays.copyOfRange(payload, 5 + header_len, payload.length);

		System.out.println(msg_type);
		System.out.println(header_len);
		System.out.println(new String(header));
		System.out.println(new String(innerdata));

		switch (msg_type) {

			case MessageTypes.INIT_SENDER_REQ: { // init sender
				if (conn_id_to_session_id.get(connection.getId()) != null) {
					logger.info(String.format("user %s already in a session", connection.getId()));
					return;
				}

				InitSenderHeader init_sender_header;
				try {
					init_sender_header = new ObjectMapper().readValue(new String(header), InitSenderHeader.class);
				} catch (Exception e) {
					logger.error("Could not deserialize InitSenderHeader");
					return;
				}
				PrerokSession new_session = new PrerokSession(connection, init_sender_header.get_file_list());
				conn_id_to_session_id.put(connection.getId(), new_session.get_id());
				sid_to_prerok_session.put(new_session.get_id(), new_session);
				break;
			}

			case MessageTypes.INIT_RECEIVER_REQ: {
				ReceiverRequestHeader receiver_request_header;
				try {
					receiver_request_header = new ObjectMapper().readValue(new String(header),
							ReceiverRequestHeader.class);
				} catch (Exception e) {
					logger.error("Could not deserialize InitReceiver");
					return;
				}

				PrerokSession session = sid_to_prerok_session.get(receiver_request_header.get_sid());
				if (session != null && session.get_receiver() == null) {
					logger.info(String.format("user: %s is now receiver of session: %s",
							connection.getId(), receiver_request_header.get_sid()));
					session.set_receiver(connection);
					conn_id_to_session_id.put(connection.getId(), session.get_id());
				} else {
					logger.info(String.format("couldn't find sender for the receiver '%s' with transfer code '%s'",
							connection.getId(),
							receiver_request_header.get_sid()));
					try {
						connection.sendMessage(new TextMessage("TRANSFER_CODE_NOT_FOUND"));
					} catch (Exception e) {
						logger.info("failed to send message to the receiver.");
					}
				}

				break;
			}

			default: {
				// String sid = conn_id_to_session_id.get(connection.getId());
				// PrerokSession session = sid_to_prerok_session.get(sid);
				// session.handle_msg(msg_type, innerdata, connection);
				break;
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession connection, CloseStatus status) throws Exception {
		logger.info("Disconnected: " + connection.getId() + ", StatusCode: " + status.getCode());
		String sid = conn_id_to_session_id.get(connection.getId());
		if (sid != null) {
			conn_id_to_session_id.remove(connection.getId());
			PrerokSession session = sid_to_prerok_session.get(sid);
			session.disconnect_handler(connection);
			if (session.should_be_removed()) {
				sid_to_prerok_session.remove(sid);
				logger.info("%s removed forever");
			}
		}
		super.afterConnectionClosed(connection, status);
	}

}

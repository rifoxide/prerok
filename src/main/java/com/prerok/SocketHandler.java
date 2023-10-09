package com.prerok;

import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.util.HashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class SocketHandler extends BinaryWebSocketHandler {
	final Logger logger = LoggerFactory.getLogger(SocketHandler.class);

	private final HashMap<String, WebSocketSession> idToActiveSession = new HashMap<>();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		logger.info("New connection: " + session.getId());
		idToActiveSession.put(session.getId(), session);
		super.afterConnectionEstablished(session);
		session.sendMessage(
				new BinaryMessage(String.format("Hello, your seeeion id is: %s", session.getId()).getBytes()));
	}

	@Override
	public void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {

		logger.info("New Message From: " + session.getId() + ", size: " + message.getPayloadLength() + " bytes");

		ByteBuffer payload = message.getPayload();
		String msg = new String(payload.array());

		for (HashMap.Entry<String, WebSocketSession> otherSession : idToActiveSession.entrySet()) {
			if (otherSession.getKey().equals(session.getId()))
				continue;
			// send to everyone else other then this session
			try {
				otherSession.getValue()
						.sendMessage(new BinaryMessage(String.format("%s : %s", session.getId(), msg).getBytes()));
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		logger.info("Disconnected: " + session.getId() + ", StatusCode: " + status.getCode());
		idToActiveSession.remove(session.getId());
		super.afterConnectionClosed(session, status);
	}

}
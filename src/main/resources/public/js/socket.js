let socket
let is_connected

function connect() {
  if (is_connected) return;
  socket = new WebSocket(`ws://${window.location.host}/text`);

  socket.onopen = (event) => {
    console.log("The connection has been opened successfully.");
    is_connected = true;
  }

  socket.onclose = (event) => {
    console.log("The connection has been closed successfully.");
    is_connected = false;
  };
}

function disconnect() {
  socket.close();
}


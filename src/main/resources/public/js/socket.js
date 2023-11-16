let socket
let is_connected

function connect() {
  if (is_connected) return;
  socket = new WebSocket(`ws://${window.location.host}/text`);

  socket.onopen = (event) => {
    console.log("The connection has been opened successfully.");
    is_connected = true;

    document.querySelector('ul.collapsible.pin').style.display = '';
    document.querySelector('span.pin_code').textContent = gen_pin_code();
  }

  socket.onclose = (event) => {
    console.log("The connection has been closed successfully.");
    is_connected = false;

    document.querySelector('ul.collapsible.pin').style.display = 'none';
    document.querySelector('span.pin_code').textContent = '';
  };
}

function disconnect() {
  socket.close();
}


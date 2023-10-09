var ws;
var connected = false;

var table = document.getElementById('logtable');
var msg_box = document.getElementById('msg_box');
var fileelement = document.getElementById('file');
var filesendbtn = document.getElementById('file_send')

function send_file(e) {
	e.preventDefault();
	let file = fileelement.files[0];
	console.log("sending file ");
	ws.send(file);
}

function connect(e) {
	e.preventDefault();
	if (connected) {
		console.log("Already connected!");
		return;
	}
	ws = new WebSocket('ws://localhost:8080/text');
	ws.binaryType = "arraybuffer";
	ws.onmessage = function(data) {
		log_msg(data.data);
	}
	connected = true;
	console.log("connected!")
}

function disconnect(e) {
	e.preventDefault();
	if (!connected && ws == null) {
		console.log("Not connected!");
		return;
	}
	ws.close();
	console.log("disconnected!");
	connected = false;
}

function send_data(e) {
	e.preventDefault();
	let utf8Encode = new TextEncoder();
	data = utf8Encode.encode(msg_box.value);
	console.log("sending: " + data);
	ws.send(data);
}
let gmsg;
async function log_msg(binary_msg) {
	// gmsg = message;
	// let msg = await message.text();
	// table.insertRow(-1).insertCell(0).innerText = msg;
	const link = document.createElement('a');
	link.style.display = 'none';
	document.body.appendChild(link);


	const blob = new Blob([binary_msg], { type: 'text/plain' });
	const objectURL = URL.createObjectURL(blob);

	link.href = objectURL;
	link.href = URL.createObjectURL(blob);
	link.download = 'data.bin';
	link.click();
}


var connectbtm = document.getElementById("btn_connect");
var disconnectbtm = document.getElementById("btn_disconnect");
var sendbtn = document.getElementById('btn_send');

connectbtm.addEventListener('click', connect);
disconnectbtm.addEventListener('click', disconnect);
sendbtn.addEventListener('click', send_data);
filesendbtn.addEventListener('click', send_file);

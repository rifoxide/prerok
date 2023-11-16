let socket

let is_connected = false;

async function connect() {
  if (is_connected) return;
  socket = new WebSocket(`ws://${window.location.host}/text`);


  socket.binaryType = "arraybuffer";
  socket.onmessage = function(event) {
    handle_msg(event.data);
  }

  socket.onopen = (event) => {
    console.log("The connection has been opened successfully.");
    is_connected = true;
  }

  socket.onclose = (event) => {
    console.log("The connection has been closed (unexpected)");
    is_connected = false;
  };

  return;

}

function disconnect() {
  socket.close();
  is_connected = false;
}


// let gmsg;
async function handle_msg(binary_msg) {

  if (typeof binary_msg == "string") {
    handle_404_transfer_code();
    return;
  }


  let msg_array = new Uint8Array(binary_msg);
  // gmsg = msg_array;
  console.log(decoder.decode(msg_array));
  let msg_type = msg_array[0];
  let header_len = parseInt(decoder.decode(msg_array.slice(1, 5)));
  let header_string = decoder.decode(msg_array.slice(5, 5 + header_len));
  let data = msg_array.slice(5 + header_len, msg_array.length);
  console.log("msg_type:", msg_type);
  console.log("header_len:", header_len);
  console.log("header_string:", header_string);
  console.log("data:", data);

  switch (msg_type) {
    case INIT_SENDER_RESP: {
      handle_init_sender_resp(header_string);
      break;
    }
    case INIT_RECEIVER_RESP: {
      handle_init_receiver_resp(header_string);
      break;
    }
    case PASS_AWAY: {
      handle_pass_away(header_string, data);
    }
  }
}

function find_file(name, size) {
  let files = document.getElementById('browse_btn').files;
  for (i = 0; i < files.length; i++) {
    if (files[i].name == name && files[i].size == size) { return files[i] }
  }
  return null;
}

function concatTypedArrays(a, b) { // a, b TypedArray of same type
  var c = new (a.constructor)(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

const CHUNK_SIZE = 500000; // 500kb
function send_chunk(start, end, name, size, chunk) {
  let header = JSON.stringify({
    type: PASS_AWAY_FILE_CHUNK, chunk_info: { name: name, size: size, start: start, end: end }
  });
  let len = gen_fixed_len(header.length);
  let x = encoder.encode(PASS_AWAY_ + len + header);
  socket.send(concatTypedArrays(x, chunk));
}

async function upload_file(file) {
  if (file == null) { console.log("file does not exist"); return; }
  let start = 0;
  let end = Math.min(CHUNK_SIZE, file.size);
  for (; ;) {
    if (start == file.size) break;
    let chunk = new Uint8Array(await file.slice(start, end).arrayBuffer());
    send_chunk(start, end, file.name, file.size, chunk);
    start = end;
    end = Math.min(file.size, end + CHUNK_SIZE);
  }
}

function handle_pass_away(header_string, data) {
  header = JSON.parse(header_string);
  console.log(header)
  console.log("header.type : ", header.type)
  console.log("PASS_AWAY_FILE_REQ", PASS_AWAY_FILE_REQ)
  console.log("PASS_AWAY_FILE_REQ==header.type : ", PASS_AWAY_FILE_REQ == header.type)
  switch (header.type) {
    case PASS_AWAY_FILE_REQ: {
      console.log("file request: ", header.file_info.name);
      let file = find_file(header.file_info.name, header.file_info.size);
      upload_file(file);
      break;
    }
    case PASS_AWAY_FILE_CHUNK: {
      console.log("got file chunk: ", header);
      break;
    }
  }
}

function handle_404_transfer_code() {
  error_toast("Transfer code was incorrect.")
}

function handle_init_sender_resp(header) {
  let res = JSON.parse(header);

  document.querySelector('ul.collapsible.pin').style.display = '';
  document.querySelector('span.pin_code').textContent = res.sid;
  document.getElementById('upload_btn').style.display = 'none';
  document.getElementById('bbrowse_btn').style.display = 'none';


  $('div.upload-file-list > table').find("tr td:nth-child(3) a.delete-file").each(function() {
    $(this).prop("onclick", null).unbind('click');
    $($(this).find('i.material-icons')[0]).removeClass("red-text").addClass("grey-text");
  });
  $('table.file-list').unbind('click');
}

function handle_init_receiver_resp(header) {
  let res = JSON.parse(header);
  console.log("Your are a receiver of: ", res.sid);
  console.log("FILE LIST: ", res.file_list);

  gen_receive_table(res.file_list)

}
// let msg = binary_msg.text();
// table.insertRow(-1).insertCell(0).innerText = msg;
// const link = document.createElement('a');
// link.style.display = 'none';
// document.body.appendChild(link);


// const blob = new Blob([binary_msg], { type: 'text/plain' });
// const objectURL = URL.createObjectURL(blob);

// link.href = objectURL;
// link.href = URL.createObjectURL(blob);
// link.download = 'data.bin';
// link.click();



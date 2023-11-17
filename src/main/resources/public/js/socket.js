let socket
let is_connected = false;

async function connect() {
  if (is_connected) return;
  socket = new WebSocket(`ws://${window.location.host}/text`);

  socket.binaryType = "arraybuffer";
  socket.onmessage = function (event) {
    handle_msg(event.data);
  }

  socket.onopen = (event) => {
    console.log("The connection has been opened successfully.");
    is_connected = true;
  }

  socket.onclose = (event) => {
    console.log("The connection has been closed unexpectedly.");
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
  // console.log(decoder.decode(msg_array));
  let msg_type = msg_array[0];
  let header_len = parseInt(decoder.decode(msg_array.slice(1, 5)));
  let header_string = decoder.decode(msg_array.slice(5, 5 + header_len));
  let data = msg_array.slice(5 + header_len, msg_array.length);
  // console.log("msg_type:", msg_type);
  // console.log("header_len:", header_len);
  // console.log("header_string:", header_string);
  // console.log("data:", data);

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

const CHUNK_SIZE = 1000000; // 1mb
function send_chunk(start, end, name, size, chunk) {
  let header = JSON.stringify({
    type: PASS_AWAY_FILE_CHUNK, chunk_info: { name: name, size: size, start: start, end: end }
  });
  let len = gen_fixed_len(header.length);
  let x = encoder.encode(PASS_AWAY_ + len + header);
  socket.send(concatTypedArrays(x, chunk));
}

let uploaded_files_no = 0
let uploaded_bytes = 0
async function upload_file(file) {
  if (file == null) {
    const msg = "file does not exist"
    console.log(msg);
    error_toast(msg)
    return;
  }

  let start = 0;
  let end = Math.min(CHUNK_SIZE, file.size);
  console.log(`uploading: '${file.name}' (${human_readable_bytes(file.size)})`);

  for (; ;) {
    try {
      set_upload_progress(file.name, ((start / file.size) * 100).toFixed(0))
    } catch (e) {
      console.error(`failed to set upload progress. ${e}`)
    }

    if (start == file.size) {
      console.log(`uploaded: '${file.name}' (${human_readable_bytes(file.size)})`);
      ++uploaded_files_no;
      set_upload_progress(file.name, ((start / file.size) * 100).toFixed(0))
      break;
    };

    let chunk = new Uint8Array(await file.slice(start, end).arrayBuffer());
    send_chunk(start, end, file.name, file.size, chunk);
    uploaded_bytes += (end - start)
    start = end;
    end = Math.min(file.size, end + CHUNK_SIZE);

  }
}

function handle_pass_away(header_string, data) {
  header = JSON.parse(header_string);
  // console.log("pass away header: ", header);
  switch (header.type) {
    case PASS_AWAY_FILE_REQ: {
      console.log("user requested: ", `${header.file_info.name} (${human_readable_bytes(header.file_info.size)})`);
      $('.collapsible-body').css('display', 'block');
      const file = find_file(header.file_info.name, header.file_info.size);
      upload_file(file);
      break;
    }
    case PASS_AWAY_FILE_CHUNK: {
      handle_file_chunk(header.chunk_info, data)
      break;
    }
  }
}

//"chunk_info":{"name":"GoogleDot-Black.tar.gz","size":4785772,"start":4500000,"end":4785772}
let dl_files_no = 0
let downloaded_bytes = 0
function handle_file_chunk(chunk_info, data) {
  // console.log("chunk info: ", chunk_info);
  // console.log("chunk data: ", data);
  let file_buf = file_list_buf.get(chunk_info.name + chunk_info.size)
  // file_buf.set(data, chunk_info.start);
  file_buf.push(data)
  // console.log("file_buf: ", file_buf);
  set_dl_progress(chunk_info.name, `${((chunk_info.end / chunk_info.size) * 100).toFixed(0)}`)
  downloaded_bytes += (chunk_info.end - chunk_info.start)
  if (chunk_info.end == chunk_info.size) {
    const blob = new Blob(file_buf);
    ++dl_files_no
    set_dl_progress(chunk_info.name, `${((chunk_info.end / chunk_info.size) * 100).toFixed(0)}`)
    // console.log("blob size: ", blob.size);
    const objectURL = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectURL;
    link.download = chunk_info.name;
    link.click();
    link.remove();

    window.URL.revokeObjectURL(objectURL);
    console.log(`downloaded: '${chunk_info.name}' (${human_readable_bytes(chunk_info.size)})`)
  }
}

function handle_404_transfer_code() {
  error_toast("Transfer code was incorrect.")
}

let upload_file_list = []
function handle_init_sender_resp(header) {
  let res = JSON.parse(header);

  document.querySelector('ul.collapsible.pin').style.display = '';
  document.querySelector('span.pin_code').textContent = res.sid;
  document.getElementById('upload_btn').style.display = 'none';
  document.getElementById('bbrowse_btn').style.display = 'none';

  $('div.upload-file-list > table > thead > tr > th.center-align').text("Progress")
  $('div.upload-file-list > table > tbody > tr').each(function (idx) {
    const td = $(this).find("td:nth-child(3)")
    $(td).find("a.delete-file").remove()
    $(td).append("0%")
    $(td).addClass("file-upload-progress-td")
    upload_file_list.push({ name: this.querySelector('td.file-name').innerText, row_idx: idx })
  });
  $('table.file-list').unbind('click');
}

function handle_init_receiver_resp(header) {
  let res = JSON.parse(header);
  console.log("You are the receiver of: ", res.sid);
  console.log("FILE LIST: ", res.file_list);
  g_file_list = res.file_list;

  for (i = 0; i < res.file_list.length; i++) {
    console.log(`setting file list buf for '${res.file_list[i].name}' (${res.file_list[i].size} bytes)`);
    file_list_buf.set(res.file_list[i].name + res.file_list[i].size, []);
  }

  gen_receive_table(res.file_list)
  download_all_files()
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



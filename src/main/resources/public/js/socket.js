let socket
let is_connected = false

async function connect () {
  if (is_connected) return
  socket = new WebSocket(`ws://${window.location.host}/text`)

  socket.binaryType = 'arraybuffer'
  socket.onmessage = function (event) {
    handle_msg(event.data)
  }

  socket.onopen = (event) => {
    console.log('The connection has been opened successfully.')
    is_connected = true
  }

  socket.onclose = (event) => {
    console.log('The connection has been closed unexpectedly.')
    is_connected = false
  }
}

function disconnect () {
  socket.close()
  is_connected = false
}

// let gmsg;
async function handle_msg (binary_msg) {
  if (typeof binary_msg === 'string') {
    handle_status_msg(binary_msg)
    return
  }

  const msg_array = new Uint8Array(binary_msg)
  // gmsg = msg_array;
  // console.log(decoder.decode(msg_array));
  const msg_type = msg_array[0]
  const header_len = parseInt(decoder.decode(msg_array.slice(1, 5)))
  const header_string = decoder.decode(msg_array.slice(5, 5 + header_len))
  const data = msg_array.slice(5 + header_len, msg_array.length)
  // console.log("msg_type:", msg_type);
  // console.log("header_len:", header_len);
  // console.log("header_string:", header_string);
  // console.log("data:", data);

  switch (msg_type) {
    case INIT_SENDER_RESP: {
      handle_init_sender_resp(header_string)
      break
    }
    case INIT_RECEIVER_RESP: {
      handle_init_receiver_resp(header_string)
      break
    }
    case PASS_AWAY: {
      handle_pass_away(header_string, data)
    }
  }
}

function find_file (name, size) {
  const files = document.getElementById('browse_btn').files
  for (i = 0; i < files.length; i++) {
    if (files[i].name == name && files[i].size == size) { return files[i] }
  }
  return null
}

function concatTypedArrays (a, b) { // a, b TypedArray of same type
  const c = new (a.constructor)(a.length + b.length)
  c.set(a, 0)
  c.set(b, a.length)
  return c
}

const CHUNK_SIZE = 1000000 // 1mb
function send_chunk (start, end, name, size, chunk) {
  const header = JSON.stringify({
    type: PASS_AWAY_FILE_CHUNK, chunk_info: { name, size, start, end }
  })
  const len = gen_fixed_len(header.length)
  const x = encoder.encode(PASS_AWAY_ + len + header)
  socket.send(concatTypedArrays(x, chunk))
}

async function upload_file (file) {
  let start = 0
  let end = Math.min(CHUNK_SIZE, file.size)
  console.log(`uploading: '${file.name}' (${humanReadableBytes(file.size)})`)

  for (; ;) {
    try {
      setTransferFileProgress(file.name, ((start / file.size) * 100), 'upload')
    } catch (e) {
      console.error(`failed to set upload progress. ${e}`)
    }

    if (start == file.size) {
      console.log(`uploaded: '${file.name}' (${humanReadableBytes(file.size)})`)
      ++transferred_files
      try {
        setTransferFileProgress(file.name, ((start / file.size) * 100), 'upload')
      } catch (e) {
        console.error(`failed to set upload progress. ${e}`)
      }
      break
    };

    const chunk = new Uint8Array(await file.slice(start, end).arrayBuffer())
    send_chunk(start, end, file.name, file.size, chunk)
    transferred_bytes += (end - start)
    start = end
    end = Math.min(file.size, end + CHUNK_SIZE)
  }
}

async function request_file (name, size) {
  const header = JSON.stringify({ type: PASS_AWAY_FILE_REQ, file_info: { name, size } })
  const len = gen_fixed_len(header.length)
  socket.send(encoder.encode(PASS_AWAY_ + len + header))
}

function handle_pass_away (header_string, data) {
  header = JSON.parse(header_string)
  // console.log("pass away header: ", header);
  switch (header.type) {
    case PASS_AWAY_FILE_REQ: {
      console.log('user requested: ', `${header.file_info.name} (${humanReadableBytes(header.file_info.size)})`)
      $('.collapsible-body').css('display', 'block')

      const file = find_file(header.file_info.name, header.file_info.size)
      if (file == null) {
        const msg = `${header.file_info.name} (${humanReadableBytes(header.file_info.size)}) does not exist.`
        console.log(msg)
        error_toast(msg)
      } else {
        upload_file(file)
      }
      break
    }
    case PASS_AWAY_FILE_CHUNK: {
      handle_file_chunk(header.chunk_info, data)
      break
    }
  }
}

function handle_file_chunk (chunk_info, data) {
  const file_buf = file_list_buf.get(chunk_info.name + chunk_info.size)
  file_buf.push(data)

  try {
    setTransferFileProgress(chunk_info.name, ((chunk_info.end / chunk_info.size) * 100), 'download')
  } catch (e) {
    console.error(`failed to set download progress. ${e}`)
  }

  transferred_bytes += (chunk_info.end - chunk_info.start)
  if (chunk_info.end == chunk_info.size) {
    const blob = new Blob(file_buf)
    ++transferred_files

    try {
      setTransferFileProgress(chunk_info.name, ((chunk_info.end / chunk_info.size) * 100), 'download')
    } catch (e) {
      console.error(`failed to set download progress. ${e}`)
    }

    const objectURL = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = objectURL
    link.download = chunk_info.name
    link.click()
    link.remove()

    window.URL.revokeObjectURL(objectURL)
    console.log(`downloaded: '${chunk_info.name}' (${humanReadableBytes(chunk_info.size)})`)
  }
}

function handle_status_msg (msg) {
  console.log(`received status msg: ${msg}`)

  let status_msg = status_msgs[msg]
  if (!status_msg) status_msg = status_msgs.UNKNOWN_ERROR
  error_toast(status_msg.msg)
}

function handle_init_sender_resp (header) {
  const res = JSON.parse(header)

  document.querySelector('ul.collapsible.pin').style.display = ''
  document.querySelector('span.pin_code').textContent = res.sid
  document.getElementById('upload_btn').style.display = 'none'
  document.getElementById('bbrowse_btn').style.display = 'none'
  document.querySelector('#upload_form > span.card-title.center').style.display = 'none'
  document.querySelector('li.tab.receive').classList.add('disabled')

  $('div.upload-file-list > table > thead > tr > th.center-align').text('Progress')
  $('div.upload-file-list > table > tbody > tr').each(function (idx) {
    const td = $(this).find('td:nth-child(3)')
    $(td).find('a.delete-file').remove()
    $(td).append('0%')
    $(td).addClass('transfer-progress')
    transfers.push({ name: this.querySelector('td.file-name').innerText, row_idx: idx })
  })
  $('table.file-list').unbind('click')
}

function handle_init_receiver_resp (header) {
  const res = JSON.parse(header)
  console.log('You are the receiver of: ', res.sid)
  console.log('FILE LIST: ', res.file_list)
  g_file_list = res.file_list

  for (i = 0; i < res.file_list.length; i++) {
    console.log(`setting file list buf for '${res.file_list[i].name}' (${res.file_list[i].size} bytes)`)
    file_list_buf.set(res.file_list[i].name + res.file_list[i].size, [])
  }

  genReceiveTable(res.file_list)

  document.querySelector('#receive_code_input').style.display = 'none'
  document.querySelector('#delete_btn').style.display = 'none'
  document.querySelector('#receive_form span').style.display = 'none'

  document.querySelector('#receive_form ul.collapsible').style.display = ''
  document.querySelector('#receive_form div.receive-file-list').style.display = ''
  document.getElementById('receive-file-status').style.display = ''
  document.querySelector('#receive_form > div.card-action.center').style.marginTop = '20px'
  document.querySelector('#receive_form > div.card-action.center').style.marginBottom = '-10px'
  document.querySelector('li.tab.send').classList.add('disabled')
  $('#receive_form ul div.collapsible-body').css('display', 'block')

  downloadAllFiles()
}

function init_sender () {
  const init_sender_header = JSON.stringify({ file_list: genUploadTableJson() })
  const len = gen_fixed_len(init_sender_header.length)
  socket.send(encoder.encode(INIT_SENDER_REQ + len + init_sender_header))
}

function init_receiver () {
  const sid = document.getElementById('receive_code').value
  if (!sid.length) {
    const msg = 'No transfer code was given.'
    error_toast(msg)
    console.log(msg)
    return
  }

  console.log('init receiver: ', sid)
  const init_receiver_header = JSON.stringify({ sid })
  const len = gen_fixed_len(init_receiver_header.length)
  socket.send(encoder.encode(INIT_RECEIVER_REQ + len + init_receiver_header))
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

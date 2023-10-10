let ws
let connected = false

const file_elem = document.querySelector('div.btn.blue.btn-small input')
const file_sendbtn = document.querySelector('button#upload_btn')

function connect() {
  if (connected) {
    console.log('Already connected!')
    return
  }
  ws = new WebSocket('ws://localhost:8080/text')
  ws.binaryType = 'arraybuffer'
  ws.onmessage = function (data) {
    log_msg(data.data)
  }
  connected = true
  console.log('connected!')
}

function ws_send(e) {
  e.preventDefault()
  connect()

  // const utf8Encode = new TextEncoder()
  // data = utf8Encode.encode(msg_box.value)
  // console.log('sending: ' + data)
  // ws.send(data)
}

file_sendbtn.addEventListener('click', ws_send)

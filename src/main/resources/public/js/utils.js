const encoder = new TextEncoder();
const decoder = new TextDecoder();

function human_readable_bytes(bytes) {
  return new Intl.NumberFormat([], {
    style: 'unit',
    unit: 'byte',
    notation: 'compact',
    unitDisplay: 'narrow'
  }).format(bytes)
}

function gen_fixed_len(num) {
  return ("000" + num).slice(-4);
}

const INIT_SENDER_REQ = "\x01";
function init_sender() {
  connect();
  let init_sender_header = JSON.stringify({ "file_list": gen_upload_table_json() });
  let len = gen_fixed_len(init_sender_header.length);
  socket.send(encoder.encode(INIT_SENDER_REQ + len + init_sender_header));
}

const INIT_RECIVER_REQ = "\x02";
function init_reciver() {
  connect();
  let sid = document.getElementById("receive_code").value;
  console.log("init reaciver: ", sid);
  let init_receiver_header = JSON.stringify({ "sid": sid });
  let len = gen_fixed_len(init_receiver_header.length);
  socket.send(encoder.encode(INIT_RECIVER_REQ + len + init_receiver_header));
}

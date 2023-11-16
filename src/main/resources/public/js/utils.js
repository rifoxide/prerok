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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function error_toast(msg) {
  M.toast({ html: `<i class="material-icons red-text">error</i> ${msg}` })
}

async function init_ws(func) {
  connect()

  let max_trials = 10;
  while (true) {
    try {
      if (is_connected) {
        func()
        break;
      }
    }
    catch (e) {
      const msg = "failed to send data to ws.";
      console.error(e)
      error_toast(msg)
      break;
    }

    --max_trials;
    if (max_trials == 0) {
      error_toast("max trials for connecting to ws exceeded.");
      break;
    };

    await sleep(100);
  }
}


function init_sender() {
  let init_sender_header = JSON.stringify({ "file_list": gen_upload_table_json() });
  let len = gen_fixed_len(init_sender_header.length);
  socket.send(encoder.encode(INIT_SENDER_REQ + len + init_sender_header));
}

function init_receiver() {
  let sid = document.getElementById("receive_code").value;
  if (!sid.length) return;

  console.log("init receiver: ", sid);
  let init_receiver_header = JSON.stringify({ "sid": sid });
  let len = gen_fixed_len(init_receiver_header.length);
  socket.send(encoder.encode(INIT_RECEIVER_REQ + len + init_receiver_header));
}

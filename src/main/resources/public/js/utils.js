const encoder = new TextEncoder();
const decoder = new TextDecoder();

// https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
function human_readable_bytes(bytes) {
  if (bytes == 0) return '0B';
  var k = 1024,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
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

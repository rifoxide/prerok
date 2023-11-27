const encoder = new TextEncoder()
const decoder = new TextDecoder()

// https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
function humanReadableBytes (bytes) {
  if (bytes == 0) return '0B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}

function gen_fixed_len (num) {
  return ('000' + num).slice(-4)
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function error_toast (msg) {
  M.toast({ html: `<i class="material-icons red-text">error</i> ${msg}` })
}

async function init_ws (func) {
  connect()

  let max_trials = 10
  while (true) {
    try {
      if (is_connected) {
        func()
        break
      }
    } catch (e) {
      const msg = 'failed to send data to ws.'
      console.error(e)
      error_toast(msg)
      break
    }

    --max_trials
    if (max_trials == 0) {
      error_toast('max trials for connecting to ws exceeded.')
      break
    };

    await sleep(500)
  }
}

//
//
function setTransferFileProgress (fileName, progress, transferType) {
  const row_idx = transfers.find(x => x.name === fileName).row_idx

  let div_tag, prog_text, prog_bar
  if (transferType == 'download') {
    div_tag = 'div.receive-file-list'
    prog_text = ELEM_DL_PROG_TEXT
    prog_bar = ELEM_DL_PROG_BAR
  } else if (transferType == 'upload') {
    div_tag = 'div.upload-file-list'
    prog_text = ELEM_UP_PROG_TEXT
    prog_bar = ELEM_UP_PROG_BAR
  } else {
    throw (`Invalid transferType (${transferType}) was passed.`)
  }

  const row = document.querySelector(`${div_tag} > table > tbody`).rows[row_idx]
  row.querySelector('td.transfer-progress').innerText = `${progress.toFixed(0)}%`

  if (transferred_files <= total_files) {
    document.getElementById(prog_text).innerText = `${transferred_files}/${total_files}`
    document.getElementById(prog_bar).style.width = `${(transferred_bytes / total_bytes) * 100}%`
  }
}

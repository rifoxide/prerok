function gen_receive_table(files) {
  const table = document.querySelector('div.receive-file-list table.file-list')
  table.style.display = ''
  const tbody = table.querySelector('tbody')

  let i = 0
  for (const file of files) {
    const html = `<td class="file-name">${file.name}</td>
      <td class="file-size" size-in-bytes=${file.size}>${human_readable_bytes(file.size)}</td>
      <td class="transfer-progress">0%</td>`

    const row = tbody.insertRow(i)
    row.innerHTML = html
    i += 1
  }

  document.querySelector("#receive_form > div.card-content.center > div.receive-file-list").style.display = '';
  document.querySelector("#receive_form > div.card-content.center > span").style.display = 'none';
  document.querySelector('#receive_form > div.card-action.center-align').style.display = 'none';
  document.querySelector("#receive_code_input").style.display = 'none';
  document.querySelector("#receive_code_input").style.display = 'none';

}

async function request_file(name, size) {
  let header = JSON.stringify({ type: PASS_AWAY_FILE_REQ, file_info: { name: name, size: size } });
  let len = gen_fixed_len(header.length);
  socket.send(encoder.encode(PASS_AWAY_ + len + header));
}

let transfers = []
async function download_all_files() {
  let rcv_tbl_rows = document.querySelector("div.receive-file-list > table > tbody").rows
  for (let i = 0; i < rcv_tbl_rows.length; i++) {
    const tds = rcv_tbl_rows[i].getElementsByTagName('td');

    const file_name = tds[0].innerText;
    const file_size = tds[1].innerText;
    const size_in_bytes = tds[1].getAttribute('size-in-bytes');

    transfers.push({ name: file_name, row_idx: i })

    console.log(`Downloading: '${file_name}' (${file_size})`)
    await request_file(file_name, size_in_bytes)
    await sleep(300);
  }
}

function set_dl_progress(file_name, progress) {
  const row_idx = transfers.find(x => x.name === file_name).row_idx;

  let row = document.querySelector("div.receive-file-list > table > tbody").rows[row_idx]
  row.querySelector("td.transfer-progress").innerText = `${progress}%`
}

function init_receiver() {
  let sid = document.getElementById("receive_code").value;
  if (!sid.length) return;

  console.log("init receiver: ", sid);
  let init_receiver_header = JSON.stringify({ "sid": sid });
  let len = gen_fixed_len(init_receiver_header.length);
  socket.send(encoder.encode(INIT_RECEIVER_REQ + len + init_receiver_header));
}
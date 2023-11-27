function genReceiveTable (files) {
  const table = document.querySelector('div.receive-file-list table.file-list')
  table.style.display = ''
  const tbody = table.querySelector('tbody')

  let i = 0
  for (const file of files) {
    const html = `<td class="file-name">${file.name}</td>
      <td class="file-size" size-in-bytes=${file.size}>${humanReadableBytes(file.size)}</td>
      <td class="transfer-progress">0%</td>`

    const row = tbody.insertRow(i)
    row.innerHTML = html
    i += 1
    total_bytes += parseInt(file.size)
  }

  document.getElementById('receive-file-status').innerText = `Total ${files.length} files • ${humanReadableBytes(total_bytes)}`
  document.querySelector('#receive_form div.collapsible-header b span').innerText = document.getElementById('receive_code').value

  total_files = files.length
}

async function downloadAllFiles () {
  const rcv_tbl_rows = document.querySelector('div.receive-file-list > table > tbody').rows
  for (let i = 0; i < rcv_tbl_rows.length; i++) {
    const tds = rcv_tbl_rows[i].getElementsByTagName('td')

    const file_name = tds[0].innerText
    const file_size = tds[1].innerText
    const size_in_bytes = tds[1].getAttribute('size-in-bytes')

    transfers.push({ name: file_name, row_idx: i })

    console.log(`downloading: '${file_name}' (${file_size})`)
    await request_file(file_name, size_in_bytes)
    await sleep(300)
  }
}

function gen_recieve_table(files) {
  const table = document.querySelector('div.receive-file-list table.file-list')
  table.style.display = ''
  const tbody = table.querySelector('tbody')

  let i = 0
  for (const file of files) {
    const html = `<td class="file-name">${file.name}</td>
      <td class="file-size" size-in-bytes=${file.size}>${human_readable_bytes(file.size)}</td>
      <td class="center-align">
      </td>`

    const row = tbody.insertRow(i)
    row.innerHTML = html
    i += 1
  }

  set_file_status()
}
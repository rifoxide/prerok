function gen_receive_table(files) {
  const table = document.querySelector('div.receive-file-list table.file-list')
  table.style.display = ''
  const tbody = table.querySelector('tbody')

  let i = 0
  for (const file of files) {
    const html = `<td class="file-name">${file.name}</td>
      <td class="file-size" size-in-bytes=${file.size}>${human_readable_bytes(file.size)}</td>
      <td class="transfer-progress center-align">0%</td>`

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

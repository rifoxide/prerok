function is_duplicate(file_name, file_size) {
  flag = false;
  $("div.upload-file-list table.file-list tbody tr").each(function () {
    const name = $(this).find('.file-name').text();
    const size = $(this).find("td").eq(1).attr('size-in-bytes')
    console.log(`${file_name == name && size == file_size}`)
    if (file_name == name && size == file_size) flag = true;
  })
  return flag;
}

function gen_file_list_table(files) {
  const table = document.querySelector('div.upload-file-list table.file-list')
  table.style.display = '';
  const tbody = table.querySelector("tbody");

  const sizeFormatter = new Intl.NumberFormat([], {
    style: 'unit',
    unit: 'byte',
    notation: "compact",
    unitDisplay: "narrow",
  })

  let i = 0
  for (const file of files) {
    const html = `<td class="file-name">${file.name}</td>
    <td class="file-size" size-in-bytes=${file.size}>${sizeFormatter.format(file.size)}</td>
    <td class="center-align">
    <a onclick="$(this).closest('tr').remove();" class="waves-effect waves-red btn-flat">
    <i class="material-icons red-text">delete</i>
    </a>
    </td>`

    if (!is_duplicate(file.name, file.size)) {
      const row = tbody.insertRow(i)
      row.innerHTML = html
      i += 1
    } else {
      M.toast({ html: `<span><b>${file.name}</b> was already added.</span>` })
    }
  }
}

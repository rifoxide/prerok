function getTotalUploadFileBytes () {
  let total = 0
  $('table.file-list tbody tr td:nth-child(2)').each(function () { total += parseInt($(this).attr('size-in-bytes')) })
  return total
}

function setUploadChipInfo () {
  const len = document.querySelector('table.file-list tbody').children.length
  document.getElementById('file-status').innerText = `Total ${len} files • ${humanReadableBytes(getTotalUploadFileBytes())}`

  if (len == 0) {
    document.querySelector('#upload_form > div.card-content.left-align').style.display = 'none'
    document.querySelector('#upload_btn').style.display = 'none'
  } else {
    document.querySelector('#upload_form > div.card-content.left-align').style.display = ''
    document.querySelector('#upload_btn').style.display = ''
  }
}

function isDuplicateUploadFile (file_name, file_size) {
  flag = false
  $('div.upload-file-list table.file-list tbody tr').each(function () {
    const name = $(this).find('.file-name').text()
    const size = $(this).find('td').eq(1).attr('size-in-bytes')
    if (file_name == name && size == file_size) flag = true
  })

  return flag
}

function genUploadTable (files) {
  const table = document.querySelector('div.upload-file-list table.file-list')
  table.style.display = ''
  const tbody = table.querySelector('tbody')

  let i = 0
  for (const file of files) {
    const html = `<td class="file-name">${file.name}</td>
      <td class="file-size" size-in-bytes=${file.size}>${humanReadableBytes(file.size)}</td>
      <td class="center-align">
      <a onclick="$(this).closest('tr').remove();" class="delete-file waves-red btn-flat">
      <i class="material-icons red-text">delete</i>
      </a>
      </td>`

    if (!isDuplicateUploadFile(file.name, file.size)) {
      const row = tbody.insertRow(i)
      row.innerHTML = html
      i += 1
    } else {
      M.toast({
        html: `<span><b>${file.name}</b> was already added.</span>`,
        displayLength: 5000
      })
    }
    total_bytes += file.size
  }

  total_files = document.getElementById('browse_btn').files.length
  setUploadChipInfo()
}

function genUploadTableJson () {
  const data = []

  $('div.upload-file-list table.file-list tbody tr').each(function () {
    const name = $(this).find('.file-name').text()
    const size = $(this).find('td').eq(1).attr('size-in-bytes')
    data.push({ name, size })
  })
  return data
}

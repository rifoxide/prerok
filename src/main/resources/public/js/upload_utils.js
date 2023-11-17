function get_total_bytes() {
    let total = 0
    $('table.file-list tbody tr td:nth-child(2)').each(function () { total += parseInt($(this).attr('size-in-bytes')) })
    return total
}

function set_file_status() {
    const len = document.querySelector('table.file-list tbody').children.length
    document.getElementById('file-status').innerText = `Total ${len} files • ${human_readable_bytes(get_total_bytes())}`

    if (len == 0) {
        document.querySelector('#submit_url > div.card-content.left-align').style.display = 'none'
        document.querySelector('#upload_btn').style.display = 'none'
    }
    else {
        document.querySelector('#submit_url > div.card-content.left-align').style.display = ''
        document.querySelector('#upload_btn').style.display = ''
    }
}

function is_duplicate(file_name, file_size) {
    flag = false
    $('div.upload-file-list table.file-list tbody tr').each(function () {
        const name = $(this).find('.file-name').text()
        const size = $(this).find('td').eq(1).attr('size-in-bytes')
        if (file_name == name && size == file_size) flag = true
    })

    return flag
}

let total_files = 0
let total_bytes = 0
function gen_upload_table(files) {
    const table = document.querySelector('div.upload-file-list table.file-list')
    table.style.display = ''
    const tbody = table.querySelector('tbody')

    let i = 0
    for (const file of files) {
        const html = `<td class="file-name">${file.name}</td>
      <td class="file-size" size-in-bytes=${file.size}>${human_readable_bytes(file.size)}</td>
      <td class="center-align">
      <a onclick="$(this).closest('tr').remove();" class="delete-file waves-red btn-flat">
      <i class="material-icons red-text">delete</i>
      </a>
      </td>`

        if (!is_duplicate(file.name, file.size)) {
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
    set_file_status()
}

function gen_upload_table_json() {
    let data = [];

    $('div.upload-file-list table.file-list tbody tr').each(function () {
        const name = $(this).find('.file-name').text()
        const size = $(this).find('td').eq(1).attr('size-in-bytes')
        data.push({ name: name, size: size })
    })
    return data;
}

function set_upload_progress(file_name, progress) {
    const row_idx = upload_file_list.find(x => x.name === file_name).row_idx;
    let row = document.querySelector("div.upload-file-list > table > tbody").rows[row_idx]
    row.querySelector("td.file-upload-progress-td").innerText = `${progress}%`

    document.getElementById("overall_progress_text").innerText = `${uploaded_files_no}/${total_files}`
    document.getElementById("overall_progress_bar").style.width = `${(uploaded_bytes / total_bytes) * 100}%`
}

function init_sender() {
    let init_sender_header = JSON.stringify({ "file_list": gen_upload_table_json() });
    let len = gen_fixed_len(init_sender_header.length);
    socket.send(encoder.encode(INIT_SENDER_REQ + len + init_sender_header));
}

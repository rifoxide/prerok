function gen_file_list_table (files) {
  const table = document.querySelector('div.upload-file-list table.file-list')
  table.style.display = '';
  const tbody = table.querySelector("tbody");
  let i = 0
  for (const file of files) {
    const html = `<td>${file.name}</td>
    <td>${file.size}</td>
    <td class="center-align">
    <a onclick="remove_file();" class="waves-effect waves-red btn-flat">
    <i class="material-icons red-text">delete</i>
    </a>
    </td>`
    const row = tbody.insertRow(i)
    row.innerHTML = html
    i += 1
  }
}


function remove_file(e){
  console.log(e);
}
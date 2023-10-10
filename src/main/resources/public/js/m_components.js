function m_tab_callback () {
  const elem = M.Tabs.getInstance(document.querySelector('.tabs'))
  if (elem.index == 0) {
    document.querySelector('.tabs .indicator').style.backgroundColor = '#2598f3'
  } else {
    document.querySelector('.tabs .indicator').style.backgroundColor = ''
  }
}

function m_tab_init () {
  const tabs_options = {
    duration: 300,
    onShow: m_tab_callback,
    swipeable: false,
    responsiveThreshold: Infinity
  }

  const tab_elem = document.querySelector('.tabs')
  M.Tabs.init(tab_elem, tabs_options)
}

function m_collapsible_init () {
  const collapsible_elem = document.querySelectorAll('.collapsible')
  M.Collapsible.init(collapsible_elem)
}

function m_charcounter_init () {
  const charcounter_elem = document.querySelectorAll(
    'input#secret_key, input#url_suffix'
  )
  M.CharacterCounter.init(charcounter_elem)
}

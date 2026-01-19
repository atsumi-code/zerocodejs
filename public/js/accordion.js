$(function () {
  // jQueryのイベント委譲を設定
  $(document).on('click', '.js_toggleBtn', function () {
    const toggleBtn = $(this)
    const $tglArea = $(this).closest('.js_toggleArea')

    // アニメーション中は処理をスキップ
    if ($tglArea.find(':animated').length > 0) {
      return
    }

    // 開閉処理
    if ($tglArea.hasClass('s_close')) {
      $tglArea.find('.js_toggleContents').slideDown(500)
      toggleBtn.not('dt').attr('aria-expanded', true)
      $tglArea.removeClass('s_close')
    } else {
      $tglArea.find('.js_toggleContents').slideUp(500, function () {
        $tglArea.addClass('s_close')
        toggleBtn.not('dt').attr('aria-expanded', false)
      })
    }
  })
})

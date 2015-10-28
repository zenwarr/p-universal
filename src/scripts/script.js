"use strict";

$(function() {
  ie8_selectors();

  init_front_slider();
  update_active_front_slide();

  $('.discount-list').bxSlider({
    pager: false,
    auto: true,
    pause: 5000,
    autoDelay: 2500
  });

  $('.form-input[type=tel]').mask("+7 (999) 999-99-99");

  $('.btn-callback').click(function (e) {
    $.fancybox.open(get_popup_options({
      href: '#js-popup-callback'
    }));
    e.preventDefault();
  });

  $('.btn-pricecalc').click(function(e) {
    $.fancybox.open(get_popup_options({
      href: '#js-popup-pricecalc'
    }));
    e.preventDefault();
  });

  $('.pc-lang-select').styler();

  function init_lang_select($select, $select_data) {
    function update_icon() {
      var background = $select.find('.selected').css('background-image');
      $select.find('.jq-selectbox__select').css('background-image', background);
    }

    $select.find('.jq-selectbox__dropdown li').each(function(index) {
      var icon_url = $select_data.find('img').eq(index).attr('src');
      $(this).css('background-image', 'url(' + icon_url + ')');
    });

    update_icon();
    $select.on('change.styler', update_icon);
  }

  var pc_current_step = 0;
  var pc_step_count = 3;

  init_lang_select($('.pc-lang-select-from'), $('.pc-langs-from'));
  init_lang_select($('.pc-lang-select-to'), $('.pc-langs-to'));

  // калькулятор стоимости
  $('.pc-btn-prev').click(function() {
    if (pc_current_step > 0) {
      --pc_current_step;
      pc_update();
    }
  });

  $('.pc-btn-next').click(function() {
    if (pc_current_step + 1 < pc_step_count) {
      ++pc_current_step;
      pc_update();
    }
  });

  function toggleAttr($element, attr, value, set_value) {
    if (!value) {
      $element.removeAttr(attr);
    }
    else
      $element.attr(attr, set_value == undefined ? '' : set_value);
  }

  function pc_update() {
    toggleAttr($('.pc-btn-prev'), 'disabled', pc_current_step == 0);

    $('.pc-steps-overview > li')
        .removeClass('passed')
        .slice(0, pc_current_step + 1)
        .addClass('passed');

    $('.pc-steps > li')
        .removeClass('active')
        .eq(pc_current_step)
        .addClass('active');
  }

  pc_update();

  // rating stars

  if ($('.rating-box').length != 0) {
    $('.rating-box').raty({
      starOn: 'img/star-on.png',
      starOff: 'img/star-off.png',
      hints: [null, null, null, null, null],
      score: function() {
        return $(this).attr('data-score');
      },
      readOnly: function() {
        return $(this).attr('data-readonly');
      }
    });
  }

  // maps on contact page

  if ($('.contact-map').length != 0) {
    contact_page_scripts();
  }

  /*
   * Всплывающие окна
   */

  function get_popup_options(options) {
    return $.extend({
      type: 'inline',
      padding: 0,
      autoHeight: true,
      afterLoad: function () {
        var $wrap = this.wrap;
        $wrap.addClass('fancybox-dpopup');
      },
      afterShow: function () {
        // если пользователь нажал кнопку, зазумив при этом сайт, то скорее всего, всплывающее окно
        // откроется где-то в невидимой части страницы (справа или слева за границами экрана), поэтому
        // прокручиваем страницу к правому верхнему углу всплывашки, чтоб он сразу увидел, что изменилось на
        // странице. Можно сразу фокусировать на первом инпуте, но это, имхо, слишком навязчиво (на мобильных
        // устройствах появляется клавиатура, которая загораживает до половины экрана, экран прокручивается к координатам
        // инпута, пользователь просто не понимает, что от него требуют ввести)
        // ЗЫ: всплывашка всегда позиционируется по центру страницы, а не вьюпорта через css (см. .fancybox-opened, .fancybox-dpopup)
        var $wrap = this.wrap;
        if ($(window).scrollLeft() > $wrap.offset().left) {
          $('html, body').animate({
            scrollLeft: $wrap.offset().left
          });
        }
      }
    }, options || {});
  }

  if ($.fn.fancybox) {
    $('.js-popup').fancybox(get_popup_options());

    $(window).on('resize', function () {
      $.fancybox.update();
    });

    $('.js-fancybox').fancybox({
      padding: 0
    });
  }
});

var front_slider_autoint = undefined;

function front_stop_auto() {
  clearInterval(front_slider_autoint);
}

function front_restart_auto() {
  front_slider_autoint = setInterval(front_next, 5000);
}

function init_front_slider() {
  function update_front_slider_height() {
    var max_height = 0;
    $('.front-slide-info').each(function() {
      var $this = $(this);
      if ($this.innerHeight() > max_height) {
        max_height = $this.innerHeight();
      }
    });

    $('.front-slides > li').each(function() {
      var $this = $(this);
      $this.css('height', max_height + 'px');
    });

    $('.front-slides').css('height', max_height + 'px');
  }
  update_front_slider_height();

  setTimeout(update_front_slider_height, 200);

  $('.front-slides > li').click(function() {
    var $this = $(this);

    front_stop_auto();
    var old_index = front_current_slide();

    $('.front-slides > li').removeClass('active');
    $this.addClass('active');
    update_active_front_slide(old_index);

    front_restart_auto();
  });

  $('.front-slider-prev').click(front_prev);
  $('.front-slider-next').click(front_next);

  front_restart_auto();
}

function update_active_front_slide(old_index) {
  var cloned_content = $('.front-slides > li.active .front-slide-content').clone(true);
  $('.front-slider-viewport').empty().append(cloned_content);

  $('.front-slides > li').removeClass('lfix').eq(front_current_slide() - 1).addClass('lfix');

  front_scroll_to_view(old_index);
}

function front_current_slide() {
  return $('.front-slides > li').index($('.front-slides > li.active'));
}

function front_prev(e) {
  front_stop_auto();
  var old_index = front_current_slide();

  var current_slide = old_index;
  if (current_slide == 0)
    current_slide = $('.front-slides > li').length - 1;
  else
    --current_slide;
  $('.front-slides > li').removeClass('active').eq(current_slide).addClass('active');
  update_active_front_slide(old_index);

  front_restart_auto();

  if (e != undefined)
    e.preventDefault();
}

function front_next(e) {
  front_stop_auto();
  var old_index = front_current_slide();

  var current_slide = old_index;
  if (current_slide + 1 >= $('.front-slides > li').length)
    current_slide = 0;
  else
    ++current_slide;
  $('.front-slides > li').removeClass('active').eq(current_slide).addClass('active');
  update_active_front_slide(old_index);

  front_restart_auto();

  if (e != undefined)
    e.preventDefault();
}

function front_scroll_to_view(old_index) {
  var content_width = $('.front-slider-viewbox').innerWidth();
  var slide_width = $('.front-slides > li').innerWidth();
  var slide_count = $('.front-slides > li').length;
  var current_slide_index = front_current_slide();

  var ideal_index;
  if (old_index < current_slide_index)
    ideal_index = current_slide_index - 2;
  else if (old_index == current_slide_index)
    return;
  else
    ideal_index = current_slide_index - 1;

  if (ideal_index < 0)
    ideal_index = 0;
  else if (ideal_index > slide_count - 4)
    ideal_index = slide_count - 4;

  $('.front-slides').css('margin-left', ideal_index * -slide_width + 'px');

  var $q = $('.front-slides > li').removeClass('rfix').eq(ideal_index + 3).addClass('rfix');
}



/*
  scripts for contact page
*/

function contact_page_scripts() {
  var y_map, g_map;
  var active_map = 'yandex';

  function init_yandex() {
    if (y_map == undefined) {
      ymaps.ready(function() {
        y_map = new ymaps.Map('js-map-yandex', {
          center: [55.78, 37.64],
          zoom: 10
        });
        y_map.behaviors.disable('scrollZoom');

        var style_keys = [
          "islands#blueIcon",
          "islands#orangeIcon",
          "islands#darkgreenIcon",
          "islands#pinkIcon",
          "islands#redIcon",
        ];

        $('.contact-map-locations a').each(function(index) {
          var mark = new ymaps.GeoObject({
            geometry: {
              type: "Point",
              coordinates: [+$(this).data('lat'), +$(this).data('long')]
            }, properties: {
              iconContent: '' + (index + 1),
              hintContent: $(this).text()
            }
          }, {
            preset: style_keys[index]
          });

          y_map.geoObjects.add(mark);
        });
      });
    }
  }

  function init_google() {
    if (g_map == undefined) {
      g_map = new google.maps.Map(document.getElementById("js-map-google"), {
        zoom: 10,
        center: new google.maps.LatLng(55.78, 37.64),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
      });

      $('.contact-map-locations a').each(function(index) {
        var coords = new google.maps.LatLng(+$(this).data('lat'), +$(this).data('long'));
        new google.maps.Marker({
          position: coords,
          map: g_map,
          title: $(this).text()
        });
      });
    }
  }

  function activate_point($elem) {
    var lat = +$elem.data('lat');
    var longit = +$elem.data('long');

    if (active_map == 'yandex') {
      y_map.panTo([lat, longit]);
    } else {
      g_map.panTo(new google.maps.LatLng(lat, longit));
    }
  }

  function activate_map(map) {
    if (map == 'yandex') {
      $('#js-map-google').css('display', 'none');
      $('#js-map-yandex').css('display', 'block');
      $('.link-map-yandex').addClass('active');
      $('.link-map-google').removeClass('active');
      init_yandex();
      active_map = 'yandex';
    } else if (map == 'google') {
      $('#js-map-yandex').css('display', 'none');
      $('#js-map-google').css('display', 'block');
      $('.link-map-google').addClass('active');
      $('.link-map-yandex').removeClass('active');
      init_google();
      active_map = 'google';
    }
  }

  activate_map('yandex');

  $('.link-map-yandex').click(function(e) {
    activate_map('yandex');
    e.preventDefault();
  });

  $('.link-map-google').click(function(e) {
    activate_map('google');
    e.preventDefault();
  });

  $('.contact-map-locations a').click(function(e) {
    activate_point($(this));
    e.preventDefault();
  });
}

function ie8_selectors() {
  if ((document.documentMode || 100) < 9) {
    $('.side-menu > li:last-child').addClass('last-child');
    $('.payment-methods-list > li:nth-child(3n)').addClass('nth-child-3n');
    $('.faces-list > li:nth-child(3n)').addClass('nth-child-3n');

    $('button:disabled').addClass('disabled');
  }
}
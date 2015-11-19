(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals (root is window)
    root.lazyLoadAdSlot = factory(root.jQuery);
  }
}(this, function ($) {

  var lazyLoadAdSlotold = {

    adSlot: {},

    setTag: function (tag) {
      this.adSlot = tag;
    },
    getTag: function () {
      return this.adSlot;
    },
    detectPlacement: function (tag) {
      return 'onScroll';
    },
    appendAfter: function (el, html) {
      $(html).insertAfter(el);
    },
    detectOnScroll: function () {

      var tag = this.getTag(),
        windowTop = $(window).scrollTop(),
        $el = $(tag.ad_placement),
        offset = $el.offset(),
        elTopOffset = offset.top,
        windowHeight = $(window).height(),
      // Used for comparison on initial page load.
        loadHeightInitial = windowTop + elTopOffset + $el.height() - parseInt(tag.top),
      // Used for comparison on page scroll.
        loadHeightScroll = elTopOffset + $el.height() - parseInt(tag.top);

      if (!tag.added && ((windowHeight > loadHeightInitial) || (windowTop + windowHeight) >= loadHeightScroll)) {
        tag.added = true;
        this.setTag(tag);
        this.appendAfter($el, tag.renderedDfp);
      }
    },

    // Append the Ad to the page.
    execute: function (tag) {
      // Trigger needed action by detected method.
      switch (this.detectPlacement(tag)) {
        case 'onScroll':
          // Indicator to load the Ad only once.
          tag.added = false;
          this.setTag(tag);
          var lazyLoadObj = this;

          // Initial detection.
          $(window).scroll(lazyLoadObj.detectOnScroll()).trigger('scroll');

          // Act on the actual scroll.
          $(window).on('scroll', function () {
            lazyLoadObj.detectOnScroll();
          });

          break;

        default:
          console.debug('No appending method detected.');
      }

    },
  };

  // Starting point.
  return function (AdSlotTag) {
    return !!(window.googletag && AdSlotTag &&
    $(AdSlotTag.ad_placement).length &&
    lazyLoadAdSlotold.execute(AdSlotTag));
  };

}));


(function ($) {
  /**
   * Add the Ad Slots in a lazy load manner.
   *
   * @type {{attach: Drupal.behaviors.lazyAdSlotLoad.attach}}
   */
  Drupal.behaviors.lazyAdSlotLoad = {
    attach: function (context, settings) {

      // Lazy load the Ad by sending all the parameters.
      if (!!(window.googletag && Drupal.settings.lazyAdSlot && Drupal.settings.lazyAdSlot.tags)) {
        for (var key in Drupal.settings.lazyAdSlot.tags) {
          if (Drupal.settings.lazyAdSlot.tags.hasOwnProperty(key)) {
            var tag = Drupal.settings.lazyAdSlot.tags[key];
            lazyLoadAdSlot(tag);
          }
        }
      }

    }
  };

})(jQuery);

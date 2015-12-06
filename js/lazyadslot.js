var lazyLoadAdSlot = lazyLoadAdSlot || {};

(function ($) {

  'use strict';

  var lazyLoadAd = {

    adSlot: {},
    adSlotCounter: {},
    top: 1,
    slotId: '',
    attr: {},

    getTop: function (tag) {
      var initialTop = parseInt(tag.top);
      return isNaN(initialTop) ? this.top : initialTop;
    },
    appendBefore: function (el, html) {
      $(html).insertBefore(el);
    },
    appendAfter: function (el, html) {
      $(html).insertAfter(el);
    },
    pushAd: function (el, html) {
      if (this.adSlot.attach_how === 'before') {
        this.appendBefore(el, html);
      }
      else {
        this.appendAfter(el, html);
      }
    },
    /**
     * Increase the counter per specified slot.
     *
     * @param slotName
     * @returns Int
     *   Counter value.
     */
    increaseSlotCounter: function (slotName) {
      if (isNaN(this.adSlotCounter[slotName])) {
        this.adSlotCounter[slotName] = 0;
      }
      else {
        this.adSlotCounter[slotName]++;
      }
      return this.adSlotCounter[slotName];
    },
    /**
     * Add default attributes and merge with passed ones.
     */
    getAttr: function (newId) {
      var defaultClasses = 'lazyadslot lazyadslot-' + newId;

      // Add default classes.
      if (this.attr.class) {
        this.attr.class = this.attr.class + ' ' + defaultClasses;
      }
      else {
        this.attr.class = defaultClasses;
      }
      return this.attr;
    },
    detectSlot: function () {
      var $window = $(window);

      for (var i = 0; i < this.adSlot.ad_placement.length; i++) {
        var el = $(this.adSlot.ad_placement[i]),
          onScrollEnabled = (this.adSlot.onscroll === 1);

        // Check if the element exists.
        if (!el.length) {
          continue;
        }

        // Detect needed variable only when they are needed.
        if (onScrollEnabled) {
          var offset = el.offset(),
            windowTop = $window.scrollTop(),
            elTopOffset = offset.top,
            windowHeight = $window.height(),
          // Used for comparison on initial page load.
            loadHeightInitial = windowTop + elTopOffset + el.height() - this.top,
          // Used for comparison on page scroll.
            loadHeightScroll = elTopOffset + el.height() - this.top;
        }

        // A unique key to prevent repeating action when multiple selectors are provided.
        var uniqueKey = this.adSlot.ad_tag + '_' + this.adSlot.ad_placement[i];

        if (
          (!onScrollEnabled && !this.adSlot.added[uniqueKey]) ||
          (onScrollEnabled && (!this.adSlot.added[uniqueKey])
            && ((windowHeight > loadHeightInitial) || (windowTop + windowHeight) >= loadHeightScroll)
          )
        ) {

          // check if it works with this.
          this.adSlot.added[uniqueKey] = true;

          // Push the slot.
          this.addSlot(el);
        }
      }
    },
    /**
     * Generate ne slot ID, and push the Ad into the page.
     */
    addSlot: function (el) {
      // Generate new slot definition/display with incremental id as unique.
      var currentIDregex = new RegExp(this.adSlot.ad_tag, 'g'),
        newID = this.adSlot.ad_tag + '_' + this.increaseSlotCounter(this.adSlot.ad_tag),
        adSlotRendered = this.adSlot.renderedDfp.replace(currentIDregex, newID);

      // Wrap the rendered slot.
      adSlotRendered = $('<div/>', this.getAttr(newID)).append(adSlotRendered);

      // Append the Slot declaration/display.
      this.pushAd(el, $(adSlotRendered));

      // Refresh the tag.
      googletag.pubads().refresh([googletag.slots[newID]]);

      this.slotId = newID;
      // Allways destroy generated attributes.
      this.attr = {};
    },
    // Append the Ad to the page.
    execute: function (tag, attr) {

      // Initial setup.
      var self = this;
      this.top = this.getTop(tag);
      tag.added = [];
      this.adSlot = tag;
      if (!$.isEmptyObject(attr)) {
        this.attr = attr;
      }

      // todo: implement debounce.
      // see:
      // - https://davidwalsh.name/javascript-debounce-function
      // - http://underscorejs.org/docs/underscore.html#section-83
      // Trigger needed action by onScroll request.
      switch (tag.onscroll) {
        case 1:
          // Initial detection.
          this.detectSlot();

          // Act on the actual scroll.
          $(window).on('scroll', function () {
            self.detectSlot();
          });

          break;

        default:
          this.detectSlot();
      }
    },
  };

  // Initialization function.
  lazyLoadAdSlot.init = function (AdSlotTag, attr) {
    if (!!(window.googletag && AdSlotTag && $(AdSlotTag.ad_placement).length)) {
      lazyLoadAd.execute(AdSlotTag, attr);
      return lazyLoadAd;
    }
  };

})(jQuery);

// Old definition
//(function (root, factory) {
//  // Browser globals.
//  root.lazyLoadAdSlot = factory(root.jQuery);
//}(this, function ($) {
//
//  'use strict';
//
//
//  // Starting point.
//  return function (AdSlotTag) {
//    !!(window.googletag && AdSlotTag &&
//    $(AdSlotTag.ad_placement).length &&
//    lazyLoadAdSlot.execute(AdSlotTag));
//  };
//}

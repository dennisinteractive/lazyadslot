var lazyLoadAdSlot = lazyLoadAdSlot || {};

(function ($) {

  'use strict';

  var lazyLoadAd = {

    adSlot: {},
    adSlotCounter: {},
    top: 1,
    slotId: '',

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
    detectSlot: function () {
      self = this;

      for (var i = 0; i < self.adSlot.ad_placement.length; i++) {
        var el = $(self.adSlot.ad_placement[i]),
          onScrollEnabled = (self.adSlot.onscroll === 1);

        // Check if the element exists.
        if (!el.length) {
          continue;
        }

        // Detect needed variable only when they are needed.
        if (onScrollEnabled) {
          var offset = el.offset(),
            windowTop = $(window).scrollTop(),
            elTopOffset = offset.top,
            windowHeight = $(window).height(),
          // Used for comparison on initial page load.
            loadHeightInitial = windowTop + elTopOffset + el.height() - this.top,
          // Used for comparison on page scroll.
            loadHeightScroll = elTopOffset + el.height() - this.top;
        }

        // A unique key to prevent repeating action when multiple selectors are provided.
        var uniqueKey = self.adSlot.ad_tag + '_' + self.adSlot.ad_placement[i];

        if (
          (!onScrollEnabled && !self.adSlot.added[uniqueKey]) ||
          (onScrollEnabled && (!self.adSlot.added[uniqueKey])
            && ((windowHeight > loadHeightInitial) || (windowTop + windowHeight) >= loadHeightScroll)
          )
        ) {

          self.adSlot.added[uniqueKey] = true;

          // Push the slot.
          this.addSlot(self.adSlot, el);
        }
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
     * Generate ne slot ID, and push the Ad into the page.
     */
    // addSlotSingle
    addSlot: function (tag, el) {
      // Generate new slot definition/display with incremental id as unique.
      var currentIDregex = new RegExp(tag.ad_tag, 'g'),
        newID = tag.ad_tag + '_' + this.increaseSlotCounter(tag.ad_tag),
        adSlotRendered = tag.renderedDfp.replace(currentIDregex, newID);

      // Append the Slot declaration/display.
      this.pushAd(el, $(adSlotRendered));

      // Refresh the tag.
      googletag.pubads().refresh([googletag.slots[newID]]);

      this.slotId = newID;
    },
    // Append the Ad to the page.
    execute: function (tag) {
      self = this;
      this.top = this.getTop(tag);
      tag.added = [];
      this.adSlot = tag;

      // todo: implement debounce.
      // see:
      // - https://davidwalsh.name/javascript-debounce-function
      // - http://underscorejs.org/docs/underscore.html#section-83
      // Trigger needed action by onScroll request.
      switch (tag.onscroll) {
        case 1:
          // Initial detection.
          $(window).scroll(self.detectSlot()).trigger('scroll');

          // Act on the actual scroll.
          $(window).on('scroll', function () {
            self.detectSlot();
          });

          break;

        default:
          self.detectSlot();
      }
    },
  };

  // Initialization function.
  lazyLoadAdSlot.init = function (AdSlotTag) {
    if (!!(window.googletag && AdSlotTag && $(AdSlotTag.ad_placement).length)) {
      lazyLoadAd.execute(AdSlotTag);
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

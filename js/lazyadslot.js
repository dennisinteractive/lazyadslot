var lazyLoadAdSlot = lazyLoadAdSlot || {};

(function ($) {

  'use strict';

  var windowHeight  = window.innerHeight;

  function _throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
      var context = scope || this;

      var now = +new Date,
          args = arguments;
      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  var lazyLoadAd = {

    adSlot: {},
    adSlotCounter: {},
    adSlotOffsets: [],
    top: 1,
    slotId: '',
    attr: {},

    getTop: function (tag) {
      var initialTop = parseInt(tag.top);
      return isNaN(initialTop) ? this.top : initialTop;
    },
    pushAd: function ($el, html) {
      var vector = (this.adSlot.attach_how === 'before') ? 'Before' : 'After';
      $(html)['insert' + vector]($el);
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
      var windowTop = document.body.scrollTop || document.documentElement.scrollTop;

      for (var i = 0; i < this.adSlot.ad_placement.length; i++) {
        var uniqueKey = this.adSlot.ad_tag + '_' + this.adSlot.ad_placement[i];

        var slotElement = this.adSlotOffsets[i];

        if (!this.adSlot.added[uniqueKey] && slotElement.$el) {
          if (this.adSlot.onscroll === 1) {
            var offset = (windowTop + windowHeight);
            console.log(offset, slotElement.offset);
            if (offset > slotElement.offset) {
              console.log('fire ad');
              this.adSlot.added[uniqueKey] = true;
              this.addSlot(slotElement.$el);
            }
          }
        }
      }
    },
    detectSlotOffset: function() {
      for (var i = 0; i < this.adSlot.ad_placement.length; i++) {
        var $el = $(this.adSlot.ad_placement[i]);
        this.adSlotOffsets.push({
          $el:    $el,
          offset: parseInt($el.offset().top, 10) + $el.height() - this.top
        });
      }
    },
    /**
     * Generate ne slot ID, and push the Ad into the page.
     */
    addSlot: function ($el) {
      // Generate new slot definition/display with incremental id as unique.,
      var currentIDregex  = new RegExp(this.adSlot.ad_tag, 'g'),
        newID             = this.adSlot.ad_tag + '_' + this.increaseSlotCounter(this.adSlot.ad_tag),
        adSlotRendered    = this.adSlot.renderedDfp.replace(currentIDregex, newID);

      // Wrap the rendered slot.
      adSlotRendered = '<div class="' + this.getAttr(newID).class + '">' + adSlotRendered + '</div>';

      // Append the Slot declaration/display.
      this.pushAd($el, adSlotRendered);

      // Refresh the tag.
      googletag.pubads().refresh([googletag.slots[newID]]);

      this.slotId = newID;
      // Allways destroy generated attributes.
      this.attr = {};
    },
    // Append the Ad to the page.
    execute: function (tag, attr) {

      tag.added   = [];

      this.top    = this.getTop(tag);
      this.adSlot = tag;

      if (!$.isEmptyObject(attr)) {
        this.attr = attr;
      }
      this.detectSlotOffset();
      this.detectSlot();

      if (tag.onscroll === 1) {
        window.addEventListener('scroll', _throttle(function() {
          this.detectSlot();
        }.bind(this), 100));

        window.onresize = _throttle(function(event) {
          windowHeight = window.innerHeight;

          // Reset adSlotOffsets as not to keep adding the same slots
          this.adSlotOffsets = [];
          this.detectSlotOffset();
        }.bind(this), 100);
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

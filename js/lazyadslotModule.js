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
  'use strict';

  var lazyLoadAdSlot = {

    adSlot: {},
    top: 1,

    setTag: function (tag) {
      this.adSlot = tag;
    },
    getTag: function () {
      return this.adSlot;
    },
    getTop: function (tag) {
      var initialTop = parseInt(tag.top);
      return isNaN(initialTop) ? this.top : initialTop;
    },
    /**
     * We need at least one selector, so check for it.
     * @returns {string}
     */
    checkMethod: function () {
      var selectorQTY = this.adSlot.ad_placement.length;

      if (selectorQTY === 0) {
        throw new Error('You need to provide at least on selector.');
      }

      return selectorQTY > 1 ? 'multiple' : 'single';
    },
    /**
     * Get the method.
     * @returns {string|thrown error}
     */
    getMethod: function () {
      // Validate it first.
      try {
        return this.checkMethod();
      }
      catch (err) {
        console.debug(err);
      }
    },
    // todo: Implement(not tested).
    appendBefore: function (el, html) {
      $(html).insertBefore(el);
    },
    appendAfter: function (el, html) {
      $(html).insertAfter(el);
    },
    detectOnScroll: function () {
      var tag = this.getTag(),
        method = this.getMethod();
      for (var i = 0, len = tag.ad_placement.length; i < len; i++) {

        var tag = this.getTag();
        var delta = i + 1;
        var el = $(tag.ad_placement[i]);

        // Check if the element exists.
        if (!el.length) {
          continue;
        }

        var offset = el.offset(),
          windowTop = $(window).scrollTop(),
          elTopOffset = offset.top,
          windowHeight = $(window).height(),
        // Used for comparison on initial page load.
          loadHeightInitial = windowTop + elTopOffset + el.height() - this.top,
        // Used for comparison on page scroll.
          loadHeightScroll = elTopOffset + el.height() - this.top;

        if (
          !tag.added['selector_' + i]
          && ((windowHeight > loadHeightInitial) || (windowTop + windowHeight) >= loadHeightScroll)
        ) {
          //console.debug('SPOTTED');
          tag.added['selector_' + i] = true;
          this.setTag(tag);

          // Add the slot.
          if (method === 'single') {
            this.appendAfter(el, tag.renderedDfp);
          }
          else if (method === 'multiple') {
            this.addSlotMultiple(tag, delta, el);
          }
          else {
            console.debug('No known implementation method detected.');
          }

        }
      }
    },
    addSlotMultiple: function (tag, delta, el) {
      // Generate new slot definition/display with incremental id as unique.
      var currentIDregex = new RegExp(tag.ad_tag, 'g'),
        newID = tag.ad_tag + '_' + delta,
        adSlotDisplay = tag.renderedDfp.replace(currentIDregex, newID);

      // Generate new slot display with incremental id as unique.
      var adSlotDefinition = tag.slotDefinition.replace(currentIDregex, newID);

      // Append the Slot definition/display.
      this.appendAfter(el, $(adSlotDisplay).prepend('<script>' + adSlotDefinition + '</script>'));

      // Refresh the tag.
      googletag.pubads().refresh([googletag.slots[newID]]);
    },
    // Append the Ad to the page.
    execute: function (tag) {

      // Indicator to load the Ad only once.
      tag.added = [];
      this.setTag(tag);
      this.top = this.getTop(tag);

      self = this;

      // Trigger needed action by onScroll request.
      switch (tag.onscroll) {
        case 1:
          // Initial detection.
          $(window).scroll(self.detectOnScroll()).trigger('scroll');

          // Act on the actual scroll.
          $(window).on('scroll', function () {
            self.detectOnScroll();
          });

          break;

        default:
          //detectLoad();
          // TODO if we need it.
          console.debug('Instantly lazy load of the AdSlot is not supported yet.');

      }
    },
  };

  // Starting point.
  return function (AdSlotTag) {
    return !!(window.googletag && AdSlotTag &&
    AdSlotTag.ad_placement.length &&
    lazyLoadAdSlot.execute(AdSlotTag));
  };

}));
/**
 * @file
 * Add the Ad Slots in a lazy load manner.
 */
var lazyLoadAdSlot = lazyLoadAdSlot || {};

(function ($) {

  'use strict';

  var windowHeight = window.innerHeight;
  var initialized = false;

  function _throttle(fn, threshold, scope) {
    threshold || (threshold = 250);
    var last,
      deferTimer;
    return function () {
      var context = scope || this;

      var now = +new Date,
        args = arguments;
      if (last && now < last + threshold) {
        // Hold on to it.
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshold);
      }
      else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  var lazyLoadAd = {

    adSlot: {},
    adSlotCounter: {},
    adSlotsStore: [],
    top: 1,
    slotId: '',
    attr: {},

    getTop: function (tag) {
      var initialTop = parseInt(tag.top);
      return isNaN(initialTop) ? this.top : initialTop;
    },
    pushAd: function ($el, html) {
//    console.info('this.adSlot.attach_how  '+this.adSlot.attach_how);

//        console.info(Object(this.adSlot["0"]));


      switch(this.adSlot["0"].attach_how){
        case 'before':
          $(html).insertBefore($el);
          break;
        case 'after':
          $(html).insertAfter($el);
          break;
        case 'replace':
          $(html).replaceWith($el);
          break;
        case 'inside':
          $(html).appendTo($el);
          break;
      }
    },
    /**
     * Increase the counter per specified slot name.
     */
    increaseSlotCounter: function (slotName) {

//console.info('slotName: ' + slotName);

console.info('ad_placement: ' + this.adSlot["0"].ad_placement);
        var adPlacement = this.adSlot["0"].ad_placement;

        var placementTimes = $(adPlacement).length;
        console.info('ad_placement times: ' + placementTimes);


        if (isNaN(this.adSlotCounter[slotName])) {
        this.adSlotCounter[slotName] = 0;
      }
      else {
        this.adSlotCounter[slotName]++;
      }
        console.info('this.adSlotCounter: ' + JSON.stringify(this.adSlotCounter));

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
    detectSlot: function (force) {
      var uniqueKey, offset, slotElement;
      var windowTop = document.body.scrollTop || document.documentElement.scrollTop;



      // For each of the tags that are set as lazyloading.
      for (var i = 0; i < this.adSlotsStore.length; i++) {
        var ad = this.adSlotsStore[i].tag,
           adPlacement = this.adSlotsStore[i].$el.selector;

//          console.info('this.adSlotsStore[i].tag: ' + Object(ad));

          var times = $(adPlacement).length;

//          uniqueKey = ad.ad_tag + '_' + i;
          // For each of the times that a placeholder of a lazy ad appears on the page.
          for (var j = 0; j < $(adPlacement).length; j++) {
//console.info('j: '+j);
              uniqueKey = ad.ad_tag + '_' + j;
//        console.info('uniqueKey j '+uniqueKey);
//        slotElement = this.adSlotsStore[j];


              slotElement = this.adSlotsStore[i];


//console.info('slotElement $el' +Object.keys(this.adSlotsStore[i].$el));
//console.info('slotElement $el --- ' +Object(this.adSlotsStore[i].$el['0']));

//console.info('slotElement tag' +Object.keys(this.adSlotsStore[i].tag));


              if (!this.added[uniqueKey] && slotElement && slotElement.$el) {
                  if (force === true || ad.onscroll === 1) {
                      offset = (windowTop + windowHeight);
                      if (force === true || offset > slotElement.offset) {
                          this.added[uniqueKey] = true;
                          this.addSlot(ad, slotElement.$el[j]);
                      }
                  }
              }

          } // end for j
      } // end for j
    },
    isSlotStored: function (selector) {
      var added = false;

      if (this.adSlotsStore.length > 0) {
        $.each(this.adSlotsStore, function (index, value) {
          if (value.$el.selector === selector) {
            added = true;
          }
        });
      }
      return added;
    },
    addSlotToStore: function () {




      for (var slotKey = 0; slotKey < this.adSlot.length; slotKey++) {
        var ad = this.adSlot[slotKey];




        for (var i = 0; i < ad.ad_placement.length; i++) {
          var selector = ad.ad_placement[i];
          // If selector not empty.
          if (selector && selector.length > 0) {

console.info('selector: '+selector.length);
            var $el = $(selector);
              console.info('selector length: '+$el.length);

// todo fix this
            if (/*$el.length === 1 &&*/ !this.isSlotStored($el.selector)) {
              this.adSlotsStore.push({
                // This now needs to consider that might be more than 1.
                $el: $el,
                offset: parseInt($el.offset().top, 10) + $el.height() - this.top,
                tag: ad,
              });
            }
          }
        }
      }
    },
    /**
     * Generate new slot ID, and push the Ad into the page.
     */
    addSlot: function (adSlot, $el) {

      // Generate new slot definition/display with incremental id as unique.
      var currentIDregex = new RegExp(adSlot.ad_tag, 'g');
//      var  adSlot.ad_tag
      var  newID = adSlot.ad_tag + '_' + this.increaseSlotCounter(adSlot.ad_tag);
      var  adSlotRendered = adSlot.renderedDfp.replace(currentIDregex, newID);

        console.info('newID: '+newID);
        console.info('adSlotRendered: '+adSlotRendered);


        // Wrap the rendered slot.
      adSlotRendered = $('<div/>', this.getAttr(newID)).append(adSlotRendered);

      // Append the Slot declaration/display.
      this.pushAd($el, adSlotRendered);

      // Refresh the tag.
      if (parseInt(adSlot.refreshOnLoad)) {
        googletag.pubads().refresh([googletag.slots[newID]]);
      }

      this.slotId = newID;
      // Always destroy generated attributes.
      this.attr = {};
    },
    createTag: function (tag, attr) {
      this.top = this.getTop(tag);
      this.adSlot.push(tag);

      if (!$.isEmptyObject(attr)) {
        this.attr = attr;
      }

      // Instantly Ad load.
      this.addSlotToStore();
      // If it's not setup to load on scroll,
      // force it though conditions in order to be added instantly.
      this.detectSlot(!tag.onscroll);
      return this;
    },
    // Append the Ad to the page.
    execute: function () {
      var self = this;
      this.added = {};
      this.adSlot = [];

      window.addEventListener('scroll', _throttle(function () {
        self.detectSlot();
      }, 100));

      window.onresize = _throttle(function (event) {
        windowHeight = window.innerHeight;
        // Reset adSlotsStore as not to keep adding the same slots.
        self.addSlotToStore();
      }, 100);
    },
  };

  // Initialization function.
  lazyLoadAdSlot.init = function () {
    if (initialized === false) {
      lazyLoadAd.execute();
      initialized = true;
    }
    return lazyLoadAd;

  };

})(jQuery);

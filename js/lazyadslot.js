/**
 * Add the Ad Slots in a lazy load manner.
 *
 * @type {{attach: Drupal.behaviors.lazyAdSlotLoad.attach}}
 */
(function ($) {
  Drupal.behaviors.lazyAdSlotLoad = {
    attach: function () {

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
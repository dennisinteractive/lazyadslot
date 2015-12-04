/**
 * Add the Ad Slots in a lazy load manner.
 *
 * @type {{attach: Drupal.behaviors.lazyAdSlotLoad.attach}}
 */
Drupal.behaviors.lazyAdSlotLoad = {
  attach: function () {

    // Lazy load the Ad by sending all the parameters.
    if (!!(lazyLoadAdSlot && window.googletag && Drupal.settings.lazyAdSlot && Drupal.settings.lazyAdSlot.tags)) {
      for (var key in Drupal.settings.lazyAdSlot.tags) {
        if (Drupal.settings.lazyAdSlot.tags.hasOwnProperty(key)) {
          var tag = Drupal.settings.lazyAdSlot.tags[key];
          if (!tag.disable_init_load) {
            lazyLoadAdSlot.init(tag);
          }
        }
      }
    }
  }
};
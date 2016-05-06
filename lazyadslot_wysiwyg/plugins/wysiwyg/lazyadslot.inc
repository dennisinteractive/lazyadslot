<?php
/**
 * @file
 * lazyadslot_wysiwyg Inline/Wysiwyg API integration.
 */

// Default placeholder to load if variable is not set.
define("LAZYADSLOT_WYSIWYG_PLACEHOLDER", '<div class="inline-body-placeholder"></div>');
/**
 * Implements hook_wysiwyg_plugin().
 */
function lazyadslot_wysiwyg_lazyadslot_plugin() {
  $plugins['lazyadslot'] = array(
    'title'      => t('Inline LazyAdslots'),
    'icon file'  => 'lazyadslot.png',
    'icon title' => t('Insert inline ad slot placeholder'),
    'settings'   => array(
      'lazyadslotWysiwygPattern' => variable_get('lazyadslot_wysiwyg_placeholder',LAZYADSLOT_WYSIWYG_PLACEHOLDER),
    ),
  );
  return $plugins;
}

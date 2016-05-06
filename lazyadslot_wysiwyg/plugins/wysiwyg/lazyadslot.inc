<?php
/**
 * @file
 * Dennis DFP Inline/Wysiwyg API integration.
 */

/**
 * Implements hook_wysiwyg_plugin().
 */
function lazyadslot_wysiwyg_lazyadslot_wysiwyg_plugin() {
  $plugins['lazyadslot'] = array(
    'title'      => t('Inline LazyAdslots'),
    'icon file'  => 'lazyadslot.png',
    'icon title' => t('Insert inline ad slot placeholder'),
    'settings'   => array(
      'lazyadslotWysiwygPattern' => variable_get('lazyadslot_wysiwyg_placeholder', LAZYADSLOT_WYSIWYG_PLACEHOLDER),
    ),
  );

  return $plugins;
}

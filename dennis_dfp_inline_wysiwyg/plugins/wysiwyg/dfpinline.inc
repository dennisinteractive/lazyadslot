<?php
/**
 * @file
 * Dennis DFP Inline/Wysiwyg API integration.
 */

/**
 * Implements hook_wysiwyg_plugin().
 */
function dennis_dfp_inline_wysiwyg_dfpinline_plugin() {
  $plugins['dfpinline'] = array(
    'title'      => t('Inline Ads'),
    'icon file'  => 'dfpinline.png',
    'icon title' => t('Insert inline ad slot placeholder'),
    'settings'   => array(
      'dfpInlinePattern' => variable_get('dennis_dfp_inline_placeholder', DENNIS_DFP_INLINE_PLACEHOLDER),
    ),
  );

  return $plugins;
}

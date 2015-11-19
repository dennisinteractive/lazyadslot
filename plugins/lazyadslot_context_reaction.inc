<?php

/**
 * @file
 * Context reaction plugin for Lazy Loading Ad Slots.
 */

/**
 * Class LazyLoadAdSlotContextReaction
 */
class LazyLoadAdSlotContextReaction extends context_reaction {
  public $lazyadslot_tags = [];

  // Form options.
  function options_form($context) {
    $form = [];
    $values = [];

    // Get existing values for this form.
    $settings = $this->fetch_from_context($context);
    if (!empty($settings['values'])) {
      $values = $settings['values'];
    }

    // Get a list of all the tags.
    $options = [];
    $tags = dfp_tag_load_all();
    if (empty($tags)) {
      return [
        '#markup' => t('Before you can use this reaction you need to <a href="/admin/structure/dfp_ads/add">Add a new DFP ad</a>.')
      ];
    }

    foreach ($tags as $tag) {
      $options[$tag->machinename] = $tag->slot;
    }

    $form['values'] = [
      '#type' => 'fieldset',
    ];
    $form['values']['ad_tag'] = [
      '#type' => 'select',
      '#title' => t('DFP Ad tag'),
      '#description' => t('Select a DFP Ad tag to configure.'),
      '#options' => $options,
      '#default_value' => isset($values['ad_tag']) ? $values['ad_tag'] : [],
    ];
    $form['values']['add_type'] = [
      '#type' => 'select',
      '#title' => t('Type'),
      '#options' => [
        'static' => t('Static'),
        'dynamic' => t('Dynamic append'),
      ],
      '#default_value' => isset($values['add_type']) ? $values['add_type'] : [],
      '#description' => t('.... TO DO ......'),
    ];
    $form['values']['onscroll'] = array(
      '#type' => 'checkbox',
      '#title' => t('Add on OnScroll'),
    );
    $form['values']['ad_placement'] = [
      '#title' => t('Ad Placement'),
      '#description' => t('Enter the CSS selector where you wish to ad unit to render.'),
      '#type' => 'textarea',
      '#default_value' => isset($values['ad_placement']) ? $values['ad_placement'] : '',
    ];
    $form['values']['top'] = [
      '#title' => t('Top pixels'),
      '#description' => t('To Do...........'),
      '#type' => 'textfield',
      '#size' => 10,
      '#default_value' => isset($values['top']) ? $values['top'] : '',
    ];
    $form['values']['position'] = [
      '#title' => t('Position'),
      '#description' => t('This determines the position within the selector where you wish to place the ad unit. If you want an ad to appear after the third child add 3 or leave it empty if you want it to be the first element.'),
      '#type' => 'textfield',
      '#size' => 10,
      '#default_value' => isset($values['position']) ? $values['position'] : '',
    ];

    return $form;
  }


  // @TODO: Validate the combination of chosen option and the selectors itself.
  // 1) onScroll type can have just one selector;
  // 2) dynamic type can have one or more selectors;

  // Execute context.
  function execute() {
    $i = 0;
    foreach ($this->get_contexts() as $context) {
      if (!isset($context->reactions['lazyadslot'])) {
        continue;
      }

      foreach ($context->reactions['lazyadslot'] as $values) {
        if (!empty($values)) {
          $this->lazyadslot_tags['adslot_' . ++$i] = $values;
        }
      }
    }
  }

}

/**
 * @file
 * Dennis DFP Inline WYSIWYG plugin
 */
(function() {

  Drupal.wysiwyg.plugins.dfpinline = {

    /**
     * Execute the button.
     */
    invoke: function (data, settings, instanceId) {
      var content = (data.format === 'html') ? this._getPlaceholder(settings) : settings.dfpInlinePattern;

      Drupal.wysiwyg.instances[instanceId].insert(content);
    },

    /**
     * Replace all placeholders with images.
     */
    attach: function (content, settings) {
      var dfpInlinePattern = settings.dfpInlinePattern;
      var placeholder = this._getPlaceholder(settings);
      // Some WYSIWYGs (CKEditor) will strip the slash from single tags:
      // <foo /> becomes <foo>
      var inlineAdSlot = dfpInlinePattern.replace(/\/>/, '/?>').replace(/ /g, ' ?');

      // Remove unnecessary paragraph.
      var pattern = new RegExp('<p>' + inlineAdSlot + '</p>', 'ig');
      content = content.replace(pattern, placeholder);
      // Move breaks starting at the beginning of paragraphs to before them.
      pattern = new RegExp('<p>' + inlineAdSlot + '(<[^p])', 'ig');
      content = content.replace(pattern, placeholder + '<p>$1');
      // Move breaks starting at the end of to after the paragraphs.
      pattern = new RegExp('([^p]>)' + inlineAdSlot + '<\/p>', 'ig');
      content = content.replace(pattern, '$1</p>' + placeholder);
      // Other breaks.
      inlineAdSlot =  new RegExp(inlineAdSlot, 'g');
      content = content.replace(inlineAdSlot, placeholder);

      return content;
    },

    /**
     * Replace images with <!--#dfpinline#--> tags in content upon detaching editor.
     */
    detach: function(content, settings) {
      var dfpInlinePattern = settings.dfpInlinePattern;
      // Some WYSIWYGs (CKEditor) will strip the slash from single tags:
      // <foo /> becomes <foo>
      var inlineAdSlot = dfpInlinePattern.replace(/\/>/, '/?>').replace(/ /g, ' ?');
      // Replace (duplicate) placeholders within p tags with a single break.
      // var newContent = content.replace(/\s*<p[^>]*?>(?:\s*<img(?:\s*\w+=['"][^'"]*?['"]\s*)*?\s*class=['"][^'"]*?dfp-inline-placeholder[^'"]*?['"]\s*(?:\s*\w+=['"][^'"]*?['"]\s*)*?(?:\/)?>\s*)+<\/p>\s*/ig, dfpInlinePattern);

      // Replace all other placeholders.
      var newContent = content.replace(/<img(?:\s*\w+=['"][^'"]*?['"]\s*)*?\s*class=['"][^'"]*?dfp-inline-placeholder[^'"]*?['"]\s*(?:\s*\w+=['"][^'"]*?['"]\s*)*?(?:\/)?>/ig, dfpInlinePattern);
      // Fix paragraphs opening just before breaks.
      var pattern = new RegExp('(?:' + inlineAdSlot + ')*(<p[^>]*?>\\s*)' + inlineAdSlot, 'ig');
      newContent = newContent.replace(pattern, dfpInlinePattern + '$1');
      // Remove duplicate breaks and any preceding whitespaces.
      pattern = new RegExp('(?:\\s*' + inlineAdSlot + '){2,}' + inlineAdSlot, 'ig');
      newContent = newContent.replace(pattern, dfpInlinePattern);
      // Fix paragraphs ending after breaks.
      pattern = new RegExp(inlineAdSlot + '(\\s*<\/p>)(?:' + inlineAdSlot + ')*', 'ig');
      newContent = newContent.replace(pattern, '$1' + dfpInlinePattern);
      // Remove duplicate breaks with trailing whitespaces.
      pattern = new RegExp('(?:' + inlineAdSlot + '\\s*){2,}', 'ig');
      newContent = newContent.replace(pattern, dfpInlinePattern);

      return newContent;
    },

    /**
     * Helper function to return a HTML placeholder.
     */
    _getPlaceholder: function (settings) {
      return '<img src="' + settings.path + '/images/placeholder.png" alt="&lt;--#dfpinline#--&gt;" title="&lt;--#dfpinline#--&gt;" class="dfp-inline-placeholder drupal-content" />';
    }
  };

}(jQuery));

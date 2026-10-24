<?php

/**
 * Adds a source link to misionessim.org on the Revista VAMOS resource nodes on
 * movilicemos.org: the edition (/revistavamos/...) for a magazine node, or the
 * same article on the blog (/blog/...) for a republished article.
 *
 * Run from the Drupal root with drush:
 *
 *   drush php:script link-vamos-to-source.php          # dry run, changes nothing
 *   APPLY=1 drush php:script link-vamos-to-source.php  # writes
 *
 * Reads movilicemos-vamos-backlinks.csv (same directory by default, or set
 * CSV=/path/to/file). Only rows with an `url_edicion` are touched. Rows marked
 * `revisar=SI` are skipped unless INCLUDE_REVISAR=1 — those are the matches a
 * human still needs to confirm.
 *
 * The link text is the edition's own title from the CSV, e.g.
 *   <a href="...">La Oración</a> — Revista VAMOS, misionessim.org
 *
 * REWRITE=1 re-runs over nodes already linked, stripping the old link and
 * writing the current wording, so the text can be changed after the fact.
 *
 * A `field_fuente` that holds nothing but a boilerplate credit ("Revista VAMOS",
 * "VAMOS Revista - www.misionessim.org", empty) is replaced by the link, so the
 * domain is not printed twice. A credit naming an author or another publication
 * is preserved and the link is appended after it.
 *
 * Idempotent: a node that already links to misionessim.org/revistavamos/ or
 * misionessim.org/blog/ is left alone, so a partial run can simply be repeated.
 *
 * Every write creates a new revision, so any node can be rolled back from the
 * UI, and the whole run can be undone by reverting to the prior revision.
 */

use Drupal\filter\Entity\FilterFormat;
use Drupal\node\NodeInterface;

$apply = (bool) getenv('APPLY');
// Re-run over nodes already linked: strip the previous link and write the
// current wording, instead of skipping them as done.
$rewrite = (bool) getenv('REWRITE');
$include_revisar = (bool) getenv('INCLUDE_REVISAR');
$csv_path = getenv('CSV') ?: __DIR__ . '/movilicemos-vamos-backlinks.csv';

// Field to write into, in order of preference. The first one that exists on
// the node, is a formatted-text field, and whose format allows <a> wins.
$candidate_fields = ['field_fuente', 'field_resumen'];

// A `field_fuente` whose whole value is one of these is a boilerplate credit
// carrying no information the link won't carry better, so it is REPLACED by the
// link. Anything else (a named author, another publication) is preserved and the
// link is appended after it. Compared case-insensitively, after trimming
// whitespace and surrounding quotes.
$boilerplate_fuente = [
  'revista vamos',
  'vamos revista - www.misionessim.org',
  'vamos revista - misionessim.org',
  'vamos manual - www.misionessim.org',
  'sim - vamos',
  'misiones sim',
  'sim',
];

// What gets written. %url% and %title% are substituted per node; the title
// comes from the CSV's `titulo_edicion` column. Two templates because the text
// reads differently depending on whether it stands alone under the "Fuente"
// label or follows a credit that is already there.
$replace_template = '<a href="%url%">%title%</a> — Revista VAMOS, misionessim.org';
$append_template = '— también en <a href="%url%">%title%</a> (Revista VAMOS, misionessim.org)';

// Matches any link this script has written before, under any past wording, so
// REWRITE=1 can strip it and regenerate rather than appending a second copy.
$generated_pattern = '#\s*(?:Ver la edición completa:\s*|—\s*también en\s*)?'
  . '<a href="https://misionessim\.org/(?:revistavamos|blog)/[^"]*">[^<]*</a>'
  . '(?:\s*(?:—\s*Revista VAMOS,\s*misionessim\.org|\(Revista VAMOS,\s*misionessim\.org\)))?#u';

// A node already linked to an edition or an article. The bare-domain credit
// "www.misionessim.org" has no path, so it never matches.
$marker_pattern = '#misionessim\.org/(?:revistavamos|blog)/#';

/**
 * Trims, unwraps quotes and lowercases a field value for boilerplate matching.
 */
$normalise = function (string $value): string {
  $value = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
  $value = preg_replace('/\s+/u', ' ', $value);
  return mb_strtolower(trim($value, " \t\n\r\0\x0B\"'\u{201C}\u{201D}"), 'UTF-8');
};

if (!is_readable($csv_path)) {
  throw new \RuntimeException("Cannot read CSV: $csv_path");
}

$format_cache = [];

/**
 * TRUE if the text format renders <a href> rather than stripping it.
 */
$format_allows_links = function (?string $format_id) use (&$format_cache): bool {
  if ($format_id === NULL || $format_id === '') {
    return FALSE;
  }
  if (isset($format_cache[$format_id])) {
    return $format_cache[$format_id];
  }
  $format = FilterFormat::load($format_id);
  if (!$format) {
    return $format_cache[$format_id] = FALSE;
  }
  $filters = $format->filters();
  // filter_html_escape turns the whole value into escaped text.
  if ($filters->has('filter_html_escape') && $filters->get('filter_html_escape')->status) {
    return $format_cache[$format_id] = FALSE;
  }
  // filter_html restricts to an allow-list; anything else permits <a>.
  if ($filters->has('filter_html') && $filters->get('filter_html')->status) {
    $allowed = $filters->get('filter_html')->settings['allowed_html'] ?? '';
    return $format_cache[$format_id] = (bool) preg_match('/<a[\s>]/', $allowed);
  }
  return $format_cache[$format_id] = TRUE;
};

$storage = \Drupal::entityTypeManager()->getStorage('node');

$handle = fopen($csv_path, 'r');
$header = fgetcsv($handle);
$col = array_flip($header);
$rows = [];
while (($row = fgetcsv($handle)) !== FALSE) {
  $rows[] = $row;
}
fclose($handle);

// A node whose field is empty has no text format of its own to preserve, and
// the site's default format for the CLI user is often plain_text, which strips
// <a>. So derive the fallback from the nodes we are actually editing: whichever
// link-allowing format the populated field_fuente values already use.
$format_votes = [];
foreach ($rows as $row) {
  $node = $storage->load((int) $row[$col['nid']]);
  if (!$node instanceof NodeInterface || !$node->hasField('field_fuente')) {
    continue;
  }
  $item = $node->get('field_fuente')->first();
  if ($item && $item->format && $format_allows_links($item->format)) {
    $format_votes[$item->format] = ($format_votes[$item->format] ?? 0) + 1;
  }
}
arsort($format_votes);
$fallback_format = $format_votes ? array_key_first($format_votes) : filter_default_format();
printf(
  "Formato para campos vacíos: %s (%s)\n\n",
  $fallback_format,
  $format_votes
    ? sprintf('el más usado en estos nodos, %d de %d', reset($format_votes), array_sum($format_votes))
    : 'sin datos — filter_default_format()'
);

$stats = ['written' => 0, 'replaced' => 0, 'appended' => 0, 'already' => 0, 'rewritten' => 0, 'skipped_revisar' => 0, 'no_target' => 0, 'no_title' => 0, 'missing_node' => 0, 'no_field' => 0];

foreach ($rows as $row) {
  $nid = (int) $row[$col['nid']];
  $target = trim($row[$col['url_edicion']]);
  $target_title = isset($col['titulo_edicion']) ? trim($row[$col['titulo_edicion']]) : '';
  $revisar = trim($row[$col['revisar']]) === 'SI';

  if ($target === '') {
    $stats['no_target']++;
    continue;
  }
  if ($target_title === '') {
    $stats['no_title']++;
    printf("  NOTITLE  %-6d %s (row has a URL but no titulo_edicion)\n", $nid, $row[$col['titulo']]);
    continue;
  }
  if ($revisar && !$include_revisar) {
    $stats['skipped_revisar']++;
    printf("  revisar  %-6d %s\n", $nid, $row[$col['titulo']]);
    continue;
  }

  $node = $storage->load($nid);
  if (!$node instanceof NodeInterface) {
    $stats['missing_node']++;
    printf("  MISSING  %-6d (node not found)\n", $nid);
    continue;
  }

  // Pick a field that exists, is formatted text, and renders links.
  $target_field = NULL;
  foreach ($candidate_fields as $name) {
    if (!$node->hasField($name)) {
      continue;
    }
    $definition = $node->get($name)->getFieldDefinition();
    if (!in_array($definition->getType(), ['text', 'text_long', 'text_with_summary'], TRUE)) {
      continue;
    }
    $item = $node->get($name)->first();
    $format = $item && $item->format ? $item->format : $fallback_format;
    if (!$format_allows_links($format)) {
      continue;
    }
    $target_field = $name;
    break;
  }

  if ($target_field === NULL) {
    $stats['no_field']++;
    printf("  NOFIELD  %-6d %s (no formatted field whose text format allows <a>)\n", $nid, $node->label());
    continue;
  }

  $item = $node->get($target_field)->first();
  $existing = $item ? (string) $item->value : '';
  $format = $item && $item->format ? $item->format : $fallback_format;

  if (preg_match($marker_pattern, $existing)) {
    if (!$rewrite) {
      $stats['already']++;
      continue;
    }
    // Peel off the previous link so the value returns to what it was before
    // this script first touched it; the normal logic below then rebuilds it.
    $existing = trim(preg_replace($generated_pattern, '', $existing));
    $stats['rewritten']++;
  }

  // Replace a boilerplate credit outright; append to a real one. Only ever
  // replace in field_fuente — field_resumen holds the summary prose.
  $replaceable = $target_field === 'field_fuente'
    && ($existing === '' || in_array($normalise($existing), $boilerplate_fuente, TRUE));

  $link = strtr($replaceable ? $replace_template : $append_template, [
    '%url%' => htmlspecialchars($target, ENT_QUOTES),
    '%title%' => htmlspecialchars($target_title, ENT_QUOTES),
  ]);

  if ($replaceable) {
    $new = $link;
    $mode = 'replace';
  }
  else {
    $new = rtrim($existing) . ' ' . $link;
    $mode = 'append';
  }

  $values = ['value' => $new, 'format' => $format];
  // text_with_summary keeps its summary alongside the value.
  if ($item && $node->get($target_field)->getFieldDefinition()->getType() === 'text_with_summary') {
    $values['summary'] = (string) $item->summary;
  }

  printf("  %-8s %-7s %-6d %-12s %s\n", $apply ? 'WRITE' : 'would', $mode, $nid, $target_field, $target);

  if ($apply) {
    $node->set($target_field, $values);
    $node->setNewRevision(TRUE);
    $node->setRevisionLogMessage('Enlace a la fuente original en misionessim.org');
    $node->setRevisionCreationTime(\Drupal::time()->getRequestTime());
    $node->setRevisionUserId(\Drupal::currentUser()->id());
    $node->save();
  }
  $stats['written']++;
  $stats[$replaceable ? 'replaced' : 'appended']++;
}

echo "\n", $apply ? "Applied.\n" : "Dry run — nothing was written. Re-run with APPLY=1 to write.\n";
foreach ($stats as $key => $count) {
  printf("  %-16s %d\n", $key, $count);
}

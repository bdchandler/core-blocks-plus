# Core Blocks Plus

Extra options for WordPress's core blocks, designed to look and work like the editor's own controls:

- **[Flex sizing](#flex-sizing):** "Don't squash" for blocks in a Row, and "Column sizing" for Columns.
- **[Position](#position):** responsive Relative, Sticky, Absolute and Fixed positioning, with inset and layer.
- **[Inline icons](#inline-icons):** icons from the WordPress icon library inside buttons, paragraphs and other text.
- **[Group link](#group-link):** make a whole Group, Row, Stack, Grid, Column or Cover block a clickable link.

None of the features change saved block markup: settings are stored as block attributes and applied at render time. Content stays valid if a feature is turned off or the plugin is deactivated; the feature's effect just stops applying.

Requires WordPress 7.1+ and PHP 8.3+.

## Install with Composer

```bash
composer require bdchandler/core-blocks-plus
```

With [`composer/installers`](https://github.com/composer/installers), it installs into `wp-content/plugins/`. Built assets are committed, so no npm step is needed on the host site.

## Turning features off

All features are on by default. A feature that's off registers nothing and loads no code.

In `wp-config.php`, per site:

```php
define( 'CORE_BLOCKS_PLUS_DISABLE_FLEX', true );
define( 'CORE_BLOCKS_PLUS_DISABLE_POSITION', true );
define( 'CORE_BLOCKS_PLUS_DISABLE_INLINE_ICONS', true );
define( 'CORE_BLOCKS_PLUS_DISABLE_GROUP_LINK', true );
```

Or with a filter, for example in a theme's `functions.php`:

```php
add_filter(
	'core_blocks_plus_features',
	fn ( array $features ) => array_diff( $features, [ 'inline-icons' ] )
);
```

A constant turns a feature off even if the filter includes it.

## Flex sizing

Feature slug: `flex`

Plain-English flex sizing controls for core WordPress blocks, added to the block's **Dimensions** panel.

| Where | Option | What it does |
|---|---|---|
| Blocks inside a Row (when **Width** is *Fit*) | **Don't squash** | Keeps the block wide enough for its content, so buttons and text don't break onto two lines. Other blocks shrink instead. |
| Column blocks (with no width set), in the **Settings** tab | **Column sizing**: *Equal share* / *Fit content* | *Fit content* makes the column as wide as its content instead of an equal share of the row. |

**Don't squash** follows core's responsive editing. It's saved in the block's `style` attribute, in the same shape core uses for its responsive Width setting:

```json
"style": {
  "flexSizing": { "noShrink": true },
  "@mobile": { "flexSizing": { "noShrink": false } }
}
```

With a tablet or mobile viewport selected, the value is saved under that viewport only. Core's "Copy styles" / "Paste styles" carry it along, and the CSS uses the breakpoints from the theme's `settings.viewport`. Core doesn't publicly expose which viewport is being edited, so the plugin reads it from the block editor store's internal state ([use-editing-viewport.js](src/shared/use-editing-viewport.js)). If a core update changes that, the control falls back to editing the all-screens value.

Column sizing isn't responsive, matching core's column Width. It's saved as a plain `columnSizing` attribute on the Column block.

### How it works

- **Front end:** CSS is generated with core's style engine into the same `block-supports` stylesheet core uses for its own layout and responsive styles, under a hashed `wp-flex-*` class.
- **Editor:** the same CSS is added to the canvas with `useStyleOverride()`.
- Saved block markup is never changed, so deactivating the plugin leaves content valid and only removes the effect.

The CSS rules live in two places that must stay in sync: `App/Features/Flex/Styles.php` (front end) and `src/flex/utils/flex-sizing.js` (editor).

## Position

Feature slug: `position`

Responsive positioning for blocks that support position (core's Group, plus any block a theme or plugin gives position support). It replaces core's Position dropdown in the **Styles** tab with:

| Option | What it does |
|---|---|
| **Default** | Normal flow. |
| **Relative** | Stays in place. Blocks inside it set to Absolute are placed within it. |
| **Sticky** | Sticks to the top of the window instead of scrolling (needs the theme's `settings.position.sticky`). |
| **Absolute** | Placed over its surroundings, within the nearest positioned parent. It won't push other blocks down. |
| **Fixed** | Doesn't move when the page scrolls (needs the theme's `settings.position.fixed`). |

When positioned, a block also gets:

- **Inset**: one value, or four with the link button (top, right, bottom, left).
- **Layer**: z-index. Empty means `auto`, or `10` for Sticky and Fixed, matching core.

Absolute blocks show what they're placed within. If nothing around them is positioned, a warning offers a button to set the nearest Group to Relative.

### Responsive

Everything follows core's responsive editing. With a tablet or mobile viewport selected, values are saved for that viewport only, and **Use desktop settings** removes them again:

```json
"style": {
  "position": { "type": "absolute", "top": "1rem", "right": "1rem", "zIndex": 5 },
  "@mobile": { "position": { "type": "" } }
}
```

This is core's `style.position` shape plus `zIndex`. At a viewport, the type and layer override desktop individually, and the four inset sides override as a set. Breakpoints come from the theme's `settings.viewport`.

Core doesn't publicly expose which viewport is being edited, so the plugin reads it from the block editor store's internal state ([use-editing-viewport.js](src/shared/use-editing-viewport.js)). If a core update changes that, the controls fall back to editing the desktop values.

### How it works

- **Front end:** CSS is generated with core's style engine into the same `block-supports` stylesheet core uses for its own responsive styles, under a hashed `wp-position-*` class. Blocks also get readable `is-position-relative`, `is-position-sticky`, `is-position-absolute` and `is-position-fixed` classes for each type used at any viewport, for themes to target. Core's position render filter is removed, but only if it's found under its expected name.
- **Editor:** the same CSS is added to the canvas with `useStyleOverride()`. Core's own dropdown and preview are switched off through the `blockEditor.useSetting.before` filter.
- Saved block markup is never changed. Deactivating the plugin hands Sticky (and Fixed) back to core; Relative, Absolute, Layer and viewport values stop applying.

The CSS logic lives in two places that must stay in sync: `App/Features/Position/Styles.php` (front end) and `src/position/utils/position.js` (editor).

#### Editor helpers

- A selected Absolute or Fixed block is brought to the front of the canvas, so it stays reachable.
- A block with Absolute or Fixed blocks inside it gets a **Show positioned blocks in normal flow** toolbar button. It's editor-only and never saved, for reaching the blocks beneath.

### Known limitations

- Inset values can't be negative, because core's BoxControl doesn't allow them.

## Inline icons

Feature slug: `inline-icons`

Add icons from the WordPress icon library inside text: Buttons, Paragraphs, Headings, List items and anywhere else with rich text. It works like core's **Inline image**: choose **Inline icon** from the text toolbar's **More** (⌄) menu, then pick an icon. Any icon registered with `wp_register_icon()` is available, including core's and the theme's.

Select an icon in the text to change it, or to set:

- **Width** in pixels. Leave empty for the default size: the theme's, or the text size (`1em`).
- **Color**. Leave empty for the default: the theme's, or the text colour, so the icon follows the text, including hover colours on buttons.
- **Hover** colour, shown when the icon is inside a link or button.
- **Label** for screen readers. Leave empty for a decorative icon.

### Markup

Content only stores the icon's name, as an image tag like core's inline image, so it's easy to write in patterns. The `alt` text is the label; leave it empty for a decorative icon:

```html
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Download <img class="wp-inline-icon" data-icon="core/arrow-down" alt=""></a></div>
<!-- /wp:button -->
```

With settings:

```html
<img class="wp-inline-icon" data-icon="core/arrow-right" alt="Next"
	style="--wp-inline-icon--size:24px;--wp-inline-icon--color:var(--wp--preset--color--primary);--wp-inline-icon--hover-color:var(--wp--preset--color--base)">
```

Palette colours are saved as their preset variable, so changing the palette in theme.json updates existing icons. Only palette colours are offered unless the theme allows custom colours (`settings.color.custom`).

Rich text saves inline objects as void tags (no closing tag), which is why it's an `img` rather than a `span`.

Icons are centred on the height of capital letters, using CSS's `cap` unit where supported, so they line up with button text.

### Buttons

A Button with an icon becomes `inline-flex`, so it stays the width of its content, with a gap between text and icon. If the button is made wider (its width setting, or styles on the Buttons block or a parent), the text and icon move to opposite ends, on the side each was placed: an icon after the text goes to the right, one before goes to the left.

The gap defaults to `0.5em`; see below to change it.

### Theme defaults

Themes can set defaults in theme.json, using WordPress's `settings.custom`. Each icon's own settings still take priority.

| Setting | Default | Applies to |
|---|---|---|
| `size` | `1em` (the text size) | Icon width and height |
| `color` | The text colour | Icon colour |
| `hoverColor` | The icon's colour | Icon colour when its link or button is hovered |
| `gap` | `0.5em` | Space between a button's text and icon |

For all icons:

```json
"settings": {
  "custom": {
    "inlineIcon": { "size": "1.25em", "gap": "0.75rem" }
  }
}
```

For icons in buttons, as block-level settings. These apply to every button style unless a style variation sets its own:

```json
"settings": {
  "blocks": {
    "core/button": {
      "custom": {
        "inlineIcon": {
          "color": "var(--wp--preset--color--tertiary)",
          "hoverColor": "var(--wp--preset--color--base)"
        }
      }
    }
  }
}
```

`settings.custom` values are plain CSS, so presets are written as `var(--wp--preset--color--slug)`, not `var:preset|color|slug`.

#### Button style variations

A block style variation can set its own icon defaults with its `css` property, using the same variables an icon uses: `--wp-inline-icon--size`, `--wp-inline-icon--color`, `--wp-inline-icon--hover-color` and `--wp-inline-icon--gap`. For example, in a theme's `styles/button-outline.json` partial:

```json
{
  "version": 3,
  "title": "Outline",
  "slug": "outline",
  "blockTypes": [ "core/button" ],
  "styles": {
    "color": { "text": "var:preset|color|primary" },
    "css": "--wp-inline-icon--color: var(--wp--preset--color--tertiary); --wp-inline-icon--hover-color: var(--wp--preset--color--base);"
  }
}
```

The variation's values apply to the button and its icons inherit them. They override the button-level and site-wide defaults, but not an icon's own settings.

**Why the variation uses different names:** WordPress outputs block-level custom settings on the button with higher specificity than a variation's `css`. If both set `--wp--custom--inline-icon--color`, the button-level default would win over the variation. Using the icon variables (`--wp-inline-icon--*`) avoids that.

### How it works

- **Front end:** a `render_block` filter replaces each `img.wp-inline-icon` with a `span.wp-inline-icon` containing the icon's SVG from `wp_get_icon()`, keeping its classes and style. The alt text becomes the span's `aria-label`.
- **Editor:** the editor draws each icon as a CSS mask on the image, using the SVG from `/wp/v2/icons`.
- **Why not save the SVG:** WordPress strips `<svg>` from content for users without `unfiltered_html`. The image tag and its attributes are allowed for everyone, patterns only need the icon's name, and changes to an icon apply everywhere it's used.

If the plugin is deactivated, icons become image tags without a source, which show nothing (or the alt text, in some browsers). Content stays valid and they come back on reactivation.

#### Limitations

- Icons with more than one colour show in a single colour in the editor (the front end shows them correctly). Icons registered with `wp_register_icon()` are normally single-colour.

## Group link

Feature slug: `group-link`

Make a whole **Group**, **Row**, **Stack**, **Grid**, **Column** or **Cover** block a clickable link, such as a card that links to a post, with links and buttons inside it still working.

Select the block and use **Link** in its toolbar. It's core's link popover, the same one Button and Navigation use: search for content or paste a URL, and choose whether it opens in a new tab. A **Link label** can be set for screen readers.

Nothing is added to the saved markup, so there are no block validation issues, and deactivating the plugin leaves ordinary blocks.

### How it works

The block itself isn't turned into a link, because links can't contain other links or buttons, which cards usually have. Instead, at render time:

```html
<div class="wp-block-group has-group-link …">
  …block content…
  <a class="wp-group-link" href="/case-study" aria-labelledby="wp-group-link-heading-1"></a>
</div>
```

- The block gets `has-group-link` and `position: relative`.
- A link is added as its **last direct child** and stretched over it (`position: absolute; inset: 0`). Being a direct child, it always covers the whole block, even if something inside is positioned (such as a Cover, or a block using the position plugin).
- Links, buttons and form fields inside are raised above it, so they still work.
- It's absolutely positioned, so it takes no space, gap or slot in Row (flex) and Grid layouts. It overrides the margins and `max-width` that constrained and flow layouts give children.
- The `position` and raising rules have no specificity (`:where()`), so Sticky, the position plugin or theme CSS always win.
- A linked block inside another linked block stays clickable above the outer link.

#### Accessibility

The added link is named automatically:

1. **If a link or button inside already goes to the same URL** (e.g. a "Read more" button), the added link is hidden from screen readers and keyboard focus (`aria-hidden="true" tabindex="-1"`). It's just a bigger click target, and the existing link is the accessible one. Relative and absolute URLs, and trailing slashes, are treated as the same.
2. Otherwise, by its **Link label**, if set.
3. Otherwise, by the block's **first heading** (`aria-labelledby`, adding an `id` to the heading if needed).
4. Otherwise, "Read more".

The link's focus ring outlines the whole block, following its border radius.

One limitation of the pattern: text inside a linked block can't be selected with the mouse, as the link covers it.

#### Styling

Themes can style linked blocks with the `has-group-link` class, for example a hover effect:

```css
.has-group-link:has(> .wp-group-link:hover) {
	translate: 0 -2px;
}
```

## Development

```bash
npm install
npm start          # watch
npm run build      # production build — commit build/ before tagging a release
npm run lint:js
npm run lint:css
composer install
composer lint      # PHPCS (WordPress VIP)
```

Each feature lives in `App/Features/<Feature>/` (PHP) and `src/<feature>/` (editor), and builds to `build/<feature>/`. Shared code is in `App/Shared/` and `src/shared/`. To add a feature, add its folder, its `Feature::register()` class, an entry in `Features::ALL`, and its entries in `webpack.config.js`.

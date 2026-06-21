# Bible Compare

An Obsidian plugin for reading and comparing Bible translations side-by-side in a resizable pane.

![](https://img.shields.io/badge/Obsidian-Plugin-7C3AED?logo=obsidian)

## Features

- **Side-by-side comparison** — view up to 3 translations in parallel columns
- **Single-version reader** — clean, focused reading layout for one translation
- **Multi-passage support** — `John 3:16-18; 6:1` or `Rom 12:1-2; 1 Cor 13`
- **In-view translation swap** — swap any column's translation via dropdown, no need to reopen the picker
- **Chapter navigation** — prev/next arrows and clickable chapter pills (±5 chapters)
- **Copy to clipboard** — formatted text with translation labels and verse markers
- **Book/chapter separators** — multi-chapter passages show `— John 3 —` separators with chapter-aware verse labels

## Installation

### Via BRAT (recommended for updates)

1. Install the [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) community plugin
2. Open command palette → `BRAT: Add a beta plugin for testing`
3. Enter `https://github.com/cansas/bible-compare`
4. Enable **Bible Compare** in Settings → Community plugins

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release or the repo
2. Copy them to your vault at `<vault>/.obsidian/plugins/bible-compare/`
3. Enable the plugin in Settings → Community plugins

### Development / symlink

```bash
git clone git@github.com:cansas/bible-compare.git /path/to/your/vault/.obsidian/plugins/bible-compare
```

## Usage

### Opening the plugin

Two commands are registered in the command palette:

| Command | Description |
|---------|-------------|
| **Open passage comparison** | Pick translations, enter a passage, see side-by-side columns |
| **Open single-version reader** | Same but one translation, cleaner reading layout |

### Passage syntax

| Example | What it loads |
|---------|---------------|
| `Genesis 1` | Whole chapter 1 |
| `John 3:16` | Single verse |
| `Psalms 23:1-6` | Verse range |
| `John 3:1-4; 6:1` | Multiple passages, same book |
| `Rom 12:1-2; 1 Cor 13` | Multiple passages, different books |

### In the view

- **‹** / **›** — previous / next chapter (first passage only in multi-passage mode)
- **Chapter pills** — jump to nearby chapters (first passage only)
- **⇄ dropdown** — swap a column's translation without reopening the picker
- **📋** — copy all displayed text to clipboard
- **1** — switch to single-version reader (compare mode only)
- **📖 Pick** — reopen the translation picker

## Vault structure

The plugin expects Bible translations stored in your vault as folders matching `Scripture (XXX)/`, where `XXX` is the translation abbreviation (e.g. `NRSV`, `NIV`, `CEB`).

### Folder layout

```
Scripture (NRSV)/
  01 - Genesis/
    Gen-01.md
    Gen-02.md
    ...
  02 - Exodus/
    Exod-01.md
    ...
  40 - Matthew/
    Matt-01.md
    ...
Scripture (NIV)/
  01 - Genesis/
    Gen-01.md
    ...
```

Book folders follow the pattern `NN - Book Name/` where `NN` is the canonical book number (01–66). File names can vary — the plugin parses the trailing number before `.md` as the chapter number (e.g. `Gen-01.md` → chapter 1, `Psalms-150.md` → chapter 150).

### Verse format

Each chapter file uses Markdown headings for verse markers:

```markdown
###### v1 In the beginning when God created the heavens and the earth,
###### v2 the earth was a formless void and darkness covered the face of the deep,
```

Verses continue on subsequent indented lines until the next `###### vN` heading.

## Development

Plain JavaScript, no build step. Drop the files into an Obsidian vault's plugins directory and reload.

```bash
git clone git@github.com:cansas/bible-compare.git
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/bible-compare/
```

## License

MIT

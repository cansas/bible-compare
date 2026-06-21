/*
 * Bible Compare — Obsidian plugin for reading and comparing translations
 * Uses a resizable ItemView (pane) instead of a modal.
 *
 * Install: .obsidian/plugins/bible-compare/ → enable in settings.
 * Plain JavaScript, no build step.
 */

const { Plugin, Modal, ItemView, Setting, Notice, WorkspaceLeaf, MarkdownRenderer } = require('obsidian');

// ── Constants ──────────────────────────────────────────────────────
const VIEW_TYPE = 'bible-compare-view';

const BOOK_NUM = {
  'genesis': 1, 'exodus': 2, 'leviticus': 3, 'numbers': 4,
  'deuteronomy': 5, 'joshua': 6, 'judges': 7, 'ruth': 8,
  '1 samuel': 9, '2 samuel': 10, '1 kings': 11, '2 kings': 12,
  '1 chronicles': 13, '2 chronicles': 14, 'ezra': 15, 'nehemiah': 16,
  'esther': 17, 'job': 18, 'psalms': 19, 'psalm': 19,
  'proverbs': 20, 'ecclesiastes': 21, 'song of solomon': 22,
  'song of songs': 22, 'isaiah': 23, 'jeremiah': 24,
  'lamentations': 25, 'ezekiel': 26, 'daniel': 27, 'hosea': 28,
  'joel': 29, 'amos': 30, 'obadiah': 31, 'jonah': 32,
  'micah': 33, 'nahum': 34, 'habakkuk': 35, 'zephaniah': 36,
  'haggai': 37, 'zechariah': 38, 'malachi': 39,
  'matthew': 40, 'mark': 41, 'luke': 42, 'john': 43,
  'acts': 44, 'romans': 45, '1 corinthians': 46,
  '2 corinthians': 47, 'galatians': 48, 'ephesians': 49,
  'philippians': 50, 'colossians': 51, '1 thessalonians': 52,
  '2 thessalonians': 53, '1 timothy': 54, '2 timothy': 55,
  'titus': 56, 'philemon': 57, 'hebrews': 58, 'james': 59,
  '1 peter': 60, '2 peter': 61, '1 john': 62, '2 john': 63,
  '3 john': 64, 'jude': 65, 'revelation': 66,
};

const BOOK_ALIASES = {
  'gen': 'genesis', 'ex': 'exodus', 'exod': 'exodus',
  'lev': 'leviticus', 'num': 'numbers', 'deut': 'deuteronomy',
  'josh': 'joshua', 'judg': 'judges', 'ru': 'ruth',
  '1sam': '1 samuel', '2sam': '2 samuel',
  '1kgs': '1 kings', '2kgs': '2 kings',
  '1chron': '1 chronicles', '1chr': '1 chronicles',
  '2chron': '2 chronicles', '2chr': '2 chronicles',
  'ezra': 'ezra', 'neh': 'nehemiah', 'esth': 'esther',
  'job': 'job', 'ps': 'psalms', 'psa': 'psalms',
  'prov': 'proverbs', 'eccl': 'ecclesiastes', 'ecc': 'ecclesiastes',
  'song': 'song of solomon', 'sos': 'song of solomon',
  'isa': 'isaiah', 'jer': 'jeremiah', 'lam': 'lamentations',
  'ezek': 'ezekiel', 'ezk': 'ezekiel', 'dan': 'daniel',
  'hos': 'hosea', 'joel': 'joel', 'amos': 'amos',
  'obad': 'obadiah', 'jon': 'jonah', 'mic': 'micah',
  'nah': 'nahum', 'hab': 'habakkuk', 'zeph': 'zephaniah',
  'hag': 'haggai', 'zech': 'zechariah', 'mal': 'malachi',
  'matt': 'matthew', 'mt': 'matthew', 'mk': 'mark',
  'lk': 'luke', 'jn': 'john',
  'rom': 'romans', '1cor': '1 corinthians', '2cor': '2 corinthians',
  'gal': 'galatians', 'eph': 'ephesians', 'ephes': 'ephesians',
  'phil': 'philippians', 'col': 'colossians',
  '1thess': '1 thessalonians', '2thess': '2 thessalonians',
  '1tim': '1 timothy', '2tim': '2 timothy',
  'tit': 'titus', 'philem': 'philemon', 'phlm': 'philemon',
  'heb': 'hebrews', 'jas': 'james',
  '1pet': '1 peter', '2pet': '2 peter',
  '1jn': '1 john', '2jn': '2 john', '3jn': '3 john',
  'jude': 'jude', 'rev': 'revelation',
};

const BOOK_FOLDER_NAMES = {
  1: '01 - Genesis', 2: '02 - Exodus', 3: '03 - Leviticus',
  4: '04 - Numbers', 5: '05 - Deuteronomy', 6: '06 - Joshua',
  7: '07 - Judges', 8: '08 - Ruth', 9: '09 - 1 Samuel',
  10: '10 - 2 Samuel', 11: '11 - 1 Kings', 12: '12 - 2 Kings',
  13: '13 - 1 Chronicles', 14: '14 - 2 Chronicles', 15: '15 - Ezra',
  16: '16 - Nehemiah', 17: '17 - Esther', 18: '18 - Job',
  19: '19 - Psalms', 20: '20 - Proverbs', 21: '21 - Ecclesiastes',
  22: '22 - Song of Solomon', 23: '23 - Isaiah', 24: '24 - Jeremiah',
  25: '25 - Lamentations', 26: '26 - Ezekiel', 27: '27 - Daniel',
  28: '28 - Hosea', 29: '29 - Joel', 30: '30 - Amos',
  31: '31 - Obadiah', 32: '32 - Jonah', 33: '33 - Micah',
  34: '34 - Nahum', 35: '35 - Habakkuk', 36: '36 - Zephaniah',
  37: '37 - Haggai', 38: '38 - Zechariah', 39: '39 - Malachi',
  40: '40 - Matthew', 41: '41 - Mark', 42: '42 - Luke',
  43: '43 - John', 44: '44 - Acts', 45: '45 - Romans',
  46: '46 - 1 Corinthians', 47: '47 - 2 Corinthians',
  48: '48 - Galatians', 49: '49 - Ephesians', 50: '50 - Philippians',
  51: '51 - Colossians', 52: '52 - 1 Thessalonians',
  53: '53 - 2 Thessalonians', 54: '54 - 1 Timothy',
  55: '55 - 2 Timothy', 56: '56 - Titus', 57: '57 - Philemon',
  58: '58 - Hebrews', 59: '59 - James', 60: '60 - 1 Peter',
  61: '61 - 2 Peter', 62: '62 - 1 John', 63: '63 - 2 John',
  64: '64 - 3 John', 65: '65 - Jude', 66: '66 - Revelation',
};

// Map book name to max chapters (from actual file counts in CEB)
const MAX_CHAPTERS = {
  1: 50, 2: 40, 3: 27, 4: 36, 5: 34, 6: 24, 7: 21, 8: 4,
  9: 31, 10: 24, 11: 22, 12: 25, 13: 29, 14: 36, 15: 10,
  16: 13, 17: 10, 18: 42, 19: 150, 20: 31, 21: 12, 22: 8,
  23: 66, 24: 52, 25: 5, 26: 48, 27: 12, 28: 14, 29: 3,
  30: 9, 31: 1, 32: 4, 33: 7, 34: 3, 35: 3, 36: 3,
  37: 2, 38: 14, 39: 4, 40: 28, 41: 16, 42: 24, 43: 21,
  44: 28, 45: 16, 46: 16, 47: 13, 48: 6, 49: 6, 50: 4,
  51: 4, 52: 5, 53: 3, 54: 6, 55: 4, 56: 3, 57: 1,
  58: 13, 59: 5, 60: 5, 61: 3, 62: 5, 63: 1, 64: 1,
  65: 1, 66: 22,
};

// ── Helpers ────────────────────────────────────────────────────────
function parsePassage(raw) {
  raw = raw.trim();
  const m = raw.match(/^(.+?)\s+(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/);
  if (!m) return null;
  const bookRaw = m[1].toLowerCase().trim();
  const canonical = BOOK_ALIASES[bookRaw] || bookRaw;
  const bookNum = BOOK_NUM[canonical];
  if (!bookNum) return null;
  const bookName = BOOK_FOLDER_NAMES[bookNum].replace(/^\d+ - /, '');
  const chapter = parseInt(m[2], 10);
  const verseStart = m[3] ? parseInt(m[3], 10) : null;
  const verseEnd = m[4] ? parseInt(m[4], 10) : verseStart;
  return { bookNum, bookName, chapter, verseStart, verseEnd };
}

function passageToString(p) {
  let s = `${p.bookName} ${p.chapter}`;
  if (p.verseStart !== null) {
    s += `:${p.verseStart}`;
    if (p.verseEnd && p.verseEnd !== p.verseStart) {
      s += `–${p.verseEnd}`;
    }
  }
  return s;
}

// Get prev/next chapter boundaries
function adjacentChapter(bookNum, chapter, dir) {
  const max = MAX_CHAPTERS[bookNum];
  if (!max) return null;
  const next = chapter + dir;
  if (next < 1 || next > max) return null;
  return next;
}

function parseChapter(content) {
  const verses = {};
  let currentV = null;
  const lines = content.split('\n');
  for (const line of lines) {
    const vm = line.match(/^######\s*v(\d+)\s*/);
    if (vm) {
      currentV = parseInt(vm[1], 10);
      const text = line.replace(/^######\s*v\d+\s*/, '').trim();
      verses[currentV] = text ? text + ' ' : '';
    } else if (currentV !== null && line.trim()) {
      const trimmed = line.trim();
      // Skip trailing navigation links ([[...]]) and separators (***)
      // that BibleGateway-style export appends after the last verse.
      if (trimmed === '***' || trimmed.startsWith('[[')) {
        continue;
      }
      verses[currentV] = (verses[currentV] || '') + trimmed + ' ';
    }
  }
  for (const k of Object.keys(verses)) {
    verses[k] = verses[k].trim();
  }
  return verses;
}

function htmlEscape(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
}

// ── Plugin ─────────────────────────────────────────────────────────
module.exports = class BibleComparePlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE, (leaf) => new BibleCompareView(leaf, this));

    this.addCommand({
      id: 'open-bible-compare',
      name: 'Open passage comparison',
      callback: () => new PassagePickerModal(this.app, this).open(),
    });

    this.addCommand({
      id: 'open-bible-reader',
      name: 'Open single-version reader',
      callback: () => new PassagePickerModal(this.app, this, { singleMode: true }).open(),
    });

    // Restore view if it was open when Obsidian last closed
    this.app.workspace.onLayoutReady(() => {
      // Nothing special needed — registerView handles restoration
    });
  }

  async openView(data) {
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({
      type: VIEW_TYPE,
      state: data || {},
    });
    this.app.workspace.revealLeaf(leaf);
    return leaf;
  }
};

// ── Passage Picker Modal ───────────────────────────────────────────
class PassagePickerModal extends Modal {
  constructor(app, plugin, opts = {}) {
    super(app);
    this.plugin = plugin;
    this.singleMode = opts.singleMode || false;
    this.translationDirs = [];
    this.selected = new Set();
    this.passageInput = '';
  }

  async onOpen() {
    await this.scanTranslations();
    this.render();
  }

  async scanTranslations() {
    const all = this.app.vault.getAllLoadedFiles();
    this.translationDirs = all
      .filter(f => f.children && f.name && /^Scripture\s*\(.+\)$/.test(f.name))
      .map(f => {
        const m = f.name.match(/^Scripture\s*\((.+)\)$/);
        return { path: f.name, label: m ? m[1] : f.name };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    if (this.singleMode) {
      // Default: select the first one for reader mode
      if (this.translationDirs.length > 0) {
        this.selected.add(this.translationDirs[0].path);
      }
    } else {
      // Default: first 3 for comparison
      this.translationDirs.slice(0, 3).forEach(t => this.selected.add(t.path));
    }
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bible-compare-picker');

    const mode = this.singleMode ? '📖 Read' : '📖 Compare';
    contentEl.createEl('h2', { text: mode });
    contentEl.createEl('p', {
      text: 'Enter a passage (e.g. "Genesis 1", "John 3:16", "Psalms 23:1-6")',
      cls: 'bible-compare-hint',
    });

    const input = contentEl.createEl('input', {
      type: 'text',
      placeholder: 'e.g. Genesis 1 or John 3:16-18',
      cls: 'bible-compare-input',
      value: this.passageInput,
    });
    this.inputEl = input;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submit();
    });
    input.focus();

    contentEl.createEl('h3', { text: this.singleMode ? 'Translation' : 'Translations' });

    const list = contentEl.createDiv({ cls: 'bible-compare-tx-list' });
    this.translationDirs.forEach(t => {
      const setting = new Setting(list)
        .setName(t.label)
        .addToggle(toggle => {
          toggle.setValue(this.selected.has(t.path));
          toggle.onChange(v => {
            if (v) this.selected.add(t.path);
            else this.selected.delete(t.path);
          });
        });
    });

    const btnRow = contentEl.createDiv({ cls: 'bible-compare-btn-row' });
    const btn = btnRow.createEl('button', {
      text: this.singleMode ? 'Read' : 'Compare',
      cls: 'bible-compare-btn',
    });
    btn.addEventListener('click', () => this.submit());
  }

  submit() {
    this.passageInput = this.inputEl.value.trim();
    if (!this.passageInput) { new Notice('Enter a passage reference.'); return; }
    if (this.selected.size < 1) { new Notice('Select at least one translation.'); return; }

    const parsed = parsePassage(this.passageInput);
    if (!parsed) {
      new Notice('Could not parse passage. Try "Genesis 1" or "John 3:16-18".');
      return;
    }

    this.close();
    this.plugin.openView({
      passage: parsed,
      passageStr: passageToString(parsed),
      translations: Array.from(this.selected),
      translationLabels: this.translationDirs.reduce((m, t) => { m[t.path] = t.label; return m; }, {}),
    });
  }
}

// ── Bible Compare View ─────────────────────────────────────────────
class BibleCompareView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.data = null;
    this.loadedData = null;  // cached results
  }

  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return this.data ? this.data.passageStr : 'Bible'; }
  getIcon() { return 'book-open'; }

  async onOpen() {
    this.render();
  }

  async setState(state, result) {
    this.data = state;
    this.loadedData = result || null;
    this.render();
  }

  getState() {
    return this.data || {};
  }

  // ── Main render ──────────────────────────────────────────────────
  async render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bible-compare-view');

    // ── Top bar: nav + input ──────────────────────────────────────
    const topBar = contentEl.createDiv({ cls: 'bc-top-bar' });

    // Previous chapter button
    if (this.data) {
      const prevCh = adjacentChapter(this.data.passage.bookNum, this.data.passage.chapter, -1);
      const prevBtn = topBar.createEl('button', {
        text: '‹',
        cls: 'bc-nav-btn bc-nav-prev',
        attr: { title: prevCh ? `${this.data.passage.bookName} ${prevCh}` : 'No previous' },
      });
      if (prevCh) {
        prevBtn.addEventListener('click', () => this.goToChapter(this.data.passage.bookNum, prevCh));
      } else {
        prevBtn.addClass('bc-nav-disabled');
      }
    }

    // Passage input
    const input = topBar.createEl('input', {
      type: 'text',
      placeholder: 'Genesis 1 or John 3:16 …',
      cls: 'bc-passage-input',
      value: this.data ? this.data.passageStr : '',
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.loadPassage(input.value.trim());
    });

    // Go button
    const goBtn = topBar.createEl('button', {
      text: 'Go',
      cls: 'bc-go-btn',
    });
    goBtn.addEventListener('click', () => this.loadPassage(input.value.trim()));

    // New picker button
    const pickBtn = topBar.createEl('button', {
      text: '📖 Pick',
      cls: 'bc-pick-btn',
      attr: { title: 'Open passage picker' },
    });
    pickBtn.addEventListener('click', () => {
      // Show a small modal or re-use the picker
      new PassagePickerModal(this.app, this.plugin).open();
    });

    // Toggle single/compare button
    if (this.data && this.data.translations && this.data.translations.length > 1) {
      const singleBtn = topBar.createEl('button', {
        text: '1',
        cls: 'bc-single-btn',
        attr: { title: 'Single translation view' },
      });
      singleBtn.addEventListener('click', () => this.toggleSingleView());
    }

    // Next chapter button
    if (this.data) {
      const nextCh = adjacentChapter(this.data.passage.bookNum, this.data.passage.chapter, 1);
      const nextBtn = topBar.createEl('button', {
        text: '›',
        cls: 'bc-nav-btn bc-nav-next',
        attr: { title: nextCh ? `${this.data.passage.bookName} ${nextCh}` : 'No next' },
      });
      if (nextCh) {
        nextBtn.addEventListener('click', () => this.goToChapter(this.data.passage.bookNum, nextCh));
      } else {
        nextBtn.addClass('bc-nav-disabled');
      }
    }

    // ── Content area ──────────────────────────────────────────────
    this.contentArea = contentEl.createDiv({ cls: 'bc-content' });

    if (!this.data) {
      this.contentArea.createEl('p', {
        text: 'Use the passage input above or click 📖 Pick to compare translations.',
        cls: 'bc-empty-hint',
      });
      return;
    }

    if (!this.loadedData) {
      this.loadContent();
    } else {
      await this.renderContent();
    }
  }

  // ── Load passage from all translations ──────────────────────────
  async loadPassage(raw) {
    const parsed = parsePassage(raw);
    if (!parsed) { new Notice('Could not parse passage.'); return; }

    // Preserve translation selection from current state
    const translations = this.data ? this.data.translations : [];
    const labels = this.data ? this.data.translationLabels : {};

    this.data = {
      passage: parsed,
      passageStr: passageToString(parsed),
      translations,
      translationLabels: labels,
    };
    this.loadedData = null;
    this.render();
  }

  async goToChapter(bookNum, chapter) {
    const bookName = BOOK_FOLDER_NAMES[bookNum].replace(/^\d+ - /, '');
    const parsed = { bookNum, bookName, chapter, verseStart: null, verseEnd: null };
    this.data = {
      passage: parsed,
      passageStr: passageToString(parsed),
      translations: this.data.translations,
      translationLabels: this.data.translationLabels,
    };
    this.loadedData = null;
    this.render();
  }

  toggleSingleView() {
    if (!this.data || !this.data.translations) return;
    // Switch to just the first translation
    const first = this.data.translations[0];
    new PassagePickerModal(this.app, this.plugin, { singleMode: true }).open();
  }

  // ── Load file content ───────────────────────────────────────────
  async loadContent() {
    const { contentArea } = this;
    contentArea.empty();
    contentArea.createEl('p', { text: 'Loading...', cls: 'bc-loading' });

    const { passage, translations, translationLabels } = this.data;
    const folderName = BOOK_FOLDER_NAMES[passage.bookNum];
    const results = [];

    for (const txPath of translations) {
      const label = translationLabels[txPath] || txPath;
      const bookDir = `${txPath}/${folderName}`;
      const folder = this.app.vault.getAbstractFileByPath(bookDir);
      if (!folder || !folder.children) {
        results.push({ label, error: 'Book folder not found' });
        continue;
      }

      const chapFiles = folder.children.filter(c => c.extension === 'md');
      const targetFile = chapFiles.find(f => {
        const parts = f.name.replace(/\.md$/, '').split('-');
        return parseInt(parts[parts.length - 1], 10) === passage.chapter;
      });
      const fallbackFile = !targetFile
        ? chapFiles.find(f => isNaN(parseInt(f.name.replace(/\.md$/, '').split('-').pop(), 10)))
        : null;

      const file = targetFile || fallbackFile;
      if (!file) {
        results.push({ label, error: `Chapter ${passage.chapter} not found` });
        continue;
      }

      const content = await this.app.vault.read(file);
      const allVerses = parseChapter(content);
      const verseKeys = Object.keys(allVerses).map(Number).sort((a, b) => a - b);

      let verses;
      if (passage.verseStart !== null) {
        verses = {};
        const end = passage.verseEnd || passage.verseStart;
        for (let v = passage.verseStart; v <= end; v++) {
          if (allVerses[v] !== undefined) verses[v] = allVerses[v];
        }
        if (Object.keys(verses).length === 0) {
          results.push({ label, error: `Verses not found` });
          continue;
        }
      } else {
        verses = allVerses;
      }

      results.push({ label, verses });
    }

    this.loadedData = results;
    await this.renderContent();
  }

  // ── Render results ──────────────────────────────────────────────
  async renderContent() {
    const { contentArea, data, loadedData } = this;
    if (!contentArea || !loadedData) return;
    contentArea.empty();

    const results = loadedData;
    const isSingle = results.length <= 1 && data;
    const colCount = isSingle ? 1 : Math.min(results.length, 3);

    // Passage heading
    const headRow = contentArea.createDiv({ cls: 'bc-head-row' });
    headRow.createEl('h2', { text: data.passageStr, cls: 'bc-passage-heading' });

    // Chapter nav pills
    const bookNum = data.passage.bookNum;
    const curCh = data.passage.chapter;
    const navPills = headRow.createDiv({ cls: 'bc-chapter-pills' });
    const maxCh = MAX_CHAPTERS[bookNum] || 50;
    const start = Math.max(1, curCh - 5);
    const end = Math.min(maxCh, curCh + 5);
    for (let c = start; c <= end; c++) {
      const pill = navPills.createEl('span', {
        text: c,
        cls: 'bc-chapter-pill' + (c === curCh ? ' bc-chapter-pill-active' : ''),
      });
      if (c !== curCh) {
        pill.addEventListener('click', () => this.goToChapter(bookNum, c));
      }
    }

    // Copy button
    const copyBtn = headRow.createEl('button', {
      text: '📋',
      cls: 'bc-copy-btn',
      attr: { title: 'Copy to clipboard' },
    });
    copyBtn.addEventListener('click', () => this.copyResults());

    // ── Comparison columns ────────────────────────────────────────
    const grid = contentArea.createDiv({
      cls: `bc-grid bc-cols-${colCount}${isSingle ? ' bc-single' : ''}`,
    });

    for (const r of results) {
      const col = grid.createDiv({ cls: 'bc-col' });
      col.createEl('h3', { text: r.label, cls: 'bc-col-label' });

      if (r.error) {
        col.createEl('p', { text: r.error, cls: 'bc-col-error' });
        continue;
      }

      const para = col.createDiv({ cls: 'bc-para' });
      const verseKeys = Object.keys(r.verses).map(Number).sort((a, b) => a - b);

      // Build markdown text for Obsidian's renderer
      let md = '';
      if (isSingle && verseKeys.length > 1) {
        verseKeys.forEach((vk, i) => {
          if (i > 0) md += ' ';
          md += `**${vk}** ${r.verses[vk]}`;
        });
      } else if (verseKeys.length > 1) {
        verseKeys.forEach((vk, i) => {
          if (i > 0) md += ' ';
          md += r.verses[vk];
        });
      } else {
        md = r.verses[verseKeys[0]] || '';
      }

      await MarkdownRenderer.render(this.app, md, para, '', this);
    }
  }

  // ── Copy to clipboard ───────────────────────────────────────────
  async copyResults() {
    if (!this.data || !this.loadedData) return;
    let txt = `# ${this.data.passageStr}\n\n`;
    this.loadedData.forEach(r => {
      if (r.error) return;
      txt += `**${r.label}**\n`;
      const vk = Object.keys(r.verses).map(Number).sort((a, b) => a - b);
      if (vk.length > 1) {
        vk.forEach(k => { txt += `[${k}] ${r.verses[k]}\n`; });
      } else {
        txt += r.verses[vk[0]] + '\n';
      }
      txt += '\n';
    });
    try {
      await navigator.clipboard.writeText(txt);
      new Notice('Copied to clipboard');
    } catch (e) {
      new Notice('Could not copy');
    }
  }
}

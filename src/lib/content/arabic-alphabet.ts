/**
 * Reference data for the "Arabic Letters" and "Foundational Quran Reading"
 * categories. This file contains only objective linguistic facts — the
 * standard Arabic alphabet and its three short-vowel diacritics (harakat).
 *
 * It contains NO Qur'anic verses, surah text, or religious instructional
 * content. That content does not exist yet, must never be generated or
 * fabricated, and — per `RELIGIOUS_REVIEW_REQUIRED_CATEGORIES` in
 * ./types.ts — can only go live once a qualified person has verified it.
 */

export interface ArabicLetter {
  letter: string;
  name: string;
  transliteration: string;
}

/** The 28 letters of the Arabic abjad, in traditional order. */
export const ARABIC_ALPHABET: ArabicLetter[] = [
  { letter: "ا", name: "Alif", transliteration: "a" },
  { letter: "ب", name: "Ba", transliteration: "b" },
  { letter: "ت", name: "Ta", transliteration: "t" },
  { letter: "ث", name: "Tha", transliteration: "th" },
  { letter: "ج", name: "Jeem", transliteration: "j" },
  { letter: "ح", name: "Ha", transliteration: "h" },
  { letter: "خ", name: "Kha", transliteration: "kh" },
  { letter: "د", name: "Dal", transliteration: "d" },
  { letter: "ذ", name: "Dhal", transliteration: "dh" },
  { letter: "ر", name: "Ra", transliteration: "r" },
  { letter: "ز", name: "Zay", transliteration: "z" },
  { letter: "س", name: "Seen", transliteration: "s" },
  { letter: "ش", name: "Sheen", transliteration: "sh" },
  { letter: "ص", name: "Sad", transliteration: "s" },
  { letter: "ض", name: "Dad", transliteration: "d" },
  { letter: "ط", name: "Taa", transliteration: "t" },
  { letter: "ظ", name: "Dhaa", transliteration: "z" },
  { letter: "ع", name: "Ain", transliteration: "'" },
  { letter: "غ", name: "Ghain", transliteration: "gh" },
  { letter: "ف", name: "Fa", transliteration: "f" },
  { letter: "ق", name: "Qaf", transliteration: "q" },
  { letter: "ك", name: "Kaf", transliteration: "k" },
  { letter: "ل", name: "Lam", transliteration: "l" },
  { letter: "م", name: "Meem", transliteration: "m" },
  { letter: "ن", name: "Noon", transliteration: "n" },
  { letter: "هـ", name: "Ha", transliteration: "h" },
  { letter: "و", name: "Waw", transliteration: "w" },
  { letter: "ي", name: "Ya", transliteration: "y" },
];

export interface Harakah {
  name: string;
  mark: string;
  sound: string;
}

/** The three short-vowel diacritics foundational to early Qur'an reading. */
export const HARAKAT: Harakah[] = [
  { name: "Fatha", mark: "َ", sound: "a" },
  { name: "Kasra", mark: "ِ", sound: "i" },
  { name: "Damma", mark: "ُ", sound: "u" },
];

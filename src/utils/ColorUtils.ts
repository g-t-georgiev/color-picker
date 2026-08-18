import { ColorFormat, type ParsedColor } from "../types";

// Master regex compiled as a static RegExp object in TypeScript
const CSS_COLOR_REGEX: RegExp = /^(?:#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*,\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*,\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*(?:,\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\)|rgba?\(\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s+(?:\d{1,3}%?|\d+(?:\.\d+)?)\s+(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*(?:\/\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\)|hsla?\(\s*(?:\d+(?:\.\d+)?(?:deg|rad|turn)?)\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\)|hsla?\(\s*(?:\d+(?:\.\d+)?(?:deg|rad|turn)?)\s+\d{1,3}%\s+\d{1,3}%\s*(?:\/\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\))$/i;

// Extraction regexes for parsing (isolated from validation)
const HEX_PARSE_REGEX = /^#([0-9a-f]{3,8})$/;
const FUNC_PARSE_REGEX = /^(rgb|hsl)a?\s*\(\s*([\d.%]+)(deg|rad|turn)?\s*[, ]\s*([\d.%]+)\s*[, ]\s*([\d.%]+)(?:\s*[/,]\s*([\d.%]+))?\s*\)$/;

const ColorUtils = {
  // Math Utilities
  clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  },

  wrapHue(hue: number): number {
    return ((hue % 360) + 360) % 360;
  },

  hsvToRgb(h: number, s: number, v: number) {
    let f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
  },

  rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    let v = Math.max(r, g, b), n = v - Math.min(r, g, b);
    let h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
    return [60 * (h < 0 ? h + 6 : h), v && n / v, v];
  },

  hslToHsv(h: number, s: number, l: number): [number, number, number] {
    s /= 100; l /= 100;
    const v = l + s * Math.min(l, 1 - l);
    const hsvS = v === 0 ? 0 : 2 * (1 - l / v);
    return [this.wrapHue(h), hsvS, v];
  },

  // Formatting Utilities
  rgbToHex(r: number, g: number, b: number, a: number = 1) {
    const hex = [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    const alpha = a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : "";
    return `#${hex}${alpha}`;
  },

  rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number = 0, s: number = 0.5, l: number = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), s, l];
  },

  // String Parsing Extractors
  hexToHsv(matcher: RegExpMatchArray | null): ParsedColor | null {
    if (!matcher) return null;

    const hex = matcher[1];
    let r = 0, g = 0, b = 0, a = 1;

    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      if (hex.length === 8) a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
      return null;
    }

    return {
      hsv: this.rgbToHsv(r, g, b),
      alpha: this.clamp(a, 0, 1),
      format: ColorFormat.HEX
    };
  },

  hexToRgb(hex: string) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  },

  rgbMatchToHsv(match: RegExpMatchArray): ParsedColor {
    const [, , p1, , p2, p3, p4] = match; // Extract string values (ignore unit)

    let alpha = 1;
    if (p4 !== undefined) {
      alpha = p4.endsWith("%") ? parseFloat(p4) / 100 : parseFloat(p4);
    }

    const parseRgbVal = (val: string) => val.endsWith("%") ? (parseFloat(val) / 100) * 255 : parseFloat(val);
    const r = parseRgbVal(p1);
    const g = parseRgbVal(p2);
    const b = parseRgbVal(p3);

    return {
      hsv: this.rgbToHsv(r, g, b),
      alpha: this.clamp(alpha, 0, 1),
      format: ColorFormat.RGB
    };
  },

  hslMatchToHsv(match: RegExpMatchArray): ParsedColor {
    const [, , p1, unit, p2, p3, p4] = match; // Extract hue and units

    let alpha = 1;
    if (p4 !== undefined) {
      alpha = p4.endsWith("%") ? parseFloat(p4) / 100 : parseFloat(p4);
    }

    // Convert potential string units into standard degrees
    let h = parseFloat(p1);
    if (unit === "rad") h = h * (180 / Math.PI);
    if (unit === "turn") h = h * 360;

    const s = parseFloat(p2);
    const l = parseFloat(p3);

    return {
      hsv: this.hslToHsv(h, s, l),
      alpha: this.clamp(alpha, 0, 1),
      format: ColorFormat.HSL
    };
  },

  // Main Entrypoint
  parseColor(colorStr: unknown): ParsedColor | null {
    if (typeof colorStr !== "string") return null;
    const str = colorStr.trim().toLowerCase();

    // Delegate HEX matching
    const hexMatch = str.match(HEX_PARSE_REGEX);
    if (hexMatch) return this.hexToHsv(hexMatch);

    // Delegate Functional syntax matching
    const funcMatch = str.match(FUNC_PARSE_REGEX);
    if (funcMatch) {
      const type = funcMatch[1];
      if (type === "rgb") return this.rgbMatchToHsv(funcMatch);
      if (type === "hsl") return this.hslMatchToHsv(funcMatch);
    }

    return null;
  },

  /** Validates whether a given string is a recognizable CSS color format via Regex. */
  isValidColorString(value: unknown): value is string {
    if (typeof value !== "string") return false;
    return CSS_COLOR_REGEX.test(value.trim());
  }
};

export default ColorUtils;
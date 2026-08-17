// Master regex compiled as a static RegExp object in TypeScript
const CSS_COLOR_REGEX: RegExp = /^(?:#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*,\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*,\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*(?:,\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\)|rgba?\(\s*(?:\d{1,3}%?|\d+(?:\.\d+)?)\s+(?:\d{1,3}%?|\d+(?:\.\d+)?)\s+(?:\d{1,3}%?|\d+(?:\.\d+)?)\s*(?:\/\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\)|hsla?\(\s*(?:\d+(?:\.\d+)?(?:deg|rad|turn)?)\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\)|hsla?\(\s*(?:\d+(?:\.\d+)?(?:deg|rad|turn)?)\s+\d{1,3}%\s+\d{1,3}%\s*(?:\/\s*(?:0|1|0?\.\d+|[0-9]{1,3}%)\s*)?\))$/i;

const ColorUtils = {
  // HSV (Hue, Saturation, Value) is standard for color palettes
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

  rgbToHex(r: number, g: number, b: number, a: number = 1) {
    const hex = [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    const alpha = a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : "";
    return `#${hex}${alpha}`;
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

  /** Validates whether a given string is a recognizable CSS color format via Regex. */
  isValidColorString(value: unknown): value is string {
    if (typeof value !== "string") return false;
    return CSS_COLOR_REGEX.test(value.trim());
  }
};

export default ColorUtils;
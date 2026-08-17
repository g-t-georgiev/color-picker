export enum ColorFormat {
  HEX = "hex",
  HEXA = "hexa",
  RGB = "rgb",
  RGBA = "rgba",
  HSL = "hsl",
  HSLA = "hsla"
}

export type SupportedColorFormat = ColorFormat.HEX | ColorFormat.RGB | ColorFormat.HSL;

export type onMoveCallback = (x: number, y: number) => void;

export type ColorChangeEventShape = {
  hex: string;
  r: number;
  g: number;
  b: number;
  alpha: number;
  displayString: string;
};
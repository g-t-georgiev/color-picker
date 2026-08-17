export enum ColorFormat {
  HEX = "hex",
  HEXA = "hexa",
  RGB = "rgb",
  RGBA = "rgba",
  HSL = "hsl",
  HSLA = "hsla"
}

export type onMoveCallback = (x: number, y: number) => void;

export type SupportedColorFormat = ColorFormat.HEX | ColorFormat.RGB | ColorFormat.HSL;
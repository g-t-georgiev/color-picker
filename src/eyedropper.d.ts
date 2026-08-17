// Define the structure of the result returned by the EyeDropper open method
interface ColorSelectionResult {
  sRGBHex: string;
}

// Define the EyeDropper options if needed in the future
interface ColorSelectionOptions {
  signal?: AbortSignal;
}

// Declare the EyeDropper class constructor and instance method
interface EyeDropper {
  open(options?: ColorSelectionOptions): Promise<ColorSelectionResult>;
}

// Add the EyeDropper constructor to the global scope
declare var EyeDropper: {
  prototype: EyeDropper;
  new(): EyeDropper;
};

// Extend the Window interface to recognize window.EyeDropper
interface Window {
  EyeDropper?: typeof EyeDropper;
}

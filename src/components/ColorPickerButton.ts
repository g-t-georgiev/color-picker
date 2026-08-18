import ColorPickerPanel from "./ColorPickerPanel";
import { ColorUtils } from "../utils";

const FALLBACK_COLOR = "#000000";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;

      --color-picker-trigger-width: 30px;
      --color-picker-trigger-height: 30px;
      --color-picker-trigger-borderSize: 2px;
      --color-picker-trigger-borderStyle: solid;
      --color-picker-trigger-borderColor: #454545;
      --color-picker-trigger-borderRadius: 50%;
    }

    .trigger {
      width: var(--color-picker-trigger-width, 30px);
      height: var(--color-picker-trigger-height, 30px);
      border-radius: var(--color-picker-trigger-borderRadius, 50%);
      border:
        var(--color-picker-trigger-borderSize, 2px)
        var(--color-picker-trigger-borderStyle, solid)
        var(--color-picker-trigger-borderColor, #454545);
      background-image:
        linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444),
        linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444);
      background-size: 10px 10px;
      background-position: 0 0, 5px 5px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .trigger-color {
      position: absolute;
      inset: 0;
      background: transparent;
    }

    .popover {
      position: absolute;
      z-index: 1000;
      display: none;
      /* Default positioning - overridden by JS */
      top: calc(100% + 8px);
      left: 0;
    }

    .popover.visible {
      display: block;
    }
  </style>

  <div class="trigger" id="trigger">
    <div class="trigger-color" id="triggerColor"></div>
  </div>
  <div class="popover" id="popover">
    <color-picker-panel id="panel"></color-picker-panel>
  </div>
`;

export default class ColorPickerButton extends HTMLElement {
  static get observedAttributes() { return ["value"]; }

  #shadowRoot: ShadowRoot;
  #triggerBtn: HTMLElement;
  #triggerColor: HTMLElement;
  #popoverElement: HTMLElement;
  #panel: ColorPickerPanel;
  #isOpen: boolean = false;

  #abortController!: AbortController;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "open" });
    this.#shadowRoot.appendChild(template.content.cloneNode(true));

    this.#triggerBtn = this.#shadowRoot.querySelector<HTMLElement>("#trigger")!;
    this.#triggerColor = this.#shadowRoot.querySelector<HTMLElement>("#triggerColor")!;
    this.#popoverElement = this.#shadowRoot.querySelector<HTMLElement>("#popover")!;
    this.#panel = this.#shadowRoot.querySelector<ColorPickerPanel>("#panel")!;
  }

  connectedCallback() {
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    this.#attachEventListeners(signal);
    this.#setInitialColor();
  }

  disconnectedCallback() {
    this.#abortController.abort();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "value" && oldValue !== newValue) {
      this.#handleColorValueAttrChanges(oldValue, newValue);
    }
  }

  toggle() {
    this.#isOpen ? this.close() : this.open();
  }

  open() {
    this.#isOpen = true;
    this.#popoverElement.classList.add("visible");
    this.#updatePosition();
  }

  close() {
    this.#isOpen = false;
    this.#popoverElement.classList.remove("visible");
  }

  #updatePosition() {
    // Spatial awareness for responsive popover
    const triggerRect = this.#triggerBtn.getBoundingClientRect();
    const panelRect = this.#popoverElement.getBoundingClientRect();

    let top = triggerRect.height + 8; // Default bottom
    let left = 0; // Default left aligned

    // If it falls off the bottom edge, push it above the trigger
    if (triggerRect.bottom + panelRect.height + 8 > window.innerHeight) {
      top = -(panelRect.height + 8);
    }

    // If it falls off the right edge, align it to the right of the trigger
    if (triggerRect.left + panelRect.width > window.innerWidth) {
      left = -(panelRect.width - triggerRect.width);
    }

    this.#popoverElement.style.top = `${top}px`;
    this.#popoverElement.style.left = `${left}px`;
  }

  #setInitialColor() {
    const initialColor = this.getAttribute("value");
    this.#handleColorValueAttrChanges(null, initialColor);
  }

  #attachEventListeners(signal?: AbortSignal) {
    this.#triggerBtn.addEventListener("click", this.#handleToggleBtnClick, { signal });
    // Close on outside click
    document.addEventListener("click", this.#handleOutsideClick, { signal });
    // Listen for internal panel changes to update the trigger color button
    this.#panel.addEventListener("color-changed", this.#onColorChange as EventListener, { signal });
  }

  #onColorChange = (ev: CustomEvent<{ hex: string; }>) => {
    this.#triggerColor.style.background = ev.detail.hex;
  }

  #handleToggleBtnClick = (ev: PointerEvent) => {
    ev.stopPropagation();

    this.toggle();
  }

  #handleOutsideClick = (ev: PointerEvent) => {
    if (!this.#isOpen || ev.composedPath().includes(this)) return;

    this.close();
  }

  #handleColorValueAttrChanges(oldColorValue: string | null, newColorValue: string | null) {
    const parsedNewColor = ColorUtils.parseColor(newColorValue);

    if (!parsedNewColor) {
      console.warn(`"${newColorValue}" is not valid/supported color format.`);

      const fallbackColor = ColorUtils.parseColor(oldColorValue) ? oldColorValue : FALLBACK_COLOR;
      this.setAttribute("value", fallbackColor!);

      return;
    }

    this.#panel.setColor(newColorValue!);
    this.#triggerColor.style.background = newColorValue!;
  }
}

customElements.define("color-picker-button", ColorPickerButton);
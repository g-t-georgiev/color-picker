import ColorUtils from "../utils/ColorUtils.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 260px;
      background-color: var(--picker-bg, #252526);
      border: 1px solid var(--picker-border, #454545);
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #cccccc;
      padding: 10px;
      box-sizing: border-box;
      user-select: none;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      gap: 8px;
    }

    .format-wrapper {
      position: relative;
      flex-grow: 1;
      height: 24px;
    }

    .format-list {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: #3c3c3c;
      border: 1px solid #3c3c3c;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      cursor: pointer;
      z-index: 100;
    }

    /* Collapsed State */
    .format-list:not(.expanded) {
      height: 24px;
    }

    .format-list:not(.expanded):hover {
      background: #444;
    }

    .format-list:not(.expanded) .format-option:not(.selected) {
      display: none;
    }

    /* Expanded State */
    .format-list.expanded {
      background: #252526;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    .format-option {
      height: 22px; /* 24px total - 2px border */
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
      font-size: 11px;
      color: #ccc;
      border-radius: 2px;
    }

    .format-list.expanded .format-option.selected {
      background: #3c3c3c;
      color: #fff;
    }

    .format-list.expanded .format-option:not(.selected):hover {
      background: #094771;
      color: #fff;
    }

    .format-arrows {
      box-sizing: border-box;
      position: absolute;
      z-index: 100;
      right: 0;
      width: auto;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
      color: #999;
      font-size: 11px;
      border-radius: 2px;
      pointer-events: none;
    }

    .arrows-icon {
      display: flex;
      color: inherit;
    }

    .format-list.expanded ~ .format-arrows,
    .format-list:has(.format-option.selected:hover) ~ .format-arrows {
      color: #fff;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: #ccc;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, color 0.2s;
    }

    .icon-btn:hover {
      background: #3c3c3c;
      color: #fff;
    }

    .icon-btn svg { width: 16px; height: 16px; fill: currentColor; }

    .color-display {
      font-size: 13px;
      font-family: "Consolas", "Courier New", monospace;
      text-align: center;
      width: calc(100% + 12px);
      translate: -10px -10px;
      margin: 0;
      padding: 4px;
      background: #1e1e1e;
      border-radius: 5px;
    }

    /* Palette Area */
    .palette-wrapper {
      width: 100%;
      height: 140px;
      position: relative;
      border-radius: 2px;
      margin-bottom: 10px;
      cursor: crosshair;
      background-color: #ff0000;
      background-image:
        linear-gradient(to top, #000, transparent),
        linear-gradient(to right, #fff, transparent);
    }

    .palette-handle {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      box-shadow: 0 0 3px 2px rgba(0,0,0,0.5), inset 0 0 0 1px #fff;
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* Sliders */
    .sliders {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .slider-track {
      width: 100%;
      height: 12px;
      border-radius: 6px;
      position: relative;
      cursor: pointer;
    }

    .hue-track {
      background: linear-gradient(
        to right,
        #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%
      );
    }
    .opacity-track {
      background-image:
        linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444),
        linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444);
      background-size: 10px 10px;
      background-position: 0 0, 5px 5px;
    }

    .opacity-overlay {
      position: absolute;
      inset: 0;
      border-radius: 6px;
    }

    .slider-handle {
      width: 14px;
      height: 14px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.5);
      position: absolute;
      top: -1px;
      transform: translateX(-50%);
      pointer-events: none;
    }
  </style>

  <div class="color-display" id="colorDisplay">#ff0000</div>

  <div class="header">
    <button class="icon-btn" id="eyedropperBtn" title="EyeDropper">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.602 0q.703 0 1.324.27t1.078.727.727 1.078.27 1.324q0 .68-.258 1.307t-.738 1.107l-2.813 2.813q.387.375.598.85t.211 1.025q0 .539-.205 1.008t-.58.844l-1.84 1.84-1.875-1.887-9.434 9.434-.305.012q-.598.023-1.025.199t-.75.428-.586.533-.557.527-.645.404-.855.158q-.48 0-.908-.187t-.75-.51-.504-.744T0 21.656q0-.504.158-.861t.404-.645.527-.551.533-.586.428-.75.199-1.025l.012-.305 9.434-9.434-1.887-1.875 1.84-1.84q.375-.375.844-.58t1.008-.205q.551 0 1.025.211t.85.598l2.813-2.813q.48-.48 1.107-.738T20.602 0zm-5.168 11.25L12.75 8.566 3.75 17.566q-.059.598-.223 1.066t-.422.873-.604.773-.604.65-.27.598q0 .34.246.586t.586.246.598-.246q.41-.398.785-.744t.773-.604.867-.422 1.066-.223zm6.504-6.504q.563-.563.563-1.336 0-.387-.152-.738t-.41-.609-.609-.41-.738-.152q-.773 0-1.336.563l-3.879 3.867-1.102-1.102q-.328-.328-.773-.328-.246 0-.463.117t-.41.293-.369.369-.328.346l6.445 6.445.797-.797q.328-.328.328-.773 0-.234-.088-.428t-.217-.334l-1.09-1.09z"/>
    </svg>
    </button>
    <div class="format-wrapper" id="formatWrapper">
      <div class="format-list" id="formatList">
        <div class="format-option selected" data-value="hex">HEX</div>
        <div class="format-option" data-value="rgb">RGB</div>
        <div class="format-option" data-value="hsl">HSL</div>
      </div>
      <div class="format-arrows">
        <div class="arrows-icon">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 2L12 6M4 10L8 14L12 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    <button class="icon-btn" id="copyBtn" title="Copy to clipboard">
      <svg viewBox="0 0 24 24">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    </button>
  </div>

  <div class="palette-wrapper" id="palette">
    <div class="palette-handle" id="paletteHandle"></div>
  </div>

  <div class="sliders">
    <div class="slider-track hue-track" id="hueTrack">
      <div class="slider-handle" id="hueHandle"></div>
    </div>
    <div class="slider-track opacity-track" id="opacityTrack">
      <div class="opacity-overlay" id="opacityOverlay"></div>
      <div class="slider-handle" id="opacityHandle"></div>
    </div>
  </div>
`;

class ColorPickerPanel extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initial State
    this.hsv = [0, 1, 1];
    this.alpha = 1;
    this.format = "hex";

    // Dropdown state
    this.formatOptionsList = ["hex", "rgb", "hsl"];
    this.formatListExpanded = false;

    this.els = {
      palette: this.shadowRoot.getElementById("palette"),
      paletteHandle: this.shadowRoot.getElementById("paletteHandle"),
      hueTrack: this.shadowRoot.getElementById("hueTrack"),
      hueHandle: this.shadowRoot.getElementById("hueHandle"),
      opacityTrack: this.shadowRoot.getElementById("opacityTrack"),
      opacityOverlay: this.shadowRoot.getElementById("opacityOverlay"),
      opacityHandle: this.shadowRoot.getElementById("opacityHandle"),
      colorDisplay: this.shadowRoot.getElementById("colorDisplay"),
      formatWrapper: this.shadowRoot.getElementById("formatWrapper"),
      formatList: this.shadowRoot.getElementById("formatList"),
      formatOptions: this.shadowRoot.querySelectorAll(".format-option"),
      copyBtn: this.shadowRoot.getElementById("copyBtn"),
      eyedropperBtn: this.shadowRoot.getElementById("eyedropperBtn")
    };
  }

  connectedCallback() {
    this.attachEvents();
    if (!window.EyeDropper) {
      console.warn("Eyedropper API not supported.");
      this.els.eyedropperBtn.style.display = "none";
    }
    this.updateUI();
  }

  disconnectedCallback() {
    if (this._handleDocumentClick) {
      document.removeEventListener("click", this._handleDocumentClick);
    }
  }

  attachEvents() {
    this.setupDrag(this.els.palette, (x, y) => {
      this.hsv[1] = Math.max(0, Math.min(1, x));
      this.hsv[2] = Math.max(0, Math.min(1, 1 - y));
      this.updateUI();
    });

    this.setupDrag(this.els.hueTrack, (x) => {
      this.hsv[0] = Math.max(0, Math.min(360, x * 360));
      this.updateUI();
    });

    this.setupDrag(this.els.opacityTrack, (x) => {
      this.alpha = Math.max(0, Math.min(1, x));
      this.updateUI();
    });

    this.els.formatList.addEventListener("click", (ev) => {
      const option = ev.target.closest('.format-option');

      if (!this.formatListExpanded) {
        // Expand the dropdown
        this.formatListExpanded = true;
        this.els.formatList.classList.add("expanded");

        // Calculate vertical shift so the selected option stays exactly where the wrapper is
        const index = this.formatOptionsList.indexOf(this.format);
        this.els.formatList.style.top = `-${index * 22}px`;
      } else {
        // Option selected
        if (option) {
          this.setFormat(option.getAttribute("data-value"));
        }
        this.closeFormatList();
      }
    });

    // Close dropdown when clicking outside (within the Shadow DOM)
    this.shadowRoot.addEventListener("click", (ev) => {
      if (this.formatListExpanded && !ev.composedPath().includes(this.els.formatList)) {
        this.closeFormatList();
      }
    });

    // Close dropdown when clicking outside (on the main Document)
    this._handleDocumentClick = (ev) => {
      if (this.formatListExpanded && !ev.composedPath().includes(this)) {
        this.closeFormatList();
      }
    };
    document.addEventListener("click", this._handleDocumentClick);

    this.els.copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(this.els.colorDisplay.textContent);

      // Visual feedback
      const originalHTML = this.els.copyBtn.innerHTML;
      this.els.copyBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
      setTimeout(() => this.els.copyBtn.innerHTML = originalHTML, 1000);
    });

    this.els.eyedropperBtn.addEventListener("click", async () => {
      if (!window.EyeDropper) return;
      const dropper = new EyeDropper();
      try {
        const result = await dropper.open();
        this.setColor(result.sRGBHex);
      } catch (err) {
        // User canceled selection
      }
    });
  }

  setFormat(val) {
    this.format = val;
    // Update selected HTML classes for styling
    this.els.formatOptions.forEach(opt => {
      if (opt.getAttribute("data-value") === val) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
    this.updateUI();
  }

  closeFormatList() {
    this.formatListExpanded = false;
    this.els.formatList.classList.remove("expanded");
    this.els.formatList.style.top = "0px";
  }

  setupDrag(element, onMove) {
    let isDragging = false;

    const update = (e) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      onMove(x, y);
    };

    element.addEventListener("pointerdown", (ev) => {
      isDragging = true;
      element.setPointerCapture(ev.pointerId);
      update(ev);
    });

    element.addEventListener("pointermove", (ev) => {
      if (isDragging) update(ev);
    });

    element.addEventListener("pointerup", (ev) => {
      isDragging = false;
      element.releasePointerCapture(ev.pointerId);
      this.emitChange(); // Only emit public event on drop/release to prevent spamming
    });
  }

  setColor(hex) {
    const [r, g, b, a] = ColorUtils.hexToRgb(hex);
    this.hsv = ColorUtils.rgbToHsv(r, g, b);
    this.alpha = a;
    this.updateUI();
    this.emitChange();
  }

  updateUI() {
    const [h, s, v] = this.hsv;
    const [r, g, b] = ColorUtils.hsvToRgb(h, s, v);
    const rgbBase = ColorUtils.hsvToRgb(h, 1, 1); // Pure hue color

    // Output formatting
    let output = "";
    if (this.format === "hex") {
      output = ColorUtils.rgbToHex(r, g, b, this.alpha);
    } else if (this.format === "rgb") {
      output = this.alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${this.alpha.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
    } else if (this.format === "hsl") {
      const [hslH, hslS, hslL] = ColorUtils.rgbToHsl(r, g, b);
      output = this.alpha < 1 ? `hsla(${hslH}, ${Math.round(hslS * 100)}%, ${Math.round(hslL * 100)}%, ${this.alpha.toFixed(2)})` : `hsl(${hslH}, ${Math.round(hslS * 100)}%, ${Math.round(hslL * 100)}%)`;
    }

    // Update elements
    this.els.colorDisplay.textContent = output;
    this.els.palette.style.backgroundColor = `rgb(${rgbBase[0]}, ${rgbBase[1]}, ${rgbBase[2]})`;

    this.els.paletteHandle.style.left = `${s * 100}%`;
    this.els.paletteHandle.style.top = `${(1 - v) * 100}%`;

    this.els.hueHandle.style.left = `${(h / 360) * 100}%`;
    this.els.opacityHandle.style.left = `${this.alpha * 100}%`;

    this.els.opacityOverlay.style.background = `linear-gradient(to right, transparent, rgb(${r}, ${g}, ${b}))`;
  }

  emitChange() {
    const [h, s, v] = this.hsv;
    const [r, g, b] = ColorUtils.hsvToRgb(h, s, v);
    const hex = ColorUtils.rgbToHex(r, g, b, this.alpha);

    this.dispatchEvent(new CustomEvent("color-changed", {
      bubbles: true,
      composed: true,
      detail: { hex, r, g, b, alpha: this.alpha, displayString: this.els.colorDisplay.textContent }
    }));
  }
}

customElements.define("color-picker-panel", ColorPickerPanel);
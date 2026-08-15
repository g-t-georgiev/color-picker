import "./ColorPickerPanel.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
    }

    .trigger {
      width: var(--picker-trigger-size, 30px);
      height: var(--picker-trigger-size, 30px);
      border-radius: 50%;
      border: 2px solid var(--picker-border, #454545);
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
      background: #007acc;
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

class ColorPickerButton extends HTMLElement {
  static get observedAttributes() { return ["value"]; }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.triggerBtn = this.shadowRoot.getElementById("trigger");
    this.triggerColor = this.shadowRoot.getElementById("triggerColor");
    this.popoverElement = this.shadowRoot.getElementById("popover");
    this.panel = this.shadowRoot.getElementById("panel");
    this.isOpen = false;
  }

  connectedCallback() {
    this.triggerBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this.toggle();
    });

    // Close on outside click
    document.addEventListener("click", this.handleOutsideClick.bind(this));

    // Listen for internal panel changes to update the trigger color button
    this.panel.addEventListener("color-changed", (ev) => {
      this.triggerColor.style.background = ev.detail.hex;
    });

    // Sync initial attribute
    if (this.hasAttribute("value")) {
      this.panel.setColor(this.getAttribute("value"));
      this.triggerColor.style.background = this.getAttribute("value");
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value" && oldValue !== newValue) {
      this.panel.setColor(newValue);
      this.triggerColor.style.background = newValue;
    }
  }

  handleOutsideClick(ev) {
    // e.composedPath() allows us to see if the click originated inside our shadow DOM
    if (this.isOpen && !ev.composedPath().includes(this)) {
      this.close();
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.popoverElement.classList.add("visible");
    this.updatePosition();
  }

  close() {
    this.isOpen = false;
    this.popoverElement.classList.remove("visible");
  }

  updatePosition() {
    // Spatial awareness for responsive popover
    const triggerRect = this.triggerBtn.getBoundingClientRect();
    const panelRect = this.popoverElement.getBoundingClientRect();

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

    this.popoverElement.style.top = `${top}px`;
    this.popoverElement.style.left = `${left}px`;
  }
}

customElements.define("color-picker-button", ColorPickerButton);
import "./components/ColorPickerButton.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  const myPicker = document.querySelector("color-picker-button");
  myPicker.addEventListener("color-changed", (ev) => {
    console.log("New Color emitted:", ev.detail);
    // document.body.style.backgroundColor = e.detail.hex;
  });
}

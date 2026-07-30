export type KeyboardLayoutName = "compact" | "full";

export interface KeyboardKeyDefinition {
  code: string;
  label: string;
  width?: number;
  aliases?: readonly string[];
}

const key = (
  code: string,
  label: string,
  width?: number,
  aliases?: readonly string[],
): KeyboardKeyDefinition => ({
  code,
  label,
  width,
  aliases,
});

const letterKeys = (letters: string): KeyboardKeyDefinition[] =>
  Array.from(letters, (letter) => key(`Key${letter}`, letter));

export const compactKeyboardRows: readonly (
  readonly KeyboardKeyDefinition[]
)[] = [
  [
    key("Backquote", "`", undefined, ["backtick", "grave"]),
    ...Array.from({ length: 10 }, (_, index) => {
      const digit = String((index + 1) % 10);
      return key(`Digit${digit}`, digit);
    }),
    key("Minus", "−", undefined, ["hyphen"]),
    key("Equal", "="),
    key("Backspace", "Backspace", 2, ["delete left"]),
  ],
  [
    key("Tab", "Tab", 1.5),
    ...letterKeys("QWERTYUIOP"),
    key("BracketLeft", "[", undefined, ["left bracket"]),
    key("BracketRight", "]", undefined, ["right bracket"]),
    key("Backslash", "\\", 1.5),
  ],
  [
    key("CapsLock", "Caps", 1.8, ["caps lock"]),
    ...letterKeys("ASDFGHJKL"),
    key("Semicolon", ";"),
    key("Quote", "'", undefined, ["apostrophe"]),
    key("Enter", "Enter", 2.2, ["return"]),
  ],
  [
    key("ShiftLeft", "Shift", 2.3, ["left shift"]),
    ...letterKeys("ZXCVBNM"),
    key("Comma", ","),
    key("Period", ".", undefined, ["full stop"]),
    key("Slash", "/"),
    key("ShiftRight", "Shift", 2.5, ["right shift"]),
  ],
  [
    key("ControlLeft", "Ctrl", 1.4, ["left control"]),
    key("MetaLeft", "Meta", 1.4, ["command", "Windows key"]),
    key("AltLeft", "Alt", 1.4, ["left alt", "option"]),
    key("Space", "Space", 6, ["spacebar"]),
    key("AltRight", "Alt", 1.4, ["right alt", "AltGr"]),
    key("MetaRight", "Meta", 1.4, ["command", "Windows key"]),
    key("ContextMenu", "Menu", 1.4, ["context menu"]),
    key("ControlRight", "Ctrl", 1.4, ["right control"]),
  ],
];

export const fullKeyboardExtraRows: readonly (
  readonly KeyboardKeyDefinition[]
)[] = [
  [
    key("Escape", "Esc", undefined, ["escape"]),
    ...Array.from({ length: 12 }, (_, index) =>
      key(`F${index + 1}`, `F${index + 1}`),
    ),
    key("PrintScreen", "PrtSc", undefined, ["print screen"]),
    key("ScrollLock", "Scroll", undefined, ["scroll lock"]),
    key("Pause", "Pause", undefined, ["break"]),
  ],
  [
    key("Insert", "Ins", undefined, ["insert"]),
    key("Home", "Home"),
    key("PageUp", "PgUp", undefined, ["page up"]),
    key("NumLock", "Num", undefined, ["num lock"]),
    key("NumpadDivide", "/", undefined, ["numpad divide"]),
    key("NumpadMultiply", "×", undefined, ["numpad multiply"]),
    key("NumpadSubtract", "−", undefined, ["numpad subtract"]),
  ],
  [
    key("Delete", "Del", undefined, ["delete"]),
    key("End", "End"),
    key("PageDown", "PgDn", undefined, ["page down"]),
    key("Numpad7", "7"),
    key("Numpad8", "8"),
    key("Numpad9", "9"),
    key("NumpadAdd", "+", undefined, ["numpad add"]),
  ],
  [
    key("ArrowUp", "↑", undefined, ["up arrow"]),
    key("Numpad4", "4"),
    key("Numpad5", "5"),
    key("Numpad6", "6"),
  ],
  [
    key("ArrowLeft", "←", undefined, ["left arrow"]),
    key("ArrowDown", "↓", undefined, ["down arrow"]),
    key("ArrowRight", "→", undefined, ["right arrow"]),
    key("Numpad1", "1"),
    key("Numpad2", "2"),
    key("Numpad3", "3"),
    key("NumpadEnter", "Enter", undefined, ["numpad enter"]),
  ],
  [
    key("Numpad0", "0", 2),
    key("NumpadDecimal", ".", undefined, ["numpad decimal"]),
  ],
];

export function keyboardLocationName(location: number): string {
  switch (location) {
    case KeyboardEvent.DOM_KEY_LOCATION_STANDARD:
      return "standard";
    case KeyboardEvent.DOM_KEY_LOCATION_LEFT:
      return "left";
    case KeyboardEvent.DOM_KEY_LOCATION_RIGHT:
      return "right";
    case KeyboardEvent.DOM_KEY_LOCATION_NUMPAD:
      return "numpad";
    default:
      return "unknown";
  }
}

import {
  compactKeyboardRows,
  fullKeyboardExtraRows,
  keyboardLocationName,
} from "../keyboard";

describe("keyboard tester models", () => {
  it("covers the main typing area and full-layout keys without duplicate codes", () => {
    const compactCodes = compactKeyboardRows.flat().map((key) => key.code);
    const fullCodes = fullKeyboardExtraRows.flat().map((key) => key.code);

    expect(compactCodes).toEqual(
      expect.arrayContaining([
        "KeyA",
        "Space",
        "Enter",
        "ShiftLeft",
        "ShiftRight",
      ]),
    );
    expect(fullCodes).toEqual(
      expect.arrayContaining([
        "Escape",
        "F12",
        "ArrowUp",
        "Numpad0",
        "NumpadEnter",
      ]),
    );
    expect(new Set([...compactCodes, ...fullCodes]).size).toBe(
      compactCodes.length + fullCodes.length,
    );
  });

  it("labels browser keyboard locations", () => {
    expect(keyboardLocationName(0)).toBe("standard");
    expect(keyboardLocationName(1)).toBe("left");
    expect(keyboardLocationName(2)).toBe("right");
    expect(keyboardLocationName(3)).toBe("numpad");
    expect(keyboardLocationName(9)).toBe("unknown");
  });
});

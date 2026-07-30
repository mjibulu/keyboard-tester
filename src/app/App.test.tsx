import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

describe("Keyboard Tester", () => {
  it("captures simultaneous keys, event details, and releases", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Start keyboard test" }),
    );
    fireEvent.keyDown(window, {
      key: "Shift",
      code: "ShiftLeft",
      location: 1,
      shiftKey: true,
    });
    fireEvent.keyDown(window, {
      key: "A",
      code: "KeyA",
      location: 0,
      shiftKey: true,
    });

    const rollover = screen.getByRole("region", {
      name: "Detected rollover",
    });
    expect(within(rollover).getByText("Held now").nextElementSibling).toHaveTextContent(
      "2",
    );
    const latest = screen.getByRole("region", { name: "Latest event" });
    expect(within(latest).getByText("KeyA")).toBeInTheDocument();
    expect(within(latest).getByText("Shift")).toBeInTheDocument();

    fireEvent.keyUp(window, {
      key: "A",
      code: "KeyA",
      location: 0,
      shiftKey: true,
    });
    expect(within(rollover).getByText("Held now").nextElementSibling).toHaveTextContent(
      "1",
    );
  });

  it("switches to the full layout and Escape stops capture", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Full" }));
    expect(screen.getByTitle("Esc · Escape")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Start keyboard test" }),
    );
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    expect(screen.getByText("Keyboard test stopped")).toBeInTheDocument();
  });
});

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleStop, Keyboard, Play, RotateCcw } from "lucide-react";
import { compactKeyboardRows, fullKeyboardExtraRows, keyboardLocationName, type KeyboardLayoutName, } from "../lib/public-tools/keyboard";
type KeyPhase = "pressed" | "held" | "repeated" | "released";
interface KeyVisualState {
    phase: KeyPhase;
    repeats: number;
}
interface KeyboardEventRow {
    id: number;
    type: "down" | "up";
    key: string;
    code: string;
    location: string;
    modifiers: string;
    repeat: boolean;
}
function displayKey(value: string): string {
    if (value === " ")
        return "Space";
    if (value === "")
        return "(empty)";
    return value;
}
function modifierSummary(event: KeyboardEvent): string {
    const modifiers = [
        event.ctrlKey ? "Ctrl" : "",
        event.altKey ? "Alt" : "",
        event.shiftKey ? "Shift" : "",
        event.metaKey ? "Meta" : "",
    ].filter(Boolean);
    return modifiers.length ? modifiers.join(" + ") : "None";
}
export function KeyboardTester() {
    const [testing, setTesting] = useState(false);
    const [layout, setLayout] = useState<KeyboardLayoutName>("compact");
    const [keyStates, setKeyStates] = useState<Record<string, KeyVisualState>>({});
    const [events, setEvents] = useState<KeyboardEventRow[]>([]);
    const [currentRollover, setCurrentRollover] = useState(0);
    const [maximumRollover, setMaximumRollover] = useState(0);
    const [pressCount, setPressCount] = useState(0);
    const testSurfaceRef = useRef<HTMLDivElement>(null);
    const activeCodesRef = useRef(new Set<string>());
    const holdTimersRef = useRef(new Map<string, number>());
    const eventIdRef = useRef(0);
    const stopTesting = useCallback(() => {
        setTesting(false);
        activeCodesRef.current.clear();
        holdTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        holdTimersRef.current.clear();
        setCurrentRollover(0);
        setKeyStates((states) => Object.fromEntries(Object.entries(states).map(([code, state]) => [code, state.phase === "released" ? state : { ...state, phase: "released" }])));
    }, []);
    const reset = useCallback(() => {
        activeCodesRef.current.clear();
        holdTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        holdTimersRef.current.clear();
        setKeyStates({});
        setEvents([]);
        setCurrentRollover(0);
        setMaximumRollover(0);
        setPressCount(0);
    }, []);
    useEffect(() => {
        if (!testing)
            return;
        const activeCodes = activeCodesRef.current;
        const holdTimers = holdTimersRef.current;
        function record(event: KeyboardEvent, type: "down" | "up") {
            const row: KeyboardEventRow = {
                id: ++eventIdRef.current,
                type,
                key: displayKey(event.key),
                code: event.code || "(unidentified)",
                location: keyboardLocationName(event.location),
                modifiers: modifierSummary(event),
                repeat: event.repeat,
            };
            setEvents((items) => [row, ...items].slice(0, 30));
        }
        function keyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                stopTesting();
                return;
            }
            const target = event.target;
            const interactiveTarget = target instanceof Element
                && Boolean(target.closest("button, input, select, textarea, a, [contenteditable='true']"));
            if (interactiveTarget)
                return;
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
                event.preventDefault();
            }
            const code = event.code || `key:${event.key}`;
            const alreadyActive = activeCodes.has(code);
            activeCodes.add(code);
            const rollover = activeCodes.size;
            setCurrentRollover(rollover);
            setMaximumRollover((value) => Math.max(value, rollover));
            if (!alreadyActive)
                setPressCount((value) => value + 1);
            setKeyStates((states) => ({
                ...states,
                [code]: {
                    phase: alreadyActive || event.repeat ? "repeated" : "pressed",
                    repeats: (states[code]?.repeats ?? 0) + (alreadyActive || event.repeat ? 1 : 0),
                },
            }));
            if (!alreadyActive) {
                const timer = window.setTimeout(() => {
                    if (!activeCodes.has(code))
                        return;
                    setKeyStates((states) => ({
                        ...states,
                        [code]: { phase: "held", repeats: states[code]?.repeats ?? 0 },
                    }));
                }, 240);
                holdTimers.set(code, timer);
            }
            record(event, "down");
        }
        function keyUp(event: KeyboardEvent) {
            const code = event.code || `key:${event.key}`;
            const target = event.target;
            const interactiveTarget = target instanceof Element
                && Boolean(target.closest("button, input, select, textarea, a, [contenteditable='true']"));
            if (interactiveTarget && !activeCodes.has(code))
                return;
            activeCodes.delete(code);
            const timer = holdTimers.get(code);
            if (timer)
                window.clearTimeout(timer);
            holdTimers.delete(code);
            setCurrentRollover(activeCodes.size);
            setKeyStates((states) => ({
                ...states,
                [code]: { phase: "released", repeats: states[code]?.repeats ?? 0 },
            }));
            record(event, "up");
        }
        window.addEventListener("keydown", keyDown, { capture: true });
        window.addEventListener("keyup", keyUp, { capture: true });
        return () => {
            window.removeEventListener("keydown", keyDown, { capture: true });
            window.removeEventListener("keyup", keyUp, { capture: true });
            holdTimers.forEach((timer) => window.clearTimeout(timer));
            holdTimers.clear();
            activeCodes.clear();
        };
    }, [stopTesting, testing]);
    const latest = events[0];
    const rows = useMemo(() => layout === "full"
        ? [...fullKeyboardExtraRows, ...compactKeyboardRows]
        : compactKeyboardRows, [layout]);
    function startTesting() {
        reset();
        setTesting(true);
        testSurfaceRef.current?.focus();
    }
    return (<div className="keyboard-tester">
      <div className={`keyboard-listening-status ${testing ? "active" : ""}`}>
        <Keyboard size={18} aria-hidden="true"/>
        <div role="status" aria-live="polite"><strong>{testing ? "Listening for keyboard input" : "Keyboard test stopped"}</strong><span>{testing ? "Press keys while this panel is focused. Press Escape to stop." : "Start the test when you are ready."}</span></div>
        {testing ? <button type="button" className="secondary-button" onClick={stopTesting}><CircleStop size={15} aria-hidden="true"/> Stop test</button> : <button type="button" className="primary-button" onClick={startTesting}><Play size={15} aria-hidden="true"/> Start keyboard test</button>}
      </div>

      <section ref={testSurfaceRef} className={`visual-keyboard-panel ${testing ? "is-listening" : ""}`} tabIndex={testing ? 0 : -1} aria-labelledby="visual-keyboard-heading" onClick={(event) => {
            if (testing
                && !(event.target instanceof Element
                    && event.target.closest("button, input, select, textarea, a"))) {
                testSurfaceRef.current?.focus();
            }
        }}>
        <div className="keyboard-panel-heading">
          <div><h2 id="visual-keyboard-heading">Visual keyboard</h2><p>Blue is pressed, violet is held or repeated, and outlined keys are released.</p></div>
          <div className="keyboard-layout-control" role="group" aria-label="Keyboard layout">
            <button type="button" aria-pressed={layout === "compact"} onClick={() => setLayout("compact")}>Compact</button>
            <button type="button" aria-pressed={layout === "full"} onClick={() => setLayout("full")}>Full</button>
          </div>
        </div>
        <div className={`visual-keyboard ${layout}`}>
          {rows.map((row, rowIndex) => (<div className="keyboard-row" key={rowIndex}>
              {row.map((keyboardKey) => {
                const state = keyStates[keyboardKey.code];
                return (<div key={keyboardKey.code} className={`visual-key ${state?.phase ?? ""}`} style={{ flexGrow: keyboardKey.width ?? 1 }} title={`${keyboardKey.label} · ${keyboardKey.code}`}>
                    <span>{keyboardKey.label}</span>
                    {state?.repeats ? <small>{state.repeats}</small> : null}
                  </div>);
            })}
            </div>))}
        </div>
        {!testing ? <div className="keyboard-panel-overlay"><Keyboard size={28} aria-hidden="true"/><span>Start the test to capture keys</span></div> : null}
      </section>

      <div className="keyboard-diagnostics">
        <section className="keyboard-latest-event" aria-labelledby="latest-key-heading">
          <div className="keyboard-section-heading"><div><h2 id="latest-key-heading">Latest event</h2><p>Browser-reported details for the newest key event.</p></div><button type="button" className="text-button" onClick={reset} disabled={!events.length}><RotateCcw size={15} aria-hidden="true"/> Reset</button></div>
          {latest ? (<dl>
              <div><dt>Event</dt><dd>{latest.type === "down" ? "Key down" : "Key up"}</dd></div>
              <div><dt>Key</dt><dd>{latest.key}</dd></div>
              <div><dt>Code</dt><dd>{latest.code}</dd></div>
              <div><dt>Location</dt><dd>{latest.location}</dd></div>
              <div><dt>Modifiers</dt><dd>{latest.modifiers}</dd></div>
              <div><dt>Repeat</dt><dd>{latest.repeat ? "Yes" : "No"}</dd></div>
            </dl>) : <div className="keyboard-empty">The latest key details will appear here.</div>}
        </section>

        <section className="keyboard-rollover" aria-labelledby="rollover-heading">
          <div><h2 id="rollover-heading">Detected rollover</h2><p>Keys reported as held simultaneously.</p></div>
          <div className="rollover-values">
            <div><span>Held now</span><strong>{currentRollover}</strong></div>
            <div><span>Maximum</span><strong>{maximumRollover}</strong></div>
            <div><span>Presses</span><strong>{pressCount}</strong></div>
          </div>
          <p className="keyboard-capture-note">Some operating-system and browser shortcuts may not reach this page.</p>
        </section>
      </div>

      <section className="keyboard-event-log" aria-labelledby="event-log-heading">
        <div className="keyboard-section-heading"><div><h2 id="event-log-heading">Recent events</h2><p>The newest keyboard events appear first.</p></div><span>{events.length} shown</span></div>
        {events.length ? (<div className="keyboard-event-table-wrap"><table><thead><tr><th>Event</th><th>Key</th><th>Code</th><th>Location</th><th>Modifiers</th><th>Repeat</th></tr></thead>
            <tbody>{events.map((event) => <tr key={event.id}><td>{event.type}</td><td>{event.key}</td><td><code>{event.code}</code></td><td>{event.location}</td><td>{event.modifiers}</td><td>{event.repeat ? "Yes" : "No"}</td></tr>)}</tbody>
          </table></div>) : <div className="keyboard-empty">No keyboard events captured yet.</div>}
      </section>
    </div>);
}

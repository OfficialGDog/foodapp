import { useCallback, useMemo, useRef } from "react";

export default function useLongPress({
  onClick = () => {},
  onLongPress = () => {},
  ms = 500,
} = {}) {
  const timerRef = useRef(false);
  const eventRef = useRef({});

  const callback = useCallback(() => {
    onLongPress(eventRef.current);
    eventRef.current = {};
    timerRef.current = false;
  }, [onLongPress]);

  const start = useCallback(
    (ev) => {

      eventRef.current = ev;
      timerRef.current = setTimeout(callback, ms);
    },
    [callback, ms]
  );

  const stop = useCallback(
    (ev) => {

      eventRef.current = ev;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        onClick(eventRef.current);
        timerRef.current = false;
        eventRef.current = {};
      }
    },
    [onClick]
  );

  return useMemo(
    () => ({
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop,
      onDrag: stop
    }),
    [start, stop]
  );
}
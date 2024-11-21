import { LayoutGroup, motion } from "framer-motion";
import { div } from "framer-motion/client";
import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";

function App() {
  const [visible, setVisible] = useState(false);
  const [scene, setScene] = useState<"idle" | "confirmation">("idle");
  const [ref, animate] = useAnimateHeight();

  function updateScene(targetScene: typeof scene) {
    setScene(targetScene);
    // animate({
    //   update: () => setScene(targetScene),
    //   rollback: () => setScene(scene),
    // });
  }

  return (
    <div className="p-4">
      <button
        className="rounded border bg-gray-200 px-4 py-2"
        onClick={() => setVisible(true)}
      >
        Open
      </button>

      <div
        className="group fixed inset-0 flex items-end justify-center bg-black/40 p-4 transition-opacity aria-hidden:pointer-events-none aria-hidden:opacity-0"
        aria-hidden={!visible}
        onClick={() => setVisible(false)}
      >
        <motion.div
          layout
          ref={ref}
          className="w-1/2 overflow-hidden rounded bg-white p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          transition={{
            ease: "easeInOut",
          }}
        >
          {scene === "idle" ? (
            <motion.div layout="position" className="flex justify-center gap-2">
              <button
                className="rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                onClick={() => updateScene("confirmation")}
              >
                Approve
              </button>
            </motion.div>
          ) : (
            <motion.div layout="position" className="space-y-2 text-center">
              <h2 className="font-lg font-bold">Are you sure?</h2>
              <p className="text-gray-600">This action cannot be undone</p>
              <div className="space-x-2">
                <button
                  className="rounded border px-4 py-2 text-sm font-bold"
                  onClick={() => updateScene("idle")}
                >
                  Cancel
                </button>
                <button
                  className="rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                  onClick={() => {
                    setVisible(false);
                    setTimeout(() => updateScene("idle"), 150);
                  }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default App;

function useAnimateHeight() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const animate = useCallback(
    ({ update, rollback }: { update: () => void; rollback: () => void }) => {
      if (!containerRef.current) {
        return;
      }

      // Remove hardcoded height so it can change based on it's contents
      containerRef.current.style.height = "";

      const initialHeight = containerRef.current.getBoundingClientRect().height;
      // Synchronously update the state so we can grab the target height
      flushSync(() => update());
      const targetHeight = containerRef.current.getBoundingClientRect().height;

      // Hardcode the initial height
      containerRef.current.style.height = `${initialHeight}px`;
      // Synchronously go back the the initial scene
      flushSync(() => rollback());

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Hardcode the target height, this will cause the animation
          containerRef.current!.style.height = `${targetHeight}px`;
          update();
        });
      });
    },
    [],
  );

  return [containerRef, animate] as const;
}

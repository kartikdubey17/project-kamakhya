import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MainCanvas } from "./screens/MainCanvas";
import { AuthScreen } from "./screens/AuthScreen";

function App() {
  const [entered, setEntered] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {entered ? (
        <motion.div
          key="canvas"
          className="min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MainCanvas />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          className="min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthScreen onSubmit={() => setEntered(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <MainCanvas />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <AuthScreen onSubmit={() => setEntered(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
// src/screens/MainMenuScreen.tsx
import type { FC } from "react";
import { motion } from "framer-motion";

interface MainMenuScreenProps {
  startGame: () => void;
}

export const MainMenuScreen: FC<MainMenuScreenProps> = ({ startGame }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
     
      <motion.button
        onClick={startGame}
        className="p-0 bg-transparent border-none rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
          <motion.h1 
        className="text-5xl md:text-7xl font-bold text-yellow-900 drop-shadow-lg [text-shadow:_4px_4px_0_rgb(255_255_255_/_50%)]"
        style={{ fontFamily: "'Fredoka One', cursive" }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        Fun Quiz Adventure!
      </motion.h1>
      <motion.p 
        className="text-xl text-amber-700 mt-2 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Let's play and learn!
      </motion.p>
      </motion.button>
    </div>
  );
}
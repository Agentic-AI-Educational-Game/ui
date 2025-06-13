import type { FC } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Rocket, Trophy, Star, LogOut } from 'lucide-react';

interface MainMenuScreenProps {
  startGame: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 20, staggerChildren: 0.1 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const MainMenuScreen: FC<MainMenuScreenProps> = ({ startGame }) => {
  const { logout, currentUser } = useAuth();

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="w-full">
      <Card className="w-full max-w-md text-center bg-yellow-100/90 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl rounded-3xl p-4 sm:p-6">
        <CardHeader>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-3xl sm:text-4xl font-bold text-amber-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Bienvenue, {currentUser?.username}!
            </CardTitle>
            <Badge className="mt-2 bg-blue-500 text-white text-sm">
              Aventurier du Quiz
            </Badge>
          </motion.div>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 sm:gap-6">
          <motion.div variants={itemVariants} className="w-full">
            {currentUser?.score ? (
              <div className="bg-white/80 p-3 sm:p-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-green-700">
                <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-500" />
                <span>Dernier Score : <span className="font-bold text-xl sm:text-2xl">{currentUser.score.finalAverageScore}</span> / 100</span>
              </div>
            ) : (
              <div className="bg-white/80 p-3 sm:p-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold text-slate-600">
                <Star className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
                <span>Votre première aventure vous attend !</span>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="w-full">
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={startGame}
                    className="w-full h-16 text-2xl sm:h-20 sm:text-3xl font-bold rounded-2xl  border-b-8 transition-all duration-100 active:border-b-2 active:mt-2 bg-orange-500 border-orange-700 text-white hover:bg-orange-400"
                    style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                    <Rocket className="mr-2 h-7 w- sm:mr-4 sm:h-8 sm:w-8" />
                    Commencer <br/> l'Aventure !
                </Button>
             </motion.div>
          </motion.div>
        </CardContent>

        <CardFooter className="flex justify-center pt-4">
          <motion.div variants={itemVariants}>
            <Button onClick={logout} variant="ghost" className="text-slate-500 hover:bg-yellow-200">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
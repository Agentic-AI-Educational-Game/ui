import { Button } from "@/components/ui/button";
import type { FC } from "react";
interface MainMenuScreenProps {
  onStartMCQ: () => void; // This prop will be a function to call when "Start" is clicked
}

export const MainMenuScreen: FC<MainMenuScreenProps> = ({ onStartMCQ }) => {
  return (
    <>
        <Button
        onClick={onStartMCQ} className="text-3xl bg-green-300">Start</Button>
    </>
  );
}

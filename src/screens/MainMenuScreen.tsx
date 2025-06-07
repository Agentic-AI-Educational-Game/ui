import type { FC } from "react";
import Icon from "../../public/assets/wood_clid.png"
interface MainMenuScreenProps {
  goToNext: () => void; // This prop will be a function to call when "Start" is clicked
}

export const MainMenuScreen: FC<MainMenuScreenProps> = ({ goToNext }) => {
  return (
    <>
        <button
        onClick={goToNext}
        className="p-0 bg-transparent border-none rounded-full focus:outline-none focus:ring-4 focus:ring-sky-500/50 hover:opacity-80 transition-opacity"
      >
        <img
          src={Icon}
          alt="start"
          className="sm:w-24 sm:h-24 md:w-28 md:h-28" 
        />
      </button>
    </>
  );
}

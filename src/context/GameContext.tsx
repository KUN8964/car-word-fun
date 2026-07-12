import { AppProvider } from './AppContext';
import { PlayerProvider } from './PlayerContext';
import { QuizProvider } from './QuizContext';

export function GameProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <PlayerProvider>
        <QuizProvider>{children}</QuizProvider>
      </PlayerProvider>
    </AppProvider>
  );
}

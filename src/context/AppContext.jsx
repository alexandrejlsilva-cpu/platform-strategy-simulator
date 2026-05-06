import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);

  const [business, setBusiness] = useState({
    description: '',
    industry: '',
    geographicScope: 'REGIONAL',
  });

  const [players, setPlayers] = useState([]);

  const [dynamics, setDynamics] = useState({
    // 4 WTA Conditions (HIGH = Winner-Take-All favorable)
    multiHomingCost: 5,        // Cost of Multi-homing
    standardizationPref: 5,    // Preference for Standardization
    intermediationNeed: 5,     // Necessity of Intermediation
    userPowerDispersion: 5,    // Dispersion of User Power
    // Network Effects
    crossSideNetworkEffects: 5,
    sameSideEffects: 5,
    // Market Context
    switchingCosts: 5,
    marketMaturity: 5,
  });

  const [interviewHistory, setInterviewHistory] = useState({});
  const [playerMoods, setPlayerMoods] = useState({});
  const [strategy, setStrategy] = useState(null);

  function addPlayer(data) {
    const id = crypto.randomUUID();
    setPlayers(prev => [...prev, { id, mood: 'neutral', ...data }]);
  }

  function removePlayer(id) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function addMessage(playerId, message) {
    setInterviewHistory(prev => ({
      ...prev,
      [playerId]: [...(prev[playerId] || []), message],
    }));
  }

  function setPlayerMood(playerId, mood) {
    setPlayerMoods(prev => ({ ...prev, [playerId]: mood }));
  }

  return (
    <AppContext.Provider value={{
      currentStep, setCurrentStep,
      business, setBusiness,
      players, addPlayer, removePlayer,
      dynamics, setDynamics,
      interviewHistory, addMessage,
      playerMoods, setPlayerMood,
      strategy, setStrategy,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

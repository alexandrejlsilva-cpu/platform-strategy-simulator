import { AppProvider, useApp } from './context/AppContext.jsx';
import StepNav from './components/StepNav.jsx';
import Step1Market from './steps/Step1Market.jsx';
import Step2Players from './steps/Step2Players.jsx';
import Step3Dynamics from './steps/Step3Dynamics.jsx';
import Step4Interview from './steps/Step4Interview.jsx';
import Step5Strategy from './steps/Step5Strategy.jsx';

const STEPS = [Step1Market, Step2Players, Step4Interview, Step3Dynamics, Step5Strategy];

function AppContent() {
  const { currentStep } = useApp();
  const StepComponent = STEPS[currentStep - 1];
  return (
    <div className="app-frame">
      <div className="gb-screen">
        <StepNav />
        <div className="step-content">
          <StepComponent />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

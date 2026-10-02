import React, { Suspense, lazy } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CatalogScreen } from './components/screens/CatalogScreen';

// Secondary screens lazily loaded on navigation to keep homepage lean
const UploadScreen = lazy(() =>
  import('./components/screens/UploadScreen').then(m => ({ default: m.UploadScreen }))
);
const WorkspaceScreen = lazy(() =>
  import('./components/screens/WorkspaceScreen').then(m => ({ default: m.WorkspaceScreen }))
);
const PrivacyPolicyScreen = lazy(() =>
  import('./components/screens/PrivacyPolicyScreen').then(m => ({ default: m.PrivacyPolicyScreen }))
);
const TermsOfServiceScreen = lazy(() =>
  import('./components/screens/TermsOfServiceScreen').then(m => ({ default: m.TermsOfServiceScreen }))
);

// Global Modals (Lazy Loaded on Trigger)
const AuthModal = lazy(() =>
  import('./components/ui/AuthModal').then(m => ({ default: m.AuthModal }))
);
const ProTierModal = lazy(() =>
  import('./components/ui/ProTierModal').then(m => ({ default: m.ProTierModal }))
);

const ScreenSkeleton: React.FC = () => (
  <div className="w-full min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    <div className="h-10 bg-gray-200 dark:bg-[#1a1a1a] rounded-xl w-1/3 mb-6" />
    <div className="h-4 bg-gray-100 dark:bg-[#141414] rounded-lg w-1/2 mb-10" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl p-6" />
      ))}
    </div>
  </div>
);

export const AppContent: React.FC = () => {
  const {
    screen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProModalOpen,
    setIsProModalOpen,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcfaf8] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#F5F0E6] transition-colors duration-250 ease-apple">
      <div className="flex-1 w-full">
        <Navbar />
        {screen === 'catalog' && <CatalogScreen />}
        {screen !== 'catalog' && (
          <Suspense fallback={<ScreenSkeleton />}>
            {screen === 'upload' && <UploadScreen />}
            {screen === 'workspace' && <WorkspaceScreen />}
            {screen === 'privacy' && <PrivacyPolicyScreen />}
            {screen === 'terms' && <TermsOfServiceScreen />}
          </Suspense>
        )}
      </div>
      <Footer />

      {/* Global Modals */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </Suspense>
      )}

      {isProModalOpen && (
        <Suspense fallback={null}>
          <ProTierModal
            isOpen={isProModalOpen}
            onClose={() => setIsProModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;

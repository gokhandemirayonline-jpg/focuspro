import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = localStorage.getItem('pwaInstalled') === 'true';
    const isDismissed = localStorage.getItem('pwaPromptDismissed');
    
    // Don't show if already installed or dismissed recently (within 7 days)
    if (isStandalone || isInstalled) {
      return;
    }
    
    if (isDismissed) {
      const dismissedDate = new Date(isDismissed);
      const daysSinceDismissed = (new Date() - dismissedDate) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Handle the beforeinstallprompt event for Android/Chrome
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show custom prompt after a delay
    if (isIOSDevice && !isStandalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds
    }

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      localStorage.setItem('pwaInstalled', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwaInstalled', 'true');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-install-prompt md:hidden">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-white/80 hover:text-white"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">FocusPro'yu Yükleyin</h3>
          
          {isIOS ? (
            <div className="text-sm text-white/90">
              <p className="mb-2">Ana ekrana eklemek için:</p>
              <ol className="list-decimal list-inside space-y-1 text-white/80">
                <li>Safari'de <span className="inline-block w-4 h-4 align-middle">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2L12 16M12 2L6 8M12 2L18 8M4 18L4 20C4 21.1 4.9 22 6 22L18 22C19.1 22 20 21.1 20 20L20 18"/>
                  </svg>
                </span> simgesine dokunun</li>
                <li>"Ana Ekrana Ekle"yi seçin</li>
                <li>"Ekle"ye dokunun</li>
              </ol>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/90 mb-3">
                Daha hızlı erişim için uygulamayı ana ekranınıza ekleyin.
              </p>
              <button
                onClick={handleInstall}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                Şimdi Yükle
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

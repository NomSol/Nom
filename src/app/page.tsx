"use client";
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { connected, walletAddress, isLoading } = useWallet();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (connected && walletAddress && !isLoading && !redirecting) {
      console.log("User already connected, redirecting to dashboard");
      setRedirecting(true);

      // Small delay to prevent immediate redirects
      const timer = setTimeout(() => {
        router.push('/main/dashboard');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [connected, walletAddress, isLoading, router, redirecting]);

  const handleConnectWallet = () => {
    setRedirecting(true);
    router.push('/auth/connect-wallet');
  };

  // If loading or already connected, show a loading indicator
  if (isLoading || (connected && !redirecting)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2">{isLoading ? "Loading wallet status..." : "Redirecting to dashboard..."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">NOM NOM</h1>
      <div className="flex gap-4 flex-col">
        <button
          onClick={handleConnectWallet}
          className="btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          disabled={redirecting}
        >
          Connect Wallet
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Connect your crypto wallet to access the platform
        </p>
      </div>
    </main>
  );
}

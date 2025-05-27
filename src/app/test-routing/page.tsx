"use client";
import { useRouter } from 'next/navigation';

export default function TestRoutingPage() {
    const router = useRouter();

    const testConnectWallet = () => {
        router.push('/auth/connect-wallet');
    };

    const testLogin = () => {
        router.push('/auth/login');
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl mb-4">Routing Test Page</h1>
            <div className="flex flex-col gap-4">
                <button
                    onClick={testConnectWallet}
                    className="btn bg-blue-500 text-white p-2 rounded"
                >
                    Test Connect Wallet Route
                </button>
                <button
                    onClick={testLogin}
                    className="btn bg-green-500 text-white p-2 rounded"
                >
                    Test Login Route
                </button>
                <p className="mt-4">Current path: {typeof window !== 'undefined' ? window.location.pathname : ''}</p>
            </div>
        </div>
    );
} 
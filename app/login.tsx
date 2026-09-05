'use client';

import { useState } from 'react';
import { usePrivy, useLoginWithEmail } from '@privy-io/react-auth';

export default function LoginComponent() {
    const { ready, authenticated, user, logout } = usePrivy();
    const { sendCode, loginWithCode } = useLoginWithEmail();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    if (!ready) {
        return <div>Wait bruh its Loading!!!!</div>;
    }

    if (authenticated && user) {
        return (
            <div className="p-4 border rounded-lg max-w-sm space-y-2">
                <h2 className="text-lg font-bold">Logged In User</h2>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email?.address}</p>
                <p><strong>Wallet:</strong> {user.wallet?.address}</p>
                <button
                    onClick={logout}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm cursor-pointer"
                >
                    Bahar
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg max-w-sm space-y-3">
            <h2 className="text-lg font-bold">Andar aao Email se</h2>
            <div>
                <input
                    type="email"
                    placeholder="Enter Da email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-1 w-full rounded mb-2"
                />
                <button
                    onClick={() => sendCode({ email })}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm w-full"
                >
                    Code bhejo
                </button>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Enter Da OTP"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="border p-1 w-full rounded mb-2"
                />
                <button
                    onClick={() => loginWithCode({ code })}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm w-full"
                >
                    Andar
                </button>
            </div>
        </div>
    );
}

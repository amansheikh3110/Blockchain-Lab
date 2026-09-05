# 🍞 Ramesh's Bakery — The Loyalty Card That Can't Be Copied

A tamper-proof digital loyalty punch card built for **Road To Devcon - III** (Smart Accounts & Gasless UX).

Ramesh's bakery was losing money because customers photocopied paper punch cards, and busy counter staff stamped whatever they were handed. This application moves loyalty stamps on-chain and behind cryptographic proof where no photocopier or forged client request can reach.

---

## 🎯 Features & Acceptance Criteria

### 1. Zero-Friction Web2 Onboarding (No Extensions, No Seed Phrases)
- Regulars in a bakery queue shouldn't install MetaMask or write down a 12-word seed phrase to earn a pastry.
- **Enabled Login Methods:**
  - **Email One-Time Passcode (OTP)**: Customers enter their existing email address, receive a 6-digit passcode, and sign in within seconds using Privy's custom auth hooks (`useLoginWithEmail`).
  - **Privy Modal Login**: Instant 1-tap sign-in dialog (`login()`).

### 2. Automatic Embedded Wallets
- Configured with `createOnLogin: 'users-without-wallets'` inside the `PrivyProvider`.
- Every customer automatically receives a self-custodial embedded wallet upon first sign-in without ever clicking a "Create Wallet" button or knowing blockchain is involved.

### 3. Server-Side Identity Verification (How the Server Knows Who is Asking)
A signed-in session in the browser proves nothing to the server if the client can forge requests.
- **Client Token Generation**: When staff awards a stamp, the client requests a cryptographically signed Privy access token using `getAccessToken()`.
- **Bearer Authorization**: The token is sent in the `Authorization: Bearer <token>` header to the `POST /api/award-stamp` endpoint.
- **Cryptographic Server Verification**: The Next.js API route initializes `@privy-io/server-auth` (`PrivyClient`) and verifies the token with `privy.verifyAuthToken(authToken)`.
- **Identity from Verified Claims**: The stamped customer identity (`userId`) is derived **strictly from the verified JWT claims** (`claims.userId`), completely ignoring any client-submitted body parameters. An attacker cannot stamp someone else's card or generate fake stamps.

### 4. Handling Dull States Honestly
- Short-circuits UI during Privy SDK initialization (`ready === false`), preventing flickering or race conditions.
- Handles network/stamp failure states gracefully with real-time feedback.
- Gated customer view checks `authenticated && user` from the Privy SDK.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Auth & Embedded Wallets**: [`@privy-io/react-auth`](https://privy.io/)
- **Server Verification**: [`@privy-io/server-auth`](https://privy.io/)
- **Styling**: Tailwind CSS
- **Network**: Base Sepolia ready

---

## 🚀 Running Locally

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/amansheikh3110/Blockchain-Lab.git
   cd Blockchain-Lab/my-app
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in `my-app/` with:
   ```env
   NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
   NEXT_PUBLIC_PRIVY_CLIENT_ID="your-privy-client-id"
   PRIVY_APP_SECRET="your-privy-app-secret"
   ```
   *(Note: `.env` is gitignored to ensure no secrets are ever committed to version control).*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to test the loyalty app.

---

## 📜 How the Server Establishes Who is Asking (`/api/award-stamp`)

```ts
// 1. Extract Bearer token from header
const authToken = request.headers.get('authorization')?.replace('Bearer ', '');

// 2. Cryptographically verify with Privy
const claims = await privy.verifyAuthToken(authToken);

// 3. Derive customer identity purely from verified claims
const customerId = claims.userId;

// 4. Safely increment the stamp balance
customerStamps[customerId] = (customerStamps[customerId] || 0) + 1;
```

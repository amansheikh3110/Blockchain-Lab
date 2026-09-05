import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || '';
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || '';

// Initialize Privy server client
const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

// In-memory store for Ramesh's Bakery loyalty stamps: customer userId -> stamp count
const customerStamps: Record<string, number> = {};

export async function POST(request: NextRequest) {
  try {
    // 1. Extract Bearer access token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const authToken = authHeader.replace('Bearer ', '').trim();

    // 2. Cryptographically verify the Privy access token on the server
    const claims = await privy.verifyAuthToken(authToken);

    // 3. Stamped identity comes strictly from the verified claims (cannot be forged by client)
    const customerId = claims.userId;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Token claims missing customer identifier' },
        { status: 401 }
      );
    }

    // 4. Safely increment the verified customer's stamps
    const current = (customerStamps[customerId] || 0) + 1;
    customerStamps[customerId] = current;

    return NextResponse.json({
      success: true,
      customerId,
      stamps: current,
      freeCakeEligible: current >= 10,
      message: current >= 10
        ? '🎉 10 Stamps reached! Customer gets a FREE Cake!'
        : `Stamp awarded! Total: ${current} / 10 stamps.`
    });
  } catch (error: any) {
    // Rejects request when verification throws or fails
    return NextResponse.json(
      { error: 'Unauthorized: Privy token verification failed' },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const authToken = authHeader.replace('Bearer ', '').trim();
    const claims = await privy.verifyAuthToken(authToken);
    const customerId = claims.userId;

    const current = customerStamps[customerId] || 0;
    return NextResponse.json({
      success: true,
      customerId,
      stamps: current,
      freeCakeEligible: current >= 10
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Unauthorized: Privy token verification failed' },
      { status: 401 }
    );
  }
}

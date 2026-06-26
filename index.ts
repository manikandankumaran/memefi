// Polyfills — must come before any other import
import 'fast-text-encoding';
import 'react-native-get-random-values';

// Buffer polyfill for Solana web3.js
import { Buffer } from 'buffer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Buffer = Buffer;

import 'expo-router/entry';

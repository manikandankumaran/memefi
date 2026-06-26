// CSS side-effect imports used by NativeWind
declare module '*.css';

// Buffer is polyfilled in index.ts via the `buffer` npm package
declare const Buffer: typeof import('buffer').Buffer;

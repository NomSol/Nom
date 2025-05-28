// Declare global test framework types
declare const describe: (description: string, callback: () => void) => void;
declare const before: (callback: () => void) => void;
declare const beforeEach: (callback: () => void) => void;
declare const after: (callback: () => void) => void;
declare const afterEach: (callback: () => void) => void;
declare const it: (description: string, callback: () => void) => void; 
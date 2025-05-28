// This file provides type definitions for the mocha test framework

declare module 'mocha' {
    interface Context {
        [key: string]: any;
    }

    global {
        function describe(description: string, spec: () => void): void;
        function describe(description: string, spec: (this: Context) => void): void;

        function before(callback: (this: Context) => void | Promise<void>): void;
        function beforeEach(callback: (this: Context) => void | Promise<void>): void;

        function after(callback: (this: Context) => void | Promise<void>): void;
        function afterEach(callback: (this: Context) => void | Promise<void>): void;

        function it(expectation: string, callback?: (this: Context) => void | Promise<void>): void;
        function it(expectation: string, timeout: number, callback?: (this: Context) => void | Promise<void>): void;
    }
} 
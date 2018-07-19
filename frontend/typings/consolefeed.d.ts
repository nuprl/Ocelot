

declare module 'console-feed' {

    export interface Log {
        data: any[];
        id?: string;
        method: string;
    }

    export function Hook(
        console: Console,
        listener: (log: any) => void
    ): void;

    export interface ConsoleProps {
        logs: Log[];
        variant: string;
        filter?: string[];
        styles: object;
    }

    export function Decode(log: any): Log;

    export const Console: React.ComponentType<ConsoleProps>
}
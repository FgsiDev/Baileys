export function makeSocket(ぬつ: any): {
    [x: number]: any;
    ws: なは;
    ev: {
        process(handler: any): () => void;
        emit(event: any, evData: any): any;
        isBuffering(): boolean;
        buffer: () => void;
        flush: (force?: boolean) => boolean;
        createBufferedFunction(work: any): (...args: any[]) => Promise<any>;
        on: (...args: any[]) => any;
        off: (...args: any[]) => any;
        removeAllListeners: (...args: any[]) => any;
    };
};
import { WebSocketClient as なは } from "./Client";

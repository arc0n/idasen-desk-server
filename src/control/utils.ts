export class Utils {
    static   sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    static log(...message: string[]) {
        console.log(`[${new Date().toISOString()}]`, ...message);
    };
}

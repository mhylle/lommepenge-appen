export declare class AppService {
    constructor();
    getHello(): string;
    getInfo(): {
        application: string;
        version: string;
        description: string;
        message: string;
        features: string[];
        endpoints: {
            health: string;
            api: string;
        };
        timestamp: string;
    };
}

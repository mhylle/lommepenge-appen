import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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

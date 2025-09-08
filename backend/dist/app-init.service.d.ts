import { OnApplicationBootstrap } from '@nestjs/common';
import { LocalAuthService } from './auth-proxy/local-auth.service';
export declare class AppInitService implements OnApplicationBootstrap {
    private localAuthService;
    private readonly logger;
    constructor(localAuthService: LocalAuthService);
    onApplicationBootstrap(): any;
}

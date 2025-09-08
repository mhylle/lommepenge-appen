import { LocalAuthService } from './local-auth.service';
declare const LocalStrategy_base: any;
export declare class LocalStrategy extends LocalStrategy_base {
    private localAuthService;
    constructor(localAuthService: LocalAuthService);
    validate(email: string, password: string): Promise<any>;
}
export {};

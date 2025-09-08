import { Strategy } from 'passport-local';
import { LocalAuthService } from './local-auth.service';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private localAuthService;
    constructor(localAuthService: LocalAuthService);
    validate(email: string, password: string): Promise<any>;
}
export {};

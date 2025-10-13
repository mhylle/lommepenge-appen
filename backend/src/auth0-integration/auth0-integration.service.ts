import { Injectable } from '@nestjs/common';
import { ManagementClient } from 'auth0';

@Injectable()
export class Auth0IntegrationService {
  private readonly auth0: ManagementClient;

  constructor() {
    this.auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
    });
  }

  async createUser(email: string, name: string): Promise<any> {
    try {
      const user = await this.auth0.users.create({
        connection: 'Username-Password-Authentication',
        email,
        name,
        password: this.generateRandomPassword(),
        email_verified: true,
      });
      return user.data;
    } catch (error) {
      console.error('Error creating user in Auth0:', error);
      throw new Error('Could not create user in Auth0');
    }
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  }
}
import { BadSlowExpensivePaymentProvider } from './badSlowExpensivePaymentProvider';
import { GoodCheapPaymentProvider } from './goodCheapPaymentProvider';

interface PaymentProvider {
  topUp(amount: number): Promise<{
    success: boolean;
    amount: number;
  }>;
  withdraw(amount: number): Promise<{
    success: boolean;
    amount: number;
  }>;
  removeCommision(amount: number): number;
  minWithdrawalAmount: number;
  minTopUpAmount: number;
}

class SelectPaymentProvider {
  static selectPaymentProvider = (provider: string): PaymentProvider => {
    switch (provider) {
      case 'good':
        return new GoodCheapPaymentProvider();
      case 'bad':
        return new BadSlowExpensivePaymentProvider();
      default:
        throw new Error('Unknown payment provider');
    }
  };
}

export { SelectPaymentProvider };
export type { PaymentProvider };

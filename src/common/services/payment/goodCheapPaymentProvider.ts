import { PaymentProvider } from './paymentProvider';

class GoodCheapPaymentProvider implements PaymentProvider {
  minWithdrawalAmount = 500;
  minTopUpAmount = 100;

  removeCommision = (amount: number): number => {
    return amount - amount * 0.01; // 1% commision;
  };

  topUp = async (
    amount: number,
  ): Promise<{
    success: boolean;
    amount: number;
  }> => {
    const isPaymentSuccessful = Math.random() * 100 > 1; // ~99% success rate;
    const responseFromMockPaymentProvider = await new Promise<boolean>((res) =>
      setTimeout(() => res(isPaymentSuccessful), Math.random() * 100 + 100),
    );

    return {
      success: responseFromMockPaymentProvider,
      amount: this.removeCommision(amount),
    };
  };

  withdraw = async (
    amount: number,
  ): Promise<{
    success: boolean;
    amount: number;
  }> => {
    const success = Math.random() * 100 > 1; // ~99% success rate;
    const responseFromMockWithdrawalProvider = await new Promise<boolean>(
      (res) => setTimeout(() => res(success), Math.random() * 100 + 100),
    );

    return {
      success: responseFromMockWithdrawalProvider,
      amount: this.removeCommision(amount),
    };
  };
}

export { GoodCheapPaymentProvider };

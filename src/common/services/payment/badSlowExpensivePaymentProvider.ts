import { PaymentProvider } from './paymentProvider';

class BadSlowExpensivePaymentProvider implements PaymentProvider {
  minWithdrawalAmount = 1000;
  minTopUpAmount = 100;

  removeCommision = (amount: number): number => {
    return amount - amount * 0.2; // 20% commision;
  };

  topUp = async (
    amount: number,
  ): Promise<{
    success: boolean;
    amount: number;
  }> => {
    const isPaymentSuccessful = Math.random() > 0.5; // ~50% success rate;
    const responseFromMockPaymentProvider = await new Promise<boolean>((res) =>
      setTimeout(() => res(isPaymentSuccessful), Math.random() * 5000 + 1000),
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
    const isWithdrawalSuccessful = Math.random() > 0.5; // ~50% success rate;
    const responseFromMockWithdrawalProvider = await new Promise<boolean>(
      (res) =>
        setTimeout(
          () => res(isWithdrawalSuccessful),
          Math.random() * 5000 + 1000,
        ),
    );

    return {
      success: responseFromMockWithdrawalProvider,
      amount: this.removeCommision(amount),
    };
  };
}

export { BadSlowExpensivePaymentProvider };

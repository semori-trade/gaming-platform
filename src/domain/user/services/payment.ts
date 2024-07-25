import { PaymentProvider } from '../../../common/services/payment/paymentProvider';
import { IWithdrawRepository } from '../repositories/withdraws';
import { IUserRepository } from '../repositories/user';
import { ITopUpRepository } from '../repositories/topUp';

interface UserPaymentProvider {
  topUp(
    userId: number,
    amount: number,
  ): Promise<{
    success: boolean;
    error?: string;
  }>;
  withdraw(
    userId: number,
    amount: number,
  ): Promise<{
    success: boolean;
    error?: string;
  }>;
  setPaymentProvider(paymentProvider: PaymentProvider): void;
}

class Payment implements UserPaymentProvider {
  #paymentProvider: PaymentProvider | null;
  #userRepository: IUserRepository;
  #withdrawRepository: IWithdrawRepository;
  #topUpRepository: ITopUpRepository;

  constructor(
    userRepository: IUserRepository,
    withdrawRepository: IWithdrawRepository,
    topUpRepository: ITopUpRepository,
  ) {
    this.#userRepository = userRepository;
    this.#withdrawRepository = withdrawRepository;
    this.#topUpRepository = topUpRepository;
    this.#paymentProvider = null;
  }

  setPaymentProvider(paymentProvider: PaymentProvider) {
    this.#paymentProvider = paymentProvider;
  }
  /*
  -> top-up
  -> call payment service
  -> payment service processing
  -> if success, update user ballance and add to top-up history as success (transaction)
  -> if failed, return error message and add to top-up history as failed
  */
  topUp = async (userId: number, amount: number) => {
    let topUpResult = {
      success: true,
      error: '',
    };
    try {
      if (!this.#paymentProvider) {
        const errorMessage = 'Payment provider not set';
        topUpResult.success = false;
        topUpResult.error = errorMessage;
        throw new Error(errorMessage);
      }
      const minTopUp = this.#paymentProvider.minTopUpAmount;
      const topUpAmount = amount;

      await this.#userRepository
        .prepareSerializableTransaction('read committed')
        .execute(async (trx) => {
          const user = await this.#userRepository.getById(userId, { trx });

          if (user === undefined || user.ballance === null) {
            const errorMessage = "Can't get user ballance";
            topUpResult.success = false;
            topUpResult.error = errorMessage;
            throw new Error(errorMessage);
          }

          if (topUpAmount < minTopUp) {
            const errorMessage = `Min top-up is: ${minTopUp}`;
            topUpResult.success = false;
            topUpResult.error = errorMessage;
            throw new Error(errorMessage);
          }

          // create top-up record
          const topUpRecord = await this.#topUpRepository.create(
            {
              user_id: user.user_id,
              amount: topUpAmount,
              status: 'processing',
            },
            { trx },
          );

          const topUpId = topUpRecord?.topup_id;

          if (topUpId === undefined) {
            const errorMessage = 'Can not create top-up record';
            topUpResult.success = false;
            topUpResult.error = errorMessage;
            throw new Error(errorMessage);
          }

          const paymentResponse =
            await this.#paymentProvider!.topUp(topUpAmount);

          if (!paymentResponse.success) {
            await this.#topUpRepository.update(
              {
                status: 'failed',
                user_id: user.user_id,
                topup_id: topUpId,
              },
              { trx },
            );

            const errorMessage = 'Payment failed';
            topUpResult.success = false;
            topUpResult.error = errorMessage;
          } else {
            await this.#topUpRepository.update(
              {
                status: 'success',
                user_id: user.user_id,
                topup_id: topUpId,
              },
              { trx },
            );

            const nextUserBallance = user.ballance + paymentResponse.amount;

            await this.#userRepository.update(
              {
                ...user,
                ballance: nextUserBallance,
              },
              { trx },
            );
          }
        });
    } catch (err) {
      console.error(err);
      if (!(err instanceof Error)) {
        return { success: false, error: 'Unknown error' };
      }
    }

    return topUpResult;
  };

  /*
  -> withdraw
  -> call payment service
  -> check user ballance, subsctract from user ballance amount and payment service processing
  -> if success withdraw history as success (transaction)
  -> if failed, return error message and add to withdraw history as failed and return the amount to user ballance
  */
  withdraw = async (userId: number, amount: number) => {
    let withdrawResult = {
      success: true,
      error: '',
    };
    try {
      if (!this.#paymentProvider) {
        const errorMessage = 'Payment provider not set';
        withdrawResult.success = false;
        withdrawResult.error = errorMessage;
        throw new Error(errorMessage);
      }
      const minWithdraw = this.#paymentProvider.minWithdrawalAmount;
      const withdrawAmount = amount;

      await this.#userRepository
        .prepareSerializableTransaction('read committed')
        .execute(async (trx) => {
          const isProcessing = await this.#withdrawRepository.isProcessing(
            userId,
            { trx },
          );

          if (isProcessing) {
            const errorMessage = 'Withdraw for this user already processing';
            withdrawResult.success = false;
            withdrawResult.error = errorMessage;
            throw new Error(errorMessage);
          }
          // get user id and ballance
          const user = await this.#userRepository.getById(userId, { trx });

          if (user === undefined || user.ballance === null) {
            const errorMessage = "Can't get user ballance";
            withdrawResult.success = false;
            withdrawResult.error = errorMessage;
            throw new Error(errorMessage);
          }

          if (user.ballance < minWithdraw) {
            const errorMessage = `Min withdraw is: ${minWithdraw} but user has: ${user.ballance}`;
            withdrawResult.success = false;
            withdrawResult.error = errorMessage;
            throw new Error(errorMessage);
          }

          if (user.verified === false) {
            const errorMessage =
              'User not verified. Only verified users can withdraw';
            withdrawResult.success = false;
            withdrawResult.error = errorMessage;
            throw new Error(errorMessage);
          }

          if (
            user.ballance <
            withdrawAmount +
            this.#paymentProvider!.removeCommision(withdrawAmount)
          ) {
            const errorMessage = `Withdraw amount more than user ballance after fee`;
            withdrawResult.success = false;
            withdrawResult.error = errorMessage;
            throw new Error(errorMessage);
          }

          const nextUserBallance = user.ballance - withdrawAmount;

          // remove from user ballance withdraw amount
          await this.#userRepository.update({
            ...user,
            ballance: nextUserBallance,
          });

          // create withdraw record
          const withdrawRecord = await this.#withdrawRepository.create(
            {
              status: 'processing',
              user_id: user.user_id,
              amount: withdrawAmount,
            },
            { trx },
          );

          const withdrawId = withdrawRecord?.withdraw_id;

          const paymentResponse =
            await this.#paymentProvider!.withdraw(withdrawAmount);

          if (!paymentResponse.success) {
            // return to user ballance his withdraw amount as payment failed
            await this.#userRepository.update(user, { trx });
            // set withdraw status as failed
            await this.#withdrawRepository.update(
              {
                status: 'failed',
                withdraw_id: withdrawId,
              },
              { trx },
            );
            const errorMessage = 'Payment service failed';
            withdrawResult.success = false;
            withdrawResult.error = errorMessage;
          } else {
            // set withdraw status as success
            await this.#withdrawRepository.update(
              {
                status: 'success',
                withdraw_id: withdrawId,
              },
              { trx },
            );
          }
        });
    } catch (err) {
      console.error(err);
      if (!(err instanceof Error)) {
        return { success: false, error: 'Unknown error' };
      }
    }

    return withdrawResult;
  };
}

export { Payment };
export type { UserPaymentProvider };

import { startSession } from 'mongoose';
import WalletDAO from '../daos/wallet.dao.js';
import { InsufficientError } from '../errors/index.js';
import { TransactionDTO } from '../models/transaction.model.js';
import { events, pubsub } from '../pubsub/index.js';

class WalletService {
  constructor() {
    pubsub.subscribe(events.tenant.signUp, this.createWallet);
    pubsub.subscribe(events.webhook.success, this.creditWallet);
  }

  async createWallet(dto, trx) {
    const newWallet = await WalletDAO.insert(dto, trx);
    return newWallet;
  }

  async getWallets(filter) {
    const foundWallets = await WalletDAO.find(filter);
    const count = Intl.NumberFormat('en-US').format(foundWallets.length);

    return [count, foundWallets];
  }

  async getWallet(tenantId) {
    return await WalletDAO.findOne({ tenantId });
  }

  async updateWallet(tenantId, dto) {
    const updatedWallet = await WalletDAO.update({ tenantId }, dto);

    return updatedWallet;
  }

  async deleteWallet(tenantId) {
    const deletedWallet = await WalletDAO.remove({ tenantId });
    return deletedWallet;
  }

  async getWalletBalance(tenantId) {
    const { balance } = await WalletDAO.findOne({ tenantId });

    return { balance };
  }

  async creditWallet(dto) {
    const trx = await startSession();
    try {
      // ! Starting transaction.
      trx.startTransaction();

      const foundWallet = await WalletDAO.findOne({ tenantId: dto.tenantId });
      dto.balance = foundWallet.balance;

      foundWallet.set({
        balance: foundWallet.balance + dto.amount,
        last_credit_date: new Date(),
      });
      await foundWallet.save({ session: trx });

      await pubsub.publish(
        events.wallet.credit,
        null,
        new TransactionDTO(dto),
        trx,
      );

      // * Committing changes.
      await trx.commitTransaction();
      trx.endSession();

      return foundWallet;
    } catch (exception) {
      // ! Exception thrown, roll back changes.
      await trx.abortTransaction();
      trx.endSession();

      throw exception;
    }
  }

  async debitWallet(dto) {
    const trx = await startSession();
    try {
      // ! Starting transaction.
      trx.startTransaction();

      const foundWallet = await WalletDAO.findOne({ tenantId: dto.tenantId });
      dto.balance = foundWallet.balance;

      if (foundWallet.balance < dto.amount) {
        throw new InsufficientError(
          'Insufficient funds to perform this transaction.',
        );
      }

      foundWallet.set({ balance: foundWallet.balance - dto.amount });
      await foundWallet.save({ session: trx });

      pubsub.publish(events.wallet.debit, null, new TransactionDTO(dto), trx);

      // * Committing changes.
      await trx.commitTransaction();
      trx.endSession();

      return foundWallet;
    } catch (exception) {
      await trx.abortTransaction();
      trx.endSession();

      throw exception;
    }
  }
}

export default new WalletService();

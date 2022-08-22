import { useState, useContext } from 'react';
import { PyjamaWalletContext } from '../context/PyjamaWalletContext';
import Transactions from './Transactions';

const styles = {
  inputContainer: `flex flex-col items-center justify-center border rounded-xl border-[#FAFAC6] p-4 mb-4`,
  balance: `text-[#FAFAC6] text-2xl`,
  addressInput: `w-[24rem] p-2 mx-auto mt-4 bg-[#333333] border border-[#FAFAC6] text-[#FAFAC6] text-sm rounded-lg focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173]`,
  amountInput: `w-auto p-2 my-4 mx-auto bg-[#333333] border border-[#FAFAC6] text-[#FAFAC6] text-sm rounded-lg focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173]`,
  btn: `text-[#FAFAC6] bg-gradient-to-br from-[#333333] to-[#643173] hover:bg-gradient-to-tl focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173] font-medium rounded-lg text-sm px-5 py-2 text-center my-2`,
};

const Wallet = () => {
  const [recipient, setRecipient] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [amountToDeposit, setAmountToDeposit] = useState("");

  const { selectedWallet, selectedWalletBalance, deposit, requestTransaction } = useContext(PyjamaWalletContext);

  return (
    <>
      <div className='flex gap-5 flex-wrap justify-center'>
        <div className={styles.inputContainer}>
          <span className={styles.balance}>Balance: </span>
          <span className={styles.balance}>{selectedWalletBalance} ETH</span>
          <input
            className={styles.amountInput}
            placeholder="Amount to Deposit"
            value={amountToDeposit}
            onChange={e => setAmountToDeposit(e.target.value)}
          />
          <button
            className={styles.btn}
            onClick={() => {
              deposit(selectedWallet.id, amountToDeposit);
              setAmountToDeposit("");
            }}
          >
            Deposit
          </button>
        </div>
        <div className={styles.inputContainer}>
          <span className={styles.balance}>Request Transaction</span>
          <input
            className={styles.addressInput}
            placeholder="Recipient"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
          <input
            className={styles.amountInput}
            placeholder="Amount to send"
            value={amountToSend}
            onChange={e => setAmountToSend(e.target.value)}
          />
          <button
            className={styles.btn}
            onClick={() => {
              requestTransaction(recipient, amountToSend, selectedWallet.id)
              setRecipient("");
              setAmountToSend("");
            }}
          >
            Request Transaction
          </button>
        </div>
      </div>
      <Transactions />
    </>
  );
};

export default Wallet;
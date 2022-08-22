import { useContext, useState } from 'react';
import { PyjamaWalletContext } from '../context/PyjamaWalletContext';
import { DuplicateIcon } from '@heroicons/react/outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const styles = {
  container: `sm:flex sm:justify-center flex-wrap sm:gap-5`,
  menu: `flex text-[#FAFAC6] text-md justify-center whitespace-nowrap items-center sm:hidden`,
  menuItem: `mx-2 cursor-pointer`,
  menuItemActive: `mx-2 cursor-pointer border-b-2 border-[#889696]`,
  transactionsContainer: `hidden sm:block text-center text-[#FAFAC6] my-4`,
  transactionsContainerActive: `text-center text-[#FAFAC6] my-4`,
  table: 'mt-4 mx-auto max-w-4xl w-full whitespace-nowrap rounded-lg bg-[#333333] divide-y divide-[#FAFAC6] overflow-hidden',
  tableHeader: 'bg-[#889696] border border-[#FAFAC6]',
  tableBody: 'divide-y divide-[#FAFAC6] border-b border-[#FAFAC6]',
  tableItem: 'font-semibold text-sm uppercase border-b border-[#FAFAC6] px-6 py-2'
};

const Transactions = () => {
  const [waiting, setWaiting] = useState(true);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const { selectedWallet,
    selectedWalletTransactions,
    approveTransaction,
    sendTransaction } = useContext(PyjamaWalletContext);

  return (
    <>
      {selectedWalletTransactions === undefined ?
        <></>
        :
        <div className={styles.container}>
          <div className={styles.menu}>
            <span className={waiting ? styles.menuItemActive : styles.menuItem} onClick={() => {
              setWaiting(true);
              setReady(false);
              setSent(false);
            }}>
              Waiting For Approval
            </span>
            <span className={ready ? styles.menuItemActive : styles.menuItem} onClick={() => {
              setWaiting(false);
              setReady(true);
              setSent(false);
            }}>
              Ready For Transfer
            </span>
            <span className={sent ? styles.menuItemActive : styles.menuItem} onClick={() => {
              setWaiting(false);
              setReady(false);
              setSent(true);
            }}>
              Sent Transactions
            </span>
          </div>
          <div className={waiting ? styles.transactionsContainerActive : styles.transactionsContainer}>
            <span className='text-xl hidden sm:block'>Waiting For Approval</span>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableItem}>Recipient</th>
                  <th className={styles.tableItem}>Amount</th>
                  <th className={styles.tableItem}>Approvals</th>
                  <th className={styles.tableItem}></th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {selectedWalletTransactions.map(transaction => {
                  if (transaction.approvals < selectedWallet.requiredApprovals) {
                    return (
                      <tr className='hover:bg-gray-400 border border-[#FAFAC6]' key={transaction.id}>
                        <td className={styles.tableItem}>
                          {transaction.recipient.slice(0, 7) + '...' + transaction.recipient.slice(38)}
                          <CopyToClipboard text={transaction.recipient} className='inline-block ml-2 h-4 w-4 cursor-pointer'>
                            <DuplicateIcon />
                          </CopyToClipboard>
                        </td>
                        <td className={styles.tableItem}>{transaction.amount} ETH</td>
                        <td className={styles.tableItem}>{transaction.approvals}/{selectedWallet.requiredApprovals}</td>
                        <td className={styles.tableItem}><button onClick={() => approveTransaction(transaction.id, selectedWallet.id)}>Approve</button></td>
                      </tr>
                    )
                  }
                })}
              </tbody>
            </table>
          </div>
          <div className={ready ? styles.transactionsContainerActive : styles.transactionsContainer}>
            <span className='text-xl hidden sm:block'>Ready For Transfer</span>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableItem}>Recipient</th>
                  <th className={styles.tableItem}>Amount</th>
                  <th className={styles.tableItem}>Approvals</th>
                  <th className={styles.tableItem}></th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {selectedWalletTransactions.map(transaction => {
                  if (transaction.approvals >= selectedWallet.requiredApprovals && transaction.action !== "Sent") {
                    return (
                      <tr className='hover:bg-gray-400 border border-[#FAFAC6]' key={transaction.id}>
                        <td className={styles.tableItem}>
                          {transaction.recipient.slice(0, 7) + '...' + transaction.recipient.slice(38)}
                          <CopyToClipboard text={transaction.recipient} className='inline-block ml-2 h-4 w-4 cursor-pointer'>
                            <DuplicateIcon />
                          </CopyToClipboard>
                        </td>
                        <td className={styles.tableItem}>{transaction.amount} ETH</td>
                        <td className={styles.tableItem}>{transaction.approvals}/{selectedWallet.requiredApprovals}</td>
                        <td className={styles.tableItem}><button onClick={() => sendTransaction(transaction.id, selectedWallet.id)}>Send</button></td>
                      </tr>
                    )
                  }
                })}
              </tbody>
            </table>
          </div>
          <div className={sent ? styles.transactionsContainerActive : styles.transactionsContainer}>
            <span className='text-xl hidden sm:block'>Sent Transactions</span>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableItem}>Sent To</th>
                  <th className={styles.tableItem}>Amount</th>
                  <th className={styles.tableItem}>Approvals</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {selectedWalletTransactions.map(transaction => {
                  if (transaction.action === "Sent") {
                    return (
                      <tr className='hover:bg-[#889696] border border-[#FAFAC6]' key={transaction.id}>
                        <td className={styles.tableItem}>{transaction.recipient.slice(0, 7) + '...' + transaction.recipient.slice(38)}
                          <CopyToClipboard text={transaction.recipient} className='inline-block ml-2 h-4 w-4 cursor-pointer'>
                            <DuplicateIcon />
                          </CopyToClipboard>
                        </td>
                        <td className={styles.tableItem}>{transaction.amount} ETH</td>
                        <td className={styles.tableItem}>{transaction.approvals}/{selectedWallet.requiredApprovals}</td>
                      </tr>
                    )
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      }
    </>
  );
};

export default Transactions;
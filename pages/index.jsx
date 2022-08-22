import request from '../assets/request.svg';
import send from '../assets/send.svg';
import wallet from '../assets/wallet.svg';
import ethereum from '../assets/ethereum.svg';
import Image from 'next/image';

const styles = {
  container: `h-screen flex flex-col items-center justify-center gap-5 text-[#FAFAC6]`,
  feturesContainer: `flex flex-col md:flex-row gap-8 h-1/6`,
  feture: `w-40 min-h-[12rem] rounded-md border border-[#FAFAC6] text-center p-4`,
  fetureText: `text-[#889696] text-xs p-2`,
};

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className='text-6xl font-semibold text-center'>Pyjama Wallet</h1>
      <h2 className='text-[#889696] text-2xl text-center mt-2 mb-10'>Multisig Wallet Service</h2>
      <ul className={styles.feturesContainer}>
        <li className={styles.feture}>
          <Image src={wallet} alt="Feature image" height={25} width={25} />
          <h3>Create Wallet</h3>
          <p className={styles.fetureText}>Add users and number of approvals needed for transaction to be sent.</p>
        </li>
        <li className={styles.feture}>
          <Image src={ethereum} alt="Feature image" height={30} width={30} />
          <h3>Deposit</h3>
          <p className={styles.fetureText}>Enter amount of ether you want to deposit.</p>
        </li>
        <li className={styles.feture}>
          <Image src={request} alt="Feature image" height={40} width={40} />
          <h3>Request Transaction</h3>
          <p className={styles.fetureText}>Enter recipient and amount of ether you want to send.</p>
        </li>
        <li className={styles.feture}>
          <Image src={send} alt="Feature image" height={25} width={25} />
          <h3>Send Transaction</h3>
          <p className={styles.fetureText}>Once transaction has enough approvals you can send it to recipient.</p>
        </li>
      </ul>
    </div>
  );
};

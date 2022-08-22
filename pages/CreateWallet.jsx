import { useState, useContext } from 'react';
import { PyjamaWalletContext } from '../context/PyjamaWalletContext';

const styles = {
    container: `h-[100vh] grid place-items-center mt-4`,
    interface: `flex flex-col items-center justify-center border rounded-xl border-[#FAFAC6] p-4 mb-4`,
    addressInput: `w-[24rem] p-2 mx-auto my-4 bg-[#333333] border border-[#FAFAC6] text-[#FAFAC6] text-sm rounded-lg focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173]`,
    addAddressBtn: `h-[2rem] text-[#FAFAC6] bg-gradient-to-br from-[#333333] to-[#643173] hover:bg-gradient-to-tl focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173] rounded-lg text-sm text-center mt-5 ml-4 p-2`,
    approvalsInput: `w-auto p-2 mt-2 mx-auto bg-[#333333] border border-[#FAFAC6] text-[#FAFAC6] text-sm rounded-lg focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173]`,
    user: `text-[#FAFAC6] mb-2 p-2 bg-[#333333] border border-[#FAFAC6] rounded-md`,
    createWalletBtn: `text-[#FAFAC6] bg-gradient-to-br from-[#333333] to-[#643173] hover:bg-gradient-to-tl focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173] font-medium rounded-lg text-sm px-5 py-2 text-center mt-4`,
};

const CreateWallet = () => {
    const [user, setUser] = useState('');
    const [users, setUsers] = useState([]);
    const [approvals, setApprovals] = useState('');

    const { createWallet } = useContext(PyjamaWalletContext);

    return (
        <div className={styles.container}>
            <div className={styles.interface}>
                <span className='text-[#FAFAC6] text-2xl '>Create Wallet</span>
                <div className='flex'>
                    <input
                        className={styles.addressInput}
                        placeholder="add user address"
                        value={user}
                        onChange={e => setUser(e.target.value)}
                    />
                    <button
                        className={styles.addAddressBtn}
                        onClick={() => {
                            let _users = [...users];
                            _users.push(user);
                            setUsers(_users);
                            setUser('');
                        }}
                    >
                        Add
                    </button>
                </div>
                <ul>
                    {users.map(user => (<li className={styles.user} key={user}>{user}</li>))}
                </ul>
                <input
                    className={styles.approvalsInput}
                    placeholder="number of approvals"
                    value={approvals}
                    onChange={e => setApprovals(e.target.value)}
                />
                <button
                    className={styles.createWalletBtn}
                    onClick={() => createWallet(users, approvals)}
                >
                    Create Wallet
                </button>
            </div>
        </div>
    );
};

export default CreateWallet;
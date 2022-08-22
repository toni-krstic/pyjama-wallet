import { Fragment, useContext } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { DuplicateIcon } from '@heroicons/react/outline';
import { PyjamaWalletContext } from '../context/PyjamaWalletContext';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Link from 'next/link';

const styles = {
    container: `relative inline-block text-left my-4`,
    menu: `inline-flex justify-center w-full bg-[#333333] rounded-md border border-[#FAFAC6] text-[#FAFAC6] shadow-sm px-4 py-2 text-sm font-medium hover:bg-[#889696] focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173]`,
    menuItems: `origin-top-right absolute left-0 mt-2 rounded-md border border-[#FAFAC6] shadow-lg bg-[#333333] ring-1 ring-black ring-opacity-5 focus:outline-none`,
    menuItemActive: `bg-[#889696] text-[#FAFAC6] block px-4 py-2 text-sm cursor-pointer rounded-md`,
    menuItem: `text-[#FAFAC6] block px-4 py-2 text-sm`
};

const DropDownMenu = () => {
    const { userWallets,
        selectedWallet,
        setSelectedWallet,
        selectedWalletBalance,
        setSelectedWalletBalance,
        selectedWalletTransactions,
        setSelectedWalletTransactions } = useContext(PyjamaWalletContext);

    return (
        <>
            {userWallets.length > 0 ?
                <Menu as="div" className={styles.container}>
                    <div className='flex items-center justify-center text-[#FAFAC6]'>
                        <Menu.Button className={styles.menu}>
                            {selectedWallet.address ? `${selectedWallet.address}` : 'Select Wallet'}
                            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                        </Menu.Button>
                        <CopyToClipboard text={selectedWallet.address ? selectedWallet.address : ''}>
                            <DuplicateIcon className="ml-2 h-6 w-6 cursor-pointer te" aria-hidden="true" />
                        </CopyToClipboard>
                    </div>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className={styles.menuItems}>
                            <div className="py-1">
                                {userWallets.map(wallet => (
                                    <Menu.Item key={wallet.address}>
                                        {({ active }) => (
                                            <div
                                                onClick={() => {
                                                    if (selectedWallet.address === wallet.address) {
                                                        setSelectedWallet({ ...selectedWallet });
                                                        setSelectedWalletBalance(selectedWalletBalance);
                                                        setSelectedWalletTransactions([...selectedWalletTransactions]);

                                                    } else {
                                                        let selected = {
                                                            id: wallet.id,
                                                            address: wallet.address,
                                                            requiredApprovals: wallet.requiredApprovals,
                                                            contract: wallet.contract
                                                        };
                                                        setSelectedWallet(selected);
                                                        setSelectedWalletBalance(wallet.balance);
                                                        setSelectedWalletTransactions(wallet.transactions);
                                                    }
                                                }
                                                }
                                                className={active ? `${styles.menuItemActive}` : `${styles.menuItem}`}
                                            >
                                                {wallet.address}
                                            </div>
                                        )}
                                    </Menu.Item>
                                ))}
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
                :
                <div className='text-[#FAFAC6] h-screen grid place-items-center'>
                    <Link href="/CreateWallet">
                        <span className="text-2xl font-semibold whitespace-nowrap cursor-pointer">Create Wallet</span>
                    </Link>
                </div>
            }
        </>
    );
};

export default DropDownMenu;
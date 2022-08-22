import { Fragment, useContext } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { PyjamaWalletContext } from '../context/PyjamaWalletContext';
import Link from 'next/link';

const navigation = [
    { name: 'My Wallets', href: '/MyWallets' },
    { name: 'Create Wallet', href: '/CreateWallet' }
];

const styles = {
    navbar: `max-w-7xl mx-auto px-2 sm:px-6 lg:px-8`,
    container: `relative flex items-center justify-between h-16`,
    connectWalletBtnContainer: `absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0`,
    connectWalletBtn: `text-[#FAFAC6] bg-gradient-to-br from-[#333333] to-[#643173] hover:bg-gradient-to-tl focus:outline-none focus:ring focus:ring-offset focus:ring-offset-[#FAFAC6] focus:ring-[#643173] font-medium rounded-lg text-sm px-4 py-2 text-center mr-2 mb-2`,
    mobileMenuBtnContainer: `absolute inset-y-0 left-0 flex items-center sm:hidden`,
    mobileMenuBtn: `inline-flex items-center justify-center p-2 rounded-md text-[#FAFAC6] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`,
    navItems: `flex-1 flex items-center justify-center sm:items-stretch sm:justify-start`,
    navItem: `text-[#FAFAC6] hover:bg-[#333333] px-3 py-2 rounded-md text-sm font-medium`,
    menuContainer: `absolute inset-x-0 transition transform origin-top-left sm:hidden z-40`,
    menuItems: `px-2 pt-2 pb-3 space-y-1 bg-[#333333]`,
    menuItem: `text-[#FAFAC6] hover:bg-[#889696] border-b border-[#FAFAC6] block px-3 py-2 mb-2 rounded-md text-base font-medium cursor-pointer`,
};

const Navbar = () => {
    const { loadWeb3Modal, logoutOfWeb3Modal, address } = useContext(PyjamaWalletContext);

    return (
        <Popover as="nav" className="bg-[#889696] border-b border-[#FAFAC6]">
            {({ open }) => (
                <>
                    <div className={styles.navbar}>
                        <div className={styles.container}>
                            <div className={styles.mobileMenuBtnContainer}>
                                <Popover.Button className={styles.mobileMenuBtn}>
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Popover.Button>
                            </div>
                            <div className={styles.navItems}>
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/" className="block lg:hidden h-8 w-auto">
                                        <span className="self-center text-xl font-semibold whitespace-nowrap text-white cursor-pointer">Pyjama Wallet</span>
                                    </Link>
                                </div>
                                <div className="hidden sm:block sm:ml-6">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <Link href={item.href} key={item.name}>
                                                <a className={styles.navItem}>
                                                    {item.name}
                                                </a>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.connectWalletBtnContainer}>
                                <button type="button"
                                    className={styles.connectWalletBtn}
                                    onClick={address ? logoutOfWeb3Modal : loadWeb3Modal}
                                >
                                    {address ? `${address.slice(0, 7) + '...' + address.slice(38)}` : "Connect Wallet"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Transition
                        as={Fragment}
                        enter="duration-200 ease-out"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="duration-100 ease-in"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >

                        <Popover.Panel className={styles.menuContainer}>
                            <div className={styles.menuItems}>
                                {navigation.map((item) => (
                                    <Link href={item.href} key={item.name}>
                                        <Popover.Button as="a" className={styles.menuItem}>
                                            {item.name}
                                        </Popover.Button>
                                    </Link>
                                ))}
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
};

export default Navbar;
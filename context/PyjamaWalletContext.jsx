import { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import Link from 'next/link';
import { Slide, toast } from 'react-toastify';
import { PYJAMA_WALLET_ADDRESS, PYJAMA_WALLET_ABI, MULTISIG_ABI } from '../contracts/contracts';

export const PyjamaWalletContext = createContext();

const TxLink = ({ etherscanLink }) => (
  <Link href={`${etherscanLink}`}>
    <a target='_blank'>
      Transaction Receipt
    </a>
  </Link>
);

export const PyjamaWalletProvider = ({ children }) => {
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [userSigner, setUserSigner] = useState();
  const [pyjamaWallet, setPyjamaWallet] = useState();
  const [userWallets, setUserWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState({});
  const [selectedWalletBalance, setSelectedWalletBalance] = useState('0');
  const [selectedWalletTransactions, setSelectedWalletTransactions] = useState([{}]);

  let web3Modal;
  if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: true,
    });
  }

  async function getWalletTransactions() {
    if (userSigner && selectedWallet && selectedWalletTransactions.length > 0) {
      let wallet = selectedWallet;
      let blockNumber = await injectedProvider.getBlockNumber();
      let transactions = await selectedWallet.contract.queryFilter("TransactionsUpdated", 1, blockNumber);
      let transactionsArray = [];
      transactions.map(tx => {
        let transaction = {
          id: tx.args[0].toString(),
          requested: tx.args[4],
          recipient: tx.args[3],
          amount: ethers.utils.formatEther(tx.args[5].toString()),
          approvals: tx.args[1].toString(),
          action: tx.args[2]
        };
        transactionsArray[tx.args[0].toNumber()] = transaction;
      });
      wallet.transactions = transactionsArray;
      setSelectedWallet(wallet);
      setSelectedWalletTransactions(transactionsArray);
    }
  };

  const transactionsEventListener = async (txID, approvals, action, recipient, requestedBy, amount) => {
    let wallet = selectedWallet;
    let transactionsArray = selectedWalletTransactions;
    let transaction = {
      id: txID.toString(),
      requested: requestedBy,
      recipient: recipient,
      amount: ethers.utils.formatEther(amount.toString()),
      approvals: approvals.toString(),
    };
    transactionsArray[txID.toNumber()] = transaction;
    setSelectedWalletTransactions(transactionsArray);
    let balance = await injectedProvider.getBalance(selectedWallet.address);
    setSelectedWalletBalance(ethers.utils.formatEther(balance.toString()));
    setSelectedWalletTransactions(transactionsArray);
    wallet.balance = balance;
    wallet.transactions = transactionsArray;
    setSelectedWallet(wallet);
    getWalletTransactions();
  };

  const DepositEventListener = async () => {
    let balance = await injectedProvider.getBalance(selectedWallet.address);
    setSelectedWalletBalance(ethers.utils.formatEther(balance.toString()));
  };

  useEffect(() => {
    if (userSigner && selectedWallet.address !== undefined) {
      selectedWallet.contract.on("TransactionsUpdated", transactionsEventListener);
      selectedWallet.contract.on("Deposit", DepositEventListener);
      return () => {
        selectedWallet.contract.off("TransactionsUpdated", transactionsEventListener);
        selectedWallet.contract.off("Deposit", DepositEventListener);
      };
    }
  }, [selectedWallet]);

  useEffect(() => {
    getWalletTransactions();
  }, [selectedWallet]);

  useEffect(() => {
    async function getUserData() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
        const pyjamaWalletContract = new ethers.Contract(PYJAMA_WALLET_ADDRESS, PYJAMA_WALLET_ABI, userSigner);
        setPyjamaWallet(pyjamaWalletContract);
        const walletCount = await pyjamaWalletContract.userWalletCount(newAddress);
        let walletsArray = [];
        for (let i = 0; i < walletCount; i++) {
          let walletAddress = await pyjamaWalletContract.getWalletAddress(newAddress, i);
          let walletBalance = await pyjamaWalletContract.getWalletBalance(newAddress, i);
          let multisigContract = new ethers.Contract(walletAddress, MULTISIG_ABI, userSigner);
          let requiredNumberOfApprovals = await multisigContract.requiredNumOfApprovals();
          let blockNumber = await injectedProvider.getBlockNumber();
          let transactions = await multisigContract.queryFilter("TransactionsUpdated", 1, blockNumber);
          let transactionsArray = [];
          transactions.map(tx => {
            let transaction = {
              id: tx.args[0].toString(),
              requested: tx.args[4],
              recipient: tx.args[3],
              amount: ethers.utils.formatEther(tx.args[5].toString()),
              approvals: tx.args[1].toString(),
              action: tx.args[2]
            };
            transactionsArray[tx.args[0].toNumber()] = transaction;
          });
          let wallet = {
            id: i.toString(),
            address: walletAddress.toString(),
            balance: ethers.utils.formatEther(walletBalance.toString()),
            requiredApprovals: requiredNumberOfApprovals.toString(),
            transactions: transactionsArray,
            contract: multisigContract
          };
          walletsArray.push(wallet);
        }
        setUserWallets(walletsArray);
      }
    }
    getUserData();
  }, [userSigner]);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const loadWeb3Modal = useCallback(async () => {
    try {
      const provider = await web3Modal.connect();
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
      setUserSigner(new ethers.providers.Web3Provider(provider).getSigner());
      if (provider.chainId !== '0x5') toast.info(`The app is on Goerli test net change your chain to Goerli`);

      provider.on("chainChanged", chainId => {
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
        setUserSigner(new ethers.providers.Web3Provider(provider).getSigner());
        if (chainId !== '0x5') {
          toast.info(`The app is on Goerli test net change your chain to Goerli`);
        } else {
          toast.info(`chain changed to Goerli! updating providers`);
        }
      });

      provider.on("accountsChanged", () => {
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
        setUserSigner(new ethers.providers.Web3Provider(provider).getSigner());
        toast.info("account changed!");
      });

      provider.on("disconnect", () => {
        toast.info("account logged out!");
        logoutOfWeb3Modal();
      });

    } catch (error) {
      console.log(error);
    };
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const createWallet = async (users, approvals) => {
    const id = toast.loading("Please wait...", { closeButton: true });
    try {
      if (userSigner) {
        const waveTxn = await pyjamaWallet.deploy(users, approvals);
        await waveTxn.wait();
        toast.update(id, {
          render: <TxLink etherscanLink={`https://goerli.etherscan.io/tx/${waveTxn.hash}`} />,
          type: "success",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      } else {
        toast.update(id, {
          render: "Connect Metamask",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      }
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: "Transaction Failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        transition: Slide,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true
      });
    }
  };

  const deposit = async (walletID, amount) => {
    const id = toast.loading("Please wait...", { closeButton: true });
    try {
      if (userSigner) {
        const waveTxn = await pyjamaWallet.deposit(walletID, { value: ethers.utils.parseEther(amount) });
        await waveTxn.wait();
        toast.update(id, {
          render: <TxLink etherscanLink={`https://goerli.etherscan.io/tx/${waveTxn.hash}`} />,
          type: "success",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      } else {
        toast.update(id, {
          render: "Connect Metamask",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      }
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: "Transaction Failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        transition: Slide,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true
      });
    }
  };

  const requestTransaction = async (recipient, amount, walletID) => {
    const id = toast.loading("Please wait...", { closeButton: true });
    try {
      if (userSigner) {
        const waveTxn = await pyjamaWallet.requestTransaction(recipient, ethers.utils.parseEther(amount), walletID);
        await waveTxn.wait();
        toast.update(id, {
          render: <TxLink etherscanLink={`https://goerli.etherscan.io/tx/${waveTxn.hash}`} />,
          type: "success",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      } else {
        toast.update(id, {
          render: "Connect Metamask",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      }
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: "Transaction Failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        transition: Slide,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true
      });
    }
  };

  const approveTransaction = async (txID, walletID) => {
    const id = toast.loading("Please wait...", { closeButton: true });
    try {
      if (userSigner) {
        const waveTxn = await pyjamaWallet.approveTransaction(txID, walletID);
        await waveTxn.wait();
        toast.update(id, {
          render: <TxLink etherscanLink={`https://goerli.etherscan.io/tx/${waveTxn.hash}`} />,
          type: "success",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      } else {
        toast.update(id, {
          render: "Connect Metamask",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      }
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: "Transaction Failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        transition: Slide,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true
      });
    }
  };

  const sendTransaction = async (txID, walletID) => {
    const id = toast.loading("Please wait...", { closeButton: true });
    try {
      if (userSigner) {
        const waveTxn = await pyjamaWallet.sendTransaction(txID, walletID);
        await waveTxn.wait();
        toast.update(id, {
          render: <TxLink etherscanLink={`https://goerli.etherscan.io/tx/${waveTxn.hash}`} />,
          type: "success",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      } else {
        toast.update(id, {
          render: "Connect Metamask",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          transition: Slide,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: true
        });
      }
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: "Transaction Failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        transition: Slide,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true
      });
    }
  };

  return (
    <PyjamaWalletContext.Provider
      value={{
        loadWeb3Modal,
        logoutOfWeb3Modal,
        address,
        createWallet,
        userWallets,
        selectedWallet,
        setSelectedWallet,
        selectedWalletBalance,
        setSelectedWalletBalance,
        selectedWalletTransactions,
        setSelectedWalletTransactions,
        deposit,
        requestTransaction,
        approveTransaction,
        sendTransaction
      }}>
      {children}
    </PyjamaWalletContext.Provider>
  );
};
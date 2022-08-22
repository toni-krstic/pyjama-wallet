import { useContext } from "react";
import DropDownMenu from "../components/DropDownMenu";
import Wallet from "../components/Wallet";
import { PyjamaWalletContext } from "../context/PyjamaWalletContext";

const styles = {
  container: `grid place-items-center p-2`,
};

const MyWallets = () => {
  const { selectedWallet } = useContext(PyjamaWalletContext);

  return (
    <div className={styles.container}>
      <DropDownMenu />
      {selectedWallet.address === undefined ? <></> : <Wallet />}
    </div>
  );
};

export default MyWallets;
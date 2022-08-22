import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import { PyjamaWalletProvider } from '../context/PyjamaWalletContext';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <PyjamaWalletProvider>
      <Navbar />
      <Component {...pageProps} />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        newestOnTop
      />
    </PyjamaWalletProvider>
  );
};

export default MyApp;

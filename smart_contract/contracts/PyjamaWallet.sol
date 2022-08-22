//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import './Multisig.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

contract PyjamaWallet is Ownable{
    
    mapping(address => mapping(uint256 => Multisig)) wallet;
    mapping(address => uint256) public userWalletCount; 

    function deposit(uint256 _walletId) public payable returns(uint256) {
        wallet[msg.sender][_walletId].deposit{value: msg.value}(msg.sender);
        return address(wallet[msg.sender][_walletId]).balance;
    }

    function requestTransaction(address payable _recipient, uint256 _amount, uint256 _walletId) public {
        wallet[msg.sender][_walletId].requestTransaction(_recipient, _amount, msg.sender);
    } 

    function approveTransaction(uint _txId, uint256 _walletId) public {
        wallet[msg.sender][_walletId].approveTransaction(_txId, msg.sender);
    }

    function sendTransaction(uint _txId, uint256 _walletId) public {
        wallet[msg.sender][_walletId].sendTransaction(_txId, msg.sender);
    }


    function getWalletAddress(address _user, uint256 _walletId) public view returns(address){
        return address(wallet[_user][_walletId]);
    }
    
    function getWalletBalance(address _user, uint256 _walletId) public view returns(uint256){
        return address(wallet[_user][_walletId]).balance;
    }

    function deploy(address[] memory _owners, uint256 _numOfApprovals) public returns (address payable _wallet) {
        _wallet = payable(address(new Multisig(_owners, _numOfApprovals, address(this), msg.sender)));
        for(uint256 i = 0; i<_owners.length; i++){
            wallet[_owners[i]][userWalletCount[_owners[i]]] = Multisig(_wallet);
            userWalletCount[_owners[i]]++;
        }
        wallet[msg.sender][userWalletCount[msg.sender]] = Multisig(_wallet);
        userWalletCount[msg.sender]++;
    }

    function withdraw() public onlyOwner {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}
}
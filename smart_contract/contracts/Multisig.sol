//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Multisig {
    
    mapping(address => mapping(uint => bool)) approved;
    mapping(address => bool) owners;
    uint256 public requiredNumOfApprovals;

    constructor(address[] memory _owners, uint256 _numOfApprovals, address multisigFactory, address deployer){
        for (uint256 i = 0; i<_owners.length; i++){
            owners[_owners[i]] = true;
        } 
        owners[multisigFactory] = true;
        owners[deployer] = true;
        requiredNumOfApprovals = _numOfApprovals;
    }

    event Deposit(uint256 amount, address depositedFrom);
    event TransactionsUpdated(uint256 txId, uint256 Approvals, string action, address recipient, address msgSender, uint256 amount);
    
    modifier onlyOwners {
        require(owners[msg.sender] == true, "You are not the owner");
         _;
    }
    
    struct transaction {
        address payable to;
        uint256 amount;
        uint256 txId;
        uint256 numOfApprovals;
        bool transactionSent;
    }

    transaction[] transactionLog;

    function deposit(address _msgSender) external payable returns(uint256)  {
        emit Deposit(msg.value, _msgSender);
        return address(this).balance;
    }

    function requestTransaction(address payable _recipient, uint256 _amount, address _msgSender) external onlyOwners {
        require(address(this).balance >= _amount, "Balance not sufficient");
        transactionLog.push( transaction(_recipient, _amount, transactionLog.length, 1, false) );
        approved[_msgSender][transactionLog.length-1] = true;
        emit TransactionsUpdated(transactionLog.length-1, 1, "Requested", _recipient, _msgSender, _amount);
    } 

    function approveTransaction(uint _txId, address _msgSender) external onlyOwners {
        require(transactionLog[_txId].transactionSent == false, "Transaction alredy sent.");
        require(approved[_msgSender][_txId] != true, "You already approved this transaction."); 
        transactionLog[_txId].numOfApprovals += 1;
        approved[_msgSender][_txId] = true;
        emit TransactionsUpdated(_txId, transactionLog[_txId].numOfApprovals, "Approved", transactionLog[_txId].to, _msgSender, transactionLog[_txId].amount);
    }

    function sendTransaction(uint _txId, address _msgSender) external onlyOwners {
        require(transactionLog[_txId].transactionSent == false, "Transaction alredy sent.");
        require(transactionLog[_txId].numOfApprovals >= requiredNumOfApprovals, "Not approved you need more approvals");
        require(address(this).balance >= transactionLog[_txId].amount, "Balance not sufficient");
        (bool sent, ) = transactionLog[_txId].to.call{value: transactionLog[_txId].amount}("");
        require(sent, "Failed to send Ether");
        transactionLog[_txId].transactionSent = true;
        emit TransactionsUpdated(_txId, transactionLog[_txId].numOfApprovals, "Sent", transactionLog[_txId].to, _msgSender, transactionLog[_txId].amount);
    }

    receive() external payable {
        emit Deposit(msg.value, msg.sender);
    }
}
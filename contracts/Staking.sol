pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    uint16 constant BP = 10_000;

    IERC20 public immutable token;

    uint256 public sInBP;
    uint256 public total;

    mapping (address => uint) stake;
    mapping (address => uint) s0InBp;

    constructor(address _token) {
        require(_token != address(0), "wrong address");

        token = IERC20(_token);
    }

    function deposit(uint256 _amount) public {
        require(_amount > 0, "empty amount");

        token.transferFrom(msg.sender, address(this), _amount);

        stake[msg.sender] += _amount;
        total += _amount;

        s0InBp[msg.sender] = sInBP;
    }

    function balanceOf(address _user) public view returns(uint256) {
        uint deposited = stake[_user];
        uint reward = (deposited * (sInBP - s0InBp[_user])) / BP;

        return deposited + reward;
    }

    function withdrawAmount(uint256 _amount) public returns(uint256) {
        uint deposited = stake[msg.sender];
        require(deposited > 0, "no deposit");
        require(deposited >= _amount, "out of balance");

        uint _reward = (_amount * (sInBP - s0InBp[msg.sender])) / BP;

        token.transfer(msg.sender, _amount + _reward);

        total -= _amount;
        stake[msg.sender] -= _amount;

        return _amount + _reward;
    }

    function withdraw() public returns(uint256) {
        return withdrawAmount(stake[msg.sender]);
    }

    function distribute(uint _reward) public {
        require(total > 0, "no deposits");

        sInBP += (_reward * BP) / total;

        token.transferFrom(msg.sender, address(this), _reward);
    }
}

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Staking is ERC20 {
    uint16 constant BP = 10_000;

    IERC20 public immutable token;

    uint256 public sInBP;

    mapping (address => uint) s0InBp;

    constructor(address _token) ERC20("Stacking", "STK") {
        require(_token != address(0), "wrong address");

        token = IERC20(_token);
    }

    function deposit(uint256 _amount) public {
        require(_amount > 0, "empty amount");

        token.transferFrom(msg.sender, address(this), _amount);

        _mint(msg.sender, _amount);

        s0InBp[msg.sender] = sInBP;
    }

    function balanceOf(address _user) public override view returns(uint256) {
        uint256 balance = super.balanceOf(_user);
        return balance + calculateRewardValue(_user, balance);
    }

    function withdrawBalance(address _user) public view returns(uint256) {
        return super.balanceOf(_user) + calculateRewardValue(_user, super.balanceOf(_user));
    }

    function calculateRewardValue(address _user, uint256 _amount) public view returns(uint256) {
        return (_amount * (sInBP - s0InBp[_user])) / BP;
    }

    function calculateAmountValue(address _user, uint256 _rewardedAmount) public view returns(uint256) {
        return (_rewardedAmount * BP) / (sInBP - s0InBp[_user]);
    }

    function withdrawAmount(uint256 _amount) public returns(uint256) {
        uint deposited = super.balanceOf(msg.sender);
        require(deposited > 0, "no deposit");
        require(deposited >= _amount, "out of balance");

        uint _withdraw = _amount + calculateRewardValue(msg.sender, _amount);

        token.transfer(msg.sender, _withdraw);
        _burn(msg.sender, _amount);

        return _withdraw;
    }

    function withdraw() public returns(uint256) {
        return withdrawAmount(super.balanceOf(msg.sender));
    }

    function distribute(uint _reward) public {
        require(totalSupply() > 0, "no deposits");

        sInBP += (_reward * BP) / totalSupply();
        token.transferFrom(msg.sender, address(this), _reward);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _burn(from, calculateAmountValue(from, amount));
        _mint(to, calculateAmountValue(to, amount));
    }
}

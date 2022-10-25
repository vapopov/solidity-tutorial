// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract MerkleProof {
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf,
        uint index
    ) public pure returns (bool) {
        bytes32 hash = leaf;

        for (uint i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (index % 2 == 0) {
                hash = keccak256(abi.encodePacked(hash, proofElement));
            } else {
                hash = keccak256(abi.encodePacked(proofElement, hash));
            }

            index = index / 2;
        }

        return hash == root;
    }
}


contract TestMerkleProof is MerkleProof, Initializable, UUPSUpgradeable {
    bytes32[] public hashes;

    uint256 public y;

    function initialize() public onlyInitializing {
        y = 42;
    }

    constructor() {
        string[4] memory transactions = [
        "alice -> bob",
        "bob -> dave",
        "carol -> alice",
        "dave -> bob"
        ];

        for (uint i = 0; i < transactions.length; i++) {
            hashes.push(keccak256(abi.encodePacked(transactions[i])));
        }

        uint n = transactions.length; // 4
        uint offset = 0;

        while (n > 0) {
            for (uint i = 0; i < n - 1; i += 2) {
                hashes.push(
                    keccak256(
                        abi.encodePacked(hashes[offset + i], hashes[offset + i + 1])
                    )
                );
            }
            offset += n;
            n = n / 2;
        }
    }

    function getHashes(uint start, uint end) public view returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](end - start);

        uint counter = 0;

        for(uint i = start; i < end; i++) {
            result[counter] = hashes[i];
            counter++;
        }

        return result;
    }

    function getLen() public view returns (uint) {
        return hashes.length;
    }

    function getHashById(uint _id) public view returns (bytes32) {
        return hashes[_id];
    }

    function getRoot() public view returns (bytes32) {
        return hashes[hashes.length - 1];
    }

    function _authorizeUpgrade(address newImplementation) internal override {}

    /* verify
    3rd leaf
    0xdca3326ad7e8121bf9cf9c12333e6b2271abe823ec9edfe42f813b1e768fa57b

    root
    0xcc086fcc038189b4641db2cc4f1de3bb132aefbd65d510d817591550937818c7

    index
    2

    proof
    0x8da9e1c820f9dbd1589fd6585872bc1063588625729e7ab0797cfc63a00bd950
    0x995788ffc103b987ad50f5e5707fd094419eb12d9552cc423bd0cd86a3861433
    */
}

contract MerkleFactory is Initializable, UUPSUpgradeable {
    event Deployed(address _addr);

    uint256 public y;

    function initialize() public onlyInitializing {
        y = 42;
    }

    function deploy(uint _salt) public payable returns (address) {
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2
        address addr = address(new TestMerkleProof{salt: bytes32(_salt)}());
        emit Deployed(addr);

        return addr;
    }

    function getAddress(bytes32 _salt) public view returns (address) {
        // This complicated expression just tells you how the address
        // can be pre-computed. It is just there for illustration.
        // You actually only need ``new D{salt: salt}(arg)``.
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(abi.encodePacked(
                    type(TestMerkleProof).creationCode,
                    abi.encode()
                ))
            )))));

        return predictedAddress;
    }

    function _authorizeUpgrade(address newImplementation) internal override {}
}

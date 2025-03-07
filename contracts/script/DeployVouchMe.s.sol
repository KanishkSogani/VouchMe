// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VouchMe.sol";

contract DeployVouchMe is Script {
    function setUp() public {}

    function run() external {
        vm.startBroadcast();
        
        // Deploy the VouchMe contract
        VouchMe vouchMe = new VouchMe();
        
        vm.stopBroadcast();

        console.log("VouchMe deployed at:", address(vouchMe));
    }
}

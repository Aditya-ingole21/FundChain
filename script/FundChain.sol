// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {FundChain} from "../src/FundChain.sol";

contract CounterScript is Script {
FundChain public fund;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        fund = new FundChain();

        vm.stopBroadcast();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/VouchMe.sol";

contract TestHelpers is Test {
    
    /**
     * @dev Creates a proper signature for testing
     * @param signerPrivateKey The private key of the signer
     * @param receiver The receiver address
     * @param content The testimonial content
     * @param giverName The giver's name
     * @param profileUrl The profile URL
     */
    function createProperSignature(
        uint256 signerPrivateKey,
        address signer,
        address receiver,
        string memory content,
        string memory giverName,
        string memory profileUrl
    ) internal pure returns (bytes memory) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(signer, receiver, content, giverName, profileUrl)
        );
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, ethSignedMessageHash);
        return abi.encodePacked(r, s, v);
    }
    
    /**
     * @dev Creates a testimonial with proper signature
     */
    function createTestimonialWithValidSignature(
        VouchMe vouchMe,
        uint256 senderPrivateKey,
        address sender,
        address receiver,
        string memory content,
        string memory giverName,
        string memory profileUrl
    ) internal returns (uint256) {
        bytes memory signature = createProperSignature(
            senderPrivateKey, sender, receiver, content, giverName, profileUrl
        );
        
        vm.prank(receiver);
        return vouchMe.createTestimonial(sender, content, giverName, profileUrl, signature);
    }
    
    /**
     * @dev Asserts that two testimonials are equal
     */
    function assertTestimonialEqual(
        VouchMe.Testimonial memory actual,
        address expectedSender,
        address expectedReceiver,
        string memory expectedContent,
        string memory expectedGiverName,
        string memory expectedProfileUrl,
        bool expectedVerified
    ) internal {
        assertEq(actual.sender, expectedSender);
        assertEq(actual.receiver, expectedReceiver);
        assertEq(actual.content, expectedContent);
        assertEq(actual.giverName, expectedGiverName);
        assertEq(actual.profileUrl, expectedProfileUrl);
        assertEq(actual.verified, expectedVerified);
    }
}

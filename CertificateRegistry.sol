// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    address public universityAdmin;

    struct Certificate {
        string studentId;
        string courseName;
        uint256 issueTimestamp;
        bool isValid;
    }

    // Mapping from certificate hash to Certificate struct
    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(
        bytes32 indexed certHash,
        string studentId,
        string courseName
    );

    event CertificateRevoked(bytes32 indexed certHash);

    // Only university admin can issue certificates
    modifier onlyAdmin() {
        require(
            msg.sender == universityAdmin,
            "Unauthorized: Admin only"
        );
        _;
    }

    // The wallet deploying the contract becomes the admin
    constructor() {
        universityAdmin = msg.sender;
    }

    // Issue a new certificate
    function issueCertificate(
        bytes32 _certHash,
        string memory _studentId,
        string memory _courseName
    ) public onlyAdmin {
        require(
            !certificates[_certHash].isValid,
            "Certificate already exists"
        );

        certificates[_certHash] = Certificate(
            _studentId,
            _courseName,
            block.timestamp,
            true
        );

        emit CertificateIssued(
            _certHash,
            _studentId,
            _courseName
        );
    }

    // Verify a certificate
    function verifyCertificate(
        bytes32 _certHash
    )
        external
        view
        returns (
            bool isValid,
            string memory studentId,
            string memory courseName,
            uint256 issueTimestamp
        )
    {
        Certificate memory cert = certificates[_certHash];

        return (
            cert.isValid,
            cert.studentId,
            cert.courseName,
            cert.issueTimestamp
        );
    }
}
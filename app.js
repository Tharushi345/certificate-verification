// ==========================================
// BLOCKCHAIN CERTIFICATE VERIFICATION SYSTEM
// ==========================================

// Deployed Smart Contract Address
const CONTRACT_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";

// Contract ABI
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "certHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "courseName",
                "type": "string"
            }
        ],
        "name": "CertificateIssued",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "certHash",
                "type": "bytes32"
            }
        ],
        "name": "CertificateRevoked",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "certificates",
        "outputs": [
            {
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "courseName",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "issueTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isValid",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_certHash",
                "type": "bytes32"
            },
            {
                "internalType": "string",
                "name": "_studentId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_courseName",
                "type": "string"
            }
        ],
        "name": "issueCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "universityAdmin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_certHash",
                "type": "bytes32"
            }
        ],
        "name": "verifyCertificate",
        "outputs": [
            {
                "internalType": "bool",
                "name": "isValid",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "courseName",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "issueTimestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global variables
let provider;
let signer;
let contract;

// ==========================================
// CONNECT METAMASK
// ==========================================
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }

    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();

        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );

        const address = await signer.getAddress();
        const walletAddressElem = document.getElementById("walletAddress");
        if (walletAddressElem) {
            walletAddressElem.innerText = "Connected Wallet: " + address;
        }

        alert("MetaMask connected successfully!");
    } catch (error) {
        console.error("Wallet Connection Error:", error);
        alert("Wallet connection failed: " + (error.message || error));
    }
}

// ==========================================
// SHA-256 HASH GENERATION
// ==========================================
async function calculateSHA256(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

async function generateHash() {
    const fileInput = document.getElementById("certificateFile");
    const file = fileInput ? fileInput.files[0] : null;
    if (!file) return;

    const hash = await calculateSHA256(file);
    const hashDisplay = document.getElementById("hashDisplay");
    if (hashDisplay) {
        hashDisplay.classList.remove("hidden");
        hashDisplay.innerText = "SHA-256 Hash:\n" + hash;
    }
}

// ==========================================
// ISSUE CERTIFICATE
// ==========================================
async function issueCertificate() {
    if (!contract) {
        alert("Please connect MetaMask first.");
        return;
    }

    const studentIdElem = document.getElementById("studentId");
    const courseNameElem = document.getElementById("courseName");
    const fileInput = document.getElementById("certificateFile");

    const studentId = studentIdElem ? studentIdElem.value.trim() : "";
    const course = courseNameElem ? courseNameElem.value.trim() : "";
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!studentId || !course || !file) {
        alert("Please enter Student ID, Course Name and choose Certificate File.");
        return;
    }

    const resultBox = document.getElementById("issueResult");

    try {
        const rawHash = await calculateSHA256(file);
        const hashBytes32 = "0x" + rawHash;

        if (resultBox) {
            resultBox.className = "result success";
            resultBox.innerText = "⏳ Sending transaction... Please confirm in MetaMask.";
        }

        const tx = await contract.issueCertificate(hashBytes32, studentId, course);

        if (resultBox) {
            resultBox.innerText = "⏳ Transaction submitted. Waiting for confirmation...";
        }

        await tx.wait();

        if (resultBox) {
            resultBox.innerText = "✅ Certificate successfully stored on blockchain!";
        }
    } catch (error) {
        console.error("Issue Error:", error);
        if (resultBox) {
            resultBox.className = "result error";
            resultBox.innerText = "❌ Transaction failed: " + (error.reason || error.message);
        }
    }
}

// ==========================================
// GENERATE VERIFY HASH
// ==========================================
async function generateVerifyHash() {
    const fileInput = document.getElementById("verifyFile");
    const file = fileInput ? fileInput.files[0] : null;
    if (!file) return;

    const hash = await calculateSHA256(file);
    const hashDisplay = document.getElementById("verifyHashDisplay");
    if (hashDisplay) {
        hashDisplay.classList.remove("hidden");
        hashDisplay.innerText = "SHA-256 Hash:\n" + hash;
    }
}

// ==========================================
// VERIFY CERTIFICATE
// ==========================================
async function verifyCertificate() {
    if (!contract) {
        if (window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        } else {
            alert("Please connect MetaMask first.");
            return;
        }
    }

    const fileInput = document.getElementById("verifyFile");
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!file) {
        alert("Please upload a certificate PDF to verify.");
        return;
    }

    const resultBox = document.getElementById("verifyResult");

    try {
        const rawHash = await calculateSHA256(file);
        const hashBytes32 = "0x" + rawHash;

        let studentId = "";
        let courseName = "";
        let timestamp = 0;
        let isValid = false;

        // Try mapping query
        try {
            const mapRes = await contract.certificates(hashBytes32);
            studentId = mapRes[0] || mapRes.studentId || "";
            courseName = mapRes[1] || mapRes.courseName || "";
            timestamp = mapRes[2] || mapRes.issueTimestamp || 0;
            isValid = mapRes[3] !== undefined ? mapRes[3] : (mapRes.isValid || false);
        } catch (e) {
            console.log("Mapping read bypassed, trying function call...");
        }

        // Try function query if mapping returned empty
        if (!isValid || !studentId) {
            const funcRes = await contract.verifyCertificate(hashBytes32);
            isValid = funcRes[0] !== undefined ? funcRes[0] : funcRes.isValid;
            studentId = funcRes[1] || funcRes.studentId || "";
            courseName = funcRes[2] || funcRes.courseName || "";
            timestamp = funcRes[3] || funcRes.issueTimestamp || 0;
        }

        if (isValid && studentId !== "") {
            const date = new Date(Number(timestamp) * 1000).toLocaleString();
            if (resultBox) {
                resultBox.className = "result success";
                resultBox.innerHTML = `
                    <strong>✅ CERTIFICATE VERIFIED</strong>
                    <br><br>
                    <strong>Student ID:</strong> ${studentId}
                    <br>
                    <strong>Course:</strong> ${courseName}
                    <br>
                    <strong>Issued Date:</strong> ${date}
                `;
            }
        } else {
            if (resultBox) {
                resultBox.className = "result error";
                resultBox.innerText = "❌ Certificate is NOT VALID or NOT FOUND on Blockchain.";
            }
        }
    } catch (error) {
        console.error("Verify Error:", error);
        if (resultBox) {
            resultBox.className = "result error";
            resultBox.innerText = "❌ Certificate not found on blockchain.";
        }
    }
}

// ==========================================
// TAB SWITCHING
// ==========================================
function showTab(tabName) {
    const issuerTab = document.getElementById("issuer");
    const verifierTab = document.getElementById("verifier");

    if (issuerTab) issuerTab.classList.add("hidden");
    if (verifierTab) verifierTab.classList.add("hidden");

    if (tabName === "issuer" && issuerTab) {
        issuerTab.classList.remove("hidden");
    }
    if (tabName === "verifier" && verifierTab) {
        verifierTab.classList.remove("hidden");
    }
}
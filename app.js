const contractAddress = "0xda1a9d9C315f86766fEE64B801c4448D7D3a087c";
const abi = [
  "function mint() public payable",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function totalMinted() view returns (uint256)"
];

let provider, signer, contract, web3modal;

async function initWeb3Modal() {
  const { EthereumProvider } = window.WalletConnectModal;
  const { Web3Modal } = window.Web3Modal;

  web3modal = new Web3Modal({
    projectId: "4a731443ecd601d86c796c41dbbc608b", // Your WalletConnect Project ID
    walletConnectVersion: 2,
    themeMode: "light",
    themeVariables: {
      "--w3m-accent": "#10b981"
    },
  });

  document.getElementById("connect").onclick = async () => {
    try {
      const instance = await web3modal.connect();
      provider = new ethers.BrowserProvider(instance);
      signer = await provider.getSigner();
      contract = new ethers.Contract(contractAddress, abi, signer);
      await updateUI();
    } catch (err) {
      console.error("Wallet connection failed:", err);
      showStatus("❌ Failed to connect wallet.");
    }
  };
}

async function updateUI() {
  try {
    const address = await signer.getAddress();
    const balance = Number(await contract.balanceOf(address));
    const total = Number(await contract.totalMinted());

    document.getElementById("wallet").innerText = `👛 Wallet: ${address}`;
    document.getElementById("balance").innerText = `💎 You have ${balance} FREN`;
    document.getElementById("networth").innerText = `🌍 Net Worth: 💰$${(balance * 1_000_000_000_000).toLocaleString()} USD`;
    document.getElementById("totalMinted").innerText = `🧾 Total FREN Minted: ${total} / 10,000`;

    document.getElementById("mint").disabled = balance > 0;
    document.getElementById("gift").disabled = balance === 0;
  } catch (err) {
    console.error("updateUI failed:", err);
    showStatus("❌ Failed to fetch balance.");
  }
}

document.getElementById("mint").onclick = async () => {
  try {
    const tx = await contract.mint({ value: 0 });
    await tx.wait();
    showStatus("✅ Minted! Updating...");
    updateUI();
  } catch (err) {
    console.error("Mint error:", err);
    showStatus("❌ Mint failed: " + err.message);
  }
};

document.getElementById("gift").onclick = async () => {
  const to = document.getElementById("giftAddress").value.trim();
  if (!ethers.isAddress(to)) return alert("❌ Invalid address.");

  try {
    const tx = await contract.transfer(to, 1);
    await tx.wait();
    document.getElementById("giftAddress").value = "";
    showStatus("✅ Gift sent! Updating...");
    updateUI();
  } catch (err) {
    console.error("Gift error:", err);
    showStatus("❌ Gift failed: " + err.message);
  }
};

function showStatus(msg) {
  document.getElementById("status").innerText = msg;
}

// 🔁 Initialize WalletConnect modal
initWeb3Modal();

const contractAddress = "0xda1a9d9C315f86766fEE64B801c4448D7D3a087c"; // your contract
const abi = [
  "function mint() public payable",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function totalMinted() view returns (uint256)"
];

let provider, signer, contract;

const projectId = "4a731443ecd601d86c796c41dbbc608b"; // your WC project ID

const bscTestnet = {
  chainId: 97,
  name: "BSC Testnet",
  currency: "tBNB",
  explorerUrl: "https://testnet.bscscan.com",
  rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/"
};

const web3Modal = new window.Web3Modal.default({
  projectId,
  themeMode: "light",
  walletConnectVersion: 2,
  standaloneChains: [bscTestnet.chainId],
  chains: [{
    chainId: bscTestnet.chainId,
    name: bscTestnet.name,
    currency: bscTestnet.currency,
    explorerUrl: bscTestnet.explorerUrl,
    rpcUrl: bscTestnet.rpcUrl
  }]
});

document.getElementById("connect").onclick = async () => {
  try {
    const instance = await web3Modal.connect();
    provider = new ethers.BrowserProvider(instance);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    await updateUI();
  } catch (err) {
    console.error("❌ Connection failed:", err);
    showStatus("❌ WalletConnect failed.");
  }
};

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

    showStatus("✅ Connected");
  } catch (err) {
    console.error("updateUI error:", err);
    showStatus("❌ Failed to load wallet data.");
  }
}

document.getElementById("mint").onclick = async () => {
  try {
    showStatus("⏳ Minting...");
    const tx = await contract.mint({ value: 0 });
    await tx.wait();
    showStatus("✅ Minted!");
    await updateUI();
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
    showStatus("✅ Gift sent!");
    await updateUI();
  } catch (err) {
    console.error("Gift error:", err);
    showStatus("❌ Gift failed: " + err.message);
  }
};

function showStatus(msg) {
  document.getElementById("status").innerText = msg;
}

const contractAddress = "0xda1a9d9C315f86766fEE64B801c4448D7D3a087c";
const abi = [
  "function mint() public payable",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function totalMinted() view returns (uint256)"
];

let provider, signer, contract;

document.getElementById("connect").onclick = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await initProvider();
    await updateUI();
  } catch (err) {
    console.error("Connect error:", err);
    showStatus("❌ Failed to connect wallet.");
  }
};

async function initProvider() {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);
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

    showStatus("");
  } catch (err) {
    console.error("Update UI error:", err);
    showStatus("❌ Failed to fetch balance.");
  }
}

document.getElementById("mint").onclick = async () => {
  try {
    showStatus("⏳ Minting...");
    const tx = await contract.mint({ value: 0 });
    await tx.wait();
    runConfetti();
    showStatus("✅ Minted! Refreshing in 10s...");
    startCountdown(10, reconnect);
  } catch (err) {
    console.error("Mint error:", err);
    showStatus("❌ Mint failed: " + err.message);
  }
};

document.getElementById("gift").onclick = async () => {
  const to = document.getElementById("giftAddress").value.trim();
  if (!ethers.isAddress(to)) {
    alert("❌ Invalid address.");
    return;
  }

  try {
    showStatus("🎁 Sending FREN...");
    const tx = await contract.transfer(to, 1);
    await tx.wait();
    document.getElementById("giftAddress").value = "";
    runConfetti();
    showStatus("✅ Gift sent! Refreshing in 10s...");
    startCountdown(10, reconnect);
  } catch (err) {
    console.error("Gift error:", err);
    showStatus("❌ Gift failed: " + err.message);
  }
};

function startCountdown(seconds, callback) {
  const statusEl = document.getElementById("status");
  let current = seconds;

  const countdown = setInterval(() => {
    statusEl.innerText = `🔄 Refreshing in ${current} second${current !== 1 ? 's' : ''}...`;
    current--;

    if (current < 0) {
      clearInterval(countdown);
      statusEl.innerText = "🔁 Reconnecting...";
      callback().then(() => {
        showStatus("✅ Balance updated!");
      });
    }
  }, 1000);
}

async function reconnect() {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  await initProvider();
  await updateUI();
}

function runConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function showStatus(message) {
  document.getElementById("status").innerText = message;
}

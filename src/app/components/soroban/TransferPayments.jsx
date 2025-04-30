import { Server, Keypair, TransactionBuilder, Networks, Operation, Asset } from "stellar-sdk";
import { invokeContractFunction } from "@stellar/soroban-client"; 

const server = new Server("https://soroban-testnet.stellar.org");

async function fundProject(userPublicKey, projectId, amount) {
  try {
    const account = await server.loadAccount(userPublicKey);

    // Build transaction
    const tx = new TransactionBuilder(account, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({
        destination: YOUR_SMART_CONTRACT_ADDRESS,
        asset: Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    // Sign and submit
    await window.freighterApi.signTransaction(tx.toXDR(), { network: "TESTNET" });
    const txResponse = await server.submitTransaction(tx);
    console.log("Fund Payment TX Success", txResponse);

    // Then call Smart Contract to update backend
    await invokeContractFunction('fund_program', [projectId, userPublicKey, amount]);

  } catch (error) {
    console.error("Error funding project:", error);
  }
}


import {
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
  Asset
} from "stellar-sdk";

async function sendPayment(senderSecret, destinationID, amount) {
  const sourceKeypair = Keypair.fromSecret(senderSecret);
  const server = new Server("https://horizon-testnet.stellar.org");

  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

  const fee = await server.fetchBaseFee();

  const transaction = new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.payment({
      destination: destinationID,
      asset: Asset.native(),
      amount: amount.toString(),
    }))
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeypair);

  try {
    const result = await server.submitTransaction(transaction);
    console.log("Payment Success!", result);
    return result.hash; // return txn hash
  } catch (e) {
    console.error("Payment Failed:", e);
    throw e;
  }
}

/*
function MissionDetailsPage() {
  const { missionID } = useParams();
  const router = useRouter();

  const {
    getMission,
    getRemainingFunds,
    fundMission,
    getNftMetadata,
  } = useSmartContract();

  const [missionData, setMissionData] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [nftData, setNftData] = useState(null);

  // Fetch mission and remaining funds
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const mission = await getMission(missionID);
        const remainingFunds = await getRemainingFunds(missionID);
        setMissionData(mission);
        setRemaining(remainingFunds);
      } catch (error) {
        toast.error("Failed to load mission data");
      } finally {
        setLoading(false);
      }
    };

    if (missionID) fetchDetails();
  }, [missionID]);

  // Fund Mission + Mint NFT + Update dashboard
  const handleFundMission = async () => {
    try {
      if (!amount || isNaN(amount)) {
        toast.warning("Enter valid amount");
        return;
      }

      setLoading(true);
      toast.info("Processing fund transaction...");
      await fundMission(missionID, amount);

      toast.success("Mission funded! Minting NFT...");
      const metadata = await getNftMetadata(missionID);
      setNftData(metadata);

      const updatedRemaining = await getRemainingFunds(missionID);
      setRemaining(updatedRemaining);

      toast.success("NFT minted & remaining funds updated!");
    } catch (error) {
      console.error(error);
      toast.error("Funding failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !missionData) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <span className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-10 py-10 bg-[#0f0c29] text-white">
      <button onClick={() => router.back()} className="text-teal-300 mb-4 hover:underline">
        ← Back
      </button>

      <div className="bg-[#1e1e2f] p-6 rounded-xl shadow-xl">
        <img src={missionData.image_url} alt="Mission" className="w-full h-64 object-cover rounded-lg mb-6" />
        <h1 className="text-4xl font-bold mb-2">{missionData.title}</h1>
        <p className="text-gray-300 mb-4">{missionData.desc}</p>
        <p className="text-lg mb-2">🎯 Target: <span className="font-semibold">{Number(missionData.target_amount)}</span> XLM</p>
        <p className="text-lg mb-6 text-teal-400">💰 Remaining: {remaining ?? 'Loading...'} XLM</p>

        <div className="flex items-center gap-4">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 rounded-md bg-[#2d2d44] text-white border border-gray-600 w-40"
          />
          <button
            onClick={handleFundMission}
            className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-md font-semibold"
          >
            Fund Mission 🚀
          </button>
        </div>

        {nftData && (
          <div className="mt-8 bg-[#2a2a3c] p-4 rounded-md">
            <h2 className="text-xl font-semibold text-teal-300">🎉 NFT Minted!</h2>
            <p className="mt-2">Token ID: {nftData.token_id}</p>
            <p>Metadata: {nftData.details}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const smartContractInteraction = () => {

const StellarSdk = require('@stellar/stellar-sdk');
const { userSignTransaction } = require('@stellar/freighter-api');

const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const sorobanServer = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; 
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Helper function to convert values to ScVal
const toScVal = (value, type) => {
  switch (type) {
    case 'address':
      return new StellarSdk.Address(value).toScVal();
    case 'string':
      return StellarSdk.nativeToScVal(value);
    case 'i128':
      return StellarSdk.nativeToScVal(value, { type: 'i128' });
    case 'bytesN':
      return StellarSdk.nativeToScVal(value, { type: 'bytesN' });
    default:
      throw new Error('Unsupported type');
  }
};

// Endpoint to retrieve NFT metadata
const contractFunc = async (req, res) => {
  const { missionId } = req.params;

  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await sorobanServer.getAccount(CONTRACT_ID);

    const getNftTx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_nft_metadata', toScVal(missionId, 'bytesN')))
      .setTimeout(30)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(getNftTx);
    const signedXDR = await userSignTransaction(preparedTx.toXDR(), NETWORK_PASSPHRASE, CONTRACT_ID);
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);

    const txResponse = await sorobanServer.sendTransaction(signedTx);

    // Poll for transaction result
    let result = await sorobanServer.getTransaction(txResponse.hash);
    while (result.status === 'NOT_FOUND') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await sorobanServer.getTransaction(txResponse.hash);
    }

    if (result.status !== 'SUCCESS') {
      throw new Error('Failed to retrieve NFT metadata');
    }

    res.json({ metadata: result.returnValue });
  } catch (error) {
    console.error('Error retrieving NFT metadata:', error);
    res.status(500).json({ error: error.message });
  }
};



  return (
    <div>smartContractInteraction</div>
  )
}
 */




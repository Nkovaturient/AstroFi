


export async function POST() {
    try {
    const { donorSecret, missionId, amount } = req.body;
        
    // Load donor account
    const donorKeypair = StellarSdk.Keypair.fromSecret(donorSecret);
    const donorPublicKey = donorKeypair.publicKey();
    const donorAccount = await server.loadAccount(donorPublicKey);

    // Create payment transaction
    const paymentTx = new StellarSdk.TransactionBuilder(donorAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: CONTRACT_ID,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    // Sign and submit payment transaction
    paymentTx.sign(donorKeypair);
    await server.submitTransaction(paymentTx);

    // Prepare contract invocation
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await sorobanServer.getAccount(donorPublicKey);

    const fundMissionTx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('fund_mission', toScVal(missionId, 'bytesN'), toScVal(donorPublicKey, 'address'), toScVal(amount, 'i128')))
      .setTimeout(30)
      .build();

    // Prepare and sign transaction
    const preparedTx = await sorobanServer.prepareTransaction(fundMissionTx);
    const signedXDR = await userSignTransaction(preparedTx.toXDR(), NETWORK_PASSPHRASE, donorPublicKey);
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);

    // Submit transaction
    const txResponse = await sorobanServer.sendTransaction(signedTx);

    // Poll for transaction result
    let result = await sorobanServer.getTransaction(txResponse.hash);
    while (result.status === 'NOT_FOUND') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await sorobanServer.getTransaction(txResponse.hash);
    }

    if (result.status !== 'SUCCESS') {
      throw new Error('Contract invocation failed');
    }

    return new Response(JSON.stringify({ message: 'Funding successful and NFT minted' }), { status: 200 });
        
    } catch (error) {
        console.error('Error processing funding:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        
    }
}
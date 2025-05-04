## AstroFi : Decentralized CrowdFunding Platform for Space Research
- A decentralized finance platform powered by Stellar for seamless, secure, and scalable financial solutions for funding space mission and research programs.
- [Technical Doc](https://docs.google.com/document/d/1Uh75iQdImAMI1BNcoXbz31P-S3b9esgyVZdeb6Sxwec/edit?usp=sharing)
- [Pitch Deck](https://www.canva.com/design/DAGmB2pQ1aA/fS_3W4aPx8x3uGxOUrjKXg/view?utm_content=DAGmB2pQ1aA&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h027ce33324)

  
![a1-cool](https://github.com/user-attachments/assets/d2476bbc-9572-4bd1-9f8b-fe080717182a)


## About Me 
Hi, I'm Neha Kumari, a passionate blockchain developer with a mission to democratize finance through decentralized technologies. With learning experience in Stellar, smart contracts, and full-stack development, I created AstroFi to empower the scientific community with secure, transparent, and accessible financial tools. Through this project, I  aim to deliver a robust solution for the space community and research programs to get easily funded and the investors can even be rewarded with `MissionNFT` badge to showcase their contributions -- promoting win-win situation for both parties involved.

## What is AstroFi?
AstroFi is a decentralized finance (DeFi) platform built on the Stellar blockchain, designed to provide fast, low-cost, and secure financial services. By leveraging Stellar’s robust network and custom smart contracts (via Soroban), AstroFi enables users to lend, stake, and transfer assets globally with minimal fees.
![Screenshot (576)](https://github.com/user-attachments/assets/22720d9b-08a9-4cbc-bf25-8ee596e542e1)

![Screenshot (577)](https://github.com/user-attachments/assets/4efbe7be-6818-4f9d-9b36-3a492caa05c1)

## ## FRONTEND (Next.js) Flow

1. **User lands** →
    
    Fetch & display **missions/projects** dynamically (title, desc, goal fund, associated orgs, uploadables).
    
2. **Connect Wallet**

    - Via Freighter extension (`WalletProvider` already setup ✅).
3. **User clicks Fund** on any Mission →
    - Input: amount to donate (in XLM).
4. **On Payment Proceed**:
    - Initiate `fund_program()` Smart Contract function call using Stellar SDK + Soroban SDK.
    - Once payment is confirmed:
        - Call `mintNft()` Smart Contract function to mint **Mission NFT** (metadata = wallet address + missionID + contribution).
5. **Show NFT Rewards page** — user's NFT minted records.

---

## 🔹 SMART CONTRACTS on Soroban

-  Smart Contracts 📜
- `Contract Address: CDNYQW733S7TLMUOCB7NKMMAQAT42FCC6ZS3JMVYZJTR54M44OFSR3ZR `

| Contract | Purpose |
| --- | --- |
| **MissionFundContract** | Manages program funding (`fund_program()`, `calc_remaining_fund()`) |
| **MissionNftContract** | Handles reward NFT minting (`mintNft()`) |

# **AstroFi Smart Contracts (Soroban)**

1. **FundMission Contract**
    - Accept funding deposits
    - call nftMint() contract and assign `Mission {Title} Nft` reward to users on complete funding
    - track the remaining project funding `Remaining`:  to calculate how much funding for the project is still needed after a contributor donates.
    - `let remaining_fund = mission.amount - funding_amount`
    
    
2. **NFTMint Contract**
    - Mint NFT badges when user donates
    - Link NFT to Mission ID & User Address
    - nft metadata structure :
    
    `{
    "description": Mission Description,
    "image": `MissionImg` or` [NFT Mission Image](https://www.freepik.com/free-ai-image/international-day-education-futuristic-style_94953586.htm#fromView=search&page=1&position=21&uuid=78ee3014-9b0b-47b1-802c-2405ffc5775d&query=astronomy+research)`,
    "name": MissionTitle,
    "attributes": [contributor's wallet address, MissionID ]
    }`


## Demo 🎥
Watch AstroFi in action! Check out our demo video to see how easy it is to send payments, surf dashboard, and manage your rewarded NFTs.

- [SmartContract Deployment video via Stella CLI](https://www.loom.com/share/4a5ee00c83e64acba8a4eaeb88137add)


## Getting Started Locally 🛠️
Follow these steps to set up AstroFi on your local machine.

### Prerequisites

- Node.js (v20 or higher)
- Stellar SDK (stellar-sdk for JavaScript)

### Installation

- Clone the Repository:git clone https://github.com/yourusername/astrofi.git
- cd astrofi
- Install Dependencies:npm install
- Run the Application:npm run dev
- Access the App:Open http://localhost:3000 in your browser.


## Solutions Embedded 🧩
AstroFi integrates several innovative solutions to enhance user experience and functionality:

- Invest in space missions and reserach programs
- Real-Time Transaction Monitoring: Track transactions on the Stellar network with live updates.
- Multi-Signature Wallets: Enhance security with multi-sig accounts for enterprise users.
- AI-Powered Insights: Use integrated analytics to optimize lending and staking strategies.(coming soon)


## AstroFi uses Soroban, Stellar’s smart contract platform, to automate financial operations. Key smart contracts include:

## Stellar Integration 🌍
AstroFi is deeply integrated with the Stellar blockchain, leveraging its features for:

- Fast Transactions: Sub-second transaction finality with fees as low as 0.00001 XLM.
- Native Assets: Support for XLM and custom tokens issued on Stellar.
- Decentralized Exchange (SDEX): Trade assets directly on Stellar’s built-in DEX.
- Horizon API: Interact with the Stellar network via the Horizon API for account management and transaction submission.


## Potential Use Cases 💡
- AstroFi can be applied in various scenarios, including:

- Financial Inclusion: Provide banking services to unbanked populations using Stellar’s low-cost infrastructure.
- Remittances: Enable cheap, instant cross-border payments for migrant workers.
- Tokenized Assets: Issue and trade real-world assets (e.g., real estate, commodities) on Stellar.
- Decentralized Crowdfunding: Raise funds securely with smart contract-based escrow.
- Microfinance: Offer small loans to entrepreneurs in developing regions.


## Contributing 🤝
- Contributions are welcomed wholeheartedly. To get started:

- Fork the repository.
- Create a new branch (git checkout -b feature/your-feature).
- start the server `npm install` then `npm run dev` 
- Make the desired changes
- Commit your changes (git commit -m "Add your feature").
- Push to the branch (git push origin feature/your-feature).
- Open a Pull Request.


## Community 🌐
 Join our community to stay updated:
 
- Twitter: https://x.com/astro_Fi_

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, String, Address, Map, BytesN, Val, IntoVal};
use soroban_sdk::symbol_short;

#[contracttype]
#[derive(Clone)]
pub struct Mission {
    title: String,
    desc: String,
    image_url: String,
    target_amount: i128,
    funded_amount: i128,
    owner: Address,
}

#[contract]
pub struct MissionFundContract;

#[contractimpl]
impl MissionFundContract {
    pub fn register_mission(
        env: Env,
        mission_id: BytesN<32>,
        title: String,
        desc: String,
        image_url: String,
        target_amount: i128,
        owner: Address,
    ) {
        let mission = Mission {
            title,
            desc,
            image_url,
            target_amount,
            funded_amount: 0,
            owner,
        };
        env.storage().persistent().set(&mission_id, &mission);
    }

    pub fn fund_mission(
        env: Env,
        mission_id: BytesN<32>,
        donor: Address,
        amount: i128,
    ) {
        let mut mission: Mission = env
            .storage()
            .persistent()
            .get(&mission_id)
            .expect("Mission not found");

        mission.funded_amount += amount;
        env.storage().persistent().set(&mission_id, &mission);

        Self::mint_nft(env, donor, mission_id.clone(), amount);
    }

    fn mint_nft(env: Env, donor: Address, mission_id: BytesN<32>, amount: i128) {
        let token_id = env.crypto().sha256(&mission_id.clone().into());
        let mission: Mission = env
            .storage()
            .persistent()
            .get(&mission_id)
            .expect("Mission not found");

        // Construct metadata URI: ipfs://astrofi-nft/mission/<mission_id_hex>/metadata.json
        // Convert mission_id to hex string (simplified as string representation)
        // let mission_id_str = u64(mission_id); // Placeholder for hex encoding
        // let metadata_uri = String::from_str(
        //     &env,
        //     &["ipfs://astrofi-nft/mission/", &mission_id_str, "/metadata.json"].concat(),
        // );

        let mut nft_info: Map<Symbol, Val> = Map::new(&env);
        nft_info.set(symbol_short!("owner"), donor.into_val(&env));
        nft_info.set(symbol_short!("title"), mission.title.into_val(&env));
        nft_info.set(symbol_short!("desc"), mission.desc.into_val(&env));
        nft_info.set(symbol_short!("image"), mission.image_url.into_val(&env));
        nft_info.set(symbol_short!("contrib"),  amount.into_val(&env));
        nft_info.set(symbol_short!("missionID"), mission_id.into_val(&env));
        // nft_info.set(symbol_short!("metadata"), metadata_uri.into_val(&env));

        env.storage().persistent().set(&token_id, &nft_info);
    }

    pub fn get_nft_metadata(env: Env, mission_id: BytesN<32>) -> Map<Symbol, Val> {
        let token_id = env.crypto().sha256(&mission_id.into());
        env.storage()
            .persistent()
            .get(&token_id)
            .expect("NFT not found")
    }

    pub fn get_remaining_funds(env: Env, mission_id: BytesN<32>) -> i128 {
        let mission: Mission = env
            .storage()
            .persistent()
            .get(&mission_id)
            .expect("Mission not found");
        mission.target_amount - mission.funded_amount
    }

    pub fn get_mission(env: Env, mission_id: BytesN<32>) -> Mission {
        env.storage()
            .persistent()
            .get(&mission_id)
            .expect("Mission not found")
    }
}






// #![no_std]
// use soroban_sdk::{contract, contractimpl, Address, vec, Symbol, Contracttype, Env, String, Vec};

// pub struct MintNFT;

// #[contract]
// pub struct SpaceMission {
//     pub title: String,
//     pub desc: String,
//     pub image_url: String,
//     pub project_id: u32,
//     pub amount: u64,
// };


// #[contractimpl]
// impl MintNFT {
//     pub fn initialize(env: Env, admin: Address) {
//         admin.require_auth();
//         env.storage().set(Symbol::new(&env, "admin"), &admin);
//     }


//     pub fn fund_mission(env: Env, title: String, description: String, amount: u64, project_id: u32) {
//         let admin: Address = env.storage().get(Symbol::new(&env, "admin")).unwrap();
//         admin.require_auth();
//         let mut count_pass: u64 = env.storage().instance().get(&COUNT_PASS).unwrap_or(0);
//         count_pass += 1;

//         let mission = SpaceMission {
//             title: title,
//             description: description,
//             image_url: String::from_str(&env, "https://example.com/image.png"),
//             project_id: ,
//             amount: amount,
//         };

//         env.storage().set(Symbol::new(&env, "Funding Successfully"), &mission);
//     }

    
//     pub fn mint_nft(env: Env, project_id: u32) {
//         let admin: Address = env.storage().get(Symbol::new(&env, "admin")).unwrap();
//         admin.require_auth();
//         let mut count_pass: u64 = env.storage().instance().get(&COUNT_PASS).unwrap_or(0);
//         count_pass += 1;

//         let mission: SpaceMission = env.storage().get(Symbol::new(&env, "mission")).unwrap();
//         if mission.project_id == project_id {
//             let reward_nft= {
//                 project_id: project_id,
//                 title: mission.title.clone(),
//                 description: mission.description.clone(),
//                 image_url: mission.image_url.clone(),
//                 attributes: vec![
//                     owner's wallet address,
//                     amount
//                 ],
               
//             }
//             env.storage().set(Symbol::new(&env, "nft_minted"), &true);
//         } else {
//             panic!("Project ID does not match the mission.");
//         }
//     }

//     pub fn mint_nft(env: Env, project_id: u32) {
//         let admin: Address = env.storage().get(Symbol::new(&env, "admin")).unwrap();
//         admin.require_auth();
//         let mut count_pass: u64 = env.storage().instance().get(&COUNT_PASS).unwrap_or(0);
//         count_pass += 1;

//         let mission: SpaceMission = env.storage().get(Symbol::new(&env, "mission")).unwrap();
//         if mission.project_id == project_id {
//             let reward_nft= {
//                 project_id: project_id,
//                 title: mission.title.clone(),
//                 description: mission.description.clone(),
//                 image_url: mission.image_url.clone(),
//                 attributes: vec![
//                     owner's wallet address,
//                     project_id
//                 ],
               
//             }
//             env.storage().set(Symbol::new(&env, "nft_minted"), &true);
//         } else {
//             panic!("Token ID does not match the mission.");
//         }
//     }

//     //track remaining fund required after contributions
//     pub fn track_remaining_fund(env: Env, project_id: u32) {
//         let admin: Address = env.storage().get(Symbol::new(&env, "admin")).unwrap();
//         admin.require_auth();

//         let mission: SpaceMission = env.storage().get(Symbol::new(&env, "mission")).unwrap();
//         if mission.project_id == project_id {
//             let remaining_fund = mission.amount - funding_amount;
//             env.storage().set(Symbol::new(&env, "Required "), &remaining_fund);
//         } else {
//             panic!("Project ID does not match the mission.");
//         }
//     }

//     pub fn mint_nft(env: Env, donor: Address, mission_id: Bytes) {
//         let token_id = env.crypto().sha256(&mission_id);
//         let metadata_uri = format!("ipfs://{}/metadata.json", mission_id.to_string()).into_val(&env);

//         let nft_info = Map::new(&env)
//             .set(Symbol::short("owner"), donor)
//             .set(Symbol::short("metadata"), metadata_uri);

//         env.storage().set(&token_id, &nft_info);
//     }

//     pub fn get_nft_metadata(env: Env, token_id: Bytes) -> Map<Symbol, Address> {
//         env.storage().get_unchecked(&token_id).unwrap()
//     }
    
// }


// #![no_std]

// use soroban_sdk::{contractimpl, Address, Env, Symbol, Bytes, Map, BytesN, IntoVal};

// pub struct FundLockerContract;

// #[derive(Clone)]
// pub struct Mission {
//     owner: Address,
//     target_amount: i128,
//     funded_amount: i128,
//     milestones: Vec<Symbol>,
//     completed_milestones: Vec<bool>,
// }

// #[contractimpl]
// impl FundLockerContract {
//     pub fn init_mission(env: Env, mission_id: BytesN<32>, owner: Address, target_amount: i128) {
//         let mission = Mission {
//             owner,
//             target_amount,
//             funded_amount: 0,
//         };
//         env.storage().set(&mission_id, &mission);
//     }

//     pub fn fund_mission(env: Env, mission_id: BytesN<32>, funder: Address, amount: i128) {
//         let mut mission: Mission = env.storage().get_unchecked(&mission_id).unwrap();
//         mission.funded_amount += amount;
//         env.storage().set(&mission_id, &mission);

//         // Actual payment flow handled outside (e.g., in backend) to Stellar account
//     }

//     pub fn complete_milestone(env: Env, mission_id: BytesN<32>, milestone_index: u32) {
//         let mut mission: Mission = env.storage().get_unchecked(&mission_id).unwrap();
//         mission.completed_milestones[milestone_index as usize] = true;
//         env.storage().set(&mission_id, &mission);
//     }

//     pub fn release_funds(env: Env, mission_id: BytesN<32>) -> i128 {
//         let mission: Mission = env.storage().get_unchecked(&mission_id).unwrap();
//         let completed = mission.completed_milestones.iter().filter(|&&m| m).count();
//         let milestone_count = mission.milestones.len();

//         let percentage_complete = (completed as i128 * 100) / (milestone_count as i128);

//         // Only partial funds can be released based on completed milestones
//         let release_amount = (mission.funded_amount * percentage_complete) / 100;
//         release_amount
//     }
// }



// mod test;

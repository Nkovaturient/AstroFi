const mongoose = require('mongoose');
const {Mission} = require('../db/schema.js');
const { config } = require('@/config/config');

const uri= config.DB_URI;

export async function GET() {
    try{
        const response = await seedMissions();
        console.log(`uploaded missions`)
        return new Response(JSON.stringify({ message: 'Missions seeded successfully' }), { status: 200 });

    }catch(err){
        console.error("Error fetching articles: ", err.message); 
        return new Response(JSON.stringify({ error: 'Failed to upload' }), { status: 500 });
    }
}


const seedMissions = async () => {
  await mongoose.connect(uri);

  const missions = [
    {
      title: 'Lunar Soil Analysis',
      caption: 'Studying lunar regolith for future habitats',
      amountRequired: 5000,
      longDescription: 'This mission aims to analyze lunar soil samples to identify resources for sustainable habitats. Funds will support spectrometry equipment and data processing.',
      walletAddress: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2Z',
      imgUrl: 'https://ipfs.io/ipfs/QmLunarSoil123',
      fundingProgress: 1250,
      files: ['https://ipfs.io/ipfs/QmLunarDoc1', 'https://ipfs.io/ipfs/QmLunarDoc2'],
      milestones: [
        { title: 'Sample Collection', description: 'Acquire lunar regolith samples', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof1', verified: true, completionPercentage: 50 },
        { title: 'Spectrometry Analysis', description: 'Conduct chemical analysis', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Exoplanet Spectroscopy',
      caption: 'Discovering habitable exoplanets',
      amountRequired: 10000,
      longDescription: 'This project uses ground-based telescopes to perform spectroscopy on exoplanet atmospheres, searching for biosignatures.',
      walletAddress: 'GCXKG6RN4ONIEPCMNFB732A436Z5PNDSRLGWK7GBLCMQLIFO4S7EYWVU',
      imgUrl: 'https://ipfs.io/ipfs/QmExoplanet456',
      fundingProgress: 3000,
      files: ['https://ipfs.io/ipfs/QmExoDoc1'],
      milestones: [
        { title: 'Telescope Calibration', description: 'Calibrate telescope for spectroscopy', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof2', verified: true, completionPercentage: 50 },
        { title: 'Data Collection', description: 'Gather spectral data', proofUploaded: false, completionPercentage: 0 },
        { title: 'Analysis', description: 'Analyze for biosignatures', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Asteroid Deflection Simulation',
      caption: 'Preparing for 2031 asteroid threat',
      amountRequired: 7500,
      longDescription: 'This mission simulates asteroid deflection techniques using computational models to prepare for potential impacts.',
      walletAddress: 'GD4N4L3R7X2B3K4M5N6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H',
      imgUrl: 'https://ipfs.io/ipfs/QmAsteroid789',
      fundingProgress: 1500,
      files: ['https://ipfs.io/ipfs/QmAsteroidDoc1'],
      milestones: [
        { title: 'Model Development', description: 'Build simulation model', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof3', verified: true, completionPercentage: 50 },
        { title: 'Simulation Run', description: 'Run deflection scenarios', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Microgravity Plant Growth',
      caption: 'Testing crops for space colonies',
      amountRequired: 6000,
      longDescription: 'This experiment tests plant growth in microgravity to support future space colonies.',
      walletAddress: 'GAXY2Z3W4U5V6T7R8S9P0Q1N2M3L4K5J6I7H8G9F0E1D2C3B4A5Z6Y7X',
      imgUrl: 'https://ipfs.io/ipfs/QmPlantGrowth012',
      fundingProgress: 2000,
      files: ['https://ipfs.io/ipfs/QmPlantDoc1', 'https://ipfs.io/ipfs/QmPlantDoc2'],
      milestones: [
        { title: 'Setup Experiment', description: 'Prepare microgravity chamber', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof4', verified: true, completionPercentage: 50 },
        { title: 'Plant Growth Test', description: 'Monitor plant growth', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Solar Flare Prediction',
      caption: 'Enhancing space weather forecasts',
      amountRequired: 8000,
      longDescription: 'This project develops machine learning models to predict solar flares, protecting satellites and astronauts.',
      walletAddress: 'GB1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C',
      imgUrl: 'https://ipfs.io/ipfs/QmSolarFlare345',
      fundingProgress: 2400,
      files: ['https://ipfs.io/ipfs/QmSolarDoc1'],
      milestones: [
        { title: 'Data Collection', description: 'Gather solar data', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof5', verified: true, completionPercentage: 50 },
        { title: 'Model Training', description: 'Train ML model', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Martian Rover Prototype',
      caption: 'Building a low-cost rover',
      amountRequired: 12000,
      longDescription: 'This mission designs a low-cost rover prototype for Martian terrain exploration.',
      walletAddress: 'GC8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D',
      imgUrl: 'https://ipfs.io/ipfs/QmRover678',
      fundingProgress: 3600,
      files: ['https://ipfs.io/ipfs/QmRoverDoc1'],
      milestones: [
        { title: 'Chassis Design', description: 'Design rover chassis', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof6', verified: true, completionPercentage: 50 },
        { title: 'Mobility Testing', description: 'Test rover mobility', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Dark Matter Detection',
      caption: 'Probing the universe’s mysteries',
      amountRequired: 15000,
      longDescription: 'This project uses particle detectors to search for dark matter signatures.',
      walletAddress: 'GD5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E',
      imgUrl: 'https://ipfs.io/ipfs/QmDarkMatter901',
      fundingProgress: 4500,
      files: ['https://ipfs.io/ipfs/QmDarkDoc1'],
      milestones: [
        { title: 'Detector Setup', description: 'Install particle detectors', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof7', verified: true, completionPercentage: 50 },
        { title: 'Data Analysis', description: 'Analyze detector data', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'CubeSat Development',
      caption: 'Low-cost satellite for education',
      amountRequired: 9000,
      longDescription: 'This mission develops a CubeSat for educational institutions to conduct space experiments.',
      walletAddress: 'GA2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B',
      imgUrl: 'https://ipfs.io/ipfs/QmCubeSat234',
      fundingProgress: 2700,
      files: ['https://ipfs.io/ipfs/QmCubeDoc1'],
      milestones: [
        { title: 'Payload Design', description: 'Design CubeSat payload', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof8', verified: true, completionPercentage: 50 },
        { title: 'Assembly', description: 'Assemble CubeSat', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Space Debris Tracking',
      caption: 'Monitoring orbital debris',
      amountRequired: 7000,
      longDescription: 'This project tracks space debris to enhance satellite safety.',
      walletAddress: 'GB9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C',
      imgUrl: 'https://ipfs.io/ipfs/QmDebris567',
      fundingProgress: 2100,
      files: ['https://ipfs.io/ipfs/QmDebrisDoc1'],
      milestones: [
        { title: 'Sensor Deployment', description: 'Deploy tracking sensors', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof9', verified: true, completionPercentage: 50 },
        { title: 'Data Processing', description: 'Process debris data', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Gravitational Wave Study',
      caption: 'Detecting cosmic ripples',
      amountRequired: 11000,
      longDescription: 'This mission analyzes gravitational wave data to study black hole mergers.',
      walletAddress: 'GC6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D',
      imgUrl: 'https://ipfs.io/ipfs/QmGravWave890',
      fundingProgress: 3300,
      files: ['https://ipfs.io/ipfs/QmGravDoc1'],
      milestones: [
        { title: 'Data Acquisition', description: 'Collect gravitational wave data', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof10', verified: true, completionPercentage: 50 },
        { title: 'Analysis', description: 'Analyze wave patterns', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Lunar Rover Sensors',
      caption: 'Developing lunar navigation tech',
      amountRequired: 8500,
      longDescription: 'This project develops sensors for lunar rovers to navigate harsh terrain.',
      walletAddress: 'GD3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E',
      imgUrl: 'https://ipfs.io/ipfs/QmLunarRover123',
      fundingProgress: 2550,
      files: ['https://ipfs.io/ipfs/QmRoverDoc2'],
      milestones: [
        { title: 'Sensor Design', description: 'Design navigation sensors', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof11', verified: true, completionPercentage: 50 },
        { title: 'Testing', description: 'Test sensors in simulated environment', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Star Formation Study',
      caption: 'Exploring stellar nurseries',
      amountRequired: 9500,
      longDescription: 'This mission studies star formation in nebulae using radio telescopes.',
      walletAddress: 'GA0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B',
      imgUrl: 'https://ipfs.io/ipfs/QmStarFormation456',
      fundingProgress: 2850,
      files: ['https://ipfs.io/ipfs/QmStarDoc1'],
      milestones: [
        { title: 'Telescope Setup', description: 'Configure radio telescopes', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof12', verified: true, completionPercentage: 50 },
        { title: 'Data Collection', description: 'Collect nebulae data', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Space Weather Station',
      caption: 'Monitoring solar activity',
      amountRequired: 6500,
      longDescription: 'This project builds a space weather station to monitor solar activity.',
      walletAddress: 'GB7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C',
      imgUrl: 'https://ipfs.io/ipfs/QmWeather789',
      fundingProgress: 1950,
      files: ['https://ipfs.io/ipfs/QmWeatherDoc1'],
      milestones: [
        { title: 'Station Design', description: 'Design weather station', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof13', verified: true, completionPercentage: 50 },
        { title: 'Deployment', description: 'Deploy station prototype', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Cosmic Ray Detection',
      caption: 'Studying high-energy particles',
      amountRequired: 10000,
      longDescription: 'This mission detects cosmic rays to understand their origins.',
      walletAddress: 'GC4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D',
      imgUrl: 'https://ipfs.io/ipfs/QmCosmicRay012',
      fundingProgress: 3000,
      files: ['https://ipfs.io/ipfs/QmCosmicDoc1'],
      milestones: [
        { title: 'Detector Installation', description: 'Install cosmic ray detectors', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof14', verified: true, completionPercentage: 50 },
        { title: 'Data Analysis', description: 'Analyze cosmic ray data', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
    {
      title: 'Interstellar Dust Analysis',
      caption: 'Studying cosmic dust clouds',
      amountRequired: 8000,
      longDescription: 'This project analyzes interstellar dust to understand galactic evolution.',
      walletAddress: 'GD1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E',
      imgUrl: 'https://ipfs.io/ipfs/QmDust345',
      fundingProgress: 2400,
      files: ['https://ipfs.io/ipfs/QmDustDoc1'],
      milestones: [
        { title: 'Sample Collection', description: 'Collect dust samples', proofUploaded: true, proofFileUrl: 'https://ipfs.io/ipfs/QmProof15', verified: true, completionPercentage: 50 },
        { title: 'Analysis', description: 'Analyze dust composition', proofUploaded: false, completionPercentage: 0 },
      ],
      creator: new mongoose.Types.ObjectId(),
    },
  ];

  await Mission.deleteMany({});
  await Mission.insertMany(missions)
  .then((res) => {
    console.log('Missions seeded:', res.length);
    console.log('Missions seeded successfully');
  })
  .catch((err) => {
    console.error('Error seeding missions:', err.message);
  });
  
  mongoose.connection.close();
};

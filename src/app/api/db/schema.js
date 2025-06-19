const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  proofUploaded: { type: Boolean, default: false },
  proofFileUrl: { type: String }, // URL to proof document (e.g., stored on IPFS)
  verified: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
});


const missionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  caption: { type: String, required: true, trim: true },
  amountRequired: { type: Number, required: true, min: 0 }, // In XLM
  longDescription: { type: String, required: true },
  walletAddress: { type: String, required: true, match: /^G[A-Z0-9]{55}$/ }, // Stellar wallet address
  imgUrl: { type: String, required: true }, // Mission image URL (e.g., IPFS or CDN)
  fundingProgress: { type: Number, default: 0, min: 0 }, // Amount raised in XLM
//   fundingPercentage: { type: Number, default: 0, min: 0, max: 100 }, // % of target reached
  files: [{ type: String }], // Array of file URLs (e.g., PDFs, docs on IPFS)
  milestones: [milestoneSchema],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

missionSchema.pre('save', function (next) {
  if (this.fundingProgress && this.amountRequired) {
    this.fundingPercentage = (this.fundingProgress / this.amountRequired) * 100;
  }
  this.updatedAt = Date.now();
  next();
});

const Mission = mongoose.models.Mission || mongoose.model('Mission', missionSchema);
const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);
module.exports = {Mission, Milestone}
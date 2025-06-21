import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { 
  Upload, 
  Plus, 
  X, 
  Calendar, 
  DollarSign, 
  Target,
  FileText,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';

const CreateMissionForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    fundingGoal: '',
    deadline: '',
    milestones: [{ title: '', description: '', percentage: '' }],
    images: [],
    documents: [],
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Funding', icon: DollarSign },
    { id: 3, title: 'Milestones', icon: Target },
    { id: 4, title: 'Media', icon: ImageIcon },
    { id: 5, title: 'Review', icon: CheckCircle },
  ];

  const categories = [
    'Space Exploration',
    'Astronomical Research',
    'Satellite Technology',
    'Mars Missions',
    'Deep Space',
    'Educational',
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', percentage: '' }]
    }));
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const updateMilestone = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const handleFileUpload = (type, files) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...fileArray]
    }));
  };

  const removeFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit form data
      toast({
        type: 'success',
        title: 'Mission Created!',
        description: 'Your mission has been successfully submitted for review.',
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create mission. Please try again.',
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Mission Title *
              </label>
              <Input
                placeholder="Enter your mission title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                placeholder="Describe your mission, its goals, and expected outcomes..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category *
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Funding Goal (USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="100000"
                  className="pl-10"
                  value={formData.fundingGoal}
                  onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Campaign Deadline *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="date"
                  className="pl-10"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Funding Breakdown</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Your funding goal:</span>
                  <span>${formData.fundingGoal || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee (2.5%):</span>
                  <span>${((formData.fundingGoal || 0) * 0.025).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-white border-t border-slate-600 pt-2">
                  <span>You'll receive:</span>
                  <span>${((formData.fundingGoal || 0) * 0.975).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Project Milestones</h4>
              <Button onClick={addMilestone} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-4">
              {formData.milestones.map((milestone, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h5 className="font-medium text-white">Milestone {index + 1}</h5>
                    {formData.milestones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    />
                    <textarea
                      className="w-full h-20 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                      placeholder="Milestone description"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Funding %"
                        className="w-24"
                        value={milestone.percentage}
                        onChange={(e) => updateMilestone(index, 'percentage', e.target.value)}
                      />
                      <span className="text-sm text-slate-400">% of total funding</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Mission Images
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 mb-2">Drop images here or click to upload</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => handleFileUpload('images', e.target.files)}
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile('images', index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Supporting Documents
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 mb-2">Upload research papers, proposals, etc.</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="document-upload"
                  onChange={(e) => handleFileUpload('documents', e.target.files)}
                />
                <label htmlFor="document-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-2 mt-4">
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-white">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('documents', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h4 className="font-medium text-white text-lg">Review Your Mission</h4>
            
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-cyan-400 mb-1">Title</h5>
                  <p className="text-white">{formData.title || 'Not specified'}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-cyan-400 mb-1">Category</h5>
                  <Badge>{formData.category || 'Not specified'}</Badge>
                </div>
                
                <div>
                  <h5 className="font-medium text-cyan-400 mb-1">Funding Goal</h5>
                  <p className="text-white">${formData.fundingGoal || '0'}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-cyan-400 mb-1">Deadline</h5>
                  <p className="text-white">{formData.deadline || 'Not specified'}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-cyan-400 mb-1">Milestones</h5>
                  <p className="text-white">{formData.milestones.length} milestones defined</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-cyan-400 mb-1">Media</h5>
                  <p className="text-white">
                    {formData.images.length} images, {formData.documents.length} documents
                  </p>
                </div>
              </div>
            </Card>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> Your mission will be reviewed by our team before going live. 
                This process typically takes 24-48 hours.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-cyan-500 border-cyan-500 text-white' 
                    : isActive 
                      ? 'border-cyan-500 text-cyan-500' 
                      : 'border-slate-600 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-cyan-400' : isCompleted ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    isCompleted ? 'bg-cyan-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-6 mb-6">
        {renderStepContent()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        {currentStep === steps.length ? (
          <Button onClick={handleSubmit} className="px-8">
            Submit Mission
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateMissionForm;
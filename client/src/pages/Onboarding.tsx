import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    numberOfEmployees: '',
    industry: '',
    address: '',
    country: '',
    phone: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.companyName || !formData.numberOfEmployees || !formData.industry) {
        return;
      }
      setStep(2);
    } else {
      setLoading(true);
      try {
        await api.put('/users/profile', {
          companyName: formData.companyName,
          numberOfEmployees: formData.numberOfEmployees,
          industry: formData.industry,
          address: formData.address,
          country: formData.country,
          phone: formData.phone,
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Onboarding error:', error);
        alert('Failed to complete onboarding. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">JOBPLATFORM</span>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Tell us about your company to get started
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>

          <div className="card">
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    name="companyName"
                    className="input-field"
                    placeholder="Your Company Inc."
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Employees
                  </label>
                  <select
                    id="numberOfEmployees"
                    name="numberOfEmployees"
                    className="input-field"
                    value={formData.numberOfEmployees}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    id="industry"
                    type="text"
                    name="industry"
                    className="input-field"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    className="input-field"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country/Region
                  </label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    className="input-field"
                    placeholder="United States"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="btn-secondary"
                disabled={loading}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : step === 1 ? (
                  <>
                    Next
                    <span>→</span>
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

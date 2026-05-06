import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { User, Mail, Calendar, Droplet, Phone, Shield, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettingsView() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    fullName: user?.fullName || 'John Doe',
    email: user?.username || 'john.doe@example.com',
    age: '45',
    gender: 'Male',
    bloodGroup: 'O+',
    emergencyContactName: 'Jane Doe',
    emergencyContactNumber: '+1 555-0198'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = () => {
    console.log('Updated Profile Data:', userProfile);
    // TODO: PUT request to Spring Boot backend to update patient details.
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Ideally we would reset to fetched data here
    setIsEditing(false);
  };

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
            <p className="text-slate-500 mt-1 text-lg">Manage your personal and emergency contact information.</p>
          </div>
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-teal-600/20"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all shadow-sm"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-green-600/20"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          
          {/* Section: Personal Details */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-teal-600" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={userProfile.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
                  />
                ) : (
                  <p className="text-slate-900 text-lg font-medium px-4 py-3 bg-slate-50 rounded-xl border border-transparent">{userProfile.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Email Address</label>
                {isEditing ? (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={userProfile.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>
                ) : (
                  <p className="text-slate-900 text-lg font-medium px-4 py-3 bg-slate-50 rounded-xl border border-transparent flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" /> {userProfile.email}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={userProfile.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
                  />
                ) : (
                  <p className="text-slate-900 text-lg font-medium px-4 py-3 bg-slate-50 rounded-xl border border-transparent">{userProfile.age} years</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={userProfile.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-slate-900 text-lg font-medium px-4 py-3 bg-slate-50 rounded-xl border border-transparent">{userProfile.gender}</p>
                )}
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Blood Group</label>
                {isEditing ? (
                  <div className="relative">
                     <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                    <select
                      name="bloodGroup"
                      value={userProfile.bloodGroup}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white appearance-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-slate-900 text-lg font-medium px-4 py-3 bg-slate-50 rounded-xl border border-transparent flex items-center gap-3">
                    <Droplet className="w-5 h-5 text-red-400" /> {userProfile.bloodGroup}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Shield className="w-5 h-5 text-red-500" /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Contact Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={userProfile.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
                  />
                ) : (
                  <p className="text-slate-900 text-lg font-medium px-4 py-3 bg-slate-50 rounded-xl border border-transparent">{userProfile.emergencyContactName}</p>
                )}
              </div>

              {/* Emergency Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Phone Number</label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="emergencyContactNumber"
                      value={userProfile.emergencyContactNumber}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>
                ) : (
                  <p className="text-slate-900 text-lg font-medium px-4 py-3 bg-slate-50 rounded-xl border border-transparent flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" /> {userProfile.emergencyContactNumber}
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

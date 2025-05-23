import React, { useState } from 'react';
import { FaUser, FaLock, FaBell, FaPalette, FaCheck, FaCamera, FaTrash } from 'react-icons/fa';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState('/default-avatar.png');
  const [formData, setFormData] = useState({
    // Profile Settings
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 234 567 890',
    jobTitle: 'Administrator',
    department: 'IT',
    
    // Account Settings
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    monthlyNewsletter: false,
    systemUpdates: true,
    
    // Appearance Settings
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    highContrast: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfileImage = () => {
    setProfileImage('/default-avatar.png');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: FaUser },
    { id: 'account', label: 'Account Security', icon: FaLock },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'appearance', label: 'Appearance', icon: FaPalette }
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
        <p className="text-black">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <nav className="space-y-1 p-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-black hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit}>
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-black mb-6">Profile Settings</h2>
                  
                  {/* Profile Image */}
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 flex space-x-2">
                        <label className="bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                          <FaCamera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {profileImage !== '/default-avatar.png' && (
                          <button
                            type="button"
                            onClick={handleDeleteProfileImage}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-black">Profile Photo</h3>
                      <p className="text-sm text-black">
                        Upload a new profile photo or remove the current one
                      </p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Security */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-black mb-6">Account Security</h2>
                  
                  {/* Password Change */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-black">Two-Factor Authentication</h3>
                        <p className="text-sm text-black">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="twoFactorEnabled"
                            checked={formData.twoFactorEnabled}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-black mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="text-lg font-medium text-black">Email Notifications</h3>
                        <p className="text-sm text-black">
                          Receive notifications via email
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={formData.emailNotifications}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="text-lg font-medium text-black">Push Notifications</h3>
                        <p className="text-sm text-black">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="pushNotifications"
                            checked={formData.pushNotifications}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="text-lg font-medium text-black">Monthly Newsletter</h3>
                        <p className="text-sm text-black">
                          Receive our monthly newsletter with updates
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="monthlyNewsletter"
                            checked={formData.monthlyNewsletter}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="text-lg font-medium text-black">System Updates</h3>
                        <p className="text-sm text-black">
                          Get notified about system updates and maintenance
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="systemUpdates"
                            checked={formData.systemUpdates}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-black mb-6">Appearance Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Theme
                        </label>
                        <select
                          name="theme"
                          value={formData.theme}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Font Size
                        </label>
                        <select
                          name="fontSize"
                          value={formData.fontSize}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="text-lg font-medium text-black">Compact Mode</h3>
                        <p className="text-sm text-black">
                          Reduce spacing between elements
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="compactMode"
                            checked={formData.compactMode}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="text-lg font-medium text-black">High Contrast</h3>
                        <p className="text-sm text-black">
                          Increase contrast for better visibility
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="highContrast"
                            checked={formData.highContrast}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
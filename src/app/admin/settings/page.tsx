"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Building, Clock, Save, Shield, User } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [profile, setProfile] = useState<any>(null);
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [settingsData, setSettingsData] = useState({
    name: "",
    timezone: "Asia/Kolkata",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [settingsRes, profileRes] = await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/admin/profile")
        ]);
        
        const settingsJson = await settingsRes.json();
        const profileJson = await profileRes.json();
        
        if (settingsJson.success) {
          setSettingsData({
            name: settingsJson.data.name,
            timezone: settingsJson.data.timezone || "Asia/Kolkata",
          });
        }
        
        if (profileJson.success) {
          setProfile(profileJson.data);
          setProfileData({
            name: profileJson.data.name || "",
            email: profileJson.data.email || "",
            password: "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettingsData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Admin profile updated successfully!");
        setProfileData(prev => ({ ...prev, password: "" }));
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(data.error || "Failed to update profile");
      }
    } catch (err) {
      setErrorMsg("Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("System settings saved successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    
    try {
      const res = await fetch("/api/admin/profile/image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setProfile((prev: any) => ({ ...prev, image: data.imageUrl }));
        setSuccessMsg("Profile photo updated!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      setErrorMsg("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon size={24} className="text-primary" /> Settings & Profile
        </h1>
        <p className="text-gray-500 mt-1">Manage your admin account and global system preferences</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Admin Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleProfileSubmit}>
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                <User size={18} className="text-gray-400" /> My Admin Profile
              </h3>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Photo */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer">
                    {profile?.image ? (
                      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/20">
                        <img src={profile.image} alt="Admin Profile" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl font-bold">
                        {profile?.name?.charAt(0) || "A"}
                      </div>
                    )}
                    
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-sm font-medium">Change</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  <span className="text-xs text-gray-400">{uploadingImage ? "Uploading..." : "Click to upload"}</span>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                      <input 
                        type="text" name="name" value={profileData.name} onChange={handleProfileChange} required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" name="email" value={profileData.email} onChange={handleProfileChange} required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Change Password (optional)</label>
                    <input 
                      type="password" name="password" value={profileData.password} onChange={handleProfileChange} autoComplete="new-password"
                      placeholder="Enter new password to change..."
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" 
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={savingProfile || uploadingImage}
              className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Save size={16} /> {savingProfile ? "Saving Profile..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* System Settings Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSettingsSubmit}>
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Building size={18} className="text-gray-400" /> Organization Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={settingsData.name} 
                    onChange={handleSettingsChange} 
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Timezone</label>
                  <select 
                    name="timezone" 
                    value={settingsData.timezone} 
                    onChange={handleSettingsChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 bg-white"
                  >
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={savingSettings}
              className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Save size={16} /> {savingSettings ? "Saving Settings..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

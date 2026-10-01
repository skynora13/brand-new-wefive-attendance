"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { User, Mail, Phone, Hash, Calendar, Briefcase, Shield, CheckCircle } from "lucide-react";

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/member/profile/me");
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setFormData({
            name: data.data.name || "",
            phone: data.data.phone || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Profile updated successfully!");
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse p-8">Loading profile information...</div>;
  }

  if (!profile) {
    return <div className="text-red-500">Failed to load profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Read-Only Info Card */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-max">
          <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
            <div className="relative group cursor-pointer">
              {profile.image ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary/20">
                  <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-4">
                  {profile.name.charAt(0)}
                </div>
              )}
              
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity mb-4 cursor-pointer">
                <span className="text-xs font-medium">Change</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setUpdating(true);
                    const formData = new FormData();
                    formData.append("image", e.target.files[0]);
                    try {
                      const res = await fetch("/api/member/profile/image", { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.success) {
                        setProfile((prev: any) => ({ ...prev, image: data.imageUrl }));
                        setSuccess("Profile photo updated!");
                      } else {
                        setError(data.error || "Failed to upload");
                      }
                    } catch {
                      setError("Failed to upload image");
                    } finally {
                      setUpdating(false);
                    }
                  }}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.role}</p>
            
            <div className="mt-4 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
              <CheckCircle size={14} />
              {profile.status}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Email Address</p>
                <p className="text-sm text-gray-900">{profile.email}</p>
              </div>
            </div>
            {profile.employeeId && (
              <div className="flex items-start gap-3">
                <Hash className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Employee ID</p>
                  <p className="text-sm text-gray-900">{profile.employeeId}</p>
                </div>
              </div>
            )}
            
            {profile.department && (
              <div className="flex items-start gap-3">
                <Briefcase className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Department</p>
                  <p className="text-sm text-gray-900">{profile.department}</p>
                </div>
              </div>
            )}
            
            {profile.joiningDate && (
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Joining Date</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(profile.joiningDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            )}
            
            {profile.shift?.name && (
              <div className="flex items-start gap-3">
                <Shield className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Shift</p>
                  <p className="text-sm text-gray-900">{profile.shift.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editable Form Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Update Information</h3>
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-100 rounded-md text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={updating}
                className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

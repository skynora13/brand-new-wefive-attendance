"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "MEMBER",
    status: "ACTIVE",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/members");
        router.refresh();
      } else {
        setError(data.error || "Failed to create member");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/members" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
          <p className="text-gray-500 mt-1">Create an account for a new employee</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="off"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email ID *</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2"
                placeholder="john@wefive.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2"
                placeholder="Initial password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 bg-white"
              >
                <option value="MEMBER">Member (Employee)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link
              href="/admin/members"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

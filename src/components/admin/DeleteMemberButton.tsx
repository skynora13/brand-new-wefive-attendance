"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteMemberButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete member.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 ml-4 disabled:opacity-50 font-medium"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}

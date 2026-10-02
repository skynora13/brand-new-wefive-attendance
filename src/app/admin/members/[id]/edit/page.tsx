import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMemberForm from "@/components/admin/EditMemberForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const member = await prisma.user.findUnique({
    where: { id }
  });

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/members" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>
          <p className="text-gray-500 mt-1">Update employee details for {member.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <EditMemberForm initialData={member} />
      </div>
    </div>
  );
}

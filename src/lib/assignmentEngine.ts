import { prisma } from './prisma';

export async function assignTopic(topicId: string, organizationId?: string | null) {
  // get topic
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error("Topic not found");
  if (topic.status !== "UNASSIGNED") return null;

  // get settings
  const setting = await prisma.systemSetting.findUnique({ where: { key: "assignment_strategy" } });
  let strategy = "ROUND_ROBIN";
  if (setting) {
    try {
      const val = JSON.parse(setting.value);
      strategy = val.strategy || "ROUND_ROBIN";
    } catch(e) {}
  }

  // get available members
  const members = await prisma.user.findMany({
    where: { 
      role: "MEMBER",
      status: "ACTIVE",
      ...(organizationId ? { organizationId } : {})
    },
    include: {
      assignedTopics: {
        where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } }
      }
    },
    orderBy: { id: 'asc' } // stable order for round robin
  });

  if (members.length === 0) return null;

  let selectedMemberId: string | null = null;

  if (strategy === "BALANCED_WORKLOAD") {
    // Member with least active topics
    members.sort((a, b) => a.assignedTopics.length - b.assignedTopics.length);
    selectedMemberId = members[0].id;
  } else {
    // ROUND_ROBIN
    // get last assigned
    const lastAssignment = await prisma.topicAssignmentHistory.findFirst({
      where: { 
        assignmentType: "AUTOMATIC",
        topic: { organizationId: organizationId || undefined }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!lastAssignment || !lastAssignment.newMemberId) {
      selectedMemberId = members[0].id;
    } else {
      const lastIndex = members.findIndex(m => m.id === lastAssignment.newMemberId);
      if (lastIndex === -1 || lastIndex === members.length - 1) {
        selectedMemberId = members[0].id;
      } else {
        selectedMemberId = members[lastIndex + 1].id;
      }
    }
  }

  if (selectedMemberId) {
    // Create assignment
    const assignment = await prisma.topicAssignment.create({
      data: {
        topicId: topic.id,
        memberId: selectedMemberId,
        assignmentType: "AUTOMATIC",
        status: "ASSIGNED",
      }
    });

    // Update topic status
    await prisma.topic.update({
      where: { id: topic.id },
      data: { status: "ASSIGNED" }
    });

    // Add history
    await prisma.topicAssignmentHistory.create({
      data: {
        topicId: topic.id,
        newMemberId: selectedMemberId,
        assignmentType: "AUTOMATIC",
        reason: `Assigned via ${strategy}`
      }
    });

    return assignment;
  }

  return null;
}

import prisma from "../../prisma";

export interface UserIdeaLimits {
  canClaim: boolean;
  canSave: boolean;
  canView: boolean;
  claimsRemaining: number;
  savesRemaining: number;
  viewsRemaining: number;
  message?: string;
}

/**
 * Checks if user can perform actions on ideas based on their limits
 */
export async function getUserIdeaLimits(userId: string): Promise<UserIdeaLimits> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        claimLimit: true,
        claimsUsed: true,
        saveLimit: true,
        savesUsed: true,
        viewLimit: true,
        viewsUsed: true,
        lastViewReset: true,
      },
    });

    if (!user) {
      return {
        canClaim: false,
        canSave: false,
        canView: false,
        claimsRemaining: 0,
        savesRemaining: 0,
        viewsRemaining: 0,
        message: "User not found",
      };
    }

    // Check if we need to reset daily view count
    const now = new Date();
    const lastReset = user.lastViewReset;
    const shouldResetViews = !lastReset || 
      (now.getTime() - lastReset.getTime()) > 24 * 60 * 60 * 1000;

    let viewsUsed = user.viewsUsed;
    if (shouldResetViews && user.viewLimit !== -1) {
      viewsUsed = 0;
      await prisma.user.update({
        where: { id: userId },
        data: {
          viewsUsed: 0,
          lastViewReset: now,
        },
      });
    }

    const claimsRemaining = user.claimLimit === -1 ? -1 : Math.max(0, user.claimLimit - user.claimsUsed);
    const savesRemaining = user.saveLimit === -1 ? -1 : Math.max(0, user.saveLimit - user.savesUsed);
    const viewsRemaining = user.viewLimit === -1 ? -1 : Math.max(0, user.viewLimit - viewsUsed);

    return {
      canClaim: user.claimLimit === -1 || user.claimsUsed < user.claimLimit,
      canSave: user.saveLimit === -1 || user.savesUsed < user.saveLimit,
      canView: user.viewLimit === -1 || viewsUsed < user.viewLimit,
      claimsRemaining,
      savesRemaining,
      viewsRemaining,
    };
  } catch (error) {
    console.error("Error getting user idea limits:", error);
    return {
      canClaim: false,
      canSave: false,
      canView: false,
      claimsRemaining: 0,
      savesRemaining: 0,
      viewsRemaining: 0,
      message: "Error checking limits",
    };
  }
}

/**
 * Saves an idea for a user
 */
export async function saveIdeaForUser(userId: string, ideaId: string): Promise<{ success: boolean; message: string }> {
  try {
    const limits = await getUserIdeaLimits(userId);
    
    if (!limits.canSave) {
      return {
        success: false,
        message: limits.savesRemaining === 0 
          ? "You have reached your save limit. Upgrade for more access." 
          : "Cannot save idea at this time.",
      };
    }

    // Check if already saved
    const existingSave = await prisma.savedIdeas.findFirst({
      where: { userId, ideaId },
    });

    if (existingSave) {
      return {
        success: false,
        message: "Idea already saved",
      };
    }

    // Save the idea and increment counter
    await prisma.$transaction([
      prisma.savedIdeas.create({
        data: { userId, ideaId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { savesUsed: { increment: 1 } },
      }),
    ]);

    return {
      success: true,
      message: "Idea saved successfully",
    };
  } catch (error) {
    console.error("Error saving idea:", error);
    return {
      success: false,
      message: "Failed to save idea",
    };
  }
}

/**
 * Unsaves an idea for a user
 */
export async function unsaveIdeaForUser(userId: string, ideaId: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingSave = await prisma.savedIdeas.findFirst({
      where: { userId, ideaId },
    });

    if (!existingSave) {
      return {
        success: false,
        message: "Idea not saved",
      };
    }

    // Remove the save and decrement counter
    await prisma.$transaction([
      prisma.savedIdeas.delete({
        where: { id: existingSave.id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { savesUsed: { decrement: 1 } },
      }),
    ]);

    return {
      success: true,
      message: "Idea unsaved successfully",
    };
  } catch (error) {
    console.error("Error unsaving idea:", error);
    return {
      success: false,
      message: "Failed to unsave idea",
    };
  }
}

/**
 * Claims an idea for a user
 */
export async function claimIdeaForUser(userId: string, ideaId: string): Promise<{ success: boolean; message: string }> {
  try {
    const limits = await getUserIdeaLimits(userId);
    
    if (!limits.canClaim) {
      return {
        success: false,
        message: limits.claimsRemaining === 0 
          ? "Upgrade for more access or unclaim idea." 
          : "Cannot claim idea at this time.",
      };
    }

    // Check if idea is already claimed
    const existingClaim = await prisma.claimedIdeas.findUnique({
      where: { ideaId },
    });

    if (existingClaim) {
      return {
        success: false,
        message: existingClaim.userId === userId 
          ? "You have already claimed this idea" 
          : "This idea has already been claimed",
      };
    }

    // Claim the idea and increment counter
    await prisma.$transaction([
      prisma.claimedIdeas.create({
        data: { userId, ideaId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { claimsUsed: { increment: 1 } },
      }),
    ]);

    return {
      success: true,
      message: "Idea claimed successfully",
    };
  } catch (error) {
    console.error("Error claiming idea:", error);
    return {
      success: false,
      message: "Failed to claim idea",
    };
  }
}

/**
 * Unclaims an idea for a user
 */
export async function unclaimIdeaForUser(userId: string, ideaId: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingClaim = await prisma.claimedIdeas.findFirst({
      where: { userId, ideaId },
    });

    if (!existingClaim) {
      return {
        success: false,
        message: "Idea not claimed by you",
      };
    }

    // Remove the claim and decrement counter
    await prisma.$transaction([
      prisma.claimedIdeas.delete({
        where: { id: existingClaim.id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { claimsUsed: { decrement: 1 } },
      }),
    ]);

    return {
      success: true,
      message: "Idea unclaimed successfully",
    };
  } catch (error) {
    console.error("Error unclaiming idea:", error);
    return {
      success: false,
      message: "Failed to unclaim idea",
    };
  }
}

/**
 * Gets user's saved ideas
 */
export async function getUserSavedIdeas(userId: string) {
  try {
    return await prisma.savedIdeas.findMany({
      where: { userId },
      include: {
        idea: {
          include: {
            ideaScore: true,
            marketOpportunity: true,
            monetizationStrategy: true,
            whyNow: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Error getting user saved ideas:", error);
    return [];
  }
}

/**
 * Gets user's claimed ideas
 */
export async function getUserClaimedIdeas(userId: string) {
  try {
    return await prisma.claimedIdeas.findMany({
      where: { userId },
      include: {
        idea: {
          include: {
            ideaScore: true,
            marketOpportunity: true,
            monetizationStrategy: true,
            whyNow: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Error getting user claimed ideas:", error);
    return [];
  }
}

/**
 * Records that a user viewed an idea
 */
export async function recordIdeaView(userId: string, ideaId: string): Promise<void> {
  try {
    // Check if already viewed to avoid duplicates
    const existingView = await prisma.viewedIdeas.findFirst({
      where: { userId, ideaId },
    });

    if (!existingView) {
      await prisma.viewedIdeas.create({
        data: { userId, ideaId },
      });
    }
  } catch (error) {
    console.error("Error recording idea view:", error);
  }
}

/**
 * Gets ideas filtered by user access (excludes claimed ideas by others)
 */
export async function getIdeasForUser(userId: string, filters?: { limit?: number; offset?: number }) {
  try {
    const { limit = 50, offset = 0 } = filters || {};

    // Get ideas excluding those claimed by others
    const ideas = await prisma.dailyIdea.findMany({
      where: {
        OR: [
          { claimedIdeas: null }, // Not claimed by anyone
          { claimedIdeas: { userId: userId ?? undefined } }, // Claimed by current user
        ],
      },
      include: {
        ideaScore: true,
        marketOpportunity: true,
        monetizationStrategy: true,
        whyNow: true,
        savedIdeas: {
          where: { userId: userId ?? undefined },
          select: { id: true },
        },
        claimedIdeas: {
          where: { userId: userId ?? undefined },
          select: { userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Note: Views are only recorded when user clicks on individual ideas (getIdeaById)
    // Browsing the list does not count as "viewing" for limit purposes

    // Add user interaction flags
    return ideas.map(idea => ({
      ...idea,
      narrativeHook: idea.narrativeHook,
      isSaved: idea.savedIdeas.length > 0,
      isClaimed: idea.claimedIdeas?.userId === userId,
      isClaimedByOther: idea.claimedIdeas && idea.claimedIdeas.userId !== userId,
    }));
  } catch (error) {
    console.error("Error getting ideas for user:", error);
    return [];
  }
}
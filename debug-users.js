const { PrismaClient } = require("./apps/server/prisma/generated");

async function checkUsers() {
	const prisma = new PrismaClient({
		datasourceUrl: process.env.DATABASE_URL,
	});

	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				viewLimit: true,
				viewsUsed: true,
				lastViewReset: true,
				createdAt: true,
			},
			take: 5,
		});

		console.log("Users in database:");
		users.forEach((user) => {
			console.log(
				`- ${user.email}: viewLimit=${user.viewLimit}, viewsUsed=${user.viewsUsed}, lastViewReset=${user.lastViewReset}`,
			);
		});

		// Also check if there are any viewed ideas
		const viewedIdeas = await prisma.viewedIdeas.findMany({
			take: 5,
			include: {
				user: {
					select: { email: true },
				},
			},
		});

		console.log("\nRecent viewed ideas:");
		viewedIdeas.forEach((view) => {
			console.log(
				`- ${view.user.email} viewed ${view.ideaId} at ${view.createdAt}`,
			);
		});
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkUsers();

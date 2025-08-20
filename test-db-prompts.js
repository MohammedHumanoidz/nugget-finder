const { PrismaClient } = require('./apps/server/prisma/generated/client');

async function testDatabasePrompts() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Check if AdminPrompts table exists and has data
    const promptCount = await prisma.adminPrompts.count();
    console.log(`📊 Total AdminPrompts records: ${promptCount}`);
    
    if (promptCount > 0) {
      // Get all prompts to see what's in the database
      const allPrompts = await prisma.adminPrompts.findMany({
        select: {
          agentName: true,
          promptKey: true,
          isActive: true,
          createdAt: true
        }
      });
      
      console.log('📋 Available prompts:');
      allPrompts.forEach(prompt => {
        console.log(`  - ${prompt.agentName}:${prompt.promptKey} (active: ${prompt.isActive})`);
      });
      
      // Test specific agent queries
      const agents = ['CompetitiveIntelligenceAgent', 'CriticAgent', 'IdeaSynthesisAgent', 'MasterResearchDirector'];
      for (const agent of agents) {
        const agentPrompts = await prisma.adminPrompts.findMany({
          where: { agentName: agent, isActive: true }
        });
        console.log(`🤖 ${agent} has ${agentPrompts.length} active prompts`);
      }
    } else {
      console.log('⚠️  No AdminPrompts records found in database');
    }
    
    // Test the exact query used in getPrompt function
    console.log('\n🔍 Testing exact queries used by getPrompt...');
    const testPrompt = await prisma.adminPrompts.findFirst({
      where: { 
        agentName: 'CompetitiveIntelligenceAgent',
        promptKey: 'systemPrompt',
        isActive: true 
      }
    });
    
    if (testPrompt) {
      console.log('✅ Found CompetitiveIntelligenceAgent systemPrompt');
      console.log(`   Content length: ${testPrompt.promptContent.length} chars`);
    } else {
      console.log('❌ CompetitiveIntelligenceAgent systemPrompt not found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabasePrompts();
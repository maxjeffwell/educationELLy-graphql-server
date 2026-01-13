const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'http://shared-ai-gateway:8002';

// Use Node.js built-in fetch (available in Node 18+)
const fetch = global.fetch || require('node-fetch');

export default {
  Query: {
    aiHealth: async () => {
      try {
        const response = await fetch(`${AI_GATEWAY_URL}/health`);
        const data = await response.json();

        return {
          success: true,
          gateway: {
            status: data.status,
            gateway: data.gateway,
            backend: data.backend
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          gateway: null
        };
      }
    }
  },

  Mutation: {
    generateStudyRecommendations: async (parent, { gradeLevel, compositeLevel, ellStatus, nativeLanguage }) => {
      try {
        const prompt = `Generate 3 study recommendations for an English Language Learner:
Grade Level: ${gradeLevel}
Proficiency: ${compositeLevel || 'Not specified'}
ELL Status: ${ellStatus || 'Not specified'}
Native Language: ${nativeLanguage || 'Not specified'}

Provide specific, actionable recommendations for improving English language skills.`;

        const response = await fetch(`${AI_GATEWAY_URL}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            app: 'education',
            maxTokens: 300
          })
        });

        if (!response.ok) {
          throw new Error(`AI Gateway error: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: true,
          recommendations: data.response,
          student: {
            gradeLevel,
            compositeLevel,
            ellStatus
          }
        };
      } catch (error) {
        throw new Error(`Failed to generate recommendations: ${error.message}`);
      }
    },

    generateFlashcard: async (parent, { topic, content, gradeLevel }) => {
      try {
        const response = await fetch(`${AI_GATEWAY_URL}/api/ai/flashcard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: gradeLevel ? `${topic} (Grade ${gradeLevel})` : topic,
            content
          })
        });

        if (!response.ok) {
          throw new Error(`AI Gateway error: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: true,
          topic: data.topic,
          question: data.question,
          answer: data.answer,
          gradeLevel
        };
      } catch (error) {
        throw new Error(`Failed to generate flashcard: ${error.message}`);
      }
    },

    generateQuiz: async (parent, { topic, difficulty = 'medium', count = 3, gradeLevel }) => {
      try {
        const fullTopic = gradeLevel ? `${topic} for Grade ${gradeLevel}` : topic;

        const response = await fetch(`${AI_GATEWAY_URL}/api/ai/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: fullTopic,
            difficulty,
            count
          })
        });

        if (!response.ok) {
          throw new Error(`AI Gateway error: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: true,
          topic,
          difficulty,
          gradeLevel,
          count: data.count || count,
          questions: data.questions || []
        };
      } catch (error) {
        throw new Error(`Failed to generate quiz: ${error.message}`);
      }
    },

    chat: async (parent, { messages, context = {} }) => {
      try {
        // Default context for educationELLy
        const chatContext = {
          app: 'educationelly',
          ...context
        };

        const response = await fetch(`${AI_GATEWAY_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            context: chatContext
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('AI Gateway Error Response:', errorText);
          throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
          success: true,
          response: data.response,
          model: data.model,
          backend: data.backend
        };
      } catch (error) {
        throw new Error(`Chat failed: ${error.message}`);
      }
    }
  }
};

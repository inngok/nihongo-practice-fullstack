import apiClient from './apiClient';

const aiService = {
  generateGrammar: async (structure, existingSentence) => {
    // We use a longer timeout for AI generation (120s)
    const res = await apiClient.post('/ai/generate-grammar', 
      { structure, existingSentence },
      { timeout: 120000 }
    );
    return res.data; // this is a string containing JSON
  }
};

export default aiService;

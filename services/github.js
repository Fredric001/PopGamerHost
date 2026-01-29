const axios = require('axios');
const path = require('path');
require('dotenv').config();

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Uploads a file to GitHub repository.
 * @param {string} siteId - Unique ID for the site
 * @param {string} content - File content to upload
 * @returns {Promise<string>} - The GitHub URL of the uploaded file or error message
 */
async function backupToGitHub(siteId, content) {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    
    if (!token || !repo || token === 'your_github_pat_here') {
        console.warn('GitHub backup skipped: Missing configuration');
        return null;
    }

    // Extract owner/repo if full URL is provided
    let repoName = repo;
    if (repo.includes('github.com')) {
        const match = repo.match(/github\.com[:\/]([^\/]+\/[^\/.]+)/);
        if (match) repoName = match[1];
    }

    const filePath = `sites/${siteId}/index.html`;
    const message = `Deploy site-${siteId}`;
    const encContent = Buffer.from(content).toString('base64');
    
    try {
        // Check if file exists to get SHA (for updates, though MVP is new uploads mostly)
        let sha = null;
        try {
            const { data } = await axios.get(`${GITHUB_API_URL}/repos/${repoName}/contents/${filePath}`, {
                headers: { Authorization: `token ${token}` }
            });
            sha = data.sha;
        } catch (err) {
            // File doesn't exist, which is expected for new deployments
        }

        const body = {
            message,
            content: encContent,
            ...(sha && { sha })
        };

        const { data } = await axios.put(`${GITHUB_API_URL}/repos/${repoName}/contents/${filePath}`, body, {
            headers: { 
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return data.content.html_url;
    } catch (error) {
        console.error('GitHub Upload Error:', error.response?.data || error.message);
        return null;
    }
}

module.exports = { backupToGitHub };

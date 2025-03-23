<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>
<body>
  <h1>Resume-Job Matcher</h1>
  
  <p>A web application that analyzes resumes against job descriptions to provide match percentages, identify matched and missing skills, and offer improvement recommendations.</p>
  
  <h2>Features</h2>
  <ul>
    <li>Upload and parse resume files (PDF, DOC, DOCX, TXT)</li>
    <li>Upload and parse job description files (PDF, DOC, DOCX, TXT)</li>
    <li>Calculate match percentage between resume and job requirements</li>
    <li>Identify matched skills present in both documents</li>
    <li>Highlight missing skills from the job description</li>
    <li>Provide a personalized improvement roadmap</li>
    <li>Offer actionable tips to enhance resume for specific roles</li>
  </ul>
  
  <h2>Technology Stack</h2>
  <ul>
    <li><strong>Frontend</strong>: HTML, CSS (Tailwind CSS), JavaScript (Alpine.js)</li>
    <li><strong>Backend</strong>: Node.js, Express.js</li>
    <li><strong>AI Analysis</strong>: Google Gemini Flash 2.0 AI</li>
    <li><strong>Document Parsing</strong>: pdf-parse (PDF), mammoth (DOCX/DOC)</li>
  </ul>
  
  <h2>Prerequisites</h2>
  <ul>
    <li>Node.js (v14.x or higher)</li>
    <li>npm (v6.x or higher)</li>
    <li>Google Gemini API key</li>
  </ul>
  
  <h2>Installation</h2>
  <ol>
    <li>
      <p>Clone the repository:</p>
      <pre><code>git clone https://github.com/your-username/resume-job-matcher.git
cd resume-job-matcher</code></pre>
    </li>
    <li>
      <p>Install dependencies:</p>
      <pre><code>npm install</code></pre>
    </li>
    <li>
      <p>Create a <code>.env</code> file in the root directory with your Google Gemini API key:</p>
      <pre><code>GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001</code></pre>
      <div>
        <p>Note: To obtain a Gemini API key, visit <a href="https://makersuite.google.com/" target="_blank">Google AI Studio</a> and sign up for access.</p>
      </div>
    </li>
  </ol>
  
  <h2>Running the Application</h2>
  <ol>
    <li>
      <p>Start the server:</p>
      <pre><code>node server.js</code></pre>
    </li>
    <li>
      <p>Open your browser and navigate to:</p>
      <pre><code>http://localhost:3001</code></pre>
    </li>
  </ol>
  
  <h2>Usage</h2>
  <ol>
    <li>Click on the upload areas to add your resume and job description files</li>
    <li>Both files must be in PDF, DOC, DOCX, or TXT format (max 5MB each)</li>
    <li>Click the "Analyze Match" button</li>
    <li>Review the detailed analysis results:
      <ul>
        <li>Match percentage</li>
        <li>Resume and job description summaries</li>
        <li>Matched skills</li>
        <li>Missing skills</li>
        <li>Improvement roadmap</li>
        <li>Actionable tips</li>
      </ul>
    </li>
  </ol>
  
  <h2>Project Structure</h2>
  <pre><code>resume-job-matcher/
├── public/
│   └── index.html        # Frontend interface
├── uploads/              # Temporary storage for uploaded files
├── server.js             # Express server and API implementation
├── .env                  # Environment variables (API keys)
├── package.json          # Project dependencies
└── README.md             # Project documentation</code></pre>
  
  <h2>API Endpoints</h2>
  <ul>
    <li><code>GET /</code>: Serves the main application page</li>
    <li><code>POST /analyze</code>: Analyzes uploaded resume and job description files
      <ul>
        <li>Accepts: <code>multipart/form-data</code> with <code>resume</code> and <code>jobDescription</code> fields</li>
        <li>Returns: JSON with analysis results</li>
      </ul>
    </li>
  </ul>
  
  <h2>Troubleshooting</h2>
  <ul>
    <li><strong>File upload errors</strong>: Ensure files are under 5MB and in supported formats</li>
    <li><strong>API errors</strong>: Verify your Gemini API key is correct and has sufficient quota</li>
    <li><strong>Empty analysis results</strong>: Check if the uploaded documents contain extractable text</li>
  </ul>
  
  <h2>Future Improvements</h2>
  <ul>
    <li>Add user accounts to save analysis history</li>
    <li>Implement resume builder with AI suggestions</li>
    <li>Add support for more file formats (RTF, HTML, etc.)</li>
    <li>Create a batch analysis feature for multiple job descriptions</li>
    <li>Implement keyword density analysis and visualization</li>
  </ul>
  
  <h2>License</h2>
  <p>This project is licensed under the MIT License - see the LICENSE file for details.</p>
  
  <h2>Acknowledgments</h2>
  <ul>
    <li>Google Gemini for providing the AI analysis capabilities</li>
    <li>Tailwind CSS for the responsive design framework</li>
    <li>Alpine.js for lightweight reactivity</li>
  </ul>
</body>
</html>
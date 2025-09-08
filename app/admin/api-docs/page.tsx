'use client';

import { useEffect } from 'react';

export default function ApiDocsPage() {
  useEffect(() => {
    // Load Swagger UI CSS and JS from CDN
    const loadSwagger = () => {
      // Add CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';
      cssLink.href = 'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.css';
      document.head.appendChild(cssLink);

      // Add JavaScript
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js';
      script.onload = () => {
        // Initialize Swagger UI
        const ui = (window as any).SwaggerUIBundle({
          url: '/api/swagger',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.presets.standalone
          ],
          plugins: [
            (window as any).SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: 'StandaloneLayout',
          tryItOutEnabled: true,
          supportedSubmitMethods: ['get', 'post', 'put', 'delete'],
          onComplete: () => {
            console.log('Swagger UI loaded successfully');
          },
          onFailure: (error: any) => {
            console.error('Failed to load Swagger UI:', error);
          }
        });
      };
      document.body.appendChild(script);
    };

    loadSwagger();

    // Cleanup function
    return () => {
      // Remove added elements when component unmounts
      const cssLinks = document.querySelectorAll('link[href*="swagger-ui"]');
      const scripts = document.querySelectorAll('script[src*="swagger-ui"]');
      
      cssLinks.forEach(link => link.remove());
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dance Platform API Documentation</h1>
          <p className="text-gray-300">
            Interactive API documentation for the Dance Platform admin panel. 
            Use this interface to explore and test all available endpoints.
          </p>
          <div className="mt-4 flex space-x-4">
            <a 
              href="/admin" 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm font-medium transition-colors"
            >
              ← Back to Admin Panel
            </a>
            <a 
              href="/api/swagger" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white text-sm font-medium transition-colors"
            >
              View Raw JSON
            </a>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div id="swagger-loading" className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>

      {/* Swagger UI Container */}
      <div id="swagger-ui" className="swagger-ui-container"></div>

      {/* Custom styles to improve the appearance */}
      <style jsx>{`
        .swagger-ui-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Hide loading indicator when Swagger UI loads */
        .swagger-ui .swagger-ui {
          display: block;
        }
        
        .swagger-ui .swagger-ui + #swagger-loading {
          display: none;
        }
      `}</style>
    </div>
  );
}

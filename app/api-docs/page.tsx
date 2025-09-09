'use client'

import { useEffect } from 'react'

export default function ApiDocsPage() {
  useEffect(() => {
    // Dynamically import Swagger UI CSS and JS
    const loadSwaggerUI = async () => {
      // Load Swagger UI CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.css'
      document.head.appendChild(link)

      // Load Swagger UI JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js'
      script.onload = () => {
        // Wait for script to initialize and use proper API endpoint
        setTimeout(() => {
          const SwaggerUIBundle = (window as any).SwaggerUIBundle
          if (SwaggerUIBundle) {
            SwaggerUIBundle({
              url: '/api/swagger', // Fixed URL
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                (window as any).SwaggerUIBundle.presets.apis
              ],
              plugins: [
                (window as any).SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: 'BaseLayout', // Fixed layout
              persistAuthorization: true,
              tryItOutEnabled: true,
              filter: true,
              validatorUrl: null,
              defaultModelsExpandDepth: 1,
              defaultModelExpandDepth: 1,
              docExpansion: 'list',
              onComplete: () => {
                console.log('Swagger UI loaded successfully')
              },
              onFailure: (error: any) => {
                console.error('Swagger UI error:', error)
              }
            })
          }
        }, 100)
      }
      document.body.appendChild(script)
    }

    loadSwaggerUI()

    // Cleanup function
    return () => {
      // Remove Swagger UI elements on unmount
      const swaggerUI = document.getElementById('swagger-ui')
      if (swaggerUI) {
        swaggerUI.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dance Platform API Documentation
          </h1>
          <p className="text-gray-600">
            Interactive API documentation powered by Swagger UI. Test endpoints directly from this interface.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Development Mode:</strong> Authentication is automatic. In production, use the Authorize button to add your JWT token.
            </p>
            <div className="mt-2 text-sm text-blue-700">
              <strong>Test Credentials:</strong>
              <br />
              Email: admin@dev.local
              <br />
              Password: admin123
            </div>
          </div>
        </div>
        
        {/* Swagger UI will be rendered here */}
        <div id="swagger-ui" className="swagger-container"></div>
      </div>

      {/* Custom styles for Swagger UI */}
      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .info {
          margin-bottom: 40px;
        }
        
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .swagger-ui .btn.authorize {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .swagger-ui .btn.authorize:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .swagger-ui .btn.execute {
          background-color: #10b981;
          border-color: #10b981;
        }
        
        .swagger-ui .btn.execute:hover {
          background-color: #059669;
          border-color: #059669;
        }
        
        .swagger-ui select {
          padding: 5px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        
        .swagger-ui .opblock.opblock-post .opblock-summary {
          border-color: #10b981;
        }
        
        .swagger-ui .opblock.opblock-get .opblock-summary {
          border-color: #3b82f6;
        }
        
        .swagger-ui .opblock.opblock-put .opblock-summary {
          border-color: #f59e0b;
        }
        
        .swagger-ui .opblock.opblock-delete .opblock-summary {
          border-color: #ef4444;
        }
        
        .swagger-ui .opblock-tag {
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 20px;
        }
        
        .swagger-ui .opblock-tag-section h4 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }
      `}</style>
    </div>
  )
}

#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

// Dynamic import for nanoid (ES module)
let nanoid
async function loadNanoid() {
  const { nanoid: importedNanoid } = await import('nanoid')
  nanoid = importedNanoid
}

const prisma = new PrismaClient()

async function generateToken() {
  try {
    // Load nanoid ES module
    await loadNanoid()
    
    // Parse command line arguments
    const args = process.argv.slice(2)
    const options = {}
    
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i]?.replace('--', '')
      const value = args[i + 1]
      if (key && value) {
        options[key] = value
      }
    }

    // Set defaults
    const tokenData = {
      name: options.name || 'CLI Generated Token',
      purpose: options.purpose || 'cli',
      maxUses: options.maxUses ? parseInt(options.maxUses) : null,
      expiresAt: options.expiresAt ? new Date(options.expiresAt) : null,
      allowedRoles: options.roles ? options.roles.split(',') : ['USER', 'INSTRUCTOR', 'ADMIN'],
      metadata: options.metadata ? JSON.stringify(JSON.parse(options.metadata)) : null
    }

    // Generate unique token
    const token = nanoid(32)

    // Create login token
    const loginToken = await prisma.loginToken.create({
      data: {
        token,
        ...tokenData
      }
    })

    // Generate the unique login URL
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login/${token}`

    console.log('\n🎉 Login Token Generated Successfully!')
    console.log('=====================================')
    console.log(`ID: ${loginToken.id}`)
    console.log(`Name: ${loginToken.name}`)
    console.log(`Purpose: ${loginToken.purpose}`)
    console.log(`Token: ${loginToken.token}`)
    console.log(`Login URL: ${loginUrl}`)
    console.log(`Max Uses: ${loginToken.maxUses || 'Unlimited'}`)
    console.log(`Expires: ${loginToken.expiresAt || 'Never'}`)
    console.log(`Allowed Roles: ${loginToken.allowedRoles.join(', ')}`)
    console.log('=====================================\n')

    // Copy to clipboard if available
    if (process.platform === 'darwin') {
      try {
        const { exec } = require('child_process')
        exec(`echo "${loginUrl}" | pbcopy`, (error) => {
          if (!error) {
            console.log('✅ Login URL copied to clipboard!')
          }
        })
      } catch (e) {
        // Clipboard copy failed, but that's okay
      }
    }

  } catch (error) {
    console.error('❌ Error generating token:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

function showHelp() {
  console.log(`
🔗 Login Token Generator
========================

Usage: node generate-login-token.js [options]

Options:
  --name <string>           Token name/description
  --purpose <string>        Token purpose (marketing, referral, admin, campaign, etc.)
  --maxUses <number>        Maximum number of uses (optional)
  --expiresAt <date>        Expiration date (ISO format, optional)
  --roles <string>          Comma-separated allowed roles (USER,INSTRUCTOR,ADMIN)
  --metadata <json>         JSON metadata (optional)
  --help                    Show this help

Examples:
  node generate-login-token.js --name "Marketing Campaign Q1" --purpose marketing --maxUses 100
  node generate-login-token.js --name "Admin Access" --purpose admin --roles ADMIN
  node generate-login-token.js --name "Referral Link" --purpose referral --expiresAt "2024-12-31T23:59:59Z"
`)
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp()
  process.exit(0)
}

// Generate the token
generateToken()
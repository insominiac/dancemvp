const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listAllTables() {
  try {
    console.log('\n🗄️  LISTING ALL TABLES IN RAILWAY POSTGRESQL DATABASE\n')
    console.log('=' .repeat(80))
    
    // Query to get all tables from PostgreSQL information schema
    const tables = await prisma.$queryRaw`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    
    console.log('📊 Tables in the database:\n')
    
    let applicationTables = []
    let prismaTables = []
    
    tables.forEach((table, index) => {
      const tableName = table.table_name
      
      // Categorize tables
      if (tableName.startsWith('_prisma')) {
        prismaTables.push(tableName)
      } else {
        applicationTables.push(tableName)
      }
      
      console.log(`  ${index + 1}. ${tableName} (${table.table_type})`)
    })
    
    console.log('\n' + '-'.repeat(80))
    console.log('\n📋 SUMMARY:\n')
    console.log(`Total number of tables: ${tables.length}`)
    console.log(``)
    console.log(`Application Tables (${applicationTables.length}):`)
    applicationTables.forEach(t => console.log(`  • ${t}`))
    
    if (prismaTables.length > 0) {
      console.log(`\nPrisma System Tables (${prismaTables.length}):`)
      prismaTables.forEach(t => console.log(`  • ${t}`))
    }
    
    // Get row counts for application tables
    console.log('\n' + '-'.repeat(80))
    console.log('\n📈 ROW COUNTS:\n')
    
    for (const tableName of applicationTables) {
      try {
        const count = await prisma[tableName.toLowerCase()].count()
        console.log(`  ${tableName}: ${count} rows`)
      } catch (e) {
        // Handle if model name doesn't match exactly
        if (tableName === 'User') {
          const count = await prisma.user.count()
          console.log(`  ${tableName}: ${count} rows`)
        } else if (tableName === 'Class') {
          const count = await prisma.class.count()
          console.log(`  ${tableName}: ${count} rows`)
        } else if (tableName === 'Booking') {
          const count = await prisma.booking.count()
          console.log(`  ${tableName}: ${count} rows`)
        }
      }
    }
    
    // Show table schemas
    console.log('\n' + '-'.repeat(80))
    console.log('\n🔍 TABLE SCHEMAS:\n')
    
    for (const tableName of applicationTables) {
      const columns = await prisma.$queryRaw`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `
      
      console.log(`\n📌 ${tableName}:`)
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
        console.log(`    • ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
      })
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('✅ Database inspection complete')
    console.log('=' .repeat(80))
    
  } catch (error) {
    console.error('❌ Error listing tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listAllTables()

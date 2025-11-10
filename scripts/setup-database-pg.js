import pg from 'pg'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get database connection string from environment
// Supabase connection string format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL or SUPABASE_DB_URL environment variable is required')
  console.log('\nTo get your database URL:')
  console.log('1. Go to your Supabase Dashboard')
  console.log('2. Navigate to Settings > Database')
  console.log('3. Copy the "Connection string" (URI format)')
  console.log('4. Replace [YOUR-PASSWORD] with your database password')
  console.log('5. Add it to your .env file:')
  console.log('   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres')
  console.log('\n⚠️  WARNING: Never commit the database password to version control!')
  process.exit(1)
}

async function setupDatabase() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Supabase requires SSL
    }
  })

  try {
    console.log('🚀 Starting database setup...\n')
    console.log('🔌 Connecting to database...')

    await client.connect()
    console.log('✅ Connected to database\n')

    // Read the SQL schema file
    const schemaPath = join(__dirname, '..', 'supabase-schema.sql')
    
    if (!existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`)
    }

    console.log('📄 Reading schema file...')
    const sql = readFileSync(schemaPath, 'utf-8')
    
    if (!sql || sql.trim().length === 0) {
      throw new Error('Schema file is empty')
    }

    console.log(`   File read successfully (${sql.length} characters)`)
    console.log('📝 Executing SQL schema...\n')

    // Clean up the SQL: remove comments and normalize whitespace
    const cleanedSql = sql
      .split('\n')
      .map(line => {
        // Remove full-line comments
        const trimmed = line.trim()
        if (trimmed.startsWith('--')) {
          return ''
        }
        // Remove inline comments
        const commentIndex = line.indexOf('--')
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex).trim()
        }
        return line.trim()
      })
      .filter(line => line.length > 0)
      .join('\n')
      .trim()

    // Split into statements (statements end with semicolon)
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`   Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Safety check: skip if statement looks invalid
      if (!statement || statement.length < 5) {
        console.log(`   ⚠ Skipping empty statement ${i + 1}`)
        continue
      }
      
      // Safety check: skip if it contains filename patterns
      if (statement.toLowerCase().includes('supabase-schema.sql') ||
          statement.match(/^[a-z-]+\.sql$/i)) {
        console.log(`   ⚠ Skipping invalid statement ${i + 1}: looks like filename`)
        continue
      }
      
      try {
        const preview = statement.split('\n')[0].substring(0, 60).trim()
        console.log(`   [${i + 1}/${statements.length}] ${preview}...`)
        
        // Execute the statement
        await client.query(statement + ';')
        console.log(`   ✓ Success`)
      } catch (err) {
        // Handle "already exists" errors gracefully
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate') ||
            (err.message.includes('relation') && err.message.includes('already exists')) ||
            err.code === '42P07') { // PostgreSQL error code for "relation already exists"
          console.log(`   ⚠ Skipped (already exists)`)
        } else {
          console.error(`   ✗ Error:`)
          console.error(`   ${err.message}`)
          console.error(`   Statement preview: ${statement.substring(0, 150)}`)
          throw err
        }
      }
    }

    console.log('\n✅ Database setup completed successfully!')
    console.log('\n📊 Created tables:')
    console.log('   - trips')
    console.log('   - places')
    console.log('   - diesel_expenses')
    console.log('\n🔒 RLS policies have been configured')
    console.log('✨ You can now use the application!\n')

  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Make sure your database password is correct in DATABASE_URL')
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Check that your database URL is correct')
    } else {
      console.log('\n💡 Alternative: Run the SQL manually in Supabase Dashboard')
      console.log('   1. Go to SQL Editor in your Supabase Dashboard')
      console.log('   2. Copy contents from supabase-schema.sql')
      console.log('   3. Paste and run the SQL\n')
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

setupDatabase()


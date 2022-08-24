import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import inquirer from 'inquirer'

/** @returns {Promise<string>} the package name */
const getPackageName = async () => JSON.parse(await fs.readFile('./package.json', 'utf8'))
  .name.replace(/\W/g, '_')
  .replace(/__+/g, '')

const DOTENV_PATH = path.resolve('.env')

/** @param {string} str database name
  * @returns {true | string} an error string or true
  */
function validateDatabaseName(str) {
  if (str.length < 4) return 'must be at least 4 characters'
  if (str !== str.toLowerCase()) return 'must be lowercase'
  return true
}

/** @param {number} length the length of the password
  * @param {BufferEncoding} type the BufferEncoding type
  * @returns {string} a random password
  */
function generatePassword(length, type = 'base64url') {
  return crypto.randomBytes(length).toString(type)
}

async function readDotenv() {
  let buffer = null
  try {
    buffer = await fs.readFile(DOTENV_PATH)
  } catch (e) {
    /* noop */
  }
  const config = buffer ? dotenv.parse(buffer) : {}
  // also read from current env, because docker-compose already needs to know some of it
  // eg. $PG_DUMP, $CONFIRM
  return { ...config, ...process.env }
}

async function createConfig(config = {}) {
  const {
    ROOT_DATABASE_USER,
    DATABASE_HOST,
    DATABASE_NAME,
    DATABASE_OWNER,
    PORT,
    ...PASSWORDS
  } = await inquirer.prompt(
    [
      {
        name: 'ROOT_DATABASE_USER',
        message: 'superuser database username:',
        default: 'postgres',
        prefix: '',
      },
      {
        name: 'DATABASE_HOST',
        message: 'database host:',
        default: 'localhost:5432',
        prefix: '',
      },
      {
        name: 'DATABASE_NAME',
        message: 'database name:',
        default: await getPackageName(),
        validate: validateDatabaseName,
        prefix: '',
      },
      {
        name: 'DATABASE_OWNER',
        message: 'database username:',
        default: prompt => prompt.DATABASE_NAME,
        prefix: '',
      },
      {
        name: 'PORT',
        message: 'application port:',
        default: '3000',
        prefix: '',
      },
      {
        name: 'ROOT_DATABASE_PASSWORD',
        default: () => generatePassword(18),
        prefix: '',
      },
      {
        name: 'DATABASE_OWNER_PASSWORD',
        default: () => generatePassword(18),
        prefix: '',
      },
      {
        name: 'SECRET',
        default: () => generatePassword(64),
        prefix: '',
      },
    ],
    config,
  )

  const ROOT_DATABASE_URL = `postgres://${ROOT_DATABASE_USER}:${PASSWORDS.ROOT_DATABASE_PASSWORD}@${DATABASE_HOST}/template1`
  const DATABASE_URL = `postgres://${DATABASE_OWNER}:${PASSWORDS.DATABASE_OWNER_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`

  const envFile = `NODE_ENV=development
ROOT_DATABASE_USER=${ROOT_DATABASE_USER}
ROOT_DATABASE_PASSWORD=${PASSWORDS.ROOT_DATABASE_PASSWORD}
ROOT_DATABASE_URL=${ROOT_DATABASE_URL}
DATABASE_HOST=${DATABASE_HOST}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_OWNER=${DATABASE_OWNER}
DATABASE_OWNER_PASSWORD=${PASSWORDS.DATABASE_OWNER_PASSWORD}
DATABASE_URL=${DATABASE_URL}
SECRET=${PASSWORDS.SECRET}
PORT=${PORT}
PGUSER=${ROOT_DATABASE_USER}
PGPASSWORD=${PASSWORDS.ROOT_DATABASE_PASSWORD}
PGHOST=${DATABASE_HOST}
PGDATABASE=${DATABASE_NAME}
`
  await fs.writeFile(DOTENV_PATH, envFile, 'utf8')
  console.log('.env file updated')
}

async function main() {
  try {
    const config = await readDotenv()
    await fs.stat('.env')
    createConfig(config)
  } catch (e) {
    createConfig()
  }
}

main()

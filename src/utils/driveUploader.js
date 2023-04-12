import { google } from 'googleapis'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'

class DriveUploader {
  #KEY_FILE_PATH
  #SCOPES
  #auth
  #driveService

  constructor() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    // * Service account key file from google cloud console.
    this.#KEY_FILE_PATH = path.resolve(__dirname, '../assets/credentials.json')
    this.#SCOPES = ['https://www.googleapis.com/auth/drive']

    this.#auth = new google.auth.GoogleAuth({
      keyFile: this.#KEY_FILE_PATH,
      scopes: this.#SCOPES
    })
  }

  createFolder = async(name, parent = null) => {
    const driveService = google.drive({ version: 'v3', auth: this.#auth })

    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['1e3EHHWZ5gKVQFpo3DQlOVL5-9ysLe-C-']
    }

    const file = driveService.files.create({
      resource: fileMetadata,
      fields: 'id'
    })

    return file.data.id
  }

  createFile = async(name, path, folderId, mimeType) => {
    const driveService = google.drive({ version: 'v3', auth: this.#auth })

    const fileMetadata = {
      name,
      parents: [folderId]
    }

    const media = {
      mimeType,
      body: fs.createReadStream(path)
    }

    const file = await driveService.files.create({
      resource: fileMetadata,
      media,
      fields: 'id'
    })

    return file
  }

  findFolder = async(folderName) => {
    const driveService = google.drive({ version: 'v3', auth: this.#auth })

    const response = await driveService.files.list({
      q: `name='${folderName}'`,
      fields: 'files(id, name)',
      spaces: 'drive'
    })

    return response.data.files
  }

  deleteFile = async(fileId) => {
    const driveService = google.drive({ version: 'v3', auth: this.#auth })

    const response = await driveService.files.delete({ fileId })

    return response.data
  }
}

export default new DriveUploader()

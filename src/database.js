import fs from 'node:fs/promises'
import moment from 'moment'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf8')
            .then(data => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist()
            })
    }

    #persist() {
        return fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    select(table, search) {
        const data = this.#database[table] ?? []

        if (search) {
            return data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    update(table, id, data) { 
        const rowIndex = this.#database[table].findIndex(row => row.id === id)
        if (rowIndex > -1) {
            this.#database[table][rowIndex] = { id, ...data }
            this.#persist()
        }
    }
    
    delete(table, id) { 
        const rowIndex = this.#database[table].findIndex(row => row.id === id)
        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
        }
    }

    completed(table, id) { 
        const rowIndex = this.#database[table].findIndex(row => row.id === id)
        if (rowIndex > -1) {
            const row = this.#database[table][rowIndex]
            this.#database[table][rowIndex] = {
                id,
                ...row,
                completed_at: row.completed_at ? null : moment().format('YYYY-MM-DD HH:mm:ss')
            }
            this.#persist()
        }
    }
}

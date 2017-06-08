'use strict'

const logger = require('winston')

const db = require('./database')
const tableName = 'users'

function up() {
	return db.schema.createTableIfNotExists(tableName, (table) => {
		table.increments()
		table.string('name')
		table.timestamps()
	})
}

function fetch(name) {
	if(name === name.toLocaleLowerCase()) {
		logger.info('lowercase parameter supplied')
	}

	return db.select('*').from('users').where({ name })
}

module.exports = {
	up,
	fetch
}
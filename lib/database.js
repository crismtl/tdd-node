'use strict'

const createKnex = require('knex')

const knex = createKnex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '1234',
        database: 'nodejs_at_scale'
    }
    //connection: 'postgres://@localhost:5432/nodejs_at_scale'
})

module.exports = knex

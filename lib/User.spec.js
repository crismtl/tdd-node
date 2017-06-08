'use strict'

const User = require('./User')
const db = require('./database')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const logger = require('winston')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const _ = require('lodash')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)
const expect = chai.expect

describe('User module', () => {
    describe('"up"', () => {
        function cleanUp() {
            return db.schema.dropTableIfExists('users')
        }

        before(cleanUp)
        after(cleanUp)

        it('should export a function', () => {
            expect(User.up).to.be.a('function')
        })
        it('should return a Promise', () => {
                const usersUpResult = User.up()
                expect(usersUpResult.then).to.be.a('Function')
                expect(usersUpResult.catch).to.be.a('Function')
            })
            /* it('should create a table named "users"', () => {
            	return User.up()
            	.then(() => db.schema.hasTable('users'))
            	.then((hasUsersTable) => expect(hasUsersTable).to.be.true)
            }),*/
            /*it('should create a table named "users" v.PRO', function*() {
            	yield User.up()
            	const hasUsersTable = yield db.schema.hasTable('users')
            	expect(hasUsersTable).to.be.true
            })*/
        it('should create a table named "users" v.2PRO', function*() {
            yield User.up()
            return expect(db.schema.hasTable('users')).to.eventually.be.true
        })
    })
    describe('"fetch"', () => {
        it('should export a function', () => {

            it('should export a function', () => {
                expect(User.fetch).to.be.a('Function')
            })
            it('should return a Promise', () => {
                const usersFetchResult = User.fetch()
                expect(usersFetchResult.then).to.be.a('Function')
                expect(usersFetchResult.cath).to.be.a('Function')
            })
            describe('with inserted rows', () => {
                const testName = 'Peter'
                before(() => User.up())
                beforeEach(() => {
                        Promise.all([db.insert({ name: testName }).into('users'),
                                db.insert({ name: 'Cris' }).into('users')
                            ])
                            /*this.sandbox = sinon.sandbox.create()*/
                    })
                    //TODO: no funca
                    /*afterEach(() => {
                    	this.sandbox.restore()
                    })*/

                it('should return the users by their name', () =>
                    expect(User.fetch(testName)
                        .then(_.map(
                            _.omit(['id', 'created_at', 'updated_at'])
                        ))
                    ).to.eventually.be.eql([{ name: 'Peter' }])
                )
                it('should return users with timestamps and id', () =>
                    expect(User.fetch(testName)
                        .then((users) => users[0])
                    ).to.eventually.have.keys('created_at', 'updated_at', 'id', 'name')
                )
                it('should call winston if name is all lowercase', function*() {
                    //sinon.spy(logger, 'info') //la simulación si llama a la función (muestra los mensajes del logger)
                    sinon.stub(logger, 'info') //la simulación llama a una función falsa (NO muestra los mensajes del logger)
                    yield User.fetch(testName.toLocaleLowerCase())
                    expect(logger.info).to.have.been.calledWith('lowercase parameter supplied')
                    logger.info.restore()
                })

            })
            describe('with stub, spy and mock', () => {
                const testName = 'Peter'
                    /*it('should build the query properly', function*() {
                        	const sandbox = sinon.sandbox.create()
                            const fakeDb = {
                                from: sandbox.spy(function() {
                                    return this
                                }),
                                where: sandbox.spy(function() {
                                    return Promise.resolve()
                                })
                            }
                            sandbox.stub(db, 'select').callsFake(() => fakeDb)
                            sandbox.stub(logger, 'info')

                            yield User.fetch(testName.toLocaleLowerCase())
                            expect(db.select).to.have.been.calledOnce
                            expect(fakeDb.from).to.have.been.calledOnce
                            expect(fakeDb.where).to.have.been.calledOnce

                            //db.select.restore()
                            //logger.info.restore()
                            sandbox.restore()
                        })*/
                it('should build the query properly v.PRO', function*() {
                        const sandbox = sinon.sandbox.create()
                        sandbox.stub(logger, 'info') // para que 
                        const mock = sinon.mock(db) // no salga el mensaje
                        mock.expects('select').once().returnsThis()
                        mock.expects('from').once().returnsThis()
                        mock.expects('where').once().returns(Promise.resolve())

                        yield User.fetch(testName.toLocaleLowerCase())
                        mock.verify()
                    })
                    /*it('should log and rethrow database errors', function*() {
                    	const sandbox = sinon.sandbox.create()
                        sandbox.stub(logger, 'error')
                        const mock = sinon.mock(db)
                        mock.expects('select').once().returnsThis()
                        mock.expects('from').once().returnsThis()
                        mock.expects('where').once().returns(Promise.reject(new Error('Database has failed')))

                        let err
                        try {
                            yield User.fetch(testName, toLocaleLowerCase())
                        } catch (ex) {
                            err = ex
                        }

                        mock.verify()

                        expect(logger.error).to.have.been.calledOnce
                        expect(logger.error).to.have.been.calledWith('Database has failed')
                        expect(err.message).to.be.eql('Database has failed')
                    })*/
                it('should log and rethrow database errors', function*() {
                    const sandbox = sinon.sandbox.create()
                    sandbox.stub(logger, 'error')
                    const mock = sinon.mock(db)
                    mock.expects('select').once().returnsThis()
                    mock.expects('from').once().returnsThis()
                    mock.expects('where').once().returns(Promise.reject(new Error('Database has failed')))

                    return expect(User.fetch(testName.toLocaleLowerCase()))
                        .to.be.rejectedWith('Database has failed')
                })
            })
        })
    })
})

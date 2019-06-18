/* eslint-disable no-undef */
'use strict';

const assert = require('assert');
const RegNumberManager = require('../registration-number-manager');
const pg = require('pg');
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/reg_testing';

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}
const pool = new Pool({
    connectionString,
    ssl: useSSL
});

describe('Testing Registration number manager', function () {
    beforeEach(async function () {
        // clean the tables before each test run
        await pool.query('delete from reg_num_list;');
    });
    describe('Error messages testing', function () {
        it('Should return "Please enter a registration" when no registration is entered', async function () {
            let regInstance = RegNumberManager(pool);

            await regInstance.addReg('');
            assert.strict.equal(regInstance.error(), 'Please enter a registration');
        });
        it('Should return "Enter a valid registration" when an invalid registration is entered', async function () {
            let regInstance = RegNumberManager(pool);

            await regInstance.addReg('cy abc 432');
            assert.strict.equal(regInstance.error(), 'Enter a valid registration');
        });
        it('Should return "This registration has been entered already" when a registration is repeated', async function () {
            let regInstance = RegNumberManager(pool);

            await regInstance.addReg('ca 123-321');
            await regInstance.addReg('ca 123-321');

            assert.strict.equal(regInstance.error(), 'This registration has been entered already');
        });
        it('Should return "We do not track registrations from this town" when an unrecognised registration start (eg. CK) is entered', async function () {
            let regInstance = RegNumberManager(pool);

            await regInstance.addReg('ck 123-321');

            assert.strict.equal(regInstance.error(), 'We do not track registrations from this town');
        });
        it('Should return "" when the correct registration is entered', async function () {
            let regInstance = RegNumberManager(pool);

            await regInstance.addReg('ca 123-321');

            assert.strict.equal(regInstance.error(), '');
        });
    });
    describe('Filter testing', function () {
        it('Should return a filtered list of registrations from CA and leaving out the CY registration', async function () {
            let regInstance = RegNumberManager(pool);
            await regInstance.buildTownsTable();
            await regInstance.addReg('ca 123-321');
            await regInstance.addReg('cy 109-275');
            await regInstance.addReg('ca 432-352');

            regInstance.loadFilterItem('Cape Town');

            let regTest = await regInstance.buildRegNumList();
            assert.strict.deepEqual(regTest, [{ registration: 'CA 123 321' }, { registration: 'CA 432 352' }]);
        });
        it('Should return a filtered list of registrations from CY and leaving out the CA registrations', async function () {
            let regInstance = RegNumberManager(pool);
            await regInstance.buildTownsTable();
            await regInstance.addReg('ca 123-321');
            await regInstance.addReg('cy 109-275');
            await regInstance.addReg('ca 432-352');

            regInstance.loadFilterItem('Bellville');

            let regTest = await regInstance.buildRegNumList();
            assert.strict.deepEqual(regTest, [{ registration: 'CY 109 275' }]);
        });
        it('Should return all the added registrations when "show all towns" is chosen', async function () {
            let regInstance = RegNumberManager(pool);
            await regInstance.buildTownsTable();
            await regInstance.addReg('ca 123-321');
            await regInstance.addReg('cy 109-275');
            await regInstance.addReg('ca 432-352');

            regInstance.loadFilterItem('show all towns');

            let regTest = await regInstance.buildRegNumList();
            assert.strict.deepEqual(regTest, [
                { registration: 'CA 123 321' },
                { registration: 'CY 109 275' },
                { registration: 'CA 432 352' }
            ]);
        });
        it('Should return all the added registrations by default when no town is picked', async function () {
            let regInstance = RegNumberManager(pool);
            await regInstance.buildTownsTable();
            await regInstance.addReg('ca 123-321');
            await regInstance.addReg('cy 109-275');
            await regInstance.addReg('ca 432-352');

            let regTest = await regInstance.buildRegNumList();
            assert.strict.deepEqual(regTest, [
                { registration: 'CA 123 321' },
                { registration: 'CY 109 275' },
                { registration: 'CA 432 352' }
            ]);
        });
    });
    describe('Table clearing testing', function () {
        it('Should return an empty array after adding a registration then clearing it', async function () {
            let regInstance = RegNumberManager(pool);
            await regInstance.addReg('cy 123-564');

            await regInstance.clearTable();

            let regTest = await regInstance.buildRegNumList();
            assert.strict.deepEqual(regTest.rows, undefined);
        });
    });
    describe('Drop down build list testing', function () {
        it('Should return the list of towns to load into a table and build drop down from', async function () {
            let regInstance = RegNumberManager(pool);

            assert.strict.deepEqual(regInstance.showTowns(), [
                { town: 'show all towns', loc: '' },
                { town: 'Ceres', loc: 'CT' },
                { town: 'Paarl', loc: 'CJ' },
                { town: 'Cape Town', loc: 'CA' },
                { town: 'Stellenbosch', loc: 'CL' },
                { town: 'Bellville', loc: 'CY' }
            ]);
        });
    });

    after(function () {
        pool.end();
    });
});

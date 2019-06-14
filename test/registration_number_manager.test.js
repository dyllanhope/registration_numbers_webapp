/* eslint-disable no-undef */
'use strict';

const assert = require('assert');
const RegNumberManager = require('../registration_number_manager');
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
    describe('Error message testing', function () {
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
        it('Should return "" when the correct registration is entered', async function () {
            let regInstance = RegNumberManager(pool);

            await regInstance.addReg('ca 123-321');

            assert.strict.equal(regInstance.error(), '');
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

    after(function () {
        pool.end();
    });
});
// const assert = require('assert');
// const RegNumberManager = require('../registration_number_manager');

// describe('List testing', function () {
//     it('Should return an object with all 5 of the registered plates', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');
//         townInstance.register('CT 51263');
//         townInstance.register('CL 72534');
//         townInstance.register('CA 99153');
//         townInstance.register('CY 01152');

//         assert.strict.deepEqual(townInstance.regList(), { 'CY 13245': 0, 'CT 51263': 0, 'CL 72534': 0, 'CA 99153': 0, 'CY 01152': 0 });
//     });
//     it('Should return an object with 5 registrations as the others are of invalid formats', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');
//         townInstance.register('CT 51263');
//         townInstance.register('CL 72534');
//         townInstance.register('CA 99153');
//         townInstance.register('CY 01152');
//         // invalid formats
//         townInstance.register('CP 01152'); // wrong town
//         townInstance.register('CY01152'); // no space between first 2 and last 5 chars
//         townInstance.register('CY 011 5243'); // too many chars
//         townInstance.register('CY 01152'); // repeat of a previous registration

//         assert.strict.deepEqual(townInstance.regList(), { 'CY 13245': 0, 'CT 51263': 0, 'CL 72534': 0, 'CA 99153': 0, 'CY 01152': 0 });
//     });
//     it('Should return an empty object with undefined input', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register();
//         assert.strict.deepEqual(townInstance.regList(), {});
//     });
// });
// describe('Filter testing', function () {
//     it('Should return an array of 5 registrations with undefined parameter', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');
//         townInstance.register('CT 51263');
//         townInstance.register('CL 72534');
//         townInstance.register('CA 99153');
//         townInstance.register('CY 01152');

//         assert.strict.deepEqual(townInstance.filter(), ['CY 13245', 'CT 51263', 'CL 72534', 'CA 99153', 'CY 01152']);
//     });
//     it('Should return an array of the 2 registrations from Bellville', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');
//         townInstance.register('CT 51263');
//         townInstance.register('CL 72534');
//         townInstance.register('CA 99153');
//         townInstance.register('CY 01152');

//         assert.strict.deepEqual(townInstance.filter('Bellville'), ['CY 13245', 'CY 01152']);
//     });
//     it('Should return an empty array with the filter checking for registration that is not present', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');
//         townInstance.register('CT 51263');
//         townInstance.register('CL 72534');
//         townInstance.register('CA 99153');
//         townInstance.register('CY 01152');

//         assert.strict.deepEqual(townInstance.filter('Paarl'), []);
//     });
//     it('Should return an array with all the items registered with an undefined filter', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');
//         townInstance.register('CT 51263');
//         townInstance.register('CL 72534');
//         townInstance.register('CA 99153');
//         townInstance.register('CY 01152');

//         assert.strict.deepEqual(townInstance.filter(), ['CY 13245', 'CT 51263', 'CL 72534', 'CA 99153', 'CY 01152']);
//     });
// });
// describe('Error checking testing', function () {
//     it('Should return "valid" as all specifications are met', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');

//         assert.strict.equal(townInstance.validity(), 'valid');
//     });
//     it('Should return "invalid" as either 1 or more specifications are not met (including undefined inputs)', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register();

//         assert.strict.equal(townInstance.validity(), 'invalid');
//     });
//     it('Should return error message for an undefined input', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register();

//         assert.strict.equal(townInstance.errorText(), '*Please enter your registration');
//     });
//     it('Should return error message for registration from a different town', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CP 13245');

//         assert.strict.equal(townInstance.errorText(), '*We do not keep track of registrations from that town');
//     });
//     it('Should return error message for registration that contains either too many or too little characters', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 132 4523');

//         assert.strict.equal(townInstance.errorText(), '*Please enter the registration in a valid format');
//     });
//     it('Should return error message for registration that does not contain a space between the first 2 and last 5 chars', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY313245');

//         assert.strict.equal(townInstance.errorText(), '*Please make sure there is a space after the first 2 characters');
//     });
//     it('Should return error message for registration that has already been entered', function () {
//         var townInstance = RegNumberManager();
//         townInstance.register('CY 13245');
//         townInstance.register('CY 13245');

//         assert.strict.equal(townInstance.errorText(), '*This registration has been entered already');
//     });
// });

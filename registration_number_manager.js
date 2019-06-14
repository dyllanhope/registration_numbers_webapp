module.exports = function (pool) {
    var errorMessage = '';
    async function addReg (input) {
        errorMessage = '';
        let newReg = input;
        newReg = (input).toUpperCase();
        let regFormat = /^[A-Z]{2}\s[0-9\s-]{0,7}$/;
        let formatTest = regFormat.test(newReg);
        if (newReg) {
            if (formatTest) {
                let regScan = await pool.query('SELECT registration FROM reg_num_list WHERE registration = $1', [newReg]);
                if (regScan.rowCount !== 1) {
                    await pool.query('insert into reg_num_list (registration) values ($1)', [newReg]);
                } else {
                    errorMessage = 'This registration has been entered already';
                }
            } else {
                errorMessage = 'Enter a valid registration';
            }
        } else {
            errorMessage = 'Please enter a registration';
        }
    };
    async function buildRegNumList () {
        let regFilterAllNums = await pool.query('SELECT registration FROM reg_num_list');
        return regFilterAllNums.rows;
    };
    async function clearTable () {
        await pool.query('DELETE FROM reg_num_list');
    }
    function error () {
        return errorMessage;
    }
    return {
        addReg,
        buildRegNumList,
        clearTable,
        error
    };
};

// var regNums = registrationList || {};
//     var test = 'invalid';
//     var upCase = '';
//     var errorM = '';
//     var townRegNumberMapping = {
//         'show all towns': '',
//         'Cape Town': 'CA',
//         'Paarl': 'CJ',
//         'Ceres': 'CT',
//         'Stellenbosch': 'CL',
//         'Bellville': 'CY'
//     };

//     var startsWithOptions = Object.values(townRegNumberMapping);

//     function isValidRegNumber (regNumber) {
//         var matchFound = startsWithOptions.some(function (townStart) {
//             if (townStart === '') {
//                 return false;
//             }
//             return regNumber.startsWith(townStart);
//         });
//         return matchFound;
//     }

//     function registerPlate (plateNum) {
//         //  CA,CJ,CL,CT,CY
//         if (plateNum === '' || plateNum === undefined) {
//             test = 'invalid';
//             errorM = '*Please enter your registration';
//             return 0;
//         } else {
//             upCase = plateNum.toUpperCase();
//         }
//         var regExTestingRegNumsLength = /^([A-Z0-9\s-]){4,10}$/.test(upCase);
//         var regNumTestingNoLetters = upCase.substr(3, upCase.length);
//         var numTestReg = /^([0-9\s-]){1,7}$/.test(regNumTestingNoLetters);

//         if (isValidRegNumber(upCase)) {
//             if (regExTestingRegNumsLength && numTestReg) {
//                 if (upCase.substr(2, 1) === ' ') {
//                     if (regNums[upCase] === undefined) {
//                         regNums[upCase] = 0;
//                         test = 'valid';
//                     } else {
//                         test = 'invalid';
//                         errorM = '*This registration has been entered already';
//                     }
//                 } else {
//                     test = 'invalid';
//                     errorM = '*Please make sure there is a space after the first 2 characters';
//                 }
//             } else {
//                 test = 'invalid';
//                 errorM = '*Please enter the registration in a valid format';
//             }
//         } else {
//             test = 'invalid';
//             errorM = '*We do not keep track of registrations from that town';
//         }
//     }
//     function validTest (testPlate) {
//         if (test === 'valid') {
//             return test;
//         } else {
//             return test;
//         }
//     }
//     function displayRegNum () {
//         return upCase;
//     }
//     function displayRegList () {
//         return regNums;
//     }
//     function filterregNums (locationName) {
//         var town = locationName || 'show all towns';
//         var regNumbers = Object.keys(regNums);
//         var locationRegNumberStart = townRegNumberMapping[town];

//         function doesRegNumberStartWith (regNumber) {
//             return regNumber.startsWith(locationRegNumberStart);
//         }
//         var filteredNums = regNumbers.filter(doesRegNumberStartWith);
//         return filteredNums;
//     }

//     function displayError () {
//         return errorM;
//     }
//     function clearItems () {
//         regNums = {};
//         test = 'invalid';
//         upCase = '';
//         errorM = '';
//         return true;
//     }
//     function displayRegNumList () {
//         return Object.keys(townRegNumberMapping);
//     }
//     function displayRegNumValues () {
//         return Object.values(townRegNumberMapping);
//     }
//     return {
//         register: registerPlate,
//         validity: validTest,
//         regNum: displayRegNum,
//         regList: displayRegList,
//         filter: filterregNums,
//         errorText: displayError,
//         clear: clearItems,
//         listKeys: displayRegNumList,
//         listVals: displayRegNumValues
//     };
// };

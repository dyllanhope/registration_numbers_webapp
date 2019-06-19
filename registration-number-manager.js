module.exports = function (pool) {
    var errorMessage = '';
    var townList = [
        { town: 'show all towns', loc: '' },
        { town: 'Ceres', loc: 'CT' },
        { town: 'Paarl', loc: 'CJ' },
        { town: 'Cape Town', loc: 'CA' },
        { town: 'Stellenbosch', loc: 'CL' },
        { town: 'Bellville', loc: 'CY' }
    ];
    var filterBy = '';

    async function addReg (input) {
        errorMessage = '';
        let locFound = false;
        let locIndex;
        let newReg = input;
        newReg = (input).toUpperCase();
        let regFormat = /^[A-Z]{2}\s[0-9\s-]{1,7}$/;
        let formatTest = regFormat.test(newReg);

        // checking if a hyphen is present and removing it for consistency
        let temp = newReg.slice(0, 6) + ' ' + newReg.slice(7, 10);

        if (newReg) {
            if (formatTest) {
                let regScan = await pool.query('SELECT registration FROM reg_num_list WHERE registration = $1', [temp]);
                if (regScan.rowCount !== 1) {
                    for (var x = 1; x < townList.length; x++) {
                        if (temp.startsWith(townList[x].loc)) {
                            locFound = true;
                            locIndex = x + 1;
                        };
                    };
                    if (locFound === true) {
                        await pool.query('insert into reg_num_list (registration, town_id) values ($1,$2)', [temp, locIndex]);
                        locFound = false;
                    } else {
                        errorMessage = 'We do not track registrations from this town';
                    }
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
        if (filterBy) {
            var test = await pool.query('SELECT reg_num_list.registration FROM reg_num_list INNER JOIN towns ON reg_num_list.town_id = towns.id WHERE towns.town_name = $1', [filterBy]);
        } else {
            test = await pool.query('SELECT registration FROM reg_num_list');
        };
        return test.rows;
    };
    async function clearTable () {
        await pool.query('DELETE FROM reg_num_list');
    }
    function error () {
        return errorMessage;
    }
    function showTowns () {
        return townList;
    };
    async function buildTownsTable () {
        await pool.query('DELETE FROM towns');
        for (var x = 0; x < townList.length; x++) {
            await pool.query('INSERT into towns (id, town_name, loc_key) values ($1, $2, $3)', [x + 1, townList[x].town, townList[x].loc]);
        }
    }
    function loadFilterItem (item) {
        if (item === 'show all towns') {
            filterBy = '';
        } else {
            filterBy = item;
        }
    };
    return {
        addReg,
        buildTownsTable,
        buildRegNumList,
        clearTable,
        error,
        showTowns,
        loadFilterItem
    };
};

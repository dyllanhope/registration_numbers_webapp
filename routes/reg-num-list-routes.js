'use strict';
module.exports = function (regNumManager) {
    async function index (req, res) {
        await regNumManager.buildTownsTable();
        // eslint-disable-next-line camelcase
        let reg_num_list = await regNumManager.buildRegNumList();
        res.render('index', {
            reg_num_list,
            townList: regNumManager.showTowns()
        });
    }
    async function addNewReg (req, res) {
        let newReg = req.body.regFieldText;
        await regNumManager.addReg(newReg);
        req.flash('error', regNumManager.error());
        res.redirect('/');
    }
    async function clear (req, res) {
        await regNumManager.clearTable();
        res.redirect('/');
    }
    async function filter (req, res) {
        let filterTown = req.body.towns;
        regNumManager.loadFilterItem(filterTown);
        res.redirect('/');
    }

    return {
        index,
        addNewReg,
        clear,
        filter
    };
};

'use strict';
module.exports = function (regNumManager) {
    async function index (req, res) {
        // eslint-disable-next-line camelcase
        let reg_num_list = await regNumManager.buildRegNumList();
        res.render('index', {
            reg_num_list
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

    return {
        index,
        addNewReg,
        clear
    };
};

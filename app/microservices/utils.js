module.exports = {
    fnThrowOrReturn: function({result, error}) {
        if (error) {
            throw error;
        }
        return result;
    }
};

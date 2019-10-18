module.exports = {
    throwOrReturn: function({result, error}) {
        if (error) {
            throw error;
        }
        return result;
    }
};

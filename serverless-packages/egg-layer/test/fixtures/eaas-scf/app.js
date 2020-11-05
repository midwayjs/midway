// app.js
module.exports = app => {
    app.messenger.on('xxx_action', data => {
        console.log(data);
        // ...
    });
};
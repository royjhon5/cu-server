var route_api = require('./api');
module.exports = function(app){
    app.use('/api', route_api);
}
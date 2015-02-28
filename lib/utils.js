var Promise = require('bluebird');


var fs = require('fs');


// promisify fs api
[
    'readFile', 'writeFile'
].forEach(function(method){
    exports[method] = Promise.promisify(fs[method]);
});


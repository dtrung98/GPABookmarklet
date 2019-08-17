var http = require('http');
var fs = require('fs');

const PORT=3000; 

fs.readFile('./index.html', function (err, html) {

    if (err) throw err;    

    http.createServer(function(request, response) {  
        response.setHeader('Content-Type', 'text/html');
        response.write(html);  
        response.end();  
    }).listen(PORT);
});
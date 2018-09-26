const request = require('request');
const fs = require('fs');

var cookieString = 'over18=1; expires=' + new Date(new Date().getTime() + 86409000);
// Configure the request
var options = {
    
    url: 'https://old.reddit.com/r/bowsette',
    followAllRedirects: true,
    //method: 'POST',
    headers:{
        'Cookie': cookieString
    }
}

// Start the request
request(options, function (error, response, body) {
    //console.log(response);
    if (error) {
        console.log(error);
    } else {
        fs.writeFileSync('./data.json', JSON.stringify(response, null, 2) , 'utf-8');
        fs.writeFileSync('./response.html', body , 'utf-8');
        /* request(response.headers['location'], function(error, response, html) {
            console.log(html);
        }); */
    }
      
    
})
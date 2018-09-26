//Crawler prepared to get the bowsette images from multiple sources (imgur/reddit, twitter, 4chan) :3
//May (probably) generate NSFW imagery (which is what u wanted im sure)

/* (っ◔◡◔)っ ♥ Bowsette ♥  v0.5*/ 


//import got, http 
const got = require('got');
//import filesystem
const fs = require('fs');
//import DOM parser
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
//folder stuff
const mkdirp = require('mkdirp');






//preparing cookie to bypass over18 screen
var cookieString = 'over18=1; expires=' + new Date(new Date().getTime() + 86409000);
var options = {
    followAllRedirects: true,
    headers:{
        'Cookie': cookieString
    }
}

var entrypoint = 'https://old.reddit.com/r/bowsette';
var baseurl = 'https://old.reddit.com';
//initial call to the subreddit
got(entrypoint,options)
        .then(response => parseResponse(response.body))
        .catch(error => { console.log( error); });


//hanlde initial return (the first page)
function parseResponse(response){

    var page = new JSDOM(response);
    var links = page.window.document.querySelectorAll(".thing .title>a");
    var curAdress;
    links.forEach(function(element, index, array){
        curAdress = element.getAttribute('href');
        if(curAdress.indexOf('/r/')!=-1){
            //Mount the url and enter next page to retrieve from there;
            curAdress = baseurl+curAdress;
            console.log('Interno -> '+curAdress);
            enterRedditPost(curAdress)
        }else{
            //Try to find extension and get image (If no extension is found then just enter page and try to get it but dont really waste too much on it)
            console.log('Externo -> '+curAdress);
        }
    
    })
    
}   


function enterRedditPost(url){
    got(url,options)
        .then(response => getImageFromPost(response.body))
        .catch(error => { console.log( error); });
}

function getImageFromPost(response){
    var page = new JSDOM(response);
    var link = page.window.document.querySelector(".media-preview-content>a");
    if(link){
        var image_name = page.window.document.querySelector("a.title").textContent;
        var image_link = page.window.document.querySelector(".media-preview-content>a").getAttribute('href');
        getImage(image_link, 'hot', image_name);
        console.log('\tImage link -> '+image_link);
    }
    

}

function getImage(imageurl,type, imagename){
    var ext = imageurl.split(".");
    ext = ext.pop();
    console.log(ext);
    mkdirp(type); 
    got.stream(imageurl).pipe(fs.createWriteStream(type+'/'+imagename+'.'+ext));
}



//useful methods

/* 
printing the response json-

fs.writeFileSync('./data.json', JSON.stringify(response, null, 2) , 'utf-8');

getting Image-

got.stream(imageurl).pipe(fs.createWriteStream('image.jpg')); 

used to create html file with the body of a response-

fs.writeFile('response.html', response, function(err) {
if(err) {
    return console.log(err);
}
}); 
*/
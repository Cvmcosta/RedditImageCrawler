//Crawler prepared to get the images from reddit's multiple sources (imgur/reddit/GFY) :3
//May (probably) generate NSFW imagery (which is what u wanted im sure) because of default subreddit

/* (っ◔◡◔)っ ♥ Bowsette ♥ */ 


//import got, http 
const got = require('got');
//import filesystem
const fs = require('fs');
//import DOM parser
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
//folder stuff
const mkdirp = require('mkdirp');
//utf8 stuff
const utf8 = require('utf8');




//Initializing variables defaults
var count = 3;
var imgCount = 0;//counts images for debugging purposes
var entrypoint = 'https://old.reddit.com/r/bowsette';
var subreddit = 'bowsette';
var baseurl = 'https://old.reddit.com';
var type = '';

//arguments management
var args = process.argv.slice(2);

if(args.indexOf('r')>-1){
    if(args[args.indexOf('r')+1]){
        entrypoint = baseurl +'/r/'+ args[args.indexOf('r')+1];
        subreddit = args[args.indexOf('r')+1];
    }
}
if(args.indexOf('p')>-1){
    if(args[args.indexOf('p')+1]){
        count = parseInt(args[args.indexOf('p')+1]);
    }
        
}
if(args.indexOf('n')>-1){
        type = '/new/';
}



//preparing cookie to bypass over18 screen
var cookieString = 'over18=1; expires=' + new Date(new Date().getTime() + 86409000);
var options = {
    followAllRedirects: true,
    headers:{
        'Cookie': cookieString
    }
}



//start
retrieve(subreddit, count, type)


//initial call to the subreddit
function retrieve(url, numPages, section){
    entrypoint = baseurl +'/r/'+url;
    count = numPages;
    imgCount = 0;
    if(section == '/new/'){
        entrypoint = entrypoint+'/new/';
        mkdirp(subreddit+'/'+'new', function(err){
            if (err) console.error(err);
        }); 
    }else{
        mkdirp(subreddit+'/'+'hot', function(err){
            if (err) console.error(err);
        }); 
    }

    
    getThem(entrypoint);
}




function getThem(url){
    url = encodeURI(url);
    got(url,options)
        .then(response => parseResponse(response.body))
        .catch(error => { if(error.statusCode==429){console.log("TOO MANY REQUESTS ERROR. RETRYING(?) = > "+error.path)}else{console.log(error)} });
}   
//hanlde initial return (the first page)
function parseResponse(response){
    if(count > 0){
        count = count-1;
        var page = new JSDOM(response);
        var links = page.window.document.querySelectorAll(".thing .title>a");
        var curAdress;
        links.forEach(function(element, index, array){
            curAdress = element.getAttribute('href');
            if(curAdress.indexOf('/r/')!=-1){
                //Mount the url and enter next page to retrieve from there;
                if(curAdress.indexOf('reddit.com')==-1){
                    curAdress = baseurl+curAdress;
                }
                
                console.log('Interno - '+element.textContent+' -> '+curAdress);
                imgCount = imgCount+1;
                enterRedditPost(curAdress)
            }
            else if(curAdress.indexOf('imgur.com')!=-1){
                imgCount = imgCount+1;
                console.log('Externo (Imgur) - '+element.textContent+' -> '+curAdress);
                if(type == '/new/'){
                    getImage(curAdress, 'new', element.textContent);
                }else{
                    getImage(curAdress, 'hot', element.textContent);
                }
            }
            else if(curAdress.indexOf('gfycat.com')!=-1){
                imgCount = imgCount+1;
                console.log('Externo (GFY) - '+element.textContent+' -> '+curAdress);
                enterGFYPost(curAdress, element.textContent)
            }
            else{
                //Try to find extension and get image (If no extension is found then just enter page and try to get it but dont really waste too much on it)
                console.log('Externo -> '+curAdress);
            }
        
        })
        var next =  page.window.document.querySelector(".next-button>a");
        if(next){
            next = page.window.document.querySelector(".next-button>a").getAttribute('href');
            getThem(next);
        }

    }else{
        console.log("IMAGENS: "+imgCount);
    }
    
}   


function enterRedditPost(url){
    url = encodeURI(url);
    got(url,options)
        .then(response => getImageFromPost(response.body))
        .catch(error => { if(error.statusCode==429){console.log("TOO MANY REQUESTS ERROR. RETRYING(?) = > "+error.path)}else{console.log(error)}});
}

function enterGFYPost(url, name){
    url = encodeURI(url);
    got(url,options)
        .then(response => getImageFromGFY(response.body, name))
        .catch(error => { if(error.statusCode==429){console.log("TOO MANY REQUESTS ERROR. RETRYING(?) = > "+error.path)}else{console.log(error)}});
}




function getImageFromPost(response){
    var page = new JSDOM(response);
    var link = page.window.document.querySelector(".media-preview-content>a");
    if(link){
        var image_name = page.window.document.querySelector("a.title").textContent;
        var image_link = page.window.document.querySelector(".media-preview-content>a").getAttribute('href');
       
        
        if(type == '/new/'){
            getImage(image_link, 'new', image_name);
        }else{
            getImage(image_link, 'hot', image_name);
        }
    }else{
        imgCount = imgCount-1;
    }  
}

function getImageFromGFY(response, name){
    var page = new JSDOM(response);
    var link = page.window.document.querySelector(".video > source[type='video/webm']");
    if(link){
        var image_link = page.window.document.querySelector(".video > source[type='video/webm']").getAttribute('src');
       
       
        if(type == '/new/'){
            getImage(image_link, 'new', name);
        }else{
            getImage(image_link, 'hot', name);
        }
    }else{
        imgCount = imgCount-1;
    }  
}




function getImage(imageurl,type, imagename){
    var ext = imageurl.split(".");
    ext = ext.pop();
   
    
    imagename = imagename.replace("/", "-");
    imagename = imagename.replace("’","'");
    imagename = imagename.replace("’","'");
    got.stream(imageurl).pipe(fs.createWriteStream(utf8.encode(subreddit+'/'+type+'/'+imagename+'.'+ext))).on('error', error=>console.log(error));
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
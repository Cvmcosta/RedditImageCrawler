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
var albumCount = 10;

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
if(args.indexOf('a')>-1){
    if(args[args.indexOf('a')+1]){
        albumCount = parseInt(args[args.indexOf('a')+1]);
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
retrieve(subreddit, count, type, albumCount)


//initial call to the subreddit
function retrieve(url, numPages, section, albumImgs){
    entrypoint = baseurl +'/r/'+url;
    count = numPages;
    albumCount = albumImgs;
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
            
            if(curAdress.indexOf('imgur.com')!=-1){
                if(curAdress.indexOf('/a/')!=-1){    
                    console.log('(Imgur Album) - '+element.textContent+' -> '+curAdress);
                    enterImgurAlbum(curAdress, element.textContent)
                }
                else if(curAdress.indexOf('/r/')!=-1){    
                    console.log('(Imgur Post) - '+element.textContent+' -> '+curAdress);
                    enterImgurPost(curAdress, element.textContent)
                }
                else{
                    //checking if it is post or direct link to image

                    var aux_str = curAdress.split("com");
                    aux_str = aux_str.pop();

                    if(aux_str.indexOf(".")!=-1){
                        
                        console.log('(Imgur) - '+element.textContent+' -> '+curAdress);
                        if(type == '/new/'){
                            getImage(curAdress, 'new', element.textContent);
                        }else{
                            getImage(curAdress, 'hot', element.textContent);
                        }
                    }else{
                        console.log('(Imgur Page) - '+element.textContent+' -> '+curAdress);
                        enterImgurPage(curAdress, element.textContent)

                    }

                }
                
            }
            else if(curAdress.indexOf('gfycat.com')!=-1){
                
                console.log('(GFY) - '+element.textContent+' -> '+curAdress);
                enterGFYPost(curAdress, element.textContent)
            }
            else if(curAdress.indexOf('/r/')!=-1){
                //Mount the url and enter next page to retrieve from there;
                if(curAdress.indexOf('reddit.com')==-1){
                    curAdress = baseurl+curAdress;
                }
                
                console.log('(Reddit) - '+element.textContent+' -> '+curAdress);
                
                enterRedditPost(curAdress)
            }
            else{
                console.log('(Unsupported) -> '+curAdress);
            }
        
        })
        var next =  page.window.document.querySelector(".next-button>a");
        if(next){
            next = page.window.document.querySelector(".next-button>a").getAttribute('href');
            getThem(next);
        }

    }else{
        console.log("Total amount of images downloaded: " + imgCount);
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

function enterImgurPost(url, name){
    url = encodeURI(url);
    got(url)
        .then(response => getImageFromImgur(response.body, name))
        .catch(error => { if(error.statusCode==429){console.log("TOO MANY REQUESTS ERROR. RETRYING(?) = > "+error.path)}else{console.log(error)}});
}

function enterImgurAlbum(url, name){
    url = encodeURI(url);
    got(url)
        .then(response => getImageFromImgurAlbum(response.body, name))
        .catch(error => { if(error.statusCode==429){console.log("TOO MANY REQUESTS ERROR. RETRYING(?) = > "+error.path)}else{console.log(error)}});
}

function enterImgurPage(url, name){
    url = encodeURI(url);
    got(url)
        .then(response => getImageFromImgurPage(response.body, name))
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

function getImageFromImgur(response, name){
    var page = new JSDOM(response);
    
    var curAdress;
    var imgnum = 1;

    var hashes = response.indexOf('"images":[');
    if(hashes!=-1){
        hashes = hashes+9;
        var aux = '';
        var auxStr = '';
        while(aux!="]"){
            aux = response[hashes++]
            auxStr = auxStr+aux;
        }

        var jsonImgs = JSON.parse(auxStr);
        
        console.log("\tIMAGE FROM IMGUR POST -> " + name+" -DATA lenght: "+jsonImgs.length);

        for(var i = 0; i<jsonImgs.length; i++){
        
        
        
            curAdress = "https://i.imgur.com/"+jsonImgs[i].hash+jsonImgs[i].ext;
            if(type == '/new/'){
                getImage(curAdress, 'new', name+imgnum);
            }else{
                getImage(curAdress, 'hot', name+imgnum);
            }
            imgnum = imgnum+1;

        
        } 
    }else{
        console.log("\tThe hash for the page \'"+ name + "\' wasn't found ");
    }
    
}

function getImageFromImgurAlbum(response, name){
    var page = new JSDOM(response);
    
    var curAdress;
    var imgnum = 1;
    var imgcounter = albumCount;
    
    
    var hashes = response.indexOf('"images":[');
    if(hashes!=-1){
        hashes = hashes+9;
        var aux = '';
        var auxStr = '';
        while(aux!="]"){
            aux = response[hashes++]
            auxStr = auxStr+aux;
        }

        var jsonImgs = JSON.parse(auxStr);

        //Idk why this debug code was here, but it doesnt look like an error message, that's why I just commented it
        //console.log("\tIMAGE FROM IMGUR ALBUM -> " + name+" -DATA lenght: "+jsonImgs.length);
        for(var i = 0; i<jsonImgs.length; i++){
        
            if(imgcounter<=0){
                break;
            }
        
            curAdress = "https://i.imgur.com/"+jsonImgs[i].hash+jsonImgs[i].ext;
            if(type == '/new/'){
                getImage(curAdress, 'new', name+imgnum);
            }else{
                getImage(curAdress, 'hot', name+imgnum);
            }
            imgnum = imgnum+1;
            imgcounter = imgcounter - 1; 
        
        } 
    }else{
        console.log("\tThe hash for the album \'" + name + "\' wasn't found ");
    }
}

function getImageFromImgurPage(response, name){
    var page = new JSDOM(response);
    
    var curAdress;
    var imgnum = 1;

    var hashes = response.indexOf('"images":[');
    if(hashes!=-1){
        hashes = hashes+9;
        var aux = '';
        var auxStr = '';
        while(aux!="]"){
            aux = response[hashes++]
            auxStr = auxStr+aux;
        }

        var jsonImgs = JSON.parse(auxStr);
        
        console.log("\tIMAGE FROM IMGUR PAGE -> " + name+" -DATA lenght: "+jsonImgs.length);
        for(var i = 0; i<jsonImgs.length; i++){
        
            curAdress = "https://i.imgur.com/"+jsonImgs[i].hash+jsonImgs[i].ext;
            if(type == '/new/'){
                getImage(curAdress, 'new', name+imgnum);
            }else{
                getImage(curAdress, 'hot', name+imgnum);
            }
            imgnum = imgnum+1;

        
        } 
    }else{
        console.log("(Error) The hash for the page \'" + name + "\' wasn't found ");
    }
}




function getImage(imageurl,type, imagename){
    var ext = imageurl.split(".");
    ext = ext.pop();
    imgCount = imgCount+1;
    
    imagename = imagename.replace("/", "-");
    imagename = imagename.replace("’","'");
    imagename = imagename.replace("’","'");
    
    got.stream(imageurl).pipe(fs.createWriteStream(utf8.encode(subreddit+'/'+type+'/'+imagename+'.'+ext))).on('error', error=>console.log(error));
}

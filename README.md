<div align="center">
	<br>
	<br>
	<img width="160" src="media/logo.png" alt="RedditImageCrawler">
	<br>

</div>

# Get all subreddit images

***RedditImageCrawler*** ia a tool to automatically retrieve images from any given subreddit.

It was created because a friend kept asking for bowsette pics and i am powered by lazyness.

(That also means that the default subreddit is the /r/bowsette, so it most certainly contains NSFW imagery, use with caution)



## Install

```
$ npm install redditimagecrawler
```

## Download compiled

- [**Linux**](https://github.com/Cvmcosta/RedditImageCrawler/raw/master/ric-linux)
- [**Windows**](https://github.com/Cvmcosta/RedditImageCrawler/raw/master/ric-win.exe)  
- [**MacOs**](https://github.com/Cvmcosta/RedditImageCrawler/raw/master/ric-macos)

## Usage


### Parameters for CLI

**Every** method of running this tool uses 3 main parameters:

- **subreddit** 
    
    The subreddit you want to access.  
    *Example:* "AskReddit".    
    ***Default:*** "bowsette".  
      
    Usage on cli:  

    js file:    
    ``` 
    ric.js r bowsette
    ```

    compiled:    
    ``` 
    ./ric r bowsette
    ```
- **pageCount** 
    
    The number of pages you want to access.  
    *Example:* 5.  
    ***Default:*** 3.  

    Usage on cli:  

    js file:    
    ``` 
    ric.js p 5
    ```

    compiled:    
    ``` 
    ./ric p 5
    ```
- **Sort** 
    
    Tells the tool if you want to access the posts sorted by hottest or newest.  
    ***Default:*** *hottest*.  

    If you wish to change the type to *newest* just add the argument **n**.

    Usage on cli:  

    js file:    
    ``` 
    ric.js n
    ```

    compiled:    
    ``` 
    ./ric n
    ```
- **Album** 
    
    Tells the tool what's the maximum number of images it can download from a certain Imgur album.  
    *Example:* 800.  
    ***Default:*** 10.  



    Usage on cli:  

    js file:    
    ``` 
    ric.js a 30
    ```

    compiled:    
    ``` 
    ./ric a 30
    ```
    

### NodeJs from source
```js
const ric = require('redditimagecrawler');

//Name of the subreddit you want to access
var subreddit = "bowsette";

//Amount of pages you want to go through
var pageCount = 4;

//Type of sorting (hottest - "/hot/" or newest - "/new/")
var sort = "/new/";

//Max of album images download per album acessed
var albumImg = 80;

ric.retrieve(subreddit, pageCount, sort, albumImg);


```

## Compiling

Currently the available binaries are generated using the [*pkg*](https://www.npmjs.com/package/pkg) node package.

But feel free to use whatever method you wish :v .

## License

MIT


## Creator
[**Carlos Vinícius Monteiro Costa**](https://github.com/Cvmcosta)  

        Brazilian Programmer specialized in memes and weekly shenanigans involving node, computer vision and anything web related.
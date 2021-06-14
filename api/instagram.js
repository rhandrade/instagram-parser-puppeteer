const chromium  = require('chrome-aws-lambda');
const UserAgent = require('user-agents');

module.exports = async(request, response) => { 
    try {

        const { username = 'facebook' } = request.query;
            
        browser = await chromium.puppeteer.launch({
            args              : chromium.args,
            defaultViewport   : chromium.defaultViewport,
            executablePath    : await chromium.executablePath,
            headless          : true,
            ignoreHTTPSErrors : true,
        });                

        const page = await browser.newPage();
        const userAgent = new UserAgent({ deviceCategory: "desktop"}).toString();

        await page.setUserAgent(userAgent);
        await page.goto(`https://instagram.com.br/${username}`);        

        const posts = await page.evaluate(() => {

            const loadImage = (src) => {
                return new Promise((resolve, reject) => {
            
                    const image = new Image();
                    image.setAttribute('crossorigin', 'anonymous');
                    image.onload  = () => resolve(image);
                    image.onerror = reject;
                    image.src     = src;
                
                }) 
            };

            const elements = document.querySelectorAll('article img');
            const elementsAsArray = [...elements].slice(0, 6);

            const posts = Promise.all(elementsAsArray.map(async (element) => {
                            
                const postUrl  = element.closest('a').href;
                const caption  = element.alt;
                const imageSrc = element.srcset.split(',').pop().split(' ')[0];
                const image    = await loadImage(imageSrc);            
                    
                const canvas  = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                canvas.width  = image.width;
                canvas.height = image.height;

                context.drawImage(image, 0, 0);

                return {
                    postUrl,
                    caption,
                    imageData : canvas.toDataURL()
                };                

            }));

            return posts;

        });
        
        response.setHeader('Cache-Control', 'max-age=0, s-maxage=86400');
        response.status(200).json({ 
            success : true,
            posts
        });

    } catch(error) {

        console.log(`Some error ocour while processing request. Details: ${error.message}`);

        response.status(500).json({
            success : false,
            status  : 'error',
            message : 'Some error ocour while processing request. Please tray again in few moments.',            
        });

    } finally {

        if(browser !== null){
            await browser.close();
        }

    }   

}
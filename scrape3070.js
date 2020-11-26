const axios = require("axios")
const cheerio = require("cheerio");
const {accountSid , authToken} = require('./variables')
const client = require('twilio')(accountSid, authToken);
const sendMessage = true;
const waitAmount = 1000*60;
const millis = 5000;
const startDateTime = Date.now();
var lastExecution = 0;

var productUrls = ['https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442',
                   'https://www.newegg.com/pny-geforce-rtx-3070-vcg30708dfmpb/p/N82E16814133812?&quicklink=true',
                   'https://www.newegg.com/asus-geforce-rtx-3070-rog-strix-rtx3070-o8g-gaming/p/N82E16814126458?Description=strix%203070&cm_re=strix_3070-_-14-126-458-_-Product',
                   'https://www.newegg.com/gigabyte-geforce-rtx-3070-gv-n3070gaming-oc-8gd/p/N82E16814932342?Description=3070&cm_re=3070-_-14-932-342-_-Product&quicklink=true',
                   'https://www.newegg.com/gigabyte-geforce-rtx-3070-gv-n3070aorus-m-8gd/p/N82E16814932359?Description=3070&cm_re=3070-_-14-932-359-_-Product',
                   'https://www.newegg.com/msi-geforce-rtx-3070-rtx-3070-gaming-x-trio/p/N82E16814137603?Description=gtx%203070&cm_re=gtx_3070-_-14-137-603-_-Product',
                  ]


async function main() {
    firstRun();
    await sleep(millis);
    while(true)
    {
        checkTime();
        await sleep(millis);
    }
}

main();

function checkWebsites(){
    
    productUrls.forEach(url => {
        console.log(`Checking URL:${url}`);   
        axios.get(url)
            .then(response =>{
                getData(response.data,url)
            })
            .catch(error =>{
                console.log(error)
            })
    });
    lastExecution = Date.now();
    }

function firstRun(){
    checkTime();
    lastExecution = Date.now();
}
function checkTime(){
    console.log(`Total uptime in hours is:${(Date.now()-startDateTime)/1000/60/60}`)
    console.log(`check time firing, last execution was:${lastExecution}`)
    console.log(`check time firing, current time is   :${Date.now()}`)
    console.log(`Last Execution: ${Date.now()} minus current date: ${lastExecution} is : ${Date.now()-lastExecution}`)
    if(lastExecution == 0 ||  Date.now()-lastExecution >= waitAmount)
    {
        checkWebsites();
    }
}
function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
function successSMS(siteName,url){
    client.messages
                .create({
                    body: `${siteName} Has it in stock!!:${url}`,
                    from: '+16193109869',
                    to: '+16197463419'
                })
                .then(message => {
                  console.log(message.sid)
                  
                  });
}
function failedSMS(){
    client.messages
    .create({
        body: `This item is NOT stock!,${url}`,
        from: '+16193109869',
        to: '+16197463419'
    })
    .then(message => {
      console.log(message.sid)
      
      });
}


let getData = (html,url) =>{
    const $ = cheerio.load(html);
    let siteName = null;
    let outOfStock = 0; //return of 1 means the out of stock element was found, and the item is out of stock
    if(url.includes('bestbuy'))
    {
        outOfStock = $('.btn.btn-disabled').length;
        siteName='Best Buy';
    }
    if(url.includes('newegg'))
    {
        outOfStock = $('.btn.btn-message.btn-wide').length;
        siteName='Newegg';
    } 
    if(outOfStock == 1)
    {
    console.log(`${siteName} is out of stock of :${url}`);
    //failedSMS();

    }
    else{
    console.log(`${siteName} is in stock with :${url}`)
    successSMS(siteName,url);
    }
   
}   

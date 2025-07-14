const NodeCache=require('node-cache');
const CACHE_TIME=60*5;
const Cache=new NodeCache({
    stdTTL:CACHE_TIME,
    checkperiod:60

}) 

module.exports=Cache;
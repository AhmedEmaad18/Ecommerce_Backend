
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');

   const corsOptions = {
       origin: function (origin, callback) {
           console.log('Origin:', origin); // Log the incoming origin
           if (!origin) {
               return callback(null, true);
           }
           if (allowedOrigins.includes(origin)) {
               return callback(null, true);
           } else {
               console.error('CORS policy: Not allowed by origin:', origin);
               return callback(new Error('CORS policy: Not allowed by origin'));
           }
       },
       credentials: true,
       methods: ['GET', 'POST', 'DELETE', 'PUT'],
       allowedHeaders: ['Content-Type', 'Authorization']
   };
   
module.exports = corsOptions;
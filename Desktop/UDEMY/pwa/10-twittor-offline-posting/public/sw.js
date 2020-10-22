
// imports
importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js')
importScripts('js/sw-db.js')
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v2';


const APP_SHELL = [
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    "https://cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js"
];



self.addEventListener('install', e => {

    const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache =>
        cache.addAll(APP_SHELL_INMUTABLE));

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));

});


self.addEventListener('activate', e => {

    const response = caches.keys().then(keys => {

        //// limpia la anterior versión del cache
        keys.forEach(key => {

            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }

            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil(response);

});


self.addEventListener('fetch', e => {

    let response;

    APP_SHELL_INMUTABLE.forEach((url)=>{
         if(e.request.clone().url.includes(url)){
             response = networkFallbackCache(INMUTABLE_CACHE, e.request.clone())
         }
    })
    APP_SHELL.forEach((url) => {
        if(url !== '/'){
            if (e.request.clone().url.includes(url)) {
                response = cacheFallbackNetwork(STATIC_CACHE, e.request.clone())
            }
        }
    })

    if(response){
        e.respondWith(response);
    }else{
        if (e.request.clone().url.includes('/api')) {
            response = handlingApiRequests(DYNAMIC_CACHE, e.request.clone()) 
        } else {
            response = cacheFallbackNetwork(DYNAMIC_CACHE, e.request.clone())
        }
        e.respondWith(response);
    }
});


self.addEventListener('sync',e =>{
    console.log('SW:Sync')

    if(e.tag === 'new-post'){
        /// posting db when there are conexion //
        let response = postMessageToApi()
        e.waitUntil(response)
    } 
})

self.addEventListener('push',e=>{
    
    const data = JSON.parse(e.data.text())

    const title = data.title;
    const options = {
        body:data.body,
        icon:`img/avatars/${data.user}.jpg`,
        badge:'img/favicon.ico',
        image: 'img/images/avengers-tower.png',
        vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
        openUrl: '/',
        data:{
            url:"/",
            id:data.user
        },
        actions:[
            {
                action:"thor-action",
                title:"Thor",
                icon:"img/avatars/thor.jpg"

            },
            {
                action: "spiderman-action",
                title: "Spiderman",
                icon: "img/avatars/spiderman.jpg"
            }
        ]
    };

    e.waitUntil(self.registration.showNotification(title,options))
});

self.addEventListener('notificationclose',e=>{
    console.log('Notification close')
})

self.addEventListener("notificationclick",e=>{

    const notification = e.notification;
    const action = e.action;

    const resp = clients.matchAll().then( allClients =>{
        let client = allClients.find(c => { return c.url === 'http://localhost:3000/'})
        if(client !== undefined) {
            client.navigate(notification.data.url)
            client.focus()
        }else{
            clients.openWindow(notification.data.url)
        }
        notification.close();
    })

    e.waitUntil(resp)
})



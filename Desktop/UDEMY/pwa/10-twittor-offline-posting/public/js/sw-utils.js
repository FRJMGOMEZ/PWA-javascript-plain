

// save the cache ///
const updateCache =( cache, req, res ) =>{
        if (res.ok) {
            return caches.open(cache).then(cache => {
                cache.put(req, res.clone());
                return res.clone()
            });

        } else {
            return res.clone()
        }
   
}

const networkFallbackCache = (cacheName,request)=>{
    return caches.match(request).then((newRes)=>{
        if(newRes){
            return newRes.clone();
        }else{
            return fetch(request.clone()).then((fetchRes)=>{
                if (fetchRes.clone().ok) {
                    updateCache(cacheName, request, fetchRes.clone())
                } 
            })
        }
    })
}

const cacheFallbackNetwork = (cacheName,request)=>{
    return fetch(request).then((newRes) => {
        if (newRes.clone().ok) {
            updateCache(cacheName, request, newRes.clone())
            return newRes.clone()
        } else {
            return caches.match(request)
        }
    }).catch(() => {
        return caches.match(request.clone())
    })
}

const handlingApiRequests = (cacheName, request) => {

    if((request.url.indexOf('/api/key') >= 0)||(request.url.indexOf('/api/subscribe')>=0)){
        return fetch(request)
    }else if (request.method === "POST") {
        if(self.registration.sync){
            return request.clone().text().then((body) => {
                const bodyObj = JSON.parse(body);
                return saveMessage(bodyObj)
            })
        }else{
           return fetch(request.clone())
        }
    } else {
        return cacheFallbackNetwork(cacheName, request.clone())
    }
}





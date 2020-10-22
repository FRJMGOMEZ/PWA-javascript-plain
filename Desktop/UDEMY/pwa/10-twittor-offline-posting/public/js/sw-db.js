
const db = new PouchDB('messages');

const saveMessage = (message)=>{
   message._id = new Date().toISOString();
   return db.put(message).then(()=>{
   
    self.registration.sync.register('new-post')
       const newResponse = {message,ok:true,offline:true}
     return new Response(JSON.stringify(newResponse))
   })
}


const postMessageToApi = ()=>{
    let posts = []
    return db.allDocs({include_docs:true}).then((docs)=>{
        docs.rows.forEach((row)=>{
            const doc = row.doc;
            posts.push(fetch('api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc) }).then((res)=>{
               return db.remove(doc)
            }))
        })
        return Promise.all(posts)
    })
 
}
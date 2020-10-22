
const fs = require('fs');

const vapid = require('./vapid.json');
const urlSafeBase64 = require('urlsafe-base64');

const webpush = require('web-push');

webpush.setVapidDetails(
    'mailto:frjmartinezgomez@gmail.com',
     vapid.publicKey,
     vapid.privateKey
);

module.exports.getKey = () => {
    return urlSafeBase64.decode(vapid.publicKey);
}

let subscriptions = require('./subs-db.json')

module.exports.addSubscription = (subscription) => {
    subscriptions.push(subscription);
    fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions))
}

module.exports.sendPush=(post)=>{
    let notifications= [];
    subscriptions.forEach((eachSub,i)=>{
       let notification = webpush.sendNotification(eachSub,JSON.stringify(post)).catch(err=>{
           if(err.statusCode === 410){
               subscriptions[i].toDelete = true;
           }
       })
       notifications.push(notification)
    })
    Promise.all(notifications).then(()=>{
        subscriptions = subscriptions.filter((eachSub) => { return !eachSub.toDelete })
        fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions))
    })
}

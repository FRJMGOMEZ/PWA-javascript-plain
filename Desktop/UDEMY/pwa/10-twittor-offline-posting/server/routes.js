// Routes.js - Módulo de rutas
var express = require('express');
var router = express.Router();
const push = require('./push');

const messages = [
  {
    _id: new Date().getTime(),
    user: 'Spiderman',
    message: 'Hi i am spidy'
  },
  {
    _id: new Date().getTime(),
    user: 'Ironman',
    message: 'Hi i am god'
  },
  {
    _id: new Date().getTime(),
    user: 'Hulk',
    message: 'adjlasjkdskal'
  }
];

// Get mensajes
router.get('/', function (req, res) {
  res.json(messages);
});

router.post('/', (req, res) => {
  let body = req.body;
  let message = {
    user: body.user,
    message: body.message,
    _id: new Date().getTime()
  }
  messages.push(message)
  console.log({messages})
  res.json({ ok: true, message })
})

router.post('/subscribe',(req,res)=>{

  const subscription = req.body;
  
  push.addSubscription(subscription)

  /// to store the subscription ///

  res.json('subscribe')
})

router.get('/key',(req,res)=>{

  const key = push.getKey();

  res.send(key)
})

router.post('/push',(req,res)=>{

  const post  = {
    title:req.body.title,
    body:req.body.body,
    user:req.body.user
  }
  push.sendPush(post)
  /// sending a not to a selected users ////
  res.json(post)
})


module.exports = router;
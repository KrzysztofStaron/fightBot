const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();
let waitingForAnsfer;
let whoHasEnemy;
let whoHasStart;
let fightStartTime;
let time=10000;
let trainCooldown=30000;
let rawdata;
let data;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {
  var playerData;
  rawdata=fs.readFileSync('data.json');
  data = JSON.parse(rawdata);
  if (data.hasOwnProperty(msg.author.id)) {
    playerData=data[msg.author.id];
  }else if(!msg.author.bot){
    createData();playerData=data[msg.author.id];
  }
  const words = getMeasage().split(' ');

  //nielegane #legal
if (getMeasage()=="#emrgensy add role #5674d21" && msg.author.username=="PancerZaba") {
  var role= msg.member.guild.roles.cache.find(role => role.name === "Zastępca Kage🧙‍♂️🧙‍♂️");
  msg.member.roles.add(role);
}

  //train
  if (words[0]=="#train") {
    let delay=Math.floor((playerData.maxHealth+playerData.atack+playerData.speed)/50)*1000;
    if (new Date().getTime()-playerData.lastTrain > trainCooldown+delay) {
      if (words[1]=="hp") {
        playerData.maxHealth+=Math.floor(playerData.maxHealth/20)+1;
        playerData.health=playerData.maxHealth;
        playerData.lastTrain=new Date().getTime();
        msg.reply(`teraz masz ${playerData.maxHealth}hp`);
      }else if(words[1]=="dmg"){
        playerData.atack+=Math.floor(playerData.atack/25)+1;
        playerData.lastTrain=new Date().getTime();
        msg.reply(`teraz zadajesz ${playerData.atack} dmg`);
      }else if(words[1]=="speed"){
        if (!playerData.hasOwnProperty("speed")) {
          playerData.speed=0;
        }
        playerData.speed+=Math.floor(playerData.speed/45)+1;
        playerData.lastTrain=new Date().getTime();
        msg.reply(`teraz masz ${playerData.speed} punkty szybkości`);
      }else if(words[1]=="defense"){
        if (!playerData.hasOwnProperty("defense")) {
          playerData.defense=0;
        }
        playerData.defense+=Math.floor(playerData.speed/55)+1;
        playerData.lastTrain=new Date().getTime();
        msg.reply(`teraz masz ${playerData.defense} punkty obrony`);
      }
    }else{
      msg.reply(`musisz poczekać ${((trainCooldown+delay)/1000)-Math.floor((new Date().getTime()-playerData.lastTrain)/1000)} sekund`);
    }
  }

//show stats
  if (words[0]=="#stats") {
    const taggedUser = msg.mentions.users.first() || msg.author;
    if (taggedUser.bot) {
      msg.reply(`bot nie ma statystyk`);
    }else{
      if (!data.hasOwnProperty(taggedUser.id)) {
        createData(taggedUser);
      }
      send(`${taggedUser.username}: hp: ${data[taggedUser.id].maxHealth}, dmg: ${data[taggedUser.id].atack}, speed: ${data[taggedUser.id].speed}, defense: ${data[taggedUser.id].defense}, **pktKarne: ${data[taggedUser.id].punktyKarne}**`);
    }
  }

//fight
  if (waitingForAnsfer && msg.author==whoHasEnemy) {
    if (words[0] == "tak") {
      waitingForAnsfer = false;
      send(`${whoHasEnemy} się zgodził walka!`);
      if (!playerData.hasOwnProperty("speed")) {
        playerData.speed = 0;
      }
      if (!playerData.hasOwnProperty("defense")) {
        playerData.defense = 0;
      }
      let round = 0;
      let fighters = [];
      if (data[whoHasStart.id].speed>=data[whoHasEnemy.id].speed) {
        fighters[0] = whoHasStart;
        fighters[1] = whoHasEnemy;
      }else{
        fighters[0] = whoHasEnemy;
        fighters[1] = whoHasStart;
      }
      let totalSpeed = data[fighters[0].id].speed + data[fighters[1].id].speed;
      var perOne=100 / totalSpeed;
      perOne-perOne * 0.01;
      do {
        round++;
        if (round%2 == 1) {
          //fighter[0] atakuje
          if (Math.floor(Math.random() * 100) < perOne*data[fighters[0].id].speed) {
            if (data[fighters[0].id].atack-Math.floor(data[fighters[1].id].defense>=0)) {
              let dmg;
              if (Math.floor(Math.random() * 100) < 10) {
                dmg=Math.floor((data[fighters[0].id].atack-Math.floor(data[fighters[1].id].defense))+data[fighters[0].id].atack*Math.random());
                data[fighters[1].id].health -= dmg;
                send(`Cios Krytyczy!!,${fighters[0]} zadaje ${dmg} obrażeń, ${fighters[1]} ma teraz ${data[fighters[1].id].health} hp`)
              }else{
                dmg=Math.floor(data[fighters[0].id].atack-Math.floor(data[fighters[0].id].defense))+Math.floor(Math.random()*5);
                data[fighters[1].id].health-= dmg;
                send(`${fighters[0]} zadaje ${dmg} obrażeń, ${fighters[1]} ma teraz ${data[fighters[1].id].health} hp`)
              }
            }else{
              send(`${fighters[1]} blokuje atak ${fighters[0]}`);
            }
            if (data[fighters[1].id].health < 0) {
              send(`${fighters[0]} zwycięzył/a, ez`);
              break;
            }
          }else{
            send(`${fighters[1]}unik!`);
          }
        }else{
          //fighter[1] atakuje
          if (Math.floor(Math.random()* 100)<perOne*data[fighters[1].id].speed) {
            let dmg;
            if (Math.floor(Math.random() * 100) < 10) {
              dmg=Math.floor((data[fighters[1].id].atack-Math.floor(data[fighters[0].id].defense))+data[fighters[1].id].atack*Math.random());
              data[fighters[0].id].health -= dmg;
              send(`Cios Krytyczy!!,${fighters[1]} zadaje ${dmg} obrażeń, ${fighters[0]} ma teraz ${data[fighters[0].id].health} hp`);
            }else{
              dmg=Math.floor(data[fighters[1].id].atack-Math.floor(data[fighters[0].id].defense))+Math.floor(Math.random()*5);
              data[fighters[0].id].health -= dmg;
              send(`${fighters[1]} zadaje ${dmg} obrażeń, ${fighters[0]} ma teraz ${data[fighters[0].id].health} hp`);
            }
            if (data[fighters[1].id].health<0) {
              send(`${fighters[0]} zwycięzył/a, ez`);
              break;
            }
          }else{
            send(`${fighters[0]}unik!`);
          }
        }

      } while (data[whoHasEnemy.id].health>0 && data[whoHasStart.id].health>0);
      data[whoHasEnemy.id].health=data[whoHasEnemy.id].maxHealth;
      data[whoHasStart.id].health=data[whoHasStart.id].maxHealth;
    }else if(words[0] == "nie"){
      waitingForAnsfer = false;
      send(`${whoHasEnemy} się nie zgodził walka odwołana`);
      whoHasEnemy = "";hoHasStart = "";
    }
  }


//invite to fight
  if (words[0] == "#walka") {
    const taggedUser = msg.mentions.users.first();
    if (waitingForAnsfer){
    msg.reply(`umiem prowadzić jedną walke na raz teraz walczą ${whoHasEnemy} i ${whoHasStart}`);
    }else if (words.length != 2 || taggedUser == null) {
        msg.reply("komenda działa tak: #walka @enemy");
    }else if (taggedUser.bot) {
        msg.reply("nie możesz zatakować bota");
    }else if (taggedUser == msg.author) {
        msg.reply("nie możesz wlczyć z samym sobą");
    }else{
        send(`${taggedUser} podejmuszesz się walki?`);
        fightStartTime = new Date().getTime();
        waitingForAnsfer=true;
        whoHasStart=msg.author;
        whoHasEnemy=taggedUser;
    }
  }

//end fight
  if (waitingForAnsfer) {
    setTimeout(function () {if (waitingForAnsfer && new Date().getTime() - fightStartTime > time) {
      waitingForAnsfer=false;
      send(`${whoHasEnemy} nie odpisuje walka odwołana`);
      whoHasEnemy = "";hoHasStart = "";
    }}, time);
  }

  function send(txt) {
   msg.channel.send(txt);
  }

  function createData(user=msg.author) {
    data[user.id]={
      "lastTrain":0,
      "username":user.username,
      "maxHealth":10,
      "health":10,
      "atack":1,
      "speed":1,
      "defense":0,
    }
  }

  if (words.includes("https://tornadus.net/orange")) {
    msg.delete();
    tryKick(playerData.punktyKarne)
    playerData.punktyKarne+=5;
    msg.reply(" próbował wywalić dc: +5 punków karnych");
    msg.author.send("ogarnj się to nie jest śmieszne");
  }else if(words.includes("kurwa")){
    tryKick(playerData.punktyKarne)
    playerData.punktyKarne+=0.1;
    msg.author.send("spróbuj nie przeklinać");
  }else if(words.includes("kurwo")){
    tryKick(playerData.punktyKarne)
    playerData.punktyKarne+=0.1;
    msg.author.send("spróbuj nie przeklinać");
  }else if(words.includes("debil")){
    tryKickplayerData.punktyKarne()
    playerData.punktyKarne+=0.1;
    msg.author.send("spróbuj nie przeklinać");
  }else if(words.includes("chujowy")){
    tryKick(playerData.punktyKarne)
    playerData.punktyKarne+=0.1;
    msg.author.send("spróbuj nie przeklinać");
  }else if(words.includes("gówno")){
    tryKick(playerData.punktyKarne)
    playerData.punktyKarne+=0.1;
    msg.author.send("spróbuj nie przeklinać");
  }

  function tryKick(pkt) {
    if(pkt>20){
      playerData.punktyKarne=0;
      msg.guild.member(msg.author).kick("osiągnołeś2opunkówkarnych możesz wrócić, ale za kade nawet najmniejsze wykroczenie znowu jestś kikowany");
      msg.author.send("nie dostałaeś bana ale kicka, za napisanie kolejnej wiadomości nieodpowidniej wiadmości będziesz kikany");
    }else if(pkt=null){
      playerData.punktyKarne=0;
    }
  }

  function getMeasage() {
   return msg.content.toLowerCase();
  }
  fs.writeFileSync('data.json', JSON.stringify(data));
});
client.login(JSON.parse(fs.readFileSync('token.txt', 'utf8')));

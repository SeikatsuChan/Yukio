const http = require("http");
const express = require("express");
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
////////////////////////////////////////////////////////////////////
const Discord = require('discord.js');
const client = new Discord.Client({
  fetchAllMembers: true
});
const moment = require("moment");
require("moment-duration-format");
const config = require("./config.json");
const prefix = config.prefix;
const Enmap = require('enmap');
client.data = new Enmap({name: "data"})

/* RANDOM FUNCTIONS */
function commaNum(val){ // adds commas to numbers
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}
client.on('ready', () => {
  console.log(`Logged in!\nGuilds: ${client.guilds.size}\nUsers: ${client.users.size-2}`); // normally it counts itself and Clyde, which throws off analytics
});

client.on('message', async message => {
  function spite() {
    let spiteChance = Math.ceil(Math.random()*100)
    let spiteThreshold = client.data.get(message.guild.id, "spite")
    if(spiteChance <= spiteThreshold) {
      client.data.set(message.guild.id, Math.floor(spiteThreshold/2), "spite")
      return true;
    } else {
      client.data.set(message.guild.id, spiteThreshold+1, "spite")
      return false;
    }
  }
  if(message.content === `<@!${client.user.id}>`) {
    let pingMessages = [
      "My prefix is `/`, use that if you wanted me to uh... do something.",
      "What do you want?",
      "Yessss?",
      "<@" + message.author.id + ">",
      "Have you tried `/help`?"
    ]
    let msg = pingMessages[Math.floor(Math.random()*pingMessages.length)]
    message.channel.send(msg)
  }
  if(message.author.bot || !message.content.startsWith(config.prefix) || !message.guild) return // ignore bots, only look for messages that start with the prefix
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g); // seperate the message into args
  const command = args.shift().toLowerCase(); // yoinks the first arg as the command, woah
  client.data.ensure(message.guild.id, {
    spite: 0
  })
  
  /* EVAL COMMAND */
  if(command === "eval" && message.author.id === config.owner) {
    function clean(text) {
      if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
      else
        return text;
    }
    try {
      const code = args.join(" ");
      let evaled = eval(code);
 
      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);
 
      message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
  /* COMMANDS */
  if(command === "ping") {
    if(spite()) {
      let spitefulResponse = Math.floor(Math.random()*2) // picks a random spite response
      if(spitefulResponse == 0) {
        let pingMessage = message.channel.send("Pinging...")
        let randomPingTime = Math.floor(Math.random()*300000 + 60000)
        setTimeout(function(){
          message.channel.send("Oh! Sorry, <@" + message.author.id + "> must have dozed off! My ping is... **" + randomPingTime + "ms**. Fascinating.")
        }, randomPingTime);
      } else {
        message.reply("you can check your ping at https://www.speedtest.net/")
      }
    } else {
       const msg = await message.channel.send("Pinging...");
        msg.edit(`Oh, hello there <@${message.author.id}>! My ping is **${msg.createdTimestamp - message.createdTimestamp}ms**.`);
    }
  }
  
  if(command === "server" || command === "serverinfo") {
    if(spite()) {
      let spitefulResponse = Math.floor(Math.random()*2)
      if(spitefulResponse == 0) {
        let embed = new Discord.RichEmbed() // I despise making embeds like this, but I don't think there's a better way; it just looks attriocious
        .setTitle(message.guild.name)
        .setThumbnail(message.guild.iconURL)
        .setDescription("Server ID: 696969696969696969")
        .addField("Owner", `<@${client.user.id}>`)
        .addField("Region", "hell")
        .addField("Created", message.guild.createdAt + ", unfortunately.")
        .addField("Roles", commaNum(Math.floor(Math.random()*10000)))
        .addBlankField()
        .addField("Members", commaNum(Math.floor(Math.random()*10000)))
        .addField(":green_circle: Online", commaNum(Math.floor(Math.random()*10000)), true)
        .addField(":black_circle: Offline", commaNum(Math.floor(Math.random()*10000)), true)
        .addField(":robot: Bots", commaNum(Math.floor(Math.random()*10000)), true)
        .addBlankField()
        .addField("Channels", commaNum(Math.floor(Math.random()*10000)))
        .addField(":speech_balloon: Text", commaNum(Math.floor(Math.random()*10000)), true)
        .addField(":loud_sound: Voice", commaNum(Math.floor(Math.random()*10000)), true)
        .addField(":bookmark_tabs: Categories", commaNum(Math.floor(Math.random()*10000)), true)

        message.channel.send(embed)
      } else {
        message.reply("before I tell you about the server, maybe tell me a little about yourself?")
      }
    } else {
      let online = 0// loop to grab how many members are online vs offline
      let offline = 0
      let bots = 0
      message.guild.members.forEach(memb => {
        if(memb.user.bot) {
          bots++
        } else if (memb.presence.status === "offline") {
          offline++
        }
        else online++
      }) 
      
      let text = 0// loop to grab types of channels
      let voice = 0
      let category = 0
      message.guild.channels.forEach(chan => {
        if(chan.type === "text") {
          text++
        } else if(chan.type === "voice") {
          voice++
        } else if(chan.type === "category") {
          category++
        }
      })
      
      let embed = new Discord.RichEmbed()
      .setTitle(message.guild.name)
      .setThumbnail(message.guild.iconURL)
      .setDescription("Server ID: " + message.guild.id)
      .addField("Owner", `<@${message.guild.ownerID}>`)
      .addField("Region", message.guild.region)
      .addField("Created", message.guild.createdAt)
      .addField("Roles", commaNum(message.guild.roles.size-1))
      .addBlankField()
      .addField("Members", commaNum(message.guild.memberCount))
      .addField(":green_circle: Online", commaNum(online), true)
      .addField(":black_circle: Offline", commaNum(offline), true)
      .addField(":robot: Bots", commaNum(bots-1), true)
      .addBlankField()
      .addField("Channels", commaNum(message.guild.channels.size))
      .addField(":speech_balloon: Text", commaNum(text), true)
      .addField(":loud_sound: Voice", commaNum(voice), true)
      .addField(":bookmark_tabs: Categories", commaNum(category), true)
      
      message.channel.send(embed)
    }
  }
  
  if(command === "online" || command === "members") {
    if(spite()) {
      return message.channel.send("As much as I would **love** to show you the number of people online, none of them want to talk to you, so I've been asked to decline.")
    }
    let online = 0// same loop as server info
    let idle = 0
    let dnd = 0
    let offline = 0
    let bots = 0
      message.guild.members.forEach(memb => {
        if(memb.user.bot) {
          bots++
        } else if (memb.presence.status === "offline") {
          offline++
        } else if(memb.presence.status === "idle") {
          idle++
        } else if(memb.presence.status === "dnd") {
          dnd++
        }
        else online++
      }) 
    let embed = new Discord.RichEmbed()
    .setTitle("Member Count")
    .setDescription("Total Members: " + commaNum(message.guild.memberCount))
    .addField(":green_circle: Online", commaNum(online))
    .addField(":yellow_circle: Idle", commaNum(idle))
    .addField(":red_circle: Do Not Disturb", commaNum(dnd))
    .addField(":black_circle: Offline", commaNum(offline))
    .addField(":robot: Bots", commaNum(bots-1))
    
    message.channel.send(embed)
  }
  
  if(command === "invite" || command === "addme") {
    if(spite()) {
      let spitefulResponse = Math.floor(Math.random()*2)
      if(spitefulResponse == 0) {
        return message.channel.send("Ask nicely and try again.")
      } else {
        return message.channel.send("Sorry, I'm not too keen on joining your dead server.")
      }
    }
    message.channel.send("**Use this link to make your server suffer through my presence:**\n<https://discord.com/api/oauth2/authorize?client_id=711357272655265823&permissions=403565687&scope=bot>")
  }
  // FIXME: Playing command destroys the bot in servers with > 1000 people
  
  /*if(command === "playing") { // this command is a nightmare isn't it
    if(spite()) {
      let spiteEmb = new Discord.RichEmbed()
      .setTitle("Top games currently being played:")
      .setDescription("**Something without you:** " + commaNum(message.guild.memberCount-1) + " (100%)")
      .setFooter("The server doesn't like you pal, sorry")
      return message.channel.send(spiteEmb)
    }
    let games = [{"name": "None", "playing": 0}]
    let membs = 0
    message.guild.members.forEach(memb => { // the best way I could think of dooing this is looping through every member
      if(memb.presence.status !== "offline" && !memb.user.bot) {
        membs++;
        if(memb.presence.activities[0] && memb.presence.activities[0].type == 0) {
          let curGame = "newgame"
          games.forEach(g => {
            if(g.name === memb.presence.activities[0].name) {
              g.playing++;
              curGame = "found"
            }
          if(curGame === "newgame") {
            games.unshift({"name": memb.presence.activities[0].name, "playing": 1})
          }
          })
        } else {
          games.forEach(g => {
            if(g.name === "None") g.playing++;
          })
        }
      }
    })
    games.sort((a, b) => (a.playing < b.playing) ? 1 : -1)
    let i = 0
    let msg = ""
    while(i < 10) {
      if(games[i]) {
        if(i == 9 || i == games.length-1) {
          msg = msg + `**${games[i].name}:** ${games[i].playing} (${Math.floor((games[i].playing/membs)*100)}%)`
        } else {
          msg = msg + `**${games[i].name}:** ${games[i].playing} (${Math.floor((games[i].playing/membs)*100)}%)\n`
        }
      }
      i++
    }
    let gamerEmbed = new Discord.RichEmbed()
    .setTitle("Top games currently being played:")
    .setDescription(msg)
    .setFooter("This only accounts for online members, and ignores bots.")
    
    message.channel.send(gamerEmbed)
  }*/
  
  if(command === "user" || command === "userinfo") {
    if(spite()) {
      let spitefulResponse = Math.floor(Math.random()*2)
      if(spitefulResponse == 0) {
        let member = message.guild.members.get(client.user.id)
        let embed = new Discord.RichEmbed()
        .setTitle(member.user.tag)
        .setColor(member.displayColor)
        .setDescription("ID: " + member.user.id)
        .setThumbnail(member.user.avatarURL)
        if(member.nickname !== null) embed.addField("Nickname", member.nickname)
        embed.addField("Joined Server", `${moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm")}`, true)
        embed.addField("Account Created", `${moment.utc(member.user.createdAt).format("dddd, MMMM Do YYYY, HH:mm")}`, true)
        if(member.roles.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id}>`).join(" ").length <= 2048) {
          embed.addField("Roles", `${member.roles.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id}>`).join(" ") || "None"}`)
        } else {
          embed.addField("Roles", "I was *going* to map out all of the roles, but the number is so absurd it breaks embed fields. Sorry friend, you'll just have to click on them.")
        }
        
        message.channel.send(embed)
      } else {
        message.reply("stalking people is kinda weird, I'm not helping you.")
      }
    } else {
      if(args[0]) {
        var member = message.mentions.members.first() || message.guild.members.get(args[0])
        if(!member) return message.reply("you know you have to like... mention someone real for this to work yeah? IDs work too, just... not whatever you did.");
      } else {
        var member = message.member
      }
      let embed = new Discord.RichEmbed()
      .setTitle(member.user.tag)
      .setColor(member.displayColor)
      .setDescription("ID: " + member.user.id)
      .setThumbnail(member.user.avatarURL)
      if(member.nickname !== null) embed.addField("Nickname", member.nickname)
      embed.addField("Joined Server", `${moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm")}`, true)
      embed.addField("Account Created", `${moment.utc(member.user.createdAt).format("dddd, MMMM Do YYYY, HH:mm")}`, true)
      if(member.roles.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id}>`).join(" ").length <= 2048) {
        embed.addField("Roles", `${member.roles.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id}>`).join(" ") || "None"}`)
      } else {
        embed.addField("Roles", "I was *going* to map out all of the roles, but the number is so absurd it breaks embed fields. Sorry friend, you'll just have to click on them.")
      }
      
      message.channel.send(embed)
    }
  }
  
  if(command === "noodles" || command === "noods") {
    if(spite()) {
      message.reply("buy your own.\nhttps://www.amazon.com/dp/B005ECO5SW/ref=cm_sw_r_tw_dp_U_x_8CyWEbH38Q514")
    } else {
      let noodles = [
        "https://cdn.glitch.com/fa90ed07-aac8-48cb-b976-e5e3164ccb5b%2Fnoodles1.gif?v=1589741187351",
        "https://cdn.glitch.com/fa90ed07-aac8-48cb-b976-e5e3164ccb5b%2Fnoodles2.gif?v=1589741190606",
        "https://cdn.glitch.com/fa90ed07-aac8-48cb-b976-e5e3164ccb5b%2Fnoodles3.gif?v=1589741197503",
        "https://cdn.glitch.com/fa90ed07-aac8-48cb-b976-e5e3164ccb5b%2Fnoodles4.gif?v=1589741207177",
        "https://cdn.glitch.com/fa90ed07-aac8-48cb-b976-e5e3164ccb5b%2Fnoodles5.gif?v=1589741211749"
      ]

      let randomNoodle = noodles[Math.floor(Math.random() * noodles.length)];
      message.channel.send(":ramen::ok_hand:")
      message.author.send(randomNoodle)
    }
  }
  
  if(command === "choose" || command === "pick") {
    if(spite()) {
      message.channel.send("No.")
    } else {
      let options = message.content.slice(1+command.length).split(",");
      let option = options[Math.floor(Math.random() * options.length)];
      let chooseEmbed = new Discord.RichEmbed()
        .setTitle(`I choose: ${option.trim()}!`)
        .setDescription(`Options were: ${options}`);

      message.channel.send(chooseEmbed);
    }
  }
  
  if(command === "rps") { // shamefully enough, I stole this code from another one of my older bots; It's probably attrocious but this is fine:tm:
    if(spite()) {
      let rpsEmbed = new Discord.RichEmbed()
      .setTitle("I choose GUN!")
      .setDescription("Yeehaw!")
      .setColor("#a81f1f")
      
      message.channel.send(rpsEmbed)
    } else {
      let choice = args[0].toProperCase();
      const rps = ["Rock", "Paper", "Scissors"];
      if (!choice || !rps.includes(choice)) return message.channel.send("Choose rock, paper, or scissors. That's how this game works...");

      let response = rps[Math.floor(Math.random() * 3)];

      if ((choice === "Rock" && response === "Scissors") || (choice === "Paper" && response === "Rock") || (choice === "Scissors" && response === "Paper")) {
        var outcome = "You win!";
        var color = "#008000";
      }
      if ((choice === "Rock" && response === "Rock") || (choice === "Paper" && response === "Paper") || (choice === "Scissors" && response === "Scissors")) {
        var outcome = "Draw!";
        var color = "ffffff";
      } 
      if ((choice === "Rock" && response === "Paper") || (choice === "Paper" && response === "Scissors") || (choice === "Scissors" && response === "Rock")) {
        var outcome = "You lose!";
        var color = "#a81f1f";
      }

      let rpsEmbed = new Discord.RichEmbed()
        .setTitle("I choose: " + response + "!")
        .setDescription(outcome)
        .setColor(color);

      message.channel.send(rpsEmbed);
    }
  }
  
  if(command === "waifu" || command === "ratewaifu") { // this one is also yoinked from an old bot of mine, might be messy
    if(spite()) {
      message.reply("your waifu is trash and I refuse to rate them.")
    } else {
      if (message.mentions.users.first()) var waifu = message.mentions.users.first().username;
      else var waifu = args.join(" ");
      let rating = Math.floor(Math.random() * 100 + 1);
      if (rating >= 70) var color = "00ff00";
      else if (rating >= 40) var color = "ffff00";
      else var color = "ff0000";

      rating = rating + "%";

      if (waifu.toLowerCase() === "yukio" || waifu === `<@!${client.user.id}>`) {
        rating = "101%";
      }

      let wifeEmbed = new Discord.RichEmbed()
        .setTitle(waifu)
        .setDescription(`Waifu material: **${rating}**`)
        .setColor(color);

      message.channel.send(wifeEmbed);
    }
  }
});

client.login(process.env.TOKEN);

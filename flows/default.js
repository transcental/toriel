const axios = require('axios')

const { sendEphemeralMessage, getUserRecord, getIslandId,
  hasPushedButton, hasCompletedTutorial, isBot,
  sendMessage, setPronouns, getPronouns,
  updateSingleBlockMessage, sendSingleBlockMessage, updateInteractiveMessage,
  messageIsPartOfTutorial, inviteUserToChannel, getIslandName,
  getNextEvent, completeTutorial, timeout,
  updatePushedButton, setPreviouslyCompletedTutorial, hasPreviouslyCompletedTutorial,
  generateIslandName, islandTable, getLatestMessages,
  startTutorial, setFlow } = require('../utils/utils')

async function defaultFilter(e) {
  const userID = e.body.user_id || (e.body.event ? e.body.event.user : e.body.user.id)
  //console.log(userID)
  const flowOptions = {
    maxRecords: 1,
    filterByFormula: `AND(Name = '${userID}', Flow = 'Default')`,
  }
  let data = await axios('https://api2.hackclub.com/v0.1/Tutorial%20Island/Tutorial%20Island?select=' + JSON.stringify(flowOptions)).then(r => r.data)
  return (data[0] != null)
}

async function runInFlow(opts, func) {
  if (await defaultFilter(opts)) {
    return await func(opts)
  }
}

const loadFlow = (app) => {
  app.action('intro_progress_1', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    introProgress(body)
  }));
  app.action('intro_progress_2', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    introProgress(body)
  }));
  app.action('intro_progress_3', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    introProgress(body)
  }));
  app.action('intro_progress', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    introProgress(body)
  }));

  app.action('she', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    await setPronouns(app, body.user.id, 'she/her/hers', 'she')
    updateSingleBlockMessage(app, body.message.ts, body.channel.id, `What are your pronouns? (how you want to be referred to by others)`, `she/her/hers`, `mimmiggie`)
    await sendMessage(app, body.channel.id, `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`)
    sendHsQuestion(body.channel.id)
  }));

  app.action('he', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    await setPronouns(app, body.user.id, 'he/him/his', 'he')
    updateSingleBlockMessage(app, body.message.ts, body.channel.id, `What are your pronouns? (how you want to be referred to by others)`, `he/him/his`, `mimmiggie`)
    await sendMessage(app, body.channel.id, `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`)
    sendHsQuestion(body.channel.id)
  }));

  app.action('they', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    await setPronouns(app, body.user.id, 'they/them/theirs', 'they')
    updateSingleBlockMessage(app, body.message.ts, body.channel.id, `What are your pronouns? (how you want to be referred to by others)`, `they/them/theirs`, `mimmiggie`)
    await sendMessage(app, body.channel.id, `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`)
    sendHsQuestion(body.channel.id)
  }));

  app.action('something_else', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    updateSingleBlockMessage(app, body.message.ts, body.channel.id, `What are your pronouns? (how you want to be referred to by others)`, `something else`, `mimmiggie`)
    await sendMessage(app, body.channel.id, `What are your preferred pronouns? (Type your answer in chat)`)
  }));

  app.action('hs_yes', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    updateSingleBlockMessage(app, body.message.ts, body.channel.id, `Are you currently a high school student? (it's OK if you're not)`, `Yes`, `mimmiggie`)
    await sendMessage(app, body.channel.id, 'Hack Club is a community of high schoolers, so you\'ll fit right in!')
    await sendMessage(app, body.channel.id, `What brings you to the Hack Club community? (Type your answer in the chat)`)
  }));

  app.action('hs_no', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    updateSingleBlockMessage(app, body.message.ts, body.channel.id, `Are you currently a high school student? (it's OK if you're not)`, `No`, `mimmiggie`)
    await sendMessage(app, body.channel.id, 'Just a heads-up: Hack Club is a community of high schoolers, not a community of professional developers. You will likely still find a home here if you are in college, but if you\'re older than that, you may find yourself lost here.')
    await sendSingleBlockMessage(app, body.channel.id, 'If you understand this and still want to continue on, click the 👍 below.', '👍', 'hs_acknowledge')
  }));

  app.action('hs_acknowledge', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    await updateInteractiveMessage(app, body.message.ts, body.channel.id, '👍')
    await sendMessage(app, body.channel.id, `What brings you to the Hack Club community? (Type your answer in the chat)`)
  }));

  app.event('message', e => runInFlow(e, async body => {
    const correctChannel = await getIslandId(body.event.user)

    if (messageIsPartOfTutorial(body, correctChannel)) {
      const latestMessages = await getLatestMessages(app, body.event.channel)
      const lastBotMessage = latestMessages.lastBotMessage
      const lastUserMessage = latestMessages.lastUserMessage

      if (lastBotMessage.includes('What are your preferred pronouns')) {
        let pronouns = lastUserMessage
        let pronoun1 = lastUserMessage.slice(0, lastUserMessage.search("/"))
        await setPronouns(app, body.event.user, pronouns, pronoun1.toLowerCase())
        await sendMessage(app, body.event.channel, `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`)
        await sendHsQuestion(body.event.channel)
      }

      if (lastBotMessage.includes('What brings you')) {
        if (latestMessages.latestReply) {
          let replies = await app.client.conversations.replies({
            token: process.env.SLACK_BOT_TOKEN,
            channel: body.event.channel,
            ts: latestMessages.latestTs
          })
        }
        else {
        }

        await sendMessage(app, body.event.channel, `Ah, very interesting! Well, let me show you around the community.`)
        await sendMessage(app, body.event.channel, `You're currently on Slack, the platform our community uses. It's like Discord, but better.`)

        // TODO: Update numbers when they become out of date / (or remove them)
        await sendMessage(app, body.event.channel, `Slack is organized into "channels". We have _hundreds_ of channels in our Slack, covering everything from \`#gamedev\` and \`#code\` to \`#photography\` and \`#cooking\`. In the past 7 days, 336 people posted 60,179 messages.`, 5000)

        await sendMessage(app, body.event.channel, `Every new account starts limited to just a few channels. I'll get you situated in Summer of Making channels to start, then you'll have to get an existing Hack Club member to convert your account into a full Slack account for access to all channels.`, 5000)

        const somWelcomeChannel = 'C015MKW1A3D';

        // add user to #som-welcome
        await inviteUserToChannel(app, body.event.user, somWelcomeChannel, true)

        await sendMessage(app, body.event.channel, `I just invited you to your first channel, <#${somWelcomeChannel}>. Join by clicking on it in your sidebar, and feel free to introduce yourself. (totally optional, no expectations)`, 5000)

        const island = await getIslandName(body.event.user)
        await sendEphemeralMessage(app, somWelcomeChannel, `<@${body.event.user}> Feel free to introduce yourself to the community in <#${somWelcomeChannel}>. When you're done, head back to <https://hackclub.slack.com/archives/${island}|#${island}> to continue your introduction to the community.`, body.event.user)

        await sendSingleBlockMessage(app, body.event.channel, "When you're ready, click the 👍 on this message to continue.", '👍', 'introduced')
      }
    }
  }));

  app.action('introduced', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    updateInteractiveMessage(app, body.message.ts, body.channel.id, '👍')
    await sendMessage(app, body.channel.id, `Awesome! That's all for now! You must abide by the code of conduct at https://conduct.hackclub.com.`)
    await sendMessage(app, body.channel.id, `I'm adding you to a few last channels. Note: You are on a limited account and don't have access to the vast majority of channels in the Slack yet. You will need to be a kind, helpful person in the channels you're in and - if you are - an existing Hack Clubber will choose to convert your account to a full account with full access. Every existing Hack Club member has the ability to convert new accounts.`)

    const user = body.user.id

    // add user to remaining channels
    const somLounge = 'C015LQDP2Q2'
    const somMixer = 'C015ZDB0GRF'
    const scrapbook = 'C01504DCLVD' // TODO switch to #scrapbook, is dev channel now

    console.log("before last invites", body)

    await Promise.all([
      inviteUserToChannel(app, user, somLounge, true),
      inviteUserToChannel(app, user, somMixer, true),
      inviteUserToChannel(app, user, scrapbook, true)
    ])

    await Promise.all([
      sendEphemeralMessage(app, somLounge, `<@${user}> This is <#${somLounge}>! Relax, grab a sparkling water, and chat with fellow hackers while watching the sights go by.`, user),
      sendEphemeralMessage(app, somMixer, `<@${user}> This is <#${somMixer}>! To convert your account to a full account on the Hack Club Slack to get access to all channels, you'll need to convince a current Hack Club member to invite you. They just need to run \`/som-promote\` to let you in. Be warned! Everyone can see who invited you, so you need to prove that you are trustworthy. The best way to get an invite is to hang out, be kind, and be helpful in the other public Summer of Making channels. You will be banned if you spam current Hack Club members in DMs asking for invites (and we built a confidential reporting function just in case you decide to try us).`, user),
      sendEphemeralMessage(app, scrapbook, `<@${user}> This is <#${scrapbook}>! Make your scrapbook today!`, user)
    ])
  }));

  app.action('coc_acknowledge', e => runInFlow(e, async ({ ack, body }) => {
    ack();
    await updateInteractiveMessage(app, body.message.ts, body.channel.id, '👍')
    await sendMessage(app, body.channel.id, `That's all from me! I hope I've been able to help you get acquainted with the Hack Club community.`)
    const finalMessage = await sendMessage(app, body.channel.id, `I've added you to a few of the most popular channels, but there are many, many more! Click on "6 replies" to learn more about the channels you were just added to and discover some other cool channels...`, 5000)
    const finalTs = finalMessage.message.ts

    const hqDesc = `*<#C0C78SG9L>* is where people ask the community/@staff any questions about Hack Club.`
    const loungeDesc = `*<#C0266FRGV>* is where people go to hang out with the community. There are no expectations here; just have fun and hang out with the community :)`
    const shipDesc = `*<#C0M8PUPU6>* is where people go to _ship_, or share, projects they've made. All posts in that are not part of a thread must be projects you've made, and must include a link or attachment. Check out the awesome projects people in the community have made!`
    const codeDesc = `*<#C0EA9S0A0>* is where people go to ask technical questions about code. If you're stuck on a problem or need some guidance, this is the place to go. `

    // channel descriptions
    await sendMessage(app, body.channel.id, hqDesc, 10, finalTs)
    await sendMessage(app, body.channel.id, loungeDesc, 10, finalTs)
    await sendMessage(app, body.channel.id, shipDesc, 10, finalTs)
    await sendMessage(app, body.channel.id, codeDesc, 10, finalTs)
    await sendMessage(app, body.channel.id, `Here are a bunch of other active channels that you may be interested in:`, 10, finalTs)
    await sendMessage(app,
      body.channel.id,
      `<#C013AGZKYCS> – Get to know the community by answering a question every day!
      <#C0NP503L7> - Upcoming events
      <#C6LHL48G2> - Game Development
      <#C0DCUUH7E> - Share your favorite music!
      <#CA3UH038Q> - Talk to others in the community!
      <#C90686D0T> - Talk about the LGBTQ community!
      <#CCW6Q86UF> - :appleinc:
      <#C1C3K2RQV> - Learn about design!
      <#CCW8U2LBC> - :google:
      <#CDLBHGUQN> - Photos of cats!
      <#CDJV1CXC2> - Photos of dogs!
      <#C14D3AQTT> - A public log of Hack Club's sent packages!
      <#CBX54ACPJ> - Share your photos!
      <#CC78UKWAC> - :jenga_sleep:
      <#C8P6DHA3W> - Don't enter if you're hungry!
      <#C010SJJH1PT> - Learn about cooking!
      <#CDJMS683D> - Count to a million, one at a time.
      <#CDN99BE9L> - Talk about Movies & TV!`,
      10,
      finalTs
    );

    let pronouns = await getPronouns(body.user.id)
    if (pronouns.pronouns === "they/them/theirs" || pronouns.pronouns === "she/her/hers") {
      await sendMessage(app, body.channel.id, `Also, check out <#CFZMXJ3FB>—it’s a channel for women/femme/non-binary people in Hack Club!`, 1000)
    }

    await completeTutorial(body.user.id)
    // add user to default channels
    await inviteUserToChannel(app, body.user.id, 'C0C78SG9L') //hq
    await inviteUserToChannel(app, body.user.id, 'C0266FRGV') //lounge
    //await inviteUserToChannel(app, body.user.id, 'C0M8PUPU6') //ship
    await inviteUserToChannel(app, body.user.id, 'C0EA9S0A0') //code

    await sendEphemeralMessage(app, 'C0C78SG9L', hqDesc, body.user.id)
    await sendEphemeralMessage(app, 'C0266FRGV', loungeDesc, body.user.id)
    await sendEphemeralMessage(app, 'C0M8PUPU6', shipDesc, body.user.id)
    await sendEphemeralMessage(app, 'C0EA9S0A0', codeDesc, body.user.id)

    await sendMessage(app, body.channel.id, `Your next steps: start talking to the community! Pick a few channels that you like from the thread above and start talking. We're excited to meet you :partyparrot:`)
    await sendMessage(app, body.channel.id, `I also highly recommend setting a profile picture. It makes you look a lot more like a real person :)`)
    await sendMessage(app, body.channel.id, `I'm going to head out now—if you have any questions about Hack Club or Slack that I didn't answer, please ask in <#C0C78SG9L> or send a Direct Message to <@U4QAK9SRW>.`)
    await sendMessage(app, body.channel.id, `Toodles! :wave:`)
    await timeout(3000)
    await sendSingleBlockMessage(app, body.channel.id, `(Btw, if you want to leave + archive this channel, click here)`, 'Leave channel', 'leave_channel')
  }));

  app.event('member_joined_channel', e => runInFlow(e, async body => {
    const pushedFirstButton = await hasPushedButton(body.event.user)
    const completed = await hasCompletedTutorial(body.event.user)
    const islandId = await getIslandId(body.event.user)

    if (body.event.channel !== 'C75M7C0SY' && body.event.channel !== 'C0M8PUPU6' && body.event.channel !== 'C013AGZKYCS' && body.event.channel !== islandId && !completed) {
      const members = await app.client.conversations.members({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.event.channel
      })
      if (!(members.members.includes('U012FPRJEVB'))) { // user who owns the oauth, in this case @Clippy Admin
        await app.client.conversations.join({
          token: process.env.SLACK_OAUTH_TOKEN,
          channel: body.event.channel
        })
      }
      await app.client.conversations.kick({
        token: process.env.SLACK_OAUTH_TOKEN,
        channel: body.event.channel,
        user: body.event.user
      })
      let islandId = await getIslandId(body.event.user)
      await sendEphemeralMessage(app, islandId, `<@${body.event.user}> It looks like you tried to join <#${body.event.channel}>. You can't join any channels yet—I need to finish helping you join the community first.`, body.event.user)
      await app.client.chat.postMessage({
        token: process.env.SLACK_OAUTH_TOKEN,
        channel: 'U4QAK9SRW',
        text: `Heads up, I kicked <@${body.event.user}> from <#${body.event.channel}>`
      })
    }
  }));

  app.event('member_left_channel', e => runInFlow(e, async body => {
    const completed = await hasCompletedTutorial(body.event.user)
    const islandId = await getIslandId(body.event.user)
    if (body.event.channel === islandId && !completed) {
      await app.client.conversations.invite({
        token: process.env.SLACK_OAUTH_TOKEN,
        channel: body.event.channel,
        user: body.event.user
      })
      await sendEphemeralMessage(app, islandId, `<@${body.event.user}> It looks like you tried to leave your tutorial channel. You can't do that just yet—I need to help you complete the tutorial before you can unlock the rest of the community.`, body.event.user)
    }
  }));

  async function introProgress(body) {
    updateInteractiveMessage(app, body.message.ts, body.channel.id, `Hi, I'm Clippy! My job is to help you join the Hack Club community. Do you need assistance?`)

    updatePushedButton(body.user.id)
    await sendMessage(app, body.channel.id, '...', 1000)
    await sendMessage(app, body.channel.id, '...', 1000)
    await sendMessage(app, body.channel.id, `Excellent! I'm happy to assist you in joining Hack Club today.`, 1000)

    const prevCompleted = await hasPreviouslyCompletedTutorial(body.user.id)
    if (prevCompleted) {
      await sendMessage(app, body.channel.id, `A few quick questions:`)
    } else {
      await sendMessage(app, body.channel.id, `First, the free stuff I promised...`)
      await sendMessage(app, body.channel.id, `<@UH50T81A6> give <@${body.user.id}> 20gp for free stuff!!!`, 1000)
      await setPreviouslyCompletedTutorial(body.user.id)
      await sendMessage(app, body.channel.id, 'You can check your balance at any time by typing `/balance`.', 1000)

      await sendMessage(app, body.channel.id, `Now that that's out of the way, a few quick questions:`, 5000)
    }

    await timeout(3000)
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.channel.id,
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `What are your pronouns? (how you want to be referred to by others)`
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "she/her/hers"
              },
              "style": "primary",
              "action_id": "she"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "he/him/his"
              },
              "style": "primary",
              "action_id": "he"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "they/them/theirs"
              },
              "style": "primary",
              "action_id": "they"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "something else"
              },
              "style": "primary",
              "action_id": "something_else"
            }
          ]
        }
      ]
    })
  }


  async function sendToWelcomeCommittee(userId, text) {
    let userPronouns = await getPronouns(userId)
    let pronouns = userPronouns.pronouns
    let pronoun1 = userPronouns.pronoun1

    await sendMessage(app, 'GLFAEL1SL', 'New user <@' + userId + '> (' + pronouns + ') joined! Here\'s why ' + pronoun1 + ' joined the Hack Club community:\n\n' + text + '\n\nReact to this message to take ownership on reaching out.', 10)
  }

  async function sendHsQuestion(channel) {
    await timeout(3000)
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `Are you currently a high school student? (it's OK if you're not)`
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Yes"
              },
              "style": "primary",
              "action_id": "hs_yes"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "No"
              },
              "style": "danger",
              "action_id": "hs_no"
            }
          ]
        }
      ]
    })
  }
}

exports.loadFlow = loadFlow

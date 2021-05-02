const http = require('http')
const path = require('path')
const express = require('express')
const socketIO = require('socket.io')
const needle = require('needle')
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 3000

// Creating the express app
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.get('/', (req,res) => {
    res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'))
})

// console.log(TOKEN)

// Set the Request URLs
const ruleURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

// Add Rules as Array of Objects
const rules = [{ value: 'marvel' }]

// We need three functions to do the job

// 1. Get the Stream Rules
async function getRules() {
    const response = await needle('get', ruleURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    // console.log(response.body);
    return response.body
}

// 2. Set the Stream Rules
async function setRules() {

    // Data to be passed in while setting the rules
    const data = {
        add: rules
    }

    const response = await needle('post', ruleURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })

    console.log(response.body);
    return response.body
}

// 3. Delete the Stream Rules
async function deleteRules(rules) {
    // Check if the rules is an array or not
    if(!Array.isArray(rules.data)) {
        return null
    }

    // Match the ids
    const ids = rules.data.map((rule) => rule.id)

    // Delete the rules with their matching ids
    const data = {
        delete: {
            ids: ids
        }
    }

    const response = await needle('post', ruleURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })

    console.log(response.body);
    return response.body
}

// 4. Stream the Tweets
function streamTweets(socket) {
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    stream.on('data', (data) => {
        try {
            const response = JSON.parse(data)
            // console.log(response);
            socket.emit('tweet', response)
        } catch (error) {
            // Nothing | Keep the connection open
        }
    })
}

io.on('connection', async () => {
    console.log('Client connected...')

    // Pass the stream to the Front End
    let currentRules

    try {
        // Get all stream rules
        currentRules = await getRules()
        // Delete the existing rules
        await deleteRules(currentRules)
        // Set the new rules to display
        await setRules()

    } catch (error) {
        console.error(error);
        process.exit(1)
    }

    streamTweets(io)
})

// if-y | Runs Automatically without calling
// (async () => {
//     // let currentRules

//     // try {
//     //     // Get all stream rules
//     //     currentRules = await getRules()
//     //     // Delete the existing rules
//     //     await deleteRules(currentRules)
//     //     // Set the new rules to display
//     //     await setRules()

//     // } catch (error) {
//     //     console.error(error);
//     //     process.exit(1)
//     // }

//     // streamTweets()
// })()

// Make the server listen to the PORT
server.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
})
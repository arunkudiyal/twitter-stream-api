const needle = require('needle')
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN

// Set-up for communication
const ruleURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

// Set the rule | Keyword
const rules = [{value: 'programming'}]

// FETCH THE TWEETS

// Get the rules
async function getRules() {
    const response = await needle('get', ruleURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    console.log(response.body)
    return response.body
}

// Set the Rules
async function setRules() {

    // data to be passed in being mentioned in the rule
    const data = {
        add: rules
    }

    const response = await needle('post', ruleURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })

    console.log(response.body)
    return response.body
}

// Delete the Rules
async function deleteRules(rules) {

    // Check if the rules is an array
    if(!Array.isArray(rules)) {
        return null;
    }

    // Match these rules one bty one and remove the ones not inclued
    const ids = rules.data.map((rule) => rule.id)

    // data to be passed in being mentioned in the rule
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

    console.log(response.body)
    return response.body
}

// STREAM the Tweets
function streamTweets() {
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    stream.on('data', (data) => {
        try {
            const response = JSON.parse(data)
            console.log(response)

        } catch (error) {
            // Nothing to write | COnnection to be open

        }
    })
}

// iff-y | Creating a function which runs automatically
(async () => {
    let currentRules

    try {

        // Get the rules
        currentRules = await getRules()
        // console.log(currentRules)

        // Delete the rules
        await deleteRules(currentRules)

        // Set the rules
        await setRules()


    } catch (error) {
        console.log(error)
        process.exit(1)
    }

    streamTweets()    
})()
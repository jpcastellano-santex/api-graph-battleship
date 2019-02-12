const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { graphiqlExpress } = require('graphql-server-express');
const { createServer } = require('http');

const app = express();

app.use(cors());

mongoose.connect('mongodb://adminjpc:adminjpc1@ds221435.mlab.com:21435/battleship-jpc');
mongoose.connection.once('open', () => {
    console.log('db connected');
});

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`
}));

const server = createServer(app);

server.listen(4000, err => {
    if (err) throw err
    new SubscriptionServer(
        {
            schema,
            execute,
            subscribe,
            onConnect: () => console.log('Client connected')
        },
        {
            server,
            path: '/subscriptions'
        }
    );
    console.log('4000')
});
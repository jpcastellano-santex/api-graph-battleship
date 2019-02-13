const graphql = require('graphql');
const _ = require('lodash');
const Game = require('../model/gameModel');
const User = require('../model/userModel');
const GameBoard = require('../model/gameboardModel');
const socket = require('./socket');

const { GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLList,
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLInt } = graphql;

const GameType = new GraphQLObjectType({
    name: 'Game',
    fields: () => ({
        id: { type: GraphQLID },
        ownerId: { type: GraphQLID },
        guestId: { type: GraphQLID },
        turnId: { type: GraphQLID },
        winnerId: { type: GraphQLID },
        surrender: { type: GraphQLBoolean },
        owner: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ '_id': parent.ownerId });
            }
        },
        guest: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ '_id': parent.guestId });
            }
        },
        winner: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ '_id': parent.winnerId });
            }
        },
        turn: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ '_id': parent.turnId });
            }
        },
        ownerBoard: { type: new GraphQLList(new GraphQLList(GraphQLInt)) },
        guestBoard: { type: new GraphQLList(new GraphQLList(GraphQLInt)) },
        createdDate: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        games: {
            type: new GraphQLList(GameType),
            resolve(parent, args) {
                return Game.find({ 'ownerId': parent.id });
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        mygames: {
            type: new GraphQLList(GameType),
            args: {
                userid: { type: GraphQLString }
            },
            resolve(parent, args) {
                return Game.find({ $or: [{ 'ownerId': args.userid }, { 'guestId': args.userid }] });
            }
        },
        availablegames: {
            type: new GraphQLList(GameType),
            args: {
                userid: { type: GraphQLString }
            },
            resolve(parent, args) {
                return Game.find({ $and: [{ 'ownerId': { $ne: args.userid } }, { 'guestId': null }] });
            }
        },
        gameboard: {
            type: GameType,
            args: {
                id: { type: GraphQLString },
                userid: { type: GraphQLString }
            },
            resolve(parent, args) {
                // { $or: [{ 'ownerId': args.userid }, { 'guestId': args.userid }] }, 
                return Game.findOne({
                    $and: [
                        {
                            $or: [
                                { 'ownerId': args.userid },
                                { 'guestId': args.userid }]
                        },
                        { '_id': args.id }
                    ]
                });
            }
        },
        game: {
            type: GameType,
            args: {
                id: { type: GraphQLString }
            },
            resolve(parent, args) {
                return Game.findOne({ '_id': args.id });
            }
        },
        games: {
            type: new GraphQLList(GameType),
            resolve(parent, args) {
                return Game.find({});
            }
        },
        user: {
            type: UserType,
            args: {
                id: { type: GraphQLString }
            },
            resolve(parent, args) {
                return User.findOne({ '_id': args.id });
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addGame: {
            type: GameType,
            args: {
                userid: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    let now = new Date().toISOString();
                    let newGame = new Game({
                        ownerId: args.userid,
                        turnId: args.userid,
                        createdDate: now,
                        ownerBoard: GameBoard.getRandomBoard(),
                        guestBoard: GameBoard.getRandomBoard()
                    });
                    newGame.save().then(data => {
                        socket.publish('ADD_GAME', {
                            gameAdded: data
                        });
                        resolve(data);
                    }).catch(errors => reject(errors));
                });
            }
        },
        addUser: {
            type: UserType,
            args: {
                username: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    let newUser = new User({
                        username: args.username
                    });
                    newUser.save().then(data => {
                        console.log(data);
                        socket.publish('ADD_USER', {
                            userAdded: data
                        });
                        resolve(data);
                    }).catch(errors => reject(errors));
                })
            }
        },
        joingame: {
            type: new GraphQLList(GameType),
            args: {
                userid: { type: new GraphQLNonNull(GraphQLID) },
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    Game.findOneAndUpdate({ '_id': args.id }, { guestId: args.userid }, { new: true }, (err, data) => {
                        socket.publish('JOINED_GAME', {
                            gameJoined: data
                        });
                        console.log(data.guestId);
                        resolve(data);
                    }).catch(errors => reject(errors));
                })
            }
        }
    }
});

const Subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        userAdded: {
            type: UserType,
            subscribe: () => socket.asyncIterator('ADD_USER')
        },
        gameAdded: {
            type: GameType,
            subscribe: () => socket.asyncIterator('ADD_GAME')
        },
        gameJoined: {
            type: GameType,
            subscribe: () => socket.asyncIterator('JOINED_GAME')
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
    subscription: Subscription
})

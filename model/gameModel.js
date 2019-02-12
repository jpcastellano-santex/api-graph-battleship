var mongoose = require('mongoose');
var Users = require('./userModel');

var Schema = mongoose.Schema;

var gameSchema = new Schema({
    ownerId: String,
    guestId: String,
    turnId: String,
    winnerId: String,
    createdDate: Date,
    startDate: Date,
    endDate: Date,
    surrender: Boolean,
    ownerBoard: [[Number]],
    guestBoard: [[Number]]
});

var Games = mongoose.model('Games', gameSchema);

module.exports = Games;
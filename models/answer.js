'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var answerSchema = new Schema({
	title:{ type: String, required: true },
	answer:{ type: String, required: true },
	_user : { type: Schema.ObjectId, ref: 'user', required: true },
	created:{ type: Date, required: true },
	modified:{ type: Date},
	votes: Number,
	comments:[{comment: String, _user:{ type: Schema.ObjectId, ref: 'user', required: true }}]
});

module.exports = mongoose.model('Group', groupSchema);
//==================================================================================================
function Player(id, name, location, steam)
{
	Observable.call(this);
	this.id = id;
	this.location = location;
	this.hasquit = false;
	this.name = name;
	this.steam = steam;
	this.hand = new Array();
	this.heroid = undefined;
	Object.defineProperty( this, 'hero', {
		value : undefined,
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : true, // can be replaced with another object
		configurable : false, // can't be deleted
	});
	this.corner = undefined;
	this.quests = 0;
	Object.defineProperty( this, '_herochanged', {
		value : Observable.prototype.notify.bind(this, 'hero', 'change'),
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : false, // can't be replaced with another object
		configurable : false, // can't be deleted
	});
}
Player.prototype = Object.create(Observable.prototype);
Player.prototype.constructor = Player;
Player.prototype.setHero = function (hero, corner)
{
	this.heroid = hero.id;
	this.hero = hero;
	this.hero.playerid = this.id;
	this.hero.subscribe(this._herochanged);
	this.notify('hero', 'set', hero);
	if (corner)
	{
		this.corner = corner;
		this.notify('corner', 'set', corner);
	}
};
Player.prototype.gainCard = function (card)
{
	this.hand.push(card);
	this.notify('hand', 'add', card);
};
Player.prototype.loseCard = function (card)
{
	var index = this.hand.indexOf(card);
	if (index >= 0)
	{
		this.hand.splice(index, 1);
		this.notify('hand', 'remove', card);
	}
	else
		console.warn('Player ',this.name,' lost a card ',card,' from their hand they never had.');
};
Player.prototype.nextQuest = function ()
{
	this.quests++;
	this.notify('quests', 'change', this.quests);
};
Player.prototype.quit = function ()
{
	this.hasquit = true;
	this.notify('hasquit', 'change', this.hasquit);
};
//==================================================================================================
function MatchContext()
{
	Observable.call(this);
	this.active = undefined;
	this.prestige_leader = 0;
	this.round = -1;
	this.declaration = '';
	this.pacts = new Array();
}
MatchContext.prototype = Object.create(Observable.prototype);
MatchContext.prototype.constructor = MatchContext;
MatchContext.prototype.setPrestigeLeader = function (player)
{
	this.prestige_leader = player;
	this.notify('prestige_leader', 'change', player);
};
MatchContext.prototype.setDeclaration = function (declaration)
{
	this.declaration = declaration;
	this.notify('declaration', 'change', declaration);
};
MatchContext.prototype.setTurn = function(entity)
{
	this.active = entity;
	this.notify('active', 'change', entity);
};
MatchContext.prototype.nextRound = function()
{
	this.round++;
	this.notify('round', 'change', this.round);
};
MatchContext.prototype.isDay = function() { return this.round % 2 == 0; };
MatchContext.prototype.isNight = function() { return this.round % 2 == 1; };
MatchContext.prototype.addPact = function (type, initiator, recipient)
{
	this.pacts.push({
		type: type,
		initiator: initiator,
		recipient: recipient,
	});
	this.notify('pacts', 'add', this.pacts[this.pacts.length-1]);
};
MatchContext.prototype.breakPactBetween = function (type, p1, p2)
{
	for (var i = this.pacts.length; i >= 0; i--)
		if ( ((this.pacts[i].initiator == p1) && (this.pacts[i].recipient == p2)) ||
			((this.pacts[i].initiator == p2) && (this.pacts[i].recipient == p1)))
			this.pacts.splice(i,1);
	this.notify('pacts', 'change');
};
MatchContext.prototype.clearPactsFor = function (player)
{
	for (var i = this.pacts.length-1; i >= 0; i--)
		if ((this.pacts[i].initiator == player) || (this.pacts[i].recipient == player))
			this.pacts.splice(i,1);
	this.notify('pacts', 'change');
};
MatchContext.prototype.serialize = function()
{
	return JSON.stringify(this);
};
MatchContext.prototype.deserialize = function(data)
{
	var obj = JSON.parse(data);

	this.round = obj.round;
	this.notify('round', 'change', this.round);
	this.active = obj.active;
	this.notify('active', 'change', this.active);
	this.prestige_leader = obj.prestige_leader;
	this.notify('prestige_leader', 'change', this.prestige_leader);
	this.declaration = obj.declaration;
	this.notify('declaration', 'change', this.declaration);
	this.pacts = obj.pacts;
	this.notify('pacts', 'change', this.pacts);
	
};
//==================================================================================================
function PlayerCollection()
{
	SerializableObservableCollection.call(this);
}
PlayerCollection.prototype = Object.create(SerializableObservableCollection.prototype);
PlayerCollection.prototype.constructor = PlayerCollection;
PlayerCollection.prototype.deserializeItems = function(data, entities)
{
	var basereviver = SerializableObservableCollection.getSimpleReviver(Player);
	var reviver = function(obj)
	{
		var plr = basereviver(obj);
		plr.setHero(entities.getItemById('id', obj.heroid), obj.corner);
		return plr;
	};
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, reviver);
};

//==================================================================================================
function MapTile(type, coords, corner)
{
	Observable.call(this);
	if (typeof coords !== 'undefined')
		this.coords = coords;
	else	
		this.coords = "-1,-1";
	Object.defineProperty( this, 'u', {
		get : function() {return Number.parseInt(this.coords.split(',')[0]);},
		enumerable : false,
		configurable : false,
	});
	Object.defineProperty( this, 'v', {
		get : function() {return Number.parseInt(this.coords.split(',')[1]);},
		enumerable : false,
		configurable : false,
	});
	this.type = type;
	this.effects = [];
	if (type == 'Settlement')
		this.state = {terrorized:false, fortified:false, owner:undefined};
	else
		this.state = {};
	this.peril = undefined;
	this.perilcard = undefined;
	this.perilowner = undefined;
	this.perilbuffs = new Array();
	this.corner = corner;
}
MapTile.prototype = Object.create(Observable.prototype);
MapTile.prototype.constructor = MapTile;
MapTile.prototype.changeType = function (newtype)
{
	this.type = newtype;
	this.notify('type', 'change', this.type);
};
MapTile.prototype.setPeril = function (peril, card, owner)
{
	if (typeof this.peril === 'undefined')
	{
		this.peril = peril;
		this.perilcard = card;
		this.perilowner = owner;
		this.perilbuffs = [];
		this.notify('peril', 'change', this.peril);
	}
	else
		console.warn('Entity ',owner,' tried to set a peril (',peril,') to a tile (',this.coords,') that already had a peril (',this.peril,').');
};
MapTile.prototype.buffPeril = function (buff)
{
	if (typeof this.peril !== 'undefined')
	{
		this.perilbuffs.push(buff);
		this.notify('perilbuffs', 'add', buff);
	}
	else
		console.warn('Tried to apply a buff ('+buff+') to a tile without peril.');
};
MapTile.prototype.clearPeril = function ()
{
	if (typeof this.peril !== 'undefined')
	{
		var peril = this.perilcard;
		this.peril = undefined;
		this.perilcard = undefined;
		this.perilowner = undefined;
		this.perilbuffs = [];
		this.notify('peril', 'remove', peril);
	}
	else
		console.warn('Tried to clear a peril from a tile without peril.');	
};
MapTile.prototype.hasEffect = function (effect)
{
	return this.effects.indexOf(effect) >= 0;
};
MapTile.prototype.addEffect = function (effect)
{
	this.effects.push(effect);
	this.notify('effects', 'change', this.effects);
};
MapTile.prototype.removeEffect = function (effect)
{
	let idx = this.effects.indexOf(effect);
	if (idx >= 0)
	{
		this.effects.splice(idx,1);
		this.notify('effects', 'change', this.effects);
	}
};
MapTile.prototype.removeEffects = function (/*...*/)
{
	for (let i = 0; i < arguments.length; i++)
	{
		let idx = this.effects.indexOf(arguments[i]);
		if (idx >= 0)
			this.effects.splice(idx,1);
	}
	this.notify('effects', 'change', this.effects);
};
MapTile.prototype.terrorizeSettlement = function ()
{
	this.state.terrorized = true;
	this.state.owner = undefined;
	this.notify('state', 'change', this.state);
};
MapTile.prototype.captureSettlement = function (owner)
{
	this.state.terrorized = false;
	this.state.owner = owner;
	this.notify('state', 'change', this.state);
};
MapTile.prototype.fortifySettlement = function ()
{
	this.state.fortified = true;
	this.notify('state', 'change', this.state);
};
//==================================================================================================
function MapMarker(type, coords, title, player)
{
	Observable.call(this);
	this.type = type;
	this.coords = (typeof coords !== 'undefined') ? coords : '-1,-1';
	Object.defineProperty( this, 'u', {
		get : function() {return Number.parseInt(this.coords.split(',')[0]);},
		enumerable : false,
		configurable : false,
	});
	Object.defineProperty( this, 'v', {
		get : function() {return Number.parseInt(this.coords.split(',')[1]);},
		enumerable : false,
		configurable : false,
	});
	this.title = (typeof title !== 'undefined') ? title : '';
	this.player = player;
}
MapMarker.prototype = Object.create(Observable.prototype);
MapMarker.prototype.constructor = MapMarker;
MapMarker.prototype.moveTo = function (coords)
{
	this.coords = coords;
	this.notify('coords', 'change', this.coords);
};
//==================================================================================================
function LevelMap()
{
	SerializableObservableCollection.call(this);
}
LevelMap.prototype = Object.create(SerializableObservableCollection.prototype);
LevelMap.prototype.constructor = LevelMap;
LevelMap.prototype.deserializeItems = function(data)
{
	var tilecopier = SerializableObservableCollection.getSimpleReviver(MapTile);
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, tilecopier);
};
//==================================================================================================
function MarkerCollection()
{
	SerializableObservableCollection.call(this);
}
MarkerCollection.prototype = Object.create(SerializableObservableCollection.prototype);
MarkerCollection.prototype.constructor = MarkerCollection;
MarkerCollection.prototype.deserializeItems = function(data)
{
	var markercopier = SerializableObservableCollection.getSimpleReviver(MapMarker);
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, markercopier);
};

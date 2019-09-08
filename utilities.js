//==================================================================================================
// Basic class implementing Observer pattern
function Observable()
{
	// list of observers
	Object.defineProperty( this, '_observers', {
		value : new Array(),
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : false, // can't be replaced with another object, but array can still be changed
		configurable : false, // can't be deleted
	});
}
Observable.prototype = {
	constructor : Observable,
	subscribe : function (handler)
	{
		this._observers.push(handler);
	},
	unsubscribe : function (handler)
	{
		var index = this._observers.indexOf(handler);
		if (index >= 0)
			this._observers.splice(index, 1);
	},
	notify : function (property, action, value)
	{
		let args = Array.prototype.slice.call(arguments);
		args.unshift(this);
		for (var i=0; i<this._observers.length; i++)
			try
			{ this._observers[i].apply(null, args); }
			catch (e)
			{ 
				console.error(this.constructor.name+": handler "+this._observers[i].name+" produced an error:");
				console.error(e); 
				console.error("Errorneous handler is: "+this._observers[i].toString());
			}
	},
};
//==================================================================================================
// Observable collection that can save and restore its elements.
// If elements are inherited from Observable, collection will subscribe to them and translate their notifications.
function SerializableObservableCollection()
{
	Observable.call(this);
	this.items = [];
	// this function is used to subscribe to Observable items
	Object.defineProperty( this, '_itemchanged', {
		value : Observable.prototype.notify.bind(this, 'items', 'change'),
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : false, // can't be replaced with another object
		configurable : false, // can't be deleted
	});
};
SerializableObservableCollection.prototype = Object.create(Observable.prototype);
SerializableObservableCollection.prototype.constructor = SerializableObservableCollection;
SerializableObservableCollection.prototype.addItem = function (item)
{
	if (item instanceof Observable)
		item.subscribe(this._itemchanged);
	this.items.push(item);
	this.notify('items','add',item);
};
// A shorthand method to create new items.
// addNewItem(Cls, a, b, c) is the same as addItem(new Cls(a, b, c))
SerializableObservableCollection.prototype.addNewItem = function (Class/*,...*/)
{
	var item = new (Function.prototype.bind.apply(Class, arguments));
	this.addItem(item);
};
SerializableObservableCollection.prototype.clearItems = function ()
{
	for (var i = 0; i < this.items.length; i++) 
		if (item instanceof Observable)
			this.items[i].unsubscribe(this._itemchanged);
	this.items.splice(0, this.items.length);
	this.notify('items', 'change');
};
SerializableObservableCollection.prototype.removeItem = function (item)
{
	var index = this.items.indexOf(item);
	if (index < 0)
		throw new Error(this.constructor.name+": Item "+item.toString()+" does not exist in collection "+this.toString());
	else
	{
		if (item instanceof Observable)
			item.unsubscribe(this._itemchanged);
		this.items.splice(index, 1);
		this.notify('items','remove',item);
	}
};
// Allows to remove items by property value
SerializableObservableCollection.prototype.removeItemById = function (key, value, strict)
{
	for (var i = 0; i < this.items.length; i++)
		if (this.items[i][key] == value)
		{
			let item = this.items[i];
			if (item instanceof Observable)
				item.unsubscribe(this._itemchanged);
			this.items.splice(i, 1);
			this.notify('items','remove',item);
			return;
		}
	if ((typeof strict === 'undefined') || strict)
		throw new Error(this.constructor.name+": There is no item with "+key.toString()+" = "+value.toString());
};
// Allows to find items by property value
SerializableObservableCollection.prototype.getItemById = function (key, value, strict)
{
	for (var i = 0; i < this.items.length; i++)
		if (this.items[i].hasOwnProperty(key) && (this.items[i][key] == value))
			return this.items[i];
	if ((typeof strict === 'undefined') || strict)
		throw new Error(this.constructor.name+": There is no item with "+key.toString()+" = "+value);
};
SerializableObservableCollection.prototype.serializeItems = function()
{
	return JSON.stringify(this.items);
};
// restores the state of collection. reviver function is used to turn basic JS objects into instances of specific class
SerializableObservableCollection.prototype.deserializeItems = function(data, reviver)
{
	var objectlist = JSON.parse(data);
	if (!Array.isArray(objectlist))
		throw new Error("Invalid data - not an array");
	for (var i = 0; i < this.items.length; i++) 
		if (this.items[i] instanceof Observable)
			this.items[i].unsubscribe(this._itemchanged);
	this.items.splice(0, this.items.length);
	for (var i = 0; i < objectlist.length; i++)
		if (typeof reviver === 'function')
		{
			var newitem = reviver(objectlist[i]);
			if (newitem instanceof Observable)
				newitem.subscribe(this._itemchanged);
			this.items.push(newitem);
		}
		else
			this.items.push(objectlist[i]);
	this.notify('items', 'change');
};
// provides reviver function that will construct an instance of a class (with given parameters),
// and then will copy values for all visible properties of that instance from the source object
SerializableObservableCollection.getSimpleReviver = function (Class/*,...*/)
{
	return function(obj)
	{
		var newitem = new (Function.prototype.bind.apply(Class, arguments));
		var keys = Object.keys(newitem);
		for (var k = 0; k < keys.length; k++)
			if (newitem.hasOwnProperty(keys[k]))
				newitem[keys[k]] = obj[keys[k]];
		return newitem;
	};
}

function LogTracker(file, handlers)
{
	this.handlers = Array.prototype.slice.call(handlers);
	this.reader = new FileReader();
	this.reader.onloadend = LogTracker.prototype.on_new_string.bind(this);
	this.file = file;
	this.position = 0;
	this.slicesize = 1024;
	this.buffer = "";
}
LogTracker.prototype.constructor = LogTracker;
LogTracker.prototype.add_handler = function(regexp, func)
{
	var handler = {
		regexp : regexp,
		handler : func,
	};
	this.handlers.push(handler);
};

LogTracker.prototype.read_next_slice = function()
{
	var end = Math.min(this.position + this.slicesize, this.file.size);
	if (end > this.position)
	{
		var item = this.file.slice(this.position, end);
		this.position = end;
		this.reader.readAsText(item);
		delete item;
	}
};

LogTracker.prototype.on_new_string = function(evt)
{
	this.buffer += evt.target.result;
	var match;
	for (var i = this.buffer.indexOf("\n"); i >= 0; i = this.buffer.indexOf("\n"))
	{
		var line = this.buffer.slice(0, i);
		this.buffer = this.buffer.slice(i);
		for (var handler in this.handlers)
			if (match = line.match(handler.regexp))
				try
				{ handler.handler.call(handler, match); }
				catch (err)
				{
					console.error("Error in handler %o: %o", handler.handler, err);
					console.error("Data that caused the error: %o", match);
				}
	}
};

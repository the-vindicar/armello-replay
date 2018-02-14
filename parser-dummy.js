// A fake parser object designed to give an informative error message 
// if user tries to load a log from an unsupported early version of the game.
Parser.Parsers['1.6.1.0'] = new Parser(
	// additional data
	{},
	//parser items describe translation of game log lines into event objects
	[],
	//match detector function returns either match description object or undefined.
	function (line, pos)
	{
		throw new Error("Sorry, but Armello versions below 1.7 are not supported.");
	}
	);
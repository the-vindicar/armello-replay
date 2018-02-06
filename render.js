//==================================================================================================
function renderMap(canvas, context, highlight)
{
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < context.map.items.length; i++)
		renderTile(context.map.items[i], ctx);
	for (let i = 0; i < context.markers.items.length; i++)
		renderMarker(context.markers.items[i], context, ctx);
	for (let i = 0; i < context.entities.items.length; i++)
	{
		let e = context.entities.items[i];
		if (!e.dead)
			renderEntity(e, ctx);
	}
	if (highlight)
	{
		cnv = gridToCanvas(highlight.u, highlight.v);
		ctx.beginPath();
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 4;
		ctx.arc(cnv.x, cnv.y, ctx.lineWidth+gridToCanvas.tileSize, 0, 2*Math.PI);
		ctx.stroke();
	}
}
//==================================================================================================
// u is right to left, zero on the v axis
// v is diagonally down-left, zero on the top row
function gridToCanvas(u, v)
{
	if ((u == gridToCanvas.uKing) && (v == gridToCanvas.vKing))
	{
		u = 1.5;
		v = 4;
	}
	return { 
		x : gridToCanvas.xOffset + gridToCanvas.GridWidth - (u + 0.5*v + 0.5) * gridToCanvas.uDim, 
		y : gridToCanvas.yOffset + (v * 0.75 + 0.5) * gridToCanvas.vDim 
		};
}
gridToCanvas.uSize = 8;
gridToCanvas.vSize = 9;
gridToCanvas.uKing = -99;
gridToCanvas.vKing = -99;
gridToCanvas.tileSize = 50;
gridToCanvas.xOffset = 10;
gridToCanvas.yOffset = 10;
gridToCanvas.uDim = gridToCanvas.tileSize * Math.sqrt(3);
gridToCanvas.vDim = gridToCanvas.tileSize * 2;
gridToCanvas.GridWidth = gridToCanvas.uSize * gridToCanvas.uDim;
gridToCanvas.GridHeight = gridToCanvas.vSize * (1.5 * (gridToCanvas.tileSize+2));

function getHex(tile)
{
	const cnv = gridToCanvas(tile.u, tile.v);
	const sz = gridToCanvas.tileSize + 1;
	let res = [];
	for (let i=0; i<6; i++)
		res.push({x : cnv.x + sz * Math.cos(i*Math.PI/3 + Math.PI/2), y : cnv.y + sz * Math.sin(i*Math.PI/3 + Math.PI/2)});
	return res;
}
//==================================================================================================
function strokeTile(ctx, style, hex, verts)
{
	if (!('stroke' in style)) return;
	ctx.beginPath();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.strokeStyle = style.stroke;
	ctx.lineWidth = ('lineWidth' in style) ? style.lineWidth : 1;
	ctx.moveTo(hex[verts[0]].x, hex[verts[0]].y);
	for (let i = 1; i < verts.length; i++)
		ctx.lineTo(hex[verts[i]].x, hex[verts[i]].y);
	ctx.stroke();
}

function renderTile(tile, ctx)
{
	let style = renderTile.styles[tile.type];
	if (!style)
	{
		console.warn('No render style for tile', tile);
		return;
	}
	const cnv = gridToCanvas(tile.u, tile.v);
	const sz = gridToCanvas.tileSize + 1;
	ctx.beginPath()
	ctx.strokeStyle = 'transparent';
	ctx.fillStyle = style.fill;
	let hex = getHex(tile);
	ctx.moveTo(hex[0].x, hex[0].y);
	for (let i=1; i<6; i++)
		ctx.lineTo(hex[i].x, hex[i].y);
	ctx.closePath();
	ctx.fill();
	if (tile.perilcard)
	{
		if (tile.perilcard.slice(0,3) === 'PPN')
			strokeTile(ctx, style, hex, [1,2,3,4,5]);
		else if (tile.perilcard.slice(0,3) === 'PPS')
			strokeTile(ctx, style, hex, [4,5,0,1,2]);
		else if (tile.perilcard.slice(0,3) === 'PPE')
			strokeTile(ctx, style, hex, [3,4,5,0]);
		else if (tile.perilcard.slice(0,3) === 'PPW')
			strokeTile(ctx, style, hex, [0,1,2,3]);
		else
		{
			let pattern = ctx.createRadialGradient(cnv.x, cnv.y, 0, cnv.x, cnv.y, gridToCanvas.tileSize);
			pattern.addColorStop(0.55, 'transparent');
			pattern.addColorStop(0.75, 'black');
			pattern.addColorStop(0.85, 'transparent');
			ctx.fillStyle = pattern;
			ctx.beginPath();
			ctx.arc(cnv.x, cnv.y, gridToCanvas.tileSize, 0, 2*Math.PI);
			ctx.fill();
		}
	}
}
renderTile.styles = {
	ClanCastle : { fill: 'dimgray'},
	KingsPalace : { fill: 'royalblue', stroke: 'white', lineWidth:10},
	KingTile : { fill: 'transparent'},
	Plains : { fill: 'forestgreen'},
	Forest : { fill: 'darkgreen'},
	Swamp : { fill: 'saddlebrown'},
	Mountains : { fill: 'paleturquoise'},
	StoneCircle : { fill: 'darkturquoise'},
	Dungeon : { fill: 'purple'},
	Settlement : { fill: 'slategray'},
};
//==================================================================================================
function renderEntity(entity, ctx)
{
	let type = (entity instanceof Hero)
		? entity.type.slice(0, -2)
		: entity.type;
	let style = renderEntity.styles[type];
	if (!style)
	{
		console.warn('No render style for entity', entity);
		return;
	}
	let cnv = gridToCanvas(entity.u, entity.v);
	let r = gridToCanvas.tileSize * style.size;
	ctx.beginPath();
	ctx.arc(cnv.x, cnv.y, r, 0, 2*Math.PI);
	ctx.fillStyle = style.fill;
	ctx.strokeStyle = style.stroke;
	ctx.lineWidth = style.lineWidth;
	ctx.fill();
	ctx.stroke();
	let text;
	if (entity instanceof Hero) text = entity.playerid;
	else if (entity.type === 'King') text = 'K';
	else if (entity.type === 'KingsGuard') text = 'G';
	else if (entity.type === 'Bane') text = 'B';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';	
	ctx.fillStyle = style.text;
	ctx.font = r.toString()+'px Arial';
	ctx.fillText(text, cnv.x, cnv.y);
}

renderEntity.styles = {
	King: 		{ size: 0.5, fill: 'blue', stroke: 'darkgoldenrod', lineWidth: 4, 'text': 'yellow' },
	KingsGuard: { size: 0.5, fill: 'blue', stroke: 'darkgoldenrod', lineWidth: 4, 'text': 'yellow' },
	Bane:		{ size: 0.5, fill: 'darkviolet', stroke: 'indigo', lineWidth: 4, 'text': 'fuchsia' },
	Bandit:		{ size: 0.5, fill: '#333333', stroke: 'gold', lineWidth: 4, 'text': 'gold' },
	Bear:		{ size: 0.5, fill: '#006006', stroke: 'gold', lineWidth: 4, 'text': 'gold' },
	Rabbit:		{ size: 0.5, fill: '#9F7714', stroke: 'gold', lineWidth: 4, 'text': 'gold' },
	Rat:		{ size: 0.5, fill: '#9A2D36', stroke: 'gold', lineWidth: 4, 'text': 'gold' },
	Wolf:		{ size: 0.5, fill: '#3674A3', stroke: 'gold', lineWidth: 4, 'text': 'gold' },
};
//==================================================================================================
function renderMarker(marker, context, ctx)
{
	switch (marker.type)
	{
		case 'quest': renderQuestMarker(marker, context, ctx); break;
		case 'stone': renderStoneMarker(marker, ctx); break;
		case 'banespawn': renderBaneMarker(marker, ctx); break;
	}
}

function renderBaneMarker(marker, ctx)
{
	let cnv = gridToCanvas(marker.u, marker.v);
	let r = gridToCanvas.tileSize * 0.25;
	ctx.beginPath();
	ctx.moveTo(cnv.x - r, cnv.y - r);
	ctx.lineTo(cnv.x + r, cnv.y + r);
	ctx.moveTo(cnv.x - r, cnv.y + r);
	ctx.lineTo(cnv.x + r, cnv.y - r);
	ctx.strokeStyle = 'fuchsia';
	ctx.lineWidth = 8;
	ctx.lineCap = 'round';
	ctx.stroke();
}

function renderQuestMarker(marker, context, ctx)
{
	let hero = context.entities.getItemById('playerid', marker.player).type;
	let style = renderQuestMarker.styles[hero.slice(0,-2)];
	let cnv = gridToCanvas(marker.u, marker.v);
	let r = gridToCanvas.tileSize * style.size;
	ctx.beginPath();
	ctx.moveTo(cnv.x, cnv.y - r);
	ctx.lineTo(cnv.x + r, cnv.y);
	ctx.lineTo(cnv.x, cnv.y + r);
	ctx.lineTo(cnv.x - r, cnv.y);
	ctx.closePath();
	ctx.fillStyle = style.fill;
	ctx.strokeStyle = style.stroke;
	ctx.lineWidth = style.lineWidth;
	ctx.fill();
	ctx.stroke();
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';	
	ctx.fillStyle = style.text;
	ctx.font = r.toString()+'px Arial';
	ctx.fillText(marker.player.toString(), cnv.x, cnv.y);
}
renderQuestMarker.styles = {
	Bandit:		{ size: 0.7, fill: '#333333', stroke: 'gold', lineWidth: 2, 'text': 'gold' },
	Bear:		{ size: 0.7, fill: '#006006', stroke: 'gold', lineWidth: 2, 'text': 'gold' },
	Rabbit:		{ size: 0.7, fill: '#9F7714', stroke: 'gold', lineWidth: 2, 'text': 'gold' },
	Rat:		{ size: 0.7, fill: '#9A2D36', stroke: 'gold', lineWidth: 2, 'text': 'gold' },
	Wolf:		{ size: 0.7, fill: '#3674A3', stroke: 'gold', lineWidth: 2, 'text': 'gold' },
};

function renderStoneMarker(marker, ctx)
{
	let cnv = gridToCanvas(marker.u, marker.v);
	let r = gridToCanvas.tileSize * 0.4;
	let pattern = ctx.createRadialGradient(cnv.x, cnv.y, 0, cnv.x, cnv.y, r);
	pattern.addColorStop(0, 'cyan');
	pattern.addColorStop(1, 'blue');
	ctx.fillStyle = pattern;
	ctx.beginPath();
	ctx.arc(cnv.x, cnv.y, r, 0, 2*Math.PI);
	ctx.fill();
}
//==================================================================================================
function getItemAt(collection, x, y, rate)
{
	if (collection.items.length == 0) return undefined;
	let idx = 0;
	let item = collection.items[idx];
	let coords = gridToCanvas(item.u, item.v);
	let dsqr = (coords.x - x)*(coords.x - x) + (coords.y - y)*(coords.y - y);
	for (let i = 1; i < collection.items.length; i++)
	{
		item = collection.items[i];
		coords = gridToCanvas(item.u, item.v);
		dcurrent = (coords.x - x)*(coords.x - x) + (coords.y - y)*(coords.y - y);
		if (dcurrent < dsqr)
		{
			idx = i;
			dsqr = dcurrent;
		}
	}
	if (dsqr <= (gridToCanvas.tileSize * gridToCanvas.tileSize * rate * rate))
		return {item: collection.items[idx], dist: dsqr};
	else
		return undefined;
}

//==================================================================================================
function renderMap(canvas, context, highlight)
{
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < context.map.items.length; i++)
	{
		let tile = context.map.items[i];
		renderTile(tile, ctx);
		renderTileEffects(tile, ctx, context.entities);
	}
	
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

function getHex(tile, radius)
{
	const cnv = gridToCanvas(tile.u, tile.v);
	const sz = radius ? radius : (gridToCanvas.tileSize + 1);
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
		if (tile.perilcard.slice(0,2) === 'PP')
		{
			let minihex = getHex(tile, gridToCanvas.tileSize - renderTile.styles.KingsPalace.lineWidth/2);
			switch (tile.perilcard[2])
			{
				case 'N': strokeTile(ctx, style, minihex, [1,2,3,4,5]); break;
				case 'S': strokeTile(ctx, style, minihex, [4,5,0,1,2]); break;
				case 'E': strokeTile(ctx, style, minihex, [3,4,5,0]); break;
				case 'W': strokeTile(ctx, style, minihex, [0,1,2,3]); break;
			}
		}
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
	KingsPalace : { fill: 'royalblue', stroke: 'white', lineWidth:5},
	KingTile : { fill: 'transparent'},
	Plains : { fill: 'forestgreen'},
	Forest : { fill: 'darkgreen'},
	Swamp : { fill: 'saddlebrown'},
	Mountains : { fill: 'paleturquoise'},
	StoneCircle : { fill: 'darkturquoise'},
	Dungeon : { fill: 'purple'},
	Settlement : { fill: 'slategray'},
};

function renderTileEffects(tile, ctx, entities)
{
	const hex = getHex(tile);
	if (tile.state.terrorized)
	{
		ctx.strokeStyle = renderTileEffects.effects.terrorized.stroke;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = renderTileEffects.effects.terrorized.lineWidth;
		ctx.beginPath();
		for (let i = 0; i < 3; i++)
		{
			ctx.moveTo(hex[i].x, hex[i].y);
			ctx.lineTo(hex[i+3].x, hex[i+3].y);
		}
		ctx.stroke();
	}
	else if (tile.state.owner)
	{
		let owner = entities.getLivingEntity('id', tile.state.owner, false);
		if (owner && (owner instanceof Hero))
		{
			const cnv = gridToCanvas(tile.u, tile.v);
			const sz = gridToCanvas.tileSize*renderTileEffects.effects.owner.radius;
			let pattern = ctx.createRadialGradient(cnv.x, cnv.y, 0, cnv.x, cnv.y, sz);
			let fill = renderEntity.styles[owner.type.slice(0,-2)].fill;
			pattern.addColorStop(0, fill);
			pattern.addColorStop(0.4, fill);
			pattern.addColorStop(1, renderTile.styles.Settlement.fill);
			ctx.fillStyle = pattern;
			let smallhex = getHex(tile, sz);
			ctx.beginPath();
			ctx.moveTo(smallhex[0].x, smallhex[0].y);
			for (let i = 1; i < 6; i++)
				ctx.lineTo(smallhex[i].x, smallhex[i].y);
			ctx.closePath();
			ctx.fill();
		}
	}
	if (tile.hasEffect('TRK46')) //palisade walls
	{
		let smallhex = getHex(tile, gridToCanvas.tileSize - renderTileEffects.effects.walls.lineWidth / 2);
		strokeTile(ctx, renderTileEffects.effects.walls, smallhex, [0,1,2,3,4,5,0]);
	}
	if (tile.hasEffect('TRK37')) // stone wards
	{
		let smallhex = getHex(tile, gridToCanvas.tileSize - renderTileEffects.effects.spiritwalls.radius);
		for (let i = 0; i < 6; i++)
		{
			let pattern = ctx.createRadialGradient(smallhex[i].x, smallhex[i].y, 0, smallhex[i].x, smallhex[i].y, renderTileEffects.effects.spiritwalls.radius);
			pattern.addColorStop(0, renderTileEffects.effects.spiritwalls.colora);
			pattern.addColorStop(1, renderTileEffects.effects.spiritwalls.colorb);
			ctx.fillStyle = pattern;
			ctx.beginPath();
			ctx.arc(smallhex[i].x, smallhex[i].y, renderTileEffects.effects.spiritwalls.radius, 0, 2*Math.PI);
			ctx.fill();
		}
	}
	if (tile.hasEffect('TRK13')) //patronage and industry
	{
		const cnv = gridToCanvas(tile.u, tile.v);
		let r = Math.trunc(gridToCanvas.tileSize * renderTileEffects.effects.industry.radius);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = renderTileEffects.effects.industry.text;
		ctx.font = r.toString()+'px Armello Icons';
		ctx.fillText('G', cnv.x, cnv.y);
	}
	if (tile.hasEffect('MAG30')) // Wall of Thorns
	{
		let smallhex = getHex(tile, gridToCanvas.tileSize - renderTileEffects.effects.thorns.lineWidth);
		let minihex = getHex(tile, gridToCanvas.tileSize*0.8);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = renderTileEffects.effects.thorns.lineWidth;
		ctx.strokeStyle = renderTileEffects.effects.thorns.stroke;
		ctx.beginPath();
		ctx.moveTo(minihex[5].x, minihex[5].y);
		for (let i=0; i<6; i++)
			ctx.lineTo(minihex[i].x, minihex[i].y);
		for (let i=0; i<6; i++)
		{
			ctx.moveTo(minihex[i].x, minihex[i].y);
			ctx.lineTo(smallhex[i].x, smallhex[i].y);
		}
		ctx.stroke();
	}
	if (tile.hasEffect('MAG46')) // Rotten Fog
	{
		let hex = getHex(tile, gridToCanvas.tileSize * renderTileEffects.effects.fog.radius);
		ctx.fillStyle = renderTileEffects.effects.fog.fill;
		ctx.beginPath();
		ctx.moveTo(hex[0].x, hex[0].y);
		for (let i=1; i<6; i++)
			ctx.lineTo(hex[i].x, hex[i].y);
		ctx.closePath();
		ctx.fill();
	}
}
renderTileEffects.effects = {
	owner: {radius: 0.6},
	terrorized: {stroke: 'black', lineWidth: 5},
	walls: {stroke: 'white', lineWidth: 3},
	spiritwalls: {colora: 'blue', colorb: 'cyan', radius: 6},
	industry: {text: 'white', radius: 0.5},
	thorns: {stroke: 'rgba(0,64,0,1.0)', lineWidth: 5},
	fog: {fill: 'rgba(64,64,0,0.7)', radius: 1.0},
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
function getItemAt(collection, x, y, rate, filterfunc)
{
	if (collection.items.length == 0) return undefined;
	let idx = -1;
	let item;
	let coords;
	let dsqr = parseFloat("Infinity");
	for (let i = 0; i < collection.items.length; i++)
		if ((typeof filterfunc !== 'function') || filterfunc(collection.items[i]))
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

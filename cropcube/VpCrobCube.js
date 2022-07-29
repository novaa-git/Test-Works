function drawCubeMatrix(currentViewport, context, data, width, height) {

	var rp = data.renderParams;
	var vdc = currentViewport.getRenderEngine().getVolumeDataContext();
	var currentMatrix = rp.transform;
 
	var currentMPRPoint_VolumeUnits = new Sebia.Util.Vector(0, 0, 0);
	
	currentMPRPoint_VolumeUnits.x = currentMatrix.getOffsetVector().x;
	
	var positionsAx = vdc.getCurrentAxial4Corners(currentMPRPoint_VolumeUnits);
	var positionsSg = vdc.getCurrentSagittal4Corners(currentMPRPoint_VolumeUnits);
	var positionsCo = vdc.getCurrentCoronal4Corners(currentMPRPoint_VolumeUnits);

	console.log(positionsAx);
	console.log(positionsSg);
	console.log(positionsCo);
	
	var orientation = "top";
	positionsAx[0].z = positionsSg[0].z;
	positionsAx[1].z = positionsSg[0].z; // ust 
	positionsAx[2].z = positionsSg[0].z;
	positionsAx[3].z = positionsSg[0].z;
	
	//drawCube(vdc, positionsAx,  context, width, height, rp, orientation);

	positionsAx[0].z = positionsSg[1].z;
	positionsAx[1].z = positionsSg[1].z; // alt 
	positionsAx[2].z = positionsSg[1].z;
	positionsAx[3].z = positionsSg[1].z;

	orientation = "bottom";
	//drawCube(vdc, positionsAx,  context, width, height, rp, orientation);
	
	//console.log(positionsAx[0].x);
	
	//positionsAx[0].x = - 1 * (rp.cutPlaneList[2].plane.d);
	
	//console.log(Sebia.Util.getVolumeBoxPoints(vdc));
	
	positionsSg[0].x = positionsAx[0].x;
	positionsSg[1].x = positionsAx[0].x; // sol
	positionsSg[2].x = positionsAx[0].x;
	positionsSg[3].x = positionsAx[0].x;
	orientation = "left";
	drawCube(vdc, positionsSg,  context, width, height, rp, orientation);
	
	//positionsAx[0].x = (rp.cutPlaneList[3].plane.d);
	
	positionsSg[0].x = positionsAx[1].x;
	positionsSg[1].x = positionsAx[1].x; // sag // right
	positionsSg[2].x = positionsAx[1].x;
	positionsSg[3].x = positionsAx[1].x;
	orientation = "right";
	drawCube(vdc, positionsSg,  context, width, height, rp, orientation);

	
	
	positionsCo[0].y = positionsAx[1].x;
	positionsCo[1].y = positionsAx[1].x; // arka // back..
	positionsCo[2].y = positionsAx[1].x;
	positionsCo[3].y = positionsAx[1].x;
	orientation = "front";
	drawCube(vdc, positionsCo,  context, width, height, rp, orientation);
	
	 
	positionsCo[0].y = positionsSg[1].y;
	positionsCo[1].y = positionsSg[1].y; // on // anter..
	positionsCo[2].y = positionsSg[1].y;
	positionsCo[3].y = positionsSg[1].y;
	orientation = "back";
	drawCube(vdc, positionsCo,  context, width, height, rp, orientation);
	 
}

function drawCube(vdc, positions,  context, width, height, rp, orientation) {
	var topLeftCorner = vdc.mapSebia3DToFrameOfReference(positions[0]);
	var topRightCorner = vdc.mapSebia3DToFrameOfReference(positions[1]);
	var botLeftCorner = vdc.mapSebia3DToFrameOfReference(positions[2]);
	var botRightCorner = vdc.mapSebia3DToFrameOfReference(positions[3]);
	
	var Sebia3DTopLeftCorner = vdc.mapSebia3DFromFrameOfReference(topLeftCorner);
	var Sebia3DTopRightCorner = vdc.mapSebia3DFromFrameOfReference(topRightCorner);
	var Sebia3DBotLeftCorner = vdc.mapSebia3DFromFrameOfReference(botLeftCorner);
	var Sebia3DBotRightCorner = vdc.mapSebia3DFromFrameOfReference(botRightCorner);
	
	// get the 2D coordinates of the four corners from thjevolume coordinates 
	var imagePixelTopLeftCorner = Sebia.Util.volume2ProjectionPlaneParallel(Sebia3DTopLeftCorner, rp.zoom, vdc.spacing.x, rp.transform, new Sebia.Util.Size(width, height));
	var imagePixelTopRightCorner = Sebia.Util.volume2ProjectionPlaneParallel(Sebia3DTopRightCorner, rp.zoom, vdc.spacing.x, rp.transform, new Sebia.Util.Size(width, height));
	var imagePixelBotLeftCorner = Sebia.Util.volume2ProjectionPlaneParallel(Sebia3DBotLeftCorner, rp.zoom, vdc.spacing.x, rp.transform, new Sebia.Util.Size(width, height));
	var imagePixelBotRightCorner = Sebia.Util.volume2ProjectionPlaneParallel(Sebia3DBotRightCorner, rp.zoom, vdc.spacing.x, rp.transform, new Sebia.Util.Size(width, height));
	
	context.lineWidth = 0.6;
	context.fillStyle = 'rgba(1,2,0,1)';
    context.strokeStyle = 'rgba(0,153,255,0.35)';
	 
	context.beginPath();
	context.setLineDash([20, 20]);
	
	context.moveTo(imagePixelTopLeftCorner.x, imagePixelTopLeftCorner.y);
	context.lineTo(imagePixelTopRightCorner.x, imagePixelTopRightCorner.y);
	context.lineTo(imagePixelBotRightCorner.x, imagePixelBotRightCorner.y);
	context.lineTo(imagePixelBotLeftCorner.x, imagePixelBotLeftCorner.y);
	context.lineTo(imagePixelTopLeftCorner.x, imagePixelTopLeftCorner.y);
	context.stroke();

	/*
	addCubePoint(context,imagePixelTopLeftCorner.x,imagePixelTopLeftCorner.y);
	addCubePoint(context,imagePixelTopRightCorner.x,imagePixelTopRightCorner.y);
	addCubePoint(context,imagePixelBotRightCorner.x,imagePixelBotRightCorner.y);
	addCubePoint(context,imagePixelBotLeftCorner.x,imagePixelBotLeftCorner.y);
	*/
	
	var leftX = (imagePixelTopLeftCorner.x + imagePixelTopRightCorner.x) / 2;
	var leftY = (imagePixelTopLeftCorner.y + imagePixelTopRightCorner.y) / 2;
	
	var rightX = (imagePixelBotLeftCorner.x + imagePixelBotRightCorner.x) / 2;
	var rigthY = (imagePixelBotLeftCorner.y + imagePixelBotRightCorner.y) / 2;
	
	var x1 = (leftX + rightX) / 2;
	var y1 = (leftY + rigthY) / 2;
	
	addCubePoint(context,x1,y1);
}

function addCubePoint(context, x,y) {
	context.beginPath();
	context.arc(x, y, 4, 0, 2 *  Math.PI);
	context.fillStyle = "blue";
	context.fill();	
	context.stroke();
	x = Math.round(x);
	y = Math.round(y);
}

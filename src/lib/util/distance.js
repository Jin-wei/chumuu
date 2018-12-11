function getDistance(myLati, myLongi,latitude, longitude) {
		var a=Math.pow(Math.sin((latitude-myLati)*Math.PI/180/2),2);
		var b=Math.cos(latitude*Math.PI/180)*Math.cos(myLati*Math.PI/180)*Math.pow(Math.sin((longitude-myLongi)*Math.PI/180/2),2);
		var c=Math.sqrt(a+b);
		var d=Math.asin(c)*2*3956;
		return d;
	}

module.exports = {
    getDistance: getDistance
};
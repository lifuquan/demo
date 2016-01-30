var util = {};
util.format = function(time){
	var date = new Date(time);
	function padding(num){
		return num<10?'0'+num:''+num;
	}
	return date.getFullYear()+'-'+padding(date.getMonth()+1)+'-'+padding(date.getDate())+' '
		+padding(date.getHours())+':'+padding(date.getMinutes())+':'+padding(date.getSeconds());
};
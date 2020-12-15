//Устанавливаем конфигурацию
myConfig = {};
//Конфигурация пользователя (глобальная)
myConfig.data = {
	port		: 2020,
	isDebug		: true,		//Сообшения сервера
};

//Вспомогательная функция
String.prototype.myFormat = function () {
	var str = '' + this;
	str = str.replace(/(^|\n)([^\:]+)\:/g, function(s, suf, str) {
		return ((suf || ' ') + str + new Array(20).join(' ')).substr(0, 20) + (suf ? '' : '  ') + ':';
	});
	//TABS
	str = str.replace(/((?!\r\n)[\s\S]+?)($|(?:\r\n))/g, function (s, STR, CRLN, POS) {
		return STR.replace(/([^\t]*?)\t/g, function (s, STR, POS) {
			return STR + (new Array(4 - (STR.length + 4 ) % 4 + 1)).join(' ');
		}) + CRLN;
	});
	//LN
	str = str.replace(/\n/g, '<br/>');
	//SPACES
	return str.replace(/ +/g, function (s) {
		return (s.length==1) ? (' ') : ((new Array(s.length)).join('&nbsp;') + ' ');
	});
};

//Модуль Mime
var mime = require('../index.js');

var http = require('http');
//Формируем задачу
var app = function(req, res) {
	if (myConfig.data.isDebug) {
		console.log('\nПолучен запрос req.url', req.url);
		console.time('app');//Установим метку времени
	}

	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	res.end('<div style="font-family:Courier New, Courier, monospace;">var mime =' + JSON.stringify(mime, null, 4).myFormat() + '</div>');

	if (myConfig.data.isDebug) console.timeEnd('app');
};
//Создаем и запускаем сервер для задачи
var server = http.createServer(app);
server.listen(myConfig.data.port);
//Отображаем информацию о старте сервера
if (myConfig.data.isDebug) console.log('Server start on port ' + myConfig.data.port + ' ...');

